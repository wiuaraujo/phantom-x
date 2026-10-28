"use client";

import React, { useState } from "react";
import { Logo } from "@/components/ui/Logo";
import {
  Globe2,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Zap,
  Lock,
  Cpu,
  Fingerprint,
} from "lucide-react";

export const RoutingDiagram: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "human" | "bot">("all");

  return (
    <div className="relative w-full max-w-5xl mx-auto py-8 px-3 sm:px-4 select-none font-sans">
      {/* Outer Obsidian Frame with Monochromatic System Palette */}
      <div className="relative rounded-3xl bg-gradient-to-b from-brand-surface/90 via-brand-dark/95 to-brand-black border border-brand-border p-5 sm:p-7 md:p-9 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl overflow-hidden ring-1 ring-brand-border/40">
        {/* Subtle Ambient Background Gradients (Pure System Titanium/White) */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-40 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 left-1/4 w-80 h-40 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

        {/* Header HUD / Ingress Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-border gap-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-brand-surface border border-brand-border px-3 py-1.5 rounded-lg text-xs font-mono text-white">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="font-semibold tracking-wider">PIPELINE DE BORDA PHANTOM-X</span>
            </div>
            <span className="text-xs font-mono text-brand-muted hidden sm:inline">
              6 Camadas Determinísticas & Proxy Reverso 200 OK
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-brand-surface/80 border border-brand-border p-1 rounded-xl text-[11px] sm:text-xs font-mono overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                  : "text-brand-secondary hover:text-brand-white"
              }`}
            >
              Fluxo Completo
            </button>
            <button
              onClick={() => setActiveTab("human")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 whitespace-nowrap ${
                activeTab === "human"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                  : "text-brand-secondary hover:text-brand-white"
              }`}
            >
              <span>Visitante Real (Oferta)</span>
            </button>
            <button
              onClick={() => setActiveTab("bot")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 whitespace-nowrap ${
                activeTab === "bot"
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm"
                  : "text-brand-secondary hover:text-brand-white"
              }`}
            >
              <span>Moderadores & Bots (Whitepage)</span>
            </button>
          </div>
        </div>

        {/* 3-Stage Pipeline (Clean, unencumbered architecture in system palette) */}
        <div className="relative mt-8">
          <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* STAGE 1: INGRESSO MULTI-CANAL (Left 3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="text-[11px] font-mono text-brand-muted uppercase tracking-wider flex items-center space-x-1.5">
                <Globe2 className="w-3.5 h-3.5 text-brand-white" />
                <span>1. Ingressos de Tráfego</span>
              </div>

              {/* Ingress Card 1: Comprador / Visitante */}
              <div
                className={`relative p-4 rounded-2xl border transition-all ${
                  activeTab === "all" || activeTab === "human"
                    ? "bg-brand-surface border-brand-borderHighlight shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                    : "bg-brand-surface/40 border-brand-borderSubtle opacity-40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-white font-semibold border border-brand-border">
                    TRÁFEGO PAGO COM TOKEN
                  </span>
                  <span className="text-[10px] font-mono text-brand-secondary">4G/5G / WiFi</span>
                </div>
                <div className="text-xs font-bold text-brand-white">Visitante Humano Real</div>
                <div className="text-[11px] text-brand-secondary mt-1.5 leading-snug">
                  Clique com token <span className="font-mono text-brand-white">fbclid</span>, UTMs ativas, navegador com GPU WebGL física e IP residencial.
                </div>
              </div>

              {/* Ingress Card 2: Bots / Inspecionadores */}
              <div
                className={`relative p-4 rounded-2xl border transition-all ${
                  activeTab === "all" || activeTab === "bot"
                    ? "bg-brand-surface border-brand-borderHighlight shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                    : "bg-brand-surface/40 border-brand-borderSubtle opacity-40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-secondary font-semibold border border-brand-border">
                    MODERAÇÃO & SPY
                  </span>
                  <span className="text-[10px] font-mono text-brand-muted">Datacenters</span>
                </div>
                <div className="text-xs font-bold text-brand-secondary">Robôs de Anúncios & Scrapers</div>
                <div className="text-[11px] text-brand-secondary mt-1.5 leading-snug">
                  Meta Reviewers (<span className="font-mono text-brand-muted">AS32934</span>), AWS, Google Inspection, Spy Tools ou renderizadores virtuais.
                </div>
              </div>
            </div>

            {/* STAGE 2: PHANTOM-X CORE PROCESSOR (Center 6 cols - Clean with no wire clutter) */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center p-6 sm:p-7 rounded-3xl bg-brand-surface/60 border border-brand-border shadow-inner">
              {/* Concentric Telemetry Radar Rings */}
              <div className="absolute w-48 h-48 rounded-full border border-brand-border/40 animate-ping pointer-events-none opacity-20" />
              <div className="absolute w-64 h-64 rounded-full border border-brand-border/30 pointer-events-none" />

              {/* Central Vault com a Logomarca da Phantom (Paleta do Sistema) */}
              <div className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-brand-hover via-brand-surface to-brand-surface border border-brand-borderHighlight p-2 shadow-glow flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-2xl bg-brand-surface flex items-center justify-center p-2.5 border border-brand-border">
                  <Logo size={52} />
                </div>
              </div>

              {/* Processor Title */}
              <div className="relative z-10 mt-4 text-center">
                <span className="font-mono text-xs sm:text-sm font-bold text-brand-white tracking-widest uppercase">
                  Motor de Borda Phantom-X
                </span>
                <p className="text-[11px] text-brand-secondary mt-0.5 font-sans">
                  Pipeline de 6 Camadas na Borda • Decisão em &lt; 14ms
                </p>
              </div>

              {/* Live Real-Time 6-Layer Telemetry Tags */}
              <div className="relative z-10 mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 w-full text-[10px] font-mono">
                <div className="p-2 rounded-xl bg-brand-surface/80 border border-brand-border flex items-center space-x-1.5">
                  <Globe2 className="w-3 h-3 text-brand-white shrink-0" />
                  <span className="text-brand-secondary truncate">1. Geo-Fence (BR)</span>
                </div>
                <div className="p-2 rounded-xl bg-brand-surface/80 border border-brand-border flex items-center space-x-1.5">
                  <Cpu className="w-3 h-3 text-brand-white shrink-0" />
                  <span className="text-brand-secondary truncate">2. ASN Datacenter</span>
                </div>
                <div className="p-2 rounded-xl bg-brand-surface/80 border border-brand-border flex items-center space-x-1.5">
                  <Fingerprint className="w-3 h-3 text-brand-white shrink-0" />
                  <span className="text-brand-secondary truncate">3. Token fbclid</span>
                </div>
                <div className="p-2 rounded-xl bg-brand-surface/80 border border-brand-border flex items-center space-x-1.5">
                  <Zap className="w-3 h-3 text-brand-white shrink-0" />
                  <span className="text-brand-secondary truncate">4. Client Hints</span>
                </div>
                <div className="p-2 rounded-xl bg-brand-surface/80 border border-brand-border flex items-center space-x-1.5">
                  <Lock className="w-3 h-3 text-brand-white shrink-0" />
                  <span className="text-brand-secondary truncate">5. Threat Intel</span>
                </div>
                <div className="p-2 rounded-xl bg-brand-surface/80 border border-brand-border flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3 h-3 text-brand-white shrink-0" />
                  <span className="text-brand-secondary truncate">6. GPU WebGL</span>
                </div>
              </div>
            </div>

            {/* STAGE 3: DESTINOS AUTORIZADOS (Right 3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="text-[11px] font-mono text-brand-muted uppercase tracking-wider flex items-center space-x-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-brand-white" />
                <span>3. Entrega Determinística</span>
              </div>

              {/* Destination 1: Página de Oferta (Conversão) */}
              <div
                className={`relative p-4 rounded-2xl border transition-all ${
                  activeTab === "all" || activeTab === "human"
                    ? "bg-brand-surface border-brand-borderHighlight shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                    : "bg-brand-surface/40 border-brand-borderSubtle opacity-40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-white font-semibold border border-brand-border">
                    HTTP 200 PROXY REVERSO
                  </span>
                  <span className="text-[10px] font-mono text-brand-white flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-brand-white" />
                    <span>Liberado</span>
                  </span>
                </div>
                <div className="text-xs font-bold text-brand-white">Página de Oferta (Black)</div>
                <div className="text-[11px] text-brand-secondary mt-1.5 leading-snug">
                  Conteúdo injetado transparentemente no mesmo domínio, sem redirecionamentos 301/302 e parâmetros preservados.
                </div>
              </div>

              {/* Destination 2: Safe Page (Proteção & Compliance) */}
              <div
                className={`relative p-4 rounded-2xl border transition-all ${
                  activeTab === "all" || activeTab === "bot"
                    ? "bg-brand-surface border-brand-borderHighlight shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                    : "bg-brand-surface/40 border-brand-borderSubtle opacity-40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-brand-secondary font-semibold border border-brand-border">
                    HTTP 200 WHITEPAGE
                  </span>
                  <span className="text-[10px] font-mono text-brand-muted flex items-center space-x-1">
                    <ShieldAlert className="w-3 h-3 text-brand-muted" />
                    <span>Mitigado</span>
                  </span>
                </div>
                <div className="text-xs font-bold text-brand-secondary">Whitepage Compliance</div>
                <div className="text-[11px] text-brand-secondary mt-1.5 leading-snug">
                  Artigo neutro com header <span className="font-mono text-brand-muted">X-Robots-Tag: noindex</span> e sanitização estéril de resposta.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
