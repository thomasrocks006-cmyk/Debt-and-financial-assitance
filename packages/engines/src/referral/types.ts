import type { ServiceStream } from "@recoveryos/shared";

export interface CommunityResource {
  id: string;
  name: string;
  serviceStream: ServiceStream;
  phone?: string;
  url?: string;
  description: string;
  isNational: boolean;
  states?: string[];
  isEmergency: boolean;
}

export interface ReferralRecommendation {
  resource: CommunityResource;
  reason: string;
  priority: number;
}
