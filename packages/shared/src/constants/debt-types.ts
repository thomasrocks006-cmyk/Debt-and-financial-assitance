import type { DebtType } from "../types/debt";

export interface DebtTypeInfo {
  type: DebtType;
  label: string;
  description: string;
  priority: number; // 1 = highest
  isSecured: boolean;
  regulatedBy?: string;
}

export const DEBT_TYPES: Record<DebtType, DebtTypeInfo> = {
  MORTGAGE: {
    type: "MORTGAGE",
    label: "Home Loan / Mortgage",
    description: "Secured loan against property",
    priority: 1,
    isSecured: true,
    regulatedBy: "NCCP Act",
  },
  RENT_ARREARS: {
    type: "RENT_ARREARS",
    label: "Rent Arrears",
    description: "Overdue rental payments",
    priority: 2,
    isSecured: false,
  },
  UTILITY_BILL: {
    type: "UTILITY_BILL",
    label: "Utility Bill",
    description: "Gas, electricity, water bills",
    priority: 3,
    isSecured: false,
    regulatedBy: "Energy Retail Code",
  },
  TAX_DEBT: {
    type: "TAX_DEBT",
    label: "Tax Debt",
    description: "ATO or state revenue debt",
    priority: 4,
    isSecured: false,
    regulatedBy: "Tax Administration Act",
  },
  CAR_LOAN: {
    type: "CAR_LOAN",
    label: "Car Loan",
    description: "Secured vehicle finance",
    priority: 5,
    isSecured: true,
    regulatedBy: "NCCP Act",
  },
  PAYDAY_LOAN: {
    type: "PAYDAY_LOAN",
    label: "Payday Loan / Small Amount Credit",
    description: "Short-term, high-cost credit",
    priority: 6,
    isSecured: false,
    regulatedBy: "NCCP Act (SACC)",
  },
  PERSONAL_LOAN: {
    type: "PERSONAL_LOAN",
    label: "Personal Loan",
    description: "Unsecured personal lending",
    priority: 7,
    isSecured: false,
    regulatedBy: "NCCP Act",
  },
  CREDIT_CARD: {
    type: "CREDIT_CARD",
    label: "Credit Card",
    description: "Revolving credit facility",
    priority: 8,
    isSecured: false,
    regulatedBy: "NCCP Act",
  },
  BNPL: {
    type: "BNPL",
    label: "Buy Now Pay Later",
    description: "AfterPay, Zip, Klarna etc.",
    priority: 9,
    isSecured: false,
  },
  TELCO: {
    type: "TELCO",
    label: "Telco Debt",
    description: "Phone and internet bills",
    priority: 10,
    isSecured: false,
    regulatedBy: "Telco Consumer Protections",
  },
  MEDICAL_DEBT: {
    type: "MEDICAL_DEBT",
    label: "Medical Debt",
    description: "Hospital and healthcare bills",
    priority: 11,
    isSecured: false,
  },
  OTHER: {
    type: "OTHER",
    label: "Other Debt",
    description: "Other financial obligations",
    priority: 12,
    isSecured: false,
  },
};

export const DEBT_TYPE_OPTIONS = Object.values(DEBT_TYPES).sort(
  (a, b) => a.priority - b.priority
);
