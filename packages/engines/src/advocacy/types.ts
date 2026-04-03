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
  settlementAmount?: number;
}

export interface CreditorPlaybook {
  creditorId: string;
  creditorName: string;
  hardshipProcess: string[];
  typicalResponseDays: number;
  escalationPath: string[];
  ombudsmanScheme: string;
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
