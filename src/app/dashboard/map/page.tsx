"use client";

import React, { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { DigitalMatrixWorldMap } from "@/components/dashboard/DigitalMatrixWorldMap";
import { store } from "@/lib/store";
import { getCountryFlag } from "@/lib/geoFlags";
import { Globe2, Radio, Server } from "lucide-react";

export default function GlobalMapPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const geoData = store.getGeoDistribution();
  const events = store.getEvents({ limit: 40, country: selectedCountry || undefined });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black">
      <Header
        title="Mapa de Telemetria Global"
        subtitle="Visualização geoespacial da matriz digital das requisições e latência de borda"
      />

      <div className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Full-width Digital Matrix Map Canvas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2 text-brand-white">
              <Globe2 className="w-4 h-4 text-brand-white" />
              <span className="font-semibold">NÓS DE TELEMETRIA POR PAÍS E CIDADE</span>
            </div>
            <span className="text-brand-muted text-[11px]">
              {selectedCountry
                ? `Isolando tráfego de: [${selectedCountry}]`
                : "Selecione um nó no mapa ou na tabela abaixo"}
            </span>
          </div>

          <DigitalMatrixWorldMap
            events={events}
            geoData={geoData}
            selectedCountry={selectedCountry}
            onSelectCountry={setSelectedCountry}
            className="h-[360px] sm:h-[460px] md:h-[540px] w-full rounded-2xl border border-brand-border"
          />
        </div>

        {/* Breakdown by Country Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-xl p-5 shadow-glow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-brand-white tracking-wide">
                Volume e Penetração por País
              </h3>
              <span className="text-xs font-mono text-brand-muted">
                {geoData.length} territórios detectados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-brand-border text-brand-muted text-[11px]">
                    <th className="pb-2.5">PAÍS</th>
                    <th className="pb-2.5">CÓDIGO</th>
                    <th className="pb-2.5">VOLUME</th>
                    <th className="pb-2.5">PROPORÇÃO</th>
                    <th className="pb-2.5 text-right">AÇÃO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-borderSubtle">
                  {geoData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-brand-muted font-sans text-xs">
                        Nenhum país com tráfego registrado no momento.
                      </td>
                    </tr>
                  ) : (
                    geoData.map((g) => (
                      <tr
                        key={g.countryCode}
                        className={`hover:bg-brand-hover/50 transition cursor-pointer ${
                          selectedCountry === g.countryCode ? "bg-brand-hover" : ""
                        }`}
                        onClick={() =>
                          setSelectedCountry(selectedCountry === g.countryCode ? null : g.countryCode)
                        }
                      >
                        <td className="py-2.5 text-white font-medium flex items-center space-x-2">
                          <span className="text-base leading-none select-none">
                            {getCountryFlag(g.countryCode)}
                          </span>
                          <span>{g.country}</span>
                        </td>
                        <td className="py-2.5 text-brand-secondary">{g.countryCode}</td>
                        <td className="py-2.5 text-white font-bold">{g.eventsCount}</td>
                        <td className="py-2.5">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-brand-black h-1.5 rounded-full overflow-hidden border border-brand-borderSubtle">
                              <div style={{ width: `${g.percentage}%` }} className="bg-white h-full" />
                            </div>
                            <span className="text-brand-secondary">{g.percentage}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-right text-brand-secondary">
                          {selectedCountry === g.countryCode ? "Remover filtro" : "Filtrar"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edge Infrastructure Info */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-glow-sm space-y-4">
            <h3 className="text-sm font-semibold text-white tracking-wide">
              Infraestrutura de Ingestão
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-brand-black border border-brand-borderSubtle">
                <div className="flex items-center space-x-2 text-white text-xs font-semibold mb-1">
                  <Server className="w-4 h-4 text-white" />
                  <span>América do Sul (SA-East)</span>
                </div>
                <div className="text-brand-muted text-[11px]">São Paulo (GRU) — 14ms latência</div>
              </div>

              <div className="p-3 rounded-lg bg-brand-black border border-brand-borderSubtle">
                <div className="flex items-center space-x-2 text-white text-xs font-semibold mb-1">
                  <Server className="w-4 h-4 text-white" />
                  <span>América do Norte (US-East)</span>
                </div>
                <div className="text-brand-muted text-[11px]">N. Virginia (IAD) — 22ms latência</div>
              </div>

              <div className="p-3 rounded-lg bg-brand-black border border-brand-borderSubtle">
                <div className="flex items-center space-x-2 text-white text-xs font-semibold mb-1">
                  <Server className="w-4 h-4 text-white" />
                  <span>Europa Central (EU-Central)</span>
                </div>
                <div className="text-brand-muted text-[11px]">Frankfurt (FRA) — 28ms latência</div>
              </div>

              <div className="p-3 rounded-lg bg-brand-black border border-brand-borderSubtle">
                <div className="flex items-center space-x-2 text-white text-xs font-semibold mb-1">
                  <Server className="w-4 h-4 text-white" />
                  <span>Ásia-Pacífico (AP-East)</span>
                </div>
                <div className="text-brand-muted text-[11px]">Tóquio (NRT) — 38ms latência</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
