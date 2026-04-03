import type { CrisisLevel } from "@recoveryos/shared";
import type { TriageInput } from "./types";

export interface TriageRule {
  id: string;
  description: string;
  weight: number;
  test: (input: TriageInput) => boolean;
}

export const TRIAGE_RULES: TriageRule[] = [
  {
    id: "safety_risk",
    description: "Safety risk detected — immediate human escalation",
    weight: 10,
    test: (i) => i.safetyRisk,
  },
  {
    id: "critical_event_imminent",
    description: "Critical event within 7 days",
    weight: 9,
    test: (i) =>
      i.daysUntilCriticalEvent !== undefined && i.daysUntilCriticalEvent <= 7,
  },
  {
    id: "food_insecurity",
    description: "Client unable to afford food",
    weight: 8,
    test: (i) => i.foodInsecurity,
  },
  {
    id: "income_shock",
    description: "Sudden income loss",
    weight: 6,
    test: (i) => i.incomeShock,
  },
  {
    id: "gambling_risk",
    description: "Gambling contributing to hardship",
    weight: 5,
    test: (i) => i.gamblingRisk,
  },
  {
    id: "high_debt_stress",
    description: "Debt stress score >= 8",
    weight: 5,
    test: (i) => i.debtStress >= 8,
  },
  {
    id: "high_rental_stress",
    description: "Rental stress score >= 8",
    weight: 5,
    test: (i) => i.rentalStress >= 8,
  },
  {
    id: "moderate_debt_stress",
    description: "Debt stress score >= 5",
    weight: 3,
    test: (i) => i.debtStress >= 5,
  },
  {
    id: "moderate_rental_stress",
    description: "Rental stress score >= 5",
    weight: 3,
    test: (i) => i.rentalStress >= 5,
  },
  {
    id: "utility_stress",
    description: "Utility stress present",
    weight: 2,
    test: (i) => i.utilityStress >= 5,
  },
];

export function scoreToCrisisLevel(score: number): CrisisLevel {
  if (score >= 15) return "CRITICAL";
  if (score >= 10) return "HIGH";
  if (score >= 6) return "MEDIUM";
  if (score >= 2) return "LOW";
  return "NONE";
}

export const CRISIS_LEVEL_URGENCY_DAYS: Record<CrisisLevel, number> = {
  CRITICAL: 1,
  HIGH: 3,
  MEDIUM: 14,
  LOW: 30,
  NONE: 90,
};
