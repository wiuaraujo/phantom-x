import { PlanId } from "@/types";

export type { PlanId };

export interface PlanLimits {
  maxDomains: number;
  maxCampaigns: number; // Camuflagens ativas
  maxPages: number;
  maxEventsMonthly: number; // -1 significa ilimitado
  storageMb: number;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  highlight?: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  priceMonthly: number;
  priceFormatted: string;
  period: string;
  region: string;
  countriesCount: number;
  flags: string;
  flagIcons?: string[];
  flagExtra?: string;
  limits: PlanLimits;
  features: PlanFeature[];
  trafficSources: string[];
}

export const PHANTOM_PLANS: Record<PlanId, PlanDefinition> = {
  free: {
    id: "free",
    name: "Plano Trial",
    tagline: "Ambiente inicial trial para testes rápidos (Máximo 100 eventos)",
    badge: "PLANO TRIAL (100 EVENTOS)",
    priceMonthly: 0,
    priceFormatted: "R$ 0",
    period: "/mês",
    region: "Brasil (1)",
    countriesCount: 1,
    flags: "🇧🇷",
    flagIcons: ["🇧🇷"],
    flagExtra: "",
    limits: {
      maxDomains: 1,
      maxCampaigns: 1,
      maxPages: 2,
      maxEventsMonthly: 100, // Exatamente 100 eventos conforme solicitado
      storageMb: 50,
    },
    features: [
      { name: "Região: Brasil (1)", included: true },
      { name: "Domínios: 1", included: true },
      { name: "Camuflagens: 1", included: true },
      { name: "Páginas: 2", included: true },
      { name: "Cliques / Eventos: 100 no total", included: true, highlight: true },
      { name: "Cloudflare Edge Worker Básico", included: true },
      { name: "Fingerprint Básico", included: false },
      { name: "Teste A/B", included: false },
      { name: "Recursos adicionais de inteligência", included: false },
    ],
    trafficSources: ["Facebook", "Google"],
  },

  starter: {
    id: "starter",
    name: "Starter",
    tagline: "Para operações essenciais de tráfego pago com segurança de borda e alta velocidade",
    badge: "MELHOR ENTRADA",
    priceMonthly: 149,
    priceFormatted: "R$ 149",
    period: "/mês",
    region: "Brasil (1)",
    countriesCount: 1,
    flags: "🇧🇷",
    flagIcons: ["🇧🇷"],
    flagExtra: "",
    limits: {
      maxDomains: 3,
      maxCampaigns: 3,
      maxPages: 6,
      maxEventsMonthly: 10000, // 10.000 cliques conforme solicitado
      storageMb: 300,
    },
    features: [
      { name: "10.000 cliques analisados por mês", included: true, highlight: true },
      { name: "Região: Brasil (1)", included: true },
      { name: "MCP para Cloud Pages", included: true },
      { name: "3 Domínios customizados com SSL automático", included: true },
      { name: "3 Camuflagens ativas via Proxy Reverso (HTTP 200)", included: true },
      { name: "Filtro de ASN Datacenter (Meta Ads e Google)", included: true },
      { name: "Validação de tokens de clique (fbclid e UTMs)", included: true },
      { name: "Filtro de dispositivo (Mobile / Desktop)", included: true },
      { name: "Teste A/B de páginas e ofertas", included: true },
      { name: "Armazenamento: 300 MB para assets", included: true },
    ],
    trafficSources: ["Facebook", "TikTok", "Kwai", "Google", "Taboola"],
  },

  growth: {
    id: "growth",
    name: "Growth",
    tagline: "O plano mais popular para operações que escalam tráfego na América Latina",
    badge: "MAIS POPULAR",
    isPopular: true,
    priceMonthly: 389,
    priceFormatted: "R$ 389",
    period: "/mês",
    region: "Latam (20)",
    countriesCount: 20,
    flags: "🇧🇷 🇲🇽 🇦🇷 +17",
    flagIcons: ["🇧🇷", "🇲🇽", "🇦🇷"],
    flagExtra: "+17",
    limits: {
      maxDomains: 12,
      maxCampaigns: 12,
      maxPages: 24,
      maxEventsMonthly: 100000, // 100.000 cliques conforme solicitado
      storageMb: 2000,
    },
    features: [
      { name: "100.000 cliques analisados por mês", included: true, highlight: true },
      { name: "Região: Latam (20)", included: true },
      { name: "MCP para Cloud Pages", included: true },
      { name: "12 Domínios customizados com terminação TLS", included: true },
      { name: "12 Camuflagens ativas simultâneas", included: true },
      { name: "Roteamento Heurístico por ASN (Meta, Google, TikTok Reviewers)", included: true, highlight: true },
      { name: "Telemetria de Hardware Client-Side (GPU WebGL e Anti-Headless)", included: true },
      { name: "Bloqueio de ferramentas de espionagem (AdHeart, Dropispy)", included: true },
      { name: "Teste A/B Multivariável em tempo real", included: true },
      { name: "Gerador de Cloudflare Worker com 1 clique", included: true },
      { name: "Armazenamento: 2 GB para assets", included: true },
      { name: "Suporte Técnico por E-mail", included: true },
    ],
    trafficSources: ["Facebook", "TikTok", "Kwai", "Google", "Taboola", "Outbrain", "Bing"],
  },

  scale: {
    id: "scale",
    name: "Scale",
    tagline: "Infraestrutura planetária sem gargalos para quem roda tráfego global massivo",
    badge: "SEM LIMITES",
    priceMonthly: 529,
    priceFormatted: "R$ 529",
    period: "/mês",
    region: "Todos (247)",
    countriesCount: 247,
    flags: "🇺🇸 🇪🇺 🇧🇷 +244",
    flagIcons: ["🇺🇸", "🇪🇺", "🇧🇷"],
    flagExtra: "+244",
    limits: {
      maxDomains: 60,
      maxCampaigns: 60,
      maxPages: 250,
      maxEventsMonthly: -1, // Cliques ilimitados apenas no plano scale
      storageMb: 10000,
    },
    features: [
      { name: "Cliques e eventos 100% ilimitados", included: true, highlight: true },
      { name: "Região: Todos (247)", included: true },
      { name: "MCP para Cloud Pages", included: true },
      { name: "60 Domínios customizados de alta velocidade", included: true },
      { name: "60 Camuflagens com Kill-Switch de Emergência", included: true, highlight: true },
      { name: "Rede Global com 28 PoPs Edge (< 14ms de latência)", included: true },
      { name: "Fingerprint Militar & Anti-AdLibrary avançado", included: true },
      { name: "Bypass Total de Auditorias de Anúncios Globais", included: true },
      { name: "API de telemetria para automação e webhooks", included: true },
      { name: "Armazenamento: 10 GB para assets", included: true },
      { name: "Infraestrutura de Prioridade Máxima na Borda Edge", included: true, highlight: true },
    ],
    trafficSources: ["Facebook", "TikTok", "Kwai", "Google", "Taboola", "Outbrain", "Bing", "X (Twitter)"],
  },

  // Aliases retrocompatíveis
  pro: {
    id: "pro",
    name: "Growth",
    tagline: "O plano mais popular para operações que escalam tráfego na América Latina",
    badge: "MAIS POPULAR",
    isPopular: true,
    priceMonthly: 389,
    priceFormatted: "R$ 389",
    period: "/mês",
    region: "Latam (20)",
    countriesCount: 20,
    flags: "🇧🇷 🇲🇽 🇦🇷 +17",
    flagIcons: ["🇧🇷", "🇲🇽", "🇦🇷"],
    flagExtra: "+17",
    limits: {
      maxDomains: 12,
      maxCampaigns: 12,
      maxPages: 24,
      maxEventsMonthly: 100000,
      storageMb: 2000,
    },
    features: [
      { name: "100.000 cliques analisados por mês", included: true, highlight: true },
      { name: "Região: Latam (20)", included: true },
      { name: "MCP para Cloud Pages", included: true },
      { name: "12 Domínios customizados com terminação TLS", included: true },
      { name: "12 Camuflagens ativas simultâneas", included: true },
      { name: "Roteamento Heurístico por ASN (Meta, Google, TikTok Reviewers)", included: true, highlight: true },
      { name: "Telemetria de Hardware Client-Side (GPU WebGL e Anti-Headless)", included: true },
      { name: "Bloqueio de ferramentas de espionagem (AdHeart, Dropispy)", included: true },
      { name: "Teste A/B Multivariável em tempo real", included: true },
      { name: "Gerador de Cloudflare Worker com 1 clique", included: true },
      { name: "Armazenamento: 2 GB para assets", included: true },
      { name: "Suporte Técnico por E-mail", included: true },
    ],
    trafficSources: ["Facebook", "TikTok", "Kwai", "Google", "Taboola", "Outbrain", "Bing"],
  },

  global: {
    id: "global",
    name: "Scale",
    tagline: "Infraestrutura planetária sem gargalos para quem roda tráfego global massivo",
    badge: "SEM LIMITES",
    priceMonthly: 529,
    priceFormatted: "R$ 529",
    period: "/mês",
    region: "Todos (247)",
    countriesCount: 247,
    flags: "🇺🇸 🇪🇺 🇧🇷 +244",
    flagIcons: ["🇺🇸", "🇪🇺", "🇧🇷"],
    flagExtra: "+244",
    limits: {
      maxDomains: 60,
      maxCampaigns: 60,
      maxPages: 250,
      maxEventsMonthly: -1,
      storageMb: 10000,
    },
    features: [
      { name: "Cliques e eventos 100% ilimitados", included: true, highlight: true },
      { name: "Região: Todos (247)", included: true },
      { name: "MCP para Cloud Pages", included: true },
      { name: "60 Domínios customizados de alta velocidade", included: true },
      { name: "60 Camuflagens com Kill-Switch de Emergência", included: true, highlight: true },
      { name: "Rede Global com 28 PoPs Edge (< 14ms de latência)", included: true },
      { name: "Fingerprint Militar & Anti-AdLibrary avançado", included: true },
      { name: "Bypass Total de Auditorias de Anúncios Globais", included: true },
      { name: "API de telemetria para automação e webhooks", included: true },
      { name: "Armazenamento: 10 GB para assets", included: true },
      { name: "Infraestrutura de Prioridade Máxima na Borda Edge", included: true, highlight: true },
    ],
    trafficSources: ["Facebook", "TikTok", "Kwai", "Google", "Taboola", "Outbrain", "Bing", "X (Twitter)"],
  },
};

export function getPlanDefinition(planId?: string): PlanDefinition {
  if (planId === "pro") return PHANTOM_PLANS.growth;
  if (planId === "global") return PHANTOM_PLANS.scale;
  if (planId && planId in PHANTOM_PLANS) {
    return PHANTOM_PLANS[planId as PlanId];
  }
  return PHANTOM_PLANS.free;
}

/**
 * Lista dos 20 Países da América Latina (Latam 20) suportados no plano Growth
 */
export const LATAM_COUNTRIES: string[] = [
  "BR", "MX", "AR", "CO", "CL", "PE", "UY", "PY", "EC", "BO",
  "CR", "PA", "DO", "GT", "HN", "SV", "NI", "PR", "VE", "CU",
];

/**
 * Retorna a lista de códigos de países permitidos conforme o plano contratado
 */
export function getAllowedCountriesForPlan(planId: PlanId = "free"): string[] {
  if (planId === "scale" || planId === "global") {
    return ["*"]; // Todos os 247 países globais
  }
  if (planId === "growth" || planId === "pro") {
    return LATAM_COUNTRIES;
  }
  // Free e Starter: Restrito exclusivamente ao Brasil (1 país)
  return ["BR"];
}

/**
 * Validação rigorosa de país para roteamento da campanha
 */
export function isCountryAllowedForPlan(
  countryCode: string,
  planId: PlanId = "free"
): { allowed: boolean; reason?: string } {
  const code = countryCode.trim().toUpperCase();

  if (planId === "scale" || planId === "global") {
    return { allowed: true };
  }

  if (planId === "growth" || planId === "pro") {
    if (LATAM_COUNTRIES.includes(code)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `O país ${code} está fora da América Latina (Latam 20). Faça upgrade para o plano Scale (R$ 529) para desbloquear todos os 247 países globais.`,
    };
  }

  // Free e Starter: Apenas Brasil (1)
  if (code === "BR") {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: `O plano ${planId === "free" ? "Free" : "Starter"} é restrito ao Brasil 🇧🇷 (1 país). Para liberar países da América Latina ou tráfego global, faça upgrade para o plano Growth (R$ 389) ou Scale (R$ 529).`,
  };
}

/**
 * Validação de Limites de Domínio para o Usuário
 */
export function checkDomainLimit(
  currentDomainsCount: number,
  planId: PlanId = "free"
): { allowed: boolean; max: number; current: number; reason?: string } {
  const plan = getPlanDefinition(planId);
  const max = plan.limits.maxDomains;

  if (currentDomainsCount >= max) {
    if (planId === "free") {
      return {
        allowed: false,
        max,
        current: currentDomainsCount,
        reason:
          "Você atingiu o limite de 1 domínio da conta gratuita. Faça upgrade para o plano Starter (R$ 149), Growth (R$ 389) ou Scale (R$ 529) para desbloquear novos domínios e proteger suas campanhas.",
      };
    }
    return {
      allowed: false,
      max,
      current: currentDomainsCount,
      reason: `Você atingiu o limite de ${max} domínios do plano ${plan.name}. Faça upgrade para o plano superior para conectar novos domínios.`,
    };
  }

  return { allowed: true, max, current: currentDomainsCount };
}

/**
 * Validação de Limites de Campanha/Camuflagem para o Usuário
 */
export function checkCampaignLimit(
  currentCampaignsCount: number,
  planId: PlanId = "free"
): { allowed: boolean; max: number; current: number; reason?: string } {
  const plan = getPlanDefinition(planId);
  const max = plan.limits.maxCampaigns;

  if (currentCampaignsCount >= max) {
    if (planId === "free") {
      return {
        allowed: false,
        max,
        current: currentCampaignsCount,
        reason:
          "Você atingiu o limite de 1 camuflagem ativa da conta gratuita. Ative o plano Starter (R$ 149), Growth (R$ 389) ou Scale (R$ 529) para criar novas campanhas sem interrupções.",
      };
    }
    return {
      allowed: false,
      max,
      current: currentCampaignsCount,
      reason: `Você atingiu o limite de ${max} camuflagens ativas do plano ${plan.name}. Faça upgrade para expandir seu limite operacional.`,
    };
  }

  return { allowed: true, max, current: currentCampaignsCount };
}

/**
 * Validação de Limites de Páginas para o Usuário
 */
export function checkPageLimit(
  currentPagesCount: number,
  planId: PlanId = "free"
): { allowed: boolean; max: number; current: number; reason?: string } {
  const plan = getPlanDefinition(planId);
  const max = plan.limits.maxPages;

  if (currentPagesCount >= max) {
    return {
      allowed: false,
      max,
      current: currentPagesCount,
      reason: `Você atingiu o limite de ${max} páginas do plano ${plan.name}. Faça upgrade para hospedar mais páginas e advertoriais.`,
    };
  }

  return { allowed: true, max, current: currentPagesCount };
}

/**
 * Validação de Limites de Eventos/Cliques para o Usuário
 */
export function checkEventLimit(
  currentEventsCount: number,
  planId: PlanId = "free"
): { allowed: boolean; max: number; current: number; reason?: string } {
  const plan = getPlanDefinition(planId);
  const max = plan.limits.maxEventsMonthly;

  // Plano Scale tem cliques ilimitados
  if (max === -1) {
    return { allowed: true, max, current: currentEventsCount };
  }

  if (currentEventsCount >= max) {
    if (planId === "free") {
      return {
        allowed: false,
        max,
        current: currentEventsCount,
        reason: `Sua conta gratuita atingiu o limite de 100 eventos analisados. Para continuar monitorando e protegendo seu tráfego sem interrupção, ative um plano comercial (Starter R$ 149, Growth R$ 389 ou Scale R$ 529).`,
      };
    }

    if (planId === "starter") {
      return {
        allowed: false,
        max,
        current: currentEventsCount,
        reason: `Você atingiu o limite mensal de 10.000 cliques do plano Starter. Faça upgrade para o plano Growth (100.000 cliques) ou Scale (Cliques Ilimitados) para manter suas campanhas ativas.`,
      };
    }

    return {
      allowed: false,
      max,
      current: currentEventsCount,
      reason: `Você atingiu o limite mensal de ${max.toLocaleString("pt-BR")} cliques do plano ${plan.name}. Faça upgrade para o plano Scale (Cliques Ilimitados) para rodar tráfego em escala máxima sem bloqueios.`,
    };
  }

  return { allowed: true, max, current: currentEventsCount };
}
