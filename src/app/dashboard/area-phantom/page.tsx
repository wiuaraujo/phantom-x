"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/dashboard/Header";
import { Logo } from "@/components/ui/Logo";
import { useLanguage } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import {
  Sparkles,
  BookOpen,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Zap,
  Terminal,
  Cpu,
  Layers,
  Globe2,
  Check,
  Copy,
  ChevronRight,
  ChevronDown,
  Search,
  ExternalLink,
  Target,
  HelpCircle,
  Code,
  ArrowRight,
  Eye,
  Smartphone,
  Lock,
  Play,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Wand2,
  FileText,
  RefreshCw,
  Sliders,
  BarChart2,
  AlertOctagon,
} from "lucide-react";
import { CreativeShieldEngine } from "@/lib/creativeShield";
import {
  CreativeCamouflageEngine,
  CamouflageResponse,
  CamouflagedVariation,
} from "@/lib/creativeCamouflageEngine";

type HubCategory = "passo-a-passo" | "engenharia" | "criativos" | "blackhat" | "simulador" | "faq";

interface FaqItem {
  q: string;
  a: string;
  tag: string;
}

export default function AreaPhantomPage() {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState<HubCategory>("passo-a-passo");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Estado do Camuflador de Criativos Backend & Bypass
  const [creativeText, setCreativeText] = useState(
    "🔥 DESCUBRA O CHÁ SECRETO QUE VAI CURAR E ELIMINAR DE VEZ A GORDURA! Perca 10kg em 7 dias dormindo. Ganhe R$ 5.000 por semana trabalhando no celular sem esforço. Assista antes que saia do ar!!!"
  );
  const auditResult = useMemo(() => CreativeShieldEngine.auditCreative(creativeText), [creativeText]);

  const [selectedNiche, setSelectedNiche] = useState<"saude" | "financas" | "relacionamento" | "apostas" | "geral">("saude");
  const [selectedPlatform, setSelectedPlatform] = useState<"meta_ads" | "google_ads" | "tiktok_ads">("meta_ads");
  const [activeVariationIndex, setActiveVariationIndex] = useState(0);
  const [isCamouflaging, setIsCamouflaging] = useState(false);
  const [camouflageData, setCamouflageData] = useState<CamouflageResponse>(() =>
    CreativeCamouflageEngine.processCamouflage({
      copy: "🔥 DESCUBRA O CHÁ SECRETO QUE VAI CURAR E ELIMINAR DE VEZ A GORDURA! Perca 10kg em 7 dias dormindo. Ganhe R$ 5.000 por semana trabalhando no celular sem esforço. Assista antes que saia do ar!!!",
      niche: "saude",
      platform: "meta_ads",
    })
  );

  const handleRunCamouflage = async (customCopy?: string, customNiche?: string) => {
    const copyToUse = customCopy !== undefined ? customCopy : creativeText;
    const nicheToUse = (customNiche || selectedNiche) as any;
    setIsCamouflaging(true);
    try {
      const res = await fetch("/api/v1/creative/camouflage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          copy: copyToUse,
          niche: nicheToUse,
          platform: selectedPlatform,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCamouflageData(data);
        setActiveVariationIndex(0);
      } else {
        const fallback = CreativeCamouflageEngine.processCamouflage({
          copy: copyToUse,
          niche: nicheToUse,
          platform: selectedPlatform,
        });
        setCamouflageData(fallback);
        setActiveVariationIndex(0);
      }
    } catch {
      const fallback = CreativeCamouflageEngine.processCamouflage({
        copy: copyToUse,
        niche: nicheToUse,
        platform: selectedPlatform,
      });
      setCamouflageData(fallback);
      setActiveVariationIndex(0);
    } finally {
      setIsCamouflaging(false);
    }
  };

  // Estado do Simulador Interativo de Requisições
  const [simulatedScenario, setSimulatedScenario] = useState<"bot_meta" | "buyer_real" | "human_vpn" | null>("bot_meta");

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const faqs: FaqItem[] = [
    {
      q: "A geolocalização do Phantom-X é assertiva e real?",
      a: "Sim. O Phantom-X lê diretamente os cabeçalhos de borda da infraestrutura Edge (Vercel Edge e Cloudflare: cf-ipcountry, cf-ipcity, cf-region, cf-iplatitude, cf-iplongitude), além de contar com mapeamento in-memory de ASN dos principais provedores brasileiros (Claro, Vivo, TIM, Oi, Copel) e datacenters mundiais. Isso garante o teto máximo de precisão viável na internet: ~99% por país, ~90% por estado e ~75% por cidade.",
      tag: "Geolocalização & Edge",
    },
    {
      q: "Qual a melhor engenharia para aprovar anúncios de nichos agressivos na Meta e Google?",
      a: "A fórmula de 99% de aprovação reúne: 1) Pré-Voo de Criativo: usar ângulos de curiosidade e eliminar termos proibidos da copy usando o Auditor de Criativos; 2) Coerência Semântica: a Whitepage deve compartilhar o mesmo tema e schema editorial do criativo; 3) Entrega Edge SSR (Zero-JS-Redirect): entregar o HTML no mesmo domínio com HTTP 200 OK sem disparar alerta de 'Burla de Sistemas'.",
      tag: "Aprovação & Políticas",
    },
    {
      q: "Meu anúncio de oferta agressiva pode ser reprovado mesmo com o Phantom-X ativo?",
      a: "Sim, caso o criativo (vídeo, imagem, headline ou texto do anúncio) viole as políticas da plataforma. O Phantom-X protege e camufla a sua página de destino (URL final), garantindo que robôs e moderadores só vejam uma Whitepage perfeita. Mas a análise de criativo é feita por visão computacional antes mesmo do link ser aberto. Dica de ouro: use criativos com ângulos de curiosidade ou dor suave, e deixe a promessa forte apenas na página da oferta.",
      tag: "Aprovação & Políticas",
    },
    {
      q: "Como o Phantom-X entrega a página sem fazer redirecionamento 301 ou 302?",
      a: "O Phantom-X roda dentro dos nós de borda da Cloudflare como um Reverse Proxy puro. Quando o usuário acessa seu link, o Worker busca internamente o HTML da Whitepage (se for moderador) ou da Oferta (se for comprador) e cospe o conteúdo com status HTTP 200 OK mantendo o mesmo domínio. O robô da Meta ou Google nunca detecta salto de URL ou redirecionamento suspeito.",
      tag: "Engenharia de Borda",
    },
    {
      q: "Preciso contratar um servidor VPS caro ou instalar Nginx para usar o Phantom-X?",
      a: "Não! Ao contrário de cloakers legados como Keitaro ou AlterCPA que exigem servidores Linux dedicados e bancos pesados, o Phantom-X é 100% Edge Serverless. Você só precisa colar o script no seu Cloudflare Worker gratuito e ele já opera com latência abaixo de 15ms nos mais de 300 data centers mundiais da Cloudflare.",
      tag: "Infraestrutura",
    },
    {
      q: "Como eu posso testar na prática se o cloaker está funcionando no meu link?",
      a: "Abra seu link direto no navegador (sem parâmetros e em um computador desktop): se a regra exigir mobile ou token fbclid, você verá a Whitepage. Agora, abra o link no seu celular (4G) adicionando o parâmetro '?fbclid=IwAR1234567890': você verá a Oferta completa abrir instantaneamente. Isso comprova que a filtragem em tempo real está ativa.",
      tag: "Validação & Testes",
    },
    {
      q: "O que acontece com os parâmetros e UTMs que vêm dos anúncios?",
      a: "O Phantom-X preserva 100% de todas as UTMs (utm_source, utm_medium, utm_campaign, utm_content, etc.), do token fbclid e parâmetros personalizados de tracking. Eles são repassados de forma transparente para a página da oferta e para o checkout (Hotmart, Kiwify, PerfectPay, CartPanda, etc.), sem quebrar métricas de conversão.",
      tag: "Rastreamento & Vendas",
    },
    {
      q: "O que é o 'Kill-Switch de Emergência' e quando devo ativá-lo?",
      a: "O Kill-Switch é uma trava de segurança instantânea. Se sua campanha começar a receber uma tempestade atípica de inspeções de moderadores ou se você desconfiar de uma análise manual massiva da Meta, você liga o Kill-Switch e o Worker forçará 100% dos acessos (inclusive compradores) para a Whitepage em menos de 1 segundo em todo o globo, salvando a sua conta de anúncios.",
      tag: "Contingência",
    },
  ];

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(
      (f) =>
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q) ||
        f.tag.toLowerCase().includes(q)
    );
  }, [searchQuery, faqs]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-brand-black font-sans text-brand-white transition-colors duration-200">
      <Header
        title={t.dashboard.areaPhantomTitle}
        subtitle={t.dashboard.areaPhantomSubtitle}
      />

      <div className="p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto">
        {/* ================================================================= */}
        {/* 1. HERO BANNER COM DEGRADÊ ULTRA PREMIUM E LOGO OFICIAL           */}
        {/* ================================================================= */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 dark:border-white/10 bg-gradient-to-br from-white via-sky-50/60 to-slate-50 dark:from-neutral-950 dark:via-[#0d0f14] dark:to-neutral-900 p-6 sm:p-8 lg:p-10 shadow-lg shadow-sky-950/5 dark:shadow-2xl transition-all">
          {/* Ambient Lighting / Glow Effects */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4 max-w-3xl">
              {/* Badges de Destaque */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/5 dark:bg-white/[0.06] border border-slate-300 dark:border-white/15 backdrop-blur-md text-[11px] font-mono text-slate-800 dark:text-white font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  <span>PHANTOM-X ACADEMY &amp; MASTERY</span>
                </div>
              </div>

              {/* Título com Logo Oficial da Phantom */}
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-slate-200 dark:border-white/15 shadow-sm shrink-0">
                  <Logo size={36} className="shrink-0" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
                    Área Phantom-X
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-neutral-400 font-medium mt-0.5">
                    Central de Treinamento, Engenharia de Borda e Segredos de Aprovação de Tráfego Pago
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-300 leading-relaxed max-w-2xl">
                O Phantom-X foi desenhado para transformar operações de tráfego de alta escala. 
                Aqui você encontra tudo: desde o setup do primeiro domínio em 3 minutos até as técnicas 
                avançadas de isolamento de moderadores da Meta, Google Ads e TikTok Ads.
              </p>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="grid grid-cols-2 gap-3 lg:w-80 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">Entrega de Borda</div>
                <div className="text-lg font-bold font-mono text-slate-950 dark:text-white mt-0.5">HTTP 200 OK</div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-500">Sem redirects 301/302</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">Latência Média</div>
                <div className="text-lg font-bold font-mono text-slate-950 dark:text-white mt-0.5">&lt; 14ms</div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-500">Cloudflare Edge Cluster</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">Camadas Ativas</div>
                <div className="text-lg font-bold font-mono text-slate-950 dark:text-white mt-0.5">6 Filtros</div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-500">Hardware &amp; ASNs</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">Blindagem</div>
                <div className="text-lg font-bold font-mono text-slate-950 dark:text-white mt-0.5">Meta / Google</div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-500">Reviewers isolados</div>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mt-6 max-w-xl">
            <Search className="w-4 h-4 text-slate-500 dark:text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por tópico, dúvida, código, fbclid, Whitepage ou DNS..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black/60 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-slate-500 dark:focus:border-white/30 transition shadow-sm backdrop-blur-md"
            />
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. ABAS DE NAVEGAÇÃO MINIMALISTAS PRETO E BRANCO COM DEGRADÊ      */}
        {/* ================================================================= */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "passo-a-passo", label: "Guia Passo a Passo", icon: Play },
            { id: "engenharia", label: "Engenharia & Borda", icon: Cpu },
            { id: "criativos", label: "Camuflagem & Aprovação", icon: Wand2 },
            { id: "blackhat", label: "Dicas para Ofertas Agressivas", icon: Target },
            { id: "simulador", label: "Simulador de Rede", icon: Terminal },
            { id: "faq", label: "Dúvidas Frequentes (FAQ)", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer border ${
                  isSelected
                    ? "!bg-slate-900 !text-white !border-slate-900 shadow-md dark:!bg-gradient-to-b dark:!from-neutral-800 dark:!to-neutral-900 dark:!border-white/20 dark:!text-white"
                    : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200 dark:bg-neutral-900/40 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/60 dark:border-white/5 shadow-sm"
                }`}
              >
                <Icon
                  className="w-3.5 h-3.5 shrink-0"
                />
                <span>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ================================================================= */}
        {/* 3. CONTEÚDO DAS ABAS                                              */}
        {/* ================================================================= */}

        {/* ----------------------------------------------------------------- */}
        {/* ABA 1: PASSO A PASSO (DO ZERO À PRIMEIRA CAMPANHA)               */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "passo-a-passo" && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/95 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Roteiro de Implementação em 4 Passos</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-slate-700 dark:text-neutral-200 uppercase font-semibold">
                  Tempo estimado: 4 minutos
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1">
                Siga exatamente a ordem abaixo para colocar seu primeiro domínio blindado no ar sem risco de erros.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Passo 1 */}
              <div className="relative p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition group shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-gradient-to-b dark:from-neutral-800 dark:to-neutral-900 border border-slate-300 dark:border-white/15 flex items-center justify-center font-mono font-bold text-slate-900 dark:text-white text-sm shadow-sm">
                    01
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">DNS &amp; Domínio</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Conecte seu Domínio na Cloudflare</h3>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed mb-4">
                  Adicione o seu domínio na sua conta da Cloudflare (plano 100% gratuito). 
                  Aponte os nameservers e garanta que a nuvem laranja (Proxy Ativo) esteja ligada no registro DNS da sua página.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-neutral-400 space-y-1">
                  <div>• Tipo: <span className="text-slate-900 dark:text-white font-semibold">CNAME</span> ou <span className="text-slate-900 dark:text-white font-semibold">A</span></div>
                  <div>• Proxy Status: <span className="text-slate-900 dark:text-white font-semibold">Proxied (Nuvem Laranja)</span></div>
                  <div>• SSL: <span className="text-slate-900 dark:text-white font-semibold">Full ou Strict</span></div>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="relative p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition group shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-gradient-to-b dark:from-neutral-800 dark:to-neutral-900 border border-slate-300 dark:border-white/15 flex items-center justify-center font-mono font-bold text-slate-900 dark:text-white text-sm shadow-sm">
                    02
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">Páginas</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Prepare a Whitepage e a Blackpage (Oferta)</h3>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed mb-4">
                  Você precisa de duas URLs no ar:
                  <br />
                  <strong className="text-slate-900 dark:text-white">1. Whitepage (Safe Page):</strong> Um artigo neutro de blog, portal de notícias de tecnologia ou receitas, sem promessas e com termos/políticas no rodapé.
                  <br />
                  <strong className="text-slate-900 dark:text-white">2. Oferta (Blackpage):</strong> Sua página real de vendas, VSL ou checkout agressivo.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-neutral-400 space-y-1">
                  <div>✓ Safe Page: <span className="text-slate-900 dark:text-white font-semibold">https://seusite.com/artigo-informativo</span></div>
                  <div>✓ Black Page: <span className="text-slate-900 dark:text-white font-semibold">https://seusite.com/vsl-secreta</span></div>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="relative p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition group shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-gradient-to-b dark:from-neutral-800 dark:to-neutral-900 border border-slate-300 dark:border-white/15 flex items-center justify-center font-mono font-bold text-slate-900 dark:text-white text-sm shadow-sm">
                    03
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">Cloudflare Worker</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Instale o Cloudflare Worker do Phantom-X</h3>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed mb-4">
                  Vá na aba <strong className="text-slate-900 dark:text-white">Cloudflare Worker</strong> nas configurações do Phantom-X, 
                  copie o código pronto gerado pelo sistema e cole no editor da Cloudflare (Workers &amp; Pages &rarr; Create Worker &rarr; Deploy).
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/5 font-mono text-[11px] text-slate-700 dark:text-neutral-400">
                  Rota do Worker: <span className="text-slate-900 dark:text-white font-semibold">seusite.com/*</span>
                </div>
              </div>

              {/* Passo 4 */}
              <div className="relative p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition group shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-gradient-to-b dark:from-neutral-800 dark:to-neutral-900 border border-slate-300 dark:border-white/15 flex items-center justify-center font-mono font-bold text-slate-900 dark:text-white text-sm shadow-sm">
                    04
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-semibold">Subindo Anúncio</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Configure o Link na Plataforma de Tráfego</h3>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed mb-4">
                  No Gerenciador de Anúncios (Meta, Google ou TikTok), insira a URL principal do seu domínio. 
                  O Phantom-X preservará automaticamente todos os parâmetros de UTMs e o token oficial fbclid/gclid.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/5 font-mono text-[11px] text-slate-900 dark:text-white font-semibold">
                  URL no Anúncio: https://seusite.com/?utm_source=meta&amp;utm_campaign=oferta01
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ABA 2: ENGENHARIA & COMO FUNCIONA (AS 6 CAMADAS)                 */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "engenharia" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/95 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-slate-900 dark:text-white" />
                <span>Arquitetura de Borda: O que o Phantom-X faz nos bastidores</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed mt-2 max-w-3xl">
                Diferente de cloakers antigos que usam redirects HTTP 301/302 ou scripts lentos em PHP/WordPress, 
                o Phantom-X opera no nível da rede física através de 6 camadas de decisão determinística.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  layer: "Camada 1",
                  title: "Geo-Fencing Determinístico",
                  badge: "Filtro Geográfico",
                  desc: "Bloqueia qualquer requisição originada fora do país segmentado. Centros de moderação humana da Meta localizados em Dublin (Irlanda), Austin (EUA) e Manila (Filipinas) são neutralizados antes de consumir recursos.",
                  tech: "cf.country != 'BR' => Serve Whitepage (HTTP 200)",
                },
                {
                  layer: "Camada 2",
                  title: "Filtro de Dispositivo & Sistema Operacional",
                  badge: "Dispositivo",
                  desc: "Para campanhas voltadas a celular, o Phantom-X bloqueia emuladores de mesa e navegadores de computadores desktop. Moderadores costumam analisar anúncios em monitores widescreen em ferramentas internas.",
                  tech: "userAgent.match(/iphone|android/) ? Pass : Mitigate",
                },
                {
                  layer: "Camada 3",
                  title: "Blacklist de ASNs de Datacenters & 40+ Padrões de Bots",
                  badge: "Assinatura de Rede",
                  desc: "Intercepta robôs da Meta (AS32934, AS63293), instâncias AWS EC2, Google Cloud, Azure, DigitalOcean e Hetzner. Robôs usam servidores em nuvem para rastrear links; humanos navegam em redes residenciais (Claro, Vivo, TIM).",
                  tech: "BLOCKED_ASNS.has(cf.asn) || BOT_PATTERNS.some(ua) => Serve Whitepage",
                },
                {
                  layer: "Camada 4",
                  title: "Validação de Tokens Oficiais da Plataforma (fbclid / gclid)",
                  badge: "Token de Clique",
                  desc: "Quando um usuário real clica no anúncio dentro do aplicativo do Instagram/Facebook, a Meta injeta o parâmetro '?fbclid='. Se um moderador abrir a URL diretamente pelo navegador sem esse token, ele cai automaticamente na Whitepage.",
                  tech: "exigirFbclid && !searchParams.has('fbclid') => Mitigate",
                },
                {
                  layer: "Camada 5",
                  title: "Integridade de Client Hints HTTP (sec-ch-ua)",
                  badge: "Cabeçalhos Chromium",
                  desc: "Navegadores modernos emitem cabeçalhos criptográficos 'sec-ch-ua'. Scrapers automatizados em Python ou cURL que tentam forjar o User-Agent falham nesta checagem por não possuírem a pilha TLS e cabeçalhos reais.",
                  tech: "headers.get('sec-ch-ua') == null => Flag Automation",
                },
                {
                  layer: "Camada 6",
                  title: "Threat Intelligence em Tempo Real (ProxyCheck.io)",
                  badge: "Detecção de VPN / Proxy",
                  desc: "Calcula a probabilidade de risco do IP do visitante (0 a 100). IPs residenciais contaminados por VPNs ou servidores Tor são classificados como suspeitos e isolados na Whitepage.",
                  tech: "ProxyCheck API score >= 60 => Quarantine",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white font-semibold">
                        {item.layer}
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-neutral-400 font-semibold">{item.badge}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 dark:bg-black/90 border border-slate-800 dark:border-white/10 font-mono text-[11px] text-neutral-200 shrink-0 md:max-w-xs overflow-x-auto shadow-inner">
                    <code>{item.tech}</code>
                  </div>
                </div>
              ))}
            </div>

            {/* Hardware Fingerprinting Deep Dive */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/95 dark:to-neutral-950 border border-slate-200 dark:border-white/10 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-slate-900 dark:text-white" />
                <span>Telemetria de Hardware Client-Side (Camada Extra anti-Selenium)</span>
              </h3>
              <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                Além do Worker na borda, o Phantom-X conta com o snippet <code className="text-slate-900 dark:text-neutral-200 font-mono bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded">telemetry.js</code>. 
                Ele renderiza uma malha oculta de Canvas 2D e WebGL no navegador do visitante. Se o moderador estiver usando um emulador 
                de nuvem com renderizador de software (<code className="text-slate-800 dark:text-neutral-200 font-mono">Google SwiftShader</code> ou <code className="text-slate-800 dark:text-neutral-200 font-mono">llvmpipe</code>) 
                ou o atributo <code className="text-slate-800 dark:text-neutral-200 font-mono">navigator.webdriver = true</code>, a página redireciona na hora para a Whitepage.
              </p>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ABA 3: CAMUFLADOR DE CRIATIVOS & ENGENHARIA DE BYPASS DE MODERAÇÃO  */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "criativos" && (
          <div className="space-y-6">
            {/* Header Preto com Degradê Sutil (Padrão Clean Minimalista) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/95 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/15 text-[10px] font-mono text-slate-800 dark:text-neutral-200 uppercase tracking-wider font-semibold">
                    <Sparkles className="w-3 h-3 text-slate-700 dark:text-neutral-300" />
                    <span>Motor Backend de Camuflagem &amp; Bypass de Moderação</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span>Camuflador de Anúncios Phantom-X &amp; Aprovação Expressa</span>
                  </h2>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/[0.05] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-neutral-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-slate-900 dark:text-white" />
                  <span>Meta / Google Bypass 100% Funcional</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed mt-2.5 max-w-3xl">
                A engenharia definitiva para subir e aprovar ofertas agressivas (black) sem risco de reprovação ou queda de conta. 
                O backend do Phantom-X processa termos sensíveis e transforma sua promessa em <strong>ângulos camuflados com até 99% de aprovação na Meta Ads</strong>, 
                gerando simultaneamente a <strong>Whitepage Camaleão sincronizada</strong> para eliminar o banimento por evasão de sistemas.
              </p>
            </div>

            {/* Painel Operacional de Camuflagem */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna Esquerda: Entrada de Copy, Nicho & Disparo do Backend (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                  {/* Seletor de Nicho e Plataforma */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2 border-b border-slate-100 dark:border-white/5">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1.5">
                        Nicho da Oferta
                      </label>
                      <select
                        value={selectedNiche}
                        onChange={(e) => {
                          const val = e.target.value as any;
                          setSelectedNiche(val);
                          handleRunCamouflage(creativeText, val);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/10 text-xs text-slate-800 dark:text-white font-mono focus:outline-none focus:border-slate-500"
                      >
                        <option value="saude">Saúde &amp; Emagrecimento (Black)</option>
                        <option value="financas">Finanças &amp; Renda Extra (Black)</option>
                        <option value="relacionamento">Relacionamento &amp; Adulto</option>
                        <option value="apostas">Apostas &amp; iGaming</option>
                        <option value="geral">Geral / Infoprodutos</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mb-1.5">
                        Rede de Tráfego Alvo
                      </label>
                      <select
                        value={selectedPlatform}
                        onChange={(e) => setSelectedPlatform(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/10 text-xs text-slate-800 dark:text-white font-mono focus:outline-none focus:border-slate-500"
                      >
                        <option value="meta_ads">Meta Ads (Facebook &amp; Instagram)</option>
                        <option value="google_ads">Google Ads &amp; YouTube</option>
                        <option value="tiktok_ads">TikTok Ads</option>
                      </select>
                    </div>
                  </div>

                  {/* Presets Rápidos Minimalistas */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-semibold">
                      Testar camuflagem com ofertas agressivas reais:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => {
                          const text = "🔥 DESCUBRA O CHÁ SECRETO QUE VAI CURAR E ELIMINAR DE VEZ A GORDURA! Perca 10kg em 7 dias dormindo. O que a indústria esconde de você! Assista antes que saia do ar!!!";
                          setCreativeText(text);
                          setSelectedNiche("saude");
                          handleRunCamouflage(text, "saude");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 border border-slate-300 dark:border-white/10 text-[10px] font-mono text-slate-800 dark:text-neutral-200 transition"
                      >
                        Saúde / Perda de Peso
                      </button>
                      <button
                        onClick={() => {
                          const text = "Ganhe R$ 5.000 por semana trabalhando no celular sem esforço! Robô do Pix com lucro garantido 100%! Fique rico sem sair de casa trabalhando 20 minutos por dia.";
                          setCreativeText(text);
                          setSelectedNiche("financas");
                          handleRunCamouflage(text, "financas");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 border border-slate-300 dark:border-white/10 text-[10px] font-mono text-slate-800 dark:text-neutral-200 transition"
                      >
                        Finanças / Renda Extra
                      </button>
                      <button
                        onClick={() => {
                          const text = "Você está com vergonha do seu corpo e cansado de ser pobre? Cansado de estar endividado? Assista esse vídeo chocante que os especialistas estão tentando apagar!";
                          setCreativeText(text);
                          setSelectedNiche("geral");
                          handleRunCamouflage(text, "geral");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 border border-slate-300 dark:border-white/10 text-[10px] font-mono text-slate-800 dark:text-neutral-200 transition"
                      >
                        Atributos Pessoais &amp; Curiosidade
                      </button>
                      <button
                        onClick={() => {
                          const text = "Método da brecha na roleta que paga R$ 500 todos os dias! Bug comprovado para lucrar em apostas sem risco!";
                          setCreativeText(text);
                          setSelectedNiche("apostas");
                          handleRunCamouflage(text, "apostas");
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 border border-slate-300 dark:border-white/10 text-[10px] font-mono text-slate-800 dark:text-neutral-200 transition"
                      >
                        Apostas / iGaming
                      </button>
                    </div>
                  </div>

                  {/* Textarea da Promessa Black */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-700 dark:text-neutral-300" />
                        <span>Texto / Promessa Black da sua Oferta</span>
                      </label>
                      <span className="text-[11px] font-mono text-slate-400 dark:text-neutral-500">
                        {creativeText.length} caracteres
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={creativeText}
                      onChange={(e) => setCreativeText(e.target.value)}
                      placeholder="Cole aqui a promessa forte ou anúncio que a Meta costuma reprovar..."
                      className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-slate-500 dark:focus:border-white/30 font-sans leading-relaxed transition shadow-inner"
                    />
                  </div>

                  {/* Botão de Camuflagem no Backend Minimalista Preto e Branco */}
                  <div className="pt-1">
                    <button
                      onClick={() => handleRunCamouflage()}
                      disabled={isCamouflaging || !creativeText.trim()}
                      className="w-full py-3 px-5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {isCamouflaging ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processando Camuflagem no Backend Phantom-X...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          <span>Camuflar Anúncio no Backend (Gerar Ângulos de Alta Aprovação)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sincronização Semântica com a Whitepage Camaleão */}
                <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      <Layers className="w-4 h-4 text-slate-800 dark:text-neutral-200" />
                      <span>Whitepage Camaleão Sincronizada (Anti-Mismatch)</span>
                    </div>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          camouflageData.whitepageSync.editorialHtmlSnippet,
                          "whitepage_html"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800/80 dark:hover:bg-neutral-700 border border-slate-300 dark:border-white/10 text-[10px] font-mono text-slate-800 dark:text-neutral-200 transition flex items-center space-x-1"
                    >
                      {copiedKey === "whitepage_html" ? (
                        <>
                          <Check className="w-3 h-3 text-slate-900 dark:text-white" />
                          <span>HTML Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar HTML Completo da Whitepage</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    O robô da Meta analisa a página segura e cruza com a copy do anúncio. 
                    O Phantom-X gera o código HTML pronto de um portal de notícias limpo no mesmo nicho:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase">Título da Whitepage</span>
                      <div className="text-slate-800 dark:text-neutral-200 font-semibold truncate">
                        {camouflageData.whitepageSync.recommendedTitle}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase">Schema Estruturado</span>
                      <div className="text-slate-900 dark:text-white font-semibold">
                        {camouflageData.whitepageSync.schemaType}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1 font-mono text-[11px]">
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase">Aviso Legal Obrigatório no Rodapé</span>
                    <div className="text-slate-700 dark:text-neutral-300 leading-relaxed">
                      {camouflageData.whitepageSync.requiredLegalNotice}
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Variações Camufladas Geradas pelo Backend (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Cartão de Variações Camufladas */}
                <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-700 dark:text-neutral-300 font-bold flex items-center space-x-1.5">
                      <Wand2 className="w-3.5 h-3.5 text-slate-800 dark:text-neutral-200" />
                      <span>Ângulos Camuflados ({camouflageData.variations.length})</span>
                    </span>
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-white border border-slate-300 dark:border-white/20">
                      {camouflageData.variations[activeVariationIndex]?.badge || "99% Aprovação"}
                    </span>
                  </div>

                  {/* Seletor de Variações */}
                  <div className="flex space-x-1 bg-slate-100 dark:bg-black/40 p-1 rounded-xl">
                    {camouflageData.variations.map((v, idx) => (
                      <button
                        key={v.id}
                        onClick={() => setActiveVariationIndex(idx)}
                        className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-mono font-bold transition truncate ${
                          activeVariationIndex === idx
                            ? "bg-slate-900 text-white dark:bg-white dark:text-black shadow-sm"
                            : "text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        Var {idx + 1} ({v.approvalProbability}%)
                      </button>
                    ))}
                  </div>

                  {/* Detalhes da Variação Selecionada */}
                  {camouflageData.variations[activeVariationIndex] && (
                    <div className="space-y-3.5 pt-1">
                      {/* Título / Headline Camuflada */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-bold">
                          <span>Headline do Anúncio (Meta Ads):</span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                camouflageData.variations[activeVariationIndex].headline,
                                `var_headline_${activeVariationIndex}`
                              )
                            }
                            className="text-slate-900 dark:text-white hover:underline flex items-center space-x-1 font-semibold"
                          >
                            {copiedKey === `var_headline_${activeVariationIndex}` ? (
                              <>
                                <Check className="w-3 h-3 text-slate-900 dark:text-white" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/5 text-xs font-semibold text-slate-900 dark:text-white leading-relaxed">
                          {camouflageData.variations[activeVariationIndex].headline}
                        </div>
                      </div>

                      {/* Texto Principal / Copy Camuflada */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-bold">
                          <span>Texto Principal (Copy do Anúncio):</span>
                          <button
                            onClick={() =>
                              copyToClipboard(
                                camouflageData.variations[activeVariationIndex].bodyCopy,
                                `var_copy_${activeVariationIndex}`
                              )
                            }
                            className="text-slate-900 dark:text-white hover:underline flex items-center space-x-1 font-semibold"
                          >
                            {copiedKey === `var_copy_${activeVariationIndex}` ? (
                              <>
                                <Check className="w-3 h-3 text-slate-900 dark:text-white" />
                                <span>Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/5 text-xs text-slate-700 dark:text-neutral-300 leading-relaxed font-sans whitespace-pre-wrap">
                          {camouflageData.variations[activeVariationIndex].bodyCopy}
                        </div>
                      </div>

                      {/* Botão de Chamada para Ação */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 text-xs font-mono">
                        <span className="text-[10px] uppercase text-slate-400 dark:text-neutral-500 font-bold">Botão de CTA Recomendado:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {camouflageData.variations[activeVariationIndex].cta} &rarr;
                        </span>
                      </div>

                      {/* Explicação Técnica do Bypass */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 space-y-1 text-xs">
                        <div className="font-mono font-bold text-slate-800 dark:text-neutral-200 flex items-center space-x-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                          <span>Por que a IA da Meta aprova sem banir?</span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed">
                          {camouflageData.variations[activeVariationIndex].metaAngleExplanation}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Protocolo Operacional de Liberação de Tráfego */}
                <div className="p-4 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm space-y-2.5">
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Zap className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                    <span>Roteiro de Ativação do Cloaker</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 space-y-1">
                      <div className="font-semibold text-slate-800 dark:text-neutral-200 flex items-center space-x-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px] font-bold">1</span>
                        <span>Fase 1: Revisão do Robô (Primeiros 30-60 min)</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed pl-5">
                        O Phantom-X entrega 100% da Whitepage para qualquer visitante ou bot da Meta via HTTP 200 OK sem salto de URL.
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5 space-y-1">
                      <div className="font-semibold text-slate-800 dark:text-neutral-200 flex items-center space-x-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-900 text-white dark:bg-white dark:text-black flex items-center justify-center text-[10px] font-bold">2</span>
                        <span>Fase 2: Ativação Pós-Aprovação</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-relaxed pl-5">
                        Ao detectar compradores mobile reais com <code>fbclid</code>, a Blackpage é servida instantaneamente enquanto moderadores continuam camuflados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Os 5 Pilares de Engenharia de Aprovação (Cards Educativos) */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-slate-900 dark:text-white" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white font-mono">
                  Os 5 Pilares de Engenharia para 99% de Aprovação em Tráfego Pago
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-slate-900 dark:text-white font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] text-slate-900 dark:text-white">01</span>
                    <span>Camuflagem Semântica</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Troca de Promessa por Curiosidade</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    A IA da Meta lê o criativo antes do clique. Se o criativo promete enriquecimento ou cura, a conta cai. 
                    Promova o &quot;método&quot;, o &quot;estudo recente&quot; ou o &quot;novo hábito&quot; sem usar termos pretensiosos.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-slate-900 dark:text-white font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] text-slate-900 dark:text-white">02</span>
                    <span>Coerência Anúncio-Whitepage</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Fim do Mismatch de Tópico</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Se o anúncio fala de sono e a Whitepage fala de criptomoedas, o algoritmo aplica o banimento de <em>Circumventing Systems</em>. 
                    Mantenha a Whitepage como um portal de notícias no mesmo nicho do criativo.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-slate-900 dark:text-white font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] text-slate-900 dark:text-white">03</span>
                    <span>Entrega Edge SSR HTTP 200</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Zero Redirecionamentos JS</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Scripts com <code className="text-slate-900 dark:text-white font-mono bg-slate-100 dark:bg-white/10 px-1 py-0.5 rounded">window.location</code> são farejados instantaneamente por headless browsers. 
                    O Phantom-X cospe o HTML diretamente da borda sem nunca mudar a URL do navegador.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-slate-900 dark:text-white font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] text-slate-900 dark:text-white">04</span>
                    <span>Geolocalização &amp; Fuso Horário</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sincronia Regional de Borda</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    O tráfego brasileiro deve bater nos PoPs de São Paulo (GRU) e responder no fuso de Brasília. O Phantom-X mapeia 
                    ISPs locais reais (Claro, Vivo, TIM) para que os pacotes de rede tenham latência humana natural.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-slate-900 dark:text-white font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] text-slate-900 dark:text-white">05</span>
                    <span>Aquecimento de Conta &amp; CAPI</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Esteira Gradual de Orçamento</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Comece novas contas com orçamentos leves (R$ 50/dia) rodando diretamente na Whitepage por 48 horas. Após a Meta aprovar 
                    e consolidar o Trust Score, abra o tráfego do Phantom-X para escala.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-slate-900 dark:text-white font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-white/10 flex items-center justify-center text-[10px] text-slate-900 dark:text-white">06</span>
                    <span>Rodapé Legal Obrigatório</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Termos, Privacidade &amp; Contato</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Toda página aprovada precisa ter CNPJ/E-mail, Política de Privacidade e Termos de Uso no rodapé. Sem isso, os crawlers 
                    classificam o destino como &quot;Página de Destino de Baixa Qualidade&quot;.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ABA 4: DICAS PARA OFERTAS AGRESSIVAS (BLACK / GRAY HAT)          */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "blackhat" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/95 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Guia Tático: Como Manter Campanhas Agressivas Vivas</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed mt-2 max-w-3xl">
                O cloaker é 50% da equação. Os outros 50% dependem da sua disciplina operacional. 
                Siga estas regras para evitar que a IA da Meta suspenda suas contas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-mono text-xs font-bold">
                  <Lightbulb className="w-4 h-4 text-slate-900 dark:text-white" />
                  <span>REGRA 1: O Efeito Camaleão da Whitepage</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Clone a Paleta de Cores da Oferta</h4>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  A IA da Meta analisa semelhança visual entre o criativo do anúncio e a página de destino. 
                  Se seu anúncio é azul e fala sobre sono, sua Whitepage deve ser azul e ter um artigo sobre &apos;Higiene do Sono&apos;. 
                  Nunca coloque um artigo de receitas de bolo se o seu criativo fala de saúde ou finanças.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-mono text-xs font-bold">
                  <Lightbulb className="w-4 h-4 text-slate-900 dark:text-white" />
                  <span>REGRA 2: Estratégia de Aquecimento (Warm-up)</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Primeiras 24h em &apos;SÓ_WHITEPAGE&apos;</h4>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Ao subir uma campanha nova, deixe o modo do cloaker configurado em <strong className="text-slate-900 dark:text-white">SÓ_WHITEPAGE</strong> durante a análise. 
                  Assim que o anúncio estiver com status &apos;Ativo&apos; e rodar algumas impressões, mude no Phantom-X para <strong className="text-slate-900 dark:text-white underline decoration-slate-400">AUTOMÁTICO</strong>. 
                  Isso garante 100% de aprovação na primeira rodada.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-mono text-xs font-bold">
                  <Lightbulb className="w-4 h-4 text-slate-900 dark:text-white" />
                  <span>REGRA 3: Contingência de Pixel</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instale o Pixel na Whitepage e na Oferta</h4>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Dispare o evento de &apos;PageView&apos; tanto na Whitepage quanto na Oferta. 
                  Para a Meta, sua página parecerá saudável e recebendo tráfego normalmente. 
                  Dispare o evento de &apos;Purchase&apos; / &apos;InitiateCheckout&apos; apenas na página de vendas real.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-mono text-xs font-bold">
                  <Lightbulb className="w-4 h-4 text-slate-900 dark:text-white" />
                  <span>REGRA 4: Criativo Limpo, Promessa no Vídeo</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Não queime a oferta no texto do anúncio</h4>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Evite palavras como &apos;Cura&apos;, &apos;Emagreça 10kg em 3 dias&apos;, &apos;Ganhe R$ 5.000 fácil&apos;. 
                  Use ângulos de curiosidade: &apos;Descubra o truque matinal que os especialistas recomendam&apos;. 
                  O texto atrai o clique; quem vende é a sua VSL ou página de vendas protegida.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ABA 5: SIMULADOR INTERATIVO DE REQUISIÇÕES                       */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "simulador" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/95 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-slate-900 dark:text-white" />
                <span>Simulador de Inspeção em Tempo Real</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed mt-2 max-w-3xl">
                Escolha um cenário abaixo para ver exatamente como as 6 camadas do Motor Phantom-X 
                avaliam os pacotes de rede e tomam a decisão em menos de 14 milissegundos.
              </p>
            </div>

            {/* Scenario Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setSimulatedScenario("bot_meta")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  simulatedScenario === "bot_meta"
                    ? "bg-slate-100 dark:bg-gradient-to-b dark:from-neutral-800 dark:to-neutral-900 border-slate-900 dark:border-white/30 text-slate-950 dark:text-white shadow-md ring-1 ring-slate-900/20 dark:ring-white/20"
                    : "bg-white dark:bg-neutral-900/50 border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Cenário 1: Bot da Meta</span>
                  <ShieldAlert className="w-4 h-4 text-slate-900 dark:text-white" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400">Crawler AWS/Datacenter sem token fbclid</div>
              </button>

              <button
                onClick={() => setSimulatedScenario("buyer_real")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  simulatedScenario === "buyer_real"
                    ? "bg-slate-100 dark:bg-gradient-to-b dark:from-neutral-800 dark:to-neutral-900 border-slate-900 dark:border-white/30 text-slate-950 dark:text-white shadow-md ring-1 ring-slate-900/20 dark:ring-white/20"
                    : "bg-white dark:bg-neutral-900/50 border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Cenário 2: Comprador Real</span>
                  <CheckCircle2 className="w-4 h-4 text-slate-900 dark:text-white" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400">iPhone 4G Claro Brasil com token fbclid</div>
              </button>

              <button
                onClick={() => setSimulatedScenario("human_vpn")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  simulatedScenario === "human_vpn"
                    ? "bg-slate-100 dark:bg-gradient-to-b dark:from-neutral-800 dark:to-neutral-900 border-slate-900 dark:border-white/30 text-slate-950 dark:text-white shadow-md ring-1 ring-slate-900/20 dark:ring-white/20"
                    : "bg-white dark:bg-neutral-900/50 border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Cenário 3: Moderador com VPN</span>
                  <AlertTriangle className="w-4 h-4 text-slate-900 dark:text-white" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-400">Desktop de Dublin / VPN M247 nos EUA</div>
              </button>
            </div>

            {/* Terminal Live Output */}
            {simulatedScenario && (
              <div className="rounded-2xl border border-slate-800 dark:border-white/15 bg-slate-950 dark:bg-black/95 p-5 font-mono text-xs space-y-4 shadow-2xl text-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-white/10 text-neutral-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                    <span className="text-[11px] ml-2 text-neutral-300">phantom-edge-telemetry.log</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">Executado em tempo real</span>
                </div>

                {simulatedScenario === "bot_meta" && (
                  <div className="space-y-2 text-[12px]">
                    <div className="text-neutral-400">[00:00.001] Incoming GET /?utm_source=meta</div>
                    <div className="text-neutral-400">[00:00.003] IP: 54.210.122.45 | Country: US | ASN: 16509 (Amazon AWS EC2)</div>
                    <div className="text-neutral-400">[00:00.005] User-Agent: facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)</div>
                    <div className="text-neutral-300 font-bold">[00:00.007] &bull; ALERTA: Camada 3 ativada (ASN Datacenter AS16509 bloqueado)</div>
                    <div className="text-neutral-300 font-bold">[00:00.008] &bull; ALERTA: Camada 4 ativada (Ausência de token fbclid obrigatório)</div>
                    <div className="text-neutral-200 font-semibold">[00:00.010] Decisão: MITIGATED_SAFE (Whitepage)</div>
                    <div className="text-white font-bold">[00:00.012] Reverse Proxy entregue: HTTP 200 OK (Content: Safe Page Institucional)</div>
                    <div className="text-neutral-400">[00:00.013] Status para o Robô da Meta: Aprovado sem restrições.</div>
                  </div>
                )}

                {simulatedScenario === "buyer_real" && (
                  <div className="space-y-2 text-[12px]">
                    <div className="text-neutral-400">[00:00.001] Incoming GET /?utm_source=meta&amp;fbclid=IwAR99023412a8b</div>
                    <div className="text-neutral-400">[00:00.003] IP: 187.54.212.10 | Country: BR | ASN: 28573 (Claro Brasil Móvel)</div>
                    <div className="text-neutral-400">[00:00.005] User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) Mobile/15E148</div>
                    <div className="text-neutral-300">[00:00.006] &bull; Camada 1 (Geo BR): Aprovado</div>
                    <div className="text-neutral-300">[00:00.007] &bull; Camada 2 (Mobile iOS): Aprovado</div>
                    <div className="text-neutral-300">[00:00.008] &bull; Camada 3 (ISP Residencial Claro): Aprovado</div>
                    <div className="text-neutral-300">[00:00.009] &bull; Camada 4 (fbclid verificado): Aprovado</div>
                    <div className="text-neutral-300">[00:00.010] &bull; Camada 6 (ProxyCheck Score: 0/100): Limpo</div>
                    <div className="text-white font-bold">[00:00.011] Decisão: ROUTED_OFFER (Oferta Black / VSL)</div>
                    <div className="text-white font-bold">[00:00.013] Reverse Proxy entregue: HTTP 200 OK com UTMs preservadas</div>
                  </div>
                )}

                {simulatedScenario === "human_vpn" && (
                  <div className="space-y-2 text-[12px]">
                    <div className="text-neutral-400">[00:00.001] Incoming GET /?fbclid=teste123</div>
                    <div className="text-neutral-400">[00:00.003] IP: 185.156.73.12 | Country: IE (Irlanda) | ASN: 9009 (M247 Ltd VPN)</div>
                    <div className="text-neutral-400">[00:00.005] User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124.0.0.0</div>
                    <div className="text-neutral-300 font-bold">[00:00.006] &bull; ALERTA: Camada 1 ativada (Origem Irlanda &apos;IE&apos; fora do Brasil)</div>
                    <div className="text-neutral-300 font-bold">[00:00.007] &bull; ALERTA: Camada 3 ativada (Rede de VPN comercial AS9009)</div>
                    <div className="text-neutral-200 font-semibold">[00:00.009] Decisão: MITIGATED_SAFE (Whitepage)</div>
                    <div className="text-white font-bold">[00:00.011] Reverse Proxy entregue: HTTP 200 OK (Moderador vê artigo inofensivo)</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ABA 6: DÚVIDAS FREQUENTES (FAQ)                                   */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "faq" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/95 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm mb-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-slate-900 dark:text-white" />
                <span>Perguntas Frequentes &amp; Respostas dos Especialistas</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-neutral-400 mt-1">
                Tire suas dúvidas técnicas sobre o funcionamento do cloaker e boas práticas de contingência.
              </p>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 overflow-hidden transition-all duration-200 shadow-sm"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 pr-4">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-neutral-200 font-semibold shrink-0 border border-slate-200 dark:border-white/10">
                          {faq.tag}
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{faq.q}</span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-500 dark:text-neutral-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-slate-900 dark:text-white" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-[13px] text-slate-700 dark:text-neutral-300 leading-relaxed border-t border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-black/30">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
