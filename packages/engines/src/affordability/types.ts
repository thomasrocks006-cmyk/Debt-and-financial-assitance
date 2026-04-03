export interface IncomeSourceInput {
  source: string;
  amount: number;
  frequency: string;
  isStable: boolean;
}

export interface ExpenseItemInput {
  category: string;
  amount: number;
  frequency: string;
  isEssential: boolean;
}

export interface DebtObligationInput {
  debtId: string;
  creditorName: string;
  minimumPayment: number;
  frequency: string;
  interestRate?: number;
  currentBalance: number;
}

export interface AffordabilityInput {
  incomeSources: IncomeSourceInput[];
  expenseItems: ExpenseItemInput[];
  debtObligations: DebtObligationInput[];
}

export interface BudgetTier {
  monthlyPaymentCapacity: number;
  label: string;
  description: string;
}

export interface AffordabilityResult {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyDebtObligations: number;
  disposableIncome: number;
  behaviouralBufferApplied: number;

  survivalBudget: BudgetTier;
  stabilisationBudget: BudgetTier;
  recoveryBudget: BudgetTier;

  confidenceScore: number;   // 0-1
  housingRisk: boolean;
  utilityRisk: boolean;

  hemFloorMet: boolean;
  notes: string[];
}
