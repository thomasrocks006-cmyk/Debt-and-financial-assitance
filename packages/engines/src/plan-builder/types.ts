import type { AllocationStrategy } from "@recoveryos/shared";
import type { AffordabilityResult } from "../affordability/types";

export interface DebtAccountInput {
  debtId: string;
  creditorName: string;
  currentBalance: number;
  interestRate: number;
  minimumPayment: number;
  priority?: number;  // override priority
}

export interface PlanBuilderInput {
  affordability: AffordabilityResult;
  debtAccounts: DebtAccountInput[];
  preferredStrategy?: AllocationStrategy;
}

export interface DebtAllocation {
  debtId: string;
  creditorName: string;
  monthlyPayment: number;
  allocationPercent: number;
  monthsToPayoff: number;
}

export interface PlanOption {
  name: string;
  strategy: AllocationStrategy;
  monthlyPaymentAmount: number;
  frequency: string;
  allocations: DebtAllocation[];
  estimatedCompletionDate: Date;
  totalMonths: number;
  failureProbability: number;
  riskScore: number;
  stage: string;
  label: string;
  description: string;
}
