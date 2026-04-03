import { describe, it, expect } from "vitest";
import { buildPlans } from "../plan-builder";
import type { PlanBuilderInput } from "../plan-builder";

const defaultInput: PlanBuilderInput = {
  affordability: {
    totalIncome: 3200,
    totalExpenses: 2550,
    disposableIncome: 650,
    survivalBudget: { monthlyPaymentCapacity: 260 },
    stabilisationBudget: { monthlyPaymentCapacity: 450 },
    recoveryBudget: { monthlyPaymentCapacity: 650 },
  },
  debtAccounts: [
    {
      debtId: "d1",
      creditorName: "ANZ Bank",
      currentBalance: 7500,
      minimumPayment: 150,
      interestRate: 19.99,
    },
    {
      debtId: "d2",
      creditorName: "Latitude Finance",
      currentBalance: 9800,
      minimumPayment: 280,
      interestRate: 14.99,
    },
  ],
};

describe("Plan Builder", () => {
  it("generates exactly 3 plan options", () => {
    const plans = buildPlans(defaultInput);
    expect(plans).toHaveLength(3);
  });

  it("returns empty array for no debts", () => {
    const plans = buildPlans({
      ...defaultInput,
      debtAccounts: [],
    });
    expect(plans).toHaveLength(0);
  });

  it("survival plan has lowest monthly payment", () => {
    const plans = buildPlans(defaultInput);
    const survival = plans.find((p) => p.name === "survival");
    const balanced = plans.find((p) => p.name === "balanced");
    const aggressive = plans.find((p) => p.name === "aggressive");

    expect(survival).toBeDefined();
    expect(balanced).toBeDefined();
    expect(aggressive).toBeDefined();
    expect(survival!.monthlyPaymentAmount).toBeLessThan(balanced!.monthlyPaymentAmount);
    expect(balanced!.monthlyPaymentAmount).toBeLessThan(aggressive!.monthlyPaymentAmount);
  });

  it("aggressive plan has shortest total months", () => {
    const plans = buildPlans(defaultInput);
    const survival = plans.find((p) => p.name === "survival")!;
    const aggressive = plans.find((p) => p.name === "aggressive")!;

    expect(aggressive.totalMonths).toBeLessThan(survival.totalMonths);
  });

  it("all plans have allocations summing to total payment", () => {
    const plans = buildPlans(defaultInput);
    for (const plan of plans) {
      const totalAllocation = plan.allocations.reduce(
        (sum, a) => sum + a.monthlyPayment,
        0
      );
      // Allow small floating point differences
      expect(Math.abs(totalAllocation - plan.monthlyPaymentAmount)).toBeLessThan(1);
    }
  });

  it("all plans cover all debts", () => {
    const plans = buildPlans(defaultInput);
    for (const plan of plans) {
      expect(plan.allocations).toHaveLength(defaultInput.debtAccounts.length);
      for (const debt of defaultInput.debtAccounts) {
        expect(plan.allocations.some((a) => a.debtId === debt.debtId)).toBe(true);
      }
    }
  });

  it("survival plan has higher risk score than aggressive", () => {
    const plans = buildPlans(defaultInput);
    const survival = plans.find((p) => p.name === "survival")!;
    const aggressive = plans.find((p) => p.name === "aggressive")!;

    expect(survival.riskScore).toBeGreaterThan(aggressive.riskScore);
  });

  it("failure probability is between 0 and 1", () => {
    const plans = buildPlans(defaultInput);
    for (const plan of plans) {
      expect(plan.failureProbability).toBeGreaterThanOrEqual(0);
      expect(plan.failureProbability).toBeLessThanOrEqual(1);
    }
  });

  it("each plan has correct stage mapping", () => {
    const plans = buildPlans(defaultInput);
    const stages = new Map(plans.map((p) => [p.name, p.stage]));

    expect(stages.get("survival")).toBe("survive");
    expect(stages.get("balanced")).toBe("stabilise");
    expect(stages.get("aggressive")).toBe("recover");
  });
});
