import type { CrisisLevel, ServiceStream } from "@recoveryos/shared";

export interface TriageInput {
  debtStress: number;       // 0-10
  rentalStress: number;     // 0-10
  utilityStress: number;    // 0-10
  incomeShock: boolean;
  safetyRisk: boolean;
  gamblingRisk: boolean;
  foodInsecurity: boolean;
  daysUntilCriticalEvent?: number;
}

export interface TriageResult {
  crisisLevel: CrisisLevel;
  serviceStreams: ServiceStream[];
  urgencyDays?: number;
  humanRequired: boolean;
  selfServeEligible: boolean;
  score: number;
  reasoning: string[];
}
