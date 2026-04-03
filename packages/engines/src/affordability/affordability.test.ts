import { describe, it, expect } from "vitest";
import { calculateAffordability } from "./index";

const baseInput = {
  incomeSources: [
    { source: "Employment", amount: 3200, frequency: "monthly", isStable: true },
  ],
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

describe("Affordability Engine", () => {
  it("calculates monthly income correctly", () => {
    const result = calculateAffordability(baseInput);
    expect(result.monthlyIncome).toBe(3200);
  });

  it("calculates monthly expenses correctly", () => {
    const result = calculateAffordability(baseInput);
    expect(result.monthlyExpenses).toBe(2550);
  });

  it("calculates disposable income with behavioural buffer", () => {
    const result = calculateAffordability(baseInput);
    // Gross disposable = 3200 - 2550 = 650
    // Buffer = 650 * 0.15 = 97.5
    // Net disposable = 650 - 97.5 = 552.5
    expect(result.disposableIncome).toBeCloseTo(552.5, 0);
    expect(result.behaviouralBufferApplied).toBeCloseTo(97.5, 0);
  });

  it("returns 3 budget tiers with positive amounts", () => {
    const result = calculateAffordability(baseInput);
    expect(result.survivalBudget.monthlyPaymentCapacity).toBeGreaterThan(0);
    expect(result.stabilisationBudget.monthlyPaymentCapacity).toBeGreaterThan(0);
    expect(result.recoveryBudget.monthlyPaymentCapacity).toBeGreaterThan(0);
  });

  it("survival budget is less than recovery budget", () => {
    const result = calculateAffordability(baseInput);
    expect(result.survivalBudget.monthlyPaymentCapacity).toBeLessThan(
      result.recoveryBudget.monthlyPaymentCapacity
    );
  });

  it("returns low confidence when no income sources", () => {
    const result = calculateAffordability({
      ...baseInput,
      incomeSources: [],
    });
    expect(result.confidenceScore).toBeLessThan(0.7);
  });

  it("converts weekly income to monthly correctly", () => {
    const result = calculateAffordability({
      incomeSources: [
        { source: "Employment", amount: 800, frequency: "weekly", isStable: true },
      ],
      expenseItems: [],
      debtObligations: [],
    });
    // 800 * 52 / 12 = ~3466.67
    expect(result.monthlyIncome).toBeCloseTo(3466.67, 0);
  });

  it("detects housing risk when rent > 40% of income", () => {
    const result = calculateAffordability({
      incomeSources: [
        { source: "Employment", amount: 2000, frequency: "monthly", isStable: true },
      ],
      expenseItems: [
        { category: "rent", amount: 1000, frequency: "monthly", isEssential: true },
      ],
      debtObligations: [],
    });
    expect(result.housingRisk).toBe(true);
  });
});
