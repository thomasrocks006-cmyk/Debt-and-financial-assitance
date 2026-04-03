import { toMonthly } from "@recoveryos/shared";
import type {
  AffordabilityInput,
  AffordabilityResult,
  BudgetTier,
} from "./types";

// Australian HEM (Household Expenditure Measure) benchmark placeholder
// These are approximate monthly values for a single adult
const HEM_FLOOR_MONTHLY = {
  food: 400,
  utilities: 150,
  transport: 200,
  healthcare: 100,
  personal: 150,
  total: 1200,
};

const BEHAVIOURAL_BUFFER_PERCENT = 0.15;

export function calculateAffordability(
  input: AffordabilityInput
): AffordabilityResult {
  const notes: string[] = [];

  // Calculate monthly income
  const monthlyIncome = input.incomeSources.reduce((sum, src) => {
    return sum + toMonthly(src.amount, src.frequency);
  }, 0);

  const unstableIncomeSources = input.incomeSources.filter(
    (s) => !s.isStable
  ).length;
  if (unstableIncomeSources > 0) {
    notes.push(`${unstableIncomeSources} unstable income source(s) detected`);
  }

  // Calculate monthly expenses (essential only for floor check)
  const monthlyExpenses = input.expenseItems.reduce((sum, exp) => {
    return sum + toMonthly(exp.amount, exp.frequency);
  }, 0);

  // Calculate monthly debt obligations (minimum payments)
  const monthlyDebtObligations = input.debtObligations.reduce((sum, debt) => {
    return sum + toMonthly(debt.minimumPayment, debt.frequency);
  }, 0);

  // Check HEM floor
  const essentialExpenses = input.expenseItems
    .filter((e) => e.isEssential)
    .reduce((sum, e) => sum + toMonthly(e.amount, e.frequency), 0);
  const hemFloorMet = essentialExpenses >= HEM_FLOOR_MONTHLY.total;

  if (!hemFloorMet) {
    notes.push("Essential expenses below HEM benchmark — may indicate under-reporting or extreme hardship");
  }

  // Check housing and utility risk
  const housingExpense = input.expenseItems
    .filter((e) => ["rent", "mortgage", "housing"].includes(e.category.toLowerCase()))
    .reduce((sum, e) => sum + toMonthly(e.amount, e.frequency), 0);
  const housingRisk = housingExpense / monthlyIncome > 0.4 || housingExpense === 0;

  const utilityExpense = input.expenseItems
    .filter((e) => ["utilities", "electricity", "gas", "water"].includes(e.category.toLowerCase()))
    .reduce((sum, e) => sum + toMonthly(e.amount, e.frequency), 0);
  const utilityRisk = utilityExpense === 0 && monthlyIncome > 0;

  if (housingRisk) notes.push("Housing expense exceeds 40% of income or not reported");
  if (utilityRisk) notes.push("No utility expenses reported — possible arrears");

  // Gross disposable income
  const grossDisposable = monthlyIncome - monthlyExpenses;

  // Apply behavioural buffer (15% reduction on disposable)
  const behaviouralBuffer = Math.max(0, grossDisposable) * BEHAVIOURAL_BUFFER_PERCENT;
  const disposableIncome = Math.max(0, grossDisposable - behaviouralBuffer);

  // Budget tiers
  // Survival: 40% of disposable (bare minimum)
  // Stabilisation: 70% of disposable
  // Recovery: 100% of disposable
  const survivalBudget: BudgetTier = {
    monthlyPaymentCapacity: Math.max(0, disposableIncome * 0.4),
    label: "Survival",
    description: "Minimum viable payment — covering essential debts only",
  };

  const stabilisationBudget: BudgetTier = {
    monthlyPaymentCapacity: Math.max(0, disposableIncome * 0.7),
    label: "Stabilisation",
    description: "Sustainable payment — prevents further deterioration",
  };

  const recoveryBudget: BudgetTier = {
    monthlyPaymentCapacity: Math.max(0, disposableIncome),
    label: "Recovery",
    description: "Full capacity payment — accelerates debt reduction",
  };

  // Confidence score based on data completeness
  let confidence = 1.0;
  if (input.incomeSources.length === 0) confidence -= 0.4;
  if (input.expenseItems.length < 3) confidence -= 0.2;
  if (unstableIncomeSources > 0) confidence -= 0.1;
  if (!hemFloorMet) confidence -= 0.1;
  confidence = Math.max(0, Math.min(1, confidence));

  return {
    monthlyIncome,
    monthlyExpenses,
    monthlyDebtObligations,
    disposableIncome,
    behaviouralBufferApplied: behaviouralBuffer,
    survivalBudget,
    stabilisationBudget,
    recoveryBudget,
    confidenceScore: Math.round(confidence * 100) / 100,
    housingRisk,
    utilityRisk,
    hemFloorMet,
    notes,
  };
}
