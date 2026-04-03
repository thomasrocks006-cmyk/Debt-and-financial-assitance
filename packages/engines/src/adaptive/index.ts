import type { AdaptiveTrigger, AdaptiveRecommendation, TriggerType } from "./types";

/**
 * Detect triggers from case events.
 *
 * Handles all 7 trigger types: missed_payment, income_change, new_debt,
 * crisis_event, creditor_response, stage_timeout, compliance_lapse.
 */
export function detectTriggers(
  caseId: string,
  events: Array<{ type: string; data: Record<string, unknown>; occurredAt: Date }>
): AdaptiveTrigger[] {
  const triggers: AdaptiveTrigger[] = [];

  for (const event of events) {
    switch (event.type) {
      case "payment_failed":
      case "payment_bounced":
        triggers.push({
          type: "missed_payment",
          caseId,
          detectedAt: event.occurredAt,
          severity: "high",
          data: event.data,
        });
        break;

      case "income_updated":
      case "income_decreased":
      case "job_loss":
        triggers.push({
          type: "income_change",
          caseId,
          detectedAt: event.occurredAt,
          severity:
            event.type === "job_loss"
              ? "critical"
              : (event.data.changePercent as number) < -20
                ? "high"
                : "medium",
          data: event.data,
        });
        break;

      case "debt_added":
      case "debt_discovered":
        triggers.push({
          type: "new_debt",
          caseId,
          detectedAt: event.occurredAt,
          severity: "medium",
          data: event.data,
        });
        break;

      case "eviction_notice":
      case "disconnection_notice":
      case "safety_concern":
      case "mental_health_crisis":
        triggers.push({
          type: "crisis_event",
          caseId,
          detectedAt: event.occurredAt,
          severity: event.type === "safety_concern" ? "critical" : "high",
          data: { ...event.data, crisisType: event.type },
        });
        break;

      case "creditor_accepted":
      case "creditor_rejected":
      case "creditor_counter_offer":
        triggers.push({
          type: "creditor_response",
          caseId,
          detectedAt: event.occurredAt,
          severity: event.type === "creditor_rejected" ? "high" : "medium",
          data: { ...event.data, responseType: event.type },
        });
        break;

      case "stage_timeout":
      case "no_progress_30d":
        triggers.push({
          type: "stage_timeout",
          caseId,
          detectedAt: event.occurredAt,
          severity: "medium",
          data: event.data,
        });
        break;

      case "consent_expired":
      case "disclosure_missing":
      case "fee_not_disclosed":
        triggers.push({
          type: "compliance_lapse",
          caseId,
          detectedAt: event.occurredAt,
          severity: "high",
          data: { ...event.data, complianceType: event.type },
        });
        break;
    }
  }

  return triggers;
}

/**
 * Generate actionable recommendations for detected triggers.
 *
 * Each recommendation includes:
 * - What action to take
 * - Plan adjustments to consider
 * - Whether to escalate to a case manager
 * - Suggested referrals if needed
 */
export function generateRecommendations(
  triggers: AdaptiveTrigger[]
): AdaptiveRecommendation[] {
  return triggers.map((trigger) => {
    switch (trigger.type) {
      case "missed_payment":
        return {
          triggerId: `${trigger.caseId}-${trigger.type}-${trigger.detectedAt.getTime()}`,
          triggerType: trigger.type,
          recommendedAction:
            "Contact client within 48 hours to understand reason for missed payment. Check for crisis indicators. Consider temporary plan pause or reduced payment.",
          planAdjustment: {
            pauseDays: 14,
            recalculateAffordability: true,
            notifyCreditors: true,
          },
          urgency: "high" as const,
          escalateToHuman: true,
          suggestedReferrals: [],
          stageTransition: trigger.severity === "critical" ? "survive" : undefined,
        };

      case "income_change": {
        const changePercent = (trigger.data.changePercent as number) ?? 0;
        const isDecrease = changePercent < 0;
        return {
          triggerId: `${trigger.caseId}-${trigger.type}-${trigger.detectedAt.getTime()}`,
          triggerType: trigger.type,
          recommendedAction: isDecrease
            ? `Income decreased by ${Math.abs(changePercent)}%. Recalculate affordability immediately, rebuild plan options, and contact creditors if current plan becomes unsustainable.`
            : `Income increased by ${changePercent}%. Consider accelerating recovery plan or building emergency buffer.`,
          planAdjustment: {
            recalculateAffordability: true,
            rebuildPlans: true,
          },
          urgency: Math.abs(changePercent) > 30 ? "high" as const : "medium" as const,
          escalateToHuman: Math.abs(changePercent) > 50,
          suggestedReferrals: isDecrease
            ? ["Centrelink", "Job Services Australia"]
            : [],
        };
      }

      case "new_debt":
        return {
          triggerId: `${trigger.caseId}-${trigger.type}-${trigger.detectedAt.getTime()}`,
          triggerType: trigger.type,
          recommendedAction:
            "Re-run triage assessment with new debt included. Update plan allocations. Check if new debt is a sign of worsening crisis or a one-time event.",
          planAdjustment: {
            recalculateAffordability: true,
            rebuildPlans: true,
            includeNewDebt: trigger.data,
          },
          urgency: "medium" as const,
          escalateToHuman: false,
          suggestedReferrals: [],
        };

      case "crisis_event": {
        const crisisType = trigger.data.crisisType as string;
        const referrals: string[] = [];
        if (crisisType === "safety_concern") referrals.push("1800RESPECT", "Police");
        if (crisisType === "eviction_notice") referrals.push("Tenancy Advice", "Legal Aid");
        if (crisisType === "disconnection_notice") referrals.push("Energy Ombudsman");
        if (crisisType === "mental_health_crisis") referrals.push("Lifeline", "Beyond Blue");

        return {
          triggerId: `${trigger.caseId}-${trigger.type}-${trigger.detectedAt.getTime()}`,
          triggerType: trigger.type,
          recommendedAction:
            `CRISIS: ${crisisType.replace(/_/g, " ")} detected. Immediate human intervention required. Pause all creditor negotiations. Focus on crisis stabilisation.`,
          planAdjustment: {
            pauseDays: 30,
            recalculateAffordability: true,
          },
          urgency: "critical" as const,
          escalateToHuman: true,
          suggestedReferrals: referrals,
          stageTransition: "survive",
        };
      }

      case "creditor_response": {
        const responseType = trigger.data.responseType as string;
        return {
          triggerId: `${trigger.caseId}-${trigger.type}-${trigger.detectedAt.getTime()}`,
          triggerType: trigger.type,
          recommendedAction:
            responseType === "creditor_accepted"
              ? "Creditor accepted hardship arrangement. Update plan with confirmed terms. Record in case file and notify client."
              : responseType === "creditor_counter_offer"
                ? "Creditor has made a counter-offer. Review terms with client and financial counsellor. Assess if counter-offer is affordable."
                : "Creditor rejected hardship request. Consider escalation to internal complaints or AFCA. Review advocacy options.",
          planAdjustment:
            responseType === "creditor_accepted"
              ? { updatePlanTerms: true }
              : { escalateAdvocacy: true },
          urgency: responseType === "creditor_rejected" ? "high" as const : "medium" as const,
          escalateToHuman: responseType === "creditor_rejected",
          suggestedReferrals:
            responseType === "creditor_rejected" ? ["AFCA"] : [],
        };
      }

      case "stage_timeout":
        return {
          triggerId: `${trigger.caseId}-${trigger.type}-${trigger.detectedAt.getTime()}`,
          triggerType: trigger.type,
          recommendedAction:
            "Case has been in the current stage for an extended period without progress. Review case with case manager, check for blockers, and consider re-engagement strategy.",
          urgency: "medium" as const,
          escalateToHuman: true,
          suggestedReferrals: [],
        };

      case "compliance_lapse": {
        const complianceType = trigger.data.complianceType as string;
        return {
          triggerId: `${trigger.caseId}-${trigger.type}-${trigger.detectedAt.getTime()}`,
          triggerType: trigger.type,
          recommendedAction:
            `COMPLIANCE: ${complianceType.replace(/_/g, " ")} detected. This must be resolved before any further case activity. Send required disclosure/consent documents immediately.`,
          urgency: "high" as const,
          escalateToHuman: true,
          suggestedReferrals: [],
          complianceBlock: true,
        };
      }

      default:
        return {
          triggerId: `${trigger.caseId}-unknown-${trigger.detectedAt.getTime()}`,
          triggerType: trigger.type,
          recommendedAction: "Review case for required action.",
          urgency: "low" as const,
          escalateToHuman: false,
          suggestedReferrals: [],
        };
    }
  });
}

/**
 * Stage transition eligibility check.
 *
 * Recovery stages: survive → stabilise → recover → rebuild
 * Each transition has specific criteria that must be met.
 */
export function checkStageTransitionEligibility(
  currentStage: string,
  metrics: {
    missedPayments: number;
    monthsSinceLastCrisis: number;
    budgetSurplus: boolean;
    allDebtsCurrentStatus: boolean;
    consecutiveOnTimePayments: number;
    emergencyFundStarted: boolean;
    allComplianceRequirementsMet: boolean;
  }
): { eligible: boolean; nextStage?: string; reason: string; requirements?: string[] } {
  const transitions: Record<string, () => { eligible: boolean; nextStage?: string; reason: string; requirements?: string[] }> = {
    survive: () => {
      const requirements: string[] = [];
      if (metrics.missedPayments > 0) requirements.push("No missed payments in current period");
      if (metrics.monthsSinceLastCrisis < 2) requirements.push("2 months since last crisis event");
      if (!metrics.allComplianceRequirementsMet) requirements.push("All compliance requirements met");

      if (requirements.length === 0) {
        return {
          eligible: true,
          nextStage: "stabilise",
          reason: "Crisis has been stabilised — no missed payments for 2 months, no active crisis events",
        };
      }
      return {
        eligible: false,
        reason: "Still in crisis stabilisation — requirements not yet met",
        requirements,
      };
    },

    stabilise: () => {
      const requirements: string[] = [];
      if (!metrics.budgetSurplus) requirements.push("Achieve budget surplus");
      if (metrics.missedPayments > 0) requirements.push("No missed payments");
      if (metrics.consecutiveOnTimePayments < 3) requirements.push("3 consecutive on-time payments");

      if (requirements.length === 0) {
        return {
          eligible: true,
          nextStage: "recover",
          reason: "Budget surplus achieved, 3+ consecutive on-time payments — ready for active recovery",
        };
      }
      return {
        eligible: false,
        reason: "Stabilisation in progress — continue building consistency",
        requirements,
      };
    },

    recover: () => {
      const requirements: string[] = [];
      if (!metrics.allDebtsCurrentStatus) requirements.push("All debts on track or settled");
      if (metrics.consecutiveOnTimePayments < 6) requirements.push("6 consecutive on-time payments");
      if (!metrics.emergencyFundStarted) requirements.push("Emergency fund started");

      if (requirements.length === 0) {
        return {
          eligible: true,
          nextStage: "rebuild",
          reason: "All debts on track, 6+ months on-time payments, emergency fund started — ready to rebuild",
        };
      }
      return {
        eligible: false,
        reason: "Active recovery in progress — continue working towards debt freedom",
        requirements,
      };
    },

    rebuild: () => ({
      eligible: false,
      reason: "Already in the rebuild stage — this is the final recovery stage. Focus on maintaining financial health and building resilience.",
    }),
  };

  const check = transitions[currentStage];
  if (!check) return { eligible: false, reason: "Unknown stage" };
  return check();
}

/**
 * Calculate a recovery score (0-100) based on case metrics.
 */
export function calculateRecoveryScore(metrics: {
  currentStage: string;
  consecutiveOnTimePayments: number;
  budgetSurplus: boolean;
  totalDebt: number;
  originalDebt: number;
  missedPayments: number;
  monthsInProgram: number;
}): number {
  let score = 0;

  // Stage bonus (0-25)
  const stageScores: Record<string, number> = {
    survive: 5,
    stabilise: 15,
    recover: 40,
    rebuild: 70,
  };
  score += stageScores[metrics.currentStage] ?? 0;

  // Payment consistency (0-20)
  score += Math.min(metrics.consecutiveOnTimePayments * 4, 20);

  // Budget health (0-10)
  if (metrics.budgetSurplus) score += 10;

  // Debt reduction progress (0-30)
  if (metrics.originalDebt > 0) {
    const reduction = (metrics.originalDebt - metrics.totalDebt) / metrics.originalDebt;
    score += Math.round(reduction * 30);
  }

  // No missed payments bonus (0-10)
  if (metrics.missedPayments === 0) score += 10;

  // Time in program (0-10)
  score += Math.min(metrics.monthsInProgram * 2, 10);

  return Math.min(Math.max(score, 0), 100);
}

export type { AdaptiveTrigger, AdaptiveRecommendation, TriggerType } from "./types";
