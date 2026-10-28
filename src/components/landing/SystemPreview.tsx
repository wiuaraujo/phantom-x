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
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { MetricCards } from "../dashboard/MetricCards";
import { DigitalMatrixWorldMap } from "../dashboard/DigitalMatrixWorldMap";
import { TrafficCharts } from "../dashboard/TrafficCharts";
import { store } from "@/lib/store";
import { TrafficEvent, GeoAggregate, MetricOverview } from "@/types";

export const SystemPreview: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState("Todos os Domínios");
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<MetricOverview>(store.getDemoOverviewMetrics());
  const [geoData, setGeoData] = useState<GeoAggregate[]>(store.getDemoGeoDistribution());
  const [timeSeries, setTimeSeries] = useState(store.getDemoTimeSeries(24));
  const [events, setEvents] = useState<TrafficEvent[]>(store.getDemoEvents(7));

  const loadData = () => {
    setMetrics(store.getDemoOverviewMetrics());
    setGeoData(store.getDemoGeoDistribution());
    setTimeSeries(store.getDemoTimeSeries(24));
    setEvents(store.getDemoEvents(7));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedDomain, selectedCountry, selectedPeriod]);

  const handleSimulateBurst = async () => {
    try {
      await fetch("/api/v1/simulate", { method: "POST" });
      loadData();
    } catch {}
  };

  const navItems = [
    { label: "Visão Geral", icon: LayoutDashboard, active: true },
    { label: "Monitoramento Ao Vivo", icon: Radio, pulse: true },
    { label: "Mapa Global", icon: Globe },
    { label: "Campanhas", icon: Layers },
    { label: "Domínios", icon: Globe2 },
    { label: "Eventos", icon: ListFilter },
    { label: "Relatórios", icon: BarChart3 },
    { label: "Configurações", icon: Settings },
  ];

  return (
    <section id="how-it-works" className="relative py-20 px-4 sm:px-6 bg-brand-black overflow-hidden border-t border-brand-border">
      {/* Section Title (Minimalist, without AI shields or sparkles) */}
      <div className="max-w-4xl mx-auto text-center mb-12 flex flex-col items-center">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3 font-sans">
          Console Operacional
        </h2>
        <p className="max-w-2xl text-sm sm:text-base text-brand-secondary leading-relaxed font-sans font-normal">
          Interface real de monitoramento e telemetria global com roteamento na borda em milissegundos.
        </p>
      </div>

      {/* Realistic macOS Window Frame Hosting 100% of the Real Phantom-X Dashboard */}
      <div className="relative max-w-7xl mx-auto">
        {/* Monochromatic ambient glow behind window */}
        <div className="absolute -inset-4 bg-gradient-to-b from-white/5 via-neutral-900/30 to-transparent blur-3xl pointer-events-none rounded-3xl" />

        <div className="relative rounded-2xl bg-brand-black border border-brand-border shadow-glow-lg overflow-hidden font-sans">
          {/* 1. macOS Window Chrome Top Bar */}
          <div className="h-11 bg-[#0c0c0c] border-b border-brand-border px-4 flex items-center justify-between z-40">
            {/* macOS Window Controls */}
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>

            {/* Address Bar */}
            <div className="text-[11px] font-mono text-brand-secondary flex items-center space-x-1.5 bg-brand-surface/80 px-3.5 py-1 rounded-full border border-brand-border">
              <span className="text-brand-muted">https://</span>
              <span className="text-white font-medium">console.phantomx.pro/dashboard</span>
            </div>

            {/* Direct Link to Live Dashboard & Theme Toggle */}
            <div className="flex items-center space-x-2 text-xs font-sans">
              <ThemeToggle />
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition"
              >
                <span>Abrir Console</span>
                <Maximize2 className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* 2. REAL PHANTOM-X DASHBOARD: SIDEBAR + MAIN WORKSPACE */}
          <div className="flex flex-col md:flex-row min-h-[750px] bg-brand-black">
            {/* Real Dashboard Sidebar */}
            <aside className="w-full md:w-60 border-b md:border-b-0 md:border-r border-brand-border bg-brand-black/95 flex flex-col justify-between shrink-0">
              <div>
                {/* Brand Header */}
                <div className="h-14 flex items-center px-4 border-b border-brand-border space-x-3">
                  <Logo size={26} />
                  <span className="font-sans text-sm font-bold text-white tracking-wider">
                    Phantom-X
                  </span>
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-mono bg-brand-surface border border-brand-border text-brand-muted">
                    v2.4
                  </span>
                </div>

                {/* Real Navigation Menu */}
                <nav className="p-3 space-y-1">
                  {navItems.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium transition cursor-default select-none ${
                          item.active
                            ? "bg-white text-black font-semibold shadow-glow-sm"
                            : "text-brand-secondary hover:text-white hover:bg-brand-surface"
                        }`}
                      >
                        <div className="relative shrink-0 mr-3">
                          <Icon className={`w-4 h-4 ${item.active ? "text-black" : "text-brand-secondary"}`} />
                          {item.pulse && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-ping" />
                          )}
                        </div>
                        <span className="truncate">{item.label}</span>
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Sidebar Bottom Status */}
              <div className="p-3 border-t border-brand-border space-y-2">
                <div className="px-3 py-2 rounded-lg bg-brand-surface border border-brand-borderSubtle text-[11px] font-sans">
                  <div className="text-brand-muted text-[10px] font-mono uppercase tracking-wider">Cluster de Borda</div>
                  <div className="text-white font-medium flex items-center space-x-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>edge-phantom-01</span>
                  </div>
                  <div className="text-[10px] text-brand-secondary mt-1">14 PoPs operacionais</div>
                </div>
              </div>
            </aside>

            {/* Real Dashboard Main Content View */}
            <main className="flex-1 flex flex-col min-w-0 bg-brand-black overflow-hidden">
              {/* Top Header of the Dashboard */}
              <div className="h-14 border-b border-brand-border bg-brand-surface/40 px-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="text-sm font-semibold text-white tracking-wide">
                    Visão Geral da Operação
                  </h1>
                  <p className="text-[11px] text-brand-secondary">
                    Monitoramento unificado de borda, telemetria e análise de risco
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-xs font-sans">
                  {/* Real Live Indicator */}
                  <div className="hidden sm:flex items-center space-x-1.5 bg-brand-surface border border-brand-border px-2 py-1 rounded text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-white font-bold">LIVE</span>
                    <span className="text-brand-muted">|</span>
                    <span className="text-brand-secondary font-mono">&lt; 18ms</span>
                  </div>

                  {/* Domain Selector */}
                  <div className="px-2.5 py-1 rounded bg-brand-surface border border-brand-border text-white text-[11px] flex items-center space-x-1.5">
                    <span className="truncate max-w-[120px]">{selectedDomain}</span>
                    <ChevronDown className="w-3 h-3 text-brand-secondary" />
                  </div>

                  {/* Simulate Test Request Button */}
                  <button
                    onClick={handleSimulateBurst}
                    className="hover:bg-brand-hover flex items-center space-x-1 text-[11px] bg-brand-surface px-2.5 py-1 rounded-lg border border-brand-border text-white transition font-medium"
                    title="Injetar evento de tráfego teste no cluster"
                  >
                    <Send className="w-3 h-3 text-white" />
                    <span className="hidden sm:inline">Simular</span>
                  </button>

                  <button
                    onClick={loadData}
                    className="p-1 rounded bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-secondary hover:text-white transition"
                    title="Atualizar dados"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Body Content with 2-Column Hero: Metrics Left + Stretched Map Right */}
              <div className="p-5 space-y-6 overflow-y-auto max-h-[720px] custom-scrollbar">
                {/* 2-Column Hero Fold */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                  {/* Left Column: Metrics Compact */}
                  <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between gap-3">
                    <div className="flex-1">
                      <MetricCards metrics={metrics} layout="compact" />
                    </div>

                    <div className="bg-gradient-to-r from-[#141414] via-[#0f0f0f] to-[#080808] border border-brand-border rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <div>
                          <div className="font-semibold text-white text-xs">Cluster Phantom-X</div>
                          <div className="text-[10px] text-brand-muted font-mono">14 PoPs operacionais • &lt; 18ms</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono bg-brand-surface border border-brand-border px-2 py-0.5 rounded text-white font-medium">
                        100% OPERACIONAL
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Digital Matrix World Map STRETCHED WIDE */}
                  <div className="lg:col-span-7 xl:col-span-8 flex flex-col bg-gradient-to-b from-[#141414] via-[#090909] to-[#000000] border border-brand-border rounded-2xl p-4 sm:p-5 shadow-glow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
                      <div className="flex items-center space-x-2 font-medium text-white">
                        <Radio className="w-3.5 h-3.5 text-white" />
                        <span className="tracking-wide text-xs">MATRIZ DE TELEMETRIA GLOBAL EM TEMPO REAL</span>
                      </div>
                      <span className="text-brand-muted text-[11px]">
                        {selectedCountry
                          ? `Filtro ativo: [${selectedCountry}]`
                          : "Passe o cursor sobre os pontos ou clique"}
                      </span>
                    </div>

                    <div className="flex-1 w-full min-h-[340px] flex items-center justify-center">
                      <DigitalMatrixWorldMap
                        events={events}
                        geoData={geoData}
                        selectedCountry={selectedCountry}
                        onSelectCountry={setSelectedCountry}
                      />
                    </div>
                  </div>
                </div>

                {/* REAL TRAFFIC CHARTS */}
                <TrafficCharts timeSeries={timeSeries} geoData={geoData} />

                {/* REAL LIVE ACTIVITY FEED TABLE */}
                <div className="bg-gradient-to-b from-[#121212] to-[#080808] border border-brand-border rounded-xl p-4 sm:p-5 shadow-glow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-white tracking-wide flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-white" />
                        <span>Últimas Requisições Auditadas na Borda</span>
                      </h3>
                      <p className="text-[11px] text-brand-secondary mt-0.5">
                        Inspeção de fingerprint, reputação de IP e decisão de roteamento em milissegundos
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-brand-muted hidden sm:inline">
                      Buffer ativo: {events.length} eventos
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-sans text-xs">
                      <thead>
                        <tr className="border-b border-brand-border text-brand-muted text-[10px] sm:text-[11px]">
                          <th className="pb-2.5 font-medium">TIMESTAMP</th>
                          <th className="pb-2.5 font-medium">DOMÍNIO</th>
                          <th className="pb-2.5 font-medium">ORIGEM</th>
                          <th className="pb-2.5 font-medium">IP (MASCARADO)</th>
                          <th className="pb-2.5 font-medium">DISPOSITIVO</th>
                          <th className="pb-2.5 font-medium">SCORE DE RISCO</th>
                          <th className="pb-2.5 text-right font-medium">DECISÃO</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-borderSubtle">
                        {events.map((evt) => (
                          <tr key={evt.id} className="hover:bg-brand-hover/50 transition">
                            <td className="py-2.5 text-brand-secondary font-mono">
                              {new Date(evt.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="py-2.5 text-white font-medium">{evt.domain}</td>
                            <td className="py-2.5 text-brand-secondary">
                              {evt.city}, {evt.countryCode}
                            </td>
                            <td className="py-2.5 text-brand-muted font-mono">{evt.ipMasked}</td>
                            <td className="py-2.5 text-brand-secondary">{evt.device}</td>
                            <td className="py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  evt.riskScore > 70
                                    ? "bg-neutral-800 text-white border border-neutral-700"
                                    : evt.riskScore > 35
                                    ? "bg-neutral-900 text-brand-secondary border border-neutral-800"
                                    : "text-brand-secondary"
                                }`}
                              >
                                {evt.riskScore}/100
                              </span>
                            </td>
                            <td className="py-2.5 text-right">
                              <span
                                className={`text-[11px] font-semibold ${
                                  evt.isThreat ? "text-neutral-400" : "text-white"
                                }`}
                              >
                                {evt.isThreat ? "Mitigado (Safe)" : "Roteado (Oferta)"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Call to Action inside Console */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-secondary border-t border-brand-borderSubtle">
                  <span>Status Operacional: 100% dos nós ativos sem perda de pacotes</span>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition shadow-glow-sm flex items-center space-x-1.5"
                  >
                    <span>Entrar no Painel Completo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </section>
  );
};
