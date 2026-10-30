"use client";

import React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Check, ArrowRight } from "lucide-react";

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 sm:py-24 px-4 sm:px-6 bg-brand-black border-t border-brand-border">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-mono tracking-widest uppercase text-brand-secondary">
            PLANOS &amp; INFRAESTRUTURA
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-brand-white tracking-tight mt-3 mb-4">
            Previsibilidade para cada escala de operação.
          </h2>
          <p className="text-sm sm:text-base text-brand-secondary">
            Todos os planos incluem nossa rede global de ingestão, roteamento condicional
            seguro em nível de borda com Proxy Reverso HTTP 200 OK.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {siteConfig.pricing.map((plan) => {
            const isScale = plan.id === "scale";

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-brand-surface border-2 border-neutral-800 dark:border-white/80 shadow-2xl shadow-purple-950/20 ring-1 ring-white/10"
                    : "bg-brand-surface border border-brand-border hover:border-brand-borderHighlight"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black text-[10px] font-mono font-bold tracking-wider uppercase shadow-md">
                    Mais Popular
                  </div>
                )}

                <div>
                  {/* Badge de Volume / Cliques */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide border ${
                        isScale
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-neutral-900 text-neutral-300 border-neutral-800"
                      }`}
                    >
                      {plan.limits.eventsPerMonth}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-brand-white tracking-tight mt-1">{plan.name}</h3>

                  {/* Bandeiras de Países (Lógica idêntica com sequência ajustada) */}
                  <div className="flex items-center space-x-1.5 mt-2 mb-4">
                    <div className="flex items-center space-x-1 text-base leading-none select-none">
                      {plan.flagIcons.map((flag, idx) => (
                        <span key={idx} className="inline-block transform hover:scale-125 transition-transform">
                          {flag}
                        </span>
                      ))}
                    </div>
                    {plan.flagExtra && (
                      <span className="text-xs font-mono font-semibold text-neutral-400 tracking-tight ml-0.5">
                        {plan.flagExtra}
                      </span>
                    )}
                  </div>

                  {/* Preço */}
                  <div className="flex items-baseline space-x-1 pb-4 mb-5 border-b border-brand-border">
                    <span className="text-xs font-mono text-brand-muted">{plan.currency}</span>
                    <span className="text-4xl font-extrabold font-mono text-brand-white tracking-tight">
                      {plan.priceMonthly}
                    </span>
                    <span className="text-xs font-mono text-brand-secondary">/mês</span>
                  </div>

                  {/* Botão de Cadastro para Início */}
                  <Link
                    href={`/signup?plan=${plan.id}`}
                    className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition mb-6 shadow-sm ${
                      plan.highlighted
                        ? "bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                        : "bg-neutral-900 hover:bg-neutral-800 text-white border border-brand-border"
                    }`}
                  >
                    <span>Começar Agora</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {/* Tabela de Especificações do Plano */}
                  <div className="space-y-2 py-3 border-t border-b border-brand-border text-xs font-mono mb-6">
                    <div className="flex justify-between items-center text-brand-secondary">
                      <span>Região</span>
                      <span className="font-semibold text-brand-white">{plan.region}</span>
                    </div>
                    <div className="flex justify-between items-center text-brand-secondary">
                      <span>Domínios</span>
                      <span className="font-semibold text-emerald-400">{plan.limits.domains}</span>
                    </div>
                    <div className="flex justify-between items-center text-brand-secondary">
                      <span>Páginas</span>
                      <span className="font-semibold text-brand-white">{plan.limits.pages}</span>
                    </div>
                    <div className="flex justify-between items-center text-brand-secondary">
                      <span>Camuflagens</span>
                      <span className="font-semibold text-purple-400">{plan.limits.campaigns}</span>
                    </div>
                    <div className="flex justify-between items-center text-brand-secondary">
                      <span>Armazenamento</span>
                      <span className="font-semibold text-brand-white">
                        {plan.limits.storageMb >= 1000
                          ? `${plan.limits.storageMb / 1000} GB`
                          : `${plan.limits.storageMb} MB`}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Features do Sistema */}
                  <ul className="space-y-2.5 mb-6 text-xs text-brand-secondary">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mr-2 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Fontes de Tráfego Homologadas no Rodapé */}
                <div className="pt-4 border-t border-brand-border">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-2">
                    Fontes de Tráfego:
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-neutral-300">
                    {plan.trafficSources.map((source, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-neutral-950 border border-brand-border text-neutral-300"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div className="mt-12 text-center text-xs text-brand-muted font-mono">
          Precisa de limites customizados ou ambiente isolado (Single-Tenant)?{" "}
          <a href="mailto:contato@phantom-x.pro" className="text-white hover:underline">
            Fale com nossa equipe técnica
          </a>
          .
        </div>
      </div>
    </section>
  );
};
