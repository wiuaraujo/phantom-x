"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { store } from "@/lib/store";
import { Domain } from "@/types";
import { Plus, CheckCircle2, AlertCircle, RefreshCw, Trash2, Globe2, ShieldCheck, X, Zap, Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { checkDomainLimit, getPlanDefinition } from "@/lib/plans";
import { UpgradePlanModal } from "@/components/dashboard/UpgradePlanModal";
import { useLanguage } from "@/lib/i18n";

export default function DomainsPage() {
  const { t } = useLanguage();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomainName, setNewDomainName] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Controle de Planos e Limites
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const session = auth.getSession();
  const userPlan = session?.user?.plan || "free";
  const planDef = getPlanDefinition(userPlan);

  const loadDomains = () => {
    setDomains(store.getDomains());
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleOpenAddDomain = () => {
    const limitCheck = checkDomainLimit(domains.length, userPlan);
    if (!limitCheck.allowed) {
      setUpgradeReason(limitCheck.reason || "Limite de domínios atingido.");
      setShowUpgradeModal(true);
      return;
    }
    setShowAddModal(true);
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainName) return;

    const limitCheck = checkDomainLimit(domains.length, userPlan);
    if (!limitCheck.allowed) {
      setUpgradeReason(limitCheck.reason || "Limite de domínios atingido.");
      setShowAddModal(false);
      setShowUpgradeModal(true);
      return;
    }

    store.addDomain(newDomainName);
    setNewDomainName("");
    setShowAddModal(false);
    loadDomains();
  };

  const handleVerifyDNS = async (id: string) => {
    setVerifyingId(id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    store.verifyDomainDNS(id);
    setVerifyingId(null);
    loadDomains();
  };

  const handleDeleteDomain = (id: string) => {
    if (confirm("Deseja realmente remover este domínio? Suas campanhas associadas serão pausadas.")) {
      store.deleteDomain(id);
      loadDomains();
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black">
      <Header
        title={t.dashboard.domainsTitle}
        subtitle={t.dashboard.domainsSubtitle}
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-brand-white tracking-wide">
              Domínios Conectados ({domains.length})
            </h2>
            <p className="text-[11px] sm:text-xs text-brand-secondary">
              Cada domínio aponta para a borda global com suporte a HTTP/3 e terminação TLS
            </p>
          </div>

          <button
            onClick={handleOpenAddDomain}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center justify-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 text-white dark:text-black" />
            <span>Adicionar Domínio</span>
          </button>
        </div>

        {/* Plan Quota Banner */}
        <div className="bg-brand-surface/70 border border-brand-border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              userPlan === "free"
                ? "bg-neutral-800 text-neutral-300 border border-neutral-700"
                : userPlan === "scale"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-white text-black font-black"
            }`}>
              Plano {planDef.name}
            </span>
            <span className="text-brand-secondary text-[11px]">
              Domínios em uso: <strong className="text-white">{domains.length}</strong> / {planDef.limits.maxDomains}
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-brand-secondary text-[11px]">
              Região: <strong className="text-white">{planDef.region}</strong> {planDef.flags}
            </span>
          </div>

          {userPlan !== "scale" && (
            <button
              onClick={() => {
                setUpgradeReason(
                  userPlan === "free"
                    ? "Faça upgrade para conectar até 3 domínios no Starter (R$ 149), 12 no Growth (R$ 389) ou 60 no Scale (R$ 529)."
                    : userPlan === "starter"
                    ? "Faça upgrade para o Growth (R$ 389) ou Scale (R$ 529) para conectar até 12 ou 60 domínios customizados com terminação TLS."
                    : "Faça upgrade para o Scale (R$ 529) para conectar até 60 domínios com prioridade máxima e cliques ilimitados."
                );
                setShowUpgradeModal(true);
              }}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-bold text-[11px] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center justify-center space-x-1.5 self-start sm:self-auto shrink-0 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{userPlan === "free" ? "Ativar Plano Comercial" : "Expandir Limite de Domínios"}</span>
            </button>
          )}
        </div>

        {/* Domains List */}
        <div className="space-y-4">
          {domains.length === 0 ? (
            <div className="bg-brand-surface border border-brand-border rounded-xl p-12 text-center space-y-3 font-sans">
              <div className="w-12 h-12 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-center mx-auto text-brand-secondary">
                <Globe2 className="w-6 h-6 text-brand-white" />
              </div>
              <h3 className="text-sm font-semibold text-brand-white">Nenhum domínio configurado</h3>
              <p className="text-xs text-brand-secondary max-w-md mx-auto">
                Adicione o primeiro domínio ou subdomínio para rotear seu tráfego através do cluster Phantom-X com certificação TLS instantânea.
              </p>
              <button
                onClick={handleOpenAddDomain}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm"
              >
                <Plus className="w-4 h-4 text-white dark:text-black" />
                <span>Adicionar Primeiro Domínio</span>
              </button>
            </div>
          ) : (
            domains.map((dom) => {
            const isVerified = dom.status === "active";

            return (
              <div
                key={dom.id}
                className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-glow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 font-mono text-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-surface border border-brand-border flex items-center justify-center text-brand-white">
                      <Globe2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-brand-white tracking-tight">{dom.name}</div>
                      <div className="text-[11px] text-brand-muted">
                        Criado em: {new Date(dom.createdAt).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  {/* DNS Records Status */}
                  <div className="space-y-1.5 pt-1">
                    {dom.dnsRecords.map((rec, i) => (
                      <div key={i} className="flex items-center space-x-2 text-[11px] text-brand-secondary">
                        <span className="px-1.5 py-0.5 rounded bg-brand-surface border border-brand-borderSubtle text-[10px] text-brand-white">
                          {rec.type}
                        </span>
                        <span>Host: <strong>{rec.host}</strong></span>
                        <span className="text-brand-muted">→</span>
                        <span>Valor: <code className="text-brand-white">{rec.expected}</code></span>
                        {rec.verified ? (
                          <span className="inline-flex items-center text-brand-white">
                            <CheckCircle2 className="w-3.5 h-3.5 ml-1" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-neutral-400">
                            <AlertCircle className="w-3.5 h-3.5 ml-1" />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Status & Actions */}
                <div className="flex flex-col md:items-end space-y-3">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center space-x-1 ${
                        isVerified
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                          : "bg-neutral-800 text-neutral-200 border border-neutral-700"
                      }`}
                    >
                      {isVerified ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>ATIVO & VERIFICADO</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>PENDENTE DE DNS</span>
                        </>
                      )}
                    </span>

                    <span className="text-[11px] text-brand-muted flex items-center space-x-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-white" />
                      <span>SSL: {dom.sslStatus.toUpperCase()}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!isVerified && (
                      <button
                        onClick={() => handleVerifyDNS(dom.id)}
                        disabled={verifyingId === dom.id}
                        className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center space-x-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${verifyingId === dom.id ? "animate-spin" : ""}`} />
                        <span>{verifyingId === dom.id ? "Checando DNS..." : "Verificar DNS"}</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteDomain(dom.id)}
                      className="p-1.5 rounded-lg bg-brand-black border border-brand-border text-brand-muted hover:text-white transition"
                      title="Excluir domínio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
        </div>
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-glow font-mono">
            <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-5">
              <h3 className="text-base font-bold text-brand-white">Adicionar Domínio</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-brand-secondary hover:text-brand-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDomain} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-brand-secondary mb-1 font-mono text-[11px]">
                  NOME DO DOMÍNIO OU SUBDOMÍNIO
                </label>
                <input
                  type="text"
                  value={newDomainName}
                  onChange={(e) => setNewDomainName(e.target.value)}
                  placeholder="trk.meusite.com"
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-brand-black border border-brand-border rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-white transition font-mono text-xs"
                />
                <span className="block text-[11px] text-brand-muted mt-1.5 leading-tight font-mono">
                  Após adicionar, você precisará criar o registro CNAME apontando para{" "}
                  <code className="text-brand-white font-bold bg-brand-surface px-1.5 py-0.5 rounded border border-brand-border">cname.phantom-x.pro</code>.
                </span>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-brand-surface border border-brand-border text-brand-secondary hover:text-brand-white transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm"
                >
                  Cadastrar Domínio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Limite de Domínios Atingido"
        reason={upgradeReason}
      />
    </div>
  );
}
