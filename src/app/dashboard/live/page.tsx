"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { store } from "@/lib/store";
import { TrafficEvent, RiskCategory } from "@/types";
import { getCountryFlag, LocationBadge } from "@/lib/geoFlags";
import {
  Play,
  Pause,
  Trash2,
  Send,
  Filter,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  X,
  Server,
  Cpu,
  Layers,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function LiveMonitoringPage() {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<RiskCategory | "all">("all");
  const [selectedEvent, setSelectedEvent] = useState<TrafficEvent | null>(null);

  const refreshEvents = () => {
    setEvents(store.getEvents({ limit: 40 }));
  };

  // Initial load
  useEffect(() => {
    refreshEvents();
  }, []);

  // Poll for real incoming events
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      refreshEvents();
    }, 2500);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handleSimulateBurst = () => {
    store.generateRandomSimulatedEvent();
    refreshEvents();
  };

  const filteredEvents = events.filter((e) => {
    if (selectedRisk === "all") return true;
    return e.riskCategory === selectedRisk;
  });

  const getLayerBadge = (layer?: string) => {
    switch (layer) {
      case "asn_datacenter":
        return { label: "ASN Datacenter", color: "bg-red-500/10 text-red-300 border-red-500/30" };
      case "bot_pattern":
        return { label: "Crawler UA", color: "bg-amber-500/10 text-amber-300 border-amber-500/30" };
      case "geo_fencing":
        return { label: "Geo-Fencing", color: "bg-purple-500/10 text-purple-300 border-purple-500/30" };
      case "platform_token":
        return { label: "Token fbclid", color: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" };
      case "threat_intelligence":
        return { label: "Proxy / VPN", color: "bg-orange-500/10 text-orange-300 border-orange-500/30" };
      case "clean_traffic":
        return { label: "Humano Real", color: "bg-white/10 text-brand-white border-white/20" };
      default:
        return { label: "Borda L7", color: "bg-neutral-800 text-neutral-300 border-neutral-700" };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black">
      <Header
        title="Monitoramento de Tráfego Ao Vivo"
        subtitle="Fluxo contínuo de inspeção multi-camada do Phantom-X com entrega transparente HTTP 200 OK"
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        {/* Stream Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-brand-surface border border-brand-border rounded-xl p-4 shadow-glow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold font-mono transition ${
                isPaused
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                  : "bg-brand-surface text-brand-white border border-brand-border hover:bg-brand-hover"
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Retomar Stream</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pausar Stream</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                store.revertSimulatedEvents();
                refreshEvents();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-brand-secondary hover:text-rose-400 bg-brand-surface border border-brand-border transition"
              title="Limpar e reverter eventos de teste do dashboard"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar / Reverter Testes</span>
            </button>

            <button
              onClick={handleSimulateBurst}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-brand-white bg-brand-surface border border-brand-border hover:bg-brand-hover transition"
            >
              <Send className="w-3.5 h-3.5 text-brand-white" />
              <span>Injetar Requisição (+1)</span>
            </button>
          </div>

          {/* Risk Level Filter */}
          <div className="flex items-center space-x-2 font-mono text-xs">
            <span className="text-brand-muted text-[11px] flex items-center">
              <Filter className="w-3 h-3 mr-1" /> Classificação:
            </span>
            {(["all", "clean", "suspicious", "bot"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRisk(r)}
                className={`px-2.5 py-1 rounded transition text-xs ${
                  selectedRisk === r
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-bold"
                    : "text-brand-secondary hover:text-brand-white bg-brand-surface border border-brand-border"
                }`}
              >
                {r === "all" ? "Todos" : r === "clean" ? "Limpos" : r === "suspicious" ? "Suspeitos" : "Bots"}
              </button>
            ))}
          </div>
        </div>

        {/* Live Event Stream Feed */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-glow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-brand-border">
            <div className="flex items-center space-x-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isPaused ? "bg-neutral-500" : "bg-neutral-900 dark:bg-white animate-ping"
                }`}
              />
              <span className="text-xs font-mono text-brand-white font-semibold uppercase">
                {isPaused ? "STREAM EM PAUSA" : "MOTOR PHANTOM-X: STREAM ATIVO EM TEMPO REAL"}
              </span>
            </div>
            <span className="text-xs font-mono text-brand-muted">
              {filteredEvents.length} eventos monitorados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-[11px]">
                  <th className="pb-2.5">TIMESTAMP</th>
                  <th className="pb-2.5">ASN &amp; PROVEDOR</th>
                  <th className="pb-2.5">LOCALIZAÇÃO</th>
                  <th className="pb-2.5">CAMADA DETECTADA</th>
                  <th className="pb-2.5">ENTREGA PROXY</th>
                  <th className="pb-2.5">DISPOSITIVO / UA</th>
                  <th className="pb-2.5">SCORE</th>
                  <th className="pb-2.5 text-right">INSPEÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-borderSubtle">
                {filteredEvents.map((evt) => {
                  const layerBadge = getLayerBadge(evt.detectedLayer);
                  return (
                    <tr
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="hover:bg-brand-hover/60 transition cursor-pointer group"
                    >
                      <td className="py-3 text-brand-secondary whitespace-nowrap">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>

                      <td className="py-3 whitespace-nowrap">
                        <div className="text-brand-white font-medium">
                          {evt.asn ? `AS${evt.asn}` : "AS-Residencial"}
                        </div>
                        <div className="text-brand-muted text-[10px] truncate max-w-[150px]">
                          {evt.asnOrg || evt.ispOrg || "Rede de Borda"}
                        </div>
                      </td>

                      <td className="py-3 text-brand-white whitespace-nowrap">
                        <LocationBadge
                          countryCode={evt.countryCode}
                          cityName={evt.city}
                          stateCode={evt.stateCode}
                          stateName={evt.state}
                        />
                      </td>

                      <td className="py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${layerBadge.color}`}>
                          {layerBadge.label}
                        </span>
                      </td>

                      <td className="py-3 whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white dark:bg-white dark:text-black">
                          <Server className="w-3 h-3" />
                          <span>HTTP 200</span>
                        </span>
                      </td>

                      <td className="py-3 text-brand-secondary max-w-[160px] truncate">
                        {evt.device} — {evt.browser}
                      </td>

                      <td className="py-3 whitespace-nowrap">
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

                      <td className="py-3 text-right">
                        <span className="text-brand-muted group-hover:text-brand-white transition">
                          Inspecionar →
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-over Event Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-lg bg-brand-surface border-l border-brand-border p-6 h-full overflow-y-auto space-y-6 font-mono">
            <div className="flex items-center justify-between border-b border-brand-border pb-4">
              <div>
                <span className="text-[10px] text-brand-muted uppercase">AUDITORIA PHANTOM-X</span>
                <h2 className="text-base font-bold text-brand-white">{selectedEvent.id}</h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-lg hover:bg-brand-hover text-brand-secondary hover:text-brand-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Risk Assessment Box */}
            <div className="p-4 rounded-xl bg-brand-black border border-brand-border space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-brand-secondary">CLASSIFICAÇÃO DE RISCO:</span>
                <span className="text-sm font-bold text-white">
                  {selectedEvent.riskScore} / 100 ({selectedEvent.riskCategory.toUpperCase()})
                </span>
              </div>
              <div className="w-full bg-brand-surface h-2 rounded-full overflow-hidden">
                <div
                  style={{ width: `${selectedEvent.riskScore}%` }}
                  className={`h-full ${
                    selectedEvent.riskScore > 70
                      ? "bg-neutral-400"
                      : "bg-white"
                  }`}
                />
              </div>
              {selectedEvent.threatReasons && selectedEvent.threatReasons.length > 0 && (
                <div className="text-[11px] text-neutral-300 pt-1 flex items-start space-x-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-white" />
                  <span>Motivos: {selectedEvent.threatReasons.join(", ")}</span>
                </div>
              )}
            </div>

            {/* 6-Layer Decision Breakdown */}
            <div className="p-4 rounded-xl bg-brand-black/60 border border-brand-border space-y-3">
              <div className="text-[11px] font-bold text-brand-white flex items-center space-x-1.5">
                <Layers className="w-4 h-4 text-brand-secondary" />
                <span>AVALIAÇÃO DAS 6 CAMADAS DE SEGURANÇA</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-brand-borderSubtle">
                  <span className="text-brand-muted">1. Geo-Fencing:</span>
                  <span className="text-brand-white font-medium">
                    {selectedEvent.countryCode} ({selectedEvent.country})
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-brand-borderSubtle">
                  <span className="text-brand-muted">2. Filtro de Dispositivo:</span>
                  <span className="text-brand-white font-medium">
                    {selectedEvent.device} ({selectedEvent.os})
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-brand-borderSubtle">
                  <span className="text-brand-muted">3. ASN / Rede Datacenter:</span>
                  <span className="text-brand-white font-medium">
                    {selectedEvent.asn ? `AS${selectedEvent.asn} — ` : ""}
                    {selectedEvent.asnOrg || "Residencial"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-brand-borderSubtle">
                  <span className="text-brand-muted">4. Assinatura Bot / Crawler:</span>
                  <span className="text-brand-white font-medium">
                    {selectedEvent.isThreat ? "Detectado em Lista Negra" : "Nenhum padrão malicioso"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-brand-borderSubtle">
                  <span className="text-brand-muted">5. Token fbclid / UTM:</span>
                  <span className="text-brand-white font-medium">
                    {selectedEvent.clickId ? "Válido / Presente" : "Sem Token de Campanha"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-brand-borderSubtle">
                  <span className="text-brand-muted">6. Threat Intel (ProxyCheck):</span>
                  <span className="text-brand-white font-medium">
                    {selectedEvent.riskScore > 65 ? "Proxy / VPN Sinalizada" : "IP Residencial Limpo"}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery & Routing Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Método de Entrega:</span>
                <span className="text-brand-white font-bold flex items-center space-x-1">
                  <Server className="w-3.5 h-3.5" />
                  <span>HTTP 200 OK (Proxy Reverso Transparente)</span>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Decisão de Roteamento:</span>
                <span className="text-brand-white font-semibold">
                  {selectedEvent.decision === "routed_offer" || !selectedEvent.isThreat
                    ? "OFERTA (Acesso Concedido)"
                    : "WHITEPAGE (Página Segura de Moderação)"}
                </span>
              </div>
              {selectedEvent.webglRenderer && (
                <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                  <span className="text-brand-muted">GPU / WebGL:</span>
                  <span className="text-brand-white text-[11px] truncate max-w-[240px] font-mono">
                    {selectedEvent.webglRenderer}
                  </span>
                </div>
              )}
              {selectedEvent.canvasHash && (
                <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                  <span className="text-brand-muted">Canvas 2D Hash:</span>
                  <span className="text-brand-white font-mono text-[11px]">
                    {selectedEvent.canvasHash}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">URL Entregue:</span>
                <span className="text-brand-white truncate max-w-[240px]">
                  {selectedEvent.routedTo || selectedEvent.targetUrl}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Cache Headers:</span>
                <span className="text-brand-white font-mono text-[10px]">
                  no-store, no-cache, max-age=0
                </span>
              </div>
              {selectedEvent.isThreat && (
                <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                  <span className="text-brand-muted">Robots Header:</span>
                  <span className="text-brand-white font-mono text-[10px]">
                    X-Robots-Tag: noindex, nofollow
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">IP Mascarado:</span>
                <span className="text-brand-white font-mono">{selectedEvent.ipMasked}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Localização:</span>
                <span className="text-brand-white flex items-center space-x-1.5">
                  <span className="text-sm select-none">{getCountryFlag(selectedEvent.countryCode)}</span>
                  <span>
                    {selectedEvent.city}
                    {selectedEvent.state ? `, ${selectedEvent.state}` : ""}
                    {" — "}
                    {selectedEvent.country}
                  </span>
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">User Agent:</span>
                <span className="text-brand-white truncate max-w-[240px]">{selectedEvent.browser}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Latência de Borda:</span>
                <span className="text-brand-white font-mono">{selectedEvent.latencyMs}ms</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
