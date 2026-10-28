"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { useTheme } from "@/lib/theme";
import { store } from "@/lib/store";
import { CloakerEngine } from "@/lib/cloakerEngine";
import { CloakilioConfig, CloakerMode } from "@/types";
import {
  Key,
  Copy,
  Check,
  ShieldCheck,
  Code,
  Globe,
  RefreshCw,
  Sun,
  Moon,
  Sliders,
  Cpu,
  Download,
  ExternalLink,
  Smartphone,
  Monitor,
  ShieldAlert,
  Server,
  Layers,
  Sparkles,
} from "lucide-react";

const COMMON_GEOS = [
  { code: "BR", label: "Brasil" },
  { code: "US", label: "Estados Unidos" },
  { code: "PT", label: "Portugal" },
  { code: "ES", label: "Espanha" },
  { code: "GB", label: "Reino Unido" },
  { code: "FR", label: "França" },
  { code: "DE", label: "Alemanha" },
  { code: "IT", label: "Itália" },
  { code: "CA", label: "Canadá" },
  { code: "AU", label: "Austrália" },
];

export default function SettingsPage() {
  const session = auth.getSession();
  const { theme, setTheme } = useTheme();

  // API Key & Telemetry state
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedWorkerCode, setCopiedWorkerCode] = useState(false);
  const [apiKey, setApiKey] = useState("ph_live_98a7f4e0c3b211ef893a0242ac120002");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // CloakilioShield configuration state
  const [config, setConfig] = useState<CloakilioConfig>(() => store.getCloakilioConfig());
  const [customCountryInput, setCustomCountryInput] = useState("");
  const [generatedWorkerScript, setGeneratedWorkerScript] = useState("");

  // Sync worker script when config changes
  useEffect(() => {
    const script = CloakerEngine.generateCloudflareWorkerCode(config);
    setGeneratedWorkerScript(script);
  }, [config]);

  const copyToClipboard = (text: string, type: "key" | "snippet" | "worker") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === "snippet") {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } else {
      setCopiedWorkerCode(true);
      setTimeout(() => setCopiedWorkerCode(false), 2000);
    }
  };

  const handleGenerateNewKey = () => {
    if (confirm("Gerar uma nova chave invalidará a chave atual imediatamente. Deseja prosseguir?")) {
      const newKey = `ph_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
      setApiKey(newKey);
    }
  };

  const handleSaveCloakerConfig = () => {
    store.updateCloakilioConfig(config);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleCountry = (code: string) => {
    const list = [...config.paisesPermitidos];
    const idx = list.indexOf(code);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(code);
    }
    setConfig({ ...config, paisesPermitidos: list });
  };

  const handleAddCustomCountry = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customCountryInput.trim().toUpperCase();
    if (clean && clean.length === 2 && !config.paisesPermitidos.includes(clean)) {
      setConfig({
        ...config,
        paisesPermitidos: [...config.paisesPermitidos, clean],
      });
      setCustomCountryInput("");
    }
  };

  const handleDownloadWorker = () => {
    const blob = new Blob([generatedWorkerScript], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "cloudflare-worker.js");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const trackingSnippet = `<!-- Script de Telemetria ${siteConfig.name} -->
<script
  src="https://edge.phantomx.pro/v1/telemetry.js"
  data-phantom-key="${apiKey}"
  async
></script>`;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black">
      <Header
        title="Arquitetura de Borda & Configurações"
        subtitle="Gerenciador do Motor CloakilioShield, geração de Cloudflare Worker e chaves de ingestão"
      />

      <div className="p-3 sm:p-6 space-y-5 sm:space-y-8 max-w-5xl w-full mx-auto font-mono text-xs">
        {/* Save feedback banner */}
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-white flex items-center justify-between shadow-glow-sm">
            <div className="flex items-center space-x-2.5">
              <Check className="w-5 h-5 text-white" />
              <span className="font-semibold text-xs font-sans">
                Parâmetros do CloakilioShield atualizados e persistidos com sucesso!
              </span>
            </div>
            <span className="text-[11px] text-neutral-400">Worker regenerado</span>
          </div>
        )}

        {/* 1. CLOAKILIOSHIELD ENGINE SETTINGS */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 sm:p-6 shadow-glow-sm space-y-6">
          <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-brand-white" />
                <h3 className="text-sm font-bold text-brand-white">Motor de Borda CloakilioShield</h3>
              </div>
              <p className="text-brand-secondary text-[11px] mt-0.5">
                Arquitetura de 6 camadas com entrega via Proxy Reverso transparente (HTTP 200 OK)
              </p>
            </div>

            <button
              onClick={handleSaveCloakerConfig}
              className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center justify-center space-x-2 shrink-0"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Salvar Configurações</span>
            </button>
          </div>

          {/* Operational Mode Selection */}
          <div className="space-y-2">
            <label className="block text-brand-muted text-[11px]">MODO OPERACIONAL DO CLOAKER</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: "AUTOMATICO" as CloakerMode,
                  title: "Automático (6 Camadas)",
                  desc: "Filtra bots, moderadores de anúncios, crawlers de espionagem e VPNs",
                },
                {
                  id: "SO_WHITEPAGE" as CloakerMode,
                  title: "Apenas Whitepage",
                  desc: "Força 100% das visitas para a Safe Page (ideal para aprovação em revisão)",
                },
                {
                  id: "SO_OFERTA" as CloakerMode,
                  title: "Apenas Oferta",
                  desc: "Desativa os filtros e entrega direto a Blackpage para todos os acessos",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setConfig({ ...config, modo: item.id })}
                  className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                    config.modo === item.id
                      ? "bg-brand-hover border-white/40 ring-1 ring-white/20 shadow-glow-sm"
                      : "bg-brand-black/40 border-brand-border hover:border-brand-borderHighlight"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-brand-white text-xs">{item.title}</span>
                    {config.modo === item.id && (
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </div>
                  <p className="text-brand-secondary text-[11px] leading-relaxed font-sans">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Destination URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-brand-muted mb-1 text-[11px]">
                URL DA WHITEPAGE (SAFE PAGE PADRÃO)
              </label>
              <input
                type="url"
                value={config.whitepageUrl}
                onChange={(e) => setConfig({ ...config, whitepageUrl: e.target.value })}
                placeholder="https://meusite.com/artigo-seguro"
                className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-brand-white placeholder-neutral-600 focus:outline-none focus:border-brand-borderHighlight transition"
              />
              <span className="text-[10px] text-brand-secondary mt-1 block">
                Exibida para robôs do Facebook, Google, Spy Tools e acessos que não atendem às regras.
              </span>
            </div>

            <div>
              <label className="block text-brand-muted mb-1 text-[11px]">
                URL DA OFERTA (BLACKPAGE / CONVERSÃO)
              </label>
              <input
                type="url"
                value={config.ofertaUrl}
                onChange={(e) => setConfig({ ...config, ofertaUrl: e.target.value })}
                placeholder="https://meusite.com/oferta-principal"
                className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-brand-white placeholder-neutral-600 focus:outline-none focus:border-brand-borderHighlight transition"
              />
              <span className="text-[10px] text-brand-secondary mt-1 block">
                Entregue via Proxy Reverso (HTTP 200 OK sem redirects) para leads humanos qualificados.
              </span>
            </div>
          </div>

          {/* Geo-Fencing Section */}
          <div className="space-y-2 border-t border-brand-borderSubtle pt-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-brand-muted text-[11px] font-bold">
                  GEO-FENCING (PAÍSES PERMITIDOS)
                </label>
                <p className="text-[10px] text-brand-secondary">
                  Acessos de países fora desta lista são direcionados para a Whitepage imediatamente. Deixe vazio para permitir todos.
                </p>
              </div>
              <span className="text-[11px] text-brand-muted font-mono">
                {config.paisesPermitidos.length} selecionado(s)
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {COMMON_GEOS.map((geo) => {
                const isSelected = config.paisesPermitidos.includes(geo.code);
                return (
                  <button
                    key={geo.code}
                    type="button"
                    onClick={() => toggleCountry(geo.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition flex items-center space-x-1.5 border ${
                      isSelected
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-black border-white/40 font-semibold"
                        : "bg-brand-black/40 text-brand-secondary border-brand-border hover:border-brand-borderHighlight"
                    }`}
                  >
                    <span>{geo.code}</span>
                    <span className="text-[10px] opacity-75">({geo.label})</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Custom country code adder */}
            <form onSubmit={handleAddCustomCountry} className="flex items-center space-x-2 pt-2 max-w-xs">
              <input
                type="text"
                maxLength={2}
                value={customCountryInput}
                onChange={(e) => setCustomCountryInput(e.target.value.toUpperCase())}
                placeholder="Ex: MX, CL, AR"
                className="w-24 px-3 py-1.5 bg-brand-black border border-brand-border rounded-lg text-brand-white text-xs uppercase"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-white text-xs transition"
              >
                + Adicionar ISO
              </button>
            </form>
          </div>

          {/* Tokens de Plataforma & Filtro de Dispositivos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-brand-borderSubtle pt-4">
            <div className="space-y-3">
              <label className="text-brand-muted text-[11px] font-bold block">
                VALIDAÇÃO DE TOKEN DE PLATAFORMA (META ADS)
              </label>

              <label className="flex items-start justify-between cursor-pointer p-3 rounded-lg bg-brand-black/40 border border-brand-borderSubtle">
                <div className="pr-2">
                  <div className="text-brand-white font-medium text-xs">Exigir parâmetro fbclid</div>
                  <div className="text-brand-secondary text-[10px] mt-0.5">
                    Modera acessos diretos sem o identificador de clique oficial do Meta Ads.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.exigirFbclid}
                  onChange={(e) => setConfig({ ...config, exigirFbclid: e.target.checked })}
                  className="rounded border-brand-border bg-brand-surface text-brand-white focus:ring-0 mt-1"
                />
              </label>

              <div>
                <label className="block text-brand-muted mb-1 text-[10px]">
                  PARÂMETRO UTM OBRIGATÓRIO (OPCIONAL)
                </label>
                <input
                  type="text"
                  value={config.parametroUtm}
                  onChange={(e) => setConfig({ ...config, parametroUtm: e.target.value })}
                  placeholder="Ex: campanha_escala ou blackfriday"
                  className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-brand-white placeholder-neutral-600 focus:outline-none focus:border-brand-borderHighlight transition text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-brand-muted text-[11px] font-bold block">
                DISPOSITIVOS PERMITIDOS
              </label>

              <label className="flex items-start justify-between cursor-pointer p-3 rounded-lg bg-brand-black/40 border border-brand-borderSubtle">
                <div className="flex items-center space-x-2.5">
                  <Smartphone className="w-4 h-4 text-brand-white shrink-0" />
                  <div>
                    <div className="text-brand-white font-medium text-xs">Permitir Mobile (iOS / Android)</div>
                    <div className="text-brand-secondary text-[10px]">Recomendado ativo para campanhas Meta</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.permitirMobile}
                  onChange={(e) => setConfig({ ...config, permitirMobile: e.target.checked })}
                  className="rounded border-brand-border bg-brand-surface text-brand-white focus:ring-0 mt-1"
                />
              </label>

              <label className="flex items-start justify-between cursor-pointer p-3 rounded-lg bg-brand-black/40 border border-brand-borderSubtle">
                <div className="flex items-center space-x-2.5">
                  <Monitor className="w-4 h-4 text-brand-white shrink-0" />
                  <div>
                    <div className="text-brand-white font-medium text-xs">Permitir Desktop (PC / Mac)</div>
                    <div className="text-brand-secondary text-[10px]">Muitos moderadores e bots utilizam emuladores desktop</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.permitirDesktop}
                  onChange={(e) => setConfig({ ...config, permitirDesktop: e.target.checked })}
                  className="rounded border-brand-border bg-brand-surface text-brand-white focus:ring-0 mt-1"
                />
              </label>
            </div>
          </div>

          {/* Threat Intelligence / ProxyCheck API */}
          <div className="space-y-3 border-t border-brand-borderSubtle pt-4">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-brand-white" />
              <label className="text-brand-muted text-[11px] font-bold">
                INTELIGÊNCIA DE AMEAÇAS &amp; REPUTAÇÃO DE IP (PROXYCHECK.IO)
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-brand-muted mb-1 text-[10px]">
                  CHAVE DE API PROXYCHECK.IO
                </label>
                <input
                  type="text"
                  value={config.proxyCheckApiKey}
                  onChange={(e) => setConfig({ ...config, proxyCheckApiKey: e.target.value })}
                  placeholder="96b67s-522c54-730017-h38p9e"
                  className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-brand-white font-mono text-xs focus:outline-none focus:border-brand-borderHighlight transition"
                />
                <span className="text-[10px] text-brand-secondary mt-1 block">
                  Identifica proxies, nós TOR, VPNs residenciais e datacenters em tempo real.
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-brand-muted text-[10px]">
                    RISCO MÁXIMO TOLERADO: {config.riscoMaximo}/100
                  </label>
                  <span className="text-[10px] text-brand-secondary font-semibold">
                    {config.riscoMaximo <= 33 ? "Alta Segurança" : config.riscoMaximo <= 66 ? "Equilibrado" : "Permissivo"}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={config.riscoMaximo}
                  onChange={(e) => setConfig({ ...config, riscoMaximo: Number(e.target.value) })}
                  className="w-full accent-white h-2 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-brand-secondary mt-1 block">
                  IPs com score de risco acima deste patamar serão retidos na Whitepage.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. CLOUDFLARE WORKER SCRIPT GENERATOR */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 sm:p-6 shadow-glow-sm space-y-4">
          <div className="border-b border-brand-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-brand-white" />
                <h3 className="text-sm font-bold text-brand-white">Gerador de Cloudflare Worker (Compilação Instantânea)</h3>
              </div>
              <p className="text-brand-secondary text-[11px] mt-0.5">
                Código JavaScript standalone pronto para colar no Cloudflare Workers ou instalar no seu domínio
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(generatedWorkerScript, "worker")}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center space-x-1.5"
              >
                {copiedWorkerCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWorkerCode ? "Copiado!" : "Copiar Worker"}</span>
              </button>

              <button
                onClick={handleDownloadWorker}
                className="px-3.5 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-white transition flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar .js</span>
              </button>
            </div>
          </div>

          {/* Quick 3-Step Setup Instructions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-brand-black/60 border border-brand-borderSubtle text-[11px] font-sans">
            <div className="space-y-1">
              <span className="font-mono text-[10px] text-white font-bold bg-neutral-800 px-1.5 py-0.5 rounded">
                PASSO 1
              </span>
              <p className="text-brand-white font-semibold">Crie um Worker na Cloudflare</p>
              <p className="text-brand-secondary text-[10px]">
                Acesse o painel da Cloudflare e clique em <strong>Workers &amp; Pages &gt; Create Application</strong>.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] text-white font-bold bg-neutral-800 px-1.5 py-0.5 rounded">
                PASSO 2
              </span>
              <p className="text-brand-white font-semibold">Cole o Código e faça Deploy</p>
              <p className="text-brand-secondary text-[10px]">
                Substitua o conteúdo de <code>worker.js</code> pelo script gerado ao lado e clique em <strong>Deploy</strong>.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-mono text-[10px] text-white font-bold bg-neutral-800 px-1.5 py-0.5 rounded">
                PASSO 3
              </span>
              <p className="text-brand-white font-semibold">Configure a Rota (Triggers)</p>
              <p className="text-brand-secondary text-[10px]">
                Em <strong>Settings &gt; Triggers</strong>, aponte a rota do seu domínio (ex: <code>seusite.com/*</code>).
              </p>
            </div>
          </div>

          {/* Worker Codebox */}
          <div className="p-4 rounded-lg bg-neutral-900 dark:bg-black border border-brand-borderSubtle overflow-x-auto max-h-72">
            <pre className="text-white text-[11px] leading-relaxed">
              <code>{generatedWorkerScript}</code>
            </pre>
          </div>
        </div>

        {/* 3. APPEARANCE & THEME CARD */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-glow-sm space-y-4">
          <div className="border-b border-brand-border pb-3">
            <h3 className="text-sm font-bold text-brand-white">Aparência &amp; Tema da Interface</h3>
            <p className="text-brand-secondary text-[11px]">
              Personalize o modo de visualização do dashboard e de toda a plataforma Phantom-X
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Dark Theme Card */}
            <button
              onClick={() => setTheme("dark")}
              type="button"
              className={`p-4 rounded-xl border text-left transition flex items-start space-x-3.5 ${
                theme === "dark"
                  ? "bg-brand-hover border-white/40 ring-1 ring-white/20 shadow-glow-sm"
                  : "bg-brand-black/50 border-brand-border hover:border-brand-borderHighlight"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-black border border-white/20 flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-white text-xs">Tema Escuro (Obsidian)</span>
                  {theme === "dark" && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-brand-secondary text-[11px] mt-1 leading-normal font-sans">
                  Estilo furtivo de alto contraste com fundo preto profundo (#050505) e detalhes em titânio.
                </p>
              </div>
            </button>

            {/* Light Theme Card */}
            <button
              onClick={() => setTheme("light")}
              type="button"
              className={`p-4 rounded-xl border text-left transition flex items-start space-x-3.5 ${
                theme === "light"
                  ? "bg-brand-hover border-neutral-700/80 ring-1 ring-neutral-400 shadow-glow-sm"
                  : "bg-brand-black/50 border-brand-border hover:border-brand-borderHighlight"
              }`}
            >
              <div className="w-9 h-9 rounded-lg bg-white border border-neutral-300 flex items-center justify-center shrink-0">
                <Sun className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-white text-xs">Tema Claro (Titanium)</span>
                  {theme === "light" && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-white font-semibold">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-brand-secondary text-[11px] mt-1 leading-normal font-sans">
                  Visual minimalista com superfícies limpas, tipografia legível e contraste balanceado.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 4. API CREDENTIALS & SNIPPET */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-glow-sm space-y-4">
          <div className="border-b border-brand-border pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-brand-white">Chave de Ingestão de API</h3>
              <p className="text-brand-secondary text-[11px]">
                Utilizada para autenticar chamadas server-to-server ou clientes SDK
              </p>
            </div>
            <button
              onClick={handleGenerateNewKey}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-secondary hover:text-brand-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Rotacionar Chave</span>
            </button>
          </div>

          <div>
            <label className="block text-brand-muted mb-1 text-[11px]">API KEY PÚBLICA</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="flex-1 px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-brand-white select-all"
              />
              <button
                onClick={() => copyToClipboard(apiKey, "key")}
                className="px-3.5 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center space-x-1.5"
              >
                {copiedKey ? <Check className="w-4 h-4 text-white dark:text-black" /> : <Copy className="w-4 h-4 text-white dark:text-black" />}
                <span>{copiedKey ? "Copiado!" : "Copiar"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5. TRACKING SNIPPET */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-glow-sm space-y-4">
          <div className="border-b border-brand-border pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-brand-white">Snippet JavaScript de Rastreamento</h3>
              <p className="text-brand-secondary text-[11px]">
                Adicione antes do fechamento da tag <code>&lt;/head&gt;</code> em suas páginas
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(trackingSnippet, "snippet")}
              className="px-3.5 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-white transition flex items-center space-x-1.5"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet ? "Copiado!" : "Copiar Snippet"}</span>
            </button>
          </div>

          <div className="p-4 rounded-lg bg-neutral-900 dark:bg-black border border-brand-borderSubtle overflow-x-auto">
            <pre className="text-white text-[11px] leading-relaxed">
              <code>{trackingSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
