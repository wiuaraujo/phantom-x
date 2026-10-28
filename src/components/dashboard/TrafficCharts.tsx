"use client";

import React from "react";
import { GeoAggregate } from "@/types";
import { getCountryFlag } from "@/lib/geoFlags";

interface TrafficChartsProps {
  timeSeries: { hour: string; events: number; threats: number }[];
  geoData: GeoAggregate[];
  deviceStats?: { desktop: number; mobile: number; tablet: number; bot: number };
}

export const TrafficCharts: React.FC<TrafficChartsProps> = ({
  timeSeries,
  geoData,
  deviceStats = { desktop: 34, mobile: 58, tablet: 4, bot: 4 },
}) => {
  const maxEvents = Math.max(...timeSeries.map((t) => t.events), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* 1. Time Series Chart (Volume de Tráfego por Hora) */}
      <div className="lg:col-span-2 bg-brand-surface border border-brand-border rounded-xl p-3.5 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-brand-white tracking-wide">
              Volume de Requisições (Últimas 24h)
            </h3>
            <p className="text-xs text-brand-secondary mt-0.5">
              Distribuição temporal de eventos limpos vs. tráfego automatizado
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-neutral-900 dark:bg-white" />
              <span className="text-brand-secondary">Acessos Reais</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-neutral-400 dark:bg-neutral-600" />
              <span className="text-brand-secondary">Tráfego Filtrado</span>
            </div>
          </div>
        </div>

        {/* Monochromatic Bar / Histogram Graph */}
        <div className="h-44 flex items-end justify-between gap-1 pt-6 border-b border-brand-border">
          {timeSeries.slice(-20).map((item, idx) => {
            const heightPercent = Math.round((item.events / maxEvents) * 100);
            const threatHeightPercent = Math.round((item.threats / maxEvents) * 100);

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full group relative"
              >
                {/* Tooltip on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none absolute -top-10 bg-neutral-900 border border-neutral-700 text-white text-[10px] px-2 py-1 rounded shadow-glow whitespace-nowrap z-20 font-mono">
                  {item.hour}: {item.events} reqs ({item.threats} bots)
                </div>

                <div className="w-full max-w-[14px] flex flex-col justify-end h-full">
                  {/* Clean traffic part */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-neutral-900 dark:bg-white/90 group-hover:bg-black dark:group-hover:bg-white rounded-t-sm transition-all"
                  />
                  {/* Automated threats part */}
                  <div
                    style={{ height: `${threatHeightPercent}%` }}
                    className="w-full bg-neutral-400 dark:bg-neutral-700 group-hover:bg-neutral-500 dark:group-hover:bg-neutral-600"
                  />
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[10px] text-brand-muted font-mono mt-2">
          <span>{timeSeries[0]?.hour || "00:00"}</span>
          <span>{timeSeries[Math.floor(timeSeries.length / 2)]?.hour || "12:00"}</span>
          <span>{timeSeries[timeSeries.length - 1]?.hour || "Agora"}</span>
        </div>
      </div>

      {/* 2. Device Breakdown & Origin breakdown */}
      <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-brand-white tracking-wide mb-1">
            Distribuição por Dispositivo
          </h3>
          <p className="text-xs text-brand-secondary mb-4">
            Categorização de dispositivos e agentes
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <div className="flex justify-between text-brand-secondary mb-1">
                <span>Mobile (Smartphones)</span>
                <span className="text-brand-white font-bold">{deviceStats.mobile}%</span>
              </div>
              <div className="w-full bg-brand-black h-2 rounded-full overflow-hidden border border-brand-borderSubtle">
                <div
                  style={{ width: `${deviceStats.mobile}%` }}
                  className="bg-neutral-900 dark:bg-white h-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-brand-secondary mb-1">
                <span>Desktop (Workstations)</span>
                <span className="text-brand-white font-bold">{deviceStats.desktop}%</span>
              </div>
              <div className="w-full bg-brand-black h-2 rounded-full overflow-hidden border border-brand-borderSubtle">
                <div
                  style={{ width: `${deviceStats.desktop}%` }}
                  className="bg-neutral-600 dark:bg-zinc-400 h-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-brand-secondary mb-1">
                <span>Tablets & Outros</span>
                <span className="text-brand-white font-bold">{deviceStats.tablet}%</span>
              </div>
              <div className="w-full bg-brand-black h-2 rounded-full overflow-hidden border border-brand-borderSubtle">
                <div
                  style={{ width: `${deviceStats.tablet}%` }}
                  className="bg-neutral-400 dark:bg-zinc-600 h-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-brand-secondary mb-1">
                <span>Bots / Crawlers Identificados</span>
                <span className="text-brand-white font-bold">{deviceStats.bot}%</span>
              </div>
              <div className="w-full bg-brand-black h-2 rounded-full overflow-hidden border border-brand-borderSubtle">
                <div
                  style={{ width: `${deviceStats.bot}%` }}
                  className="bg-neutral-300 dark:bg-neutral-800 border-r border-neutral-900 dark:border-white h-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Countries Quick List */}
        <div className="pt-4 border-t border-brand-border mt-4">
          <div className="text-xs font-semibold text-brand-white mb-2">Principais Regiões</div>
          <div className="space-y-1.5 text-xs font-mono">
            {geoData.slice(0, 3).map((g, i) => (
              <div key={i} className="flex justify-between items-center text-brand-secondary">
                <span className="flex items-center space-x-1.5">
                  <span className="text-sm select-none">{getCountryFlag(g.countryCode)}</span>
                  <span>{g.country}</span>
                </span>
                <span className="text-brand-white font-semibold">{g.eventsCount} ({g.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
