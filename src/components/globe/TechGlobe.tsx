"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { GLOBE_LAND_POINTS } from "./globeDotData";
import { CONTINENT_CONTOURS } from "./continentBoundaries";
import { RotateCw, ZoomIn, ZoomOut } from "lucide-react";

// Major global coordinates for real activity hubs
const TECH_HUBS = [
  { name: "São Paulo", country: "Brasil", flag: "🇧🇷", lat: -23.55, lon: -46.63, isPrimary: true },
  { name: "Rio de Janeiro", country: "Brasil", flag: "🇧🇷", lat: -22.91, lon: -43.17, isPrimary: true },
  { name: "Nova York", country: "EUA", flag: "🇺🇸", lat: 40.71, lon: -74.0, isPrimary: false },
  { name: "San Francisco", country: "EUA", flag: "🇺🇸", lat: 37.77, lon: -122.42, isPrimary: false },
  { name: "Londres", country: "Reino Unido", flag: "🇬🇧", lat: 51.5, lon: -0.12, isPrimary: false },
  { name: "Lisboa", country: "Portugal", flag: "🇵🇹", lat: 38.72, lon: -9.14, isPrimary: false },
  { name: "Frankfurt", country: "Alemanha", flag: "🇩🇪", lat: 50.11, lon: 8.68, isPrimary: false },
  { name: "Tóquio", country: "Japão", flag: "🇯🇵", lat: 35.68, lon: 139.69, isPrimary: false },
  { name: "Singapura", country: "Singapura", flag: "🇸🇬", lat: 1.35, lon: 103.82, isPrimary: false },
  { name: "Sydney", country: "Austrália", flag: "🇦🇺", lat: -33.86, lon: 151.2, isPrimary: false },
];

const CONNECTIONS = [
  { from: 0, to: 2 }, // São Paulo -> NY
  { from: 0, to: 5 }, // São Paulo -> Lisboa
  { from: 2, to: 4 }, // NY -> Londres
  { from: 4, to: 6 }, // Londres -> Frankfurt
  { from: 6, to: 7 }, // Frankfurt -> Tóquio
  { from: 7, to: 8 }, // Tóquio -> Singapura
  { from: 8, to: 9 }, // Singapura -> Sydney
  { from: 3, to: 7 }, // SF -> Tóquio
  { from: 2, to: 3 }, // NY -> SF
];

function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export interface GlobeHubPoint {
  name: string;
  country: string;
  flag: string;
  lat: number;
  lon: number;
  isPrimary?: boolean;
}

export const TechGlobe: React.FC<{
  className?: string;
  enableZoom?: boolean;
  points?: GlobeHubPoint[];
}> = ({
  className = "",
  enableZoom = false,
  points,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webGLFailed, setWebGLFailed] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [hoveredHub, setHoveredHub] = useState<{
    name: string;
    country: string;
    flag: string;
    x: number;
    y: number;
  } | null>(null);

  // References for 360° interactive drag rotation
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const rotStartRef = useRef({ x: 0.22, y: 0.8 });
  const targetRotRef = useRef({ x: 0.22, y: 0.8 });
  const velocityRef = useRef({ x: 0, y: 0 });
  const lastMoveTimeRef = useRef(0);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const cameraZRef = useRef(215);

  const resetToBrazil = useCallback(() => {
    // Center on South America / Brazil (-15 lat, -50 lon)
    targetRotRef.current = { x: 0.18, y: 1.15 };
    setHasUserInteracted(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

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
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = cameraZRef.current;

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const GLOBE_RADIUS = 82;

    // 1. OPAQUE CORE SPHERE with depthWrite=true to completely occlude back-face continents
    const coreGeo = new THREE.SphereGeometry(GLOBE_RADIUS - 0.35, 64, 64);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x050505,
      depthWrite: true,
      depthTest: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.renderOrder = 0;
    globeGroup.add(coreMesh);

    // 2. Latitude & Longitude subtle guide lines
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x262626,
      transparent: true,
      opacity: 0.22,
      depthTest: true,
      depthWrite: false,
    });

    for (let lat = -60; lat <= 60; lat += 30) {
      const ringRadius = (GLOBE_RADIUS + 0.1) * Math.cos((lat * Math.PI) / 180);
      const ringY = (GLOBE_RADIUS + 0.1) * Math.sin((lat * Math.PI) / 180);
      const ringCurve = new THREE.EllipseCurve(0, 0, ringRadius, ringRadius, 0, 2 * Math.PI, false, 0);
      const ringPoints = ringCurve.getPoints(64);
      const ringGeo = new THREE.BufferGeometry().setFromPoints(
        ringPoints.map((p) => new THREE.Vector3(p.x, ringY, p.y))
      );
      const ringLine = new THREE.Line(ringGeo, gridMat);
      ringLine.renderOrder = 1;
      globeGroup.add(ringLine);
    }

    // 3. CONTINENTAL COASTLINE VECTOR BOUNDARIES (Real Mapa Mundi Shapes)
    const contourMat = new THREE.LineBasicMaterial({
      color: 0x71717a,
      transparent: true,
      opacity: 0.45,
      depthTest: true,
      depthWrite: false,
    });

    CONTINENT_CONTOURS.forEach((continent) => {
      const contourPoints = continent.points.map(([lat, lon]) =>
        latLonToVector3(lat, lon, GLOBE_RADIUS + 0.35)
      );
      const contourGeo = new THREE.BufferGeometry().setFromPoints(contourPoints);
      const contourLine = new THREE.LineLoop(contourGeo, contourMat);
      contourLine.renderOrder = 2;
      globeGroup.add(contourLine);
    });

    // 4. HIGH-DENSITY CONTINENTAL DOT MATRIX (4,247 Natural Earth Points)
    const dotPositions: number[] = [];
    const dotColors: number[] = [];
    const baseColorDark = new THREE.Color(0xa1a1aa); // zinc-400
    const brightColorDark = new THREE.Color(0xffffff); // pure white

    GLOBE_LAND_POINTS.forEach(([lat, lon], idx) => {
      const pos = latLonToVector3(lat, lon, GLOBE_RADIUS + 0.5);
      dotPositions.push(pos.x, pos.y, pos.z);

      const isBright = idx % 4 === 0;
      const col = isBright ? brightColorDark : baseColorDark;
      dotColors.push(col.r, col.g, col.b);
    });

    const dotsGeo = new THREE.BufferGeometry();
    dotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(dotPositions, 3));
    dotsGeo.setAttribute("color", new THREE.Float32BufferAttribute(dotColors, 3));

    // Custom circular dot texture with smooth alpha anti-aliasing
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }
    const dotTexture = new THREE.CanvasTexture(canvas);

    const dotsMat = new THREE.PointsMaterial({
      size: 2.3,
      vertexColors: true,
      map: dotTexture,
      transparent: true,
      opacity: 0.95,
      alphaTest: 0.08,
      depthTest: true,
      depthWrite: false,
    });

    const dotsMesh = new THREE.Points(dotsGeo, dotsMat);
    dotsMesh.renderOrder = 3;
    globeGroup.add(dotsMesh);

    // 5. Tech Hub Nodes with Pulsing Radar Waves
    const activeHubs: GlobeHubPoint[] = (points && points.length > 0) ? points : TECH_HUBS;

    const hubMeshes: {
      mesh: THREE.Mesh;
      pulse: THREE.Mesh;
      data: GlobeHubPoint;
      pos: THREE.Vector3;
    }[] = [];

    const hubMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      depthTest: true,
      depthWrite: false,
    });

    const primaryHubMat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald Green for Brazil
      depthTest: true,
      depthWrite: false,
    });

    activeHubs.forEach((hub) => {
      const pos = latLonToVector3(hub.lat, hub.lon, GLOBE_RADIUS + 0.8);

      // Core sphere node
      const nodeGeo = new THREE.SphereGeometry(hub.isPrimary ? 1.6 : 1.3, 16, 16);
      const nodeMesh = new THREE.Mesh(nodeGeo, hub.isPrimary ? primaryHubMat : hubMat);
      nodeMesh.position.copy(pos);
      nodeMesh.renderOrder = 4;
      globeGroup.add(nodeMesh);

      // Pulsing radar ring
      const ringGeo = new THREE.RingGeometry(1.6, 2.4, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: hub.isPrimary ? 0x10b981 : 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
        depthTest: true,
        depthWrite: false,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
      ringMesh.renderOrder = 4;
      globeGroup.add(ringMesh);

      hubMeshes.push({ mesh: nodeMesh, pulse: ringMesh, data: hub, pos });
    });

    // 6. Orbital Interconnection Arcs
    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);

    const arcMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      depthTest: true,
      depthWrite: false,
    });

    CONNECTIONS.forEach((conn) => {
      if (!activeHubs[conn.from] || !activeHubs[conn.to]) return;
      const p1 = latLonToVector3(activeHubs[conn.from].lat, activeHubs[conn.from].lon, GLOBE_RADIUS + 0.8);
      const p2 = latLonToVector3(activeHubs[conn.to].lat, activeHubs[conn.to].lon, GLOBE_RADIUS + 0.8);

      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      const dist = p1.distanceTo(p2);
      const elevation = GLOBE_RADIUS + Math.min(dist * 0.35, 30);
      mid.normalize().multiplyScalar(elevation);

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      const points = curve.getPoints(40);
      const arcGeo = new THREE.BufferGeometry().setFromPoints(points);
      const arcLine = new THREE.Line(arcGeo, arcMat);
      arcLine.renderOrder = 4;
      arcGroup.add(arcLine);
    });

    // 7. Dual Orbital Rings circling the planet
    const orbitCurve1 = new THREE.EllipseCurve(0, 0, GLOBE_RADIUS * 1.35, GLOBE_RADIUS * 1.35, 0, 2 * Math.PI, false, 0);
    const orbitPoints1 = orbitCurve1.getPoints(128);
    const orbitGeo1 = new THREE.BufferGeometry().setFromPoints(
      orbitPoints1.map((p) => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitMat1 = new THREE.LineDashedMaterial({
      color: 0x52525b,
      dashSize: 3,
      gapSize: 4,
      transparent: true,
      opacity: 0.45,
    });
    const orbitLine1 = new THREE.Line(orbitGeo1, orbitMat1);
    orbitLine1.computeLineDistances();
    orbitLine1.rotation.x = Math.PI * 0.32;
    orbitLine1.rotation.z = Math.PI * 0.15;
    orbitLine1.renderOrder = 5;
    globeGroup.add(orbitLine1);

    // Dynamic Theme Color Updater (Dark / Light Mode Reaction)
    const updateGlobeTheme = () => {
      const isLight = document.documentElement.classList.contains("light");

      // Solid core color
      coreMat.color.setHex(isLight ? 0xffffff : 0x050505);

      // Grid & contours
      gridMat.color.setHex(isLight ? 0xe4e4e7 : 0x27272a);
      gridMat.opacity = isLight ? 0.35 : 0.22;

      contourMat.color.setHex(isLight ? 0x71717a : 0x52525b);
      contourMat.opacity = isLight ? 0.45 : 0.4;

      // Continents dots color
      const baseCol = isLight ? new THREE.Color(0x3f3f46) : new THREE.Color(0xa1a1aa);
      const brightCol = isLight ? new THREE.Color(0x09090b) : new THREE.Color(0xffffff);

      const colorsAttr = dotsGeo.getAttribute("color") as THREE.BufferAttribute;
      if (colorsAttr) {
        for (let i = 0; i < GLOBE_LAND_POINTS.length; i++) {
          const isBright = i % 4 === 0;
          const col = isBright ? brightCol : baseCol;
          colorsAttr.setXYZ(i, col.r, col.g, col.b);
        }
        colorsAttr.needsUpdate = true;
      }

      // Arcs & Orbit colors
      arcMat.color.setHex(isLight ? 0x27272a : 0xffffff);
      arcMat.opacity = isLight ? 0.3 : 0.35;
      orbitMat1.color.setHex(isLight ? 0x71717a : 0x52525b);
      orbitMat1.opacity = isLight ? 0.5 : 0.45;
    };

    updateGlobeTheme();

    const themeObserver = new MutationObserver(() => {
      updateGlobeTheme();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    // Initial globe orientation centered towards the Americas
    globeGroup.rotation.x = 0.22;
    globeGroup.rotation.y = 0.8;
    targetRotRef.current = { x: 0.22, y: 0.8 };

    // ========================================================================
    // 360° INTERACTIVE DRAG & TOUCH CONTROLS
    // ========================================================================
    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      setHasUserInteracted(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      rotStartRef.current = { x: globeGroup.rotation.x, y: globeGroup.rotation.y };
      lastPosRef.current = { x: e.clientX, y: e.clientY };
      lastMoveTimeRef.current = performance.now();
      velocityRef.current = { x: 0, y: 0 };

      if (container) {
        container.setPointerCapture(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTimeRef.current);

      if (isDraggingRef.current) {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        // Instantaneous drag velocity for smooth inertia release
        const stepX = e.clientX - lastPosRef.current.x;
        const stepY = e.clientY - lastPosRef.current.y;
        velocityRef.current = {
          x: (stepX / dt) * 0.08,
          y: (stepY / dt) * 0.08,
        };

        // 360° Horizontal infinite rotation and clamped vertical tilt
        targetRotRef.current.y = rotStartRef.current.y + deltaX * 0.007;
        targetRotRef.current.x = Math.max(-1.15, Math.min(1.15, rotStartRef.current.x + deltaY * 0.007));

        lastPosRef.current = { x: e.clientX, y: e.clientY };
        lastMoveTimeRef.current = now;
      } else {
        // Hub Hover Raycasting detection when not dragging
        const rect = container.getBoundingClientRect();
        const mouseNormX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseNormY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseNormX, mouseNormY), camera);

        const meshes = hubMeshes.map((h) => h.mesh);
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
          const hit = hubMeshes.find((h) => h.mesh === intersects[0].object);
          if (hit) {
            setHoveredHub({
              name: hit.data.name,
              country: hit.data.country,
              flag: hit.data.flag,
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });
            return;
          }
        }
        setHoveredHub(null);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      try {
        if (container.hasPointerCapture(e.pointerId)) {
          container.releasePointerCapture(e.pointerId);
        }
      } catch {}
    };

    // Zoom on wheel (Desabilitado por padrão para evitar zoom acidental e travamento de scroll da página)
    const onWheel = (e: WheelEvent) => {
      if (!enableZoom) return;
      e.preventDefault();
      setHasUserInteracted(true);
      cameraZRef.current = Math.max(160, Math.min(290, cameraZRef.current + e.deltaY * 0.08));
      camera.position.z = cameraZRef.current;
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    if (enableZoom) {
      container.addEventListener("wheel", onWheel, { passive: false });
    }

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
    let isIntersecting = true;
    let isDocVisible = typeof document !== "undefined" ? !document.hidden : true;

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isIntersecting = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(container);

    const handleVisibility = () => {
      isDocVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isIntersecting || !isDocVisible) {
        return;
      }

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Inertia & Auto-Rotation
      if (!isDraggingRef.current) {
        // If momentum velocity exists, apply it and decay
        if (Math.abs(velocityRef.current.x) > 0.0001 || Math.abs(velocityRef.current.y) > 0.0001) {
          targetRotRef.current.y += velocityRef.current.x;
          targetRotRef.current.x = Math.max(-1.15, Math.min(1.15, targetRotRef.current.x + velocityRef.current.y));
          velocityRef.current.x *= 0.93;
          velocityRef.current.y *= 0.93;
        } else {
          // Continuous Ambient Rotation in 360°
          targetRotRef.current.y += delta * 0.07;
        }
      }

      // Smooth interpolation
      globeGroup.rotation.y += (targetRotRef.current.y - globeGroup.rotation.y) * 0.12;
      globeGroup.rotation.x += (targetRotRef.current.x - globeGroup.rotation.x) * 0.12;

      // Pulse Animation for Tech Hubs
      hubMeshes.forEach((hub, idx) => {
        const pulseCycle = (elapsedTime * 1.6 + idx * 0.5) % 2;
        const scale = 1 + pulseCycle * 2.2;
        const opacity = Math.max(0, 0.8 - pulseCycle * 0.4);
        hub.pulse.scale.set(scale, scale, scale);
        (hub.pulse.material as THREE.MeshBasicMaterial).opacity = opacity;
      });

      // Orbit ring slow rotation
      orbitLine1.rotation.y += delta * 0.04;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      themeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      if (enableZoom) {
        container.removeEventListener("wheel", onWheel);
      }
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
            Rede Global Phantom-X
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full select-none ${className}`}>
      {/* 3D WebGL Canvas Container with 360° Drag Grabber */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none"
        title="Clique e arraste em 360° para navegar pelo globo terrestre"
      />

      {/* Floating 360° Navigation Helper Pill */}
      {!hasUserInteracted && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-700 animate-pulse">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-brand-surface/90 backdrop-blur-md border border-brand-border shadow-sm text-[10px] font-mono text-brand-secondary">
            <RotateCw className="w-3 h-3 text-brand-white animate-spin" style={{ animationDuration: "6s" }} />
            <span>Arraste em 360° para explorar</span>
          </div>
        </div>
      )}

      {/* Hub Hover Tooltip */}
      {hoveredHub && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: hoveredHub.x, top: hoveredHub.y }}
        >
          <div className="bg-neutral-900/95 dark:bg-black/95 text-white border border-neutral-700 rounded-xl px-3 py-1.5 shadow-glow-sm text-xs font-mono flex items-center space-x-2 backdrop-blur-md">
            <span className="text-sm select-none">{hoveredHub.flag}</span>
            <div>
              <div className="font-semibold text-white leading-tight">{hoveredHub.name}</div>
              <div className="text-[10px] text-emerald-400">PoP Ativo • &lt; 14ms</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
