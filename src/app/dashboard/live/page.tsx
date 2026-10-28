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
    const evt = store.generateRandomSimulatedEvent();
    refreshEvents();
  };

  const filteredEvents = events.filter((e) => {
    if (selectedRisk === "all") return true;
    return e.riskCategory === selectedRisk;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black">
      <Header
        title="Monitoramento de Tráfego Ao Vivo"
        subtitle="Fluxo contínuo de requisições de borda com inspeção instantânea de telemetria"
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
              onClick={() => setEvents([])}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-brand-secondary hover:text-brand-white bg-brand-surface border border-brand-border transition"
              title="Limpar buffer de eventos"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>

            <button
              onClick={handleSimulateBurst}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-brand-white bg-brand-surface border border-brand-border hover:bg-brand-hover transition"
            >
              <Send className="w-3.5 h-3.5 text-brand-white" />
              <span>Injetar Carga (+3)</span>
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
                {isPaused ? "STREAM EM PAUSA" : "STREAM DE REQUISIÇÕES CONECTADO"}
              </span>
            </div>
            <span className="text-xs font-mono text-brand-muted">
              {filteredEvents.length} eventos listados
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-[11px]">
                  <th className="pb-2.5">TIMESTAMP</th>
                  <th className="pb-2.5">DOMÍNIO</th>
                  <th className="pb-2.5">IP (MASCARADO)</th>
                  <th className="pb-2.5">LOCALIZAÇÃO</th>
                  <th className="pb-2.5">LATÊNCIA</th>
                  <th className="pb-2.5">USER AGENT</th>
                  <th className="pb-2.5">SCORE</th>
                  <th className="pb-2.5 text-right">DETALHES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-borderSubtle">
                {filteredEvents.map((evt) => (
                  <tr
                    key={evt.id}
                    onClick={() => setSelectedEvent(evt)}
                    className="hover:bg-brand-hover/60 transition cursor-pointer group"
                  >
                    <td className="py-3 text-brand-secondary whitespace-nowrap">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 text-brand-white font-medium whitespace-nowrap">{evt.domain}</td>
                    <td className="py-3 text-brand-muted whitespace-nowrap">{evt.ipMasked}</td>
                    <td className="py-3 text-brand-white whitespace-nowrap">
                      <LocationBadge
                        countryCode={evt.countryCode}
                        cityName={evt.city}
                        stateCode={evt.stateCode}
                        stateName={evt.state}
                      />
                    </td>
                    <td className="py-3 text-brand-secondary whitespace-nowrap">
                      {evt.latencyMs}ms
                    </td>
                    <td className="py-3 text-brand-secondary max-w-[200px] truncate">
                      {evt.browser} ({evt.os})
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
                ))}
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
                <span className="text-[10px] text-brand-muted uppercase">DETALHES DA REQUISIÇÃO</span>
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

            {/* Technical Metadata Table */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Timestamp ISO:</span>
                <span className="text-white">{selectedEvent.timestamp}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Domínio Alvo:</span>
                <span className="text-white">{selectedEvent.domain}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Campanha Atribuída:</span>
                <span className="text-white">{selectedEvent.campaignName || "Nenhuma"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">IP Anonimizado:</span>
                <span className="text-white">{selectedEvent.ipMasked}</span>
              </div>
              {selectedEvent.clickId && (
                <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                  <span className="text-brand-muted">Click ID Atribuído:</span>
                  <span className="text-white font-mono text-[11px]">{selectedEvent.clickId}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Decisão de Roteamento:</span>
                <span className="text-white font-semibold">
                  {selectedEvent.decision === "routed_offer"
                    ? "OFERTA (Acesso Autorizado)"
                    : selectedEvent.decision === "mitigated_safe"
                    ? "SAFE PAGE (Verificação de Segurança)"
                    : selectedEvent.isThreat
                    ? "SAFE PAGE (Mitigado)"
                    : "OFERTA (Liberado)"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Geolocalização:</span>
                <span className="text-white flex items-center space-x-1.5">
                  <span className="text-sm select-none">{getCountryFlag(selectedEvent.countryCode)}</span>
                  <span>
                    {selectedEvent.city}
                    {selectedEvent.state ? `, ${selectedEvent.state}` : ""}
                    {selectedEvent.stateCode ? ` [${selectedEvent.stateCode}]` : ""}
                    {" — "}
                    {selectedEvent.country}
                  </span>
                </span>
              </div>
              {selectedEvent.ispOrg && (
                <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                  <span className="text-brand-muted">Provedor / ISP:</span>
                  <span className="text-white">{selectedEvent.ispOrg}</span>
                </div>
              )}
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Coordenadas Aprox.:</span>
                <span className="text-white">
                  {selectedEvent.latitude.toFixed(2)}, {selectedEvent.longitude.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Dispositivo / Agente:</span>
                <span className="text-white">{selectedEvent.device}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Browser:</span>
                <span className="text-white">{selectedEvent.browser}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Sistema Operacional:</span>
                <span className="text-white">{selectedEvent.os}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Referrer HTTP:</span>
                <span className="text-white truncate max-w-[250px]">{selectedEvent.referrer}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-brand-borderSubtle">
                <span className="text-brand-muted">Destino Roteado:</span>
                <span className="text-white truncate max-w-[250px]">{selectedEvent.routedTo}</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition"
              >
                Fechar Inspeção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
