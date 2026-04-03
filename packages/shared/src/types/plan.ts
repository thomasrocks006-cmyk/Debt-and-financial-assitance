export type AllocationStrategy =
  | "PRO_RATA"
  | "PRIORITY_BASED"
  | "HIGH_INTEREST_FIRST"
  | "NEGOTIATED_SETTLEMENT"
  | "SURVIVAL_MODE";

export type PlanStatus =
  | "DRAFT"
  | "PROPOSED"
  | "APPROVED"
  | "ACTIVE"
  | "PAUSED"
  | "ADJUSTED"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface PaymentPlan {
  id: string;
  caseId: string;
  paymentAmount: number;
  frequency: string;
  strategy: AllocationStrategy;
  riskScore?: number;
  failureProbability?: number;
  estimatedCompletionDate?: Date;
  status: PlanStatus;
  stage?: string;
  feeModel?: string;
  feeAmount?: number;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanAllocation {
  id: string;
  planId: string;
  debtId: string;
  allocationPercent: number;
  fixedAmount?: number;
}
