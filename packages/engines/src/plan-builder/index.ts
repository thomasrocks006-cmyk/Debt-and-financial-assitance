import type { PlanBuilderInput, PlanOption } from "./types";
import {
  proRataAllocations,
  priorityAllocations,
  highInterestFirstAllocations,
  maxMonthsToPayoff,
  estimatedCompletion,
  calculateFailureProbability,
} from "./strategies";

export function buildPlans(input: PlanBuilderInput): PlanOption[] {
  const { affordability, debtAccounts } = input;

  if (debtAccounts.length === 0) return [];

  const survival = affordability.survivalBudget.monthlyPaymentCapacity;
  const stabilisation = affordability.stabilisationBudget.monthlyPaymentCapacity;
  const recovery = affordability.recoveryBudget.monthlyPaymentCapacity;
  const disposable = affordability.disposableIncome;

  const plans: PlanOption[] = [
    // Survival plan: pro-rata, minimum payments
    {
      name: "survival",
      strategy: "SURVIVAL_MODE",
      monthlyPaymentAmount: survival,
      frequency: "monthly",
      allocations: proRataAllocations(survival, debtAccounts),
      get estimatedCompletionDate() {
        return estimatedCompletion(maxMonthsToPayoff(this.allocations));
      },
      get totalMonths() {
        return maxMonthsToPayoff(this.allocations);
      },
      failureProbability: calculateFailureProbability(survival, disposable),
      riskScore: 8,
      stage: "survive",
      label: "Survival Plan",
      description: "Minimum viable payments — protects against default while you stabilise",
    },

    // Balanced plan: priority-based, mid-level payments
    {
      name: "balanced",
      strategy: "PRIORITY_BASED",
      monthlyPaymentAmount: stabilisation,
      frequency: "monthly",
      allocations: priorityAllocations(stabilisation, debtAccounts),
      get estimatedCompletionDate() {
        return estimatedCompletion(maxMonthsToPayoff(this.allocations));
      },
      get totalMonths() {
        return maxMonthsToPayoff(this.allocations);
      },
      failureProbability: calculateFailureProbability(stabilisation, disposable),
      riskScore: 5,
      stage: "stabilise",
      label: "Balanced Plan",
      description: "Sustainable payments — prevents further deterioration and begins recovery",
    },

    // Aggressive plan: high-interest first, maximum payments
    {
      name: "aggressive",
      strategy: "HIGH_INTEREST_FIRST",
      monthlyPaymentAmount: recovery,
      frequency: "monthly",
      allocations: highInterestFirstAllocations(recovery, debtAccounts),
      get estimatedCompletionDate() {
        return estimatedCompletion(maxMonthsToPayoff(this.allocations));
      },
      get totalMonths() {
        return maxMonthsToPayoff(this.allocations);
      },
      failureProbability: calculateFailureProbability(recovery, disposable),
      riskScore: 3,
      stage: "recover",
      label: "Aggressive Plan",
      description: "Maximum payments targeting high-interest debts — fastest route to debt freedom",
    },
  ];

  return plans;
}

export type { PlanBuilderInput, PlanOption };
