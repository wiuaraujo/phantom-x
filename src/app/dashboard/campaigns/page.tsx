"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { store } from "@/lib/store";
import { Campaign, Domain, CloakerMode } from "@/types";
import {
  Plus,
  Trash2,
  Power,
  Layers,
  ExternalLink,
  X,
  Check,
  Globe,
  Shield,
  Smartphone,
  Cpu,
  ArrowRight,
  Server,
} from "lucide-react";

const COMMON_GEOS = ["BR", "US", "PT", "ES", "GB", "DE", "FR", "CA"];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [showModal, setShowModal] = useState(false);

  // New campaign form state
  const [name, setName] = useState("");
  const [domainId, setDomainId] = useState("");
  const [mode, setMode] = useState<CloakerMode>("AUTOMATICO");
  const [ofertaUrl, setOfertaUrl] = useState("");
  const [whitepageUrl, setWhitepageUrl] = useState("");
  const [requireFbclid, setRequireFbclid] = useState(false);
  const [allowedCountries, setAllowedCountries] = useState<string[]>(["BR"]);
  const [utmSource, setUtmSource] = useState("meta");
  const [utmMedium, setUtmMedium] = useState("cpc");
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
    if (confirm("Deseja realmente remover esta campanha de cloaking?")) {
      store.deleteCampaign(id);
      refreshData();
    }
  };

  const toggleCountry = (code: string) => {
    const list = [...allowedCountries];
    const idx = list.indexOf(code);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(code);
    }
    setAllowedCountries(list);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !ofertaUrl || !whitepageUrl) return;

    store.createCampaign({
      name,
      domainId,
      mode,
      ofertaUrl,
      targetUrl: ofertaUrl,
      whitepageUrl,
      fallbackUrl: whitepageUrl,
      allowedCountries,
      requireFbclid,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    setName("");
    setOfertaUrl("");
    setWhitepageUrl("");
    setRequireFbclid(false);
    setAllowedCountries(["BR"]);
    setUtmSource("meta");
    setUtmMedium("cpc");
    setUtmCampaign("");
    setShowModal(false);
    refreshData();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black">
      <Header
        title="Gestão de Campanhas & Cloaking"
        subtitle="Roteamento inteligente de tráfego, entrega via Proxy Reverso e filtragem de moderadores"
      />

      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-brand-white tracking-wide">
              Campanhas de Borda ({campaigns.length})
            </h2>
            <p className="text-[11px] sm:text-xs text-brand-secondary">
              Cada campanha conta com entrega transparente HTTP 200 OK sem 301/302 redirects
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition shadow-sm flex items-center justify-center space-x-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 text-white dark:text-black" />
            <span>Nova Campanha Cloaker</span>
          </button>
        </div>

        {/* Campaigns Table */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 shadow-glow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-brand-border text-brand-muted text-[11px]">
                  <th className="pb-3">STATUS</th>
                  <th className="pb-3">NOME &amp; DESTINOS</th>
                  <th className="pb-3">MODO OPERACIONAL</th>
                  <th className="pb-3">GEO-FENCE</th>
                  <th className="pb-3">ENTREGA</th>
                  <th className="pb-3">REQUISIÇÕES</th>
                  <th className="pb-3">BOTS FILTRADOS</th>
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
                          Crie sua primeira campanha para proteger ofertas contra moderadores de anúncios e robôs espiões.
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
                    const currentMode = camp.mode || "AUTOMATICO";

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
                          <div className="flex flex-col space-y-0.5 mt-1 text-[10px]">
                            <span className="text-neutral-400 truncate max-w-[240px]">
                              <strong className="text-white">Oferta:</strong> {camp.ofertaUrl || camp.targetUrl}
                            </span>
                            <span className="text-brand-muted truncate max-w-[240px]">
                              <strong>Safe:</strong> {camp.whitepageUrl || camp.fallbackUrl}
                            </span>
                          </div>
                        </td>

                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              currentMode === "AUTOMATICO"
                                ? "bg-white/10 text-brand-white border border-white/20"
                                : currentMode === "SO_WHITEPAGE"
                                ? "bg-amber-500/10 text-amber-300 border border-amber-500/30"
                                : "bg-blue-500/10 text-blue-300 border border-blue-500/30"
                            }`}
                          >
                            {currentMode === "AUTOMATICO"
                              ? "Automático (6 Camadas)"
                              : currentMode === "SO_WHITEPAGE"
                              ? "Apenas Whitepage"
                              : "Apenas Oferta"}
                          </span>
                        </td>

                        <td className="py-3 text-brand-secondary">
                          <div className="flex items-center space-x-1">
                            <Globe className="w-3.5 h-3.5 text-brand-muted" />
                            <span>
                              {camp.allowedCountries && camp.allowedCountries.length > 0
                                ? camp.allowedCountries.join(", ")
                                : "Global"}
                            </span>
                          </div>
                          {camp.requireFbclid && (
                            <span className="text-[10px] text-brand-muted block mt-0.5">
                              + Exige fbclid
                            </span>
                          )}
                        </td>

                        <td className="py-3">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 text-white dark:bg-neutral-800 dark:text-neutral-200 border border-neutral-700">
                            <Server className="w-3 h-3 text-white dark:text-neutral-300" />
                            <span>Proxy 200 OK</span>
                          </span>
                        </td>

                        <td className="py-3 text-brand-white font-bold">
                          {camp.totalEvents.toLocaleString("pt-BR")}
                        </td>

                        <td className="py-3">
                          <div className="text-brand-white font-semibold">{camp.botEvents}</div>
                          <span className="text-[10px] text-brand-secondary">({botRate}%)</span>
                        </td>

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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-brand-surface border border-brand-border rounded-2xl p-5 sm:p-6 shadow-glow font-mono my-auto">
            <div className="flex items-center justify-between border-b border-brand-border pb-3 mb-5">
              <div>
                <h3 className="text-base font-bold text-brand-white">Criar Nova Campanha Cloaker</h3>
                <p className="text-[11px] text-brand-secondary">
                  Configure o destino de conversão e a página segura de moderação
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-brand-secondary hover:text-brand-white"
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
                  placeholder="Ex: Meta Ads — Escala Q4"
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-brand-black border border-brand-border rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-brand-secondary mb-1">DOMÍNIO VINCULADO</label>
                  <select
                    value={domainId}
                    onChange={(e) => setDomainId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-brand-black border border-brand-border rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-white transition"
                  >
                    {domains.map((dom) => (
                      <option key={dom.id} value={dom.id}>
                        {dom.name} ({dom.status === "active" ? "Verificado" : "Pendente"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-brand-secondary mb-1">MODO INICIAL</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as CloakerMode)}
                    className="w-full px-3 py-2 bg-white dark:bg-brand-black border border-brand-border rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:border-white transition"
                  >
                    <option value="AUTOMATICO">Automático (Filtro 6 Camadas)</option>
                    <option value="SO_WHITEPAGE">Apenas Whitepage (Moderação)</option>
                    <option value="SO_OFERTA">Apenas Oferta (Direto)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-brand-secondary mb-1">
                  URL DA OFERTA (BLACKPAGE / CONVERSÃO)
                </label>
                <input
                  type="url"
                  value={ofertaUrl}
                  onChange={(e) => setOfertaUrl(e.target.value)}
                  placeholder="https://minhaloja.com/checkout-black"
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-brand-black border border-brand-border rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-white transition"
                />
                <span className="text-[10px] text-brand-muted mt-0.5 block">
                  Entregue transparentemente via Proxy Reverso para tráfego humano aprovado.
                </span>
              </div>

              <div>
                <label className="block text-brand-secondary mb-1">
                  URL DA WHITEPAGE (SAFE PAGE)
                </label>
                <input
                  type="url"
                  value={whitepageUrl}
                  onChange={(e) => setWhitepageUrl(e.target.value)}
                  placeholder="https://minhaloja.com/artigo-informativo"
                  required
                  className="w-full px-3 py-2 bg-white dark:bg-brand-black border border-brand-border rounded-lg text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none focus:border-white transition"
                />
                <span className="text-[10px] text-brand-muted mt-0.5 block">
                  Entregue para robôs, crawlers de moderação e acessos fora dos países autorizados.
                </span>
              </div>

              {/* Geo-Fencing selection */}
              <div>
                <label className="block text-brand-secondary mb-1">GEO-FENCING (PAÍSES AUTORIZADOS)</label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_GEOS.map((code) => {
                    const isSelected = allowedCountries.includes(code);
                    return (
                      <button
                        type="button"
                        key={code}
                        onClick={() => toggleCountry(code)}
                        className={`px-2.5 py-1 rounded text-[11px] font-mono transition border ${
                          isSelected
                            ? "bg-white text-black font-bold border-white"
                            : "bg-brand-black text-brand-secondary border-brand-border hover:border-brand-borderHighlight"
                        }`}
                      >
                        {code}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Checkbox fbclid */}
              <label className="flex items-start space-x-2.5 cursor-pointer p-3 rounded-lg bg-brand-black border border-brand-borderSubtle">
                <input
                  type="checkbox"
                  checked={requireFbclid}
                  onChange={(e) => setRequireFbclid(e.target.checked)}
                  className="rounded border-brand-border bg-brand-surface text-brand-white focus:ring-0 mt-0.5"
                />
                <div>
                  <div className="text-white font-medium text-xs">Exigir parâmetro fbclid (Meta Ads)</div>
                  <div className="text-brand-secondary text-[10px]">
                    Bloqueia cliques diretos e espiões que não venham de anúncios com token de clique.
                  </div>
                </div>
              </label>

              {/* UTMs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-brand-secondary mb-1">UTM SOURCE</label>
                  <input
                    type="text"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    placeholder="meta"
                    className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white transition"
                  />
                </div>
                <div>
                  <label className="block text-brand-secondary mb-1">UTM CAMPAIGN</label>
                  <input
                    type="text"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    placeholder="escala_brasil"
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
