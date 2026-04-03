export type DebtType =
  | "CREDIT_CARD"
  | "PERSONAL_LOAN"
  | "CAR_LOAN"
  | "MORTGAGE"
  | "BNPL"
  | "PAYDAY_LOAN"
  | "UTILITY_BILL"
  | "RENT_ARREARS"
  | "TAX_DEBT"
  | "MEDICAL_DEBT"
  | "TELCO"
  | "OTHER";

export type DebtStatus =
  | "ACTIVE"
  | "IN_HARDSHIP"
  | "NEGOTIATING"
  | "SETTLED"
  | "PAID_OFF"
  | "WRITTEN_OFF"
  | "REFERRED";

export interface DebtAccount {
  id: string;
  clientId: string;
  caseId?: string;
  creditorName: string;
  debtType: DebtType;
  originalBalance: number;
  currentBalance: number;
  minimumPayment?: number;
  interestRate?: number;
  arrearsAmount?: number;
  status: DebtStatus;
  externalReference?: string;
  isCoercedDebt: boolean;
  createdAt: Date;
  updatedAt: Date;
}
