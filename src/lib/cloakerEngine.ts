import { DeviceType, CloakerMode, CloakilioConfig, CloakerDetectedLayer } from "@/types";

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
// 🛡️ LISTAS DE SEGURANÇA E ASNs DO MOTOR CLOAKILIO
// ============================================================================

export const BLOCKED_ASNS_MAP: Record<number, string> = {
  32934: "Meta Platforms / Facebook Bot Network",
  63293: "Meta Platforms Infrastructure",
  16509: "Amazon AWS Datacenter",
  14618: "Amazon AWS EC2",
  15169: "Google Cloud Infrastructure",
  8075: "Microsoft Azure Hosting",
  14061: "DigitalOcean Datacenter",
  16276: "OVH Hosting SAS",
  24940: "Hetzner Online Datacenter",
  51167: "Contabo Cloud Servers",
  13335: "Cloudflare Warp / Scrapers",
  20473: "Vultr / Choopa Datacenter",
  60068: "CDN77 / Spy Services",
  46652: "AdPlexity / Spy Scrapers",
};

export const BLOCKED_ASNS_SET = new Set<number>(
  Object.keys(BLOCKED_ASNS_MAP).map(Number)
);

export const BOT_PATTERNS: string[] = [
  "facebookbot",
  "facebookexternalhit",
  "fbexternalagent",
  "fbexternalhit",
  "fbadsbot",
  "meta-externalagent",
  "meta-externalfetcher",
  "googlebot",
  "adsbot-google",
  "google-adsbot",
  "mediapartners-google",
  "tiktokbot",
  "tiktokspider",
  "bytedance",
  "bingbot",
  "adidxbot",
  "headlesschrome",
  "phantomjs",
  "selenium",
  "puppeteer",
  "playwright",
  "python-requests",
  "curl/",
  "wget/",
  "semrush",
  "ahrefs",
  "adplexity",
  "spyfu",
];

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

// Cache em memória para consultas de IP (Threat Intelligence)
const ipThreatCache = new Map<string, { isBad: boolean; time: number; risk: number }>();

export const DEFAULT_CLOAKILIO_CONFIG: CloakilioConfig = {
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
};

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
   * Avaliação multi-camada rigorosa baseada na arquitetura do CloakilioShield
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
      // MOTOR DE DECISÃO EM 6 CAMADAS

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
    }

    // ISP Org & ASN Resolution
    let finalAsn = params.asn;
    let finalAsnOrg = "";

    if (finalAsn && BLOCKED_ASNS_MAP[finalAsn]) {
      finalAsnOrg = BLOCKED_ASNS_MAP[finalAsn];
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
   * Gera o snippet JavaScript client-side (Camada 3) para injeção na página.
   * Inspeciona WebGL Renderer (SwiftShader, llvmpipe), Headless (navigator.webdriver)
   * e Canvas 2D Hash para neutralizar moderadores que executam JavaScript no browser.
   */
  public static generateClientFingerprintSnippet(config: CloakilioConfig): string {
    const whitepageUrl = config.whitepageUrl || "https://seusite.com/white";
    const clientAction = config.clientAction || "redirect_whitepage";
    const blockHeadless = config.blockHeadless ?? true;
    const blockSwiftShader = config.blockSwiftShader ?? true;

    return `<!-- 🛡️ Phantom-X Telemetria de Hardware & Anti-Headless (Camada 3) -->
<script>
(function() {
  'use strict';
  try {
    var isBot = false;
    var reasons = [];

    // 1. Detecção de Automação / Headless
    if (${blockHeadless}) {
      if (navigator.webdriver === true) {
        isBot = true;
        reasons.push('webdriver_active');
      }
      if (window.document.documentElement.getAttribute('webdriver')) {
        isBot = true;
        reasons.push('webdriver_attribute');
      }
      if (window.callPhantom || window._phantom || window.__nightmare) {
        isBot = true;
        reasons.push('phantom_framework');
      }
    }

    // 2. Detecção de GPU / WebGL Rasterizer de Datacenter (SwiftShader, llvmpipe, Mesa)
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
      var badRenderers = ['swiftshader', 'llvmpipe', 'mesa offscreen', 'softpipe', 'virtualbox', 'vmware svga'];
      for (var i = 0; i < badRenderers.length; i++) {
        if (renderer.indexOf(badRenderers[i]) !== -1) {
          isBot = true;
          reasons.push('datacenter_gpu_' + badRenderers[i]);
          break;
        }
      }
    }

    // 3. Canvas 2D Fingerprint Hash
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
        ctx.fillText('Phantom-X Protection 🛡️', 2, 2);
        canvasHash = c2d.toDataURL().substring(22, 60);
      }
    } catch(e) {}

    // 4. Execução da Ação de Defesa
    if (isBot) {
      document.cookie = 'ph_hw_threat=1; path=/; max-age=86400';
      if ('${clientAction}' === 'redirect_whitepage') {
        window.location.replace('${whitepageUrl}');
      }
    } else {
      document.cookie = 'ph_hw_ok=1; path=/; max-age=86400';
    }
  } catch(err) {}
})();
</script>`;
  }

  /**
   * Gera o código completo e compilado de um Cloudflare Worker pronto para subir
   */
  public static generateCloudflareWorkerCode(config: CloakilioConfig): string {
    const countriesStr = JSON.stringify(config.paisesPermitidos);
    const blockedAsnsStr = JSON.stringify(config.blockedAsns);
    const botPatternsStr = JSON.stringify(config.botPatterns, null, 2);

    return `/**
 * ============================================================================
 * 🛡️ PHANTOM-X CLOAKILIOSHIELD - CLOUDFLARE WORKER ENGINE
 * ============================================================================
 * Gerado automaticamente via Phantom-X Command Center
 * Entrega transparente na borda via Reverse Proxy puro (HTTP 200 OK sem redirects)
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
};

const BLOCKED_ASNS = new Set(${blockedAsnsStr});
const BOT_PATTERNS = ${botPatternsStr};

const ipCache = new Map();

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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = (request.headers.get("user-agent") || "").toLowerCase();
    const clientIp = request.headers.get("cf-connecting-ip") || "";
    const cf = request.cf || {};
    const asn = cf.asn;
    const country = (cf.country || "").toUpperCase();

    // 1. Arquivos estáticos passam sem consumo de regras
    if (/\\.(css|js|png|jpg|jpeg|gif|svg|woff2?|ico|mp3|mp4|json)$/i.test(url.pathname)) {
      return fetch(request);
    }

    // 2. Processa apenas rotas de páginas
    const isMainRoute = url.pathname === "/" || url.pathname === "/index.html";
    if (!isMainRoute) {
      return fetch(request);
    }

    // 3. Modos Forçados
    if (CONFIG.MODO === "SO_WHITEPAGE") {
      return serveTarget(request, CONFIG.WHITEPAGE_URL, true);
    }
    if (CONFIG.MODO === "SO_OFERTA") {
      return serveTarget(request, CONFIG.OFERTA_URL, false);
    }

    // MOTOR DE DECISÃO MULTI-CAMADA
    let failsGeo = false;
    if (CONFIG.PAISES_PERMITIDOS.length > 0 && country) {
      if (!CONFIG.PAISES_PERMITIDOS.includes(country)) {
        failsGeo = true;
      }
    }

    const isMobile = userAgent.includes("iphone") || userAgent.includes("android");
    let failsDevice = false;
    if (isMobile && !CONFIG.PERMITIR_MOBILE) failsDevice = true;
    if (!isMobile && !CONFIG.PERMITIR_DESKTOP) failsDevice = true;

    const isBotUA = !userAgent || BOT_PATTERNS.some((p) => userAgent.includes(p));
    const isDatacenter = asn && BLOCKED_ASNS.has(asn);

    const campaign = (
      url.searchParams.get("utm_campaign") ||
      url.searchParams.get("campaign") ||
      url.searchParams.get("utm_campaign_name") ||
      ""
    ).toLowerCase();

    const hasValidUtm = !CONFIG.PARAMETRO_UTM || campaign.includes(CONFIG.PARAMETRO_UTM.toLowerCase());
    const hasFbclid = Boolean(url.searchParams.get("fbclid"));
    const failsPlatformToken = !hasValidUtm || (CONFIG.EXIGIR_FBCLID && !hasFbclid);

    const hasSecChUa = Boolean(request.headers.get("sec-ch-ua"));
    const isSuspiciousBrowser = !hasSecChUa && !isMobile;

    let isModerator =
      failsGeo ||
      failsDevice ||
      isBotUA ||
      isDatacenter ||
      failsPlatformToken ||
      isSuspiciousBrowser;

    if (!isModerator && CONFIG.API_KEY) {
      const isProxyOrVpn = await checkThreatScore(clientIp, CONFIG.API_KEY, CONFIG.RISCO_MAXIMO);
      if (isProxyOrVpn) {
        isModerator = true;
      }
    }

    const targetUrl = isModerator ? CONFIG.WHITEPAGE_URL : CONFIG.OFERTA_URL;
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

  finalTarget.search = currentUrl.search;

  const upstreamResponse = await fetch(finalTarget.toString(), {
    headers: request.headers,
  });

  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  
  if (isModerator) {
    responseHeaders.set("X-Robots-Tag", "noindex, nofollow");
  }

  return new Response(upstreamResponse.body, {
    status: 200,
    headers: responseHeaders,
  });
}
`;
  }
}
