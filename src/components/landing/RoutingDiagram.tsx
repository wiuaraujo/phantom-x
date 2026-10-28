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
              Edge Telemetry & Real-Time Filtering
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-brand-black/70 border border-brand-border p-1 rounded-xl text-[11px] sm:text-xs font-mono overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-brand-secondary hover:text-white"
              }`}
            >
              Fluxo Completo
            </button>
            <button
              onClick={() => setActiveTab("human")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 whitespace-nowrap ${
                activeTab === "human"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-brand-secondary hover:text-white"
              }`}
            >
              <span>Visitante Real</span>
            </button>
            <button
              onClick={() => setActiveTab("bot")}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-1 whitespace-nowrap ${
                activeTab === "bot"
                  ? "bg-white text-black font-semibold shadow-sm"
                  : "text-brand-secondary hover:text-white"
              }`}
            >
              <span>Crawlers & Bots</span>
            </button>
          </div>
        </div>

        {/* 3-Stage Pipeline (Clean, unencumbered architecture in system palette) */}
        <div className="relative mt-8">
          <div className="relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* STAGE 1: INGRESSO MULTI-CANAL (Left 3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="text-[11px] font-mono text-brand-muted uppercase tracking-wider flex items-center space-x-1.5">
                <Globe2 className="w-3.5 h-3.5 text-white" />
                <span>1. Origens de Tráfego</span>
              </div>

              {/* Ingress Card 1: Comprador / Visitante */}
              <div
                className={`relative p-4 rounded-2xl border transition-all ${
                  activeTab === "all" || activeTab === "human"
                    ? "bg-brand-surface border-brand-borderHighlight shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                    : "bg-brand-black/40 border-brand-borderSubtle opacity-40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-white font-semibold border border-brand-border">
                    TRÁFEGO PAGO
                  </span>
                  <span className="text-[10px] font-mono text-brand-secondary">4G/5G / WiFi</span>
                </div>
                <div className="text-xs font-bold text-white">Visitante Humano Real</div>
                <div className="text-[11px] text-brand-secondary mt-1.5 leading-snug">
                  Meta Ads, TikTok, Google Search. Dispositivo móvel/desktop residencial.
                </div>
              </div>

              {/* Ingress Card 2: Bots / Inspecionadores */}
              <div
                className={`relative p-4 rounded-2xl border transition-all ${
                  activeTab === "all" || activeTab === "bot"
                    ? "bg-brand-surface border-brand-borderHighlight shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                    : "bg-brand-black/40 border-brand-borderSubtle opacity-40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-neutral-300 font-semibold border border-brand-border">
                    INSPEÇÃO
                  </span>
                  <span className="text-[10px] font-mono text-brand-muted">Datacenter ASN</span>
                </div>
                <div className="text-xs font-bold text-neutral-200">Bots & Review Crawlers</div>
                <div className="text-[11px] text-brand-secondary mt-1.5 leading-snug">
                  Google-InspectionTool, Facebot, ByteSpider, headless scrapers.
                </div>
              </div>
            </div>

            {/* STAGE 2: PHANTOM-X CORE PROCESSOR (Center 6 cols - Clean with no wire clutter) */}
            <div className="lg:col-span-6 relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-brand-black/60 border border-brand-border shadow-inner">
              {/* Concentric Telemetry Radar Rings */}
              <div className="absolute w-48 h-48 rounded-full border border-brand-border/40 animate-ping pointer-events-none opacity-20" />
              <div className="absolute w-64 h-64 rounded-full border border-brand-border/30 pointer-events-none" />

              {/* Central Vault com a Logomarca da Phantom (Paleta do Sistema) */}
              <div className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b from-brand-hover via-brand-surface to-brand-black border border-brand-borderHighlight p-2 shadow-glow flex items-center justify-center group hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-2xl bg-brand-black/90 flex items-center justify-center p-3 border border-brand-border">
                  <Logo size={62} className="filter drop-shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
                </div>
              </div>

              {/* Processor Title */}
              <div className="relative z-10 mt-5 text-center">
                <span className="font-mono text-sm font-bold text-white tracking-widest uppercase">
                  Motor de Decisão em Borda
                </span>
                <p className="text-xs text-brand-secondary mt-1 font-sans">
                  Inspeção de Assinatura, ASN e Risco em &lt; 14ms
                </p>
              </div>

              {/* Live Real-Time Telemetry Tags */}
              <div className="relative z-10 mt-5 grid grid-cols-2 gap-2.5 w-full max-w-sm text-[10px] sm:text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-brand-surface/70 border border-brand-border flex items-center space-x-2">
                  <Fingerprint className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="text-brand-secondary truncate">Click ID Assinado</span>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-surface/70 border border-brand-border flex items-center space-x-2">
                  <Zap className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="text-brand-secondary truncate">Latência &lt; 18ms</span>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-surface/70 border border-brand-border flex items-center space-x-2">
                  <Cpu className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="text-brand-secondary truncate">ASN IP Filtering</span>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-surface/70 border border-brand-border flex items-center space-x-2">
                  <Lock className="w-3.5 h-3.5 text-white shrink-0" />
                  <span className="text-brand-secondary truncate">Anti-Open Redirect</span>
                </div>
              </div>
            </div>

            {/* STAGE 3: DESTINOS AUTORIZADOS (Right 3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="text-[11px] font-mono text-brand-muted uppercase tracking-wider flex items-center space-x-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-white" />
                <span>3. Entrega Determinística</span>
              </div>

              {/* Destination 1: Página de Oferta (Conversão) */}
              <div
                className={`relative p-4 rounded-2xl border transition-all ${
                  activeTab === "all" || activeTab === "human"
                    ? "bg-brand-surface border-brand-borderHighlight shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                    : "bg-brand-black/40 border-brand-borderSubtle opacity-40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-white font-semibold border border-brand-border">
                    ROTA DE OFERTA
                  </span>
                  <span className="text-[10px] font-mono text-white flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                    <span>Liberado</span>
                  </span>
                </div>
                <div className="text-xs font-bold text-white">Página de Conversão</div>
                <div className="text-[11px] text-brand-secondary mt-1.5 leading-snug">
                  Checkout direto com preservação integral de UTMs e Click ID atribuído.
                </div>
              </div>

              {/* Destination 2: Safe Page (Proteção & Compliance) */}
              <div
                className={`relative p-4 rounded-2xl border transition-all ${
                  activeTab === "all" || activeTab === "bot"
                    ? "bg-brand-surface border-brand-borderHighlight shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
                    : "bg-brand-black/40 border-brand-borderSubtle opacity-40"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-hover text-neutral-300 font-semibold border border-brand-border">
                    ROTA SEGURA
                  </span>
                  <span className="text-[10px] font-mono text-brand-muted flex items-center space-x-1">
                    <ShieldAlert className="w-3 h-3 text-brand-muted" />
                    <span>Mitigado</span>
                  </span>
                </div>
                <div className="text-xs font-bold text-neutral-200">Safe Page / Verificação</div>
                <div className="text-[11px] text-brand-secondary mt-1.5 leading-snug">
                  Artigo neutro ou verificação institucional. Zero risco de reprovação ou bloqueio.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
