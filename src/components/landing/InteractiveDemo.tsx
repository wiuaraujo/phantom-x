"use client";

import React, { useState } from "react";
import { DigitalMatrixWorldMap } from "../dashboard/DigitalMatrixWorldMap";
import { TrafficCharts } from "../dashboard/TrafficCharts";
import { store } from "@/lib/store";
import { Filter, Activity } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export const InteractiveDemo: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("24h");

  const overview = store.getOverviewMetrics();
  const geoData = store.getGeoDistribution();
  const timeSeries = store.getTimeSeries(18);
  const recentEvents = store.getEvents({
    limit: 6,
    country: selectedCountry || undefined,
  });

  return (
    <section id="demo" className="py-24 px-6 bg-brand-black border-t border-brand-border">
      <div className="max-w-6xl mx-auto">
        {/* Section Header (Clean, professional, without generic AI sparkle badges) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-brand-white tracking-tight">
              {t.demo.title}
            </h2>
            <p className="text-sm text-brand-secondary mt-1">
              {t.demo.subtitle}
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3">
            <div className="px-3 py-1 rounded-md bg-brand-surface border border-brand-border text-[11px] font-mono text-brand-secondary flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-neutral-500" />
              <span>{t.demo.demoEnv}</span>
            </div>

            <Link
              href="/signup"
              className="px-4 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black text-xs font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm"
            >
              {t.demo.createAccount}
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Container with 100% Solid Black Background */}
        <div className="bg-black border border-brand-border rounded-2xl p-6 shadow-glow space-y-6">
          {/* Top Demo Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-brand-borderSubtle">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-xs font-mono text-white">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>NEXORA EDGE TELEMETRY</span>
              </div>
              <span className="text-brand-muted text-xs">|</span>
              <span className="text-xs text-brand-secondary font-mono">
                {overview.activeVisitors} visitantes simulados no cluster
              </span>
            </div>

            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="text-brand-muted text-[11px] flex items-center mr-1">
                <Filter className="w-3 h-3 mr-1" /> Período:
              </span>
              {["1h", "24h", "7d"].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-2.5 py-1 rounded transition ${
                    selectedPeriod === p
                      ? "bg-white text-black font-bold"
                      : "text-brand-secondary hover:text-white bg-brand-surface border border-brand-border"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Dotted World Map (100% Pure Black, Interactive Cursor Wave Animation, Scroll Wheel Zoom) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-brand-secondary">
                MATRIZ DE TELEMETRIA GLOBAL EM TEMPO REAL
              </span>
              <span className="text-brand-muted text-[11px]">
                {selectedCountry ? `Filtrando por: [${selectedCountry}]` : "Passe o cursor sobre os pontos ou clique para filtrar"}
              </span>
            </div>
            <DigitalMatrixWorldMap
              events={recentEvents}
              geoData={geoData}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          </div>

          {/* Charts Demo */}
          <TrafficCharts timeSeries={timeSeries} geoData={geoData} />

          {/* Recent Events Micro Table */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3 text-xs font-mono">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <Activity className="w-4 h-4 text-white" />
                <span>Últimos Eventos Registrados</span>
              </div>
              <span className="text-[11px] text-brand-muted">
                Atualização em tempo real (latência &lt; 25ms)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted text-[11px]">
                    <th className="pb-2">HORÁRIO</th>
                    <th className="pb-2">DOMÍNIO</th>
                    <th className="pb-2">LOCALIZAÇÃO</th>
                    <th className="pb-2">DISPOSITIVO</th>
                    <th className="pb-2">SCORE RISCO</th>
                    <th className="pb-2 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-borderSubtle">
                  {recentEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-brand-hover/60 transition">
                      <td className="py-2.5 text-brand-secondary">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 text-white font-medium">{evt.domain}</td>
                      <td className="py-2.5 text-brand-secondary">
                        {evt.city}, {evt.countryCode}
                      </td>
                      <td className="py-2.5 text-brand-muted">{evt.device}</td>
                      <td className="py-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            evt.riskScore > 70
                              ? "bg-neutral-800 text-white border border-neutral-700"
                              : "text-brand-secondary"
                          }`}
                        >
                          {evt.riskScore}/100
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`text-[11px] ${
                            evt.isThreat ? "text-neutral-400 font-semibold" : "text-white"
                          }`}
                        >
                          {evt.isThreat ? "Filtrado" : "Autorizado"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
