"use client";

import React, { useMemo } from "react";
import { Header } from "@/components/dashboard/Header";
import { store } from "@/lib/store";
import { TrafficEvent } from "@/types";

export default function ReportsPage() {
  const userEvents: TrafficEvent[] = useMemo(() => {
    return store.getEvents({ limit: 10000 });
  }, []);

  const totalEvents = userEvents.length;
  const threatEvents = userEvents.filter((e) => e.isThreat);
  const cleanEvents = userEvents.filter((e) => !e.isThreat);

  const cleanPercent = totalEvents > 0 ? ((cleanEvents.length / totalEvents) * 100).toFixed(1) : "0.0";
  const threatPercent = totalEvents > 0 ? ((threatEvents.length / totalEvents) * 100).toFixed(1) : "0.0";

  const avgLatency = useMemo(() => {
    if (totalEvents === 0) return "—";
    const sum = userEvents.reduce((acc, e) => acc + (e.latencyMs || 12), 0);
    return `${(sum / totalEvents).toFixed(1)} ms`;
  }, [userEvents, totalEvents]);

  // Agrupamento real de referrers
  const topReferrers = useMemo(() => {
    if (totalEvents === 0) return [];
    const counts = new Map<string, number>();
    userEvents.forEach((e) => {
      const ref = e.referrer || "Direto / Marcador";
      counts.set(ref, (counts.get(ref) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([source, count]) => ({
        source,
        count,
        pct: Math.round((count / totalEvents) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [userEvents, totalEvents]);

  // Agrupamento real de motivos de bloqueio / risco
  const riskReasons = useMemo(() => {
    if (threatEvents.length === 0) return [];
    const counts = new Map<string, number>();
    threatEvents.forEach((e) => {
      const reason = e.detectedLayer
        ? e.detectedLayer === "asn_datacenter"
          ? "ASN de Datacenter Identificado"
          : e.detectedLayer === "bot_pattern"
          ? "User-Agent de Crawler / Bot Conhecido"
          : e.detectedLayer === "geo_fencing"
          ? "Bloqueio Geográfico (Geo-Fencing)"
          : e.detectedLayer === "threat_intelligence"
          ? "Proxy / VPN / IP Malicioso"
          : e.detectedLayer
        : "Classificação Heurística de Risco";
      counts.set(reason, (counts.get(reason) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([reason, count]) => ({
        reason,
        count: `${count} ocorrência${count === 1 ? "" : "s"}`,
        riskLevel: "Alto",
      }))
      .sort((a, b) => parseInt(b.count) - parseInt(a.count))
      .slice(0, 5);
  }, [threatEvents]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black font-sans">
      <Header
        title="Relatórios Analíticos & Tendências"
        subtitle="Métricas consolidadas de desempenho, integridade de tráfego e latência"
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto font-mono text-xs">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="text-brand-muted text-[10px] uppercase mb-1">Disponibilidade Global</div>
            <div className="text-2xl font-bold text-white font-sans">100%</div>
            <div className="text-brand-secondary text-[10px] mt-1.5">Edge Worker operacional</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="text-brand-muted text-[10px] uppercase mb-1">Tempo Médio de Roteamento</div>
            <div className="text-2xl font-bold text-white font-sans">{avgLatency}</div>
            <div className="text-brand-secondary text-[10px] mt-1.5">
              {totalEvents > 0 ? "Processamento de regras na borda" : "Aguardando requisições"}
            </div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="text-brand-muted text-[10px] uppercase mb-1">Índice de Tráfego Limpo</div>
            <div className="text-2xl font-bold text-white font-sans">{cleanPercent}%</div>
            <div className="text-brand-secondary text-[10px] mt-1.5">{cleanEvents.length} eventos humanos reais</div>
          </div>
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="text-brand-muted text-[10px] uppercase mb-1">Bots &amp; Scrapers Isolados</div>
            <div className="text-2xl font-bold text-white font-sans">{threatPercent}%</div>
            <div className="text-brand-secondary text-[10px] mt-1.5">{threatEvents.length} robôs mitigados</div>
          </div>
        </div>

        {/* Top Referral Channels & Threat breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Referrers */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-white font-sans mb-1">Origens de Tráfego (Referrers)</h3>
            <p className="text-brand-secondary text-[11px] mb-4">
              Canais externos de aquisição identificados
            </p>

            {topReferrers.length === 0 ? (
              <div className="py-8 text-center text-brand-muted text-[11px]">
                Nenhuma origem externa registrada ainda. Aguardando tráfego real.
              </div>
            ) : (
              <div className="space-y-3">
                {topReferrers.map((ref, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-brand-secondary">
                      <span className="text-brand-white truncate mr-2">{ref.source}</span>
                      <span className="shrink-0">
                        {ref.count.toLocaleString("pt-BR")} reqs ({ref.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-brand-black h-1.5 rounded-full overflow-hidden border border-brand-borderSubtle">
                      <div style={{ width: `${ref.pct}%` }} className="bg-white h-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bot Heuristics & Mitigation breakdown */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-white font-sans mb-1">Motivos de Classificação de Risco</h3>
            <p className="text-brand-secondary text-[11px] mb-4">
              Assinaturas de robôs e moderadores isolados na Safe Page
            </p>

            {riskReasons.length === 0 ? (
              <div className="py-8 text-center text-brand-muted text-[11px]">
                Nenhuma ameaça ou classificação registrada no momento.
              </div>
            ) : (
              <div className="space-y-2.5">
                {riskReasons.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-black/40 border border-brand-border flex items-center justify-between"
                  >
                    <div>
                      <div className="text-brand-white font-medium">{item.reason}</div>
                      <div className="text-brand-muted text-[10px] mt-0.5">{item.count}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-300 font-bold">
                      {item.riskLevel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
