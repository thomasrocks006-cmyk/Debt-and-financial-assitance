export type TriggerType =
  | "missed_payment"
  | "income_change"
  | "new_debt"
  | "expense_spike"
  | "crisis_event"
  | "creditor_response"
  | "stage_timeout"
  | "compliance_lapse"
  | "plan_completed"
  | "stage_eligible";

export interface AdaptiveTrigger {
  type: TriggerType;
  caseId: string;
  detectedAt: Date;
  severity: "low" | "medium" | "high" | "critical";
  data?: Record<string, unknown>;
}

export type StageTransition = {
  fromStage: string;
  toStage: string;
  reason: string;
  autoTransition: boolean;
};

export interface AdaptiveRecommendation {
  triggerId: string;
  triggerType?: TriggerType;
  recommendedAction: string;
  planAdjustment?: Record<string, unknown>;
  stageTransition?: string;
  urgency: "low" | "medium" | "high" | "critical";
  escalateToHuman?: boolean;
  suggestedReferrals?: string[];
  complianceBlock?: boolean;
}
