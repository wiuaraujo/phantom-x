const PHANTOM_PLANS = {
  free: {
    id: "free",
    name: "Plano Trial",
    priceMonthly: 0,
    region: "Brasil (1)",
    limits: {
      maxDomains: 1,
      maxCampaigns: 1,
      maxEventsMonthly: 100,
    },
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 149,
    region: "Brasil (1)",
    limits: {
      maxDomains: 3,
      maxCampaigns: 3,
      maxEventsMonthly: 10000,
    },
  },
  growth: {
    id: "growth",
    name: "Growth",
    priceMonthly: 389,
    region: "Latam (20)",
    limits: {
      maxDomains: 15,
      maxCampaigns: 15,
      maxEventsMonthly: 100000,
    },
  },
  scale: {
    id: "scale",
    name: "Scale",
    priceMonthly: 529,
    region: "Todos (247)",
    limits: {
      maxDomains: 60,
      maxCampaigns: 60,
      maxEventsMonthly: -1,
    },
  },
};

const LATAM_COUNTRIES = [
  "BR", "MX", "AR", "CO", "CL", "PE", "UY", "PY", "EC", "BO",
  "CR", "PA", "DO", "GT", "HN", "SV", "NI", "PR", "VE", "CU",
];

module.exports = { PHANTOM_PLANS, LATAM_COUNTRIES };
