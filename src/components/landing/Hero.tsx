"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { TechGlobe } from "../globe/TechGlobe";
import { RoutingDiagram } from "./RoutingDiagram";
import { useLanguage } from "@/lib/i18n";

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start pt-28 sm:pt-36 md:pt-44 pb-20 overflow-hidden bg-brand-black">
      {/* Hero Headline & Content Area with Globe anchored directly behind it */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center">
        {/* 
          3D Rotating Dotted Globe:
          Anchored directly relative to this headline container so on mobile, tablet and desktop
          it is ALWAYS framed directly behind the headline text (h1 + subtitle),
          never sliding down behind the pipeline or routing diagram.
          The top curve comfortably clears the navbar.
        */}
        <div className="absolute top-24 sm:top-36 md:top-40 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] xs:w-[380px] xs:h-[380px] sm:w-[540px] sm:h-[540px] md:w-[680px] md:h-[680px] pointer-events-none z-0 opacity-70 sm:opacity-75 flex items-center justify-center">
          {/* Subtle Ambient Radial Backlight */}
          <div className="absolute inset-0 rounded-full dark:bg-[radial-gradient(circle,rgba(255,255,255,0.08)_0%,transparent_70%)] bg-[radial-gradient(circle,rgba(0,0,0,0.04)_0%,transparent_70%)] blur-2xl pointer-events-none" />
          <TechGlobe className="w-full h-full" />
        </div>

        {/* Main Headline */}
        <h1 className="relative z-10 text-3xl xs:text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.12] mb-4 sm:mb-6 font-sans drop-shadow-md">
          {t.hero.titleLine1} <br />
          <span className="text-brand-secondary font-medium">{t.hero.titleLine2}</span>
        </h1>

        {/* Subheadline */}
        <p className="relative z-10 max-w-2xl text-sm sm:text-lg text-brand-secondary leading-relaxed font-sans font-normal mb-8 sm:mb-9 px-2 sm:px-0">
          {t.hero.subtitle}
        </p>

        {/* CTA Buttons */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
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
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white">{t.hero.latency}</span>
        </div>
        <div className="hidden sm:block text-brand-muted">
          {t.hero.cluster}
        </div>
        <div className="text-white">
          {t.hero.cleanTraffic}
        </div>
      </div>
    </section>
  );
};
