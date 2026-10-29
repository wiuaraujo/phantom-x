import {
  Campaign,
  Domain,
  GeoAggregate,
  MetricOverview,
  RiskCategory,
  RoutingRule,
  TrafficEvent,
  CloakilioConfig,
} from "@/types";
import {
  CloakerEngine,
  DEFAULT_CLOAKILIO_CONFIG,
  BLOCKED_ASNS_MAP,
  BLOCKED_ASNS_SET,
  BOT_PATTERNS,
} from "./cloakerEngine";
import { resolveLocationMetadata } from "./geoFlags";
import {
  checkEventLimit,
  checkDomainLimit,
  checkCampaignLimit,
  isCountryAllowedForPlan,
  PlanId,
} from "./plans";

// Global traffic hub definitions with precise states/provinces
export const GLOBAL_LOCATIONS = [
  { city: "São Paulo", state: "São Paulo", stateCode: "SP", country: "Brasil", code: "BR", lat: -23.5505, lon: -46.6333 },
  { city: "Rio de Janeiro", state: "Rio de Janeiro", stateCode: "RJ", country: "Brasil", code: "BR", lat: -22.9068, lon: -43.1729 },
  { city: "Belo Horizonte", state: "Minas Gerais", stateCode: "MG", country: "Brasil", code: "BR", lat: -19.9167, lon: -43.9345 },
  { city: "Curitiba", state: "Paraná", stateCode: "PR", country: "Brasil", code: "BR", lat: -25.4284, lon: -49.2733 },
  { city: "Porto Alegre", state: "Rio Grande do Sul", stateCode: "RS", country: "Brasil", code: "BR", lat: -30.0346, lon: -51.2177 },
  { city: "Brasília", state: "Distrito Federal", stateCode: "DF", country: "Brasil", code: "BR", lat: -15.7975, lon: -47.8919 },
  { city: "Salvador", state: "Bahia", stateCode: "BA", country: "Brasil", code: "BR", lat: -12.9777, lon: -38.5016 },
  { city: "Nova York", state: "New York", stateCode: "NY", country: "Estados Unidos", code: "US", lat: 40.7128, lon: -74.006 },
  { city: "San Francisco", state: "California", stateCode: "CA", country: "Estados Unidos", code: "US", lat: 37.7749, lon: -122.4194 },
  { city: "Miami", state: "Florida", stateCode: "FL", country: "Estados Unidos", code: "US", lat: 25.7617, lon: -80.1918 },
  { city: "Londres", state: "Inglaterra", stateCode: "ENG", country: "Reino Unido", code: "GB", lat: 51.5074, lon: -0.1278 },
  { city: "Frankfurt", state: "Hessen", stateCode: "HE", country: "Alemanha", code: "DE", lat: 50.1109, lon: 8.6821 },
  { city: "Tóquio", state: "Tóquio", stateCode: "TK", country: "Japão", code: "JP", lat: 35.6762, lon: 139.6503 },
  { city: "Paris", state: "Île-de-France", stateCode: "IDF", country: "França", code: "FR", lat: 48.8566, lon: 2.3522 },
  { city: "Toronto", state: "Ontário", stateCode: "ON", country: "Canadá", code: "CA", lat: 43.6532, lon: -79.3832 },
  { city: "Sydney", state: "Nova Gales do Sul", stateCode: "NSW", country: "Austrália", code: "AU", lat: -33.8688, lon: 151.2093 },
  { city: "Amsterdã", state: "Holanda do Norte", stateCode: "NH", country: "Holanda", code: "NL", lat: 52.3676, lon: 4.9041 },
  { city: "Singapura", state: "Singapura", stateCode: "SG", country: "Singapura", code: "SG", lat: 1.3521, lon: 103.8198 },
  { city: "Lisboa", state: "Lisboa", stateCode: "LX", country: "Portugal", code: "PT", lat: 38.7223, lon: -9.1393 },
  { city: "Madrid", state: "Madrid", stateCode: "MD", country: "Espanha", code: "ES", lat: 40.4168, lon: -3.7038 },
];

const BROWSERS = ["Chrome 124", "Safari 17.4", "Firefox 125", "Edge 124", "Mobile Safari"];
const OS_LIST = ["iOS 17.4", "Android 14", "Windows 11", "macOS Sonoma", "Linux x86_64"];
const REFERRERS = [
  "https://instagram.com",
  "https://facebook.com",
  "https://google.com/search",
  "https://tiktok.com",
  "https://linkedin.com",
  "Direto / Marcador",
];

// Configuration Phantom-X Motor de Borda
const PHANTOM_CLOAKER_STORAGE_KEY = "phantom_cloaker_config";
const CLOAKILIO_STORAGE_KEY = PHANTOM_CLOAKER_STORAGE_KEY;
let phantomCloakerConfigStore: CloakilioConfig = { ...DEFAULT_CLOAKILIO_CONFIG };

// USER ACCOUNT STORES START AT 100% ZERO FOR NEW ACCOUNTS
let domainsStore: Domain[] = [];
let campaignsStore: Campaign[] = [];
let routingRulesStore: RoutingRule[] = [];
let eventsStore: TrafficEvent[] = [];

// Helper para obter o ID do usuário atualmente logado
function getActiveUserId(): string {
  if (typeof window === "undefined") return "master";
  try {
    const raw = localStorage.getItem("phantom_session");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.user?.id) return parsed.user.id;
    }
  } catch {}
  return "master";
}

function getActiveUserPlan(): PlanId {
  if (typeof window === "undefined") return "free";
  try {
    const raw = localStorage.getItem("phantom_session");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.user?.plan) return parsed.user.plan;
    }
  } catch {}
  return "free";
}

function getUserScopedKey(suffix: string): string {
  return `phantom_user_${getActiveUserId()}_${suffix}`;
}

function loadUserArray<T>(suffix: string, fallback: T[] = []): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(getUserScopedKey(suffix));
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return fallback;
}

function saveUserArray<T>(suffix: string, data: T[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getUserScopedKey(suffix), JSON.stringify(data));
  } catch {}
}

// Demo cache for landing page showcase
let demoEventsCache: TrafficEvent[] = [];

function generateDemoEventsPool(count: number = 60): TrafficEvent[] {
  const events: TrafficEvent[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const timeOffset = Math.floor(i * (120000 / count));
    const loc = GLOBAL_LOCATIONS[Math.floor(Math.random() * GLOBAL_LOCATIONS.length)];
    
    // Simula proporção realista do Phantom-X (85% humanos limpos, 15% bots / moderadores)
    const isBot = Math.random() < 0.15;
    const isSuspicious = !isBot && Math.random() < 0.10;

    let asn: number;
    let userAgent: string;
    let urlParams: Record<string, string> = {};

    if (isBot) {
      const blockedAsnsList = [32934, 16509, 15169, 8075, 14061, 24940, 46652];
      asn = blockedAsnsList[Math.floor(Math.random() * blockedAsnsList.length)];
      userAgent = Math.random() < 0.5
        ? "Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)"
        : "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
    } else {
      asn = loc.code === "BR" ? (Math.random() < 0.5 ? 28573 : 18881) : 7922;
      userAgent = Math.random() < 0.75
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
        : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36";
      urlParams = {
        utm_source: "meta",
        utm_medium: "cpc",
        utm_campaign: "black_q4",
        fbclid: `IwAR${Math.random().toString(36).substring(2, 12)}_${Date.now().toString(36)}`,
      };
    }

    const assessment = CloakerEngine.evaluateRequest({
      userAgent,
      asn,
      countryCode: loc.code,
      urlParams,
    });

    const ipLast = Math.floor(Math.random() * 254) + 1;
    const ipFirst = loc.code === "BR" ? 177 : 198;
    const rawIp = `${ipFirst}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${ipLast}`;
    const ipMasked = `${ipFirst}.${Math.floor(Math.random() * 250)}.***.***`;

    const riskCategory: RiskCategory = assessment.isThreat
      ? "bot"
      : assessment.riskScore > 35
      ? "suspicious"
      : "clean";

    events.push({
      id: `evt_demo_${Date.now().toString(36)}_${i}`,
      clickId: assessment.clickId,
      timestamp: new Date(now - timeOffset).toISOString(),
      domain: "checkout.phantomx.pro",
      campaignId: "camp_demo",
      campaignName: "Lançamento Q4 — Tráfego Pago Meta",
      ip: rawIp,
      ipMasked,
      country: loc.country,
      countryCode: loc.code,
      state: loc.state,
      stateCode: loc.stateCode,
      city: loc.city,
      latitude: loc.lat + (Math.random() - 0.5) * 0.05,
      longitude: loc.lon + (Math.random() - 0.5) * 0.05,
      device: assessment.device,
      browser: assessment.browser,
      os: assessment.os,
      referrer: isBot ? "Direto / Sem Referrer" : REFERRERS[Math.floor(Math.random() * REFERRERS.length)],
      targetUrl: "https://minhaloja.com/checkout",
      routedTo: assessment.routedUrl,
      riskScore: assessment.riskScore,
      riskCategory,
      classification: assessment.classification,
      decision: assessment.decision,
      asn: assessment.asn,
      asnOrg: assessment.asnOrg,
      detectedLayer: assessment.detectedLayer,
      httpStatus: 200,
      reverseProxyDelivery: true,
      webglRenderer: assessment.webglRenderer,
      isHeadless: assessment.isHeadless,
      canvasHash: assessment.canvasHash,
      ispOrg: assessment.asnOrg,
      latencyMs: Math.floor(10 + Math.random() * 20),
      isThreat: assessment.isThreat,
      threatReasons: assessment.threatReasons,
    });
  }

  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

demoEventsCache = generateDemoEventsPool(80);

export const store = {
  resetAccountToZero() {
    domainsStore = [];
    campaignsStore = [];
    routingRulesStore = [];
    eventsStore = [];
    saveUserArray("domains", []);
    saveUserArray("campaigns", []);
    saveUserArray("events", []);
  },

  getPhantomCloakerConfig(): CloakilioConfig {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(PHANTOM_CLOAKER_STORAGE_KEY) || localStorage.getItem("phantom_cloakilio_config");
        if (stored) {
          phantomCloakerConfigStore = { ...DEFAULT_CLOAKILIO_CONFIG, ...JSON.parse(stored) };
        }
      } catch {}
    }
    return { ...phantomCloakerConfigStore };
  },

  getCloakilioConfig(): CloakilioConfig {
    return this.getPhantomCloakerConfig();
  },

  updatePhantomCloakerConfig(partial: Partial<CloakilioConfig>): CloakilioConfig {
    phantomCloakerConfigStore = {
      ...phantomCloakerConfigStore,
      ...partial,
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PHANTOM_CLOAKER_STORAGE_KEY, JSON.stringify(phantomCloakerConfigStore));
      } catch {}
    }
    return { ...phantomCloakerConfigStore };
  },

  updateCloakilioConfig(partial: Partial<CloakilioConfig>): CloakilioConfig {
    return this.updatePhantomCloakerConfig(partial);
  },

  seedAccountDemo() {
    const defaultDom: Domain = {
      id: `dom_${Date.now().toString(36)}`,
      name: "checkout.phantomx.pro",
      status: "active",
      sslStatus: "valid",
      dnsRecords: [
        { type: "CNAME", host: "checkout", expected: "cname.phantomx.pro", verified: true },
        { type: "TXT", host: "_phantom-challenge", expected: "phantom-verify=894318712", verified: true },
      ],
      eventsCount: 15,
      activeCampaigns: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    domainsStore = [defaultDom];

    campaignsStore = [
      {
        id: `camp_${Date.now().toString(36)}`,
        name: "Campanha Inicial de Teste",
        domainId: defaultDom.id,
        domainName: defaultDom.name,
        status: "active",
        targetUrl: "https://meusite.com/oferta",
        fallbackUrl: "https://phantomx.pro/verificacao-seguranca",
        utmSource: "meta",
        utmMedium: "cpc",
        utmCampaign: "teste_borda",
        totalEvents: 15,
        cleanEvents: 14,
        botEvents: 1,
        conversionRate: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    eventsStore = generateDemoEventsPool(15);
  },

  getOverviewMetrics(): MetricOverview {
    const userEvents = this.getEvents({ limit: 10000 });
    if (userEvents.length === 0) {
      return {
        activeVisitors: 0,
        totalEvents: 0,
        sessionCount: 0,
        uniqueCountries: 0,
        automatedThreatsBlocked: 0,
        periodGrowth: {
          visitors: 0,
          events: 0,
          sessions: 0,
          threats: 0,
        },
      };
    }

    const totalEvents = userEvents.length;
    const threats = userEvents.filter((e) => e.isThreat).length;
    const uniqueCountries = new Set(userEvents.map((e) => e.countryCode)).size;
    const uniqueSessions = new Set(userEvents.map((e) => e.ipMasked)).size;

    const fifteenMinAgo = Date.now() - 15 * 60 * 1000;
    const recentClean = userEvents.filter(
      (e) => new Date(e.timestamp).getTime() > fifteenMinAgo && !e.isThreat
    );
    const activeVisitors = Math.max(
      recentClean.length > 0 ? new Set(recentClean.map((e) => e.ipMasked)).size : 1,
      0
    );

    return {
      activeVisitors,
      totalEvents,
      sessionCount: uniqueSessions,
      uniqueCountries,
      automatedThreatsBlocked: threats,
      periodGrowth: {
        visitors: 0,
        events: 0,
        sessions: 0,
        threats: 0,
      },
    };
  },

  getEvents(filter?: {
    limit?: number;
    domain?: string;
    campaignId?: string;
    risk?: RiskCategory;
    country?: string;
    search?: string;
  }): TrafficEvent[] {
    const allEvents = loadUserArray<TrafficEvent>("events", eventsStore);
    let result = [...allEvents];

    if (filter?.domain && filter.domain !== "all" && filter.domain !== "Todos os Domínios") {
      result = result.filter((e) => e.domain === filter.domain);
    }
    if (filter?.campaignId && filter.campaignId !== "all") {
      result = result.filter((e) => e.campaignId === filter.campaignId);
    }
    if (filter?.risk && filter.risk !== ("all" as any)) {
      result = result.filter((e) => e.riskCategory === filter.risk);
    }
    if (filter?.country && filter.country !== "all") {
      result = result.filter((e) => e.countryCode === filter.country);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.city.toLowerCase().includes(q) ||
          e.country.toLowerCase().includes(q) ||
          (e.state && e.state.toLowerCase().includes(q)) ||
          (e.stateCode && e.stateCode.toLowerCase().includes(q)) ||
          e.domain.toLowerCase().includes(q) ||
          e.ipMasked.includes(q) ||
          e.browser.toLowerCase().includes(q) ||
          (e.clickId && e.clickId.toLowerCase().includes(q))
      );
    }

    const limit = filter?.limit || 50;
    const userPlan = getActiveUserPlan();
    if (userPlan === "free" && result.length > 100) {
      result = result.slice(0, 100);
    }
    return result.slice(0, limit);
  },

  canGenerateMoreEvents(): { allowed: boolean; current: number; max: number; reason?: string } {
    const plan = getActiveUserPlan();
    const allEvents = loadUserArray<TrafficEvent>("events", eventsStore);
    return checkEventLimit(allEvents.length, plan);
  },

  ingestEvent(payload: {
    domain?: string;
    targetUrl?: string;
    userAgent?: string;
    ip?: string;
    campaignId?: string;
    referrer?: string;
    utmParams?: Record<string, string>;
  }): TrafficEvent {
    const loc = GLOBAL_LOCATIONS[Math.floor(Math.random() * GLOBAL_LOCATIONS.length)];
    const matchedDomain = payload.domain || domainsStore[0]?.name || "app.phantomx.pro";
    const matchedCampaign = campaignsStore.find((c) => c.id === payload.campaignId) || campaignsStore[0];
    const targetUrl = payload.targetUrl || matchedCampaign?.targetUrl || "https://meusite.com/oferta";
    const fallbackUrl = matchedCampaign?.fallbackUrl || "https://phantomx.pro/verificacao-seguranca";

    const assessment = CloakerEngine.evaluateRequest({
      userAgent: payload.userAgent,
      referrer: payload.referrer,
      countryCode: loc.code,
      urlParams: payload.utmParams,
      config: {
        ofertaUrl: targetUrl,
        whitepageUrl: fallbackUrl,
      },
    });

    const rawIp = payload.ip || `177.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.45`;
    const ipMasked = rawIp.replace(/\.\d+\.\d+$/, ".***.***");
    const riskCategory: RiskCategory = assessment.isThreat
      ? "bot"
      : assessment.riskScore > 40
      ? "suspicious"
      : "clean";

    const meta = resolveLocationMetadata(loc.city, loc.code, loc.stateCode);

    const newEvent: TrafficEvent = {
      id: `evt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
      clickId: assessment.clickId,
      timestamp: assessment.timestamp,
      domain: matchedDomain,
      campaignId: matchedCampaign?.id || "camp_default",
      campaignName: matchedCampaign?.name || "Roteamento Cloaker Geral",
      ip: rawIp,
      ipMasked,
      country: meta.country,
      countryCode: loc.code,
      state: meta.state,
      stateCode: meta.stateCode,
      city: loc.city,
      latitude: loc.lat,
      longitude: loc.lon,
      device: assessment.device,
      browser: assessment.browser,
      os: assessment.os,
      referrer: payload.referrer || "https://google.com/search",
      targetUrl,
      routedTo: assessment.routedUrl,
      riskScore: assessment.riskScore,
      riskCategory,
      classification: assessment.classification,
      decision: assessment.decision,
      asn: assessment.asn,
      asnOrg: assessment.asnOrg,
      detectedLayer: assessment.detectedLayer,
      httpStatus: 200,
      reverseProxyDelivery: true,
      webglRenderer: assessment.webglRenderer,
      isHeadless: assessment.isHeadless,
      canvasHash: assessment.canvasHash,
      ispOrg: assessment.asnOrg,
      latencyMs: Math.floor(10 + Math.random() * 22),
      isThreat: assessment.isThreat,
      threatReasons: assessment.threatReasons,
    };

    const userPlan = getActiveUserPlan();
    const allEvents = loadUserArray<TrafficEvent>("events", eventsStore);
    const limitCheck = checkEventLimit(allEvents.length, userPlan);
    if (!limitCheck.allowed) {
      // Bloqueia persistência de eventos caso o limite contratado do plano tenha sido atingido
      return newEvent;
    }

    eventsStore.unshift(newEvent);
    if (eventsStore.length > 500) {
      eventsStore.pop();
    }

    const dom = domainsStore.find((d) => d.name === matchedDomain);
    if (dom) {
      dom.eventsCount = (dom.eventsCount || 0) + 1;
    }
    if (matchedCampaign) {
      matchedCampaign.totalEvents += 1;
      if (newEvent.isThreat) {
        matchedCampaign.botEvents += 1;
      } else {
        matchedCampaign.cleanEvents += 1;
      }
    }

    return newEvent;
  },

  generateRandomSimulatedEvent(): TrafficEvent {
    const userPlan = getActiveUserPlan();
    const allEvents = loadUserArray<TrafficEvent>("events", eventsStore);
    const limitCheck = checkEventLimit(allEvents.length, userPlan);
    if (!limitCheck.allowed) {
      throw new Error(limitCheck.reason || "Limite de eventos do plano contratado atingido.");
    }

    const loc = GLOBAL_LOCATIONS[Math.floor(Math.random() * GLOBAL_LOCATIONS.length)];
    const camp = campaignsStore[Math.floor(Math.random() * campaignsStore.length)];
    const domainName = camp?.domainName || domainsStore[0]?.name || "gateway.phantomx.pro";
    const targetUrl = camp?.targetUrl || camp?.ofertaUrl || "https://seusite.com/oferta";
    const fallbackUrl = camp?.fallbackUrl || camp?.whitepageUrl || "https://seusite.com/white";

    const isSimulatedThreat = Math.random() < 0.16;
    const isMobileSim = Math.random() < 0.75;
    
    let simulatedAsn: number;
    let simulatedUa: string;
    let urlParams: Record<string, string> = {};

    if (isSimulatedThreat) {
      const blockedList = [32934, 16509, 15169, 8075, 14061, 24940, 46652];
      simulatedAsn = blockedList[Math.floor(Math.random() * blockedList.length)];
      simulatedUa = Math.random() < 0.5
        ? "Mozilla/5.0 (compatible; Google-InspectionTool/1.0;)"
        : "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";
      urlParams = {
        utm_campaign: "teste_inspecao",
      };
    } else {
      simulatedAsn = loc.code === "BR" ? (Math.random() < 0.5 ? 28573 : 18881) : 7922;
      simulatedUa = isMobileSim
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
        : "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36";
      urlParams = {
        utm_source: "meta",
        utm_medium: "cpc",
        utm_campaign: "campanha_escala",
        fbclid: `IwAR${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`,
      };
    }

    const currentConfig = this.getCloakilioConfig();

    const assessment = CloakerEngine.evaluateRequest({
      userAgent: simulatedUa,
      asn: simulatedAsn,
      countryCode: loc.code,
      urlParams,
      config: {
        ...currentConfig,
        whitepageUrl: fallbackUrl,
        ofertaUrl: targetUrl,
      },
    });

    const meta = resolveLocationMetadata(loc.city, loc.code, loc.stateCode);
    const ipPrefix = loc.code === "BR" ? "177" : "189";
    const rawIp = `${ipPrefix}.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 200)}.12`;
    const ipMasked = `${ipPrefix}.${Math.floor(Math.random() * 200)}.***.***`;
    const riskCategory: RiskCategory = assessment.isThreat
      ? "bot"
      : assessment.riskScore > 35
      ? "suspicious"
      : "clean";

    const event: TrafficEvent = {
      id: `evt_sim_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      clickId: assessment.clickId,
      timestamp: assessment.timestamp,
      domain: domainName,
      campaignId: camp?.id || "camp_sim",
      campaignName: camp?.name || "Tráfego Cloaker Simulado",
      ip: rawIp,
      ipMasked,
      country: meta.country,
      countryCode: loc.code,
      state: meta.state,
      stateCode: meta.stateCode,
      city: loc.city,
      latitude: loc.lat + (Math.random() - 0.5) * 0.05,
      longitude: loc.lon + (Math.random() - 0.5) * 0.05,
      device: assessment.device,
      browser: assessment.browser,
      os: assessment.os,
      referrer: isSimulatedThreat ? "Direto" : REFERRERS[Math.floor(Math.random() * REFERRERS.length)],
      targetUrl,
      routedTo: assessment.routedUrl,
      riskScore: assessment.riskScore,
      riskCategory,
      classification: assessment.classification,
      decision: assessment.decision,
      asn: assessment.asn,
      asnOrg: assessment.asnOrg,
      detectedLayer: assessment.detectedLayer,
      httpStatus: 200,
      reverseProxyDelivery: true,
      webglRenderer: assessment.webglRenderer,
      isHeadless: assessment.isHeadless,
      canvasHash: assessment.canvasHash,
      ispOrg: assessment.asnOrg,
      latencyMs: Math.floor(10 + Math.random() * 20),
      isThreat: assessment.isThreat,
      threatReasons: assessment.threatReasons,
      isSimulated: true,
    };

    allEvents.unshift(event);
    if (allEvents.length > 500) {
      allEvents.pop();
    }
    eventsStore = allEvents;
    saveUserArray("events", allEvents);

    const currentDomains = loadUserArray<Domain>("domains", domainsStore);
    const dom = currentDomains.find((d) => d.name === domainName);
    if (dom) {
      dom.eventsCount = (dom.eventsCount || 0) + 1;
      saveUserArray("domains", currentDomains);
    }
    if (camp) {
      camp.totalEvents += 1;
      if (assessment.isThreat) camp.botEvents += 1;
      else camp.cleanEvents += 1;
    }

    return event;
  },

  /**
   * Verifica se o usuário possui eventos simulados/de teste no dashboard
   */
  hasSimulatedData(): boolean {
    const allEvents = loadUserArray<TrafficEvent>("events", eventsStore);
    return allEvents.some((e) => e.isSimulated || e.id.startsWith("evt_sim_"));
  },

  /**
   * Reverte e remove todos os eventos simulados de teste, restaurando o dashboard
   * limpo sem afetar os dados reais do usuário.
   */
  revertSimulatedEvents(): { count: number } {
    const allEvents = loadUserArray<TrafficEvent>("events", eventsStore);
    const beforeCount = allEvents.length;
    const remaining = allEvents.filter((e) => !e.isSimulated && !e.id.startsWith("evt_sim_"));
    const removedCount = beforeCount - remaining.length;

    eventsStore = remaining;
    saveUserArray("events", remaining);

    // Recalcula contadores de eventos por domínio
    const currentDomains = loadUserArray<Domain>("domains", domainsStore);
    const updatedDomains = currentDomains.map((d) => {
      const realEvents = remaining.filter((e) => e.domain === d.name);
      return {
        ...d,
        eventsCount: realEvents.length,
      };
    });
    domainsStore = updatedDomains;
    saveUserArray("domains", updatedDomains);

    return { count: removedCount };
  },

  /**
   * Limpa completamente todos os eventos de tráfego do usuário ativo
   */
  clearAllEvents(): void {
    eventsStore = [];
    saveUserArray("events", []);
    const currentDomains = loadUserArray<Domain>("domains", domainsStore);
    const updatedDomains = currentDomains.map((d) => ({ ...d, eventsCount: 0 }));
    domainsStore = updatedDomains;
    saveUserArray("domains", updatedDomains);
  },

  getActiveUserPlan(): PlanId {
    return getActiveUserPlan();
  },

  getDomains(): Domain[] {
    return loadUserArray<Domain>("domains", domainsStore);
  },

  addDomain(name: string): Domain {
    const userPlan = getActiveUserPlan();
    const current = loadUserArray<Domain>("domains", domainsStore);
    const domainCheck = checkDomainLimit(current.length, userPlan);
    if (!domainCheck.allowed) {
      throw new Error(domainCheck.reason || "Limite de domínios atingido para o plano contratado.");
    }

    const cleanName = name.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const newDomain: Domain = {
      id: `dom_${Date.now().toString(36)}`,
      name: cleanName,
      status: "pending_verification",
      sslStatus: "provisioning",
      dnsRecords: [
        {
          type: "CNAME",
          host: cleanName.split(".")[0],
          expected: "cname.phantomx.pro",
          verified: false,
        },
        {
          type: "TXT",
          host: "_phantom-challenge",
          expected: `phantom-verify=${Math.floor(Math.random() * 90000000 + 10000000)}`,
          verified: false,
        },
      ],
      eventsCount: 0,
      activeCampaigns: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    current.push(newDomain);
    domainsStore = current;
    saveUserArray("domains", current);
    return newDomain;
  },

  verifyDomainDNS(domainId: string): Domain | null {
    const current = loadUserArray<Domain>("domains", domainsStore);
    const domain = current.find((d) => d.id === domainId);
    if (!domain) return null;

    domain.dnsRecords.forEach((r) => (r.verified = true));
    domain.status = "active";
    domain.sslStatus = "valid";
    domain.updatedAt = new Date().toISOString();
    domainsStore = current;
    saveUserArray("domains", current);
    return { ...domain };
  },

  deleteDomain(domainId: string): boolean {
    const current = loadUserArray<Domain>("domains", domainsStore);
    const initialLen = current.length;
    const filtered = current.filter((d) => d.id !== domainId);
    domainsStore = filtered;
    saveUserArray("domains", filtered);
    return filtered.length < initialLen;
  },

  getCampaigns(): Campaign[] {
    return loadUserArray<Campaign>("campaigns", campaignsStore);
  },

  createCampaign(data: Partial<Campaign>): Campaign {
    const userPlan = getActiveUserPlan();
    const currentCamps = loadUserArray<Campaign>("campaigns", campaignsStore);
    const campCheck = checkCampaignLimit(currentCamps.length, userPlan);
    if (!campCheck.allowed) {
      throw new Error(campCheck.reason || "Limite de camuflagens atingido para o plano contratado.");
    }

    const currentDomains = this.getDomains();
    const domain = currentDomains.find((d) => d.id === data.domainId) || currentDomains[0];
    const newCamp: Campaign = {
      id: `camp_${Date.now().toString(36)}`,
      name: data.name || "Nova Campanha Phantom-X",
      domainId: domain ? domain.id : "default",
      domainName: domain ? domain.name : (currentDomains[0]?.name || "app.phantomx.pro"),
      status: "active",
      mode: data.mode || "AUTOMATICO",
      targetUrl: data.targetUrl || data.ofertaUrl || "https://seusite.com/oferta",
      fallbackUrl: data.fallbackUrl || data.whitepageUrl || "https://seusite.com/white",
      whitepageUrl: data.whitepageUrl || data.fallbackUrl || "https://seusite.com/white",
      ofertaUrl: data.ofertaUrl || data.targetUrl || "https://seusite.com/oferta",
      allowedCountries: data.allowedCountries || ["BR"],
      requireFbclid: data.requireFbclid ?? false,
      allowMobile: data.allowMobile ?? true,
      allowDesktop: data.allowDesktop ?? true,
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmTerm: data.utmTerm,
      utmContent: data.utmContent,
      totalEvents: 0,
      cleanEvents: 0,
      botEvents: 0,
      conversionRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const current = loadUserArray<Campaign>("campaigns", campaignsStore);
    current.push(newCamp);
    campaignsStore = current;
    saveUserArray("campaigns", current);

    if (domain) {
      domain.activeCampaigns = (domain.activeCampaigns || 0) + 1;
      saveUserArray("domains", currentDomains);
    }
    return newCamp;
  },

  updateCampaign(campaignId: string, data: Partial<Campaign>): Campaign | null {
    const current = loadUserArray<Campaign>("campaigns", campaignsStore);
    const idx = current.findIndex((c) => c.id === campaignId);
    if (idx === -1) return null;
    current[idx] = {
      ...current[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    campaignsStore = current;
    saveUserArray("campaigns", current);
    return current[idx];
  },

  deleteCampaign(campaignId: string): boolean {
    const current = loadUserArray<Campaign>("campaigns", campaignsStore);
    const initialLen = current.length;
    const filtered = current.filter((c) => c.id !== campaignId);
    campaignsStore = filtered;
    saveUserArray("campaigns", filtered);
    return filtered.length < initialLen;
  },

  getRoutingRules(): RoutingRule[] {
    return [...routingRulesStore];
  },

  createRoutingRule(data: Partial<RoutingRule>): RoutingRule {
    const domain = domainsStore.find((d) => d.id === data.domainId) || domainsStore[0];
    const newRule: RoutingRule = {
      id: `rule_${Date.now().toString(36)}`,
      name: data.name || "Nova Regra de Roteamento",
      domainId: domain ? domain.id : "default",
      domainName: domain ? domain.name : "phantomx.pro",
      priority: data.priority || routingRulesStore.length + 1,
      status: "active",
      conditions: data.conditions || { maxRiskScore: 45 },
      destinationUrl: data.destinationUrl || "https://meusite.com/oferta",
      fallbackUrl: data.fallbackUrl || "https://phantomx.pro/verificacao-seguranca",
      hitsCount: 0,
      createdAt: new Date().toISOString(),
    };
    routingRulesStore.push(newRule);
    return newRule;
  },

  deleteRoutingRule(ruleId: string): boolean {
    const initial = routingRulesStore.length;
    routingRulesStore = routingRulesStore.filter((r) => r.id !== ruleId);
    return routingRulesStore.length < initial;
  },

  getGeoDistribution(): GeoAggregate[] {
    const userEvents = this.getEvents({ limit: 10000 });
    if (userEvents.length === 0) {
      return [];
    }

    const countryMap = new Map<string, { country: string; code: string; count: number; lat: number; lon: number }>();

    userEvents.forEach((evt) => {
      const existing = countryMap.get(evt.countryCode);
      if (existing) {
        existing.count += 1;
      } else {
        countryMap.set(evt.countryCode, {
          country: evt.country,
          code: evt.countryCode,
          count: 1,
          lat: evt.latitude,
          lon: evt.longitude,
        });
      }
    });

    const total = userEvents.length;
    return Array.from(countryMap.values())
      .map((item) => ({
        country: item.country,
        countryCode: item.code,
        eventsCount: item.count,
        percentage: Math.round((item.count / total) * 100),
        latitude: item.lat,
        longitude: item.lon,
      }))
      .sort((a, b) => b.eventsCount - a.eventsCount);
  },

  getTimeSeries(hours: number = 24): { hour: string; events: number; threats: number }[] {
    const userEvents = this.getEvents({ limit: 10000 });
    const result = [];
    const now = new Date();
    for (let i = hours - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600000);
      const hourStr = `${d.getHours().toString().padStart(2, "0")}:00`;

      if (userEvents.length === 0) {
        result.push({ hour: hourStr, events: 0, threats: 0 });
        continue;
      }

      const windowStart = d.getTime() - 1800000;
      const windowEnd = d.getTime() + 1800000;
      const hourEvts = userEvents.filter((e) => {
        const t = new Date(e.timestamp).getTime();
        return t >= windowStart && t <= windowEnd;
      });

      result.push({
        hour: hourStr,
        events: hourEvts.length,
        threats: hourEvts.filter((e) => e.isThreat).length,
      });
    }
    return result;
  },

  getDeviceStats() {
    if (eventsStore.length === 0) {
      return { desktop: 0, mobile: 0, tablet: 0, bot: 0 };
    }
    const total = eventsStore.length;
    const desktop = eventsStore.filter((e) => e.device === "desktop").length;
    const mobile = eventsStore.filter((e) => e.device === "mobile").length;
    const tablet = eventsStore.filter((e) => e.device === "tablet").length;
    const bot = eventsStore.filter((e) => e.device === "bot" || e.isThreat).length;

    return {
      desktop: Math.round((desktop / total) * 100),
      mobile: Math.round((mobile / total) * 100),
      tablet: Math.round((tablet / total) * 100),
      bot: Math.round((bot / total) * 100),
    };
  },

  // ================= DEMO METHODS FOR LANDING PAGE SHOWCASE =================
  getDemoOverviewMetrics(): MetricOverview {
    return {
      activeVisitors: 218,
      totalEvents: 68420,
      sessionCount: 52190,
      uniqueCountries: 24,
      automatedThreatsBlocked: 3410,
      periodGrowth: {
        visitors: +14.6,
        events: +23.8,
        sessions: +18.2,
        threats: -8.4,
      },
    };
  },

  getDemoEvents(limit: number = 8): TrafficEvent[] {
    return demoEventsCache.slice(0, limit);
  },

  getDemoGeoDistribution(): GeoAggregate[] {
    const demoHubs = [
      { country: "Brasil", code: "BR", eventsCount: 28410, percentage: 41, lat: -23.5505, lon: -46.6333 },
      { country: "Estados Unidos", code: "US", eventsCount: 18920, percentage: 28, lat: 40.7128, lon: -74.006 },
      { country: "Reino Unido", code: "GB", eventsCount: 7120, percentage: 10, lat: 51.5074, lon: -0.1278 },
      { country: "Alemanha", code: "DE", eventsCount: 5410, percentage: 8, lat: 50.1109, lon: 8.6821 },
      { country: "Japão", code: "JP", eventsCount: 3890, percentage: 6, lat: 35.6762, lon: 139.6503 },
      { country: "Portugal", code: "PT", eventsCount: 2710, percentage: 4, lat: 38.7223, lon: -9.1393 },
      { country: "Canadá", code: "CA", eventsCount: 1960, percentage: 3, lat: 43.6532, lon: -79.3832 },
    ];
    return demoHubs.map((h) => ({
      country: h.country,
      countryCode: h.code,
      eventsCount: h.eventsCount,
      percentage: h.percentage,
      latitude: h.lat,
      longitude: h.lon,
    }));
  },

  getDemoTimeSeries(hours: number = 24): { hour: string; events: number; threats: number }[] {
    const result = [];
    const now = new Date();
    for (let i = hours - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 3600000);
      const hourStr = `${d.getHours().toString().padStart(2, "0")}:00`;
      const baseEvents = Math.floor(180 + Math.sin(i / 3) * 60 + Math.random() * 40);
      const threats = Math.floor(baseEvents * 0.08 + Math.random() * 6);
      result.push({
        hour: hourStr,
        events: baseEvents,
        threats,
      });
    }
    return result;
  },
};
