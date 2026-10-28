"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/dashboard/Header";
import { auth } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { useTheme } from "@/lib/theme";
import { store } from "@/lib/store";
import { CloakerEngine } from "@/lib/cloakerEngine";
import { PhantomCloakerConfig, CloakerMode } from "@/types";
import { TIMEZONE_REGIONS } from "@/lib/timezones";
import { getDashboardGreeting } from "@/lib/userGreeting";
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
  Fingerprint,
  EyeOff,
  Flame,
  User,
  Clock,
  Sparkle,
  Smile,
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

  // User Profile configuration state
  const [profileName, setProfileName] = useState(session?.user?.name || "");
  const [profileNickname, setProfileNickname] = useState(
    session?.user?.nickname || (session?.user?.name ? session.user.name.split(" ")[0] : "Will")
  );
  const [profileTimezone, setProfileTimezone] = useState(
    session?.user?.timezone || "America/Sao_Paulo"
  );
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  // API Key & Telemetry state
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedWorkerCode, setCopiedWorkerCode] = useState(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const [apiKey, setApiKey] = useState("ph_live_98a7f4e0c3b211ef893a0242ac120002");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Phantom-X Cloaker configuration state
  const [config, setConfig] = useState<PhantomCloakerConfig>(() => store.getPhantomCloakerConfig());
  const [customCountryInput, setCustomCountryInput] = useState("");
  const [generatedWorkerScript, setGeneratedWorkerScript] = useState("");
  const [generatedClientSnippet, setGeneratedClientSnippet] = useState("");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const res = auth.updateCurrentUserProfile({
      name: profileName,
      nickname: profileNickname,
      timezone: profileTimezone,
    });
    if (res.success) {
      setProfileSavedSuccess(true);
      setTimeout(() => setProfileSavedSuccess(false), 3000);
    }
  };

  const previewGreeting = getDashboardGreeting({
    id: session?.user?.id || "preview",
    name: profileName || "Willian",
    nickname: profileNickname || "Will",
    timezone: profileTimezone,
    email: session?.user?.email || "admin@phantomx.pro",
    role: "admin",
    organizationId: "org",
    organizationName: "Phantom-X Command",
    createdAt: new Date().toISOString(),
  });

  // Sync worker script and client snippet when config changes
  useEffect(() => {
    const worker = CloakerEngine.generateCloudflareWorkerCode(config);
    setGeneratedWorkerScript(worker);

    const clientSnippet = CloakerEngine.generateClientFingerprintSnippet(config);
    setGeneratedClientSnippet(clientSnippet);
  }, [config]);

  const copyToClipboard = (text: string, type: "key" | "snippet" | "worker" | "fingerprint") => {
    navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else if (type === "snippet") {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    } else if (type === "worker") {
      setCopiedWorkerCode(true);
      setTimeout(() => setCopiedWorkerCode(false), 2000);
    } else {
      setCopiedFingerprint(true);
      setTimeout(() => setCopiedFingerprint(false), 2000);
    }
  };

  const handleGenerateNewKey = () => {
    if (confirm("Gerar uma nova chave invalidará a chave atual imediatamente. Deseja prosseguir?")) {
      const newKey = `ph_live_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
      setApiKey(newKey);
    }
  };

  const handleSaveCloakerConfig = () => {
    store.updatePhantomCloakerConfig(config);
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

  const handleDownloadFingerprintScript = () => {
    const jsOnly = generatedClientSnippet
      .replace(/^<!--.*?-->\s*/m, "")
      .replace(/^<script>\s*/m, "")
      .replace(/<\/script>\s*$/m, "");

    const blob = new Blob([jsOnly], { type: "application/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "phantom-fingerprint.js");
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
        subtitle="Gerenciador do Motor de Borda Phantom-X, perfil do operador e telemetria client-side"
      />

      <div className="p-3 sm:p-6 space-y-5 sm:space-y-8 max-w-5xl w-full mx-auto font-mono text-xs">
        {/* Save feedback banner */}
        {savedSuccess && (
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-white flex items-center justify-between shadow-glow-sm">
            <div className="flex items-center space-x-2.5">
              <Check className="w-5 h-5 text-white" />
              <span className="font-semibold text-xs font-sans">
                Parâmetros do Motor Phantom-X e scripts atualizados e persistidos com sucesso!
              </span>
            </div>
            <span className="text-[11px] text-neutral-400">Worker &amp; Snippets regenerados</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* 0. PERFIL DO OPERADOR & FUSO-HORÁRIO (CONFIGURAÇÕES DE CONTA)    */}
        {/* ================================================================= */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 sm:p-6 shadow-glow-sm space-y-5">
          <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-brand-white" />
                <h3 className="text-sm font-bold text-brand-white">Perfil e Configurações de Usuário</h3>
              </div>
              <p className="text-brand-secondary text-[11px] mt-0.5">
                Configure seu nome, apelido informal de operador e fuso-horário para saudações e logs
              </p>
            </div>

            {profileSavedSuccess && (
              <span className="text-xs text-white font-semibold flex items-center space-x-1.5 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-700 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Perfil salvo com sucesso!</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 font-sans text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-brand-muted text-[11px] font-mono mb-1.5">
                  NOME COMPLETO DO OPERADOR
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Ex: Will Araujo"
                  required
                  className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white transition font-mono"
                />
              </div>

              {/* Nickname / Apelido */}
              <div>
                <label className="block text-brand-muted text-[11px] font-mono mb-1.5 flex items-center justify-between">
                  <span>APELIDO NO DASHBOARD (SAUDAÇÃO)</span>
                  <span className="text-[10px] text-brand-secondary">Exibido na Saudação</span>
                </label>
                <input
                  type="text"
                  value={profileNickname}
                  onChange={(e) => setProfileNickname(e.target.value)}
                  placeholder="Ex: Will"
                  required
                  className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-white placeholder-neutral-600 focus:outline-none focus:border-white transition font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Timezone Selector */}
              <div>
                <label className="block text-brand-muted text-[11px] font-mono mb-1.5">
                  FUSO-HORÁRIO OPERACIONAL (RELÓGIO &amp; LOGS)
                </label>
                <select
                  value={profileTimezone}
                  onChange={(e) => setProfileTimezone(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-white focus:outline-none focus:border-white transition font-mono"
                >
                  {TIMEZONE_REGIONS.map((reg) => (
                    <optgroup key={reg.region} label={`${reg.flag} ${reg.region}`}>
                      {reg.timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.flag} {tz.label} ({tz.offset})
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Email (Readonly) */}
              <div>
                <label className="block text-brand-muted text-[11px] font-mono mb-1.5 flex items-center justify-between">
                  <span>E-MAIL DA CONTA</span>
                  <span className="text-[10px] text-white">Autenticado</span>
                </label>
                <input
                  type="email"
                  value={session?.user?.email || "admin@phantomx.pro"}
                  disabled
                  className="w-full px-3 py-2 bg-brand-black/50 border border-brand-borderSubtle rounded-lg text-brand-secondary font-mono cursor-not-allowed"
                />
              </div>
            </div>

            {/* Live Greeting Preview Banner */}
            <div className="p-3 rounded-xl bg-brand-black/60 border border-brand-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center space-x-2 text-brand-secondary">
                <Clock className="w-4 h-4 text-brand-white shrink-0" />
                <span>
                  Prévia no Dashboard: <strong className="text-brand-white">{previewGreeting.fullGreeting}</strong>
                </span>
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center justify-center space-x-2 shrink-0 font-sans"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Perfil</span>
              </button>
            </div>
          </form>
        </div>

        {/* 1. PHANTOM-X ENGINE SETTINGS */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 sm:p-6 shadow-glow-sm space-y-6">
          <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-brand-white" />
                <h3 className="text-sm font-bold text-brand-white">Motor de Borda Phantom-X</h3>
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

          {/* CAMADA 3: CLIENT-SIDE FINGERPRINTING & HARDWARE INTEGRITY */}
          <div className="space-y-3 border-t border-brand-borderSubtle pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-4 h-4 text-brand-white" />
                <label className="text-brand-muted text-[11px] font-bold">
                  CAMADA 3: FINGERPRINT CLIENT-SIDE &amp; HARDWARE (WEBGL / CANVAS)
                </label>
              </div>
              <span className="text-[10px] text-brand-secondary">Proteção ativa no navegador</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="flex items-start justify-between cursor-pointer p-3 rounded-lg bg-brand-black/40 border border-brand-borderSubtle">
                <div className="pr-2">
                  <div className="text-brand-white font-medium text-xs">Anti-Headless &amp; Webdriver</div>
                  <div className="text-brand-secondary text-[10px] mt-0.5">
                    Detecta navigator.webdriver, Puppeteer e automações.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.blockHeadless}
                  onChange={(e) => setConfig({ ...config, blockHeadless: e.target.checked })}
                  className="rounded border-brand-border bg-brand-surface text-brand-white focus:ring-0 mt-1"
                />
              </label>

              <label className="flex items-start justify-between cursor-pointer p-3 rounded-lg bg-brand-black/40 border border-brand-borderSubtle">
                <div className="pr-2">
                  <div className="text-brand-white font-medium text-xs">Anti-GPU Datacenter</div>
                  <div className="text-brand-secondary text-[10px] mt-0.5">
                    Bloqueia SwiftShader, llvmpipe e Mesa rasterizers de servidores.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.blockSwiftShader}
                  onChange={(e) => setConfig({ ...config, blockSwiftShader: e.target.checked })}
                  className="rounded border-brand-border bg-brand-surface text-brand-white focus:ring-0 mt-1"
                />
              </label>

              <div className="p-3 rounded-lg bg-brand-black/40 border border-brand-borderSubtle space-y-1">
                <label className="block text-brand-white font-medium text-xs">Ação ao Detectar Bot</label>
                <select
                  value={config.clientAction}
                  onChange={(e) => setConfig({ ...config, clientAction: e.target.value as any })}
                  className="w-full px-2 py-1 bg-brand-surface border border-brand-border rounded text-white text-[11px] focus:outline-none"
                >
                  <option value="redirect_whitepage">Redirecionar para Safe Page</option>
                  <option value="log_only">Apenas Registrar Flag</option>
                </select>
              </div>
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

        {/* 3. CAMADA 3: CLIENT-SIDE FINGERPRINT SNIPPET */}
        <div className="bg-brand-surface border border-brand-border rounded-xl p-5 sm:p-6 shadow-glow-sm space-y-4">
          <div className="border-b border-brand-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-5 h-5 text-brand-white" />
                <h3 className="text-sm font-bold text-brand-white">Snippet Client-Side: WebGL, Canvas &amp; Anti-Headless (Camada 3)</h3>
              </div>
              <p className="text-brand-secondary text-[11px] mt-0.5">
                Cole antes do fechamento da tag <code>&lt;/head&gt;</code> na sua página para neutralizar robôs que executam JavaScript
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(generatedClientSnippet, "fingerprint")}
                className="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition flex items-center space-x-1.5"
              >
                {copiedFingerprint ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFingerprint ? "Copiado!" : "Copiar Snippet"}</span>
              </button>

              <button
                onClick={handleDownloadFingerprintScript}
                className="px-3.5 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-hover border border-brand-border text-brand-white transition flex items-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar .js</span>
              </button>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-neutral-900 dark:bg-black border border-brand-borderSubtle overflow-x-auto max-h-64">
            <pre className="text-white text-[11px] leading-relaxed">
              <code>{generatedClientSnippet}</code>
            </pre>
          </div>

          <div className="p-3 rounded-lg bg-brand-black/40 border border-brand-borderSubtle text-[11px] text-brand-secondary flex items-center justify-between">
            <span>Você também pode carregar dinamicamente via CDN/Endpoint:</span>
            <code className="text-white bg-neutral-800 px-2 py-0.5 rounded font-mono text-[10px]">
              &lt;script src=&quot;/api/v1/telemetry.js&quot; async&gt;&lt;/script&gt;
            </code>
          </div>
        </div>

        {/* 4. APPEARANCE & THEME CARD */}
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

        {/* 5. API CREDENTIALS */}
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
      </div>
    </div>
  );
}
