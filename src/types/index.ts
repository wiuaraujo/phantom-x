export type DeviceType = "desktop" | "mobile" | "tablet" | "bot";
export type RiskCategory = "clean" | "suspicious" | "bot";
export type DomainStatus = "active" | "pending_verification" | "unverified";
export type SSLStatus = "valid" | "provisioning" | "expired";
export type CampaignStatus = "active" | "paused";
export type RuleStatus = "active" | "inactive";

export type CloakerMode = "AUTOMATICO" | "SO_WHITEPAGE" | "SO_OFERTA";

export type CloakerDetectedLayer =
  | "geo_fencing"
  | "device_filter"
  | "asn_datacenter"
  | "bot_pattern"
  | "platform_token"
  | "client_hints"
  | "threat_intelligence"
  | "clean_traffic";

export interface PhantomCloakerConfig {
  modo: CloakerMode;
  whitepageUrl: string;
  ofertaUrl: string;
  paisesPermitidos: string[];
  parametroUtm: string;
  exigirFbclid: boolean;
  permitirMobile: boolean;
  permitirDesktop: boolean;
  riscoMaximo: number;
  proxyCheckApiKey: string;
  blockedAsns: number[];
  botPatterns: string[];
  // Camada 3: Client-Side Fingerprint & Anti-Headless
  enableClientFingerprint: boolean;
  blockHeadless: boolean;
  blockSwiftShader: boolean;
  clientAction: "redirect_whitepage" | "log_only";
}

// Compatibilidade de tipo
export type CloakilioConfig = PhantomCloakerConfig;

export interface User {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  phone?: string;
  phoneCountryCode?: string;
  role: "admin" | "member" | "viewer";
  timezone?: string;
  emailVerified?: boolean;
  organizationId: string;
  organizationName: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  planId: string;
  apiKeys: ApiKey[];
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface Domain {
  id: string;
  name: string;
  status: DomainStatus;
  sslStatus: SSLStatus;
  dnsRecords: {
    type: "CNAME" | "A" | "TXT";
    host: string;
    expected: string;
    verified: boolean;
  }[];
  eventsCount: number;
  activeCampaigns: number;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  domainId: string;
  domainName: string;
  status: CampaignStatus;
  mode?: CloakerMode;
  targetUrl: string; // Oferta / Black page
  fallbackUrl?: string; // Whitepage / Safe page
  whitepageUrl?: string; // Sinônimo explícito
  ofertaUrl?: string; // Sinônimo explícito
  allowedCountries?: string[];
  requireFbclid?: boolean;
  allowMobile?: boolean;
  allowDesktop?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  routingRuleId?: string;
  totalEvents: number;
  cleanEvents: number;
  botEvents: number;
  conversionRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrafficEvent {
  id: string;
  clickId?: string;
  timestamp: string;
  domain: string;
  campaignId?: string;
  campaignName?: string;
  ip: string;
  ipMasked: string;
  country: string;
  countryCode: string;
  state?: string;
  stateCode?: string;
  city: string;
  latitude: number;
  longitude: number;
  device: DeviceType;
  browser: string;
  os: string;
  referrer: string;
  targetUrl: string;
  routedTo: string;
  riskScore: number; // 0 to 100
  riskCategory: RiskCategory;
  classification?: "human-like" | "known-crawler" | "preview-bot" | "automation" | "suspicious" | "unknown";
  decision?: "routed_offer" | "mitigated_safe" | "blocked";
  ispOrg?: string;
  asn?: number;
  asnOrg?: string;
  detectedLayer?: CloakerDetectedLayer;
  reverseProxyDelivery?: boolean;
  httpStatus?: number;
  webglRenderer?: string;
  webglVendor?: string;
  isHeadless?: boolean;
  canvasHash?: string;
  hardwareConcurrency?: number;
  latencyMs: number;
  isThreat: boolean;
  threatReasons?: string[];
  isSimulated?: boolean;
}

export interface RoutingRule {
  id: string;
  name: string;
  domainId: string;
  domainName: string;
  priority: number;
  status: RuleStatus;
  conditions: {
    countryCodes?: string[];
    devices?: DeviceType[];
    languages?: string[];
    pathPattern?: string;
    maxRiskScore?: number;
  };
  destinationUrl: string;
  fallbackUrl: string;
  hitsCount: number;
  createdAt: string;
}

export interface MetricOverview {
  activeVisitors: number;
  totalEvents: number;
  sessionCount: number;
  uniqueCountries: number;
  automatedThreatsBlocked: number;
  periodGrowth: {
    visitors: number;
    events: number;
    sessions: number;
    threats: number;
  };
}

export interface GeoAggregate {
  country: string;
  countryCode: string;
  eventsCount: number;
  percentage: number;
  latitude: number;
  longitude: number;
}
