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
            PLANOS & INFRAESTRUTURA
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-brand-white tracking-tight mt-3 mb-4">
            Previsibilidade para cada escala de operação.
          </h2>
          <p className="text-sm sm:text-base text-brand-secondary">
            Todos os planos incluem nossa rede global de ingestão, roteamento condicional
            seguro e dashboards de inteligência.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {siteConfig.pricing.map((plan) => {
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-brand-surface border-2 border-neutral-900 dark:border-white shadow-glow-sm"
                    : "bg-brand-surface border border-brand-border hover:border-brand-borderHighlight"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-black text-[10px] font-mono font-bold tracking-wider uppercase shadow-sm">
                    Recomendado
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="text-xl font-bold text-brand-white tracking-tight">{plan.name}</h3>
                    <span className="text-xs font-mono text-brand-muted">
                      {plan.limits.eventsPerMonth}
                    </span>
                  </div>

                  <p className="text-xs text-brand-secondary mb-6 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline space-x-1 pb-6 mb-6 border-b border-brand-border">
                    <span className="text-xs font-mono text-brand-muted">{plan.currency}</span>
                    <span className="text-4xl font-extrabold font-mono text-brand-white tracking-tight">
                      {plan.priceMonthly}
                    </span>
                    <span className="text-xs font-mono text-brand-secondary">/mês</span>
                  </div>

                  {/* Plan Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feat, i) => (
                      <li key={i} className="flex items-start text-xs text-brand-secondary">
                        <Check className="w-4 h-4 text-neutral-900 dark:text-white shrink-0 mr-2.5 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/signup"
                  className={`w-full py-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition ${
                    plan.highlighted
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-sm"
                      : "bg-brand-hover hover:bg-brand-surface text-brand-white border border-brand-border"
                  }`}
                >
                  <span>Começar no plano {plan.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div className="mt-12 text-center text-xs text-brand-muted font-mono">
          Precisa de limites customizados ou ambiente isolado (Single-Tenant)?{" "}
          <a href="mailto:contato@phantomx.pro" className="text-white hover:underline">
            Fale com nossa equipe técnica
          </a>
          .
        </div>
      </div>
    </section>
  );
};
