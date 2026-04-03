import type { ServiceStream } from "@recoveryos/shared";
import type { TriageInput, TriageResult } from "./types";
import {
  TRIAGE_RULES,
  scoreToCrisisLevel,
  CRISIS_LEVEL_URGENCY_DAYS,
} from "./rules";

export function runTriage(input: TriageInput): TriageResult {
  const matchedRules = TRIAGE_RULES.filter((rule) => rule.test(input));
  const score = matchedRules.reduce((sum, rule) => sum + rule.weight, 0);
  const reasoning = matchedRules.map((r) => r.description);

  const crisisLevel = scoreToCrisisLevel(score);

  // Determine service streams
  const serviceStreams = new Set<ServiceStream>();

  if (input.debtStress > 0) serviceStreams.add("DEBT_MANAGEMENT");
  if (input.rentalStress >= 5) serviceStreams.add("RENTAL_STRESS");
  if (input.utilityStress >= 5) serviceStreams.add("UTILITY_HARDSHIP");
  if (input.safetyRisk) serviceStreams.add("FAMILY_VIOLENCE");
  if (input.gamblingRisk) serviceStreams.add("GAMBLING_SUPPORT");
  if (input.foodInsecurity) serviceStreams.add("EMERGENCY_RELIEF");
  if (input.incomeShock) serviceStreams.add("INCOME_SUPPORT");

  // Human review required for safety cases or critical/high crisis
  const humanRequired =
    input.safetyRisk ||
    crisisLevel === "CRITICAL" ||
    crisisLevel === "HIGH" ||
    input.gamblingRisk;

  // Self-serve eligible if low complexity
  const selfServeEligible =
    !humanRequired && crisisLevel !== "MEDIUM" && !input.foodInsecurity;

  const urgencyDays =
    input.daysUntilCriticalEvent ?? CRISIS_LEVEL_URGENCY_DAYS[crisisLevel];

  return {
    crisisLevel,
    serviceStreams: Array.from(serviceStreams),
    urgencyDays,
    humanRequired,
    selfServeEligible,
    score,
    reasoning,
  };
}

export type { TriageInput, TriageResult };
