import type { ServiceStream } from "@recoveryos/shared";
import type { CommunityResource, ReferralRecommendation } from "./types";

export const COMMUNITY_RESOURCES: CommunityResource[] = [
  // Financial Counselling
  {
    id: "ndhl",
    name: "National Debt Helpline",
    serviceStream: "DEBT_MANAGEMENT",
    phone: "1800 007 007",
    url: "https://ndh.org.au",
    description: "Free financial counselling from accredited financial counsellors",
    isNational: true,
    isEmergency: false,
  },
  {
    id: "moneysmart",
    name: "ASIC MoneySmart",
    serviceStream: "DEBT_MANAGEMENT",
    url: "https://moneysmart.gov.au",
    description: "Free financial guidance and tools from Australia's financial regulator",
    isNational: true,
    isEmergency: false,
  },
  {
    id: "afca",
    name: "Australian Financial Complaints Authority (AFCA)",
    serviceStream: "DEBT_MANAGEMENT",
    phone: "1800 931 678",
    url: "https://www.afca.org.au",
    description: "Free dispute resolution for complaints about financial firms",
    isNational: true,
    isEmergency: false,
  },

  // Utility Hardship
  {
    id: "ewon",
    name: "Energy & Water Ombudsman NSW",
    serviceStream: "UTILITY_HARDSHIP",
    phone: "1800 246 545",
    url: "https://www.ewon.com.au",
    description: "Free dispute resolution for energy and water complaints in NSW",
    isNational: false,
    states: ["NSW"],
    isEmergency: false,
  },
  {
    id: "ewov",
    name: "Energy & Water Ombudsman Victoria",
    serviceStream: "UTILITY_HARDSHIP",
    phone: "1800 500 509",
    url: "https://www.ewov.com.au",
    description: "Free dispute resolution for energy and water complaints in VIC",
    isNational: false,
    states: ["VIC"],
    isEmergency: false,
  },
  {
    id: "ewosa",
    name: "Energy & Water Ombudsman SA",
    serviceStream: "UTILITY_HARDSHIP",
    phone: "1800 665 565",
    url: "https://www.ewosa.com.au",
    description: "Free dispute resolution for energy and water complaints in SA",
    isNational: false,
    states: ["SA"],
    isEmergency: false,
  },
  {
    id: "erq",
    name: "Energy & Water Ombudsman Queensland",
    serviceStream: "UTILITY_HARDSHIP",
    phone: "1800 662 837",
    url: "https://www.ewoq.com.au",
    description: "Free dispute resolution for energy and water complaints in QLD",
    isNational: false,
    states: ["QLD"],
    isEmergency: false,
  },

  // Rental Assistance
  {
    id: "rta_qld",
    name: "Residential Tenancies Authority QLD",
    serviceStream: "RENTAL_STRESS",
    phone: "1300 366 311",
    url: "https://www.rta.qld.gov.au",
    description: "Tenancy rights and rental assistance in Queensland",
    isNational: false,
    states: ["QLD"],
    isEmergency: false,
  },
  {
    id: "consumer_affairs_vic",
    name: "Consumer Affairs Victoria — Renting",
    serviceStream: "RENTAL_STRESS",
    phone: "1300 558 181",
    url: "https://www.consumer.vic.gov.au/housing/renting",
    description: "Tenancy rights and rental assistance in Victoria",
    isNational: false,
    states: ["VIC"],
    isEmergency: false,
  },

  // Family Violence
  {
    id: "1800respect",
    name: "1800RESPECT",
    serviceStream: "FAMILY_VIOLENCE",
    phone: "1800 737 732",
    url: "https://www.1800respect.org.au",
    description: "National sexual assault, family and domestic violence counselling service",
    isNational: true,
    isEmergency: true,
  },
  {
    id: "dvconnect",
    name: "DVConnect",
    serviceStream: "FAMILY_VIOLENCE",
    phone: "1800 811 811",
    url: "https://www.dvconnect.org",
    description: "Domestic violence support and crisis accommodation in QLD",
    isNational: false,
    states: ["QLD"],
    isEmergency: true,
  },

  // Gambling Support
  {
    id: "gamblers_help",
    name: "Gamblers Help",
    serviceStream: "GAMBLING_SUPPORT",
    phone: "1800 858 858",
    url: "https://www.gamblershelp.com.au",
    description: "Free counselling and support for gambling problems",
    isNational: true,
    isEmergency: false,
  },
  {
    id: "gambleaware",
    name: "GambleAware",
    serviceStream: "GAMBLING_SUPPORT",
    phone: "1800 858 858",
    url: "https://www.gambleaware.nsw.gov.au",
    description: "Gambling support and self-exclusion assistance",
    isNational: false,
    states: ["NSW"],
    isEmergency: false,
  },

  // Emergency Relief
  {
    id: "salvos",
    name: "Salvation Army",
    serviceStream: "EMERGENCY_RELIEF",
    phone: "13 72 58",
    url: "https://www.salvationarmy.org.au",
    description: "Emergency financial assistance, food relief, and crisis support",
    isNational: true,
    isEmergency: true,
  },
  {
    id: "st_vincent",
    name: "St Vincent de Paul Society",
    serviceStream: "EMERGENCY_RELIEF",
    phone: "13 18 12",
    url: "https://www.vinnies.org.au",
    description: "Emergency relief including food, clothing, and financial assistance",
    isNational: true,
    isEmergency: true,
  },
  {
    id: "anglicare",
    name: "Anglicare",
    serviceStream: "EMERGENCY_RELIEF",
    url: "https://www.anglicare.com.au",
    description: "Emergency relief, housing, and community services",
    isNational: true,
    isEmergency: false,
  },

  // Income Support
  {
    id: "services_australia",
    name: "Services Australia (Centrelink)",
    serviceStream: "INCOME_SUPPORT",
    phone: "136 240",
    url: "https://www.servicesaustralia.gov.au",
    description: "Government income support payments and services",
    isNational: true,
    isEmergency: false,
  },

  // Legal Aid
  {
    id: "legal_aid_nsw",
    name: "Legal Aid NSW",
    serviceStream: "LEGAL_REFERRAL",
    phone: "1300 888 529",
    url: "https://www.legalaid.nsw.gov.au",
    description: "Free legal advice for people who cannot afford a lawyer in NSW",
    isNational: false,
    states: ["NSW"],
    isEmergency: false,
  },
  {
    id: "legal_aid_vic",
    name: "Victoria Legal Aid",
    serviceStream: "LEGAL_REFERRAL",
    phone: "1300 792 387",
    url: "https://www.legalaid.vic.gov.au",
    description: "Free legal advice for people who cannot afford a lawyer in VIC",
    isNational: false,
    states: ["VIC"],
    isEmergency: false,
  },
  {
    id: "lawaccess",
    name: "LawAccess NSW",
    serviceStream: "LEGAL_REFERRAL",
    phone: "1300 888 529",
    url: "https://www.lawaccess.nsw.gov.au",
    description: "Free legal information and referral service",
    isNational: false,
    states: ["NSW"],
    isEmergency: false,
  },
];

/**
 * Get resources for given service streams
 */
export function getResourcesForStreams(
  streams: ServiceStream[],
  state?: string
): CommunityResource[] {
  return COMMUNITY_RESOURCES.filter((r) => {
    if (!streams.includes(r.serviceStream)) return false;
    if (state && !r.isNational && r.states && !r.states.includes(state)) return false;
    return true;
  });
}

/**
 * Generate referral recommendations based on service streams
 */
export function getReferralRecommendations(
  streams: ServiceStream[],
  state?: string
): ReferralRecommendation[] {
  const resources = getResourcesForStreams(streams, state);

  return resources.map((resource) => ({
    resource,
    reason: `Recommended based on identified need: ${resource.serviceStream.replace(/_/g, " ")}`,
    priority: resource.isEmergency ? 1 : 5,
  })).sort((a, b) => a.priority - b.priority);
}

export type { CommunityResource, ReferralRecommendation } from "./types";
