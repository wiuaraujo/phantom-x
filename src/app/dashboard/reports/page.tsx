"use client";

import React from "react";
import { Header } from "@/components/dashboard/Header";
import { store } from "@/lib/store";
import { BarChart3, TrendingUp, ShieldAlert, Cpu, Globe } from "lucide-react";

export default function ReportsPage() {
  const geoData = store.getGeoDistribution();
  const timeSeries = store.getTimeSeries(24);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black">
      <Header
        title="Relatórios Analíticos & Tendências"
        subtitle="Métricas consolidadas de desempenho, integridade de tráfego e latência"
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-mono text-xs">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-glow-sm">
            <div className="text-brand-muted text-[11px] mb-1">DISPONIBILIDADE GLOBAL</div>
            <div className="text-2xl font-bold text-white">99.98%</div>
            <div className="text-brand-secondary text-[10px] mt-2">Zero falhas de borda registradas</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-glow-sm">
            <div className="text-brand-muted text-[11px] mb-1">TEMPO MÉDIO DE ROTEAMENTO</div>
            <div className="text-2xl font-bold text-white">18.4 ms</div>
            <div className="text-brand-secondary text-[10px] mt-2">Processamento de regras na borda</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-glow-sm">
            <div className="text-brand-muted text-[11px] mb-1">ÍNDICE DE TRÁFEGO LIMPO</div>
            <div className="text-2xl font-bold text-white">92.6%</div>
            <div className="text-brand-secondary text-[10px] mt-2">Humano / Real verificado</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-glow-sm">
            <div className="text-brand-muted text-[11px] mb-1">BOTS & SCRAPERS ISOLADOS</div>
            <div className="text-2xl font-bold text-white">7.4%</div>
            <div className="text-brand-secondary text-[10px] mt-2">Mitigados automaticamente</div>
          </div>
        </div>

        {/* Top Referral Channels & Threat breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Referrers */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-glow-sm">
            <h3 className="text-sm font-bold text-white mb-1">Origens de Tráfego (Referrers)</h3>
            <p className="text-brand-secondary text-[11px] mb-4">
              Canais externos de aquisição mais frequentes
            </p>

            <div className="space-y-3">
              {[
                { source: "Google Search (Orgânico + CPC)", pct: 44, count: "27.420" },
                { source: "Instagram (Direct + Stories)", pct: 28, count: "17.450" },
                { source: "Facebook Feed / Marketplace", pct: 14, count: "8.720" },
                { source: "Acesso Direto / Favoritos", pct: 9, count: "5.600" },
                { source: "Twitter / X", pct: 5, count: "3.110" },
              ].map((ref, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-brand-secondary">
                    <span className="text-brand-white">{ref.source}</span>
                    <span>
                      {ref.count} reqs ({ref.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-brand-black h-1.5 rounded-full overflow-hidden border border-brand-borderSubtle">
                    <div style={{ width: `${ref.pct}%` }} className="bg-neutral-900 dark:bg-white h-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bot Heuristics & Mitigation breakdown */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-glow-sm">
            <h3 className="text-sm font-bold text-brand-white mb-1">Motivos de Classificação de Risco</h3>
            <p className="text-brand-secondary text-[11px] mb-4">
              Assinaturas que acionaram proteção e limites de requisição
            </p>

            <div className="space-y-3">
              {[
                {
                  reason: "Assinatura Headless (Puppeteer / Selenium)",
                  count: "1.420 ocorrências",
                  riskLevel: "Alto",
                },
                {
                  reason: "Frequência Anômala (Rate Limit Excedido)",
                  count: "890 ocorrências",
                  riskLevel: "Alto",
                },
                {
                  reason: "User-Agent de Crawler / Scraper Conhecido",
                  count: "640 ocorrências",
                  riskLevel: "Médio",
                },
                {
                  reason: "Cabeçalho de Proxy / VPN Datacenter",
                  count: "380 ocorrências",
                  riskLevel: "Médio",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-brand-surface border border-brand-borderSubtle flex items-center justify-between"
                >
                  <div>
                    <div className="text-brand-white font-medium">{item.reason}</div>
                    <div className="text-brand-muted text-[10px]">{item.count}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-900 border border-neutral-700 text-white font-bold">
                    {item.riskLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
