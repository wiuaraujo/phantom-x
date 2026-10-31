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

  // Estado do Auditor de Criativos & Políticas Pré-Voo
  const [creativeText, setCreativeText] = useState(
    "🔥 DESCUBRA O CHÁ SECRETO QUE VAI CURAR E ELIMINAR DE VEZ A GORDURA! Ganhe R$ 5.000 por semana trabalhando no celular sem esforço. Assista antes que saia do ar!!!"
  );
  const auditResult = useMemo(() => CreativeShieldEngine.auditCreative(creativeText), [creativeText]);

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
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-500/10 dark:bg-white/[0.06] border border-sky-500/20 dark:border-white/15 backdrop-blur-md text-[11px] font-mono text-sky-900 dark:text-white font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                  <span>PHANTOM-X ACADEMY &amp; MASTERY</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-gradient-to-r dark:from-violet-500/20 dark:to-sky-500/20 border border-sky-300 dark:border-sky-400/30 text-sky-900 dark:text-sky-300 font-mono font-medium">
                  Guia 2026 • Edge Engine V2.4
                </span>
              </div>

              {/* Título com Logo Oficial da Phantom */}
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-2xl bg-white dark:bg-neutral-900/90 border border-slate-200 dark:border-white/15 shadow-sm shrink-0">
                  <Logo size={36} className="shrink-0" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                    Área Phantom-X
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 font-medium mt-0.5">
                    Central de Treinamento, Engenharia de Borda e Segredos de Aprovação de Tráfego Pago
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 dark:text-neutral-300 leading-relaxed max-w-2xl">
                O Phantom-X foi desenhado para transformar operações de tráfego de alta escala. 
                Aqui você encontra tudo: desde o setup do primeiro domínio em 3 minutos até as técnicas 
                avançadas de isolamento de moderadores da Meta, Google Ads e TikTok Ads.
              </p>
            </div>

            {/* Quick Stats / Highlights */}
            <div className="grid grid-cols-2 gap-3 lg:w-80 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">Entrega de Borda</div>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">HTTP 200 OK</div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-500">Sem redirects 301/302</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">Latência Média</div>
                <div className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400 mt-0.5">&lt; 14ms</div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-500">Cloudflare Edge Cluster</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">Camadas Ativas</div>
                <div className="text-lg font-bold font-mono text-purple-600 dark:text-purple-400 mt-0.5">6 Filtros</div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-500">Hardware &amp; ASNs</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-white/[0.04] border border-slate-200/90 dark:border-white/10 shadow-sm backdrop-blur-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-semibold">Blindagem</div>
                <div className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400 mt-0.5">Meta / Google</div>
                <div className="text-[10px] text-slate-500 dark:text-neutral-500">Reviewers isolados</div>
              </div>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mt-6 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 dark:text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por tópico, dúvida, código, fbclid, Whitepage ou DNS..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-black/60 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-sky-500 dark:focus:border-white/30 focus:ring-1 focus:ring-sky-500/20 dark:focus:ring-white/20 transition shadow-sm backdrop-blur-md"
            />
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. ABAS DE NAVEGAÇÃO INTERATIVAS COM DEGRADÊ                      */}
        {/* ================================================================= */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {[
            { id: "passo-a-passo", label: "Guia Passo a Passo", icon: Play },
            { id: "engenharia", label: "Engenharia & Borda", icon: Cpu },
            { id: "criativos", label: "Auditor de Criativos", icon: Wand2 },
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
                    ? "tab-active keep-white !bg-slate-900 !text-white !border-slate-900 shadow-md dark:!bg-white/[0.12] dark:!border-white/30 dark:!text-white scale-[1.02]"
                    : "bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border-slate-200 dark:bg-neutral-900/40 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-neutral-800/60 dark:border-white/5 shadow-sm"
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#0f172a",
                        color: "#ffffff",
                        borderColor: isDark ? "rgba(255, 255, 255, 0.3)" : "#0f172a",
                      }
                    : undefined
                }
              >
                <Icon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{
                    color: isSelected ? "#ffffff" : isDark ? "#a1a1aa" : "#475569",
                    stroke: "currentColor",
                  }}
                />
                <span
                  style={{
                    color: isSelected ? "#ffffff" : undefined,
                  }}
                >
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
            <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-neutral-900/80 dark:via-neutral-900 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>Roteiro de Implementação em 4 Passos</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
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
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-gradient-to-br dark:from-sky-500/20 dark:to-blue-600/20 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center font-mono font-bold text-sky-600 dark:text-sky-400 text-sm shadow-sm">
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
                  <div>• Proxy Status: <span className="text-amber-600 dark:text-amber-400 font-semibold">Proxied (Nuvem Laranja)</span></div>
                  <div>• SSL: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Full ou Strict</span></div>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="relative p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition group shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-gradient-to-br dark:from-purple-500/20 dark:to-indigo-600/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center font-mono font-bold text-purple-600 dark:text-purple-400 text-sm shadow-sm">
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
                  <div className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Safe Page: https://seusite.com/artigo-informativo</div>
                  <div className="text-purple-600 dark:text-purple-400 font-medium">✓ Black Page: https://seusite.com/vsl-secreta</div>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="relative p-6 rounded-2xl bg-white dark:bg-gradient-to-b dark:from-neutral-900/90 dark:to-neutral-950 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition group shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-gradient-to-br dark:from-emerald-500/20 dark:to-teal-600/20 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm shadow-sm">
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
                  <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-gradient-to-br dark:from-sky-500/20 dark:to-blue-600/20 border border-sky-200 dark:border-sky-500/30 flex items-center justify-center font-mono font-bold text-sky-600 dark:text-sky-400 text-sm shadow-sm">
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
            <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-neutral-900/90 dark:via-[#10141d] dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-sky-600 dark:text-sky-400" />
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
                      <span className="text-xs font-mono text-sky-600 dark:text-sky-400 font-semibold">{item.badge}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 dark:bg-black/80 border border-slate-800 dark:border-white/10 font-mono text-[11px] text-emerald-400 shrink-0 md:max-w-xs overflow-x-auto shadow-inner">
                    <code>{item.tech}</code>
                  </div>
                </div>
              ))}
            </div>

            {/* Hardware Fingerprinting Deep Dive */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-white to-purple-50/50 dark:from-neutral-950 dark:via-purple-950/20 dark:to-neutral-900 border border-purple-200 dark:border-purple-500/20 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-purple-950 dark:text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Telemetria de Hardware Client-Side (Camada Extra anti-Selenium)</span>
              </h3>
              <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                Além do Worker na borda, o Phantom-X conta com o snippet <code className="text-purple-700 dark:text-purple-300 font-mono bg-purple-100 dark:bg-purple-950/40 px-1 py-0.5 rounded">telemetry.js</code>. 
                Ele renderiza uma malha oculta de Canvas 2D e WebGL no navegador do visitante. Se o moderador estiver usando um emulador 
                de nuvem com renderizador de software (<code className="text-amber-700 dark:text-amber-300 font-mono">Google SwiftShader</code> ou <code className="text-amber-700 dark:text-amber-300 font-mono">llvmpipe</code>) 
                ou o atributo <code className="text-amber-700 dark:text-amber-300 font-mono">navigator.webdriver = true</code>, a página redireciona na hora para a Whitepage.
              </p>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ABA: AUDITOR DE CRIATIVOS & ENGENHARIA DE APROVAÇÃO               */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "criativos" && (
          <div className="space-y-6">
            {/* Header com Degradê Noturno / Borda Ciano */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-950 via-[#0c1a30] to-neutral-900 border border-sky-500/30 shadow-[0_4px_30px_rgba(14,165,233,0.12)] dark-surface keep-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-[10px] font-mono text-sky-300 uppercase tracking-wider font-semibold">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    <span>Ad-Tech Pre-Flight Engine</span>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2" style={{ color: "#ffffff" }}>
                    <span>Auditor de Criativos &amp; Camuflagem Semântica</span>
                  </h2>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-sky-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Meta / Google / TikTok Standards</span>
                </div>
              </div>
              <p className="text-xs leading-relaxed mt-2.5 max-w-3xl" style={{ color: "rgba(224, 242, 254, 0.95)" }}>
                A IA de moderação da Meta e do Google analisa a sua imagem, vídeo e copy com <strong>Visão Computacional e NLP</strong> antes 
                mesmo de qualquer robô abrir sua página. Use este motor para escanear gatilhos de reprovação, higienizar sua mensagem em 1 clique 
                e gerar coerência semântica absoluta com a sua Whitepage, eliminando o banimento por <em>Burla de Sistemas</em>.
              </p>
            </div>

            {/* Painel Interativo de Auditoria */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Coluna Esquerda: Editor de Copy & Presets (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      <span>Copy, Headline ou Roteiro do Criativo</span>
                    </label>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-neutral-500">
                      {creativeText.length} caracteres
                    </span>
                  </div>

                  {/* Seletor de Cenários / Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-semibold">Testar com exemplos rápidos de nicho:</span>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() =>
                          setCreativeText(
                            "🔥 DESCUBRA O CHÁ SECRETO QUE VAI CURAR E ELIMINAR DE VEZ A GORDURA! Perca 10kg em 7 dias dormindo. O que a indústria esconde de você! Assista antes que saia do ar!!!"
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800/40 text-[10px] font-mono text-rose-700 dark:text-rose-300 transition"
                      >
                        🔴 Saúde / Black (Crítico)
                      </button>
                      <button
                        onClick={() =>
                          setCreativeText(
                            "Ganhe R$ 5.000 por semana trabalhando no celular sem esforço! Robô do Pix com lucro garantido 100%! Fique rico sem sair de casa trabalhando 20 minutos por dia."
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/40 text-[10px] font-mono text-amber-700 dark:text-amber-300 transition"
                      >
                        🟠 Finanças / Renda Fácil (Alto Risco)
                      </button>
                      <button
                        onClick={() =>
                          setCreativeText(
                            "Você está com vergonha do seu corpo e cansado de ser pobre? Cansado de estar endividado? Assista esse vídeo chocante que os especialistas estão tentando apagar!"
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/30 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800/40 text-[10px] font-mono text-purple-700 dark:text-purple-300 transition"
                      >
                        🟣 Atributos Pessoais &amp; Choque
                      </button>
                      <button
                        onClick={() =>
                          setCreativeText(
                            "Conheça o protocolo nutricional moderno que está chamando a atenção de especialistas em hábitos saudáveis e qualidade de vida. Acesse o guia exclusivo."
                          )
                        }
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/40 text-[10px] font-mono text-emerald-700 dark:text-emerald-300 transition"
                      >
                        🟢 Ângulo Aprovável (White-Hat)
                      </button>
                    </div>
                  </div>

                  {/* Textarea */}
                  <textarea
                    rows={6}
                    value={creativeText}
                    onChange={(e) => setCreativeText(e.target.value)}
                    placeholder="Cole aqui a copy, texto principal, título ou texto gravado no seu vídeo..."
                    className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:border-sky-500 dark:focus:border-white/30 font-sans leading-relaxed transition shadow-inner"
                  />

                  {/* Botão de Higienização Automática */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <button
                      onClick={() => setCreativeText(auditResult.sanitizedCopy)}
                      disabled={auditResult.approvalScore >= 95}
                      className={`inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition shadow-sm ${
                        auditResult.approvalScore >= 95
                          ? "bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-neutral-500 cursor-not-allowed"
                          : "bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-slate-950 shadow-sky-500/20 cursor-pointer"
                      }`}
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Higienizar Copy em 1 Clique (Aplicar Ângulo Seguro)</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(creativeText, "creative_text")}
                      className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-neutral-800 text-xs text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-700 transition"
                    >
                      {copiedKey === "creative_text" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copiar Texto</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Sincronização Semântica com a Whitepage */}
                <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Sincronização Semântica com a Whitepage (Anti-Evasão)</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-neutral-400 leading-relaxed">
                    A Meta cruza os dados do criativo com a página segura. Configure a sua Whitepage com as tags abaixo para 
                    atingir 100% de coerência e evitar qualquer suspeita de camuflagem:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono pt-1">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase">Título da Whitepage</span>
                      <div className="text-slate-800 dark:text-neutral-200 font-semibold truncate">{auditResult.coherenceWhitepage.suggestedPageTitle}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1">
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase">Schema JSON-LD</span>
                      <div className="text-purple-600 dark:text-purple-400 font-semibold">{auditResult.coherenceWhitepage.schemaType}</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 space-y-1 font-mono text-[11px]">
                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase">Aviso Legal Obrigatório no Rodapé</span>
                    <div className="text-slate-700 dark:text-neutral-300 leading-relaxed">{auditResult.coherenceWhitepage.requiredLegalNotice}</div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Score de Aprovação & Gatilhos Detectados (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Cartão de Pontuação de Aprovação */}
                <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/80 border border-slate-200 dark:border-white/10 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-neutral-400 font-bold">
                      Índice de Aprovação Pré-Voo
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full font-bold ${
                        auditResult.approvalScore >= 90
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30"
                          : auditResult.approvalScore >= 70
                          ? "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30"
                          : auditResult.approvalScore >= 45
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30"
                      }`}
                    >
                      {auditResult.statusLabel}
                    </span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-baseline font-mono">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                        {auditResult.approvalScore}%
                      </span>
                      <span className="text-xs text-slate-500 dark:text-neutral-400">
                        {auditResult.triggers.length} {auditResult.triggers.length === 1 ? "gatilho" : "gatilhos"} de risco
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                      <div
                        style={{ width: `${auditResult.approvalScore}%` }}
                        className={`h-full transition-all duration-500 rounded-full ${
                          auditResult.approvalScore >= 90
                            ? "bg-emerald-500"
                            : auditResult.approvalScore >= 70
                            ? "bg-sky-500"
                            : auditResult.approvalScore >= 45
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Recomendações Críticas */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-neutral-400 font-semibold">Diretrizes de Liberação:</span>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-neutral-300">
                      {auditResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                          <span className="leading-snug">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Lista de Gatilhos Detectados */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300">
                    Gatilhos de Violação no Texto ({auditResult.triggers.length})
                  </h3>

                  {auditResult.triggers.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Nenhum gatilho de risco detectado. O criativo está livre de termos sensíveis conhecidos.</span>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                      {auditResult.triggers.map((t) => (
                        <div
                          key={t.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-neutral-900/60 border border-rose-200 dark:border-rose-900/30 space-y-1.5 shadow-sm"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-1">
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>"{t.matchedWord}"</span>
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                              -{t.penalty}%
                            </span>
                          </div>

                          <div className="text-[11px] font-medium text-slate-500 dark:text-neutral-400">
                            {t.categoryLabel}
                          </div>

                          <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                            {t.explanation}
                          </p>

                          <div className="pt-1.5 border-t border-slate-100 dark:border-white/5 flex items-start space-x-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                            <span className="font-semibold shrink-0 font-mono">Ângulo Seguro:</span>
                            <span className="italic">"{t.suggestedReplacement}"</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Os 5 Pilares de Engenharia de Aprovação (Cards Educativos) */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 dark:text-white font-mono">
                  Os 5 Pilares de Engenharia para 99% de Aprovação em Tráfego Pago
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-sky-600 dark:text-sky-400 font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span>01</span>
                    <span>Camuflagem Semântica</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Troca de Promessa por Curiosidade</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    A IA da Meta lê o criativo antes do clique. Se o criativo promete enriquecimento ou cura, a conta cai. 
                    Promova o "método", o "estudo recente" ou o "novo hábito" sem usar termos pretensiosos.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-purple-600 dark:text-purple-400 font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span>02</span>
                    <span>Coerência Anúncio-Whitepage</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Fim do Mismatch de Tópico</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Se o anúncio fala de sono e a Whitepage fala de criptomoedas, o algoritmo aplica o banimento de <em>Circumventing Systems</em>. 
                    Mantenha a Whitepage como um portal de notícias no mesmo nicho do criativo.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span>03</span>
                    <span>Entrega Edge SSR HTTP 200</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Zero Redirecionamentos JS</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Scripts com <code className="text-emerald-700 dark:text-emerald-400 font-mono">window.location</code> são farejados instantaneamente por headless browsers. 
                    O Phantom-X cospe o HTML diretamente da borda sem nunca mudar a URL do navegador.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-amber-600 dark:text-amber-400 font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span>04</span>
                    <span>Geolocalização &amp; Fuso Horário</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Sincronia Regional de Borda</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    O tráfego brasileiro deve bater nos PoPs de São Paulo (GRU) e responder no fuso de Brasília. O Phantom-X mapeia 
                    ISPs locais reais (Claro, Vivo, TIM) para que os pacotes de rede tenham latência humana natural.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-sky-600 dark:text-sky-400 font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span>05</span>
                    <span>Aquecimento de Conta &amp; CAPI</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Esteira Gradual de Orçamento</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Comece novas contas com orçamentos leves (R$ 50/dia) rodando diretamente na Whitepage por 48 horas. Após a Meta aprovar 
                    e consolidar o Trust Score, abra o tráfego do Phantom-X para escala.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-neutral-900/50 border border-slate-200 dark:border-white/10 space-y-2 shadow-sm">
                  <div className="text-rose-600 dark:text-rose-400 font-mono font-bold text-xs flex items-center space-x-1.5">
                    <span>06</span>
                    <span>Rodapé Legal Obrigatório</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Termos, Privacidade &amp; Contato</h4>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-300 leading-relaxed">
                    Toda página aprovada precisa ter CNPJ/E-mail, Política de Privacidade e Termos de Uso no rodapé. Sem isso, os crawlers 
                    classificam o destino como "Página de Destino de Baixa Qualidade".
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ABA 3: DICAS PARA OFERTAS AGRESSIVAS (BLACK / GRAY HAT)          */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "blackhat" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-950 via-[#0c1a30] to-neutral-900 border border-sky-500/30 shadow-[0_4px_30px_rgba(14,165,233,0.12)] dark-surface keep-white">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2" style={{ color: "#ffffff" }}>
                <span>Guia Tático: Como Manter Campanhas Agressivas Vivas</span>
              </h2>
              <p className="text-xs leading-relaxed mt-2 max-w-3xl" style={{ color: "rgba(224, 242, 254, 0.95)" }}>
                O cloaker é 50% da equação. Os outros 50% dependem da sua disciplina operacional. 
                Siga estas regras para evitar que a IA da Meta suspenda suas contas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 font-mono text-xs font-bold">
                  <Lightbulb className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>REGRA 1: O Efeito Camaleão da Whitepage</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Clone a Paleta de Cores da Oferta</h4>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  A IA da Meta analisa semelhança visual entre o criativo do anúncio e a página de destino. 
                  Se seu anúncio é azul e fala sobre sono, sua Whitepage deve ser azul e ter um artigo sobre 'Higiene do Sono'. 
                  Nunca coloque um artigo de receitas de bolo se o seu criativo fala de saúde ou finanças.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2 text-sky-600 dark:text-sky-400 font-mono text-xs font-bold">
                  <Lightbulb className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  <span>REGRA 2: Estratégia de Aquecimento (Warm-up)</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Primeiras 24h em 'SÓ_WHITEPAGE'</h4>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Ao subir uma campanha nova, deixe o modo do cloaker configurado em <strong className="text-slate-900 dark:text-white">SÓ_WHITEPAGE</strong> durante a análise. 
                  Assim que o anúncio estiver com status 'Ativo' e rodar algumas impressões, mude no Phantom-X para <strong className="text-emerald-600 dark:text-emerald-400">AUTOMÁTICO</strong>. 
                  Isso garante 100% de aprovação na primeira rodada.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                  <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>REGRA 3: Contingência de Pixel</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instale o Pixel na Whitepage e na Oferta</h4>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Dispare o evento de 'PageView' tanto na Whitepage quanto na Oferta. 
                  Para a Meta, sua página parecerá saudável e recebendo tráfego normalmente. 
                  Dispare o evento de 'Purchase' / 'InitiateCheckout' apenas na página de vendas real.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900/60 border border-slate-200 dark:border-white/10 space-y-2.5 shadow-sm">
                <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 font-mono text-xs font-bold">
                  <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>REGRA 4: Criativo Limpo, Promessa no Vídeo</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Não queime a oferta no texto do anúncio</h4>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  Evite palavras como 'Cura', 'Emagreça 10kg em 3 dias', 'Ganhe R$ 5.000 fácil'. 
                  Use ângulos de curiosidade: 'Descubra o truque matinal que os especialistas recomendam'. 
                  O texto atrai o clique; quem vende é a sua VSL ou página de vendas protegida.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ABA 4: SIMULADOR INTERATIVO DE REQUISIÇÕES                       */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "simulador" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-neutral-900/90 dark:via-[#0e1724] dark:to-neutral-950 border border-slate-200 dark:border-sky-500/20 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <span>Simulador de Inspeção em Tempo Real</span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed mt-2 max-w-3xl">
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
                    ? "bg-red-500/10 border-red-500/40 text-slate-900 dark:text-white shadow-md ring-1 ring-red-500/30"
                    : "bg-white dark:bg-neutral-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">Cenário 1: Bot da Meta</span>
                  <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-300">Crawler AWS/Datacenter sem token fbclid</div>
              </button>

              <button
                onClick={() => setSimulatedScenario("buyer_real")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  simulatedScenario === "buyer_real"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-slate-900 dark:text-white shadow-md ring-1 ring-emerald-500/30"
                    : "bg-white dark:bg-neutral-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Cenário 2: Comprador Real</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-300">iPhone 4G Claro Brasil com token fbclid</div>
              </button>

              <button
                onClick={() => setSimulatedScenario("human_vpn")}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  simulatedScenario === "human_vpn"
                    ? "bg-purple-500/10 border-purple-500/40 text-slate-900 dark:text-white shadow-md ring-1 ring-purple-500/30"
                    : "bg-white dark:bg-neutral-900/60 border-slate-200 dark:border-white/10 text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Cenário 3: Moderador com VPN</span>
                  <AlertTriangle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-neutral-300">Desktop de Dublin / VPN M247 nos EUA</div>
              </button>
            </div>

            {/* Terminal Live Output */}
            {simulatedScenario && (
              <div className="rounded-2xl border border-slate-800 dark:border-white/15 bg-slate-950 dark:bg-black/95 p-5 font-mono text-xs space-y-4 shadow-2xl text-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 dark:border-white/10 text-neutral-400">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] ml-2 text-neutral-300">phantom-edge-telemetry.log</span>
                  </div>
                  <span className="text-[10px] text-neutral-500">Executado em tempo real</span>
                </div>

                {simulatedScenario === "bot_meta" && (
                  <div className="space-y-2 text-[12px]">
                    <div className="text-neutral-400">[00:00.001] Incoming GET /?utm_source=meta</div>
                    <div className="text-neutral-400">[00:00.003] IP: 54.210.122.45 | Country: US | ASN: 16509 (Amazon AWS EC2)</div>
                    <div className="text-neutral-400">[00:00.005] User-Agent: facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)</div>
                    <div className="text-red-400 font-bold">[00:00.007] 🚨 ALERTA: Camada 3 ativada (ASN Datacenter AS16509 bloqueado)</div>
                    <div className="text-red-400 font-bold">[00:00.008] 🚨 ALERTA: Camada 4 ativada (Ausência de token fbclid obrigatório)</div>
                    <div className="text-amber-400 font-semibold">[00:00.010] Decisão: MITIGATED_SAFE (Whitepage)</div>
                    <div className="text-emerald-400 font-bold">[00:00.012] Reverse Proxy entregue: HTTP 200 OK (Content: Safe Page Institucional)</div>
                    <div className="text-neutral-400">[00:00.013] Status para o Robô da Meta: Aprovado sem restrições.</div>
                  </div>
                )}

                {simulatedScenario === "buyer_real" && (
                  <div className="space-y-2 text-[12px]">
                    <div className="text-neutral-400">[00:00.001] Incoming GET /?utm_source=meta&amp;fbclid=IwAR99023412a8b</div>
                    <div className="text-neutral-400">[00:00.003] IP: 187.54.212.10 | Country: BR | ASN: 28573 (Claro Brasil Móvel)</div>
                    <div className="text-neutral-400">[00:00.005] User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) Mobile/15E148</div>
                    <div className="text-emerald-400">[00:00.006] ✓ Camada 1 (Geo BR): Aprovado</div>
                    <div className="text-emerald-400">[00:00.007] ✓ Camada 2 (Mobile iOS): Aprovado</div>
                    <div className="text-emerald-400">[00:00.008] ✓ Camada 3 (ISP Residencial Claro): Aprovado</div>
                    <div className="text-emerald-400">[00:00.009] ✓ Camada 4 (fbclid verificado): Aprovado</div>
                    <div className="text-emerald-400">[00:00.010] ✓ Camada 6 (ProxyCheck Score: 0/100): Limpo</div>
                    <div className="text-sky-400 font-bold">[00:00.011] Decisão: ROUTED_OFFER (Oferta Black / VSL)</div>
                    <div className="text-emerald-400 font-bold">[00:00.013] Reverse Proxy entregue: HTTP 200 OK com UTMs preservadas</div>
                  </div>
                )}

                {simulatedScenario === "human_vpn" && (
                  <div className="space-y-2 text-[12px]">
                    <div className="text-neutral-400">[00:00.001] Incoming GET /?fbclid=teste123</div>
                    <div className="text-neutral-400">[00:00.003] IP: 185.156.73.12 | Country: IE (Irlanda) | ASN: 9009 (M247 Ltd VPN)</div>
                    <div className="text-neutral-400">[00:00.005] User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/124.0.0.0</div>
                    <div className="text-red-400 font-bold">[00:00.006] 🚨 ALERTA: Camada 1 ativada (Origem Irlanda 'IE' fora do Brasil)</div>
                    <div className="text-red-400 font-bold">[00:00.007] 🚨 ALERTA: Camada 3 ativada (Rede de VPN comercial AS9009)</div>
                    <div className="text-amber-400 font-semibold">[00:00.009] Decisão: MITIGATED_SAFE (Whitepage)</div>
                    <div className="text-emerald-400 font-bold">[00:00.011] Reverse Proxy entregue: HTTP 200 OK (Moderador vê artigo inofensivo)</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* ABA 5: DÚVIDAS FREQUENTES (FAQ)                                   */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === "faq" && (
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-neutral-900/80 dark:via-neutral-900 dark:to-neutral-950 border border-slate-200 dark:border-white/10 shadow-sm mb-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-sky-600 dark:text-sky-400" />
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
                    className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-neutral-900/40 overflow-hidden transition-all duration-200 shadow-sm"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 pr-4">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-neutral-300 font-semibold shrink-0">
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
