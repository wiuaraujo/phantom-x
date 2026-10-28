"use client";

import React from "react";
import {
  ArrowRightLeft,
  Cpu,
  Fingerprint,
  ShieldCheck,
  MonitorCheck,
  Zap,
  ArrowUpRight,
} from "lucide-react";

export const Features: React.FC = () => {
  const features = [
    {
      title: "Proxy Reverso Transparente (HTTP 200 OK)",
      description:
        "Elimine redirecionamentos 301/302 suspeitos para crawlers. O Cloudflare Worker busca e injeta a página de oferta diretamente no mesmo domínio, preservando a barra de navegação, cookies e parâmetros de conversão.",
      icon: ArrowRightLeft,
      tag: "Reverse Proxy 200",
    },
    {
      title: "Filtro de ASN & Datacenters de Moderação",
      description:
        "Blacklist em memória dos Autonomous System Numbers (ASNs) de servidores da Meta (AS32934), Google (AS15169), AWS (AS16509), Hetzner, DigitalOcean e ferramentas de espionagem (AdPlexity, SpyFu).",
      icon: Cpu,
      tag: "ASN Intelligence",
    },
    {
      title: "Validação Estrita de Tokens de Tráfego Pago",
      description:
        "Exigência de clique verificado. Qualquer acesso direto, robô explorador ou requisição sem token legítimo (fbclid ou utm_source) é imediatamente direcionado à Whitepage de conformidade institucional.",
      icon: Fingerprint,
      tag: "Token Attribution",
    },
    {
      title: "Threat Intelligence em Tempo Real",
      description:
        "Consulta resiliente de reputação de IP com fallback gracioso. Identifique e barre instantaneamente redes Tor, VPNs comerciais, proxies residenciais de crawlers e nós de saída suspeitos.",
      icon: ShieldCheck,
      tag: "Threat Intel",
    },
    {
      title: "Fingerprint Client-Side de Hardware (GPU WebGL)",
      description:
        "Camada 7 de telemetria no navegador do visitante. Detecta renderizadores de software virtuais (SwiftShader, llvmpipe), ambientes headless (navigator.webdriver) e hash Canvas 2D.",
      icon: MonitorCheck,
      tag: "Hardware GPU",
    },
    {
      title: "Gerador Instantâneo de Cloudflare Worker",
      description:
        "Compile e baixe o código JavaScript completo do Worker com 1 clique diretamente do console operacional. Código otimizado, sem dependências externas, pronto para implantação no Cloudflare Workers.",
      icon: Zap,
      tag: "Edge Engine",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-24 px-4 sm:px-6 bg-brand-black border-t border-brand-border font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-mono tracking-widest uppercase text-brand-secondary">
            ARQUITETURA DE BLINDAGEM DETERMINÍSTICA
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-brand-white tracking-tight mt-3 mb-4">
            Controle absoluto sobre cada requisição.
          </h2>
          <p className="text-sm sm:text-base text-brand-secondary font-normal">
            Engenharia de borda desenvolvida especificamente para operações que demandam imunidade a moderação,
            zero rastros para robôs e máxima taxa de conversão.
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
