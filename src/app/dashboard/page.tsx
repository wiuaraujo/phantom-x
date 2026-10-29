"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/dashboard/Header";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { DigitalMatrixWorldMap } from "@/components/dashboard/DigitalMatrixWorldMap";
import { TrafficCharts } from "@/components/dashboard/TrafficCharts";
import { store } from "@/lib/store";
import { auth } from "@/lib/auth";
import { TrafficEvent, GeoAggregate, MetricOverview } from "@/types";
import { getCountryFlag, LocationBadge } from "@/lib/geoFlags";
import { getDashboardGreeting } from "@/lib/userGreeting";
import {
  Activity,
  RefreshCw,
  Send,
  Radio,
  Globe2,
  PlusCircle,
  Layers,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Sliders,
  Clock,
  RotateCcw,
  Crown,
} from "lucide-react";
import { UpgradePlanModal } from "@/components/dashboard/UpgradePlanModal";
import { getPlanDefinition } from "@/lib/plans";

export default function DashboardOverview() {
  const [selectedDomain, setSelectedDomain] = useState("Todos os Domínios");
  const [selectedPeriod, setSelectedPeriod] = useState("24h");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [session, setSession] = useState(() => auth.getSession());
  const [greeting, setGreeting] = useState(() => getDashboardGreeting(session?.user));

  const [metrics, setMetrics] = useState<MetricOverview>(store.getOverviewMetrics());
  const [geoData, setGeoData] = useState<GeoAggregate[]>(store.getGeoDistribution());
  const [timeSeries, setTimeSeries] = useState(store.getTimeSeries(24));
  const [events, setEvents] = useState<TrafficEvent[]>([]);
  const [availableDomains, setAvailableDomains] = useState<string[]>(["Todos os Domínios"]);
  const [hasSimulatedEvents, setHasSimulatedEvents] = useState(false);
  const [revertNotice, setRevertNotice] = useState<string | null>(null);
  const [stripeSuccessNotice, setStripeSuccessNotice] = useState<string | null>(null);

  // Upgrade & Quota States
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const userPlan = session?.user?.plan || "free";
  const planDef = getPlanDefinition(userPlan);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const isUpgraded = params.get("upgraded") === "1";
      const planParam = params.get("plan");
      const isSimulated = params.get("simulated_stripe") === "1";

      if (isUpgraded && planParam) {
        const targetPlan = planParam as any;
        const currentSession = auth.getSession();
        if (currentSession?.user) {
          auth.updateUserPlan(currentSession.user.id, targetPlan, "active");
        }
        const planName = targetPlan.toUpperCase();
        setStripeSuccessNotice(
          isSimulated
            ? `Assinatura do Plano ${planName} ativada com sucesso! (Modo de Demonstração Stripe)`
            : `🎉 Pagamento confirmado pela Stripe! Seu Plano ${planName} foi ativado e todos os limites foram desbloqueados.`
        );
        window.history.replaceState({}, "", "/dashboard");
        loadData();
      }

      const promptPlan = params.get("upgrade_prompt");
      if (promptPlan && ["starter", "growth", "scale"].includes(promptPlan)) {
        setUpgradeReason(
          `Você selecionou o plano ${promptPlan.toUpperCase()} ao se cadastrar. Conclua a assinatura pela Stripe para desbloquear o acesso total imediatamente.`
        );
        setShowUpgradeModal(true);
        window.history.replaceState({}, "", "/dashboard");
      }
    }
  }, []);

  const loadData = () => {
    const currentSession = auth.getSession();
    setSession(currentSession);
    setGreeting(getDashboardGreeting(currentSession?.user));

    setMetrics(store.getOverviewMetrics());
    setGeoData(store.getGeoDistribution());
    setTimeSeries(store.getTimeSeries(24));
    setEvents(
      store.getEvents({
        limit: 10,
        domain: selectedDomain === "Todos os Domínios" ? undefined : selectedDomain,
        country: selectedCountry || undefined,
      })
    );
    const userDomains = store.getDomains().map((d) => d.name);
    setAvailableDomains(["Todos os Domínios", ...userDomains]);
    setHasSimulatedEvents(store.hasSimulatedData());
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedDomain, selectedCountry, selectedPeriod]);

  const handleSimulateBurst = async () => {
    try {
      store.generateRandomSimulatedEvent();
      loadData();
      setRevertNotice("Requisição de teste simulada com sucesso! Você pode testar sem conectar domínio e reverter a qualquer momento.");
      setTimeout(() => setRevertNotice(null), 6000);
    } catch (err: any) {
      setUpgradeReason(err?.message || "Limite de 100 eventos atingido na conta gratuita.");
      setShowUpgradeModal(true);
    }
  };

  const handleRevertSimulations = () => {
    const res = store.revertSimulatedEvents();
    loadData();
    setRevertNotice(`Teste revertido com sucesso! ${res.count} evento(s) simulados foram removidos e o dashboard voltou ao estado limpo.`);
    setTimeout(() => setRevertNotice(null), 6000);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black font-sans">
      <Header
        title="Visão Geral da Operação"
        subtitle="Monitoramento unificado de borda, telemetria global e análise de risco"
        domains={availableDomains}
        selectedDomain={selectedDomain}
        onSelectDomain={setSelectedDomain}
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
      />

      <div className="p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-7 max-w-[1600px] w-full mx-auto">
        {/* 
          ======================================================================
          0. CLEAN OPERATIONAL GREETING BANNER
          "deixe somente olá e o nome da pessoa. Abaixo, pode remover esse centro de
          comando sincronizado com o fuso horário e tal. Deixar bem clean essa parte."
          ======================================================================
        */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 rounded-2xl bg-brand-surface border border-brand-border shadow-sm">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-brand-white tracking-tight">
              Olá, {greeting.displayName}!
            </h2>
          </div>

          <Link
            href="/dashboard/settings?tab=profile"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-hover text-brand-secondary hover:text-brand-white border border-brand-border transition text-xs font-mono shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Configurações do Perfil</span>
          </Link>
        </div>

        {/* Notificação de Confirmação de Assinatura Stripe */}
        {stripeSuccessNotice && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs font-mono flex items-center justify-between shadow-lg shadow-emerald-950/40 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{stripeSuccessNotice}</span>
            </div>
            <button
              onClick={() => setStripeSuccessNotice(null)}
              className="px-2 py-0.5 rounded text-neutral-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Banner de Quota Operacional Fiel ao Plano */}
        <div className={`p-3.5 sm:p-4 rounded-2xl border text-xs font-mono flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md ${
          userPlan === "scale"
            ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-200"
            : userPlan === "growth"
            ? "bg-purple-950/20 border-purple-500/30 text-purple-200"
            : userPlan === "starter"
            ? "bg-neutral-900 border-neutral-700 text-neutral-200"
            : "bg-neutral-900/90 border-amber-500/30 text-amber-200"
        }`}>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              userPlan === "scale"
                ? "bg-emerald-400"
                : userPlan === "growth"
                ? "bg-purple-400"
                : userPlan === "starter"
                ? "bg-blue-400"
                : "bg-amber-400 animate-pulse"
            }`} />
            <div>
              <span className="font-bold text-white uppercase tracking-wider">
                Plano {planDef.name}
              </span>
              <span className="text-neutral-400 ml-2">
                Eventos analisados:{" "}
                <strong className={
                  planDef.limits.maxEventsMonthly !== -1 && metrics.totalEvents >= planDef.limits.maxEventsMonthly
                    ? "text-red-400 font-bold"
                    : "text-white"
                }>
                  {metrics.totalEvents.toLocaleString("pt-BR")}
                </strong>{" "}
                / {planDef.limits.maxEventsMonthly === -1 ? "Ilimitados" : `${planDef.limits.maxEventsMonthly.toLocaleString("pt-BR")} no mês`}
              </span>
              <span className="text-neutral-500 ml-2">•</span>
              <span className="text-neutral-300 ml-2">
                Região: <strong className="text-white">{planDef.region}</strong> {planDef.flags}
              </span>
            </div>
          </div>

          {userPlan !== "scale" && (
            <button
              onClick={() => {
                setUpgradeReason(
                  userPlan === "free"
                    ? "Sua conta gratuita está restrita a 100 eventos, 1 domínio e 1 cloaker. Ative o plano Starter (R$ 149), Growth (R$ 389) ou Scale (R$ 529) para desbloquear seu tráfego."
                    : userPlan === "starter"
                    ? "Faça upgrade para o plano Growth (R$ 389) ou Scale (R$ 529) para desbloquear 100.000 cliques, América Latina e telemetria de GPU."
                    : "Faça upgrade para o plano Scale (R$ 529) para ter cliques 100% ilimitados, cobertura global de 247 países e Kill-Switch de emergência."
                );
                setShowUpgradeModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold text-xs uppercase tracking-wider shadow-sm transition flex items-center space-x-1.5 shrink-0 cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{userPlan === "free" ? "Ativar Plano Comercial" : "Expandir Capacidade"}</span>
            </button>
          )}
        </div>
        {/* Revert / Test Feedback Notice */}
        {revertNotice && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-white animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{revertNotice}</span>
            </div>
            <button
              onClick={() => setRevertNotice(null)}
              className="text-brand-muted hover:text-white ml-2 text-xs"
              title="Fechar"
            >
              ✕
            </button>
          </div>
        )}

        {/* 
          ======================================================================
          1. IMMERSIVE MAIN BANNER: DIGITAL MATRIX WORLD MAP 360° OVAL
          "manter esse estilo de mapa, porém com dinâmica de 360 graus baseado
          no mapa mundi, meio que oval. O mapa no mobile tem que ficar na horizontal"
          ======================================================================
        */}
        <div className="relative w-full h-[260px] xs:h-[300px] sm:h-[440px] lg:h-[600px] rounded-2xl bg-brand-surface border border-brand-border overflow-hidden shadow-sm flex flex-col">
          {/* Panoramic Map Header Floating Overlay (Limpo, sem textos de matriz global) */}
          <div className="absolute top-0 inset-x-0 z-20 p-2.5 sm:p-5 flex items-center justify-end gap-2 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none">
            {/* Actions Bar */}
            <div className="flex items-center space-x-1.5 pointer-events-auto shrink-0">
              {selectedCountry && (
                <div className="flex items-center space-x-1 bg-brand-surface border border-brand-border px-2 py-1 rounded-lg text-[11px] font-mono text-brand-white">
                  <span className="text-xs select-none">{getCountryFlag(selectedCountry)}</span>
                  <span className="hidden xs:inline">[{selectedCountry}]</span>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="text-brand-muted hover:text-brand-white ml-0.5"
                    title="Limpar filtro de país"
                  >
                    ✕
                  </button>
                </div>
              )}

              <button
                onClick={handleSimulateBurst}
                className="hover:bg-brand-hover text-brand-white flex items-center space-x-1.5 text-[11px] bg-brand-surface px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-brand-border transition font-medium shadow-glow-sm"
                title="Testar tráfego sem conectar domínio (injetar requisição de teste)"
              >
                <Send className="w-3 h-3 text-brand-white" />
                <span className="hidden xs:inline">Testar / Simular</span>
              </button>

              {hasSimulatedEvents && (
                <button
                  onClick={handleRevertSimulations}
                  className="bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 hover:text-amber-200 border border-amber-500/40 flex items-center space-x-1.5 text-[11px] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg transition font-mono shadow-sm animate-in fade-in"
                  title="Reverter testes e restaurar dashboard limpo"
                >
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>Reverter Teste</span>
                </button>
              )}

              <button
                onClick={loadData}
                className="hover:bg-brand-hover hover:text-brand-white p-1 sm:p-2 rounded-lg bg-brand-surface border border-brand-border text-brand-secondary transition"
                title="Recarregar dados"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Full Panoramic Map Canvas */}
          <div className="flex-1 w-full h-full relative">
            <DigitalMatrixWorldMap
              events={events}
              geoData={geoData}
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
              className="w-full h-full"
            />
          </div>
        </div>

        {/* 
          ======================================================================
          2. METRIC CARDS ROW (5 COLUMNS BELOW IMMERSIVE BANNER)
          ======================================================================
        */}
        <div>
          <MetricCards metrics={metrics} layout="row" />
        </div>

        {/* 
          ======================================================================
          3. ONBOARDING / ZERO-STATE GUIDANCE (SHOWN WHEN totalEvents === 0)
          ======================================================================
        */}
        {metrics.totalEvents === 0 && (
          <div className="bg-brand-surface border border-brand-border rounded-2xl p-6 sm:p-7 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center space-x-2 text-xs font-mono text-brand-secondary">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <span>AMBIENTE DE BORDA INICIALIZADO</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-brand-white tracking-tight">
                  Sua conta Phantom-X está ativa e pronta para receber tráfego
                </h3>
                <p className="text-xs sm:text-sm text-brand-secondary leading-relaxed">
                  Os contadores acima começam em zero e serão atualizados em tempo real assim que suas campanhas receberem requisições de usuários ou crawlers.
                </p>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <Link
                  href="/dashboard/domains"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm"
                >
                  <Globe2 className="w-4 h-4" />
                  <span>Conectar Domínio</span>
                </Link>

                <Link
                  href="/dashboard/campaigns"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-surface text-brand-white border border-brand-border font-medium text-xs hover:bg-brand-hover transition"
                >
                  <Layers className="w-4 h-4 text-brand-secondary" />
                  <span>Criar Campanha</span>
                </Link>

                <button
                  onClick={handleSimulateBurst}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-surface text-brand-secondary border border-brand-border font-medium text-xs hover:text-brand-white hover:bg-brand-hover transition"
                >
                  <Send className="w-3.5 h-3.5 text-brand-white" />
                  <span>Testar Requisição</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 
          ======================================================================
          4. TRAFFIC ANALYTICAL CHARTS (HISTOGRAM & GEO BREAKDOWN)
          ======================================================================
        */}
        <TrafficCharts
          timeSeries={timeSeries}
          geoData={geoData}
          deviceStats={store.getDeviceStats()}
        />

        {/* 
          ======================================================================
          5. LIVE FEED TABLE (RECENT TRAFFIC ACTIVITY)
          ======================================================================
        */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-brand-white tracking-wide flex items-center space-x-2">
                <Activity className="w-4 h-4 text-brand-white" />
                <span>Atividade Recente de Tráfego</span>
              </h3>
              <p className="text-xs text-brand-secondary mt-0.5">
                Requisições processadas nos nós de borda com análise de risco e latência em tempo real
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-brand-muted">
              <span>{events.length} eventos no buffer</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-xs">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-[11px]">
                  <th className="pb-2.5 font-medium">TIMESTAMP</th>
                  <th className="pb-2.5 font-medium">DOMÍNIO</th>
                  <th className="pb-2.5 font-medium">CAMPANHA</th>
                  <th className="pb-2.5 font-medium">LOCALIZAÇÃO</th>
                  <th className="pb-2.5 font-medium">IP (MASCARADO)</th>
                  <th className="pb-2.5 font-medium">DISPOSITIVO</th>
                  <th className="pb-2.5 font-medium">RISCO</th>
                  <th className="pb-2.5 text-right font-medium">AÇÃO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-borderSubtle">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-brand-secondary">
                        <Activity className="w-7 h-7 text-brand-muted" />
                        <div className="text-brand-white font-medium text-xs">
                          Nenhum evento registrado ainda
                        </div>
                        <div className="text-[11px] text-brand-muted max-w-sm">
                          Conecte um domínio ou clique em &ldquo;Simular Requisição&rdquo; acima para testar o fluxo de borda.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  events.map((evt) => (
                    <tr key={evt.id} className="hover:bg-brand-hover/40 transition">
                      <td className="py-3 text-brand-secondary font-mono">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-3 text-brand-white font-medium">{evt.domain}</td>
                      <td className="py-3 text-brand-secondary truncate max-w-[150px]">
                        {evt.campaignName || "Acesso Direto"}
                      </td>
                      <td className="py-3 text-brand-white">
                        <LocationBadge
                          countryCode={evt.countryCode}
                          cityName={evt.city}
                          stateCode={evt.stateCode}
                          stateName={evt.state}
                        />
                      </td>
                      <td className="py-3 text-brand-muted font-mono">{evt.ipMasked}</td>
                      <td className="py-3 text-brand-secondary">{evt.device}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            evt.riskScore > 70
                              ? "bg-neutral-900 text-white border border-neutral-700"
                              : evt.riskScore > 35
                              ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                              : "text-brand-secondary"
                          }`}
                        >
                          {evt.riskScore} / 100
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {evt.decision === "routed_offer" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-900 text-white dark:bg-white/10 dark:text-white border border-neutral-700 dark:border-white/20">
                            OFERTA
                          </span>
                        ) : evt.decision === "mitigated_safe" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-200 border border-neutral-700">
                            SAFE PAGE
                          </span>
                        ) : evt.decision === "blocked" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-950 text-neutral-500 border border-neutral-900">
                            BLOQUEADO
                          </span>
                        ) : (
                          <span
                            className={`text-[11px] font-semibold ${
                              evt.isThreat ? "text-neutral-400" : "text-brand-white"
                            }`}
                          >
                            {evt.isThreat ? "SAFE PAGE" : "OFERTA"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Limite de Eventos Atingido"
        reason={upgradeReason}
      />
    </div>
  );
}
