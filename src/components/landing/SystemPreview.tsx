"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Radio,
  Globe,
  Layers,
  Globe2,
  ListFilter,
  BarChart3,
  Settings,
  Activity,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  Maximize2,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Fingerprint,
  Zap,
  Lock,
  Copy,
  Check,
  FileCode,
  ArrowRightLeft,
  X,
  ExternalLink,
  Laptop,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MetricCards } from "../dashboard/MetricCards";
import { DigitalMatrixWorldMap } from "../dashboard/DigitalMatrixWorldMap";
import { TrafficCharts } from "../dashboard/TrafficCharts";
import { store } from "@/lib/store";
import { TrafficEvent, GeoAggregate, MetricOverview, CloakerMode } from "@/types";
import { generateCloudflareWorkerCode, BLOCKED_ASNS_MAP } from "@/lib/cloakerEngine";

type ConsoleTab = "overview" | "layers" | "worker" | "live";

export const SystemPreview: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState("checkout.phantomx.pro");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ConsoleTab>("overview");
  const [cloakerMode, setCloakerMode] = useState<CloakerMode>("AUTOMATICO");

  const [metrics, setMetrics] = useState<MetricOverview>(store.getDemoOverviewMetrics());
  const [geoData, setGeoData] = useState<GeoAggregate[]>(store.getDemoGeoDistribution());
  const [timeSeries, setTimeSeries] = useState(store.getDemoTimeSeries(24));
  const [events, setEvents] = useState<TrafficEvent[]>(store.getDemoEvents(12));

  // Inspection Drawer & Copy Feedback
  const [selectedEvent, setSelectedEvent] = useState<TrafficEvent | null>(null);
  const [copiedWorker, setCopiedWorker] = useState(false);
  const [clientGpuAudit, setClientGpuAudit] = useState<{
    renderer: string;
    vendor: string;
    concurrency: number;
    isHeadless: boolean;
    verdict: "clean" | "suspicious";
  } | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadData = () => {
    setMetrics(store.getDemoOverviewMetrics());
    setGeoData(store.getDemoGeoDistribution());
    setTimeSeries(store.getDemoTimeSeries(24));
    setEvents(store.getDemoEvents(12));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Simulates a verified genuine human lead with fbclid and residential ASN
  const handleSimulateHuman = () => {
    const newEvt: TrafficEvent = {
      id: `evt_sim_${Date.now()}`,
      clickId: `clk_fb_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      domain: selectedDomain,
      campaignName: "Meta Ads — Campanha Escala Q4",
      ip: "177.142.88.24",
      ipMasked: "177.142.***.***",
      country: "Brasil",
      countryCode: "BR",
      city: "São Paulo",
      state: "São Paulo",
      stateCode: "SP",
      latitude: -23.5505,
      longitude: -46.6333,
      device: "mobile",
      browser: "Mobile Safari 17.4",
      os: "iOS 17.4",
      referrer: "https://instagram.com",
      targetUrl: "https://pay.checkout-seguro.com/produto-exclusivo",
      routedTo:
        cloakerMode === "SO_WHITEPAGE"
          ? "https://artigo-saude-bemestar.blog/seguranca"
          : "https://pay.checkout-seguro.com/produto-exclusivo",
      riskScore: cloakerMode === "SO_WHITEPAGE" ? 100 : 8,
      riskCategory: cloakerMode === "SO_WHITEPAGE" ? "bot" : "clean",
      classification: cloakerMode === "SO_WHITEPAGE" ? "preview-bot" : "human-like",
      decision: cloakerMode === "SO_WHITEPAGE" ? "mitigated_safe" : "routed_offer",
      asn: 28573,
      asnOrg: "Claro Telecom Participacoes S.A.",
      detectedLayer: cloakerMode === "SO_WHITEPAGE" ? "asn_datacenter" : "clean_traffic",
      httpStatus: 200,
      reverseProxyDelivery: true,
      webglRenderer: "Apple GPU (Metal)",
      isHeadless: false,
      canvasHash: "cv_9f82d11b",
      latencyMs: 11,
      isThreat: cloakerMode === "SO_WHITEPAGE",
      threatReasons: cloakerMode === "SO_WHITEPAGE" ? ["Modo Forçado SÓ_WHITEPAGE"] : [],
    };

    setEvents((prev) => [newEvt, ...prev.slice(0, 11)]);
    showToast("Visitante Real injetado: Roteado via HTTP 200 Proxy Reverso (< 12ms)");
  };

  // Simulates a Meta Review Bot / Datacenter Inspector
  const handleSimulateBot = () => {
    const newEvt: TrafficEvent = {
      id: `evt_sim_${Date.now()}`,
      clickId: `clk_bot_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      domain: selectedDomain,
      campaignName: "Meta Ads — Campanha Escala Q4",
      ip: "69.171.251.12",
      ipMasked: "69.171.***.***",
      country: "Estados Unidos",
      countryCode: "US",
      city: "Menlo Park",
      state: "California",
      stateCode: "CA",
      latitude: 37.4538,
      longitude: -122.1822,
      device: "bot",
      browser: "facebookexternalhit/1.1",
      os: "Linux x86_64",
      referrer: "Direto / Sem Referrer",
      targetUrl: "https://pay.checkout-seguro.com/produto-exclusivo",
      routedTo:
        cloakerMode === "SO_OFERTA"
          ? "https://pay.checkout-seguro.com/produto-exclusivo"
          : "https://artigo-saude-bemestar.blog/seguranca",
      riskScore: cloakerMode === "SO_OFERTA" ? 12 : 98,
      riskCategory: cloakerMode === "SO_OFERTA" ? "clean" : "bot",
      classification: "known-crawler",
      decision: cloakerMode === "SO_OFERTA" ? "routed_offer" : "mitigated_safe",
      asn: 32934,
      asnOrg: "Meta Platforms, Inc.",
      detectedLayer: cloakerMode === "SO_OFERTA" ? "clean_traffic" : "asn_datacenter",
      httpStatus: 200,
      reverseProxyDelivery: true,
      webglRenderer: "SwiftShader Virtual Driver (Software)",
      isHeadless: true,
      canvasHash: "cv_00000000",
      latencyMs: 9,
      isThreat: cloakerMode !== "SO_OFERTA",
      threatReasons: [
        "AS32934 Meta Platforms Datacenter",
        "Crawler User-Agent (facebookexternalhit)",
        "GPU WebGL Virtual (SwiftShader)",
        "Navegador Automatizado (navigator.webdriver=true)",
      ],
    };

    setEvents((prev) => [newEvt, ...prev.slice(0, 11)]);
    showToast("Robô Meta (AS32934) detectado: Mitigado para Whitepage HTTP 200");
  };

  // Hardware GPU Inspector Simulator
  const handleInspectLocalGPU = () => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl") ||
        (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

      if (!gl) {
        setClientGpuAudit({
          renderer: "Sem suporte WebGL",
          vendor: "Desconhecido",
          concurrency: navigator.hardwareConcurrency || 4,
          isHeadless: false,
          verdict: "suspicious",
        });
        return;
      }

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);
      const vendor = debugInfo
        ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
        : gl.getParameter(gl.VENDOR);

      const isVirtual =
        /swiftshader|llvmpipe|software|virtual|mesa/i.test(renderer) ||
        (navigator as any).webdriver === true;

      setClientGpuAudit({
        renderer: renderer || "Acelerador Gráfico Dedicado",
        vendor: vendor || "GPU Nativa",
        concurrency: navigator.hardwareConcurrency || 8,
        isHeadless: (navigator as any).webdriver === true,
        verdict: isVirtual ? "suspicious" : "clean",
      });
      showToast("Auditoria de GPU WebGL concluída com sucesso!");
    } catch {
      setClientGpuAudit({
        renderer: "Apple M-Series / Metal (Nativo)",
        vendor: "Apple Inc.",
        concurrency: 8,
        isHeadless: false,
        verdict: "clean",
      });
    }
  };

  // Generate real Worker script preview
  const generatedWorkerScript = generateCloudflareWorkerCode({
    modo: cloakerMode,
    whitepageUrl: "https://artigo-saude-bemestar.blog/seguranca",
    ofertaUrl: "https://pay.checkout-seguro.com/produto-exclusivo",
    paisesPermitidos: ["BR"],
    parametroUtm: "utm_campaign",
    exigirFbclid: true,
    permitirMobile: true,
    permitirDesktop: true,
    riscoMaximo: 70,
    proxyCheckApiKey: "demo_api_key",
    blockedAsns: [32934, 63293, 16509, 15169, 8075, 46652],
    botPatterns: ["facebookexternalhit", "facebot", "googlebot", "bytespider", "adplexity"],
    enableClientFingerprint: true,
    blockHeadless: true,
    blockSwiftShader: true,
    clientAction: "redirect_whitepage",
  });

  const handleCopyWorker = () => {
    navigator.clipboard.writeText(generatedWorkerScript);
    setCopiedWorker(true);
    showToast("Código do Cloudflare Worker copiado!");
    setTimeout(() => setCopiedWorker(false), 2500);
  };

  const navItems = [
    { id: "overview", label: "Visão Geral & Matriz", icon: LayoutDashboard },
    { id: "layers", label: "Motor 6 Camadas", icon: ShieldCheck, badge: "6/6" },
    { id: "worker", label: "Cloudflare Worker", icon: FileCode, badge: "Edge" },
    { id: "live", label: "Auditoria em Tempo Real", icon: Radio, pulse: true },
  ];

  return (
    <section
      id="how-it-works"
      className="relative py-20 px-4 sm:px-6 bg-brand-black overflow-hidden border-t border-brand-border font-sans"
    >
      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center mb-12 flex flex-col items-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-surface border border-brand-border text-brand-white text-xs font-mono mb-3">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>CONSOLE OPERACIONAL CLOAKILIOSHIELD V2.4</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-brand-white mb-3 font-sans">
          Interface Real de Controle em Borda
        </h2>
        <p className="max-w-2xl text-sm sm:text-base text-brand-secondary leading-relaxed font-sans font-normal">
          Alterne modos operacionais, visualize a telemetria do motor de 6 camadas e audite
          requisições com entrega transparente via Proxy Reverso HTTP 200 OK sem redirects.
        </p>
      </div>

      {/* Realistic macOS Window Frame Hosting the Operational Console */}
      <div className="relative max-w-7xl mx-auto">
        {/* Monochromatic ambient glow behind window */}
        <div className="absolute -inset-4 bg-gradient-to-b from-white/5 via-neutral-900/30 to-transparent blur-3xl pointer-events-none rounded-3xl" />

        <div className="relative rounded-2xl bg-brand-black border border-brand-border shadow-glow-lg overflow-hidden font-sans">
          {/* 1. macOS Window Chrome Top Bar */}
          <div className="h-11 bg-neutral-900 dark:bg-[#0c0c0c] border-b border-brand-border px-4 flex items-center justify-between z-40">
            {/* macOS Window Controls */}
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>

            {/* Address Bar */}
            <div className="hidden sm:flex text-[11px] font-mono text-neutral-300 dark:text-brand-secondary items-center space-x-1.5 bg-black/40 dark:bg-brand-surface/80 px-3.5 py-1 rounded-full border border-white/10 dark:border-brand-border">
              <span className="text-neutral-400 dark:text-brand-muted">https://</span>
              <span className="text-white font-medium">console.phantomx.pro/dashboard/cloaker</span>
            </div>

            {/* Direct Link to Live Dashboard & Theme Toggle */}
            <div className="flex items-center space-x-2 text-xs font-sans">
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition"
              >
                <span>Abrir Console</span>
                <Maximize2 className="w-3 h-3 text-black" />
              </Link>
            </div>
          </div>

          {/* Quick Floating Toast Notification inside the Console */}
          {notification && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white border border-neutral-700 px-4 py-2 rounded-xl text-xs font-mono shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-top duration-200">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{notification}</span>
            </div>
          )}

          {/* 2. REAL PHANTOM-X DASHBOARD: SIDEBAR + MAIN WORKSPACE */}
          <div className="flex flex-col md:flex-row min-h-[580px] md:min-h-[760px] bg-brand-black">
            {/* Real Dashboard Sidebar (hidden on mobile, visible on md+) */}
            <aside className="hidden md:flex w-64 border-r border-brand-border bg-brand-black/95 flex-col justify-between shrink-0">
              <div>
                {/* Brand Header */}
                <div className="h-14 flex items-center px-4 border-b border-brand-border space-x-3">
                  <Logo size={32} />
                  <div className="flex flex-col">
                    <span className="font-poppins text-sm font-bold text-brand-white tracking-tight">
                      Phantom-X
                    </span>
                    <span className="text-[10px] text-brand-muted font-mono">CloakilioShield v2.4</span>
                  </div>
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-mono bg-brand-surface border border-brand-border text-brand-muted">
                    EDGE
                  </span>
                </div>

                {/* Real Navigation Menu with Interactive Tab Switching */}
                <nav className="p-3 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as ConsoleTab)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer text-left ${
                          isActive
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                            : "text-brand-secondary hover:text-brand-white hover:bg-brand-surface"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white dark:text-black" : "text-brand-secondary"}`} />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                              isActive
                                ? "bg-black/20 text-black dark:text-black border-black/20"
                                : "bg-brand-surface text-brand-muted border-brand-border"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.pulse && !isActive && (
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        )}
                      </button>
                    );
                  })}

                  <div className="pt-3 border-t border-brand-borderSubtle">
                    <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-brand-muted">
                      Módulos do Sistema
                    </div>
                    <Link
                      href="/dashboard/campaigns"
                      className="flex items-center px-3 py-2 rounded-lg text-xs text-brand-secondary hover:text-brand-white hover:bg-brand-surface transition"
                    >
                      <Layers className="w-4 h-4 mr-2.5 text-brand-secondary" />
                      <span>Campanhas Ativas</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center px-3 py-2 rounded-lg text-xs text-brand-secondary hover:text-brand-white hover:bg-brand-surface transition"
                    >
                      <Settings className="w-4 h-4 mr-2.5 text-brand-secondary" />
                      <span>Configurações Cloaker</span>
                    </Link>
                  </div>
                </nav>
              </div>

              {/* Sidebar Bottom Status */}
              <div className="p-3 border-t border-brand-border space-y-2">
                <div className="px-3 py-2.5 rounded-xl bg-brand-surface border border-brand-borderSubtle text-[11px] font-sans">
                  <div className="text-brand-muted text-[10px] font-mono uppercase tracking-wider">Cluster de Borda</div>
                  <div className="text-brand-white font-medium flex items-center space-x-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>edge-phantom-01</span>
                  </div>
                  <div className="text-[10px] text-brand-secondary mt-1 flex items-center justify-between">
                    <span>14 PoPs operacionais</span>
                    <span className="font-mono text-brand-white">&lt; 14ms</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Real Dashboard Main Content View */}
            <main className="flex-1 flex flex-col min-w-0 bg-brand-black overflow-hidden">
              {/* Top Operational Ribbon */}
              <div className="border-b border-brand-border bg-brand-surface/40 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
                {/* Active Module Title */}
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xs sm:text-sm font-semibold text-brand-white tracking-wide">
                      {activeTab === "overview" && "Visão Geral da Operação"}
                      {activeTab === "layers" && "Motor CloakilioShield (6 Camadas)"}
                      {activeTab === "worker" && "Cloudflare Worker Edge Generator"}
                      {activeTab === "live" && "Auditoria de Tráfego em Tempo Real"}
                    </h1>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-white border border-brand-border">
                      Proxy 200 OK
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-secondary hidden sm:block">
                    {activeTab === "overview" && "Telemetria global, distribuição geográfica e auditoria de borda"}
                    {activeTab === "layers" && "Pipeline determinístico de 6 camadas com telemetria client-side de GPU"}
                    {activeTab === "worker" && "Código compilado pronto para deploy direto na infraestrutura Cloudflare"}
                    {activeTab === "live" && "Inspeção profunda de ASNs, GPU WebGL, score de risco e decisão determinística"}
                  </p>
                </div>

                {/* Cloaker Operational Mode Switcher Pill */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Mode Selector */}
                  <div className="flex items-center bg-brand-surface border border-brand-border p-1 rounded-xl text-[11px] font-mono">
                    <button
                      onClick={() => {
                        setCloakerMode("AUTOMATICO");
                        showToast("Modo Operacional: AUTOMÁTICO (6 Camadas Ativas)");
                      }}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        cloakerMode === "AUTOMATICO"
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                          : "text-brand-secondary hover:text-brand-white"
                      }`}
                    >
                      AUTOMÁTICO
                    </button>
                    <button
                      onClick={() => {
                        setCloakerMode("SO_WHITEPAGE");
                        showToast("Modo Operacional: SÓ WHITEPAGE (100% de Proteção)");
                      }}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        cloakerMode === "SO_WHITEPAGE"
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                          : "text-brand-secondary hover:text-brand-white"
                      }`}
                    >
                      SÓ WHITEPAGE
                    </button>
                    <button
                      onClick={() => {
                        setCloakerMode("SO_OFERTA");
                        showToast("Modo Operacional: SÓ OFERTA (Entrega Direta)");
                      }}
                      className={`px-2.5 py-1 rounded-lg transition ${
                        cloakerMode === "SO_OFERTA"
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                          : "text-brand-secondary hover:text-brand-white"
                      }`}
                    >
                      SÓ OFERTA
                    </button>
                  </div>

                  {/* Simulator Buttons */}
                  <button
                    onClick={handleSimulateHuman}
                    className="hover:bg-brand-hover flex items-center space-x-1.5 text-[11px] bg-brand-surface px-2.5 py-1.5 rounded-lg border border-brand-border text-brand-white transition font-medium"
                    title="Injetar Lead Humano Real com token fbclid"
                  >
                    <Send className="w-3 h-3 text-brand-white" />
                    <span className="hidden lg:inline">Simular Lead Real</span>
                  </button>

                  <button
                    onClick={handleSimulateBot}
                    className="hover:bg-brand-hover flex items-center space-x-1.5 text-[11px] bg-brand-surface px-2.5 py-1.5 rounded-lg border border-brand-border text-brand-secondary hover:text-brand-white transition font-medium"
                    title="Injetar Robô de Moderação Meta Ads (AS32934)"
                  >
                    <ShieldAlert className="w-3 h-3 text-brand-secondary" />
                    <span className="hidden lg:inline">Simular Bot Meta</span>
                  </button>

                  <button
                    onClick={loadData}
                    className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-secondary hover:text-brand-white transition"
                    title="Atualizar dados"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Mobile Tab Navigation Strip (shown only on mobile) */}
              <div className="flex md:hidden border-b border-brand-border bg-brand-surface/20 px-3 py-1.5 overflow-x-auto space-x-1 text-xs">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as ConsoleTab)}
                    className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-medium transition ${
                      activeTab === item.id
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold"
                        : "text-brand-secondary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Console Body Views */}
              <div className="p-4 sm:p-5 space-y-6 overflow-y-auto max-h-[720px] custom-scrollbar">
                {/* ========================================================= */}
                {/* TAB 1: VISÃO GERAL & MATRIZ GLOBAL                       */}
                {/* ========================================================= */}
                {activeTab === "overview" && (
                  <>
                    {/* 2-Column Fold: Compact Metric Cards Left + Stretched World Map Right */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                      {/* Left Column: Metrics Compact */}
                      <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-3">
                        <div className="flex-1">
                          <MetricCards metrics={metrics} layout="compact" />
                        </div>

                        {/* Cloakilio Operational Badge */}
                        <div className="bg-brand-surface border border-brand-border rounded-xl p-3.5 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-brand-white text-xs flex items-center space-x-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-brand-white" />
                              <span>Blindagem CloakilioShield</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-white border border-brand-border">
                              {cloakerMode}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-brand-borderSubtle text-[11px] font-mono">
                            <div>
                              <div className="text-brand-muted text-[10px]">ENTREGA</div>
                              <div className="text-brand-white font-medium">Proxy 200 OK</div>
                            </div>
                            <div>
                              <div className="text-brand-muted text-[10px]">ASNs BLOQUEADOS</div>
                              <div className="text-brand-white font-medium">14 Redes</div>
                            </div>
                            <div>
                              <div className="text-brand-muted text-[10px]">LATÊNCIA MÉDIA</div>
                              <div className="text-brand-white font-medium">&lt; 14ms</div>
                            </div>
                            <div>
                              <div className="text-brand-muted text-[10px]">ZERO FOOTPRINT</div>
                              <div className="text-brand-white font-medium">Ativo</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Digital Matrix World Map */}
                      <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-brand-surface border border-brand-border rounded-2xl p-4 sm:p-5 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
                          <div className="flex items-center space-x-2 font-medium text-brand-white">
                            <Radio className="w-3.5 h-3.5 text-brand-white" />
                            <span className="tracking-wide text-xs">MATRIZ DE TELEMETRIA GLOBAL EM TEMPO REAL</span>
                          </div>
                          <span className="text-brand-muted text-[11px]">
                            {selectedCountry
                              ? `Filtro ativo: [${selectedCountry}]`
                              : "Passe o cursor sobre os nós ou clique para filtrar"}
                          </span>
                        </div>

                        <div className="flex-1 w-full min-h-[300px] flex items-center justify-center">
                          <DigitalMatrixWorldMap
                            events={events}
                            geoData={geoData}
                            selectedCountry={selectedCountry}
                            onSelectCountry={setSelectedCountry}
                            className="h-[300px] sm:h-[380px] w-full rounded-2xl border border-brand-border/60"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Real Traffic Charts */}
                    <TrafficCharts timeSeries={timeSeries} geoData={geoData} />

                    {/* Compact Activity Table Preview */}
                    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-xs sm:text-sm font-semibold text-brand-white tracking-wide flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-brand-white" />
                            <span>Requisições Auditadas na Borda (Últimas 6)</span>
                          </h3>
                          <p className="text-[11px] text-brand-secondary mt-0.5">
                            Decisões em tempo real via Proxy Reverso transparente (HTTP 200 OK sem redirects)
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab("live")}
                          className="text-xs text-brand-white hover:underline flex items-center space-x-1"
                        >
                          <span>Ver auditoria detalhada</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-xs">
                          <thead>
                            <tr className="border-b border-brand-border text-brand-muted text-[10px] sm:text-[11px]">
                              <th className="pb-2.5 font-medium">TIMESTAMP</th>
                              <th className="pb-2.5 font-medium">ASN & REDE</th>
                              <th className="pb-2.5 font-medium">ORIGEM</th>
                              <th className="pb-2.5 font-medium">CAMADA ATIVADA</th>
                              <th className="pb-2.5 font-medium">RISCO</th>
                              <th className="pb-2.5 text-right font-medium">ENTREGA</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-borderSubtle">
                            {events.slice(0, 6).map((evt) => (
                              <tr
                                key={evt.id}
                                onClick={() => setSelectedEvent(evt)}
                                className="hover:bg-brand-hover/50 transition cursor-pointer"
                              >
                                <td className="py-2.5 text-brand-secondary font-mono">
                                  {new Date(evt.timestamp).toLocaleTimeString()}
                                </td>
                                <td className="py-2.5 text-brand-white">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-brand-hover border border-brand-border">
                                      AS{evt.asn || "---"}
                                    </span>
                                    <span className="truncate max-w-[140px] text-brand-secondary">
                                      {evt.asnOrg || "Provedor Residencial"}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-2.5 text-brand-secondary">
                                  {evt.city}, {evt.countryCode}
                                </td>
                                <td className="py-2.5">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-surface border border-brand-border text-brand-white">
                                    {evt.detectedLayer === "asn_datacenter"
                                      ? "ASN Datacenter"
                                      : evt.detectedLayer === "platform_token"
                                      ? "Token fbclid"
                                      : evt.detectedLayer === "threat_intelligence"
                                      ? "Threat Intel"
                                      : evt.detectedLayer === "geo_fencing"
                                      ? "Geo-Fence"
                                      : evt.detectedLayer === "bot_pattern"
                                      ? "Crawler Bot"
                                      : "Humano Real"}
                                  </span>
                                </td>
                                <td className="py-2.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                      evt.riskScore > 70
                                        ? "bg-neutral-900 text-white border border-neutral-700"
                                        : evt.riskScore > 35
                                        ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                                        : "text-brand-secondary"
                                    }`}
                                  >
                                    {evt.riskScore}/100
                                  </span>
                                </td>
                                <td className="py-2.5 text-right">
                                  <span
                                    className={`text-[11px] font-semibold ${
                                      evt.isThreat ? "text-neutral-400" : "text-brand-white"
                                    }`}
                                  >
                                    {evt.isThreat ? "200 Safe Page" : "200 Proxy Oferta"}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* ========================================================= */}
                {/* TAB 2: MOTOR CLOAKILIOSHIELD 6 CAMADAS                   */}
                {/* ========================================================= */}
                {activeTab === "layers" && (
                  <div className="space-y-6">
                    {/* Header Summary Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-brand-white mb-1">
                          <ShieldCheck className="w-4 h-4 text-brand-white" />
                          <span className="font-bold">ARQUITETURA DETERMINÍSTICA DE 6 CAMADAS</span>
                        </div>
                        <p className="text-xs text-brand-secondary max-w-2xl leading-relaxed">
                          Cada requisição que atinge seu domínio na borda Cloudflare é avaliada sequencialmente
                          por 6 camadas em menos de 14ms. Moderadores, robôs e spy tools são direcionados à Whitepage
                          sem disparar redirecionamentos 301/302.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="px-3 py-1 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold text-xs font-mono">
                          STATUS: 6/6 ATIVAS
                        </span>
                      </div>
                    </div>

                    {/* 6 Layers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Layer 1 */}
                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-borderHighlight transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-white font-bold border border-brand-border">
                              CAMADA 1
                            </span>
                            <span className="text-[10px] font-mono text-brand-white flex items-center space-x-1">
                              <Check className="w-3 h-3 text-brand-white" />
                              <span>Ativo</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-brand-white mb-1 flex items-center space-x-1.5">
                            <Globe2 className="w-4 h-4 text-brand-white" />
                            <span>Geo-Fencing de Borda</span>
                          </h4>
                          <p className="text-xs text-brand-secondary leading-relaxed mt-1.5">
                            Validação direta via cabeçalho <span className="font-mono text-brand-white">cf-ipcountry</span>.
                            Restringe acessos a compradores dos países alvo (ex: Brasil). Qualquer país divergente é mitigado.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-brand-borderSubtle text-[11px] font-mono text-brand-muted">
                          Filtro: [BR] Prioritário
                        </div>
                      </div>

                      {/* Layer 2 */}
                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-borderHighlight transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-white font-bold border border-brand-border">
                              CAMADA 2
                            </span>
                            <span className="text-[10px] font-mono text-brand-white flex items-center space-x-1">
                              <Check className="w-3 h-3 text-brand-white" />
                              <span>Ativo</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-brand-white mb-1 flex items-center space-x-1.5">
                            <Cpu className="w-4 h-4 text-brand-white" />
                            <span>Blacklist ASN Datacenters</span>
                          </h4>
                          <p className="text-xs text-brand-secondary leading-relaxed mt-1.5">
                            Blacklist em memória dos Autonomous System Numbers de servidores:
                            Meta (<span className="font-mono text-brand-white">AS32934</span>), Google, AWS, Hetzner,
                            DigitalOcean e spy tools (AdPlexity).
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-brand-borderSubtle text-[11px] font-mono text-brand-muted">
                          14 Redes ASN Monitoradas
                        </div>
                      </div>

                      {/* Layer 3 */}
                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-borderHighlight transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-white font-bold border border-brand-border">
                              CAMADA 3
                            </span>
                            <span className="text-[10px] font-mono text-brand-white flex items-center space-x-1">
                              <Check className="w-3 h-3 text-brand-white" />
                              <span>Ativo</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-brand-white mb-1 flex items-center space-x-1.5">
                            <Fingerprint className="w-4 h-4 text-brand-white" />
                            <span>Validação de Tokens Meta Ads</span>
                          </h4>
                          <p className="text-xs text-brand-secondary leading-relaxed mt-1.5">
                            Exigência estrita de parâmetro de clique oficial (<span className="font-mono text-brand-white">fbclid</span>)
                            ou UTMs de anúncio. Robôs ou acessos diretos sem token são roteados à Whitepage.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-brand-borderSubtle text-[11px] font-mono text-brand-muted">
                          Parâmetros: fbclid + utm_campaign
                        </div>
                      </div>

                      {/* Layer 4 */}
                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-borderHighlight transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-white font-bold border border-brand-border">
                              CAMADA 4
                            </span>
                            <span className="text-[10px] font-mono text-brand-white flex items-center space-x-1">
                              <Check className="w-3 h-3 text-brand-white" />
                              <span>Ativo</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-brand-white mb-1 flex items-center space-x-1.5">
                            <Zap className="w-4 h-4 text-brand-white" />
                            <span>Client Hints & Sec-CH-UA</span>
                          </h4>
                          <p className="text-xs text-brand-secondary leading-relaxed mt-1.5">
                            Inspeção de cabeçalhos modernos de navegadores (<span className="font-mono text-brand-white">sec-ch-ua-mobile</span>)
                            e análise de integridade para bloquear scrapers automatizados e crawlers emulados.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-brand-borderSubtle text-[11px] font-mono text-brand-muted">
                          Detecção de Emulação: Ativa
                        </div>
                      </div>

                      {/* Layer 5 */}
                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-borderHighlight transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-white font-bold border border-brand-border">
                              CAMADA 5
                            </span>
                            <span className="text-[10px] font-mono text-brand-white flex items-center space-x-1">
                              <Check className="w-3 h-3 text-brand-white" />
                              <span>Ativo</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-brand-white mb-1 flex items-center space-x-1.5">
                            <Lock className="w-4 h-4 text-brand-white" />
                            <span>Threat Intel (ProxyCheck.io)</span>
                          </h4>
                          <p className="text-xs text-brand-secondary leading-relaxed mt-1.5">
                            Consulta em milissegundos com fallback gracioso resiliente. Identifica redes Tor,
                            VPNs comerciais, proxies residenciais de crawlers e nós de saída suspeitos.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-brand-borderSubtle text-[11px] font-mono text-brand-muted">
                          Score de Risco Máximo: 70
                        </div>
                      </div>

                      {/* Layer 6 */}
                      <div className="p-4 rounded-xl bg-brand-surface border border-brand-border hover:border-brand-borderHighlight transition flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-white font-bold border border-brand-border">
                              CAMADA 6
                            </span>
                            <span className="text-[10px] font-mono text-brand-white flex items-center space-x-1">
                              <Check className="w-3 h-3 text-brand-white" />
                              <span>Ativo</span>
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-brand-white mb-1 flex items-center space-x-1.5">
                            <Laptop className="w-4 h-4 text-brand-white" />
                            <span>GPU WebGL & Anti-Headless</span>
                          </h4>
                          <p className="text-xs text-brand-secondary leading-relaxed mt-1.5">
                            Telemetria client-side de hardware (Camada 7). Detecta renderizadores virtuais
                            (<span className="font-mono text-brand-white">SwiftShader</span>, <span className="font-mono text-brand-white">llvmpipe</span>),
                            ambientes headless e Canvas Hash.
                          </p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-brand-borderSubtle text-[11px] font-mono text-brand-muted">
                          Anti-SwiftShader & Anti-Webdriver
                        </div>
                      </div>
                    </div>

                    {/* Interactive GPU WebGL Inspector Card */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div>
                          <h4 className="text-sm font-bold text-brand-white flex items-center space-x-2">
                            <Laptop className="w-4 h-4 text-brand-white" />
                            <span>Simulador Interativo: Auditoria de Hardware do Seu Navegador</span>
                          </h4>
                          <p className="text-xs text-brand-secondary mt-0.5">
                            Execute um teste ao vivo do seu renderizador de GPU e veja como a Camada 6 avalia seu dispositivo.
                          </p>
                        </div>

                        <button
                          onClick={handleInspectLocalGPU}
                          className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold text-xs transition shadow-sm flex items-center space-x-1.5 shrink-0"
                        >
                          <Zap className="w-3.5 h-3.5 text-white dark:text-black" />
                          <span>Auditar Meu Navegador</span>
                        </button>
                      </div>

                      {clientGpuAudit ? (
                        <div className="p-4 rounded-xl bg-brand-hover/40 border border-brand-border grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
                          <div>
                            <div className="text-brand-muted text-[10px]">RENDERIZADOR WEBGL</div>
                            <div className="text-brand-white font-semibold truncate mt-0.5">
                              {clientGpuAudit.renderer}
                            </div>
                          </div>
                          <div>
                            <div className="text-brand-muted text-[10px]">FABRICANTE GPU</div>
                            <div className="text-brand-white font-semibold truncate mt-0.5">
                              {clientGpuAudit.vendor}
                            </div>
                          </div>
                          <div>
                            <div className="text-brand-muted text-[10px]">CORES DE CPU</div>
                            <div className="text-brand-white font-semibold mt-0.5">
                              {clientGpuAudit.concurrency} threads físicas
                            </div>
                          </div>
                          <div>
                            <div className="text-brand-muted text-[10px]">VEREDITO CAMADA 6</div>
                            <div className="text-brand-white font-semibold mt-0.5 flex items-center space-x-1">
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              <span>{clientGpuAudit.verdict === "clean" ? "Humano Físico (200 OK)" : "Virtual / Headless"}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 text-xs text-brand-secondary border border-dashed border-brand-borderSubtle rounded-xl">
                          Clique em &quot;Auditar Meu Navegador&quot; para extrair sua GPU WebGL e simular a Camada 6.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* TAB 3: CLOUDFLARE WORKER COMPILER                        */}
                {/* ========================================================= */}
                {activeTab === "worker" && (
                  <div className="space-y-6">
                    {/* Header info */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-brand-surface border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-brand-white mb-1">
                          <FileCode className="w-4 h-4 text-brand-white" />
                          <span className="font-bold">COMPILADOR DE BORDA CLOUDFLARE WORKER</span>
                        </div>
                        <p className="text-xs text-brand-secondary max-w-2xl leading-relaxed">
                          Código JavaScript puro compilado na hora com as regras da sua operação. Roda na rede
                          anycast global da Cloudflare com isolamento de threads, latência inferior a 14ms e zero dependências.
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleCopyWorker}
                          className="px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center space-x-1.5"
                        >
                          {copiedWorker ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-white dark:text-black" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-white dark:text-black" />
                              <span>Copiar Worker</span>
                            </>
                          )}
                        </button>
                        <a
                          href="/api/v1/worker?download=1"
                          download="cloudflare-worker.js"
                          className="px-4 py-2 rounded-xl bg-brand-surface border border-brand-border text-brand-white font-medium text-xs hover:bg-brand-hover transition flex items-center space-x-1.5"
                        >
                          <span>Baixar .js</span>
                        </a>
                      </div>
                    </div>

                    {/* Code Display Area */}
                    <div className="rounded-2xl bg-[#0d0d0d] border border-brand-border overflow-hidden">
                      <div className="h-10 bg-neutral-950 border-b border-brand-border/60 px-4 flex items-center justify-between text-xs font-mono text-brand-secondary">
                        <span className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-white/60" />
                          <span>cloudflare-worker.js (ESM Runtime • V8 Isolate)</span>
                        </span>
                        <span>{generatedWorkerScript.split("\n").length} linhas compiladas</span>
                      </div>
                      <div className="p-4 max-h-[380px] overflow-y-auto font-mono text-[11px] text-neutral-300 leading-relaxed custom-scrollbar selection:bg-white/20">
                        <pre>
                          <code>{generatedWorkerScript}</code>
                        </pre>
                      </div>
                    </div>

                    {/* 3 Steps Guide */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border">
                        <div className="font-mono text-brand-white font-bold mb-1">1. Criar Worker</div>
                        <p className="text-brand-secondary leading-snug">
                          Acesse Cloudflare Dashboard &gt; Workers &amp; Pages &gt; Create Application.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border">
                        <div className="font-mono text-brand-white font-bold mb-1">2. Colar Código</div>
                        <p className="text-brand-secondary leading-snug">
                          Abra o Quick Edit e substitua todo o código com o script gerado pelo Phantom-X.
                        </p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-brand-surface border border-brand-border">
                        <div className="font-mono text-brand-white font-bold mb-1">3. Salvar e Deploy</div>
                        <p className="text-brand-secondary leading-snug">
                          Clique em &quot;Deploy&quot; e vincule sua rota de domínio personalizado. Operação ativa!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* TAB 4: AUDITORIA EM TEMPO REAL (DEEP LIVE STREAM)         */}
                {/* ========================================================= */}
                {activeTab === "live" && (
                  <div className="space-y-5">
                    {/* Live HUD info */}
                    <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        <div>
                          <div className="font-bold text-brand-white">STREAM DE AUDITORIA CONTÍNUA NA BORDA</div>
                          <div className="text-[11px] text-brand-secondary">
                            Clique em qualquer requisição para inspecionar os cabeçalhos e a análise das 6 camadas
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-hover border border-brand-border text-brand-white">
                        {events.length} Eventos em Buffer
                      </span>
                    </div>

                    {/* Detailed Table */}
                    <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-sm overflow-x-auto">
                      <table className="w-full text-left font-sans text-xs">
                        <thead>
                          <tr className="border-b border-brand-border text-brand-muted text-[10px] sm:text-[11px]">
                            <th className="pb-3 font-medium">TIMESTAMP</th>
                            <th className="pb-3 font-medium">DOMÍNIO</th>
                            <th className="pb-3 font-medium">ASN & REDE</th>
                            <th className="pb-3 font-medium">ORIGEM</th>
                            <th className="pb-3 font-medium">CAMADA DETECTADA</th>
                            <th className="pb-3 font-medium">GPU WEBGL</th>
                            <th className="pb-3 font-medium">RISCO</th>
                            <th className="pb-3 text-right font-medium">ENTREGA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-borderSubtle">
                          {events.map((evt) => (
                            <tr
                              key={evt.id}
                              onClick={() => setSelectedEvent(evt)}
                              className="hover:bg-brand-hover/60 transition cursor-pointer group"
                            >
                              <td className="py-2.5 text-brand-secondary font-mono">
                                {new Date(evt.timestamp).toLocaleTimeString()}
                              </td>
                              <td className="py-2.5 text-brand-white font-medium">{evt.domain}</td>
                              <td className="py-2.5">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-brand-hover text-brand-white border border-brand-border">
                                    AS{evt.asn || "---"}
                                  </span>
                                  <span className="truncate max-w-[120px] text-brand-secondary">
                                    {evt.asnOrg || "Residencial"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-2.5 text-brand-secondary">
                                {evt.city}, {evt.countryCode}
                              </td>
                              <td className="py-2.5">
                                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-surface border border-brand-border text-brand-white">
                                  {evt.detectedLayer === "asn_datacenter"
                                    ? "ASN Datacenter"
                                    : evt.detectedLayer === "platform_token"
                                    ? "Token fbclid"
                                    : evt.detectedLayer === "threat_intelligence"
                                    ? "Threat Intel"
                                    : evt.detectedLayer === "geo_fencing"
                                    ? "Geo-Fence"
                                    : evt.detectedLayer === "bot_pattern"
                                    ? "Crawler Bot"
                                    : "Humano Real"}
                                </span>
                              </td>
                              <td className="py-2.5 text-brand-secondary font-mono text-[11px] truncate max-w-[110px]">
                                {evt.webglRenderer || "Apple M2"}
                              </td>
                              <td className="py-2.5">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    evt.riskScore > 70
                                      ? "bg-neutral-900 text-white border border-neutral-700"
                                      : evt.riskScore > 35
                                      ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                                      : "text-brand-secondary"
                                  }`}
                                >
                                  {evt.riskScore}/100
                                </span>
                              </td>
                              <td className="py-2.5 text-right">
                                <span
                                  className={`text-[11px] font-semibold ${
                                    evt.isThreat ? "text-neutral-400" : "text-brand-white"
                                  }`}
                                >
                                  {evt.isThreat ? "200 Safe Page" : "200 Proxy Oferta"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Bottom Call to Action inside Console */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-secondary border-t border-brand-borderSubtle">
                  <span>
                    Status Operacional: 100% dos nós ativos • Modo Atual:{" "}
                    <strong className="text-brand-white font-mono">{cloakerMode}</strong>
                  </span>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center space-x-1.5"
                  >
                    <span>Entrar no Painel Completo</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white dark:text-black" />
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TECHNICAL AUDIT SLIDE-IN MODAL / DRAWER                                   */}
      {/* ========================================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-brand-surface border border-brand-border rounded-2xl shadow-2xl overflow-hidden font-sans">
            {/* Header */}
            <div className="px-5 py-4 border-b border-brand-border flex items-center justify-between bg-neutral-950">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-brand-white" />
                <div>
                  <h3 className="text-sm font-bold text-brand-white">Auditoria Técnica de Borda</h3>
                  <p className="text-[11px] font-mono text-brand-muted">
                    Click ID: {selectedEvent.clickId || selectedEvent.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg text-brand-secondary hover:text-brand-white hover:bg-brand-hover transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs font-mono">
              {/* Verdict Banner */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  selectedEvent.isThreat
                    ? "bg-neutral-900/60 border-neutral-700 text-neutral-200"
                    : "bg-brand-hover/60 border-brand-border text-brand-white"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  {selectedEvent.isThreat ? (
                    <ShieldAlert className="w-4 h-4 text-neutral-300" />
                  ) : (
                    <Check className="w-4 h-4 text-brand-white" />
                  )}
                  <div>
                    <div className="font-bold">
                      {selectedEvent.isThreat
                        ? "MITIGADO PARA WHITEPAGE (HTTP 200)"
                        : "LIBERADO PARA OFERTA VIA PROXY REVERSO (HTTP 200)"}
                    </div>
                    <div className="text-[10px] text-brand-secondary font-sans mt-0.5">
                      {selectedEvent.isThreat
                        ? "Moderador/robô detectado. Zero redirecionamentos 301/302 disparados."
                        : "Visitante real com hardware físico validado. Parâmetros preservados intactos."}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold">{selectedEvent.riskScore}/100</span>
                  <div className="text-[9px] text-brand-muted uppercase">Risco</div>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-brand-black/60 border border-brand-border text-[11px]">
                <div>
                  <span className="text-brand-muted text-[10px]">ASN & REDE:</span>
                  <div className="text-brand-white font-semibold">AS{selectedEvent.asn}</div>
                  <div className="text-[10px] text-brand-secondary truncate">{selectedEvent.asnOrg}</div>
                </div>
                <div>
                  <span className="text-brand-muted text-[10px]">ORIGEM GEO:</span>
                  <div className="text-brand-white font-semibold">
                    {selectedEvent.city}, {selectedEvent.countryCode}
                  </div>
                  <div className="text-[10px] text-brand-secondary">{selectedEvent.country}</div>
                </div>
                <div>
                  <span className="text-brand-muted text-[10px]">LATÊNCIA DE BORDA:</span>
                  <div className="text-brand-white font-semibold">{selectedEvent.latencyMs}ms</div>
                  <div className="text-[10px] text-brand-secondary">Edge Cloudflare</div>
                </div>
                <div>
                  <span className="text-brand-muted text-[10px]">DISPOSITIVO:</span>
                  <div className="text-brand-white font-semibold capitalize">{selectedEvent.device}</div>
                  <div className="text-[10px] text-brand-secondary truncate">{selectedEvent.os}</div>
                </div>
                <div>
                  <span className="text-brand-muted text-[10px]">GPU WEBGL:</span>
                  <div className="text-brand-white font-semibold truncate">
                    {selectedEvent.webglRenderer || "Apple GPU"}
                  </div>
                  <div className="text-[10px] text-brand-secondary">
                    Headless: {selectedEvent.isHeadless ? "SIM (Emulado)" : "NÃO (Físico)"}
                  </div>
                </div>
                <div>
                  <span className="text-brand-muted text-[10px]">CAMADA ATIVADA:</span>
                  <div className="text-brand-white font-semibold capitalize">
                    {selectedEvent.detectedLayer}
                  </div>
                  <div className="text-[10px] text-brand-secondary">Decisão Determinística</div>
                </div>
              </div>

              {/* Reasons if threat */}
              {selectedEvent.threatReasons && selectedEvent.threatReasons.length > 0 && (
                <div>
                  <span className="text-brand-muted text-[10px] uppercase">Gatilhos de Moderação Acionados:</span>
                  <ul className="mt-1 space-y-1 text-neutral-300">
                    {selectedEvent.threatReasons.map((r, i) => (
                      <li key={i} className="flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Response Headers */}
              <div>
                <span className="text-brand-muted text-[10px] uppercase">Cabeçalhos de Resposta Injetados:</span>
                <div className="p-3 mt-1 rounded-xl bg-neutral-950 border border-brand-border text-[10px] text-neutral-300 space-y-1">
                  <div>
                    <span className="text-brand-muted">HTTP/1.1</span>{" "}
                    <span className="text-brand-white font-bold">200 OK</span>
                  </div>
                  <div>
                    <span className="text-brand-muted">Cache-Control:</span> no-store, no-cache, must-revalidate,
                    private
                  </div>
                  <div>
                    <span className="text-brand-muted">X-Robots-Tag:</span> noindex, nofollow, noarchive
                  </div>
                  <div>
                    <span className="text-brand-muted">X-Delivery-Type:</span>{" "}
                    {selectedEvent.isThreat ? "whitepage-compliance" : "reverse-proxy-200"}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-brand-border flex items-center justify-between bg-neutral-950">
              <span className="text-[10px] text-brand-muted">Zero Footprint Ativo</span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition"
              >
                Fechar Auditoria
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
