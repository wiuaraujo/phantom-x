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
  limits: {
    eventsPerMonth: string;
    domains: number;
    campaigns: number;
    retentionDays: number;
  };
  features: string[];
}

export const siteConfig = {
  name: "Phantom-X",
  title: "Phantom-X — Inteligência, Monitoramento e Roteamento de Tráfego Web",
  description:
    "Monitore acessos, entenda a origem das visitas e acompanhe a atividade das suas campanhas em uma única plataforma, com dados organizados em tempo real.",
  url: "https://phantomx.pro",
  ogImage: "https://phantomx.pro/og.png",
  company: {
    name: "Phantom-X Technologies Inc.",
    supportEmail: "suporte@phantomx.pro",
    salesEmail: "contato@phantomx.pro",
  },
  links: {
    github: "https://github.com/wiuaraujo/phantom-x",
    docs: "/docs",
    terms: "/terms",
    privacy: "/privacy",
    status: "https://status.phantomx.pro",
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
      description: "Para operações essenciais que exigem proteção e entrega transparente.",
      priceMonthly: 149,
      currency: "R$",
      limits: {
        eventsPerMonth: "100.000 eventos/mês",
        domains: 3,
        campaigns: 10,
        retentionDays: 14,
      },
      features: [
        "Motor de Borda Phantom-X com latência < 14ms",
        "Entrega via Proxy Reverso (HTTP 200 OK sem redirects)",
        "Filtro de ASN Datacenter (Meta, AWS, Google, Spy Tools)",
        "Validação de tokens de tráfego pago (fbclid e UTMs)",
        "Gerador de Cloudflare Worker com 1 clique",
        "Retenção de auditoria por 14 dias",
      ],
    },
    {
      id: "growth",
      name: "Growth",
      description: "Para operações em escala que exigem inteligência avançada e telemetria profunda.",
      priceMonthly: 389,
      currency: "R$",
      highlighted: true,
      limits: {
        eventsPerMonth: "1.000.000 eventos/mês",
        domains: 15,
        campaigns: 50,
        retentionDays: 60,
      },
      features: [
        "Tudo do plano Starter",
        "Motor completo com 6 camadas determinísticas de decisão",
        "Camada 7: Telemetria Client-Side de Hardware (GPU WebGL e Anti-Headless)",
        "Integração em tempo real com Threat Intelligence (ProxyCheck.io)",
        "Até 15 domínios ativos com modo de contingência Whitepage/Oferta",
        "Retenção de auditoria completa por 60 dias",
      ],
    },
    {
      id: "scale",
      name: "Scale",
      description: "Para equipes e operações de alto volume com blindagem customizada e suporte dedicado.",
      priceMonthly: 890,
      currency: "R$",
      limits: {
        eventsPerMonth: "10.000.000+ eventos/mês",
        domains: 50,
        campaigns: 250,
        retentionDays: 365,
      },
      features: [
        "Tudo do plano Growth",
        "Até 50 domínios com gerador de Worker multi-edge dedicado",
        "Fallback resiliente e isolamento estéril de cabeçalhos upstream",
        "API ilimitada para ingestão, webhooks e automação de campanhas",
        "Retenção de telemetria por 365 dias com exportação contínua",
        "SLA de 99.9% de uptime na borda e engenheiro dedicado",
      ],
    },
  ] as PricingPlan[],
};
