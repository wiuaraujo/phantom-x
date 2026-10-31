"use client";

import React, { useState, useMemo } from "react";
import { GeoAggregate } from "@/types";
import { getCountryFlag } from "@/lib/geoFlags";
import { store } from "@/lib/store";
import { Activity, ShieldCheck, ShieldAlert, TrendingUp } from "lucide-react";

interface TrafficChartsProps {
  timeSeries: { hour: string; events: number; threats: number }[];
  geoData: GeoAggregate[];
  deviceStats?: { desktop: number; mobile: number; tablet: number; bot: number };
}

export const TrafficCharts: React.FC<TrafficChartsProps> = ({
  timeSeries,
  geoData,
  deviceStats = { desktop: 0, mobile: 0, tablet: 0, bot: 0 },
}) => {
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d">("24h");
  const [metric, setMetric] = useState<"total" | "clean" | "threats" | "efficiency">("total");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Geração de dados reais agregados por período
  const chartData = useMemo(() => {
    const realEvents = store.getEvents({ limit: 100000 });
    const now = new Date();

    if (timeframe === "24h") {
      // 24 intervalos de 1 hora
      const items = [];
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 3600 * 1000);
        const hourLabel = `${String(d.getHours()).padStart(2, "0")}:00`;
        const hourStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()).getTime();
        const hourEnd = hourStart + 3600 * 1000;

        const evts = realEvents.filter((e) => {
          const t = new Date(e.timestamp).getTime();
          return t >= hourStart && t < hourEnd;
        });

        const total = evts.length;
        const threats = evts.filter((e) => e.isThreat).length;
        const clean = total - threats;
        const efficiency = total > 0 ? Number(((threats / total) * 100).toFixed(1)) : 0;

        items.push({
          label: hourLabel,
          fullDate: `${hourLabel} (${d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })})`,
          total,
          clean,
          threats,
          efficiency,
        });
      }
      return items;
    }

    const days = timeframe === "7d" ? 7 : 30;
    const items = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
      const dayLabel = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 3600 * 1000;

      const evts = realEvents.filter((e) => {
        const t = new Date(e.timestamp).getTime();
        return t >= dayStart && t < dayEnd;
      });

      const total = evts.length;
      const threats = evts.filter((e) => e.isThreat).length;
      const clean = total - threats;
      const efficiency = total > 0 ? Number(((threats / total) * 100).toFixed(1)) : 0;

      items.push({
        label: dayLabel,
        fullDate: d.toLocaleDateString("pt-BR"),
        total,
        clean,
        threats,
        efficiency,
      });
    }
    return items;
  }, [timeframe]);

  // Dimensionamento do viewBox SVG (mesmo padrão elegante do admin)
  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingY = 24;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  // Extrai valores baseado na métrica ativa
  const values = chartData.map((d) => {
    if (metric === "total") return d.total;
    if (metric === "clean") return d.clean;
    if (metric === "threats") return d.threats;
    return d.efficiency;
  });

  const allZero = values.every((v) => v === 0);
  const minVal = 0;
  const maxVal = allZero
    ? metric === "efficiency"
      ? 100
      : 10
    : Math.max(...values) * 1.08;

  // Mapeamento dos pontos SVG
  const points = chartData.map((d, index) => {
    const val =
      metric === "total"
        ? d.total
        : metric === "clean"
        ? d.clean
        : metric === "threats"
        ? d.threats
        : d.efficiency;
    const x = paddingX + (index / (chartData.length - 1 || 1)) * graphWidth;
    const normalizedY = allZero ? 0 : (val - minVal) / (maxVal - minVal || 1);
    const y = height - paddingY - normalizedY * graphHeight;
    return { x, y, data: d, val };
  });

  // Curva cúbica suave de Bezier
  const pathD = useMemo(() => {
    if (points.length < 2) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  }, [points]);

  // Área preenchida com gradiente vertical
  const areaD = useMemo(() => {
    if (!pathD || points.length < 2) return "";
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = height - paddingY;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points, height, paddingY]);

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* 1. GRÁFICO DE TELEMETRIA SVG VETORIAL (Estilo Admin Minimalista) */}
      <div className="lg:col-span-2 bg-gradient-to-b from-brand-surface/90 via-brand-surface to-brand-surface/95 border border-brand-border rounded-2xl p-4 sm:p-5 shadow-sm">
        {/* Top Controls: Métrica & Timeframe */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/[0.06]">
          <div>
            <div className="text-[11px] font-mono text-brand-secondary uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-3.5 h-3.5 text-brand-white" />
              <span>Telemetria em Tempo Real de Tráfego</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-brand-white mt-1 flex items-baseline space-x-2">
              <span>
                {metric === "efficiency"
                  ? `${activePoint?.data.efficiency}%`
                  : activePoint?.val.toLocaleString("pt-BR")}
              </span>
              <span className="text-xs font-normal text-brand-muted">
                {metric === "total"
                  ? "requisições totais"
                  : metric === "clean"
                  ? "acessos limpos"
                  : metric === "threats"
                  ? "bots retidos"
                  : "taxa de bloqueio"}
              </span>
            </div>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center space-x-1 bg-black/40 border border-white/10 rounded-xl p-1 self-start sm:self-auto">
            {(["24h", "7d", "30d"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition ${
                  timeframe === tf
                    ? "bg-white text-black font-semibold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Métricas Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          {[
            { id: "total", label: "Volume Total", icon: Activity },
            { id: "clean", label: "Tráfego Limpo", icon: ShieldCheck },
            { id: "threats", label: "Bots Barrados", icon: ShieldAlert },
            { id: "efficiency", label: "Taxa de Blindagem", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = metric === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setMetric(tab.id as any)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition border ${
                  isSelected
                    ? "bg-white/[0.08] border-white/30 text-white font-medium"
                    : "border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.02]"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* SVG Container com Gráfico Vetorial Minimalista */}
        <div className="relative w-full overflow-hidden select-none">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-44 sm:h-52 overflow-visible"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id="userTrafficGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="85%" stopColor="#ffffff" stopOpacity="0.01" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Linhas de Grade Horizontais */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
              const y = paddingY + pct * graphHeight;
              const val = Math.round(maxVal - pct * (maxVal - minVal));
              return (
                <g key={idx}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeDasharray="2 3"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    fill="rgba(255, 255, 255, 0.25)"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    {metric === "efficiency" ? `${val}%` : val.toLocaleString("pt-BR")}
                  </text>
                </g>
              );
            })}

            {/* Linha Zero / Base */}
            <line
              x1={paddingX}
              y1={height - paddingY}
              x2={width - paddingX}
              y2={height - paddingY}
              stroke="rgba(255, 255, 255, 0.12)"
            />

            {/* Área com Gradiente Suave */}
            {areaD && !allZero && (
              <path d={areaD} fill="url(#userTrafficGradient)" />
            )}

            {/* Curva Suave Principal */}
            {pathD && !allZero && (
              <path
                d={pathD}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            )}

            {/* Linha Plana quando todos os valores são zero */}
            {allZero && (
              <line
                x1={paddingX}
                y1={height - paddingY}
                x2={width - paddingX}
                y2={height - paddingY}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
            )}

            {/* Linha Vertical Interativa e Ponto Ativo no Hover */}
            {hoverIndex !== null && activePoint && (
              <g>
                <line
                  x1={activePoint.x}
                  y1={paddingY}
                  x2={activePoint.x}
                  y2={height - paddingY}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="5"
                  fill="#ffffff"
                  stroke="#000000"
                  strokeWidth="2"
                  className="shadow-glow"
                />
              </g>
            )}

            {/* Zonas de Captura de Mouse Invisíveis por Coluna */}
            {points.map((pt, idx) => {
              const colWidth = graphWidth / points.length;
              return (
                <rect
                  key={idx}
                  x={pt.x - colWidth / 2}
                  y={paddingY}
                  width={colWidth}
                  height={graphHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(idx)}
                />
              );
            })}
          </svg>

          {/* Rótulos do Eixo X */}
          <div className="flex justify-between items-center text-[10px] text-brand-muted font-mono mt-1 px-4">
            <span>{chartData[0]?.label}</span>
            <span>{chartData[Math.floor(chartData.length / 2)]?.label}</span>
            <span>{chartData[chartData.length - 1]?.label}</span>
          </div>

          {/* Tooltip Flutuante no Hover */}
          {hoverIndex !== null && activePoint && (
            <div
              className="absolute pointer-events-none bg-neutral-950/95 border border-white/20 rounded-xl px-3 py-2 shadow-2xl backdrop-blur-md z-30 font-mono text-xs animate-in fade-in zoom-in-95 duration-150"
              style={{
                left: `${Math.min(Math.max(activePoint.x - 70, 10), width - 150)}px`,
                top: "10px",
              }}
            >
              <div className="text-[10px] text-neutral-400 font-medium pb-1 border-b border-white/10 mb-1">
                {activePoint.data.fullDate}
              </div>
              <div className="space-y-0.5 text-[11px]">
                <div className="flex justify-between space-x-3 text-neutral-300">
                  <span>Total:</span>
                  <span className="font-bold text-white">
                    {activePoint.data.total.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between space-x-3 text-emerald-400">
                  <span>Limpos:</span>
                  <span className="font-bold">
                    {activePoint.data.clean.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between space-x-3 text-red-400">
                  <span>Bots:</span>
                  <span className="font-bold">
                    {activePoint.data.threats.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="flex justify-between space-x-3 text-neutral-400 pt-0.5 border-t border-white/10">
                  <span>Retenção:</span>
                  <span className="font-bold text-white">
                    {activePoint.data.efficiency}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. DISTRIBUIÇÃO POR DISPOSITIVO & PRINCIPAIS REGIÕES */}
      <div className="bg-brand-surface border border-brand-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
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
                <span>Bots / Reviewers Barrados</span>
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

        {/* Top Regiões */}
        <div className="pt-4 border-t border-brand-border mt-4">
          <div className="text-xs font-semibold text-brand-white mb-2">Principais Regiões</div>
          <div className="space-y-1.5 text-xs font-mono">
            {geoData.length === 0 ? (
              <div className="text-[11px] text-brand-muted py-2">
                Nenhuma região com tráfego registrado no momento.
              </div>
            ) : (
              geoData.slice(0, 3).map((g, i) => (
                <div key={i} className="flex justify-between items-center text-brand-secondary">
                  <span className="flex items-center space-x-1.5">
                    <span className="text-sm select-none">{getCountryFlag(g.countryCode)}</span>
                    <span>{g.country}</span>
                  </span>
                  <span className="text-brand-white font-semibold">
                    {g.eventsCount} ({g.percentage}%)
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
