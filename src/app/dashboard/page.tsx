"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/Header";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { DigitalMatrixWorldMap } from "@/components/dashboard/DigitalMatrixWorldMap";
import { TrafficCharts } from "@/components/dashboard/TrafficCharts";
import { store } from "@/lib/store";
import { TrafficEvent, GeoAggregate, MetricOverview } from "@/types";
import { getCountryFlag, LocationBadge } from "@/lib/geoFlags";
import {
  Activity,
  RefreshCw,
  Send,
  Radio,
  Globe2,
  PlusCircle,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
} from "lucide-react";

export default function DashboardOverview() {
  const [selectedDomain, setSelectedDomain] = useState("Todos os Domínios");
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<MetricOverview>(store.getOverviewMetrics());
  const [geoData, setGeoData] = useState<GeoAggregate[]>(store.getGeoDistribution());
  const [timeSeries, setTimeSeries] = useState(store.getTimeSeries(24));
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [availableDomains, setAvailableDomains] = useState<string[]>(["Todos os Domínios"]);

  const loadData = () => {
    setMetrics(store.getOverviewMetrics());
    setGeoData(store.getGeoDistribution());
    setTimeSeries(store.getTimeSeries(24));
    setEvents(
      store.getEvents({
        limit: 10,
        domain: selectedDomain === "Todos os Domínios" ? undefined : selectedDomain,
        country: selectedCountry || undefined,
      })
    );
    const userDomains = store.getDomains().map((d) => d.name);
    setAvailableDomains(["Todos os Domínios", ...userDomains]);
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
      store.generateRandomSimulatedEvent();
      loadData();
    } catch {}
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black font-sans">
      <Header
        title="Visão Geral da Operação"
        subtitle="Monitoramento unificado de borda, telemetria global e análise de risco"
        domains={availableDomains}
        selectedDomain={selectedDomain}
        onSelectDomain={setSelectedDomain}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-[1600px] w-full mx-auto">
        {/* 
          ======================================================================
          1. IMMERSIVE MAIN BANNER: DIGITAL MATRIX WORLD MAP
          "o mapa tem que ser estendido de forma imersiva como banner principal"
          ======================================================================
        */}
        <div className="relative w-full h-[480px] sm:h-[540px] lg:h-[620px] rounded-2xl bg-brand-surface border border-brand-border overflow-hidden shadow-sm flex flex-col">
          {/* Panoramic Map Header Floating Overlay */}
          <div className="absolute top-0 inset-x-0 z-20 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
            {/* Title & Live Badge */}
            <div className="flex items-center space-x-3 pointer-events-auto">
              <div className="flex items-center space-x-2 bg-brand-surface/90 backdrop-blur-md border border-brand-border px-3 py-1.5 rounded-lg text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white animate-pulse" />
                <span className="text-brand-white font-semibold tracking-wider">MATRIZ DE TELEMETRIA GLOBAL</span>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-[11px] text-brand-muted font-mono bg-brand-surface/60 px-2.5 py-1 rounded-md border border-brand-border/60">
                <span>14 PoPs operacionais</span>
                <span>•</span>
                <span>&lt; 18ms latência de borda</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center space-x-2 pointer-events-auto">
              {selectedCountry && (
                <div className="flex items-center space-x-1.5 bg-brand-surface border border-brand-border px-2.5 py-1 rounded-lg text-xs font-mono text-brand-white">
                  <span className="text-sm select-none">{getCountryFlag(selectedCountry)}</span>
                  <span>Filtrando: [{selectedCountry}]</span>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="text-brand-muted hover:text-brand-white ml-1"
                  >
                    ✕
                  </button>
                </div>
              )}

              <button
                onClick={handleSimulateBurst}
                className="hover:bg-brand-hover text-white flex items-center space-x-1.5 text-xs bg-brand-surface px-3 py-1.5 rounded-lg border border-brand-border transition font-medium shadow-glow-sm"
                title="Injetar requisição de teste para ativar nós em tempo real"
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Simular Requisição</span>
              </button>

              <button
                onClick={loadData}
                className="hover:bg-brand-hover hover:text-white p-2 rounded-lg bg-brand-surface border border-brand-border text-brand-secondary transition"
                title="Recarregar dados"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Full Panoramic Map Canvas */}
          <div className="flex-1 w-full h-full relative">
            <DigitalMatrixWorldMap
              events={events}
              geoData={geoData}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* 
          ======================================================================
          2. METRIC CARDS ROW (5 COLUMNS BELOW IMMERSIVE BANNER)
          ======================================================================
        */}
        <div>
          <MetricCards metrics={metrics} layout="row" />
        </div>

        {/* 
          ======================================================================
          3. ONBOARDING / ZERO-STATE GUIDANCE (SHOWN WHEN totalEvents === 0)
          ======================================================================
        */}
        {metrics.totalEvents === 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-2 text-xs font-mono text-brand-secondary">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>AMBIENTE DE BORDA INICIALIZADO</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Sua conta Phantom-X está ativa e pronta para receber tráfego
                </h3>
                <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                  Os contadores acima começam em zero e serão atualizados em tempo real assim que suas campanhas receberem requisições de usuários ou crawlers.
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <Link
                  href="/dashboard/domains"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-glow-sm"
                >
                  <Globe2 className="w-4 h-4" />
                  <span>Conectar Domínio</span>
                </Link>

                <Link
                  href="/dashboard/campaigns"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-surface text-white border border-brand-border font-medium text-xs hover:bg-brand-hover transition"
                >
                  <Layers className="w-4 h-4 text-brand-secondary" />
                  <span>Criar Campanha</span>
                </Link>

                <button
                  onClick={handleSimulateBurst}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-surface text-brand-secondary border border-brand-border font-medium text-xs hover:text-white hover:bg-brand-hover transition"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>Testar Requisição</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 
          ======================================================================
          4. TRAFFIC ANALYTICAL CHARTS (HISTOGRAM & GEO BREAKDOWN)
          ======================================================================
        */}
        <TrafficCharts
          timeSeries={timeSeries}
          geoData={geoData}
          deviceStats={store.getDeviceStats()}
        />

        {/* 
          ======================================================================
          5. LIVE FEED TABLE (RECENT TRAFFIC ACTIVITY)
          ======================================================================
        */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-brand-white tracking-wide flex items-center space-x-2">
                <Activity className="w-4 h-4 text-brand-white" />
                <span>Atividade Recente de Tráfego</span>
              </h3>
              <p className="text-xs text-brand-secondary mt-0.5">
                Requisições processadas nos nós de borda com análise de risco e latência em tempo real
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-brand-muted">
              <span>{events.length} eventos no buffer</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-[11px]">
                  <th className="pb-2.5 font-medium">TIMESTAMP</th>
                  <th className="pb-2.5 font-medium">DOMÍNIO</th>
                  <th className="pb-2.5 font-medium">CAMPANHA</th>
                  <th className="pb-2.5 font-medium">LOCALIZAÇÃO</th>
                  <th className="pb-2.5 font-medium">IP (MASCARADO)</th>
                  <th className="pb-2.5 font-medium">DISPOSITIVO</th>
                  <th className="pb-2.5 font-medium">RISCO</th>
                  <th className="pb-2.5 text-right font-medium">AÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-borderSubtle">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-brand-secondary">
                        <Activity className="w-7 h-7 text-brand-muted" />
                        <div className="text-brand-white font-medium text-xs">
                          Nenhum evento registrado ainda
                        </div>
                        <div className="text-[11px] text-brand-muted max-w-sm">
                          Conecte um domínio ou clique em &ldquo;Simular Requisição&rdquo; acima para testar o fluxo de borda.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-brand-hover/40 transition">
                      <td className="py-3 text-brand-secondary font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 text-brand-white font-medium">{evt.domain}</td>
                      <td className="py-3 text-brand-secondary truncate max-w-[150px]">
                        {evt.campaignName || "Acesso Direto"}
                      </td>
                      <td className="py-3 text-brand-white">
                        <LocationBadge
                          countryCode={evt.countryCode}
                          cityName={evt.city}
                          stateCode={evt.stateCode}
                          stateName={evt.state}
                        />
                      </td>
                      <td className="py-3 text-brand-muted font-mono">{evt.ipMasked}</td>
                      <td className="py-3 text-brand-secondary">{evt.device}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            evt.riskScore > 70
                              ? "bg-neutral-900 text-white border border-neutral-700"
                              : evt.riskScore > 35
                              ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                              : "text-brand-secondary"
                          }`}
                        >
                          {evt.riskScore} / 100
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {evt.decision === "routed_offer" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-900 text-white dark:bg-white/10 dark:text-white border border-neutral-700 dark:border-white/20">
                            OFERTA
                          </span>
                        ) : evt.decision === "mitigated_safe" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-200 border border-neutral-700">
                            SAFE PAGE
                          </span>
                        ) : evt.decision === "blocked" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-950 text-neutral-500 border border-neutral-900">
                            BLOQUEADO
                          </span>
                        ) : (
                          <span
                            className={`text-[11px] font-semibold ${
                              evt.isThreat ? "text-neutral-400" : "text-white"
                            }`}
                          >
                            {evt.isThreat ? "SAFE PAGE" : "OFERTA"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
