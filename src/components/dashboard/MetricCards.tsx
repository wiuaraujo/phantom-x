"use client";

import React from "react";
import { MetricOverview } from "@/types";
import { Users, Activity, Layers, Globe, ShieldAlert, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardsProps {
  metrics: MetricOverview;
  layout?: "row" | "compact";
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics, layout = "row" }) => {
  const cards = [
    {
      title: "Visitantes Ativos",
      value: metrics.activeVisitors.toLocaleString("pt-BR"),
      label: "Agora em tempo real",
      growth: metrics.periodGrowth.visitors,
      icon: Users,
    },
    {
      title: "Eventos Recebidos",
      value: metrics.totalEvents.toLocaleString("pt-BR"),
      label: "Últimas 24 horas",
      growth: metrics.periodGrowth.events,
      icon: Activity,
    },
    {
      title: "Tráfego Filtrado",
      value: metrics.automatedThreatsBlocked.toLocaleString("pt-BR"),
      label: "Mitigados e isolados",
      growth: metrics.periodGrowth.threats,
      icon: ShieldAlert,
    },
    {
      title: "Sessões Únicas",
      value: metrics.sessionCount.toLocaleString("pt-BR"),
      label: "Volume consolidado",
      growth: metrics.periodGrowth.sessions,
      icon: Layers,
    },
    {
      title: "Países Mapeados",
      value: metrics.uniqueCountries.toString(),
      label: "Origem geográfica",
      growth: 0,
      icon: Globe,
    },
  ];

  if (layout === "compact") {
    return (
      <div className="grid grid-cols-2 gap-3 h-full">
        {cards.slice(0, 4).map((card, i) => {
          const Icon = card.icon;
          const isPositive = card.growth > 0;
          return (
            <div
              key={i}
              className="bg-brand-surface border border-brand-border rounded-xl p-3.5 transition-all hover:border-brand-borderHighlight hover:shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-brand-secondary mb-2">
                <span className="text-[11px] font-medium tracking-wide">{card.title}</span>
                <Icon className="w-3.5 h-3.5 text-brand-muted" />
              </div>

              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl sm:text-2xl font-bold font-sans text-brand-white tracking-tight">
                  {card.value}
                </span>

                {card.growth !== 0 && (
                  <div className="flex items-center text-[10px] font-sans text-brand-secondary font-medium">
                    {isPositive ? (
                      <ArrowUpRight className="w-3 h-3 text-brand-white mr-0.5" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 text-brand-muted mr-0.5" />
                    )}
                    {Math.abs(card.growth)}%
                  </div>
                )}
              </div>

              <div className="mt-1.5 text-[10px] text-brand-muted">
                {card.label}
              </div>
            </div>
          );
        })}

        {/* 5th Card spanning full width in compact column */}
        <div className="col-span-2 bg-brand-surface border border-brand-border rounded-xl p-3.5 transition-all hover:border-brand-borderHighlight flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-brand-secondary flex items-center space-x-1.5">
              <Globe className="w-3.5 h-3.5 text-brand-muted" />
              <span>{cards[4].title}</span>
            </div>
            <div className="text-[10px] text-brand-muted mt-0.5">
              Cobertura cartográfica ativa no cluster
            </div>
          </div>
          <div className="text-2xl font-bold font-sans text-brand-white">
            {cards[4].value}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        const isPositive = card.growth > 0;
        const isThreatCard = card.title === "Tráfego Filtrado";
        const isLastCard = i === 4;

        return (
          <div
            key={i}
            className={`bg-brand-surface border border-brand-border rounded-xl p-3 sm:p-4 transition-all hover:border-brand-borderHighlight hover:shadow-sm flex flex-col justify-between ${
              isLastCard ? "col-span-2 sm:col-span-2 lg:col-span-1" : ""
            }`}
          >
            <div className="flex items-center justify-between text-brand-secondary mb-2 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-medium tracking-wide truncate">{card.title}</span>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-muted shrink-0 ml-1" />
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-lg sm:text-2xl font-bold font-sans text-brand-white tracking-tight">
                {card.value}
              </span>

              {card.growth !== 0 && (
                <div
                  className={`flex items-center text-[10px] sm:text-[11px] font-sans ${
                    isThreatCard
                      ? isPositive
                        ? "text-brand-secondary"
                        : "text-brand-white"
                      : isPositive
                      ? "text-brand-white font-semibold"
                      : "text-brand-secondary"
                  }`}
                >
                  {isPositive ? (
                    <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-0.5" />
                  )}
                  {Math.abs(card.growth)}%
                </div>
              )}
            </div>

            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-brand-muted truncate">
              {card.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
