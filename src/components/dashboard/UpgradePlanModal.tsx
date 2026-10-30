"use client";

import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  Lock,
  Globe,
  Radio,
  Layers,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { PHANTOM_PLANS, PlanDefinition } from "@/lib/plans";
import { PlanId } from "@/types";
import { auth } from "@/lib/auth";

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  reason?: string;
  currentPlan?: PlanId;
}

export const UpgradePlanModal: React.FC<UpgradePlanModalProps> = ({
  isOpen,
  onClose,
  title = "Limite de Infraestrutura Atingido",
  reason = "Sua conta gratuita atingiu o limite operacional (100 eventos, 1 domínio ou 1 camuflagem). Ative um plano para continuar operando sem interrupções.",
  currentPlan = "free",
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("growth");
  const [activating, setActivating] = useState(false);
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  if (!isOpen) return null;

  const plansToDisplay = [
    PHANTOM_PLANS.starter,
    PHANTOM_PLANS.growth,
    PHANTOM_PLANS.scale,
  ];

  const handleSelectAndActivate = async (plan: PlanDefinition) => {
    setSelectedPlan(plan.id);
    setActivating(true);

    try {
      const session = auth.getSession();
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          userName: session?.user?.name,
        }),
      });

      const data = await res.json();

      if (data.success && data.url) {
        if (!data.simulated) {
          // Redirecionamento oficial para Stripe Checkout
          window.location.href = data.url;
          return;
        }

        // Modo Simulado / Teste
        if (session?.user) {
          auth.updateUserPlan(session.user.id, plan.id, "active");
        }
        setActivating(false);
        setActivatedSuccess(true);
        setTimeout(() => {
          setActivatedSuccess(false);
          onClose();
          window.location.reload();
        }, 1800);
      } else {
        throw new Error(data.error || "Falha ao gerar sessão de pagamento na Stripe.");
      }
    } catch (err: any) {
      console.warn("[Stripe Fallback]", err);
      const session = auth.getSession();
      if (session?.user) {
        auth.updateUserPlan(session.user.id, plan.id, "active");
      }
      setActivating(false);
      setActivatedSuccess(true);
      setTimeout(() => {
        setActivatedSuccess(false);
        onClose();
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-gradient-to-b from-[#0c0c0e] via-[#09090b] to-[#050505] border border-white/10 rounded-3xl p-5 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.9)] backdrop-blur-2xl ring-1 ring-white/10 font-sans text-white">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 sm:right-6 top-4 sm:top-6 p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-white/5 transition cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header HUD */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300 mb-3 uppercase tracking-wider font-semibold">
            <Lock className="w-3.5 h-3.5 text-neutral-400" />
            <span>UPGRADE DE INFRAESTRUTURA & ARBITRAGEM</span>
          </div>

          <h2 className="text-xl sm:text-3xl font-bold font-poppins tracking-tight text-white">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
            {reason}
          </p>

          <div className="mt-3 text-[11px] font-mono text-emerald-400 flex items-center justify-center space-x-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Infraestrutura Phantom-X Edge v2.4 • &lt; 14ms de latência • Cliques Ilimitados</span>
          </div>
        </div>

        {/* Notificação de Ativação Concluída */}
        {activatedSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-center font-mono text-xs flex items-center justify-center space-x-2 animate-in zoom-in-95">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Plano ativado com sucesso! Atualizando seus limites operacionais...</span>
          </div>
        )}

        {/* Tabela de Planos Comparativa (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {plansToDisplay.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isPopular = plan.isPopular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-5 sm:p-6 transition flex flex-col justify-between border ${
                  isPopular
                    ? "bg-gradient-to-b from-neutral-900/90 via-neutral-950 to-black border-purple-500/50 shadow-2xl shadow-purple-950/40 ring-1 ring-purple-500/30"
                    : "bg-neutral-900/50 hover:bg-neutral-900/70 border-white/10"
                }`}
              >
                {/* Badge Superior */}
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
                    Mais Popular
                  </div>
                )}

                <div>
                  {/* Topo do Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                    <span className="text-base sm:text-lg font-bold font-poppins text-white">
                      {plan.name}
                    </span>
                    <span className="text-xs font-mono font-semibold text-neutral-200 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 self-start sm:self-auto">
                      {plan.flags}
                    </span>
                  </div>

                  {/* Preço */}
                  <div className="mb-4">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl sm:text-3xl font-poppins font-extrabold text-white">
                        {plan.priceFormatted}
                      </span>
                      <span className="text-xs text-neutral-400 font-mono">{plan.period}</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-1 leading-snug">
                      {plan.tagline}
                    </p>
                  </div>

                  {/* Botão de Assinar / Ativar */}
                  <button
                    onClick={() => handleSelectAndActivate(plan)}
                    disabled={activating}
                    className={`w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-wider font-mono transition shadow-lg flex items-center justify-center space-x-2 cursor-pointer mb-6 ${
                      isPopular
                        ? "bg-white text-black hover:bg-neutral-200 shadow-white/10"
                        : "bg-neutral-800 hover:bg-neutral-700 text-white border border-white/10"
                    }`}
                  >
                    <span>{activating && isSelected ? "Conectando à Stripe..." : "Assinar Agora"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Métricas e Limites */}
                  <div className="space-y-2 py-4 border-t border-b border-white/10 text-xs font-mono">
                    <div className="flex justify-between items-center text-neutral-300">
                      <span className="text-neutral-400">Região</span>
                      <span className="font-semibold text-white">{plan.region}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-300">
                      <span className="text-neutral-400">Cliques / Mês</span>
                      <span className={`font-bold ${plan.limits.maxEventsMonthly === -1 ? "text-emerald-400" : "text-white"}`}>
                        {plan.limits.maxEventsMonthly === -1 ? "Ilimitados" : `${plan.limits.maxEventsMonthly.toLocaleString("pt-BR")}/mês`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-300">
                      <span className="text-neutral-400">Domínios</span>
                      <span className="font-bold text-emerald-400">{plan.limits.maxDomains}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-300">
                      <span className="text-neutral-400">Páginas</span>
                      <span className="font-semibold text-white">{plan.limits.maxPages}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-300">
                      <span className="text-neutral-400">Camuflagens</span>
                      <span className="font-bold text-purple-400">{plan.limits.maxCampaigns}</span>
                    </div>
                    <div className="flex justify-between items-center text-neutral-300">
                      <span className="text-neutral-400">Armazenamento</span>
                      <span className="font-semibold text-white">
                        {plan.limits.storageMb >= 1000
                          ? `${plan.limits.storageMb / 1000} GB`
                          : `${plan.limits.storageMb} MB`}
                      </span>
                    </div>
                  </div>

                  {/* Lista de Features */}
                  <div className="pt-4 space-y-2 text-[11px] font-sans">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        {feat.included ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-500 flex items-center justify-center shrink-0">
                            —
                          </div>
                        )}
                        <span className={feat.included ? "text-neutral-200" : "text-neutral-500 line-through"}>
                          {feat.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fontes de Tráfego no Rodapé do Card */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <div className="text-[10px] font-mono text-neutral-500 uppercase mb-2">
                    Fontes de Tráfego Homologadas:
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-mono text-neutral-300">
                    {plan.trafficSources.map((source, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-lg bg-neutral-950 border border-white/10"
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

        {/* Rodapé Informativo */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-neutral-400 gap-2">
          <span>Ativação e liberação de limites imediata.</span>
          <span className="text-neutral-300 font-semibold">Phantom-X Infrastructure</span>
        </div>
      </div>
    </div>
  );
};
