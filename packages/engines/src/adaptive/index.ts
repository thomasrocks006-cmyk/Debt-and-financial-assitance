import type { AdaptiveTrigger, AdaptiveRecommendation, TriggerType } from "./types";

/**
 * Detect triggers from case events
 * TODO: Full implementation with real-time event processing via BullMQ
 */
export function detectTriggers(
  caseId: string,
  events: Array<{ type: string; data: Record<string, unknown>; occurredAt: Date }>
): AdaptiveTrigger[] {
  const triggers: AdaptiveTrigger[] = [];

  for (const event of events) {
    switch (event.type) {
      case "payment_failed":
        triggers.push({
          type: "missed_payment",
          caseId,
          detectedAt: event.occurredAt,
          severity: "high",
          data: event.data,
        });
        break;
      case "income_updated":
        triggers.push({
          type: "income_change",
          caseId,
          detectedAt: event.occurredAt,
          severity: "medium",
          data: event.data,
        });
        break;
      case "debt_added":
        triggers.push({
          type: "new_debt",
          caseId,
          detectedAt: event.occurredAt,
          severity: "medium",
          data: event.data,
        });
        break;
    }
  }

  return triggers;
}

/**
 * Generate recommendations for detected triggers
 * TODO: Full implementation with ML-based recommendations
 */
export function generateRecommendations(
  triggers: AdaptiveTrigger[]
): AdaptiveRecommendation[] {
  return triggers.map((trigger) => {
    switch (trigger.type) {
      case "missed_payment":
        return {
          triggerId: `${trigger.caseId}-${trigger.type}`,
          recommendedAction: "Contact client to understand reason for missed payment. Consider temporary plan pause.",
          planAdjustment: { pauseDays: 14 },
          urgency: "high" as const,
        };
      case "income_change":
        return {
          triggerId: `${trigger.caseId}-${trigger.type}`,
          recommendedAction: "Recalculate affordability and rebuild plan options.",
          urgency: "medium" as const,
        };
      case "new_debt":
        return {
          triggerId: `${trigger.caseId}-${trigger.type}`,
          recommendedAction: "Re-run triage and update plan allocations to include new debt.",
          urgency: "medium" as const,
        };
      default:
        return {
          triggerId: `${trigger.caseId}-${trigger.type}`,
          recommendedAction: "Review case for required action.",
          urgency: "low" as const,
        };
    }
  });
}

/**
 * Stage transition eligibility check
 * TODO: Full state machine implementation
 */
export function checkStageTransitionEligibility(
  currentStage: string,
  metrics: {
    missedPayments: number;
    monthsSinceLastCrisis: number;
    budgetSurplus: boolean;
    allDebtsCurrentStatus: boolean;
  }
): { eligible: boolean; nextStage?: string; reason: string } {
  const transitions: Record<string, () => { eligible: boolean; nextStage?: string; reason: string }> = {
    survive: () => {
      if (metrics.missedPayments === 0 && metrics.monthsSinceLastCrisis >= 2) {
        return { eligible: true, nextStage: "stabilise", reason: "No missed payments for 2 months" };
      }
      return { eligible: false, reason: "Still in crisis — continue survival mode" };
    },
    stabilise: () => {
      if (metrics.budgetSurplus && metrics.missedPayments === 0) {
        return { eligible: true, nextStage: "recover", reason: "Budget surplus achieved and payments on track" };
      }
      return { eligible: false, reason: "Budget not yet surplus" };
    },
    recover: () => {
      if (metrics.allDebtsCurrentStatus) {
        return { eligible: true, nextStage: "rebuild", reason: "All debts on track — ready to rebuild" };
      }
      return { eligible: false, reason: "Outstanding debt issues remain" };
    },
    rebuild: () => ({ eligible: false, reason: "Already in final stage" }),
  };

  const check = transitions[currentStage];
  if (!check) return { eligible: false, reason: "Unknown stage" };
  return check();
}

export type { AdaptiveTrigger, AdaptiveRecommendation, TriggerType } from "./types";
