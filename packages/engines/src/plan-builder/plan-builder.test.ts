import { describe, it, expect } from "vitest";
import { buildPlans } from "./index";
import {
  proRataAllocations,
  priorityAllocations,
  highInterestFirstAllocations,
  calculateFailureProbability,
} from "./strategies";
import { calculateAffordability } from "../affordability/calculator";

const debts = [
  { debtId: "d1", creditorName: "ANZ Bank", currentBalance: 7500, interestRate: 19.99, minimumPayment: 150 },
  { debtId: "d2", creditorName: "Latitude Finance", currentBalance: 9800, interestRate: 14.99, minimumPayment: 280 },
];

const affordabilityInput = {
  incomeSources: [{ source: "Employment", amount: 3200, frequency: "monthly", isStable: true }],
  expenseItems: [
    { category: "rent", amount: 1600, frequency: "monthly", isEssential: true },
    { category: "food", amount: 600, frequency: "monthly", isEssential: true },
    { category: "utilities", amount: 200, frequency: "monthly", isEssential: true },
    { category: "transport", amount: 150, frequency: "monthly", isEssential: true },
  ],
  debtObligations: [
    { debtId: "d1", creditorName: "ANZ", minimumPayment: 150, frequency: "monthly", interestRate: 19.99, currentBalance: 7500 },
    { debtId: "d2", creditorName: "Latitude", minimumPayment: 280, frequency: "monthly", interestRate: 14.99, currentBalance: 9800 },
  ],
};

describe("Plan Builder Engine", () => {
  const affordability = calculateAffordability(affordabilityInput);

  it("returns 3 plan options", () => {
    const plans = buildPlans({ affordability, debtAccounts: debts });
    expect(plans).toHaveLength(3);
  });

  it("each plan has a positive monthlyPaymentAmount", () => {
    const plans = buildPlans({ affordability, debtAccounts: debts });
    for (const plan of plans) {
      expect(plan.monthlyPaymentAmount).toBeGreaterThan(0);
    }
  });

  it("survival plan has lower payment than recovery plan", () => {
    const plans = buildPlans({ affordability, debtAccounts: debts });
    const survival = plans.find((p) => p.name === "survival");
    const recovery = plans.find((p) => p.name === "aggressive");
    expect(survival!.monthlyPaymentAmount).toBeLessThan(recovery!.monthlyPaymentAmount);
  });

  it("each plan has allocations for every debt", () => {
    const plans = buildPlans({ affordability, debtAccounts: debts });
    for (const plan of plans) {
      expect(plan.allocations).toHaveLength(debts.length);
    }
  });

  it("estimatedCompletionDate is in the future", () => {
    const plans = buildPlans({ affordability, debtAccounts: debts });
    for (const plan of plans) {
      expect(plan.estimatedCompletionDate.getTime()).toBeGreaterThan(Date.now());
    }
  });

  it("riskScore is between 0 and 10", () => {
    const plans = buildPlans({ affordability, debtAccounts: debts });
    for (const plan of plans) {
      expect(plan.riskScore).toBeGreaterThanOrEqual(0);
      expect(plan.riskScore).toBeLessThanOrEqual(10);
    }
  });

  it("failureProbability is between 0 and 1", () => {
    const plans = buildPlans({ affordability, debtAccounts: debts });
    for (const plan of plans) {
      expect(plan.failureProbability).toBeGreaterThanOrEqual(0);
      expect(plan.failureProbability).toBeLessThanOrEqual(1);
    }
  });

  it("returns empty array for empty debtAccounts", () => {
    const plans = buildPlans({ affordability, debtAccounts: [] });
    expect(plans).toHaveLength(0);
  });

  it("plans have labels and descriptions", () => {
    const plans = buildPlans({ affordability, debtAccounts: debts });
    for (const plan of plans) {
      expect(plan.label).toBeTruthy();
      expect(plan.description).toBeTruthy();
    }
  });
});

describe("Plan Builder Strategies", () => {
  const total = 500;

  it("proRata allocations sum to totalMonthly within rounding", () => {
    const allocs = proRataAllocations(total, debts);
    const sum = allocs.reduce((s, a) => s + a.monthlyPayment, 0);
    expect(sum).toBeCloseTo(total, 0);
  });

  it("proRata allocates proportional to balance", () => {
    const allocs = proRataAllocations(total, debts);
    const anzAlloc = allocs.find((a) => a.debtId === "d1")!;
    const latAlloc = allocs.find((a) => a.debtId === "d2")!;
    // ANZ has smaller balance so should get smaller allocation
    expect(latAlloc.monthlyPayment).toBeGreaterThan(anzAlloc.monthlyPayment);
  });

  it("priority allocations cover all minimum payments", () => {
    const debtsWithPriority = debts.map((d, i) => ({ ...d, priority: i + 1 }));
    const allocs = priorityAllocations(total, debtsWithPriority);
    for (const alloc of allocs) {
      const debt = debts.find((d) => d.debtId === alloc.debtId)!;
      expect(alloc.monthlyPayment).toBeGreaterThanOrEqual(debt.minimumPayment);
    }
  });

  it("highInterestFirst allocates most to ANZ (higher rate)", () => {
    const allocs = highInterestFirstAllocations(total, debts);
    const anzAlloc = allocs.find((a) => a.debtId === "d1")!;
    const latAlloc = allocs.find((a) => a.debtId === "d2")!;
    expect(anzAlloc.monthlyPayment).toBeGreaterThanOrEqual(latAlloc.monthlyPayment);
  });

  it("calculateFailureProbability returns lower risk for higher payment ratio", () => {
    const lowRisk = calculateFailureProbability(200, 1000);
    const highRisk = calculateFailureProbability(900, 1000);
    expect(lowRisk).toBeLessThan(highRisk);
  });

  it("calculateFailureProbability returns near-max risk when disposable <= 0", () => {
    const risk = calculateFailureProbability(500, 0);
    expect(risk).toBeGreaterThan(0.9);
  });
});
