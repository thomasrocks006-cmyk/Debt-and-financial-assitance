export { CaseStatus, CrisisLevel, ServiceStream } from "./case";
export { DebtType, DebtStatus } from "./debt";
export { AllocationStrategy, PlanStatus } from "./plan";
export { UserRole } from "./client";

export type RecoveryStage = "survive" | "stabilise" | "recover" | "rebuild";

export type HardshipFlag =
  | "job_loss"
  | "reduced_hours"
  | "illness_injury"
  | "mental_health"
  | "family_violence"
  | "financial_abuse"
  | "gambling"
  | "separation_divorce"
  | "caring_responsibilities"
  | "natural_disaster"
  | "covid_impact";

export type ContactPreference = "email" | "phone" | "sms" | "post";

export type Priority = "low" | "medium" | "high" | "urgent";

export type TaskStatus = "todo" | "in_progress" | "done" | "blocked";
