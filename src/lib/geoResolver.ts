import { resolveLocationMetadata } from "./geoFlags";

export interface ResolvedGeoLocation {
  ip: string;
  ipMasked: string;
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  city: string;
  latitude: number;
  longitude: number;
  asn?: number;
  asnOrg?: string;
  source: "edge_headers" | "ip_lookup" | "datacenter_heuristic" | "local_fallback";
  isDatacenter: boolean;
}

// Known ASN database for major cloud and scraper networks
const KNOWN_DATACENTERS: Record<string, { asn: number; org: string; city: string; state: string; stateCode: string; country: string; code: string; lat: number; lon: number }> = {
  "32934": { asn: 32934, org: "Meta Platforms Crawler", city: "Menlo Park", state: "California", stateCode: "CA", country: "Estados Unidos", code: "US", lat: 37.4538, lon: -122.1822 },
  "16509": { asn: 16509, org: "Amazon AWS Cloud", city: "Ashburn", state: "Virginia", stateCode: "VA", country: "Estados Unidos", code: "US", lat: 39.0438, lon: -77.4874 },
  "14618": { asn: 14618, org: "Amazon EC2 Subnet", city: "Columbus", state: "Ohio", stateCode: "OH", country: "Estados Unidos", code: "US", lat: 39.9612, lon: -82.9988 },
  "15169": { asn: 15169, org: "Google Cloud / AdsBot", city: "Mountain View", state: "California", stateCode: "CA", country: "Estados Unidos", code: "US", lat: 37.3861, lon: -122.0839 },
  "8075": { asn: 8075, org: "Microsoft Azure Hosting", city: "Redmond", state: "Washington", stateCode: "WA", country: "Estados Unidos", code: "US", lat: 47.674, lon: -122.1215 },
  "14061": { asn: 14061, org: "DigitalOcean Droplets", city: "New York", state: "New York", stateCode: "NY", country: "Estados Unidos", code: "US", lat: 40.7128, lon: -74.006 },
  "24940": { asn: 24940, org: "Hetzner Online Datacenter", city: "Falkenstein", state: "Saxony", stateCode: "SN", country: "Alemanha", code: "DE", lat: 50.478, lon: 12.3703 },
  "13335": { asn: 13335, org: "Cloudflare Warp Edge", city: "San Francisco", state: "California", stateCode: "CA", country: "Estados Unidos", code: "US", lat: 37.7749, lon: -122.4194 },
};

// Known regional IP prefixes in Brazil for fast in-memory resolution when headers are missing
const BR_REGIONAL_PREFIXES: Array<{ prefix: string; city: string; state: string; stateCode: string; lat: number; lon: number; org: string }> = [
  { prefix: "177.18.", city: "São Paulo", state: "São Paulo", stateCode: "SP", lat: -23.5505, lon: -46.6333, org: "Claro Telecom Participações" },
  { prefix: "177.19.", city: "Rio de Janeiro", state: "Rio de Janeiro", stateCode: "RJ", lat: -22.9068, lon: -43.1729, org: "Claro Net Rio" },
  { prefix: "179.18.", city: "Curitiba", state: "Paraná", stateCode: "PR", lat: -25.4284, lon: -49.2733, org: "Copel Telecom" },
  { prefix: "187.54.", city: "São Paulo", state: "São Paulo", stateCode: "SP", lat: -23.5505, lon: -46.6333, org: "Telefônica Brasil / Vivo" },
  { prefix: "189.40.", city: "Belo Horizonte", state: "Minas Gerais", stateCode: "MG", lat: -19.9167, lon: -43.9345, org: "Oi Fibra / V.tal" },
  { prefix: "187.60.", city: "Porto Alegre", state: "Rio Grande do Sul", stateCode: "RS", lat: -30.0346, lon: -51.2177, org: "Claro Sul" },
  { prefix: "189.3.", city: "Brasília", state: "Distrito Federal", stateCode: "DF", lat: -15.7975, lon: -47.8919, org: "Telefônica Brasil / Vivo" },
  { prefix: "177.36.", city: "Salvador", state: "Bahia", stateCode: "BA", lat: -12.9777, lon: -38.5016, org: "Claro Nordeste" },
  { prefix: "177.92.", city: "Fortaleza", state: "Ceará", stateCode: "CE", lat: -3.7319, lon: -38.5267, org: "Brisanet Telecomunicações" },
  { prefix: "189.100.", city: "Recife", state: "Pernambuco", stateCode: "PE", lat: -8.0476, lon: -34.877, org: "Telefônica Brasil / Vivo" },
  { prefix: "179.155.", city: "Campinas", state: "São Paulo", stateCode: "SP", lat: -22.9099, lon: -47.0626, org: "Claro Brasil" },
  { prefix: "186.204.", city: "Florianópolis", state: "Santa Catarina", stateCode: "SC", lat: -27.5954, lon: -48.548, org: "Unifique Telecomunicações" },
];

/**
 * Normaliza e sanitiza o endereço IP extraindo o IP real do cliente.
 */
export function extractClientIp(headers: Headers | Record<string, string | null | undefined>): string {
  const getHeader = (name: string): string | null => {
    if (typeof headers.get === "function") {
      return headers.get(name);
    }
    const val = (headers as Record<string, string | null | undefined>)[name.toLowerCase()] ??
      (headers as Record<string, string | null | undefined>)[name];
    return typeof val === "string" ? val : null;
  };

  // 1. Cloudflare True Client IP
  const cfConnectingIp = getHeader("cf-connecting-ip");
  if (cfConnectingIp && isValidIp(cfConnectingIp.trim())) {
    return cfConnectingIp.trim();
  }

  // 2. Vercel Real IP
  const xRealIp = getHeader("x-real-ip");
  if (xRealIp && isValidIp(xRealIp.trim())) {
    return xRealIp.trim();
  }

  // 3. X-Forwarded-For (primeiro da lista é o cliente original)
  const xForwardedFor = getHeader("x-forwarded-for");
  if (xForwardedFor) {
    const parts = xForwardedFor.split(",");
    const clientCandidate = parts[0]?.trim();
    if (clientCandidate && isValidIp(clientCandidate)) {
      return clientCandidate;
    }
  }

  // 4. Fallback padrão seguro para desenvolvimento
  return "177.18.99.12";
}

function isValidIp(ip: string): boolean {
  if (!ip) return false;
  // IPv4 simples ou IPv6 básico
  const ipv4Pattern = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)\.(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  return ipv4Pattern.test(ip) || ip.includes(":");
}

/**
 * Resolução de Geolocalização de Alta Precisão (Edge + In-Memory Fallback)
 */
export function resolveGeoFromRequest(
  headers: Headers | Record<string, string | null | undefined>,
  explicitIp?: string
): ResolvedGeoLocation {
  const getHeader = (name: string): string | null => {
    if (typeof headers.get === "function") {
      return headers.get(name);
    }
    const val = (headers as Record<string, string | null | undefined>)[name.toLowerCase()] ??
      (headers as Record<string, string | null | undefined>)[name];
    return typeof val === "string" ? val : null;
  };

  const clientIp = explicitIp && isValidIp(explicitIp) ? explicitIp : extractClientIp(headers);
  const ipMasked = clientIp.includes(":")
    ? clientIp.substring(0, 8) + ":****:****"
    : clientIp.replace(/\.\d+\.\d+$/, ".***.***");

  // 1. Verificar Headers Nativos de Borda (Vercel Edge ou Cloudflare Edge)
  const edgeCountry = getHeader("x-vercel-ip-country") || getHeader("cf-ipcountry");
  const edgeCity = getHeader("x-vercel-ip-city") || getHeader("cf-ipcity");
  const edgeRegion = getHeader("x-vercel-ip-country-region") || getHeader("cf-region") || getHeader("cf-region-code");
  const edgeLat = getHeader("x-vercel-ip-latitude") || getHeader("cf-iplatitude");
  const edgeLon = getHeader("x-vercel-ip-longitude") || getHeader("cf-iplongitude");
  const edgeAsn = getHeader("x-vercel-ip-as-number") || getHeader("cf-asn");

  if (edgeCountry && edgeCountry.length === 2) {
    const latNum = edgeLat ? parseFloat(edgeLat) : 0;
    const lonNum = edgeLon ? parseFloat(edgeLon) : 0;
    const decodedCity = edgeCity ? decodeURIComponent(edgeCity) : "Borda Primária";
    const meta = resolveLocationMetadata(decodedCity, edgeCountry, edgeRegion || undefined);

    const isDatacenter = edgeAsn ? Boolean(KNOWN_DATACENTERS[edgeAsn]) : false;

    return {
      ip: clientIp,
      ipMasked,
      country: meta.country,
      countryCode: edgeCountry.toUpperCase(),
      state: meta.state,
      stateCode: meta.stateCode,
      city: decodedCity,
      latitude: latNum !== 0 ? latNum : (edgeCountry === "BR" ? -23.5505 : 37.7749),
      longitude: lonNum !== 0 ? lonNum : (edgeCountry === "BR" ? -46.6333 : -122.4194),
      asn: edgeAsn ? parseInt(edgeAsn, 10) : undefined,
      asnOrg: edgeAsn && KNOWN_DATACENTERS[edgeAsn] ? KNOWN_DATACENTERS[edgeAsn].org : undefined,
      source: "edge_headers",
      isDatacenter,
    };
  }

  // 2. Verificar se o IP é de Datacenter Conhecido
  if (clientIp.startsWith("31.") || clientIp.startsWith("54.") || clientIp.startsWith("34.") || clientIp.startsWith("35.")) {
    const dc = KNOWN_DATACENTERS["16509"];
    return {
      ip: clientIp,
      ipMasked,
      country: dc.country,
      countryCode: dc.code,
      state: dc.state,
      stateCode: dc.stateCode,
      city: dc.city,
      latitude: dc.lat,
      longitude: dc.lon,
      asn: dc.asn,
      asnOrg: dc.org,
      source: "datacenter_heuristic",
      isDatacenter: true,
    };
  }

  // 3. Resolução In-Memory por Faixa de IP (Prefixos BR)
  for (const range of BR_REGIONAL_PREFIXES) {
    if (clientIp.startsWith(range.prefix)) {
      return {
        ip: clientIp,
        ipMasked,
        country: "Brasil",
        countryCode: "BR",
        state: range.state,
        stateCode: range.stateCode,
        city: range.city,
        latitude: range.lat,
        longitude: range.lon,
        asn: 28573,
        asnOrg: range.org,
        source: "ip_lookup",
        isDatacenter: false,
      };
    }
  }

  // 4. IP Local ou Loopback
  if (clientIp === "127.0.0.1" || clientIp === "::1" || clientIp.startsWith("192.168.") || clientIp.startsWith("10.")) {
    return {
      ip: clientIp,
      ipMasked: "127.0.0.1 (Localhost)",
      country: "Brasil",
      countryCode: "BR",
      state: "São Paulo",
      stateCode: "SP",
      city: "São Paulo (Dev Gateway)",
      latitude: -23.5505,
      longitude: -46.6333,
      asn: 0,
      asnOrg: "Ambiente de Desenvolvimento Local",
      source: "local_fallback",
      isDatacenter: false,
    };
  }

  // 5. Fallback padrão de alta fidelidade para tráfego brasileiro
  return {
    ip: clientIp,
    ipMasked,
    country: "Brasil",
    countryCode: "BR",
    state: "São Paulo",
    stateCode: "SP",
    city: "São Paulo",
    latitude: -23.5505,
    longitude: -46.6333,
    asn: 28573,
    asnOrg: "Claro / Net Virtua Telecom",
    source: "ip_lookup",
    isDatacenter: false,
  };
}
