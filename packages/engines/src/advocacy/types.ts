export type HardshipLetterType =
  | "hardship_request"
  | "settlement_offer"
  | "freeze_request"
  | "reduction_request"
  | "dispute";

export interface HardshipLetterContext {
  clientName: string;
  creditorName: string;
  accountReference?: string;
  hardshipReason: string;
  proposedPayment?: number;
  proposedFrequency?: string;
  proposedDurationMonths?: number;
  settlementAmount?: number;
  settlementPercent?: number;
  currentInterestRate?: number;
  proposedInterestRate?: number;
}

export interface EscalationStep {
  step: number;
  contact: string;
  method: "phone" | "email" | "online" | "post";
  details: string;
}

export interface CreditorPlaybook {
  creditorId: string;
  creditorName: string;
  category: string;
  hardshipProcess: string[];
  typicalResponseDays: number;
  escalationPath: EscalationStep[];
  ombudsmanScheme: string;
  knownPolicies?: string[];
  notes?: string;
}

export interface AdvocacyAction {
  id: string;
  caseId: string;
  actionType: "call" | "letter" | "email" | "escalation" | "ombudsman";
  target: string;
  summary: string;
  outcome?: string;
  evidencePath?: string;
  createdAt: Date;
}
