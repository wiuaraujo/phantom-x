"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Zap, Shield, ArrowRightLeft } from "lucide-react";
import { TechGlobe } from "../globe/TechGlobe";
import { RoutingDiagram } from "./RoutingDiagram";
import { PlatformLogosMarquee } from "./PlatformLogosMarquee";
import { useLanguage } from "@/lib/i18n";

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-28 sm:pt-36 md:pt-44 pb-20 overflow-hidden bg-brand-black">
      {/* 
        3D Rotating Dotted Globe:
        Enlarged to fill the hero tab, anchored strictly below the navbar, with zoom disabled.
      */}
      <div className="absolute top-20 sm:top-24 md:top-24 left-1/2 -translate-x-1/2 w-[340px] h-[340px] xs:w-[440px] xs:h-[440px] sm:w-[700px] sm:h-[700px] md:w-[920px] md:h-[920px] lg:w-[1150px] lg:h-[1150px] xl:w-[1300px] xl:h-[1300px] max-w-[98vw] pointer-events-auto z-0 opacity-90 sm:opacity-95 flex items-center justify-center select-none">
        {/* Subtle Ambient Radial Backlight */}
        <div className="absolute inset-0 rounded-full dark:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] bg-[radial-gradient(circle,rgba(0,0,0,0.04)_0%,transparent_70%)] blur-3xl pointer-events-none" />
        <TechGlobe className="w-full h-full" enableZoom={false} />
      </div>

      {/* Hero Headline & Content Area */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">

        {/* Main Headline */}
        <h1 className="relative z-10 text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-brand-white leading-[1.12] mb-4 sm:mb-6 font-sans drop-shadow-md select-none pointer-events-none">
          {t.hero.titleLine1} <br />
          <span className="text-brand-secondary font-medium">{t.hero.titleLine2}</span>
        </h1>

        {/* Subheadline */}
        <p className="relative z-10 max-w-2xl text-sm sm:text-lg text-brand-secondary leading-relaxed font-sans font-normal mb-7 sm:mb-8 px-2 sm:px-0 select-none pointer-events-none">
          {t.hero.subtitle}
        </p>

        {/* Architecture Highlights: 3 Pillars */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5 w-full max-w-3xl mb-8 pointer-events-auto text-left">
          <div className="p-3 sm:p-3.5 rounded-xl bg-brand-surface/85 backdrop-blur-md border border-brand-border/80 hover:border-brand-borderHighlight transition shadow-sm">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-brand-hover flex items-center justify-center text-brand-white">
                <Zap className="w-3 h-3 text-brand-white" />
              </div>
              <span className="text-xs font-mono font-bold text-brand-white">&lt; 14ms Latência</span>
            </div>
            <p className="text-[11px] text-brand-secondary leading-snug">
              Processamento em borda global com geolocalização e roteamento instantâneo.
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-brand-surface/85 backdrop-blur-md border border-brand-border/80 hover:border-brand-borderHighlight transition shadow-sm">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-brand-hover flex items-center justify-center text-brand-white">
                <Shield className="w-3 h-3 text-brand-white" />
              </div>
              <span className="text-xs font-mono font-bold text-brand-white">Creative Shield</span>
            </div>
            <p className="text-[11px] text-brand-secondary leading-snug">
              Auditoria pré-voo de criativos e proteção contra reprovações de políticas.
            </p>
          </div>

          <div className="p-3 sm:p-3.5 rounded-xl bg-brand-surface/85 backdrop-blur-md border border-brand-border/80 hover:border-brand-borderHighlight transition shadow-sm">
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-brand-hover flex items-center justify-center text-brand-white">
                <ArrowRightLeft className="w-3 h-3 text-brand-white" />
              </div>
              <span className="text-xs font-mono font-bold text-brand-white">Proxy Reverso 200 OK</span>
            </div>
            <p className="text-[11px] text-brand-secondary leading-snug">
              Oferta servida no mesmo domínio com fbclid, UTMs e zero rastros de JS.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto pointer-events-auto">
          <Link
            href="/signup"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-black font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center justify-center space-x-2 group"
          >
            <span>{t.hero.startFree}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-brand-surface/90 backdrop-blur hover:bg-brand-hover text-brand-white font-medium text-sm border border-brand-border transition flex items-center justify-center space-x-2"
          >
            <span>{t.hero.explore}</span>
            <ChevronDown className="w-4 h-4 text-brand-secondary" />
          </a>
        </div>
      </div>

      {/* Central Interconnected Engine Diagram */}
      <div className="relative z-20 w-full mt-10 sm:mt-12">
        <RoutingDiagram />
      </div>

      {/* Live Micro Ticker at bottom */}
      <div className="relative z-20 mt-8 w-full max-w-4xl px-4 flex items-center justify-between text-[11px] font-mono text-brand-secondary border-t border-brand-borderSubtle pt-4">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white animate-pulse" />
          <span className="text-brand-white">{t.hero.latency}</span>
        </div>
        <div className="hidden sm:block text-brand-muted">
          {t.hero.cluster}
        </div>
        <div className="text-brand-white">
          {t.hero.cleanTraffic}
        </div>
      </div>

      {/* Marquee de Logotipos das Plataformas Homologadas (Passando da direita para a esquerda) */}
      <PlatformLogosMarquee />
    </section>
  );
};
