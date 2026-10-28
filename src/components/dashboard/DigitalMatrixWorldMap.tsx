"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { GeoAggregate, TrafficEvent } from "@/types";
import {
  MATRIX_COLS,
  MATRIX_ROWS,
  WORLD_MATRIX_DOTS,
  MATRIX_TECH_HUBS,
  TechHub,
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
  className = "min-h-[380px] h-[380px] sm:h-[480px] md:h-[560px] w-full",
  showControls = true,
  interactive = true,
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 360-degree rotation and zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // High-performance refs for 60 FPS animation loop
  const rotationRef = useRef(0);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const isAutoRotateRef = useRef(false);
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

  // Track container dimensions via ResizeObserver
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

  const [hoveredNode, setHoveredNode] = useState<TechHub | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Check if account has active traffic configured
  const hasConfiguredTraffic = useMemo(() => {
    const hasGeo = geoData && geoData.some((g) => g.eventsCount > 0);
    const hasEvts = events && events.length > 0;
    return Boolean(hasGeo || hasEvts);
  }, [geoData, events]);

  // Active tech hubs with event stats
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

  // 360-degree cylindrical projection position calculator
  const getProjectedPoint = useCallback(
    (col: number, row: number, rot: number, cx: number, cy: number, cellW: number, cellH: number, startY: number) => {
      // 360-degree horizontal wrapping
      const diff = (((col - rot) % MATRIX_COLS) + MATRIX_COLS) % MATRIX_COLS - MATRIX_COLS / 2;
      const u = diff / (MATRIX_COLS / 2); // [-1, 1]

      const px = cx + diff * cellW;
      const py = startY + row * cellH;
      return { x: px, y: py, u };
    },
    []
  );

  // Wheel zoom listener
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

  // Main Cyber-Stipple Vector Animation Loop (60 FPS)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let pulseCycle = 0;
    let particleOffset = 0;

    const render = () => {
      pulseCycle = (pulseCycle + 0.035) % (Math.PI * 2);
      particleOffset = (particleOffset + 0.008) % 1;

      // Gentle auto-rotation if active
      if (isAutoRotateRef.current && !isDraggingRef.current) {
        rotationRef.current = (rotationRef.current + 0.04) % MATRIX_COLS;
      }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.parentElement?.clientWidth || 900;
      const h = canvas.parentElement?.clientHeight || (compact ? 380 : 540);

      if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // 1. Deep Midnight Cyber Background with Ambient Vignette
      const isLight = document.documentElement.classList.contains("light");
      const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h) * 0.8);
      if (isLight) {
        bgGrad.addColorStop(0, "#ffffff");
        bgGrad.addColorStop(0.5, "#fafafa");
        bgGrad.addColorStop(0.85, "#f4f4f6");
        bgGrad.addColorStop(1, "#ededf0");
      } else {
        bgGrad.addColorStop(0, "#0c0d12");
        bgGrad.addColorStop(0.45, "#07080b");
        bgGrad.addColorStop(0.85, "#040406");
        bgGrad.addColorStop(1, "#020203");
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Compute Canvas Bounds & Transforms
      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;
      const currentRot = rotationRef.current;

      const cx = w / 2 + currentPan.x;
      const cy = h / 2 + currentPan.y;

      const usableW = Math.min(w * 0.94, h * 2.05) * currentZoom;
      const usableH = usableW * (MATRIX_ROWS / MATRIX_COLS);
      const cellW = usableW / MATRIX_COLS;
      const cellH = usableH / MATRIX_ROWS;
      const startY = cy - usableH / 2;

      // 3. Subtle Cyber Coordinate Horizon & Grid Lines
      ctx.save();
      ctx.setLineDash([2, 6]);
      ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;

      // Equator line
      const equatorY = startY + (MATRIX_ROWS / 2) * cellH;
      ctx.beginPath();
      ctx.moveTo(cx - usableW / 2, equatorY);
      ctx.lineTo(cx + usableW / 2, equatorY);
      ctx.stroke();

      // Meridians
      for (let m = -2; m <= 2; m++) {
        const mx = cx + m * (usableW / 4);
        ctx.beginPath();
        ctx.moveTo(mx, startY);
        ctx.lineTo(mx, startY + usableH);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // 4. Batch Draw 6,105 Stipple Halftone Dots (Exact reference style!)
      const baseDotSize = Math.max(1.3, Math.min(cellW * 0.72, cellH * 0.72));

      // Draw standard continent dots in single high-performance path
      ctx.fillStyle = isLight ? "rgba(24, 24, 27, 0.75)" : "rgba(240, 244, 255, 0.78)";
      ctx.beginPath();

      for (let i = 0; i < WORLD_MATRIX_DOTS.length; i++) {
        const [col, row] = WORLD_MATRIX_DOTS[i];
        const pt = getProjectedPoint(col, row, currentRot, cx, cy, cellW, cellH, startY);

        // Render dot if within visible horizontal window (with margin)
        if (pt.x >= -20 && pt.x <= w + 20) {
          ctx.rect(pt.x - baseDotSize / 2, pt.y - baseDotSize / 2, baseDotSize, baseDotSize);
        }
      }
      ctx.fill();

      // 5. Active Traffic Connections & Cyber HUD Overlays (ONLY when account has traffic)
      if (hasConfiguredTraffic && activeHubNodes.length > 0) {
        // A. Sweeping Bezier Connection Arcs
        const keyArcs = [
          { from: "Nova York", to: "Londres" },
          { from: "Nova York", to: "São Paulo" },
          { from: "Londres", to: "Frankfurt" },
          { from: "Frankfurt", to: "Dubai" },
          { from: "Dubai", to: "Mumbai" },
          { from: "Mumbai", to: "Singapura" },
          { from: "Singapura", to: "Tóquio" },
          { from: "Tóquio", to: "Sydney" },
          { from: "Frankfurt", to: "Cidade do Cabo" },
          { from: "San Francisco", to: "Tóquio" },
        ];

        keyArcs.forEach(({ from, to }) => {
          const h1 = activeHubNodes.find((h) => h.name === from);
          const h2 = activeHubNodes.find((h) => h.name === to);
          if (h1 && h2) {
            const pt1 = getProjectedPoint(h1.col, h1.row, currentRot, cx, cy, cellW, cellH, startY);
            const pt2 = getProjectedPoint(h2.col, h2.row, currentRot, cx, cy, cellW, cellH, startY);

            // Arc curve
            const midX = (pt1.x + pt2.x) / 2;
            const midY = Math.min(pt1.y, pt2.y) - Math.abs(pt2.x - pt1.x) * 0.22;

            ctx.save();
            ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.25)" : "rgba(255, 255, 255, 0.3)";
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 4]);

            ctx.beginPath();
            ctx.moveTo(pt1.x, pt1.y);
            ctx.quadraticCurveTo(midX, midY, pt2.x, pt2.y);
            ctx.stroke();

            // Traveling Light Pulse along Arc
            ctx.setLineDash([]);
            const t = particleOffset;
            const px = Math.pow(1 - t, 2) * pt1.x + 2 * (1 - t) * t * midX + Math.pow(t, 2) * pt2.x;
            const py = Math.pow(1 - t, 2) * pt1.y + 2 * (1 - t) * t * midY + Math.pow(t, 2) * pt2.y;

            ctx.fillStyle = isLight ? "#0f0f12" : "#ffffff";
            ctx.beginPath();
            ctx.arc(px, py, 2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }
        });

        // B. Target Nodes with Concentric Sonar Rings & Callout Tags
        activeHubNodes.forEach((hub, idx) => {
          const pt = getProjectedPoint(hub.col, hub.row, currentRot, cx, cy, cellW, cellH, startY);
          if (pt.x < -60 || pt.x > w + 60) return;

          const isSelected = selectedCountry === hub.code;
          const nodeColor = hub.color || (isLight ? "#0f0f12" : "#ffffff");

          // 1. Center glowing dot
          ctx.fillStyle = isLight ? "#0f0f12" : "#ffffff";
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          ctx.fill();

          // 2. Inner ring
          ctx.strokeStyle = nodeColor;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6.5, 0, Math.PI * 2);
          ctx.stroke();

          // 3. Concentric Expanding Radar Waves
          const wave1 = (Math.sin(pulseCycle + idx * 0.8) + 1) / 2;
          const wave2 = (Math.sin(pulseCycle + idx * 0.8 + Math.PI / 2) + 1) / 2;

          ctx.strokeStyle = isLight
            ? `rgba(15, 15, 18, ${Math.max(0, 0.6 - wave1 * 0.6)})`
            : `rgba(255, 255, 255, ${Math.max(0, 0.65 - wave1 * 0.65)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 8 + wave1 * 14, 0, Math.PI * 2);
          ctx.stroke();

          ctx.strokeStyle = isLight
            ? `rgba(15, 15, 18, ${Math.max(0, 0.45 - wave2 * 0.45)})`
            : `rgba(255, 255, 255, ${Math.max(0, 0.5 - wave2 * 0.5)})`;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 14 + wave2 * 18, 0, Math.PI * 2);
          ctx.stroke();

          // 4. Cyber HUD Callout Card with Leader Line (Exact Reference Style!)
          // Draw callout for selected country or key active hubs
          const shouldShowCard = isSelected || idx % 2 === 0 || w > 1024;
          if (shouldShowCard && w >= 640) {
            const cardW = 148;
            const cardH = 50;
            const isLeft = pt.x > w * 0.65;
            const cardX = isLeft ? pt.x - cardW - 35 : pt.x + 35;
            const cardY = pt.y - (idx % 2 === 0 ? 30 : -10);

            // Angled Leader Line from node to card
            const elbowX = isLeft ? cardX + cardW + 12 : cardX - 12;
            const elbowY = cardY + 22;

            ctx.save();
            ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.45)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pt.x, pt.y);
            ctx.lineTo(elbowX, elbowY);
            ctx.lineTo(isLeft ? cardX + cardW : cardX, elbowY);
            ctx.stroke();

            // Tiny anchor dot at node end of leader
            ctx.fillStyle = nodeColor;
            ctx.beginPath();
            ctx.arc(elbowX, elbowY, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Callout Card Box
            ctx.fillStyle = isLight ? "rgba(255, 255, 255, 0.94)" : "rgba(8, 9, 13, 0.92)";
            ctx.strokeStyle = isSelected
              ? (isLight ? "#000000" : "#ffffff")
              : (isLight ? "rgba(0, 0, 0, 0.22)" : "rgba(255, 255, 255, 0.28)");
            ctx.lineWidth = 1;

            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(cardX, cardY, cardW, cardH, 4);
              ctx.fill();
              ctx.stroke();
            } else {
              ctx.fillRect(cardX, cardY, cardW, cardH);
              ctx.strokeRect(cardX, cardY, cardW, cardH);
            }

            // Flag badge tab on top-right of card
            const flag = hub.flag || getCountryFlag(hub.code);
            ctx.font = "11px sans-serif";
            ctx.fillText(flag, isLeft ? cardX + 6 : cardX + cardW - 20, cardY + 14);

            // Monospace Cyber Details
            ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
            ctx.fillStyle = isLight ? "#0f0f12" : "#ffffff";
            ctx.fillText(`ORIGIN: IP ${hub.ip || "192.168.***"}`, cardX + (isLeft ? 24 : 8), cardY + 13);

            ctx.font = "8px 'JetBrains Mono', monospace";
            ctx.fillStyle = isLight ? "#52525b" : "#a1a1aa";
            ctx.fillText(`DESTINATION: [${hub.name.toUpperCase()}]`, cardX + 8, cardY + 25);
            ctx.fillText(`STATUS: PROXY 200 OK`, cardX + 8, cardY + 35);

            ctx.fillStyle = isLight ? "#047857" : "#34d399";
            ctx.fillText(`TRAFFIC: ENCRYPTED`, cardX + 8, cardY + 45);

            ctx.restore();
          }
        });
      }

      // 6. Corner HUD Overlays (Exact replica of Reference Image)
      // A. Bottom-Left Terminal Ingestion Box
      ctx.save();
      const terminalW = 220;
      const terminalH = 68;
      const termX = 14;
      const termY = h - terminalH - 14;

      ctx.fillStyle = isLight ? "rgba(255, 255, 255, 0.9)" : "rgba(6, 7, 10, 0.88)";
      ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.18)";
      ctx.lineWidth = 1;

      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(termX, termY, terminalW, terminalH, 4);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.fillRect(termX, termY, terminalW, terminalH);
        ctx.strokeRect(termX, termY, terminalW, terminalH);
      }

      ctx.font = "bold 8.5px 'JetBrains Mono', monospace";
      ctx.fillStyle = isLight ? "#0f0f12" : "#ffffff";
      ctx.fillText("PHANTOM-X EDGE AUDITOR V2.4", termX + 8, termY + 14);

      ctx.font = "8px 'JetBrains Mono', monospace";
      ctx.fillStyle = isLight ? "#52525b" : "#a1a1aa";
      ctx.fillText("ORIGIN: IP 177.136.24.*** [SP/BR]", termX + 8, termY + 27);
      ctx.fillText("DESTINATION: PROXY 200 OK (DIRECT)", termX + 8, termY + 39);
      ctx.fillText("ASNS BLOQUEADOS: 14 REDES (META/AWS)", termX + 8, termY + 51);

      ctx.fillStyle = isLight ? "#047857" : "#34d399";
      ctx.fillText("STATUS: ZERO REDIRECTS • < 14ms", termX + 8, termY + 62);
      ctx.restore();

      // B. Top-Right Telemetry Coordinates Metadata
      ctx.save();
      ctx.font = "8px 'JetBrains Mono', monospace";
      ctx.fillStyle = isLight ? "rgba(15, 15, 18, 0.65)" : "rgba(255, 255, 255, 0.55)";
      ctx.textAlign = "right";
      ctx.fillText("CLUSTER: EDGE-PHANTOM-01", w - 14, 20);
      ctx.fillText("MODE: REVERSE PROXY 200 OK", w - 14, 32);
      ctx.fillText("ROTATION: 360° CYLINDRICAL WRAP", w - 14, 44);
      ctx.restore();

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

      // Horizontal dragging smoothly wraps around 360 degrees
      const w = canvas.clientWidth || 900;
      const rotDelta = (dx / (w * 0.8)) * MATRIX_COLS;
      rotationRef.current =
        (((dragStartRef.current.startRotation - rotDelta) % MATRIX_COLS) + MATRIX_COLS) %
        MATRIX_COLS;

      // Vertical subtle pan
      setPan({
        x: dragStartRef.current.startPanX,
        y: dragStartRef.current.startPanY + dy * 0.35,
      });
      return;
    }

    // Hover inspection on active nodes
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

    const usableW = Math.min(w * 0.94, h * 2.05) * zoom;
    const usableH = usableW * (MATRIX_ROWS / MATRIX_COLS);
    const cellW = usableW / MATRIX_COLS;
    const cellH = usableH / MATRIX_ROWS;
    const startY = cy - usableH / 2;

    let matched: TechHub | null = null;
    for (const hub of activeHubNodes) {
      const pt = getProjectedPoint(hub.col, hub.row, rotationRef.current, cx, cy, cellW, cellH, startY);
      const dist = Math.hypot(mouseX - pt.x, mouseY - pt.y);
      if (dist < 22) {
        matched = hub;
        break;
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
      const rotDelta = (dx / (w * 0.8)) * MATRIX_COLS;
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
      className={`relative w-full h-full bg-[#050608] overflow-hidden select-none font-sans ${className}`}
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
        className={`w-full h-full bg-[#050608] ${
          interactive ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      />

      {/* 360° Controls Overlay */}
      {showControls && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center space-x-1 bg-brand-surface/90 backdrop-blur-md border border-brand-border p-1 rounded-lg shadow-glow-sm z-20">
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
      <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-4 flex items-center space-x-1.5 sm:space-x-3 bg-brand-surface/85 backdrop-blur-md border border-brand-border px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs text-brand-secondary font-sans z-20 max-w-[65%] sm:max-w-none truncate">
        <div className="flex items-center space-x-1.5 shrink-0">
          <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white animate-pulse shrink-0" />
          <span className="text-white font-medium text-[10px] sm:text-[11px] truncate">Matriz Global 360º</span>
        </div>
        <div className="hidden sm:flex items-center space-x-1.5 text-[10px] text-brand-muted">
          <span>Arraste para girar 360º • Scroll para zoom</span>
        </div>
      </div>
    </div>
  );
};
