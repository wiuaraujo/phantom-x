"use client";

import React, { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { TechGlobe } from "@/components/globe/TechGlobe";
import { store } from "@/lib/store";
import { getCountryFlag } from "@/lib/geoFlags";
import { Globe2, Radio, Server, RotateCw } from "lucide-react";

export default function GlobalMapPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const geoData = store.getGeoDistribution();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black">
      <Header
        title="Globo de Telemetria 360º"
        subtitle="Visualização geoespacial esférica 360º em tempo real da rede Phantom-X e latência global"
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        {/* Full-width 360 Interactive Spherical Globe */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center space-x-2 text-brand-white">
              <Globe2 className="w-4 h-4 text-brand-white" />
              <span className="font-semibold text-xs truncate">
                GLOBO ESFÉRICO 360º INTERATIVO
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-brand-muted text-[10px] sm:text-[11px] truncate">
                {selectedCountry ? `Isolando: [${selectedCountry}]` : "Navegação 360º Ativa"}
              </span>

              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-brand-surface border border-brand-border text-[11px] font-semibold text-brand-white">
                <RotateCw className="w-3 h-3 text-brand-secondary" />
                <span>Rotação 360º</span>
              </div>
            </div>
          </div>

          <div className="relative h-[340px] xs:h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-2xl border border-brand-border bg-brand-surface overflow-hidden shadow-glow-sm flex items-center justify-center">
            <div className="absolute inset-0 dark:bg-[radial-gradient(circle,rgba(255,255,255,0.06)_0%,transparent_70%)] bg-[radial-gradient(circle,rgba(0,0,0,0.03)_0%,transparent_70%)] pointer-events-none" />
            <TechGlobe className="w-full h-full" />
          </div>
        </div>

        {/* Breakdown by Country Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-glow-sm">
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
                        <td className="py-2.5 text-brand-white font-medium flex items-center space-x-2">
                          <span className="text-base leading-none select-none">
                            {getCountryFlag(g.countryCode)}
                          </span>
                          <span>{g.country}</span>
                        </td>
                        <td className="py-2.5 text-brand-secondary">{g.countryCode}</td>
                        <td className="py-2.5 text-brand-white font-bold">{g.eventsCount}</td>
                        <td className="py-2.5">
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-brand-black h-1.5 rounded-full overflow-hidden border border-brand-borderSubtle">
                              <div style={{ width: `${g.percentage}%` }} className="bg-brand-white h-full" />
                            </div>
                            <span className="text-brand-secondary">{g.percentage}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCountry(selectedCountry === g.countryCode ? null : g.countryCode);
                            }}
                            className="text-[11px] text-brand-muted hover:text-brand-white transition"
                          >
                            {selectedCountry === g.countryCode ? "Remover" : "Filtrar"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Infrastructure Health Status */}
          <div className="bg-brand-surface border border-brand-border rounded-xl p-4 sm:p-5 shadow-glow-sm space-y-4">
            <h3 className="text-sm font-semibold text-brand-white tracking-wide">
              Topologia de Borda (Edge PoPs)
            </h3>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-brand-black/50 border border-brand-borderSubtle space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-brand-white font-bold">PoP GRU (São Paulo - Brasil)</span>
                  <span className="text-[10px] text-emerald-500 font-bold">OPERACIONAL</span>
                </div>
                <div className="text-[11px] text-brand-secondary">Latência: 11ms • Borda Primária</div>
              </div>

              <div className="p-3 rounded-lg bg-brand-black/50 border border-brand-borderSubtle space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-brand-white font-bold">PoP IAD (Ashburn - EUA)</span>
                  <span className="text-[10px] text-emerald-500 font-bold">OPERACIONAL</span>
                </div>
                <div className="text-[11px] text-brand-secondary">Latência: 16ms • Rota Global</div>
              </div>

              <div className="p-3 rounded-lg bg-brand-black/50 border border-brand-borderSubtle space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-brand-white font-bold">PoP LHR (Londres - Reino Unido)</span>
                  <span className="text-[10px] text-emerald-500 font-bold">OPERACIONAL</span>
                </div>
                <div className="text-[11px] text-brand-secondary">Latência: 18ms • Rota EMEA</div>
              </div>

              <div className="p-3 rounded-lg bg-brand-black/50 border border-brand-borderSubtle space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-brand-white font-bold">PoP NRT (Tóquio - Japão)</span>
                  <span className="text-[10px] text-emerald-500 font-bold">OPERACIONAL</span>
                </div>
                <div className="text-[11px] text-brand-secondary">Latência: 22ms • Rota APAC</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
