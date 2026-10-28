"use client";

import React, { useEffect, useRef } from "react";

interface RotatingGlobeProps {
  size?: number;
  className?: string;
}

export const RotatingGlobe: React.FC<RotatingGlobeProps> = ({
  size = 340,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, angle: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;

    // Generate Sphere Point Cloud (Fibonacci Sphere Distribution for even coverage)
    const totalPoints = 420;
    const points: { x: number; y: number; z: number }[] = [];
    const radius = size * 0.38;

    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    for (let i = 0; i < totalPoints; i++) {
      const y = 1 - (i / (totalPoints - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({ x: x * radius, y: y * radius, z: z * radius });
    }

    // Key Tech Hubs positioned on sphere (lat, lon)
    const hubs = [
      { name: "São Paulo", lat: -23.55, lon: -46.63, flag: "🇧🇷", state: "SP" },
      { name: "Nova York", lat: 40.71, lon: -74.0, flag: "🇺🇸", state: "NY" },
      { name: "Londres", lat: 51.5, lon: -0.12, flag: "🇬🇧", state: "ENG" },
      { name: "Frankfurt", lat: 50.11, lon: 8.68, flag: "🇩🇪", state: "HE" },
      { name: "Tóquio", lat: 35.68, lon: 139.69, flag: "🇯🇵", state: "TK" },
      { name: "Lisboa", lat: 38.72, lon: -9.14, flag: "🇵🇹", state: "LX" },
    ].map((h) => {
      const latRad = (h.lat * Math.PI) / 180;
      const lonRad = (h.lon * Math.PI) / 180;
      return {
        ...h,
        baseX: radius * Math.cos(latRad) * Math.sin(lonRad),
        baseY: -radius * Math.sin(latRad),
        baseZ: radius * Math.cos(latRad) * Math.cos(lonRad),
      };
    });

    let pulseTime = 0;

    const render = () => {
      if (!isDraggingRef.current) {
        angleRef.current += 0.007; // Smooth continuous rotation
      }
      pulseTime += 0.05;

      const rot = angleRef.current;
      const cosRot = Math.cos(rot);
      const sinRot = Math.sin(rot);

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
        radius * 0.6,
        centerX,
        centerY,
        radius * 1.25
      );
      if (isLight) {
        glowGrad.addColorStop(0, "rgba(0, 0, 0, 0.04)");
        glowGrad.addColorStop(0.6, "rgba(0, 0, 0, 0.01)");
        glowGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      } else {
        glowGrad.addColorStop(0, "rgba(255, 255, 255, 0.03)");
        glowGrad.addColorStop(0.6, "rgba(255, 255, 255, 0.01)");
        glowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      }
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, size, size);

      // 2. Translucent Sphere Silhouette
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? "rgba(240, 240, 244, 0.75)" : "rgba(10, 10, 12, 0.65)";
      ctx.fill();
      ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3. Render Dot Cloud Points (Z-sorted: back first, then front)
      const rotatedPoints = points.map((p) => {
        // Rotate around Y axis
        const xRot = p.x * cosRot + p.z * sinRot;
        const zRot = -p.x * sinRot + p.z * cosRot;
        return { x: xRot, y: p.y, z: zRot };
      });

      // Split into back and front
      const backPoints = rotatedPoints.filter((p) => p.z <= 0);
      const frontPoints = rotatedPoints.filter((p) => p.z > 0);

      // Draw Back Points (Fainter, smaller)
      ctx.fillStyle = isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.15)";
      ctx.beginPath();
      backPoints.forEach((p) => {
        const px = centerX + p.x;
        const py = centerY + p.y;
        ctx.rect(px - 0.75, py - 0.75, 1.5, 1.5);
      });
      ctx.fill();

      // 4. Render Orbital Ring (Inclined telemetry ring)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(0.35); // Incline
      ctx.beginPath();
      ctx.ellipse(0, 0, radius * 1.28, radius * 0.38, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.12)" : "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();

      // Orbiting energy pulse on the ring
      const orbitAngle = rot * 2.2;
      const orbX = Math.cos(orbitAngle) * (radius * 1.28);
      const orbY = Math.sin(orbitAngle) * (radius * 0.38);
      ctx.beginPath();
      ctx.arc(orbX, orbY, 3, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? "#111111" : "#ffffff";
      ctx.fill();
      ctx.restore();

      // Draw Front Points (Crisp titanium / white)
      ctx.fillStyle = isLight ? "rgba(15, 15, 18, 0.85)" : "rgba(240, 245, 255, 0.75)";
      ctx.beginPath();
      frontPoints.forEach((p) => {
        const px = centerX + p.x;
        const py = centerY + p.y;
        const dotSize = 1.8 + (p.z / radius) * 1.2;
        ctx.rect(px - dotSize / 2, py - dotSize / 2, dotSize, dotSize);
      });
      ctx.fill();

      // 5. Render Active Tech Hub Nodes with Pulsing Wave
      hubs.forEach((hub) => {
        const hx = hub.baseX * cosRot + hub.baseZ * sinRot;
        const hz = -hub.baseX * sinRot + hub.baseZ * cosRot;
        const hy = hub.baseY;

        // Only draw when on front hemisphere
        if (hz > 15) {
          const px = centerX + hx;
          const py = centerY + hy;
          const depthAlpha = Math.min(1, hz / (radius * 0.6));

          // Center pin
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = isLight ? "#0f0f12" : "#ffffff";
          ctx.fill();

          // Radar wave
          const wave = (Math.sin(pulseTime + hub.lat * 0.1) + 1) / 2;
          const ringRadius = 4 + wave * 9;
          ctx.beginPath();
          ctx.arc(px, py, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = isLight
            ? `rgba(15, 15, 18, ${(1 - wave) * depthAlpha * 0.7})`
            : `rgba(255, 255, 255, ${(1 - wave) * depthAlpha * 0.8})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Flag and state label on frontmost nodes
          if (hz > radius * 0.35) {
            ctx.font = "bold 9px Poppins, -apple-system, sans-serif";
            const label = `${hub.flag} ${hub.name} [${hub.state}]`;
            const textW = ctx.measureText(label).width;

            // Mini glass pill
            ctx.fillStyle = isLight ? "rgba(255, 255, 255, 0.94)" : "rgba(10, 10, 12, 0.88)";
            ctx.strokeStyle = isLight ? "rgba(0, 0, 0, 0.15)" : "rgba(255, 255, 255, 0.25)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(px + 6, py - 8, textW + 8, 15, 3);
            } else {
              ctx.rect(px + 6, py - 8, textW + 8, 15);
            }
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = isLight ? "#0f0f12" : "#ffffff";
            ctx.fillText(label, px + 10, py + 3);
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

  // Touch / Mouse interactive drag to rotate
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, angle: angleRef.current };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    angleRef.current = dragStartRef.current.angle + dx * 0.008;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      isDraggingRef.current = true;
      dragStartRef.current = { x: e.touches[0].clientX, angle: angleRef.current };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStartRef.current.x;
    angleRef.current = dragStartRef.current.angle + dx * 0.008;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      className={`relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing max-w-full ${className}`}
      style={{ width: size, height: size }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", maxWidth: size, maxHeight: size }}
        className="block"
      />
    </div>
  );
};
