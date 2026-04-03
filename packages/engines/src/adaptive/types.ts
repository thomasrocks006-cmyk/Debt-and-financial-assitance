export type TriggerType =
  | "missed_payment"
  | "income_change"
  | "new_debt"
  | "expense_spike"
  | "crisis_event"
  | "plan_completed"
  | "stage_eligible";

export interface AdaptiveTrigger {
  type: TriggerType;
  caseId: string;
  detectedAt: Date;
  severity: "low" | "medium" | "high";
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
  recommendedAction: string;
  planAdjustment?: {
    newPaymentAmount?: number;
    newStrategy?: string;
    pauseDays?: number;
  };
  stageTransition?: StageTransition;
  urgency: "low" | "medium" | "high";
}
