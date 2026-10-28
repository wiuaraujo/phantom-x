"use client";

import React, { useEffect, useRef, useState } from "react";
import { GLOBE_LAND_POINTS } from "@/components/globe/globeDotData";
import { CONTINENT_CONTOURS } from "@/components/globe/continentBoundaries";

interface RotatingGlobeProps {
  size?: number;
  className?: string;
}

export const RotatingGlobe: React.FC<RotatingGlobeProps> = ({
  size = 340,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotYRef = useRef(0.8);
  const rotXRef = useRef(0.2);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, rotX: 0.2, rotY: 0.8 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;

    const radius = size * 0.38;

    // Convert lat, lon to 3D Cartesian coordinates on sphere
    const landPoints3D: { x: number; y: number; z: number; isBright: boolean }[] = [];
    const step = 2; // Step to keep performance 60fps on 2D canvas
    for (let i = 0; i < GLOBE_LAND_POINTS.length; i += step) {
      const [lat, lon] = GLOBE_LAND_POINTS[i];
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);

      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);

      landPoints3D.push({ x, y, z, isBright: i % 8 === 0 });
    }

    // Convert Continent Contours to 3D
    const contours3D = CONTINENT_CONTOURS.map((c) => ({
      name: c.name,
      points: c.points.map(([lat, lon]) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return {
          x: -(radius * 1.002 * Math.sin(phi) * Math.cos(theta)),
          z: radius * 1.002 * Math.sin(phi) * Math.sin(theta),
          y: radius * 1.002 * Math.cos(phi),
        };
      }),
    }));

    // Tech Hubs
    const hubs = [
      { name: "São Paulo", lat: -23.55, lon: -46.63, flag: "🇧🇷", state: "SP" },
      { name: "Nova York", lat: 40.71, lon: -74.0, flag: "🇺🇸", state: "NY" },
      { name: "Londres", lat: 51.5, lon: -0.12, flag: "🇬🇧", state: "ENG" },
      { name: "Frankfurt", lat: 50.11, lon: 8.68, flag: "🇩🇪", state: "HE" },
      { name: "Tóquio", lat: 35.68, lon: 139.69, flag: "🇯🇵", state: "TK" },
      { name: "Lisboa", lat: 38.72, lon: -9.14, flag: "🇵🇹", state: "LX" },
    ].map((h) => {
      const phi = (90 - h.lat) * (Math.PI / 180);
      const theta = (h.lon + 180) * (Math.PI / 180);
      return {
        ...h,
        x: -(radius * 1.008 * Math.sin(phi) * Math.cos(theta)),
        z: radius * 1.008 * Math.sin(phi) * Math.sin(theta),
        y: radius * 1.008 * Math.cos(phi),
      };
    });

    let pulseTime = 0;

    const render = () => {
      if (!isDraggingRef.current) {
        if (Math.abs(velocityRef.current.x) > 0.0001 || Math.abs(velocityRef.current.y) > 0.0001) {
          rotYRef.current += velocityRef.current.x;
          rotXRef.current = Math.max(-1.1, Math.min(1.1, rotXRef.current + velocityRef.current.y));
          velocityRef.current.x *= 0.94;
          velocityRef.current.y *= 0.94;
        } else {
          rotYRef.current += 0.006; // Ambient continuous rotation
        }
      }
      pulseTime += 0.05;

      const rotY = rotYRef.current;
      const rotX = rotXRef.current;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Rotate point (x, y, z) by rotY then rotX
      const rotatePoint = (p: { x: number; y: number; z: number }) => {
        // Yaw (around Y axis)
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y1 = p.y;

        // Pitch (around X axis)
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        return { x: x1, y: y2, z: z2 };
      };

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      const centerX = size / 2;
      const centerY = size / 2;
      const isLight = document.documentElement.classList.contains("light");

      // 1. Subtle Outer Atmospheric Glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.7,
        centerX,
        centerY,
        radius * 1.25
      );
      if (isLight) {
        glowGrad.addColorStop(0, "rgba(0, 0, 0, 0.03)");
        glowGrad.addColorStop(0.7, "rgba(0, 0, 0, 0.005)");
        glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      } else {
        glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.04)");
        glowGrad.addColorStop(0.7, "rgba(255, 255, 255, 0.01)");
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      }
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, size, size);

      // 2. SOLID OPAQUE Core Sphere (Occludes back side completely)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? "#ffffff" : "#050505";
      ctx.fill();
      ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3. Render Continental Coastlines (Mapa Mundi outlines)
      ctx.strokeStyle = isLight ? "rgba(60, 60, 67, 0.35)" : "rgba(200, 200, 210, 0.3)";
      ctx.lineWidth = 1;
      contours3D.forEach((c) => {
        const rotatedContour = c.points.map(rotatePoint);
        ctx.beginPath();
        let started = false;
        for (let j = 0; j < rotatedContour.length; j++) {
          const pt = rotatedContour[j];
          if (pt.z > 0) {
            const px = centerX + pt.x;
            const py = centerY + pt.y;
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else {
              ctx.lineTo(px, py);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      });

      // 4. Render Front-Facing Land Points (Clean Mapa Mundi dots)
      landPoints3D.forEach((p) => {
        const rotated = rotatePoint(p);
        // Only draw points on facing hemisphere
        if (rotated.z > 0) {
          const px = centerX + rotated.x;
          const py = centerY + rotated.y;
          const depthAlpha = Math.min(1, Math.max(0.2, rotated.z / radius));
          const dotSize = 1.4 + (rotated.z / radius) * 1.1;

          if (isLight) {
            ctx.fillStyle = p.isBright
              ? `rgba(10, 10, 12, ${0.9 * depthAlpha})`
              : `rgba(60, 60, 67, ${0.75 * depthAlpha})`;
          } else {
            ctx.fillStyle = p.isBright
              ? `rgba(255, 255, 255, ${0.95 * depthAlpha})`
              : `rgba(161, 161, 170, ${0.75 * depthAlpha})`;
          }

          ctx.fillRect(px - dotSize / 2, py - dotSize / 2, dotSize, dotSize);
        }
      });

      // 5. Render Orbital Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(0.35);
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.3, radius * 0.4, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();

      const orbitAngle = rotY * 2.2;
      const orbX = Math.cos(orbitAngle) * (radius * 1.3);
      const orbY = Math.sin(orbitAngle) * (radius * 0.4);
      ctx.beginPath();
      ctx.arc(orbX, orbY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? "#111111" : "#ffffff";
      ctx.fill();
      ctx.restore();

      // 6. Active Tech Hub Nodes (Pulsing Brasil & Major Hubs)
      hubs.forEach((hub) => {
        const rotated = rotatePoint(hub);

        if (rotated.z > 10) {
          const px = centerX + rotated.x;
          const py = centerY + rotated.y;
          const depthAlpha = Math.min(1, rotated.z / (radius * 0.6));

          // Hub point
          ctx.beginPath();
          ctx.arc(px, py, hub.flag === "🇧🇷" ? 3.5 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = hub.flag === "🇧🇷" ? (isLight ? "#059669" : "#10b981") : isLight ? "#18181b" : "#ffffff";
          ctx.fill();

          // Radar pulse
          const wave = (Math.sin(pulseTime + hub.lat * 0.1) + 1) / 2;
          const ringR = 3 + wave * 8;
          ctx.beginPath();
          ctx.arc(px, py, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = hub.flag === "🇧🇷"
            ? `rgba(16, 185, 129, ${(1 - wave) * depthAlpha})`
            : isLight
            ? `rgba(24, 24, 27, ${(1 - wave) * depthAlpha * 0.7})`
            : `rgba(255, 255, 255, ${(1 - wave) * depthAlpha * 0.8})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Flag pill on frontmost
          if (rotated.z > radius * 0.45) {
            ctx.font = "bold 8.5px Poppins, sans-serif";
            const label = `${hub.flag} ${hub.name}`;
            const textW = ctx.measureText(label).width;

            ctx.fillStyle = isLight ? "rgba(255, 255, 255, 0.95)" : "rgba(10, 10, 12, 0.9)";
            ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.25)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(px + 6, py - 7, textW + 7, 14, 3);
            } else {
              ctx.rect(px + 6, py - 7, textW + 7, 14);
            }
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isLight ? "#09090b" : "#ffffff";
            ctx.fillText(label, px + 9, py + 3);
          }
        }
      });

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [size]);

  // 360° Interactive Mouse & Touch Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotXRef.current,
      rotY: rotYRef.current,
    };
    lastPosRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = performance.now();
    velocityRef.current = { x: 0, y: 0 };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const now = performance.now();
    const dt = Math.max(1, now - lastTimeRef.current);

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const stepX = e.clientX - lastPosRef.current.x;
    const stepY = e.clientY - lastPosRef.current.y;
    velocityRef.current = {
      x: (stepX / dt) * 0.08,
      y: (stepY / dt) * 0.08,
    };

    rotYRef.current = dragStartRef.current.rotY + deltaX * 0.008;
    rotXRef.current = Math.max(-1.15, Math.min(1.15, dragStartRef.current.rotX + deltaY * 0.008));

    lastPosRef.current = { x: e.clientX, y: e.clientY };
    lastTimeRef.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing max-w-full touch-none ${className}`}
      style={{ width: size, height: size }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="Clique e arraste em 360° para girar o globo"
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", maxWidth: size, maxHeight: size }}
        className="block"
      />
    </div>
  );
};
