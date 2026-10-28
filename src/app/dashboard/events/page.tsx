"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { store } from "@/lib/store";
import { TrafficEvent, RiskCategory } from "@/types";
import { LocationBadge } from "@/lib/geoFlags";
import { Download, Search, Filter, ShieldCheck, ChevronLeft, ChevronRight, Server } from "lucide-react";

export default function EventsExplorerPage() {
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [search, setSearch] = useState("");
  const [selectedRisk, setSelectedRisk] = useState<RiskCategory | "all">("all");
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const loadEvents = () => {
    setEvents(
      store.getEvents({
        limit: 200,
        search: search || undefined,
        risk: selectedRisk === "all" ? undefined : selectedRisk,
      })
    );
  };

  useEffect(() => {
    loadEvents();
  }, [search, selectedRisk]);

  const totalPages = Math.ceil(events.length / pageSize) || 1;
  const currentEvents = events.slice((page - 1) * pageSize, page * pageSize);

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

  const handleExportCSV = () => {
    const headers = "ID,Timestamp,Domain,ASN,ASN_Org,Layer,City,Country,IP,Device,Browser,RiskScore,IsThreat,Delivery\n";
    const rows = events
      .map(
        (e) =>
          `"${e.id}","${e.timestamp}","${e.domain}","${e.asn ? `AS${e.asn}` : ""}","${e.asnOrg || ""}","${e.detectedLayer || ""}","${e.city}","${e.countryCode}","${e.ipMasked}","${e.device}","${e.browser}","${e.riskScore}","${e.isThreat}","HTTP 200 Proxy Reverso"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `phantom_cloakilio_events_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black">
      <Header
        title="Explorador de Eventos & Telemetria"
        subtitle="Registro granular de cada requisição processada com auditoria das 6 camadas do CloakilioShield"
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        {/* Controls Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-surface border border-brand-border rounded-xl p-3 sm:p-4 shadow-glow-sm">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-brand-muted absolute left-3 top-2.5 sm:top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar cidade, país, domínio, IP ou ASN..."
              className="w-full pl-9 pr-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-xs font-mono text-brand-white placeholder-brand-muted focus:outline-none focus:border-brand-borderHighlight transition"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 font-mono text-xs w-full sm:w-auto">
            {/* Risk Filter */}
            <div className="flex items-center space-x-1.5">
              <span className="text-brand-muted text-[11px]">Risco:</span>
              <select
                value={selectedRisk}
                onChange={(e) => {
                  setSelectedRisk(e.target.value as any);
                  setPage(1);
                }}
                className="bg-brand-surface border border-brand-border rounded-lg px-2.5 py-1.5 text-xs text-brand-white focus:outline-none focus:border-brand-borderHighlight"
              >
                <option value="all">Todos</option>
                <option value="clean">Limpos (0-35)</option>
                <option value="suspicious">Suspeitos (36-70)</option>
                <option value="bot">Bots (&gt;70)</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-glow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-[11px]">
                  <th className="pb-3">EVENT ID</th>
                  <th className="pb-3">HORÁRIO</th>
                  <th className="pb-3">ASN &amp; REDE</th>
                  <th className="pb-3">LOCALIDADE</th>
                  <th className="pb-3">CAMADA ATIVADA</th>
                  <th className="pb-3">ENTREGA</th>
                  <th className="pb-3">RISCO</th>
                  <th className="pb-3 text-right">DESTINO ROTEADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-borderSubtle">
                {currentEvents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-brand-muted font-sans text-xs">
                      Nenhum registro de tráfego localizado no período.
                    </td>
                  </tr>
                ) : (
                  currentEvents.map((evt) => {
                    const layerBadge = getLayerBadge(evt.detectedLayer);
                    return (
                      <tr key={evt.id} className="hover:bg-brand-hover/40 transition">
                        <td className="py-3 text-brand-white font-medium">{evt.id.substring(0, 14)}...</td>
                        <td className="py-3 text-brand-secondary">
                          {new Date(evt.timestamp).toLocaleString("pt-BR")}
                        </td>
                        <td className="py-3">
                          <span className="text-white font-semibold">
                            {evt.asn ? `AS${evt.asn}` : "AS-Residencial"}
                          </span>
                          <span className="text-[10px] text-brand-muted block truncate max-w-[130px]">
                            {evt.asnOrg || "Rede de Borda"}
                          </span>
                        </td>
                        <td className="py-3 text-brand-white">
                          <LocationBadge
                            countryCode={evt.countryCode}
                            cityName={evt.city}
                            stateCode={evt.stateCode}
                            stateName={evt.state}
                          />
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${layerBadge.color}`}>
                            {layerBadge.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white dark:bg-white dark:text-black">
                            <Server className="w-3 h-3" />
                            <span>HTTP 200</span>
                          </span>
                        </td>
                        <td className="py-3">
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
                        <td className="py-3 text-right text-brand-secondary truncate max-w-[170px]">
                          {evt.isThreat ? "Safe Page (White)" : evt.routedTo || evt.targetUrl}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-brand-border text-xs font-mono text-brand-secondary">
            <div>
              Exibindo página <strong className="text-white">{page}</strong> de{" "}
              <strong className="text-white">{totalPages}</strong> ({events.length} registros)
            </div>

            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg bg-brand-black border border-brand-border disabled:opacity-30 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg bg-brand-black border border-brand-border disabled:opacity-30 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
