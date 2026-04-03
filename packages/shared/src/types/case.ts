export type CaseStatus =
  | "LEAD"
  | "TRIAGE"
  | "CRISIS_STABILISATION"
  | "ASSESSMENT"
  | "PLAN_DESIGN"
  | "NEGOTIATING"
  | "ACTIVE_RECOVERY"
  | "MONITORING"
  | "REBUILD"
  | "COMPLETED"
  | "REFERRED_OUT"
  | "CLOSED";

export type CrisisLevel = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type ServiceStream =
  | "DEBT_MANAGEMENT"
  | "RENTAL_STRESS"
  | "UTILITY_HARDSHIP"
  | "FAMILY_VIOLENCE"
  | "GAMBLING_SUPPORT"
  | "EMERGENCY_RELIEF"
  | "HOMELESSNESS"
  | "INCOME_SUPPORT"
  | "LEGAL_REFERRAL";

export interface Case {
  id: string;
  clientId: string;
  caseManagerId?: string;
  status: CaseStatus;
  complexityScore?: number;
  recoveryStage?: string;
  createdAt: Date;
  updatedAt: Date;
}
