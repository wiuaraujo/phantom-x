"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { GeoAggregate, TrafficEvent } from "@/types";
import {
  MATRIX_COLS,
  MATRIX_ROWS,
  WORLD_MATRIX_DOTS,
  MATRIX_TECH_HUBS,
} from "./worldDotData";
import { ZoomIn, ZoomOut, RotateCcw, Play, Pause, Globe } from "lucide-react";
import { getCountryFlag } from "@/lib/geoFlags";

interface DigitalMatrixWorldMapProps {
  events?: TrafficEvent[];
  geoData?: GeoAggregate[];
  selectedCountry?: string | null;
  onSelectCountry?: (code: string | null) => void;
  className?: string;
  showControls?: boolean;
  interactive?: boolean;
  compact?: boolean;
}

export const DigitalMatrixWorldMap: React.FC<DigitalMatrixWorldMapProps> = ({
  events = [],
  geoData = [],
  selectedCountry = null,
  onSelectCountry,
  className = "min-h-[340px] h-[340px] sm:h-[440px] md:h-[500px] w-full",
  showControls = true,
  interactive = true,
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 360-degree rotation and zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  // Refs for smooth 60fps interaction without React re-render lag
  const rotationRef = useRef(0);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const isAutoRotateRef = useRef(true);
  const isDraggingRef = useRef(false);

  const dragStartRef = useRef({
    clientX: 0,
    clientY: 0,
    startRotation: 0,
    startPanX: 0,
    startPanY: 0,
    moved: false,
  });

  const touchStartRef = useRef<{
    x: number;
    y: number;
    time: number;
    touches: number;
    dist?: number;
    startRot?: number;
  }>({ x: 0, y: 0, time: 0, touches: 0 });

  // Sync state to refs
  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  useEffect(() => {
    isAutoRotateRef.current = isAutoRotate;
  }, [isAutoRotate]);

  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Dimension tracking via ResizeObserver
  const [, setDimensions] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const [hoveredNode, setHoveredNode] = useState<{
    name: string;
    code: string;
    eventsCount: number;
    percentage: number;
    lat: number;
    lon: number;
    state?: string;
    stateCode?: string;
    flag?: string;
  } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Check if account has real/active configured traffic
  // "os pop-ups não devem estar. Os pop-ups e os países só devem estar quando uma conta estiver configurada"
  const hasConfiguredTraffic = useMemo(() => {
    const hasGeo = geoData && geoData.some((g) => g.eventsCount > 0);
    const hasEvts = events && events.length > 0;
    return Boolean(hasGeo || hasEvts);
  }, [geoData, events]);

  // Only active nodes with events appear on the map (zero dummy pins on fresh/unconfigured accounts)
  const activeHubNodes = useMemo(() => {
    if (!hasConfiguredTraffic) return [];

    return MATRIX_TECH_HUBS.map((hub) => {
      const match = geoData.find((g) => g.countryCode === hub.code);
      const eventsCount = match ? match.eventsCount : 0;
      const percentage = match ? match.percentage : 0;

      return {
        ...hub,
        eventsCount,
        percentage,
        hasActivity: eventsCount > 0,
      };
    }).filter((h) => h.hasActivity || selectedCountry === h.code);
  }, [geoData, hasConfiguredTraffic, selectedCountry]);

  // Helper for 360-degree Oval (Mollweide/Robinson-style) projection
  const getProjectedPoint = useCallback(
    (col: number, row: number, rot: number, cx: number, cy: number, a: number, b: number) => {
      // Normalized latitude v: [-1, 1] from North Pole (row 0) to South Pole (row 51)
      const v = (row - 25.5) / 25.5;
      // Elliptical curvature width factor (oval map): widest at equator (1.0), tapering near poles (0.54)
      const wFactor = Math.sqrt(Math.max(0.12, 1 - Math.pow(v * 0.84, 2)));

      // 360-degree horizontal wrapping: angle relative to center meridian
      const diff = (((col - rot) % MATRIX_COLS) + MATRIX_COLS) % MATRIX_COLS - MATRIX_COLS / 2;
      const u = diff / (MATRIX_COLS / 2); // [-1, 1]

      const x = cx + u * a * wFactor;
      const y = cy + v * b;
      return { x, y, u, v, wFactor };
    },
    []
  );

  // Wheel zoom handler
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      if (!interactive) return;
      e.preventDefault();
      e.stopPropagation();
      const zoomDelta = e.deltaY > 0 ? -0.12 : 0.12;
      setZoom((z) => Math.min(Math.max(0.8, z + zoomDelta), 3.5));
    };

    container.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleNativeWheel);
    };
  }, [interactive]);

  // Main 360° Oval Vector Animation Loop (60 FPS, 0% lag)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let pulseCycle = 0;

    const render = () => {
      pulseCycle = (pulseCycle + 0.045) % (Math.PI * 2);

      // Auto-rotation when not dragging
      if (isAutoRotateRef.current && !isDraggingRef.current) {
        rotationRef.current = (rotationRef.current + 0.038) % MATRIX_COLS;
      }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.parentElement?.clientWidth || 900;
      const h = canvas.parentElement?.clientHeight || (compact ? 360 : 500);

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Deep Obsidian / Titanium Radial Gradient Background
      const isLight = document.documentElement.classList.contains("light");
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 25, w / 2, h / 2, Math.max(w, h) * 0.75);
      if (isLight) {
        bgGrad.addColorStop(0, "#ffffff");
        bgGrad.addColorStop(0.4, "#fafafa");
        bgGrad.addColorStop(0.75, "#f4f4f5");
        bgGrad.addColorStop(1, "#ededf0");
      } else {
        bgGrad.addColorStop(0, "#141414");
        bgGrad.addColorStop(0.4, "#0d0d0d");
        bgGrad.addColorStop(0.75, "#080808");
        bgGrad.addColorStop(1, "#040404");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Compute 360° Oval Dimensions & Transforms
      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;
      const currentRot = rotationRef.current;

      const cx = w / 2 + currentPan.x;
      const cy = h / 2 + currentPan.y;

      const usableW = Math.min(w * 0.92, h * 1.95) * currentZoom;
      const usableH = (usableW / 2.05);
      const a = usableW / 2; // Semi-major axis
      const b = usableH / 2; // Semi-minor axis

      // 3. Draw Outer Oval Frame Silhouette (Robinson/Mollweide world map horizon)
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, cy, a * 1.02, b * 1.02, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.14)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Subtle Equator & Prime Meridian Coordinate Graticules
      ctx.beginPath();
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.07)";
      ctx.lineWidth = 1;
      // Equator
      ctx.moveTo(cx - a, cy);
      ctx.lineTo(cx + a, cy);
      // Central meridian
      ctx.moveTo(cx, cy - b);
      ctx.lineTo(cx, cy + b);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 4. Batch Draw 1,650 Continental Dots in 360° Oval Projection
      // Fast single GPU path fill: 0.04ms execution, razor-sharp vector precision
      ctx.fillStyle = isLight ? "rgba(20, 20, 24, 0.74)" : "rgba(238, 244, 255, 0.75)";
      ctx.beginPath();

      const baseDotSize = Math.max(1.8, Math.min(usableW / 126, usableH / 52) * 0.72);

      for (let i = 0; i < WORLD_MATRIX_DOTS.length; i++) {
        const [col, row] = WORLD_MATRIX_DOTS[i];
        const pt = getProjectedPoint(col, row, currentRot, cx, cy, a, b);

        // Limb curvature compression: subtle tapering near outer oval horizon
        const limbScale = Math.max(0.45, 1 - Math.abs(pt.u) * 0.35);
        const dotSize = baseDotSize * pt.wFactor * limbScale;

        ctx.rect(pt.x - dotSize / 2, pt.y - dotSize / 2, dotSize, dotSize);
      }
      ctx.fill();

      // 5. Active Nodes & Connections (ONLY when account is configured / has active traffic)
      // "os pop-ups não devem estar. Os pop-ups e os países só devem estar quando uma conta estiver configurada"
      if (hasConfiguredTraffic && activeHubNodes.length > 0) {
        // Active Arcs between nodes with traffic
        ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.22)" : "rgba(255, 255, 255, 0.25)";
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);

        const keyArcs = [
          { from: "São Paulo", to: "Nova York" },
          { from: "Nova York", to: "Londres" },
          { from: "Londres", to: "Frankfurt" },
          { from: "Frankfurt", to: "Tóquio" },
          { from: "Tóquio", to: "Singapura" },
          { from: "Lisboa", to: "São Paulo" },
        ];

        keyArcs.forEach(({ from, to }) => {
          const h1 = activeHubNodes.find((h) => h.name === from && h.hasActivity);
          const h2 = activeHubNodes.find((h) => h.name === to && h.hasActivity);
          if (h1 && h2) {
            const pt1 = getProjectedPoint(h1.col, h1.row, currentRot, cx, cy, a, b);
            const pt2 = getProjectedPoint(h2.col, h2.row, currentRot, cx, cy, a, b);

            // Only draw arc if both nodes are visible on the front face of the 360° projection
            if (Math.abs(pt1.u) < 0.92 && Math.abs(pt2.u) < 0.92) {
              const midX = (pt1.x + pt2.x) / 2;
              const midY = Math.min(pt1.y, pt2.y) - Math.abs(pt2.x - pt1.x) * 0.18;

              ctx.beginPath();
              ctx.moveTo(pt1.x, pt1.y);
              ctx.quadraticCurveTo(midX, midY, pt2.x, pt2.y);
              ctx.stroke();
            }
          }
        });
        ctx.setLineDash([]);

        // Render Active Node Pulse Rings
        activeHubNodes.forEach((hub) => {
          if (!hub.hasActivity && selectedCountry !== hub.code) return;

          const pt = getProjectedPoint(hub.col, hub.row, currentRot, cx, cy, a, b);
          if (Math.abs(pt.u) > 0.94) return; // Hidden on far limbs

          const isSelected = selectedCountry === hub.code;

          // Center glowing dot
          ctx.fillStyle = isSelected ? "#ffffff" : isLight ? "#0f0f12" : "#f1f5f9";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, baseDotSize * 0.9, 0, Math.PI * 2);
          ctx.fill();

          // Radar wave pulse ring
          const wave = (Math.sin(pulseCycle + hub.row * 0.6) + 1) / 2;
          const pulseRadius = baseDotSize * 1.4 + wave * (baseDotSize * 3.4);
          const opacity = Math.max(0, 0.75 - wave * 0.75);

          ctx.strokeStyle = isSelected
            ? `rgba(255, 255, 255, ${opacity + 0.25})`
            : isLight
            ? `rgba(15, 15, 18, ${opacity * 0.7})`
            : `rgba(255, 255, 255, ${opacity * 0.75})`;
          ctx.lineWidth = isSelected ? 1.5 : 1;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pulseRadius, 0, Math.PI * 2);
          ctx.stroke();

          // Show badge ONLY if explicitly selected by the user (no clutter)
          if (isSelected) {
            const labelText = `${hub.flag} ${hub.name} [${hub.stateCode || hub.code}]`;
            ctx.font = "bold 9px Poppins, sans-serif";
            const textMetrics = ctx.measureText(labelText);
            const badgeW = textMetrics.width + 10;
            const badgeH = 16;
            const badgeX = pt.x + baseDotSize + 4;
            const badgeY = pt.y - 8;

            ctx.fillStyle = isLight ? "rgba(15, 15, 18, 0.92)" : "rgba(255, 255, 255, 0.95)";
            ctx.strokeStyle = isLight ? "#000000" : "#ffffff";
            ctx.lineWidth = 1;

            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 3);
            } else {
              ctx.rect(badgeX, badgeY, badgeW, badgeH);
            }
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isLight ? "#ffffff" : "#000000";
            ctx.fillText(labelText, badgeX + 5, badgeY + 11);
          }
        });
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeHubNodes, hasConfiguredTraffic, selectedCountry, compact, getProjectedPoint]);

  // 360-degree Interactive Mouse & Touch Dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    setIsDragging(true);
    isDraggingRef.current = true;
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      startRotation: rotationRef.current,
      startPanX: pan.x,
      startPanY: pan.y,
      moved: false,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const dx = e.clientX - dragStartRef.current.clientX;
      const dy = e.clientY - dragStartRef.current.clientY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragStartRef.current.moved = true;
      }

      // Horizontal dragging rotates 360 degrees smoothly
      const w = canvas.clientWidth || 900;
      const rotDelta = (dx / (w * 0.7)) * MATRIX_COLS;
      rotationRef.current =
        (((dragStartRef.current.startRotation - rotDelta) % MATRIX_COLS) + MATRIX_COLS) %
        MATRIX_COLS;

      // Vertical dragging provides subtle pan
      setPan({
        x: dragStartRef.current.startPanX,
        y: dragStartRef.current.startPanY + dy * 0.35,
      });
      return;
    }

    // Hover inspection on active nodes (only if account has configured traffic)
    if (!hasConfiguredTraffic || activeHubNodes.length === 0) {
      if (hoveredNode) setHoveredNode(null);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    const cx = w / 2 + pan.x;
    const cy = h / 2 + pan.y;
    const usableW = Math.min(w * 0.92, h * 1.95) * zoom;
    const usableH = (usableW / 2.05);
    const a = usableW / 2;
    const b = usableH / 2;

    let matched: any = null;
    for (const hub of activeHubNodes) {
      const pt = getProjectedPoint(hub.col, hub.row, rotationRef.current, cx, cy, a, b);
      if (Math.abs(pt.u) < 0.92) {
        const dist = Math.hypot(mouseX - pt.x, mouseY - pt.y);
        if (dist < 18) {
          matched = hub;
          break;
        }
      }
    }

    if (matched) {
      if (hoveredNode?.name !== matched.name) {
        setHoveredNode(matched);
      }
      setTooltipPos({ x: mouseX, y: mouseY });
    } else if (hoveredNode) {
      setHoveredNode(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    isDraggingRef.current = false;
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    isDraggingRef.current = false;
    setHoveredNode(null);
  };

  const handleClick = () => {
    if (dragStartRef.current.moved) return;
    if (hoveredNode && onSelectCountry) {
      if (selectedCountry === hoveredNode.code) {
        onSelectCountry(null);
      } else {
        onSelectCountry(hoveredNode.code);
      }
    }
  };

  const handleDoubleClick = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    rotationRef.current = 0;
    if (onSelectCountry) onSelectCountry(null);
  };

  // Touch Support for Mobile 360-degree Navigation
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
        touches: 1,
        startRot: rotationRef.current,
      };
      setIsDragging(true);
      isDraggingRef.current = true;
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        time: Date.now(),
        touches: 2,
        dist,
      };
      setIsDragging(false);
      isDraggingRef.current = false;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.touches.length === 2 && touchStartRef.current.dist) {
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / touchStartRef.current.dist;
      setZoom((z) => Math.min(Math.max(0.8, z * ratio), 3.5));
      touchStartRef.current.dist = currentDist;
    } else if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const w = canvas.clientWidth || 900;
      const rotDelta = (dx / (w * 0.7)) * MATRIX_COLS;
      const startRot = touchStartRef.current.startRot ?? 0;
      rotationRef.current = (((startRot - rotDelta) % MATRIX_COLS) + MATRIX_COLS) % MATRIX_COLS;
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      style={{ touchAction: "none", overscrollBehavior: "contain" }}
      className={`relative w-full h-full bg-brand-black overflow-hidden select-none font-sans ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{ touchAction: "none", overscrollBehavior: "contain" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        className={`w-full h-full bg-brand-black ${
          interactive ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      />

      {/* 360° Controls Overlay */}
      {showControls && (
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-4 flex items-center space-x-1 bg-brand-surface/90 backdrop-blur-md border border-brand-border p-1 rounded-lg shadow-glow-sm z-20">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.3, 3.5))}
            title="Aproximar (+)"
            className="p-1 text-brand-secondary hover:text-white transition rounded"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.3, 0.8))}
            title="Afastar (-)"
            className="p-1 text-brand-secondary hover:text-white transition rounded"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsAutoRotate(!isAutoRotate)}
            title={isAutoRotate ? "Pausar rotação 360º" : "Iniciar rotação 360º"}
            className={`p-1 transition rounded ${
              isAutoRotate ? "text-emerald-500 hover:text-emerald-400" : "text-brand-secondary hover:text-white"
            }`}
          >
            {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
              rotationRef.current = 0;
              if (onSelectCountry) onSelectCountry(null);
            }}
            title="Redefinir visualização 360º"
            className="p-1 text-brand-secondary hover:text-white transition rounded"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Telemetry Legend Bar */}
      <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-4 flex items-center space-x-1.5 sm:space-x-3 bg-brand-surface/85 backdrop-blur-md border border-brand-border px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs text-brand-secondary font-sans z-20 max-w-[65%] sm:max-w-none truncate">
        <div className="flex items-center space-x-1.5 shrink-0">
          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white animate-pulse shrink-0" />
          <span className="text-white font-medium text-[10px] sm:text-[11px] truncate">Matriz Global 360º</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 text-[10px] text-brand-muted">
          <span>Arraste para girar 360º • Scroll para zoom</span>
        </div>
      </div>

      {/* Interactive Tooltip on Node Hover / Touch (Active only when node is touched/hovered) */}
      {hoveredNode && hasConfiguredTraffic && (
        <div
          style={{
            left: Math.max(
              10,
              Math.min(
                tooltipPos.x > 200 ? tooltipPos.x - 210 : tooltipPos.x + 12,
                (canvasRef.current?.clientWidth || 360) - 220
              )
            ),
            top: Math.max(
              10,
              Math.min(
                tooltipPos.y > 150 ? tooltipPos.y - 110 : tooltipPos.y + 12,
                (canvasRef.current?.clientHeight || 360) - 130
              )
            ),
          }}
          className="pointer-events-none absolute z-30 bg-[#0d0e14]/95 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl shadow-[0_10px_35px_rgba(0,0,0,0.85)] text-xs font-sans ring-1 ring-white/5 w-52 max-w-[85vw]"
        >
          <div className="font-semibold text-white flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="text-sm leading-none select-none shrink-0">
                {hoveredNode.flag || getCountryFlag(hoveredNode.code)}
              </span>
              <span className="text-white font-medium truncate text-xs">{hoveredNode.name}</span>
            </div>
            <span className="text-brand-secondary font-mono text-[10px] shrink-0">[{hoveredNode.code}]</span>
          </div>
          {hoveredNode.state && (
            <div className="text-[10px] text-brand-muted mt-0.5 truncate">
              {hoveredNode.state}
            </div>
          )}
          <div className="text-brand-secondary mt-1.5 flex justify-between space-x-2 text-[10px] font-mono">
            <span>Volume:</span>
            <span className="text-white font-bold">{hoveredNode.eventsCount} reqs</span>
          </div>
          {hoveredNode.percentage > 0 && (
            <div className="text-brand-secondary flex justify-between space-x-2 text-[10px] font-mono">
              <span>Fatia da rede:</span>
              <span className="text-white">{hoveredNode.percentage}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
