"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { store } from "@/lib/store";
import { Campaign, Domain } from "@/types";
import { Plus, Trash2, Power, Layers, ExternalLink, X, Check } from "lucide-react";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [showModal, setShowModal] = useState(false);

  // New campaign form state
  const [name, setName] = useState("");
  const [domainId, setDomainId] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");

  const refreshData = () => {
    setCampaigns(store.getCampaigns());
    const doms = store.getDomains();
    setDomains(doms);
    if (doms.length > 0 && !domainId) {
      setDomainId(doms[0].id);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleToggleStatus = (camp: Campaign) => {
    const nextStatus = camp.status === "active" ? "paused" : "active";
    store.updateCampaign(camp.id, { status: nextStatus });
    refreshData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Deseja realmente remover esta campanha?")) {
      store.deleteCampaign(id);
      refreshData();
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetUrl) return;

    store.createCampaign({
      name,
      domainId,
      targetUrl,
      fallbackUrl,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    setName("");
    setTargetUrl("");
    setFallbackUrl("");
    setUtmSource("");
    setUtmMedium("");
    setUtmCampaign("");
    setShowModal(false);
    refreshData();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black">
      <Header
        title="Gestão de Campanhas & Atribuição"
        subtitle="Organize links de rastreamento, parâmetros UTM e destinos de tráfego"
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-brand-white tracking-wide">
              Campanhas Configuradas ({campaigns.length})
            </h2>
            <p className="text-[11px] sm:text-xs text-brand-secondary">
              Cada campanha possui endpoint único de rastreamento e auditoria de tráfego
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center justify-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 text-white dark:text-black" />
            <span>Nova Campanha</span>
          </button>
        </div>

        {/* Campaigns Table */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-glow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-[11px]">
                  <th className="pb-3">STATUS</th>
                  <th className="pb-3">NOME DA CAMPANHA</th>
                  <th className="pb-3">DOMÍNIO VINCULADO</th>
                  <th className="pb-3">PARÂMETROS UTM</th>
                  <th className="pb-3">EVENTOS TOTAIS</th>
                  <th className="pb-3">TAXA BOTS</th>
                  <th className="pb-3">CONVERSÃO</th>
                  <th className="pb-3 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-borderSubtle">
                {campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 font-sans">
                        <Layers className="w-8 h-8 text-brand-muted" />
                        <div className="text-brand-white font-medium text-xs">Nenhuma campanha cadastrada</div>
                        <div className="text-[11px] text-brand-secondary max-w-sm">
                          Crie campanhas para monitorar tráfego de anúncios, UTMs e filtrar tráfego automatizado.
                        </div>
                        <button
                          onClick={() => setShowModal(true)}
                          className="mt-2 inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5 text-white dark:text-black" />
                          <span>Criar Primeira Campanha</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  campaigns.map((camp) => {
                    const botRate = camp.totalEvents > 0 ? ((camp.botEvents / camp.totalEvents) * 100).toFixed(1) : "0.0";

                  return (
                    <tr key={camp.id} className="hover:bg-brand-hover/40 transition">
                      <td className="py-3">
                        <button
                          onClick={() => handleToggleStatus(camp)}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition ${
                            camp.status === "active"
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
                              : "bg-brand-surface text-brand-muted border border-brand-border"
                          }`}
                        >
                          <Power className="w-3 h-3" />
                          <span>{camp.status === "active" ? "ATIVA" : "PAUSADA"}</span>
                        </button>
                      </td>
                      <td className="py-3">
                        <div className="text-brand-white font-medium">{camp.name}</div>
                        <div className="text-brand-muted text-[10px] truncate max-w-[220px]">
                          {camp.targetUrl}
                        </div>
                      </td>
                      <td className="py-3 text-brand-secondary">{camp.domainName}</td>
                      <td className="py-3 text-brand-muted text-[11px]">
                        {camp.utmSource ? (
                          <span>
                            {camp.utmSource} / {camp.utmMedium || "cpc"}
                          </span>
                        ) : (
                          "Padrão"
                        )}
                      </td>
                      <td className="py-3 text-brand-white font-bold">
                        {camp.totalEvents.toLocaleString("pt-BR")}
                      </td>
                      <td className="py-3 text-brand-secondary">{botRate}%</td>
                      <td className="py-3 text-brand-white font-semibold">{camp.conversionRate}%</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleDelete(camp.id)}
                          className="p-1.5 rounded-lg hover:bg-neutral-800 text-brand-muted hover:text-white transition"
                          title="Remover campanha"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-brand-surface border border-brand-border rounded-2xl p-6 shadow-glow font-mono">
            <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-5">
              <h3 className="text-base font-bold text-white">Criar Nova Campanha</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-brand-secondary hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-brand-secondary mb-1">NOME DA CAMPANHA</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Meta Ads — Lançamento Q4"
                  required
                  className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
                />
              </div>

              <div>
                <label className="block text-brand-secondary mb-1">DOMÍNIO VINCULADO</label>
                <select
                  value={domainId}
                  onChange={(e) => setDomainId(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:border-white transition"
                >
                  {domains.map((dom) => (
                    <option key={dom.id} value={dom.id}>
                      {dom.name} ({dom.status === "active" ? "Verificado" : "Pendente"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-brand-secondary mb-1">URL DE DESTINO PRINCIPAL</label>
                <input
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://minhaloja.com/oferta-principal"
                  required
                  className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
                />
              </div>

              <div>
                <label className="block text-brand-secondary mb-1">URL DE FALLBACK (SEGURANÇA)</label>
                <input
                  type="url"
                  value={fallbackUrl}
                  onChange={(e) => setFallbackUrl(e.target.value)}
                  placeholder="https://minhaloja.com/aviso-seguranca"
                  className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-brand-secondary mb-1">UTM SOURCE</label>
                  <input
                    type="text"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="facebook"
                    className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary mb-1">UTM MEDIUM</label>
                  <input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    placeholder="cpc"
                    className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-brand-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-brand-black border border-brand-border text-brand-secondary hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-white text-black font-semibold hover:bg-neutral-200 transition"
                >
                  Criar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
