export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  currency: string;
  highlighted?: boolean;
  region: string;
  flags: string;
  flagIcons: string[];
  flagExtra: string;
  limits: {
    eventsPerMonth: string;
    domains: number;
    campaigns: number;
    pages: number;
    storageMb: number;
    retentionDays: number;
  };
  features: string[];
  trafficSources: string[];
}

export const siteConfig = {
  name: "Phantom-X",
  title: "Phantom-X — Inteligência, Monitoramento e Roteamento de Tráfego Web",
  description:
    "Monitore acessos, entenda a origem das visitas e acompanhe a atividade das suas campanhas em uma única plataforma, com dados organizados em tempo real.",
  url: "https://phantom-x.pro",
  ogImage: "https://phantom-x.pro/og.png",
  company: {
    name: "Phantom-X Technologies Inc.",
    supportEmail: "suporte@phantom-x.pro",
    salesEmail: "contato@phantom-x.pro",
  },
  links: {
    github: "https://github.com/wiuaraujo/phantom-x",
    docs: "/docs",
    terms: "/terms",
    privacy: "/privacy",
    status: "https://status.phantom-x.pro",
  },
  nav: [
    { label: "Funcionalidades", href: "#features" },
    { label: "Como Funciona", href: "#how-it-works" },
    { label: "Demonstração", href: "#demo" },
    { label: "Preços", href: "#pricing" },
  ],
  pricing: [
    {
      id: "starter",
      name: "Starter",
      description: "Para operações essenciais de tráfego pago com segurança de borda e alta velocidade.",
      priceMonthly: 149,
      currency: "R$",
      region: "Brasil (1)",
      flags: "🇧🇷",
      flagIcons: ["🇧🇷"],
      flagExtra: "",
      limits: {
        eventsPerMonth: "10.000 cliques/mês",
        domains: 3,
        campaigns: 3,
        pages: 6,
        storageMb: 300,
        retentionDays: 30,
      },
      features: [
        "10.000 cliques analisados por mês",
        "Região: Brasil (1)",
        "MCP para Cloud Pages",
        "3 Domínios customizados com SSL automático",
        "3 Camuflagens com entrega via Proxy Reverso (HTTP 200)",
        "Filtro de ASN Datacenter (Meta Ads e Google)",
        "Validação de tokens de clique (fbclid e UTMs)",
        "Filtro de dispositivo (Mobile / Desktop)",
        "Teste A/B de páginas e ofertas em tempo real",
        "Armazenamento de 300 MB para assets",
      ],
      trafficSources: ["Facebook", "TikTok", "Kwai", "Google", "Taboola"],
    },
    {
      id: "growth",
      name: "Growth",
      description: "O plano mais popular para operações que escalam tráfego na América Latina.",
      priceMonthly: 389,
      currency: "R$",
      highlighted: true,
      region: "Latam (20)",
      flags: "🇧🇷 🇲🇽 🇦🇷 +17",
      flagIcons: ["🇧🇷", "🇲🇽", "🇦🇷"],
      flagExtra: "+17",
      limits: {
        eventsPerMonth: "100.000 cliques/mês",
        domains: 12,
        campaigns: 12,
        pages: 24,
        storageMb: 2000,
        retentionDays: 90,
      },
      features: [
        "100.000 cliques analisados por mês",
        "Região: Latam (20)",
        "MCP para Cloud Pages",
        "12 Domínios customizados com terminação TLS",
        "12 Camuflagens ativas simultâneas",
        "Roteamento Heurístico por ASN (Meta, Google, TikTok Reviewers)",
        "Telemetria de Hardware Client-Side (GPU WebGL e Anti-Headless)",
        "Bloqueio de ferramentas de espionagem (AdHeart, Dropispy)",
        "Teste A/B Multivariável em tempo real",
        "Gerador de Cloudflare Worker dedicado com 1 clique",
        "Armazenamento de 2 GB para assets",
        "Suporte Técnico via Central de Ajuda e E-mail",
      ],
      trafficSources: ["Facebook", "TikTok", "Kwai", "Google", "Taboola", "Outbrain", "Bing"],
    },
    {
      id: "scale",
      name: "Scale",
      description: "Infraestrutura planetária sem gargalos para quem roda tráfego global massivo.",
      priceMonthly: 529,
      currency: "R$",
      region: "Todos (247)",
      flags: "🇺🇸 🇪🇺 🇧🇷 +244",
      flagIcons: ["🇺🇸", "🇪🇺", "🇧🇷"],
      flagExtra: "+244",
      limits: {
        eventsPerMonth: "Cliques Ilimitados",
        domains: 60,
        campaigns: 60,
        pages: 250,
        storageMb: 10000,
        retentionDays: 365,
      },
      features: [
        "Cliques e eventos 100% ilimitados",
        "Região: Todos (247)",
        "MCP para Cloud Pages",
        "60 Domínios customizados de alta velocidade",
        "60 Camuflagens ativas com Kill-Switch de Emergência",
        "Rede Global com 28 PoPs Edge (< 14ms de latência)",
        "Fingerprint Militar & Anti-AdLibrary avançado",
        "Bypass Total de Auditorias de Anúncios Globais",
        "API de telemetria para automação e webhooks",
        "Armazenamento de 10 GB para assets",
        "Infraestrutura de Prioridade Máxima na Borda Edge",
      ],
      trafficSources: ["Facebook", "TikTok", "Kwai", "Google", "Taboola", "Outbrain", "Bing", "X (Twitter)"],
    },
  ] as PricingPlan[],
};
