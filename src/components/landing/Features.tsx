"use client";

import React from "react";
import {
  Activity,
  Globe2,
  Layers,
  Filter,
  Server,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";

export const Features: React.FC = () => {
  const features = [
    {
      title: "Monitoramento em tempo real",
      description:
        "Acompanhe os eventos recebidos pelo sistema e visualize a atividade recente em milissegundos com stream contínuo.",
      icon: Activity,
      tag: "Live Stream",
    },
    {
      title: "Mapa global de acessos",
      description:
        "Explore a distribuição geográfica aproximada dos acessos através de um mapa interativo com telemetria por país e cidade.",
      icon: Globe2,
      tag: "Geolocalização",
    },
    {
      title: "Análise de campanhas",
      description:
        "Organize eventos por domínio, campanha, origem e parâmetros UTM completos (source, medium, campaign, content).",
      icon: Layers,
      tag: "Atribuição",
    },
    {
      title: "Proteção contra tráfego automatizado",
      description:
        "Identifique padrões suspeitos, aplique limites de requisições (rate limit) e consulte registros detalhados de segurança.",
      icon: Filter,
      tag: "Mitigação",
    },
    {
      title: "Gestão de domínios",
      description:
        "Organize domínios cadastrados e acompanhe o status de apontamento DNS e certificados SSL em tempo real.",
      icon: Server,
      tag: "Infraestrutura",
    },
    {
      title: "Relatórios e histórico",
      description:
        "Consulte tendências históricas, períodos personalizados, principais origens de tráfego e métricas consolidadas.",
      icon: BarChart3,
      tag: "Analytics",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-24 px-4 sm:px-6 bg-brand-black border-t border-brand-border font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-brand-white tracking-tight mt-3 mb-4">
            Controle absoluto sobre cada requisição.
          </h2>
          <p className="text-sm sm:text-base text-brand-secondary font-normal">
            Construído para operações que demandam visibilidade instantânea, segurança de borda
            e clareza analítica em escala.
          </p>
        </div>

        {/* Feature Cards Grid with Subtle Dark Gradients */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative bg-brand-surface border border-brand-border hover:border-brand-borderHighlight rounded-2xl p-5 sm:p-7 transition-all duration-300 hover:shadow-glow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5 sm:mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand-hover border border-brand-border flex items-center justify-center text-brand-white group-hover:border-brand-borderHighlight transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono text-brand-muted uppercase tracking-wider">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-brand-white mb-2 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-brand-borderSubtle flex items-center justify-between text-xs text-brand-secondary group-hover:text-brand-white transition-colors">
                  <span>Módulo Operacional</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
