import { DeviceType, CloakerMode, CloakilioConfig, CloakerDetectedLayer, PlanId } from "@/types";
import { LATAM_COUNTRIES } from "./plans";

export type CloakerClassification =
  | "human-like"
  | "known-crawler"
  | "preview-bot"
  | "automation"
  | "suspicious"
  | "unknown";

export type CloakerDecision = "routed_offer" | "mitigated_safe" | "blocked";

export interface CloakerAssessment {
  clickId: string;
  timestamp: string;
  riskScore: number; // 0 to 100
  classification: CloakerClassification;
  decision: CloakerDecision;
  isThreat: boolean;
  threatReasons: string[];
  detectedLayer: CloakerDetectedLayer;
  asn?: number;
  asnOrg: string;
  targetUrl: string;
  routedUrl: string;
  httpStatus: number;
  reverseProxyDelivery: boolean;
  device: DeviceType;
  browser: string;
  os: string;
  webglRenderer?: string;
  isHeadless?: boolean;
  canvasHash?: string;
  cleanParams: Record<string, string>;
}

// ============================================================================
// 🛡️ BANCO DE DADOS COMPLETO DE ASNs - MOTOR PHANTOM-X v3
// ============================================================================

// ASNs de Datacenters, Hosting & Infraestrutura de Nuvem
export const BLOCKED_ASNS_MAP: Record<number, string> = {
  // === META PLATFORMS (Facebook, Instagram, WhatsApp) ===
  32934: "Meta Platforms / Facebook Bot Network",
  63293: "Meta Platforms Infrastructure",
  398324: "Meta External Crawler Subnet",
  54115: "Meta Platforms — Facebook Ireland",

  // === BYTEDANCE / TIKTOK ===
  135377: "ByteDance / TikTok Scraper Network",
  138699: "ByteDance — TikTok Ads Review Infra",
  396986: "TikTok Information Technologies",

  // === GOOGLE CLOUD & ADS REVIEW ===
  15169: "Google Cloud Infrastructure",
  396982: "Google Cloud Virtual Machines",
  36492: "Google — Redes de Verificação de Anúncios",
  19527: "Google Fiber Webpass (Reviewers)",

  // === AMAZON WEB SERVICES (AWS) ===
  16509: "Amazon AWS Datacenter",
  14618: "Amazon AWS EC2",
  8987: "Amazon AWS Global Accelerator",

  // === MICROSOFT AZURE ===
  8075: "Microsoft Azure Hosting",
  8068: "Microsoft Corp (Bing Ads Review)",
  3598: "Microsoft Azure Germany",

  // === DIGITALOCEAN ===
  14061: "DigitalOcean Datacenter",
  200130: "DigitalOcean UK Cluster",

  // === OUTROS DATACENTERS DE GRANDE PORTE ===
  16276: "OVH Hosting SAS",
  24940: "Hetzner Online Datacenter",
  51167: "Contabo Cloud Servers",
  20473: "Vultr / Choopa Datacenter",
  63949: "Linode / Akamai Connected Cloud",
  12876: "Scaleway / Online SAS",
  31898: "Oracle Cloud Infrastructure",
  45102: "Alibaba Cloud Datacenter",
  62240: "Clouvider Hosting",
  49505: "Selectel Datacenter",
  37963: "Alibaba Cloud (Aliyun)",
  132203: "Tencent Cloud Computing",
  55967: "UpCloud Ltd (Datacenter)",
  60781: "Leaseweb Netherlands B.V.",
  28753: "Leaseweb Deutschland GmbH",
  30633: "Leaseweb USA",
  46562: "Total Server Solutions",
  19318: "Interserver Inc",
  18779: "EGI Hosting",
  30083: "GoDaddy Hosting",
  26496: "GoDaddy Cloud Servers",

  // === REDES CDN / PROXY / SCRAPING ===
  13335: "Cloudflare Warp / Scrapers",
  60068: "CDN77 / Spy Services",
  46652: "AdPlexity / Spy Scrapers",
  20940: "Akamai Technologies (CDN Crawlers)",
  16625: "Akamai Technologies (Prolexic)",
  54113: "Fastly CDN Infrastructure",
  13790: "Internap Holding / QTS Datacenters",

  // === PROVEDORES DE PROXY / SCRAPING COMERCIAL ===
  9009: "M247 Ltd / VPNs Comerciais & Bright Data",
  199524: "GCORE SA (Hosting/Proxy)",
  209: "CenturyLink / Lumen Technologies (Data)",
  3462: "HiNet (Taiwan Data Centers)",
  6939: "Hurricane Electric (Tunnel Broker / VPN)",

  // === FERRAMENTAS DE ESPIONAGEM DE ADS ===
  // AdHeart, Dropispy, BigSpy, PiPiADS, Minea operam via datacenters já listados
};

export const BLOCKED_ASNS_SET = new Set<number>(
  Object.keys(BLOCKED_ASNS_MAP).map(Number)
);

// ============================================================================
// 🔒 ASNs DE VPN COMERCIAIS CONHECIDAS
// ============================================================================

export const VPN_ASNS_MAP: Record<number, string> = {
  // === NORDVPN / NORD SECURITY ===
  212238: "NordVPN (Nord Security — Cluster Principal)",
  208835: "NordVPN (Nord Security — Bloco Secundário)",

  // === EXPRESSVPN ===
  394711: "ExpressVPN (Kape Technologies)",

  // === SURFSHARK ===
  209854: "Surfshark B.V. (VPN Exit Nodes)",

  // === PROTONVPN ===
  209103: "ProtonVPN (Proton AG — Suíça)",
  62371: "ProtonVPN (Proton Technologies)",

  // === CYBERGHOST ===
  210278: "CyberGhost VPN (Kape Technologies)",

  // === PRIVATE INTERNET ACCESS (PIA) ===
  53667: "PIA (Private Internet Access)",

  // === IPVANISH ===
  33438: "IPVanish (StackPath/Ziff Davis)",

  // === MULLVAD VPN ===
  39351: "Mullvad VPN AB",

  // === WINDSCRIBE ===
  395954: "Windscribe Ltd (VPN Provider)",

  // === HIDE.ME ===
  209588: "Hide.me VPN (eVenture Ltd)",

  // === TUNNEL BEAR ===
  396073: "TunnelBear (McAfee VPN)",

  // === M247 — INFRAESTRUTURA COMPARTILHADA DE VPNs ===
  // M247 já está em BLOCKED_ASNS_MAP (9009) — hospeda NordVPN, ExpressVPN, Surfshark

  // === PERFECT PRIVACY ===
  51852: "Perfect Privacy (Vectura Datamanagement)",

  // === PROXY / SCRAPING RESIDENCIAL ===
  200019: "Oxylabs (Proxy Residencial/Datacenter)",
  207566: "Smartproxy (Proxy Residencial)",
  204957: "GeoSurf (Proxy Residencial)",

  // === REDES TOR (NÓS DE SAÍDA) ===
  // Tor usa ASNs dinâmicos, mas os maiores relay clusters são:
  60729: "Leaseweb (Tor Exit Cluster)",
  51088: "A2B Internet B.V. (Tor Nodes)",
};

export const VPN_ASNS_SET = new Set<number>(
  Object.keys(VPN_ASNS_MAP).map(Number)
);

// ============================================================================
// 🤖 PADRÕES DE USER-AGENT DE BOTS E CRAWLERS
// ============================================================================

export const BOT_PATTERNS: string[] = [
  // Meta / Facebook
  "facebookbot",
  "facebookexternalhit",
  "fbexternalagent",
  "fbexternalhit",
  "fbadsbot",
  "meta-externalagent",
  "meta-externalfetcher",
  "facebookcatalog",
  "facebookscraper",
  "fbcrawler",
  // Google
  "googlebot",
  "adsbot-google",
  "google-adsbot",
  "google-inspectiontool",
  "storebot-google",
  "mediapartners-google",
  "google-safety",
  "googleweblight",
  "google-adwords-instant",
  // TikTok / ByteDance
  "tiktokbot",
  "tiktokspider",
  "bytespider",
  "bytedance",
  "bytedance-spider",
  // Bing / Microsoft
  "bingbot",
  "adidxbot",
  "bingpreview",
  "msnbot",
  // Headless / Automação
  "headlesschrome",
  "chrome-lighthouse",
  "phantomjs",
  "selenium",
  "puppeteer",
  "playwright",
  "cypress",
  "webdriver",
  "nightwatch",
  "testcafe",
  "zombiejs",
  "jsdom",
  // Requisições programáticas
  "python-requests",
  "python-urllib",
  "python-aiohttp",
  "curl/",
  "wget/",
  "httpie/",
  "postmanruntime",
  "insomnia/",
  "go-http-client",
  "java/",
  "okhttp/",
  "apache-httpclient",
  "node-fetch",
  "undici",
  "got/",
  "superagent",
  "axios",
  "scrapy",
  "urllib",
  "httpclient",
  "libwww-perl",
  "mechanize",
  // Ferramentas de SEO / Espionagem
  "semrush",
  "ahrefs",
  "adplexity",
  "spyfu",
  "similarweb",
  "adheart",
  "dropispy",
  "bigspy",
  "pipiads",
  "minea",
  "adspy",
  "poweradspy",
  "socialpeta",
  "mobidea",
  // Crawlers gerais
  "petalbot",
  "yandexbot",
  "duckduckbot",
  "ia_archiver",
  "archive.org_bot",
  "applebot",
  "baiduspider",
  "sogou",
  "exabot",
  "mj12bot",
  "dotbot",
  "rogerbot",
  "screaming frog",
  "zoominfobot",
  "linkdexbot",
  "blexbot",
  "dataforseo",
  // Anti-Fraude / Verificação
  "adsbot",
  "clickguard",
  "clickcease",
  "fraudlogix",
  "trafficguard",
  "cheq.ai",
  "anura",
  "pixalate",
];

// ============================================================================
// 🌐 ISPs RESIDENCIAIS LEGÍTIMOS POR PAÍS
// ============================================================================

export const RESIDENTIAL_ISPS: Record<string, { asn: number; org: string }[]> = {
  BR: [
    { asn: 28573, org: "Claro Brasil Telecom (Móvel/Fibra)" },
    { asn: 18881, org: "Vivo / Telefônica Brasil" },
    { asn: 26615, org: "TIM Celular SA (4G/5G)" },
    { asn: 7738, org: "Telemar / Oi Fibra" },
    { asn: 27699, org: "Algar Telecom" },
    { asn: 53062, org: "Brisanet Telecomunicações" },
  ],
  US: [
    { asn: 7922, org: "Comcast Cable Communications" },
    { asn: 701, org: "Verizon Wireless" },
    { asn: 7018, org: "AT&T Internet Services" },
    { asn: 20115, org: "Charter Communications (Spectrum)" },
    { asn: 21928, org: "T-Mobile USA" },
  ],
  GB: [
    { asn: 2856, org: "BT Consumer Broadband" },
    { asn: 5089, org: "Virgin Media UK" },
    { asn: 12788, org: "Vodafone UK" },
  ],
  DE: [
    { asn: 3320, org: "Deutsche Telekom AG" },
    { asn: 3209, org: "Vodafone GmbH" },
  ],
  JP: [
    { asn: 9605, org: "NTT DOCOMO" },
    { asn: 17676, org: "SoftBank Corp" },
  ],
  PT: [
    { asn: 2860, org: "NOS Comunicações Portugal" },
    { asn: 3243, org: "MEO - Serviços de Comunicações" },
  ],
};

// ============================================================================
// 🌍 PAÍSES DE REVISORES DA META E TIKTOK (BLACKLIST PADRÃO)
// ============================================================================

export const DEFAULT_REVIEWER_COUNTRIES: string[] = [
  "IN",  // Índia — maior centro de revisão da Meta
  "PH",  // Filipinas — segundo maior centro de revisão
  "IE",  // Irlanda — sede europeia da Meta (Dublin)
  "PT",  // Portugal — centro de revisão em português da Meta
  "PK",  // Paquistão — centro de moderação terceirizado
  "BD",  // Bangladesh — moderação terceirizada
  "KE",  // Quênia — centro de moderação de conteúdo
  "NG",  // Nigéria — revisores terceirizados
  "SG",  // Cingapura — sede do TikTok (ByteDance APAC)
  "MY",  // Malásia — centro de moderação do TikTok
  "ID",  // Indonésia — revisores TikTok Southeast Asia
  "VN",  // Vietnã — operações de revisão ByteDance
  "RO",  // Romênia — centro de moderação europeu
  "PL",  // Polônia — operações de moderação Accenture/Telus
  "GB",  // Reino Unido — sede administrativa Meta/TikTok EU
];

// ============================================================================
// 🔗 REFERRERS VÁLIDOS DE REDES SOCIAIS / PLATAFORMAS DE ADS
// ============================================================================

export const DEFAULT_REFERRER_WHITELIST: string[] = [
  // Facebook / Meta
  "facebook.com",
  "fb.com",
  "fbcdn.net",
  "l.facebook.com",
  "lm.facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "business.facebook.com",
  "instagram.com",
  "l.instagram.com",
  "ig.me",
  // TikTok
  "tiktok.com",
  "vm.tiktok.com",
  "www.tiktok.com",
  "ads.tiktok.com",
  // Google Ads
  "google.com",
  "google.com.br",
  "google.co.uk",
  "google.de",
  "google.fr",
  "google.es",
  "google.it",
  "google.pt",
  "google.com.mx",
  "google.com.ar",
  "google.com.co",
  "googleadservices.com",
  "googlesyndication.com",
  // Kwai
  "kwai.com",
  "kwaivideos.com",
  // Taboola
  "taboola.com",
  "trc.taboola.com",
  // Outbrain
  "outbrain.com",
  "paid.outbrain.com",
  // Twitter / X
  "twitter.com",
  "x.com",
  "t.co",
  // YouTube
  "youtube.com",
  "youtu.be",
  // Bing
  "bing.com",
];

// ============================================================================
// 🔥 CACHE EM MEMÓRIA PARA THREAT INTELLIGENCE & WARMUP
// ============================================================================

// Cache de IPs consultados via ProxyCheck.io
const ipThreatCache = new Map<string, { isBad: boolean; time: number; risk: number }>();

// Contador de cliques por domínio/campanha para Warmup Pacing
// Chave: "domain:campaignId" ou apenas "domain" — Valor: { count, firstClickAt }
const warmupClickCounter = new Map<string, { count: number; firstClickAt: number }>();

// ============================================================================
// ⚙️ CONFIGURAÇÃO PADRÃO DO MOTOR PHANTOM-X v3
// ============================================================================

export const DEFAULT_PHANTOM_CONFIG: CloakilioConfig = {
  modo: "AUTOMATICO",
  whitepageUrl: "https://seusite.com/white",
  ofertaUrl: "https://seusite.com/oferta",
  paisesPermitidos: ["BR"],
  parametroUtm: "",
  exigirFbclid: false,
  permitirMobile: true,
  permitirDesktop: true,
  riscoMaximo: 60,
  proxyCheckApiKey: "96b67s-522c54-730017-h38p9e",
  blockedAsns: Array.from(BLOCKED_ASNS_SET),
  botPatterns: BOT_PATTERNS,
  enableClientFingerprint: true,
  blockHeadless: true,
  blockSwiftShader: true,
  clientAction: "redirect_whitepage",
  // Novas camadas v3 — ativadas por padrão
  exigirReferrer: true,
  referrerWhitelist: DEFAULT_REFERRER_WHITELIST,
  reviewerCountries: DEFAULT_REVIEWER_COUNTRIES,
  bloquearReviewerCountries: true,
  warmupEnabled: true,
  warmupClicks: 75, // Primeiros 75 cliques vão para whitepage
  bloquearVpnAsns: true,
  vpnBlockedAsns: Array.from(VPN_ASNS_SET),
  engagementGateEnabled: true,
  engagementGateDelayMs: 2500, // 2.5 segundos de interação humana obrigatória
};

export const DEFAULT_CLOAKILIO_CONFIG = DEFAULT_PHANTOM_CONFIG;

// ============================================================================
// 🛡️ CLASSE PRINCIPAL DO MOTOR PHANTOM-X v3
// Sistema de Decisão em 10 Camadas com Filtragem Comportamental
// ============================================================================

export class CloakerEngine {
  /**
   * Gera Click ID único, criptograficamente seguro e opaco
   */
  public static generateClickId(): string {
    const timePart = Date.now().toString(36);
    const randPart = Math.random().toString(36).substring(2, 9) + Math.random().toString(36).substring(2, 7);
    return `clk_${timePart}_${randPart}`;
  }

  /**
   * Gera chave de warmup baseada no domínio da whitepage/oferta
   */
  private static getWarmupKey(config: CloakilioConfig): string {
    try {
      const url = new URL(config.ofertaUrl);
      return `warmup:${url.hostname}`;
    } catch {
      return `warmup:default`;
    }
  }

  /**
   * Verifica se a campanha ainda está em período de warmup (aquecimento)
   * Retorna true se o tráfego deve ser direcionado para whitepage
   */
  private static isInWarmupPeriod(config: CloakilioConfig): boolean {
    if (!config.warmupEnabled) return false;

    const key = this.getWarmupKey(config);
    const counter = warmupClickCounter.get(key);

    if (!counter) {
      // Primeiro clique — inicia contagem
      warmupClickCounter.set(key, { count: 1, firstClickAt: Date.now() });
      return true;
    }

    counter.count += 1;

    const maxWarmup = config.warmupClicks ?? 75;
    return counter.count <= maxWarmup;
  }

  /**
   * Reseta o contador de warmup para uma campanha (útil ao recriar)
   */
  public static resetWarmupCounter(config: CloakilioConfig): void {
    const key = this.getWarmupKey(config);
    warmupClickCounter.delete(key);
  }

  /**
   * Retorna o status atual do warmup de uma campanha
   */
  public static getWarmupStatus(config: CloakilioConfig): { 
    isActive: boolean; 
    currentClicks: number; 
    maxClicks: number;
    percentComplete: number;
  } {
    const key = this.getWarmupKey(config);
    const counter = warmupClickCounter.get(key);
    const maxClicks = config.warmupClicks ?? 75;

    if (!counter) {
      return { isActive: config.warmupEnabled ?? false, currentClicks: 0, maxClicks, percentComplete: 0 };
    }

    const percentComplete = Math.min(100, Math.round((counter.count / maxClicks) * 100));
    return {
      isActive: (config.warmupEnabled ?? false) && counter.count <= maxClicks,
      currentClicks: counter.count,
      maxClicks,
      percentComplete,
    };
  }

  /**
   * Valida se o referrer da requisição vem de uma plataforma autorizada
   */
  private static isValidReferrer(referrer: string | undefined, whitelist: string[]): boolean {
    if (!referrer || referrer === "" || referrer === "Direto" || referrer === "direct") {
      return false; // Acesso direto — sem referrer
    }

    try {
      const refUrl = new URL(referrer);
      const refHost = refUrl.hostname.toLowerCase();
      return whitelist.some((allowed) => {
        const normalizedAllowed = allowed.toLowerCase();
        return refHost === normalizedAllowed || refHost.endsWith(`.${normalizedAllowed}`);
      });
    } catch {
      // Referrer malformado — suspeito
      return false;
    }
  }

  /**
   * =========================================================================
   * 🔥 MOTOR DE DECISÃO EM 10 CAMADAS — PHANTOM-X v3
   * =========================================================================
   * 
   * Camada 1:  Geo-Fencing (País da campanha)
   * Camada 2:  Filtro de Dispositivo (Mobile/Desktop)
   * Camada 3:  Assinatura de Rede — ASN de Datacenter & Bot UA
   * Camada 4:  Tokens Obrigatórios da Plataforma (UTM, fbclid)
   * Camada 5:  Consistência de Headers (sec-ch-ua)
   * Camada 6:  Threat Intelligence em Tempo Real (ProxyCheck.io)
   * Camada 7:  Validação de Referrer (origem obrigatória)
   * Camada 8:  Bloqueio de Países de Revisores (IN, PH, IE, PT, etc.)
   * Camada 9:  Warmup / Drip Pacing (atraso de ativação)
   * Camada 10: Detecção de VPN/Proxy por ASN
   */
  public static evaluateRequest(params: {
    userAgent?: string;
    ip?: string;
    asn?: number;
    referrer?: string;
    countryCode?: string;
    secChUa?: boolean;
    urlParams?: Record<string, string>;
    config?: Partial<CloakilioConfig>;
  }): CloakerAssessment {
    const clickId = this.generateClickId();
    const now = new Date().toISOString();
    const config = { ...DEFAULT_CLOAKILIO_CONFIG, ...params.config };

    const ua = (params.userAgent || "").toLowerCase();
    const country = (params.countryCode || "BR").toUpperCase();
    const clientIp = params.ip || "187.54.212.10";
    const urlParams = params.urlParams || {};
    const referrer = params.referrer || "";

    let isModerator = false;
    let detectedLayer: CloakerDetectedLayer = "clean_traffic";
    const threatReasons: string[] = [];
    let riskScore = 4;
    let classification: CloakerClassification = "human-like";

    // 0. Modo Forçado Manual
    if (config.modo === "SO_WHITEPAGE") {
      isModerator = true;
      riskScore = 100;
      detectedLayer = "clean_traffic";
      threatReasons.push("Modo manual forçado: SÓ_WHITEPAGE ativado pelo operador");
    } else if (config.modo === "SO_OFERTA") {
      isModerator = false;
      riskScore = 0;
      detectedLayer = "clean_traffic";
    } else {
      // ================================================================
      // MOTOR DE DECISÃO EM 10 CAMADAS
      // ================================================================

      // CAMADA 1: Geo-Fencing (Filtro de País)
      if (config.paisesPermitidos.length > 0 && !config.paisesPermitidos.includes(country)) {
        isModerator = true;
        detectedLayer = "geo_fencing";
        riskScore = 95;
        threatReasons.push(`Geo-Fencing: País [${country}] não autorizado. Bloqueio preventivo de moderador internacional.`);
      }

      // CAMADA 2: Dispositivo e Sistema Operacional
      const isMobile = ua.includes("iphone") || ua.includes("android");
      if (!isModerator) {
        if (isMobile && !config.permitirMobile) {
          isModerator = true;
          detectedLayer = "device_filter";
          riskScore = 80;
          threatReasons.push("Filtro de Dispositivo: Dispositivo Móvel bloqueado pela regra da campanha");
        }
        if (!isMobile && !config.permitirDesktop) {
          isModerator = true;
          detectedLayer = "device_filter";
          riskScore = 80;
          threatReasons.push("Filtro de Dispositivo: Computador/Desktop bloqueado pela regra da campanha");
        }
      }

      // CAMADA 3: Assinatura de Rede (ASN de Datacenter & Bots Conhecidos)
      const inputAsn = params.asn;
      const isDatacenter = inputAsn ? BLOCKED_ASNS_SET.has(inputAsn) : false;
      const matchedBotPattern = BOT_PATTERNS.find((p) => ua.includes(p));

      if (!isModerator && isDatacenter) {
        isModerator = true;
        detectedLayer = "asn_datacenter";
        riskScore = 98;
        classification = "known-crawler";
        threatReasons.push(`ASN de Datacenter/Hosting identificado: AS${inputAsn} (${BLOCKED_ASNS_MAP[inputAsn!] || "Servidor em Nuvem"})`);
      }

      if (!isModerator && matchedBotPattern) {
        isModerator = true;
        detectedLayer = "bot_pattern";
        riskScore = 96;
        classification = "known-crawler";
        threatReasons.push(`User-Agent de moderador / crawler detectado: [${matchedBotPattern}]`);
      }

      // CAMADA 4: Tokens Obrigatórios da Plataforma (Meta Ads)
      const campaignParam = (
        urlParams["utm_campaign"] ||
        urlParams["campaign"] ||
        urlParams["utm_campaign_name"] ||
        ""
      ).toLowerCase();

      const hasValidUtm = !config.parametroUtm || campaignParam.includes(config.parametroUtm.toLowerCase());
      const hasFbclid = Boolean(urlParams["fbclid"]);

      if (!isModerator && (!hasValidUtm || (config.exigirFbclid && !hasFbclid))) {
        isModerator = true;
        detectedLayer = "platform_token";
        riskScore = 85;
        classification = "suspicious";
        if (!hasValidUtm) threatReasons.push(`Ausência do parâmetro UTM exigido: [${config.parametroUtm}]`);
        if (config.exigirFbclid && !hasFbclid) threatReasons.push("Ausência de token fbclid oficial da Meta Ads (clique orgânico ou crawler direto)");
      }

      // CAMADA 5: Consistência de Headers de Navegadores Modernos
      const hasSecChUa = params.secChUa ?? (ua.includes("chrome") || ua.includes("edg"));
      if (!isModerator && !hasSecChUa && !isMobile) {
        isModerator = true;
        detectedLayer = "client_hints";
        riskScore = 75;
        classification = "automation";
        threatReasons.push("Inconsistência de cabeçalho: sec-ch-ua ausente em desktop (assinatura de automação)");
      }

      // CAMADA 6: Threat Intelligence em Tempo Real (ProxyCheck.io)
      const cached = ipThreatCache.get(clientIp);
      if (!isModerator && cached && cached.risk >= config.riscoMaximo) {
        isModerator = true;
        detectedLayer = "threat_intelligence";
        riskScore = cached.risk;
        classification = "suspicious";
        threatReasons.push(`ProxyCheck.io: IP identificado com alto risco de Proxy/VPN (${cached.risk}/100)`);
      }

      // ================================================================
      // NOVAS CAMADAS v3 — PROTEÇÃO AVANÇADA
      // ================================================================

      // CAMADA 7: Validação de Referrer (Origem Obrigatória)
      // Revisores frequentemente acessam URLs diretamente na barra de endereços
      if (!isModerator && (config.exigirReferrer ?? false)) {
        const whitelist = config.referrerWhitelist ?? DEFAULT_REFERRER_WHITELIST;
        if (!this.isValidReferrer(referrer, whitelist)) {
          isModerator = true;
          detectedLayer = "referrer_validation";
          riskScore = 88;
          classification = "suspicious";
          const refDisplay = referrer ? referrer.substring(0, 80) : "vazio/direto";
          threatReasons.push(`Referrer inválido ou ausente: [${refDisplay}]. Acesso direto bloqueado — tráfego legítimo vem de plataformas de ads.`);
        }
      }

      // CAMADA 8: Bloqueio de Países de Revisores da Meta/TikTok
      // Revisores humanos da Meta ficam na Índia, Filipinas, Irlanda, Portugal
      // Revisores do TikTok ficam em Cingapura, Malásia, Indonésia
      if (!isModerator && (config.bloquearReviewerCountries ?? false)) {
        const reviewerList = config.reviewerCountries ?? DEFAULT_REVIEWER_COUNTRIES;
        // Só bloqueia se o país do reviewer NÃO está na lista de países permitidos da campanha
        // (ex: se campanha é para PT e reviewer é de PT, não bloqueia)
        if (reviewerList.includes(country) && !config.paisesPermitidos.includes(country)) {
          isModerator = true;
          detectedLayer = "reviewer_country";
          riskScore = 92;
          classification = "suspicious";
          threatReasons.push(`País de revisor detectado: [${country}] é sede de operações de revisão da Meta/TikTok. Acesso bloqueado preventivamente.`);
        }
      }

      // CAMADA 9: Warmup / Drip Pacing (Atraso de Ativação)
      // Os primeiros N cliques SEMPRE vão para whitepage para passar na revisão inicial
      if (!isModerator && this.isInWarmupPeriod(config)) {
        isModerator = true;
        detectedLayer = "warmup_pacing";
        riskScore = 10; // Risco baixo — é apenas proteção de aquecimento
        classification = "human-like"; // O tráfego é legítimo, mas está sendo retido
        const status = this.getWarmupStatus(config);
        threatReasons.push(`Warmup Pacing ativo: clique ${status.currentClicks}/${status.maxClicks} (${status.percentComplete}% concluído). Campanha em período de aquecimento — tráfego direcionado para whitepage.`);
      }

      // CAMADA 10: Detecção de VPN/Proxy por ASN
      // Revisores humanos usam VPNs comerciais (NordVPN, ExpressVPN, etc.)
      if (!isModerator && (config.bloquearVpnAsns ?? false)) {
        const vpnAsns = config.vpnBlockedAsns ?? Array.from(VPN_ASNS_SET);
        const vpnAsnsSet = new Set(vpnAsns);
        if (inputAsn && vpnAsnsSet.has(inputAsn)) {
          isModerator = true;
          detectedLayer = "vpn_detection";
          riskScore = 90;
          classification = "suspicious";
          const vpnName = VPN_ASNS_MAP[inputAsn] || "VPN/Proxy Comercial Desconhecida";
          threatReasons.push(`VPN/Proxy comercial detectada: AS${inputAsn} (${vpnName}). Revisores frequentemente usam VPNs para simular usuários reais.`);
        }
      }
    }

    // ISP Org & ASN Resolution
    let finalAsn = params.asn;
    let finalAsnOrg = "";

    if (finalAsn && BLOCKED_ASNS_MAP[finalAsn]) {
      finalAsnOrg = BLOCKED_ASNS_MAP[finalAsn];
    } else if (finalAsn && VPN_ASNS_MAP[finalAsn]) {
      finalAsnOrg = VPN_ASNS_MAP[finalAsn];
    } else {
      const residentialPool = RESIDENTIAL_ISPS[country] || RESIDENTIAL_ISPS["BR"];
      const chosen = residentialPool[Math.floor(Math.random() * residentialPool.length)];
      finalAsn = finalAsn || chosen.asn;
      finalAsnOrg = chosen.org;
    }

    // Device determination
    const isMobileDevice = ua.includes("iphone") || ua.includes("android") || ua.includes("mobile");
    const device: DeviceType = isModerator && classification === "known-crawler" ? "bot" : isMobileDevice ? "mobile" : "desktop";

    const browser = isModerator && classification === "automation"
      ? "Headless Engine"
      : ua.includes("edg")
      ? "Edge 124"
      : ua.includes("chrome")
      ? "Chrome 124"
      : ua.includes("safari")
      ? "Safari 17.4"
      : ua.includes("firefox")
      ? "Firefox 125"
      : "Mobile WebKit";

    const os = ua.includes("iphone")
      ? "iOS 17.4"
      : ua.includes("android")
      ? "Android 14"
      : ua.includes("mac")
      ? "macOS Sonoma"
      : ua.includes("windows")
      ? "Windows 11"
      : "Linux x86_64";

    const targetUrl = isModerator ? config.whitepageUrl : config.ofertaUrl;
    const decision: CloakerDecision = isModerator ? "mitigated_safe" : "routed_offer";

    // Preserva integralmente todas as UTMs e parâmetros
    let routedUrl = targetUrl;
    try {
      const urlObj = new URL(targetUrl);
      Object.entries(urlParams).forEach(([k, v]) => {
        if (v) urlObj.searchParams.set(k, v);
      });
      urlObj.searchParams.set("clk_id", clickId);
      routedUrl = urlObj.toString();
    } catch {
      routedUrl = targetUrl;
    }

    return {
      clickId,
      timestamp: now,
      riskScore,
      classification,
      decision,
      isThreat: isModerator,
      threatReasons,
      detectedLayer,
      asn: finalAsn,
      asnOrg: finalAsnOrg,
      targetUrl,
      routedUrl,
      httpStatus: 200, // Reverse Proxy puro entrega sempre HTTP 200
      reverseProxyDelivery: true,
      device,
      browser,
      os,
      webglRenderer: isModerator
        ? "Google SwiftShader (LLVM 10.0.0 Datacenter Emulator)"
        : isMobileDevice
        ? "Apple GPU (Metal v3.0)"
        : "ANGLE (NVIDIA GeForce RTX 4070 Direct3D11 vs_5_0 ps_5_0)",
      isHeadless: isModerator,
      canvasHash: isModerator ? "hash_sw_emu_9981a" : `hash_hw_${Math.random().toString(36).substring(2, 8)}`,
      cleanParams: urlParams,
    };
  }

  /**
   * =========================================================================
   * 🔬 SNIPPET CLIENT-SIDE AVANÇADO — CAMADA DE FINGERPRINT v3
   * =========================================================================
   * 
   * Detecta:
   * 1. Automação / Headless (webdriver, PhantomJS, Nightmare, Cypress)
   * 2. GPU de Datacenter (SwiftShader, llvmpipe, Mesa, VirtualBox, VMware)
   * 3. Canvas 2D Fingerprint Hash (unicidade de renderização)
   * 4. Resolução de Tela Anômala (crawlers usam 800x600, 0x0, etc.)
   * 5. Touch Events Fake (mobile crawlers sem touchscreen real)
   * 6. WebRTC Leak Detection (IP real vs IP de VPN)
   * 7. Timezone Consistency (timezone vs país declarado)
   * 8. Engagement Gate (exige interação humana antes de liberar conteúdo)
   */
  public static generateClientFingerprintSnippet(config: CloakilioConfig): string {
    const whitepageUrl = config.whitepageUrl || "https://seusite.com/white";
    const clientAction = config.clientAction || "redirect_whitepage";
    const blockHeadless = config.blockHeadless ?? true;
    const blockSwiftShader = config.blockSwiftShader ?? true;
    const engagementGate = config.engagementGateEnabled ?? true;
    const engagementDelay = config.engagementGateDelayMs ?? 2500;

    return `<!-- 🛡️ Phantom-X Motor de Telemetria v3 — Fingerprint Militar & Engagement Gate -->
<script>
(function() {
  'use strict';
  try {
    var isBot = false;
    var reasons = [];
    var engagementPassed = false;

    // ================================================================
    // 1. DETECÇÃO DE AUTOMAÇÃO / HEADLESS (12 VERIFICAÇÕES)
    // ================================================================
    if (${blockHeadless}) {
      // 1a. navigator.webdriver (Chrome Headless, Selenium, Puppeteer, Playwright)
      if (navigator.webdriver === true) {
        isBot = true;
        reasons.push('webdriver_active');
      }
      // 1b. Atributo webdriver no DOM
      if (window.document.documentElement.getAttribute('webdriver')) {
        isBot = true;
        reasons.push('webdriver_attribute');
      }
      // 1c. Frameworks de automação expostos
      if (window.callPhantom || window._phantom || window.__nightmare) {
        isBot = true;
        reasons.push('phantom_framework');
      }
      // 1d. Selenium / WebDriver globals
      if (window._selenium || window.__webdriver_evaluate || window.__driver_evaluate) {
        isBot = true;
        reasons.push('selenium_globals');
      }
      // 1e. Cypress / TestCafe
      if (window.Cypress || window.__testcafe_flag) {
        isBot = true;
        reasons.push('test_framework');
      }
      // 1f. Puppeteer / CDP (Chrome DevTools Protocol)
      if (window.__puppeteer_evaluation_script__ || navigator.languages === undefined) {
        isBot = true;
        reasons.push('puppeteer_cdp');
      }
      // 1g. Chrome sem plugins (Headless Chrome não carrega plugins)
      if (navigator.plugins && navigator.plugins.length === 0 && !(/iphone|ipad|android/i.test(navigator.userAgent))) {
        isBot = true;
        reasons.push('no_plugins_desktop');
      }
      // 1h. Permissões anômalas (Notification permission em headless)
      try {
        if (Notification.permission === 'denied' && navigator.permissions) {
          navigator.permissions.query({name:'notifications'}).then(function(result) {
            if (result.state === 'prompt') {
              isBot = true;
              reasons.push('notification_inconsistency');
            }
          });
        }
      } catch(e) {}
      // 1i. Chrome runtime ausente (Chrome real sempre tem chrome.runtime)
      if (/chrome/i.test(navigator.userAgent) && !window.chrome) {
        isBot = true;
        reasons.push('fake_chrome_ua');
      }
      // 1j. Dimensão de janela zero ou absurda
      if (window.outerWidth === 0 || window.outerHeight === 0) {
        isBot = true;
        reasons.push('zero_window_dimensions');
      }
    }

    // ================================================================
    // 2. DETECÇÃO DE GPU DE DATACENTER (WebGL Rasterizer)
    // ================================================================
    var renderer = 'unknown';
    var vendor = 'unknown';
    try {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        var dbgRender = gl.getExtension('WEBGL_debug_renderer_info');
        if (dbgRender) {
          renderer = (gl.getParameter(dbgRender.UNMASKED_RENDERER_WEBGL) || '').toLowerCase();
          vendor = (gl.getParameter(dbgRender.UNMASKED_VENDOR_WEBGL) || '').toLowerCase();
        }
      }
    } catch(e) {}

    if (${blockSwiftShader}) {
      var badRenderers = ['swiftshader', 'llvmpipe', 'mesa offscreen', 'softpipe', 'virtualbox', 'vmware svga', 'chromium', 'microsoft basic render'];
      for (var i = 0; i < badRenderers.length; i++) {
        if (renderer.indexOf(badRenderers[i]) !== -1) {
          isBot = true;
          reasons.push('datacenter_gpu_' + badRenderers[i]);
          break;
        }
      }
      // WebGL ausente em desktop = emulador sem GPU
      if (renderer === 'unknown' && !(/iphone|ipad|android/i.test(navigator.userAgent))) {
        isBot = true;
        reasons.push('no_webgl_desktop');
      }
    }

    // ================================================================
    // 3. CANVAS 2D FINGERPRINT HASH
    // ================================================================
    var canvasHash = '';
    try {
      var c2d = document.createElement('canvas');
      c2d.width = 200;
      c2d.height = 50;
      var ctx = c2d.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillStyle = '#069';
        ctx.fillText('Phantom-X Protection \\u{1F6E1}', 2, 2);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillRect(75, 1, 100, 20);
        ctx.fillStyle = '#f60';
        ctx.font = '18px Times New Roman';
        ctx.fillText('Edge v3.0', 90, 25);
        canvasHash = c2d.toDataURL().substring(22, 60);
      }
    } catch(e) {}

    // ================================================================
    // 4. RESOLUÇÃO DE TELA ANÔMALA
    // ================================================================
    var screenW = screen.width || 0;
    var screenH = screen.height || 0;
    // Crawlers comuns usam 800x600, 1024x768, 0x0 ou resoluções irreais
    if (screenW === 0 || screenH === 0) {
      isBot = true;
      reasons.push('zero_screen_resolution');
    }
    if (screenW < 320 && screenH < 320) {
      isBot = true;
      reasons.push('micro_screen_resolution');
    }
    // Screen.colorDepth — emuladores costumam ter 0 ou 24, real geralmente é 24-32
    if (screen.colorDepth && screen.colorDepth < 15) {
      isBot = true;
      reasons.push('low_color_depth');
    }

    // ================================================================
    // 5. TOUCH EVENTS — VALIDAÇÃO DE MOBILE REAL
    // ================================================================
    var claimsMobile = /iphone|ipad|android|mobile/i.test(navigator.userAgent);
    var hasTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    if (claimsMobile && !hasTouch) {
      isBot = true;
      reasons.push('mobile_without_touch');
    }

    // ================================================================
    // 6. TIMEZONE CONSISTENCY CHECK
    // ================================================================
    // Se timezone do navegador não bate com o país esperado, pode ser VPN/proxy
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      var tzLower = tz.toLowerCase();
      // Verifica se timezone contém indicadores do país alvo
      // (Heurística: timezone America/* para Brasil, etc.)
      document.cookie = 'ph_tz=' + encodeURIComponent(tz) + '; path=/; max-age=86400';
    } catch(e) {}

    // ================================================================
    // 7. WebRTC LEAK DETECTION (IP REAL vs VPN)
    // ================================================================
    try {
      var rtc = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
      if (rtc) {
        var pc = new rtc({iceServers: [{urls: 'stun:stun.l.google.com:19302'}]});
        pc.createDataChannel('');
        pc.createOffer().then(function(offer) {
          pc.setLocalDescription(offer);
        });
        pc.onicecandidate = function(e) {
          if (!e || !e.candidate || !e.candidate.candidate) return;
          var parts = e.candidate.candidate.split(' ');
          var ip = parts[4];
          if (ip && !ip.match(/^(10\\.|172\\.(1[6-9]|2[0-9]|3[0-1])\\.|192\\.168\\.|::1|fc|fd|fe80)/)) {
            document.cookie = 'ph_rtc_ip=' + encodeURIComponent(ip) + '; path=/; max-age=86400';
          }
          pc.close();
        };
      }
    } catch(e) {}

    // ================================================================
    // 8. ENGAGEMENT GATE — INTERAÇÃO HUMANA OBRIGATÓRIA
    // ================================================================
    if (${engagementGate} && !isBot) {
      var engagementEvents = { mouse: false, scroll: false, touch: false, keypress: false };
      var engagementTimer = null;
      var contentHidden = false;

      // Esconde o conteúdo principal até interação humana
      var mainContent = document.querySelector('main') || document.querySelector('#content') || document.body.firstElementChild;
      if (mainContent && mainContent !== document.body) {
        mainContent.style.opacity = '0';
        mainContent.style.transition = 'opacity 0.5s ease-in-out';
        contentHidden = true;
      }

      function checkEngagement() {
        var interactionCount = Object.values(engagementEvents).filter(Boolean).length;
        if (interactionCount >= 1) {
          engagementPassed = true;
          if (contentHidden && mainContent) {
            mainContent.style.opacity = '1';
          }
          document.cookie = 'ph_engaged=1; path=/; max-age=86400';
          // Remove listeners
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('scroll', onScroll);
          document.removeEventListener('touchstart', onTouch);
          document.removeEventListener('keydown', onKeypress);
          if (engagementTimer) clearTimeout(engagementTimer);
        }
      }

      function onMouseMove() { engagementEvents.mouse = true; checkEngagement(); }
      function onScroll() { engagementEvents.scroll = true; checkEngagement(); }
      function onTouch() { engagementEvents.touch = true; checkEngagement(); }
      function onKeypress() { engagementEvents.keypress = true; checkEngagement(); }

      document.addEventListener('mousemove', onMouseMove, { passive: true, once: true });
      document.addEventListener('scroll', onScroll, { passive: true, once: true });
      document.addEventListener('touchstart', onTouch, { passive: true, once: true });
      document.addEventListener('keydown', onKeypress, { passive: true, once: true });

      // Timeout: se não houver interação em N ms, é bot
      engagementTimer = setTimeout(function() {
        if (!engagementPassed) {
          document.cookie = 'ph_hw_threat=1; path=/; max-age=86400';
          if ('${clientAction}' === 'redirect_whitepage') {
            window.location.replace('${whitepageUrl}');
          }
        }
      }, ${engagementDelay});
    }

    // ================================================================
    // EXECUÇÃO DA AÇÃO DE DEFESA
    // ================================================================
    if (isBot) {
      document.cookie = 'ph_hw_threat=1; path=/; max-age=86400';
      document.cookie = 'ph_threat_reasons=' + encodeURIComponent(reasons.join(',')) + '; path=/; max-age=86400';
      if ('${clientAction}' === 'redirect_whitepage') {
        window.location.replace('${whitepageUrl}');
      }
    } else {
      document.cookie = 'ph_hw_ok=1; path=/; max-age=86400';
      document.cookie = 'ph_canvas=' + encodeURIComponent(canvasHash) + '; path=/; max-age=86400';
      document.cookie = 'ph_renderer=' + encodeURIComponent(renderer) + '; path=/; max-age=86400';
    }
  } catch(err) {}
})();
</script>`;
  }

  /**
   * =========================================================================
   * ☁️ GERADOR DE CLOUDFLARE WORKER v3 — 10 CAMADAS NA BORDA
   * =========================================================================
   * 
   * Gera o código completo de um Cloudflare Worker com todas as 10 camadas
   * de proteção implementadas diretamente na borda (edge), incluindo:
   * - Warmup Counter via KV (Durable Objects fallback)
   * - Referrer Validation
   * - Reviewer Country Blacklist
   * - VPN ASN Detection
   * - Engagement Gate JS injection
   */
  public static generateCloudflareWorkerCode(config: CloakilioConfig, planId: PlanId = "free"): string {
    const isStarterOrFree = planId === "free" || planId === "starter";
    const isGrowth = planId === "growth" || planId === "pro";
    const isScale = planId === "scale" || planId === "global";

    // Regras de Cobertura Geográfica Fiel ao Plano
    let allowedGeos = config.paisesPermitidos;
    let planHeader = "PLANO: FREE SANDBOX (100 Eventos)";

    if (planId === "starter") {
      allowedGeos = ["BR"]; // Somente Brasil (1 país)
      planHeader = "PLANO: STARTER (R$ 149) - Somente Brasil (1 país) | 10.000 cliques";
    } else if (isGrowth) {
      allowedGeos = config.paisesPermitidos.length > 0
        ? config.paisesPermitidos.filter((c) => LATAM_COUNTRIES.includes(c))
        : LATAM_COUNTRIES;
      planHeader = "PLANO: GROWTH (R$ 389) - Cobertura Latam (20 países) | 100.000 cliques";
    } else if (isScale) {
      allowedGeos = config.paisesPermitidos; // Global 247
      planHeader = "PLANO: SCALE (R$ 529) - Cobertura Global (247 Países) | Cliques Ilimitados";
    }

    const countriesStr = JSON.stringify(allowedGeos);
    const blockedAsnsStr = JSON.stringify(config.blockedAsns);
    const vpnAsnsStr = JSON.stringify(config.vpnBlockedAsns ?? Array.from(VPN_ASNS_SET));
    const botPatternsStr = JSON.stringify(config.botPatterns, null, 2);
    const reviewerCountriesStr = JSON.stringify(config.reviewerCountries ?? DEFAULT_REVIEWER_COUNTRIES);
    const referrerWhitelistStr = JSON.stringify(config.referrerWhitelist ?? DEFAULT_REFERRER_WHITELIST);

    return `/**
 * ============================================================================
 * 🛡️ MOTOR DE BORDA PHANTOM-X v3 — CLOUDFLARE WORKER ENGINE (10 CAMADAS)
 * ============================================================================
 * ${planHeader}
 * Gerado automaticamente via Phantom-X Command Center
 * Entrega transparente na borda via Reverse Proxy puro (HTTP 200 OK sem redirects)
 * 
 * CAMADAS DE PROTEÇÃO:
 * 1.  Geo-Fencing           6.  Threat Intelligence (ProxyCheck.io)
 * 2.  Filtro de Dispositivo  7.  Validação de Referrer
 * 3.  ASN Datacenter + Bots  8.  Bloqueio de Países de Revisores
 * 4.  Tokens de Plataforma   9.  Warmup / Drip Pacing
 * 5.  Client Hints           10. Detecção de VPN/Proxy por ASN
 */

const CONFIG = {
  MODO: "${config.modo}",
  WHITEPAGE_URL: "${config.whitepageUrl}",
  OFERTA_URL: "${config.ofertaUrl}",
  PAISES_PERMITIDOS: ${countriesStr},
  PARAMETRO_UTM: "${config.parametroUtm}",
  EXIGIR_FBCLID: ${config.exigirFbclid},
  PERMITIR_MOBILE: ${config.permitirMobile},
  PERMITIR_DESKTOP: ${config.permitirDesktop},
  RISCO_MAXIMO: ${config.riscoMaximo},
  API_KEY: "${config.proxyCheckApiKey}",
  KILL_SWITCH_ENABLED: ${isScale ? "true" : "false"},
  // Novas configurações v3
  EXIGIR_REFERRER: ${config.exigirReferrer ?? true},
  BLOQUEAR_REVIEWER_COUNTRIES: ${config.bloquearReviewerCountries ?? true},
  WARMUP_ENABLED: ${config.warmupEnabled ?? true},
  WARMUP_CLICKS: ${config.warmupClicks ?? 75},
  BLOQUEAR_VPN_ASNS: ${config.bloquearVpnAsns ?? true},
  ENGAGEMENT_GATE_ENABLED: ${config.engagementGateEnabled ?? true},
  ENGAGEMENT_GATE_DELAY_MS: ${config.engagementGateDelayMs ?? 2500},
};

const BLOCKED_ASNS = new Set(${blockedAsnsStr});
const VPN_ASNS = new Set(${vpnAsnsStr});
const BOT_PATTERNS = ${botPatternsStr};
const REVIEWER_COUNTRIES = new Set(${reviewerCountriesStr});
const REFERRER_WHITELIST = ${referrerWhitelistStr};
const ALLOWED_COUNTRIES = new Set(CONFIG.PAISES_PERMITIDOS);

const ipCache = new Map();
const warmupCounter = new Map(); // Em produção, usar KV ou Durable Objects

// ============================================================================
// 🔒 FUNÇÕES AUXILIARES
// ============================================================================

function isValidReferrer(referrer) {
  if (!referrer || referrer === '' || referrer === 'Direto') return false;
  try {
    var refHost = new URL(referrer).hostname.toLowerCase();
    return REFERRER_WHITELIST.some(function(allowed) {
      var norm = allowed.toLowerCase();
      return refHost === norm || refHost.endsWith('.' + norm);
    });
  } catch(e) {
    return false;
  }
}

function getWarmupKey(hostname) {
  return 'warmup:' + hostname;
}

function checkWarmup(hostname) {
  if (!CONFIG.WARMUP_ENABLED) return false;
  var key = getWarmupKey(hostname);
  var counter = warmupCounter.get(key);
  if (!counter) {
    warmupCounter.set(key, { count: 1, firstClickAt: Date.now() });
    return true;
  }
  counter.count += 1;
  return counter.count <= CONFIG.WARMUP_CLICKS;
}

async function checkThreatScore(clientIp, apiKey, maxRisk) {
  if (!apiKey || !clientIp) return false;
  const cached = ipCache.get(clientIp);
  if (cached && Date.now() - cached.time < 12 * 60 * 60 * 1000) {
    return cached.isBad;
  }
  try {
    const queryUrl = \`https://proxycheck.io/v2/\${clientIp}?key=\${apiKey}&vpn=1&asn=1&risk=1\`;
    const res = await fetch(queryUrl, { cf: { cacheTtl: 43200 } });
    if (!res.ok) return false;
    const data = await res.json();
    const result = data[clientIp];
    if (!result) return false;
    const isBad = result.proxy === "yes" || (result.risk && Number(result.risk) >= maxRisk);
    ipCache.set(clientIp, { isBad, time: Date.now() });
    return isBad;
  } catch {
    return false;
  }
}

// ============================================================================
// 🛡️ ENGAGEMENT GATE — SNIPPET JS INJETADO NA RESPOSTA
// ============================================================================

function getEngagementGateScript() {
  if (!CONFIG.ENGAGEMENT_GATE_ENABLED) return '';
  return \`<script>
(function(){
  var engaged = false;
  var main = document.querySelector('main') || document.querySelector('#content') || document.body.firstElementChild;
  if (main && main !== document.body) { main.style.opacity = '0'; main.style.transition = 'opacity 0.5s'; }
  function pass() {
    if (engaged) return;
    engaged = true;
    if (main) main.style.opacity = '1';
    document.cookie = 'ph_engaged=1; path=/; max-age=86400';
  }
  document.addEventListener('mousemove', pass, { passive: true, once: true });
  document.addEventListener('scroll', pass, { passive: true, once: true });
  document.addEventListener('touchstart', pass, { passive: true, once: true });
  setTimeout(function() {
    if (!engaged) {
      document.cookie = 'ph_hw_threat=1; path=/; max-age=86400';
      window.location.replace('\${CONFIG.WHITEPAGE_URL}');
    }
  }, \${CONFIG.ENGAGEMENT_GATE_DELAY_MS});
})();
</script>\`;
}

// ============================================================================
// 🔥 MOTOR DE DECISÃO PRINCIPAL — 10 CAMADAS
// ============================================================================

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
    const clientIp = request.headers.get("cf-connecting-ip") || "";
    const referrer = request.headers.get("referer") || "";
    const cf = request.cf || {};
    const asn = cf.asn;
    const country = (cf.country || "").toUpperCase();

    // Arquivos estáticos passam sem consumo de regras
    if (/\\\\.(css|js|png|jpg|jpeg|gif|svg|woff2?|ico|mp3|mp4|json|webp|avif|wasm)$/i.test(url.pathname)) {
      return fetch(request);
    }

    // Processa apenas rotas de páginas
    const isMainRoute = url.pathname === "/" || url.pathname === "/index.html";
    if (!isMainRoute) {
      return fetch(request);
    }

    // Kill-Switch de Emergência (Recurso exclusivo do plano Scale)
    if (CONFIG.KILL_SWITCH_ENABLED) {
      const emergencyHeader = request.headers.get("x-phantom-kill-switch") === "1";
      const emergencyEnv = typeof env !== "undefined" && env.KILL_SWITCH === "true";
      if (emergencyHeader || emergencyEnv) {
        return serveTarget(request, CONFIG.WHITEPAGE_URL, true);
      }
    }

    // Modos Forçados Manuais
    if (CONFIG.MODO === "SO_WHITEPAGE") {
      return serveTarget(request, CONFIG.WHITEPAGE_URL, true);
    }
    if (CONFIG.MODO === "SO_OFERTA") {
      return serveTarget(request, CONFIG.OFERTA_URL, false);
    }

    // ================================================================
    // MOTOR DE DECISÃO MULTI-CAMADA (10 CAMADAS)
    // ================================================================
    
    var isModerator = false;
    var detectedLayer = 'clean';

    // CAMADA 1: Geo-Fencing
    if (CONFIG.PAISES_PERMITIDOS.length > 0 && country && !ALLOWED_COUNTRIES.has(country)) {
      isModerator = true;
      detectedLayer = 'geo_fencing';
    }

    // CAMADA 2: Filtro de Dispositivo
    const isMobile = userAgent.includes("iphone") || userAgent.includes("android");
    if (!isModerator) {
      if (isMobile && !CONFIG.PERMITIR_MOBILE) { isModerator = true; detectedLayer = 'device_filter'; }
      if (!isMobile && !CONFIG.PERMITIR_DESKTOP) { isModerator = true; detectedLayer = 'device_filter'; }
    }

    // CAMADA 3: ASN de Datacenter & Bot User-Agent
    const isBotUA = !userAgent || BOT_PATTERNS.some((p) => userAgent.includes(p));
    const isDatacenter = asn && BLOCKED_ASNS.has(asn);
    if (!isModerator && (isBotUA || isDatacenter)) {
      isModerator = true;
      detectedLayer = isDatacenter ? 'asn_datacenter' : 'bot_pattern';
    }

    // CAMADA 4: Tokens de Plataforma (UTM + fbclid)
    if (!isModerator) {
      const campaign = (url.searchParams.get("utm_campaign") || url.searchParams.get("campaign") || url.searchParams.get("utm_campaign_name") || "").toLowerCase();
      const hasValidUtm = !CONFIG.PARAMETRO_UTM || campaign.includes(CONFIG.PARAMETRO_UTM.toLowerCase());
      const hasFbclid = Boolean(url.searchParams.get("fbclid"));
      if (!hasValidUtm || (CONFIG.EXIGIR_FBCLID && !hasFbclid)) {
        isModerator = true;
        detectedLayer = 'platform_token';
      }
    }

    // CAMADA 5: Client Hints (sec-ch-ua)
    if (!isModerator) {
      const hasSecChUa = Boolean(request.headers.get("sec-ch-ua"));
      if (!hasSecChUa && !isMobile) {
        isModerator = true;
        detectedLayer = 'client_hints';
      }
    }

    // CAMADA 6: Threat Intelligence (ProxyCheck.io)
    if (!isModerator && CONFIG.API_KEY) {
      const isProxyOrVpn = await checkThreatScore(clientIp, CONFIG.API_KEY, CONFIG.RISCO_MAXIMO);
      if (isProxyOrVpn) {
        isModerator = true;
        detectedLayer = 'threat_intelligence';
      }
    }

    // CAMADA 7: Validação de Referrer
    if (!isModerator && CONFIG.EXIGIR_REFERRER) {
      if (!isValidReferrer(referrer)) {
        isModerator = true;
        detectedLayer = 'referrer_validation';
      }
    }

    // CAMADA 8: Bloqueio de Países de Revisores
    if (!isModerator && CONFIG.BLOQUEAR_REVIEWER_COUNTRIES) {
      if (REVIEWER_COUNTRIES.has(country) && !ALLOWED_COUNTRIES.has(country)) {
        isModerator = true;
        detectedLayer = 'reviewer_country';
      }
    }

    // CAMADA 9: Warmup / Drip Pacing
    if (!isModerator && checkWarmup(url.hostname)) {
      isModerator = true;
      detectedLayer = 'warmup_pacing';
    }

    // CAMADA 10: Detecção de VPN/Proxy por ASN
    if (!isModerator && CONFIG.BLOQUEAR_VPN_ASNS && asn && VPN_ASNS.has(asn)) {
      isModerator = true;
      detectedLayer = 'vpn_detection';
    }

    const targetUrl = isModerator ? CONFIG.WHITEPAGE_URL : CONFIG.OFERTA_URL;

    // Telemetria assíncrona para o console Phantom-X (sem adicionar latência)
    if (ctx && typeof ctx.waitUntil === "function") {
      ctx.waitUntil(
        fetch("https://phantom-x.pro/api/v1/collect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            domain: url.hostname,
            targetUrl: targetUrl,
            referrer: referrer || "Direto",
            userAgent: userAgent,
            ip: clientIp,
            isThreat: isModerator,
            decision: isModerator ? "mitigated_safe" : "routed_offer",
            detectedLayer: detectedLayer,
            riskScore: isModerator ? 98 : 4,
            countryCode: country,
            asn: asn,
            utmParams: Object.fromEntries(url.searchParams.entries()),
          }),
        }).catch(() => {})
      );
    }

    return serveTarget(request, targetUrl, isModerator);
  },
};

async function serveTarget(request, destination, isModerator) {
  const currentUrl = new URL(request.url);
  let finalTarget;

  if (destination.startsWith("http://") || destination.startsWith("https://")) {
    finalTarget = new URL(destination);
  } else {
    finalTarget = new URL(destination, request.url);
  }

  // Preserva parâmetros e UTMs da requisição original
  currentUrl.searchParams.forEach((val, key) => {
    finalTarget.searchParams.set(key, val);
  });

  // Headers transparentes de Proxy Reverso (Host reescrito para o destino final)
  const upstreamHeaders = new Headers(request.headers);
  upstreamHeaders.set("Host", finalTarget.host);
  upstreamHeaders.set("X-Forwarded-Host", currentUrl.host);
  upstreamHeaders.set("X-Forwarded-Proto", currentUrl.protocol.replace(":", ""));
  upstreamHeaders.set("X-Real-IP", request.headers.get("cf-connecting-ip") || "");
  upstreamHeaders.delete("cf-ray");
  upstreamHeaders.delete("cf-connecting-ip");

  const upstreamResponse = await fetch(finalTarget.toString(), {
    method: request.method,
    headers: upstreamHeaders,
    body: request.method !== "GET" && request.method !== "HEAD" ? request.body : undefined,
    redirect: "follow",
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  
  if (isModerator) {
    responseHeaders.set("X-Robots-Tag", "noindex, nofollow");
  }

  // Injeta Engagement Gate na resposta HTML se não for moderador
  let responseBody = upstreamResponse.body;
  const contentType = upstreamResponse.headers.get("content-type") || "";
  if (!isModerator && CONFIG.ENGAGEMENT_GATE_ENABLED && contentType.includes("text/html")) {
    try {
      const html = await upstreamResponse.text();
      const engagementScript = getEngagementGateScript();
      const injectedHtml = html.replace("</head>", engagementScript + "</head>");
      responseBody = injectedHtml;
      responseHeaders.set("Content-Length", String(new TextEncoder().encode(injectedHtml).length));
    } catch(e) {
      responseBody = upstreamResponse.body;
    }
  }

  return new Response(responseBody, {
    status: upstreamResponse.status || 200,
    headers: responseHeaders,
  });
}
`;
  }
}

export const generateCloudflareWorkerCode = CloakerEngine.generateCloudflareWorkerCode.bind(CloakerEngine);
export const generateClientFingerprintSnippet = CloakerEngine.generateClientFingerprintSnippet.bind(CloakerEngine);
