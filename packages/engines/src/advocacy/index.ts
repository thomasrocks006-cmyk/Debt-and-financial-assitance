import type {
  HardshipLetterType,
  HardshipLetterContext,
  CreditorPlaybook,
} from "./types";

/**
 * Generate a hardship letter template
 * TODO: Replace with full template engine + AI generation
 */
export function generateHardshipLetter(
  type: HardshipLetterType,
  context: HardshipLetterContext
): string {
  const { clientName, creditorName, accountReference, hardshipReason, proposedPayment, proposedFrequency } = context;
  const ref = accountReference ? `\nAccount Reference: ${accountReference}` : "";

  const templates: Record<HardshipLetterType, string> = {
    hardship_request: `Dear ${creditorName} Hardship Team,

I am writing to request a hardship arrangement for my account.${ref}

I, ${clientName}, am currently experiencing financial hardship due to ${hardshipReason}.

I am requesting a temporary reduction in my repayments to ${proposedPayment ? `$${proposedPayment} ${proposedFrequency ?? "per month"}` : "an amount I can afford"} while I work to stabilise my financial situation.

I understand my obligations and am committed to resolving this debt. I would appreciate your consideration of this request.

Please contact me to discuss.

Sincerely,
${clientName}`,

    settlement_offer: `Dear ${creditorName},

I am writing to propose a full and final settlement of my account.${ref}

Due to ${hardshipReason}, I am unable to continue with regular repayments. I am able to offer a lump sum settlement of $${context.settlementAmount ?? "TBD"} in full satisfaction of this debt.

I look forward to your response.

Sincerely,
${clientName}`,

    freeze_request: `Dear ${creditorName} Hardship Team,

I am requesting a temporary freeze on my account.${ref}

I am currently experiencing financial hardship due to ${hardshipReason} and require a 90-day pause on interest and fees to allow me to stabilise my situation.

Sincerely,
${clientName}`,

    reduction_request: `Dear ${creditorName},

I am requesting a reduction in my interest rate and fees due to financial hardship.${ref}

Reason: ${hardshipReason}

Sincerely,
${clientName}`,

    dispute: `Dear ${creditorName},

I am writing to formally dispute this account.${ref}

Reason: ${hardshipReason}

I request a full review of this matter.

Sincerely,
${clientName}`,
  };

  return templates[type];
}

/**
 * Get creditor playbook by ID
 * TODO: Replace with database lookup
 */
export function getCreditorPlaybook(creditorId: string): CreditorPlaybook | null {
  const playbooks: Record<string, CreditorPlaybook> = {
    anz: {
      creditorId: "anz",
      creditorName: "ANZ Bank",
      hardshipProcess: [
        "Call hardship team on 1800 252 845",
        "Submit hardship application online or in writing",
        "Provide income/expense statement",
        "Wait up to 21 days for response",
      ],
      typicalResponseDays: 21,
      escalationPath: ["Hardship Team", "Customer Relations", "AFCA"],
      ombudsmanScheme: "AFCA",
    },
    cba: {
      creditorId: "cba",
      creditorName: "Commonwealth Bank",
      hardshipProcess: [
        "Call 1300 720 814 or visit branch",
        "Complete Care application",
        "Provide supporting documents",
      ],
      typicalResponseDays: 21,
      escalationPath: ["Care Team", "Customer Relations Manager", "AFCA"],
      ombudsmanScheme: "AFCA",
    },
  };

  return playbooks[creditorId] ?? null;
}

export type { HardshipLetterType, HardshipLetterContext, CreditorPlaybook, AdvocacyAction } from "./types";
