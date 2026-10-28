"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLOBE_LAND_POINTS } from "./globeDotData";

// Major global coordinates for real activity hubs
const TECH_HUBS = [
  { name: "São Paulo", lat: -23.55, lon: -46.63 },
  { name: "Nova York", lat: 40.71, lon: -74.0 },
  { name: "San Francisco", lat: 37.77, lon: -122.42 },
  { name: "Londres", lat: 51.5, lon: -0.12 },
  { name: "Frankfurt", lat: 50.11, lon: 8.68 },
  { name: "Tóquio", lat: 35.68, lon: 139.69 },
  { name: "Singapura", lat: 1.35, lon: 103.82 },
  { name: "Sydney", lat: -33.86, lon: 151.2 },
  { name: "Paris", lat: 48.85, lon: 2.35 },
  { name: "Toronto", lat: 43.65, lon: -79.38 },
];

const CONNECTIONS = [
  { from: 0, to: 1 }, // São Paulo -> NY
  { from: 1, to: 3 }, // NY -> London
  { from: 3, to: 4 }, // London -> Frankfurt
  { from: 4, to: 5 }, // Frankfurt -> Tokyo
  { from: 5, to: 6 }, // Tokyo -> Singapore
  { from: 6, to: 7 }, // Singapore -> Sydney
  { from: 2, to: 5 }, // SF -> Tokyo
  { from: 1, to: 2 }, // NY -> SF
];

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export const TechGlobe: React.FC<{ className?: string }> = ({ className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      setWebGLFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 215;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 82;

    // 1. Dark core sphere with solid pure black
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.6, 64, 64);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x050505,
      transparent: true,
      opacity: 0.98,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(coreMesh);

    // 2. Latitude & Longitude subtle guide lines
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x262626,
      transparent: true,
      opacity: 0.28,
    });

    for (let lat = -60; lat <= 60; lat += 30) {
      const ringRadius = GLOBE_RADIUS * Math.cos((lat * Math.PI) / 180);
      const ringY = GLOBE_RADIUS * Math.sin((lat * Math.PI) / 180);
      const ringCurve = new THREE.EllipseCurve(0, 0, ringRadius, ringRadius, 0, 2 * Math.PI, false, 0);
      const ringPoints = ringCurve.getPoints(64);
      const ringGeo = new THREE.BufferGeometry().setFromPoints(
        ringPoints.map((p) => new THREE.Vector3(p.x, ringY, p.y))
      );
      const ringLine = new THREE.Line(ringGeo, gridMat);
      globeGroup.add(ringLine);
    }

    // 3. Monochromatic Dotted Continents using exact Natural Earth Cartography (4,247 Points)
    const dotPositions: number[] = [];
    const dotColors: number[] = [];
    const baseColor = new THREE.Color(0xa1a1aa); // zinc-400
    const brightColor = new THREE.Color(0xffffff); // pure white

    GLOBE_LAND_POINTS.forEach(([lat, lon]) => {
      const pos = latLonToVector3(lat, lon, GLOBE_RADIUS);
      dotPositions.push(pos.x, pos.y, pos.z);

      const isBright = Math.random() < 0.2;
      const col = isBright ? brightColor : baseColor;
      dotColors.push(col.r, col.g, col.b);
    });

    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(dotPositions, 3));
    dotsGeo.setAttribute("color", new THREE.Float32BufferAttribute(dotColors, 3));

    // Custom circle dot texture
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }
    const dotTexture = new THREE.CanvasTexture(canvas);

    const dotsMat = new THREE.PointsMaterial({
      size: 2.1,
      vertexColors: true,
      map: dotTexture,
      transparent: true,
      opacity: 0.92,
      alphaTest: 0.05,
    });

    const dotsMesh = new THREE.Points(dotsGeo, dotsMat);
    globeGroup.add(dotsMesh);

    // Dynamic Theme Color Updater (Dark / Light Mode Reaction)
    const updateGlobeTheme = () => {
      const isLight = document.documentElement.classList.contains("light");
      coreMat.color.setHex(isLight ? 0xf4f4f6 : 0x050505);
      coreMat.opacity = isLight ? 0.95 : 0.98;
      gridMat.color.setHex(isLight ? 0xd4d4d8 : 0x262626);
      gridMat.opacity = isLight ? 0.35 : 0.28;

      const baseCol = isLight ? new THREE.Color(0x71717a) : new THREE.Color(0xa1a1aa);
      const brightCol = isLight ? new THREE.Color(0x18181b) : new THREE.Color(0xffffff);

      const colorsAttr = dotsGeo.getAttribute("color") as THREE.BufferAttribute;
      if (colorsAttr) {
        for (let i = 0; i < GLOBE_LAND_POINTS.length; i++) {
          const isBright = i % 5 === 0;
          const col = isBright ? brightCol : baseCol;
          colorsAttr.setXYZ(i, col.r, col.g, col.b);
        }
        colorsAttr.needsUpdate = true;
      }
    };

    updateGlobeTheme();

    const themeObserver = new MutationObserver(() => {
      updateGlobeTheme();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // 4. Traffic Hub Nodes & Pulsing Rings
    const hubObjects: { pulse: THREE.Mesh; pos: THREE.Vector3; initialScale: number }[] = [];
    TECH_HUBS.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, GLOBE_RADIUS + 0.6);

      // Core white dot
      const nodeGeo = new THREE.SphereGeometry(1.4, 16, 16);
      const nodeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.copy(pos);
      globeGroup.add(nodeMesh);

      // Pulsing wave ring around the hub
      const ringGeo = new THREE.RingGeometry(1.5, 2.1, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ringMesh);

      hubObjects.push({ pulse: ringMesh, pos, initialScale: 1 });
    });

    // 5. Orbital Connection Arcs between hubs
    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);

    CONNECTIONS.forEach((conn) => {
      const p1 = latLonToVector3(TECH_HUBS[conn.from].lat, TECH_HUBS[conn.from].lon, GLOBE_RADIUS);
      const p2 = latLonToVector3(TECH_HUBS[conn.to].lat, TECH_HUBS[conn.to].lon, GLOBE_RADIUS);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const distance = p1.distanceTo(p2);
      const elevation = GLOBE_RADIUS + distance * 0.28;
      mid.normalize().multiplyScalar(elevation);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(50);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);

      const arcMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        linewidth: 1,
      });

      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcGroup.add(arcLine);
    });

    // 6. Orbital ring circling the planet
    const orbitCurve = new THREE.EllipseCurve(0, 0, GLOBE_RADIUS * 1.35, GLOBE_RADIUS * 1.35, 0, 2 * Math.PI, false, 0);
    const orbitPoints = orbitCurve.getPoints(128);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
      orbitPoints.map((p) => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitMat = new THREE.LineDashedMaterial({
      color: 0x555555,
      dashSize: 3,
      gapSize: 4,
      transparent: true,
      opacity: 0.4,
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.computeLineDistances();
    orbitLine.rotation.x = Math.PI * 0.3;
    orbitLine.rotation.z = Math.PI * 0.15;
    globeGroup.add(orbitLine);

    // Initial globe orientation
    globeGroup.rotation.x = 0.22;
    globeGroup.rotation.y = 0.8;

    let targetRotationX = 0.22;
    let targetRotationY = 0.8;
    let mouseX = 0;
    let mouseY = 0;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mouseX = x;
      mouseY = y;
    };

    window.addEventListener("pointermove", onPointerMove);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Continuous Slow Rotation
      if (!prefersReducedMotion) {
        globeGroup.rotation.y += delta * 0.09;
      }

      // Parallax damping
      targetRotationY = globeGroup.rotation.y + mouseX * 0.12;
      targetRotationX = 0.22 + mouseY * 0.1;
      globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.05;

      // Pulse Animation for Hubs
      hubObjects.forEach((hub, idx) => {
        const pulseCycle = (elapsedTime * 1.5 + idx * 0.6) % 2;
        const scale = 1 + pulseCycle * 2.2;
        const opacity = Math.max(0, 0.85 - pulseCycle * 0.45);
        hub.pulse.scale.set(scale, scale, scale);
        (hub.pulse.material as THREE.MeshBasicMaterial).opacity = opacity;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      themeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      dotsGeo.dispose();
      dotsMat.dispose();
      dotTexture.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webGLFailed) {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden bg-brand-black ${className}`}>
        <div className="w-[500px] h-[500px] rounded-full border border-brand-border bg-brand-surface flex items-center justify-center">
          <span className="text-xs uppercase tracking-widest text-brand-secondary font-mono">
            Rede Global Nexora
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none pointer-events-none ${className}`}
      aria-hidden="true"
    />
  );
};
