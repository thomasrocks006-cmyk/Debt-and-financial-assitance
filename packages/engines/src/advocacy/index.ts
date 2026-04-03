import type {
  HardshipLetterType,
  HardshipLetterContext,
  CreditorPlaybook,
  EscalationStep,
} from "./types";

/**
 * Generate a hardship letter template with complete, professional formatting
 * suitable for Australian creditor hardship teams.
 */
export function generateHardshipLetter(
  type: HardshipLetterType,
  context: HardshipLetterContext
): string {
  const { clientName, creditorName, accountReference, hardshipReason, proposedPayment, proposedFrequency } = context;
  const ref = accountReference ? `\nAccount Reference: ${accountReference}` : "";
  const date = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });

  const header = `Date: ${date}\n\nTo: ${creditorName} Hardship Team${ref}\n\n`;
  const footer = `\n\nI look forward to your response within 21 days as required under the National Credit Code.\n\nSincerely,\n${clientName}`;

  const templates: Record<HardshipLetterType, string> = {
    hardship_request: `${header}Dear Hardship Team,

I am writing to formally request a hardship arrangement under section 72 of the National Credit Code.

I, ${clientName}, am currently experiencing financial hardship due to ${hardshipReason}. This situation has significantly impacted my ability to meet my regular repayment obligations.

I am requesting a temporary reduction in my repayments to ${proposedPayment ? `$${proposedPayment} ${proposedFrequency ?? "per month"}` : "an amount I can afford"} for a period of ${context.proposedDurationMonths ?? 3} months while I work to stabilise my financial situation.

I am committed to meeting my obligations and am actively working with a financial counsellor to develop a sustainable budget. I have attached my current income and expense statement for your review.

I understand that under the National Credit Code, you are required to consider this request and respond within 21 days.${footer}`,

    settlement_offer: `${header}Dear Collections/Hardship Team,

I am writing to propose a full and final settlement of my account.

Due to ${hardshipReason}, I am unable to continue with regular repayments and my financial position is unlikely to improve in the foreseeable future.

After careful assessment of my financial situation with my financial counsellor, I am able to offer a lump sum settlement of $${context.settlementAmount ?? "TBD"} in full and final satisfaction of this debt. This represents ${context.settlementPercent ? `${context.settlementPercent}%` : "a significant portion"} of the outstanding balance.

I believe this offer represents a better outcome for both parties than continued enforcement action, given my current financial circumstances.

If this offer is accepted, I request written confirmation that:
1. The debt will be considered settled in full
2. No further collection activity will occur
3. The settlement will be reported appropriately to credit bureaus${footer}`,

    freeze_request: `${header}Dear Hardship Team,

I am requesting a temporary freeze on all interest charges, fees, and penalties on my account for a period of 90 days.

I am currently experiencing financial hardship due to ${hardshipReason} and require this temporary relief to:
- Stabilise my financial situation
- Develop a sustainable repayment plan with my financial counsellor
- Prevent the debt from growing while I am unable to make meaningful payments

During this freeze period, I ${proposedPayment ? `am able to make reduced payments of $${proposedPayment} ${proposedFrequency ?? "per month"}` : "will work with my financial counsellor to determine what payments I can sustain"}.

I understand this is a temporary measure and I am committed to resuming regular payments once my situation stabilises.${footer}`,

    reduction_request: `${header}Dear Hardship Team,

I am requesting a reduction in the interest rate and/or fees on my account due to ongoing financial hardship.

Reason for hardship: ${hardshipReason}

My current interest rate of ${context.currentInterestRate ? `${context.currentInterestRate}%` : "the current rate"} is making it extremely difficult for me to make meaningful progress on reducing my balance. A lower rate would enable me to continue making regular payments and work towards resolving this debt.

I am requesting that my interest rate be reduced to ${context.proposedInterestRate ? `${context.proposedInterestRate}%` : "a more manageable rate"} for a period of 12 months, with a review at that time.

I am currently working with a financial counsellor and am committed to maintaining regular payments.${footer}`,

    dispute: `${header}Dear Disputes Team,

I am writing to formally dispute the following regarding my account:

${hardshipReason}

Under the Australian Consumer Law and the National Credit Code, I request:
1. A full review and investigation of this matter
2. A detailed statement of all transactions, fees, and charges applied to my account
3. Copies of all relevant documentation including the original credit contract
4. That all collection activity be paused while this dispute is under investigation

I understand you have 21 days to acknowledge this dispute and 45 days to provide a substantive response. If I am not satisfied with your response, I will escalate this matter to the Australian Financial Complaints Authority (AFCA).${footer}`,
  };

  return templates[type];
}

/**
 * Get creditor playbook by ID — covers all 10 major Australian creditors
 */
export function getCreditorPlaybook(creditorId: string): CreditorPlaybook | null {
  const playbooks: Record<string, CreditorPlaybook> = {
    anz: {
      creditorId: "anz",
      creditorName: "ANZ Bank",
      category: "bank",
      hardshipProcess: [
        "Call hardship team on 1800 252 845",
        "Submit hardship application online at anz.com.au/support/financial-hardship",
        "Provide income/expense statement (SOA template available)",
        "Wait up to 21 days for response",
        "If declined, request reasons in writing",
      ],
      typicalResponseDays: 21,
      escalationPath: [
        { step: 1, contact: "Hardship Team", method: "phone", details: "1800 252 845" },
        { step: 2, contact: "Customer Relations Manager", method: "email", details: "customer.relations@anz.com" },
        { step: 3, contact: "AFCA", method: "online", details: "www.afca.org.au" },
      ],
      ombudsmanScheme: "AFCA",
      knownPolicies: [
        "21-day response guarantee",
        "Will consider moratorium up to 6 months",
        "Accepts financial counsellor advocacy on behalf of clients",
        "Has online hardship application form",
      ],
      notes: "ANZ has a dedicated hardship team and generally responsive. They accept applications via phone, online, or in-branch.",
    },
    cba: {
      creditorId: "cba",
      creditorName: "Commonwealth Bank",
      category: "bank",
      hardshipProcess: [
        "Call 1300 720 814 or visit a branch",
        "Complete the CommBank Care application",
        "Provide supporting documents (payslips, Centrelink statements)",
        "CBA may offer reduced payments, interest rate reduction, or moratorium",
      ],
      typicalResponseDays: 21,
      escalationPath: [
        { step: 1, contact: "Care Team", method: "phone", details: "1300 720 814" },
        { step: 2, contact: "Customer Relations Manager", method: "email", details: "customer.relations@cba.com.au" },
        { step: 3, contact: "AFCA", method: "online", details: "www.afca.org.au" },
      ],
      ombudsmanScheme: "AFCA",
      knownPolicies: [
        "CommBank Care program for hardship customers",
        "Can freeze interest for up to 90 days",
        "Offers payment holidays up to 3 months",
      ],
    },
    westpac: {
      creditorId: "westpac",
      creditorName: "Westpac",
      category: "bank",
      hardshipProcess: [
        "Call 1800 067 497 for hardship assistance",
        "Request a financial hardship application",
        "Provide statement of affairs and supporting documentation",
        "Westpac will assess and offer arrangement options",
      ],
      typicalResponseDays: 21,
      escalationPath: [
        { step: 1, contact: "Hardship Team", method: "phone", details: "1800 067 497" },
        { step: 2, contact: "Customer Advocate", method: "email", details: "customeradvocate@westpac.com.au" },
        { step: 3, contact: "AFCA", method: "online", details: "www.afca.org.au" },
      ],
      ombudsmanScheme: "AFCA",
      knownPolicies: [
        "Has a dedicated Customer Advocate role",
        "Offers tailored repayment arrangements",
        "Will consider debt waivers in extreme cases",
      ],
    },
    nab: {
      creditorId: "nab",
      creditorName: "NAB",
      category: "bank",
      hardshipProcess: [
        "Call NAB Assist on 1800 701 599",
        "Complete financial hardship assessment",
        "Provide income and expense details",
        "NAB will propose an arrangement within 21 days",
      ],
      typicalResponseDays: 21,
      escalationPath: [
        { step: 1, contact: "NAB Assist", method: "phone", details: "1800 701 599" },
        { step: 2, contact: "Customer Resolution", method: "phone", details: "1800 152 015" },
        { step: 3, contact: "AFCA", method: "online", details: "www.afca.org.au" },
      ],
      ombudsmanScheme: "AFCA",
      knownPolicies: [
        "NAB Assist dedicated hardship team",
        "Offers interest-only periods and reduced payments",
        "Has proactive outreach program for at-risk customers",
      ],
    },
    latitude: {
      creditorId: "latitude",
      creditorName: "Latitude Finance",
      category: "bnpl",
      hardshipProcess: [
        "Call 1300 655 505 and request hardship",
        "Complete online hardship application at latitudefinancial.com.au/hardship",
        "Provide statement of financial position",
        "Latitude may offer reduced payments or interest freeze",
      ],
      typicalResponseDays: 21,
      escalationPath: [
        { step: 1, contact: "Hardship Team", method: "phone", details: "1300 655 505" },
        { step: 2, contact: "Complaints Team", method: "email", details: "complaints@latitudefinancial.com" },
        { step: 3, contact: "AFCA", method: "online", details: "www.afca.org.au" },
      ],
      ombudsmanScheme: "AFCA",
      knownPolicies: [
        "Offers payment arrangements for minimum 90 days",
        "Will consider settlement offers at 60-80% of balance",
        "Accepts financial counsellor advocacy",
      ],
    },
    afterpay: {
      creditorId: "afterpay",
      creditorName: "Afterpay",
      category: "bnpl",
      hardshipProcess: [
        "Contact through the Afterpay app or website",
        "Submit a hardship request via help.afterpay.com",
        "Afterpay will review and may pause late fees or adjust payment schedule",
      ],
      typicalResponseDays: 14,
      escalationPath: [
        { step: 1, contact: "Customer Support", method: "online", details: "help.afterpay.com" },
        { step: 2, contact: "Complaints Team", method: "email", details: "complaints@afterpay.com.au" },
        { step: 3, contact: "AFCA", method: "online", details: "www.afca.org.au" },
      ],
      ombudsmanScheme: "AFCA",
      knownPolicies: [
        "Will pause late fees during hardship assessment",
        "Can adjust payment schedule",
        "No interest charges but late fees apply",
      ],
    },
    zip: {
      creditorId: "zip",
      creditorName: "Zip Pay / Zip Money",
      category: "bnpl",
      hardshipProcess: [
        "Contact Zip support through the app or website",
        "Request financial hardship assistance",
        "Zip will assess and may offer modified payment terms",
      ],
      typicalResponseDays: 14,
      escalationPath: [
        { step: 1, contact: "Support Team", method: "online", details: "help.zip.co" },
        { step: 2, contact: "Complaints", method: "email", details: "complaints@zip.co" },
        { step: 3, contact: "AFCA", method: "online", details: "www.afca.org.au" },
      ],
      ombudsmanScheme: "AFCA",
      knownPolicies: [
        "Will freeze account during hardship assessment",
        "Can offer extended payment terms",
      ],
    },
    energy_aus: {
      creditorId: "energy_aus",
      creditorName: "AGL Energy",
      category: "energy_utility",
      hardshipProcess: [
        "Call AGL hardship team on 131 245",
        "Ask to be placed on the Staying Connected program",
        "AGL will assess eligibility for payment plans and energy efficiency support",
        "May be eligible for government energy rebates",
      ],
      typicalResponseDays: 10,
      escalationPath: [
        { step: 1, contact: "Staying Connected Team", method: "phone", details: "131 245" },
        { step: 2, contact: "AGL Complaints", method: "phone", details: "1800 775 329" },
        { step: 3, contact: "Energy Ombudsman", method: "online", details: "State-based Energy Ombudsman" },
      ],
      ombudsmanScheme: "Energy Ombudsman (state-based)",
      knownPolicies: [
        "Cannot disconnect customers on hardship programs",
        "Must offer payment plans",
        "Staying Connected program provides tailored support",
        "Can assist with government rebate applications",
      ],
      notes: "Energy companies cannot disconnect customers experiencing payment difficulty without going through the hardship process first.",
    },
    origin: {
      creditorId: "origin",
      creditorName: "Origin Energy",
      category: "energy_utility",
      hardshipProcess: [
        "Call 132 461 and ask for the Power On program",
        "Origin will assess your situation and offer tailored support",
        "May include payment plans, bill smoothing, or energy efficiency audits",
      ],
      typicalResponseDays: 10,
      escalationPath: [
        { step: 1, contact: "Power On Team", method: "phone", details: "132 461" },
        { step: 2, contact: "Origin Complaints", method: "phone", details: "1800 789 230" },
        { step: 3, contact: "Energy Ombudsman", method: "online", details: "State-based Energy Ombudsman" },
      ],
      ombudsmanScheme: "Energy Ombudsman (state-based)",
      knownPolicies: [
        "Power On hardship program",
        "Cannot disconnect during hardship assessment",
        "Offers bill smoothing and energy audits",
      ],
    },
    telstra: {
      creditorId: "telstra",
      creditorName: "Telstra",
      category: "telco",
      hardshipProcess: [
        "Call 1800 211 961 for financial hardship",
        "Telstra's Access for Everyone team will assess your situation",
        "May offer reduced plan, payment plan, or restriction of services instead of disconnection",
      ],
      typicalResponseDays: 14,
      escalationPath: [
        { step: 1, contact: "Access for Everyone", method: "phone", details: "1800 211 961" },
        { step: 2, contact: "Telstra Complaints", method: "phone", details: "132 200" },
        { step: 3, contact: "TIO (Telecommunications Industry Ombudsman)", method: "online", details: "www.tio.com.au" },
      ],
      ombudsmanScheme: "TIO",
      knownPolicies: [
        "Access for Everyone hardship program",
        "Must maintain basic access during hardship",
        "Can offer lower-cost plans",
        "TIO complaints handled separately from AFCA",
      ],
      notes: "Telstra uses TIO not AFCA for dispute resolution.",
    },
  };

  return playbooks[creditorId] ?? null;
}

/**
 * Get all available creditor playbooks
 */
export function getAllCreditorPlaybooks(): CreditorPlaybook[] {
  const ids = ["anz", "cba", "westpac", "nab", "latitude", "afterpay", "zip", "energy_aus", "origin", "telstra"];
  return ids.map((id) => getCreditorPlaybook(id)).filter((p): p is CreditorPlaybook => p !== null);
}

/**
 * Recommend the best letter type based on the debt situation
 */
export function recommendLetterType(context: {
  arrears: number;
  balance: number;
  monthsSinceDefault: number;
  hasSettlementFunds: boolean;
  creditorCategory: string;
}): { type: HardshipLetterType; reason: string } {
  if (context.hasSettlementFunds && context.monthsSinceDefault > 6) {
    return {
      type: "settlement_offer",
      reason: "Debt is old and client has settlement funds — a lump sum offer may be accepted",
    };
  }
  if (context.arrears === 0) {
    return {
      type: "hardship_request",
      reason: "Client is not yet in arrears — a proactive hardship request is the best approach",
    };
  }
  if (context.creditorCategory === "energy_utility") {
    return {
      type: "freeze_request",
      reason: "Utility providers must offer hardship programs — request a freeze while situation stabilises",
    };
  }
  if (context.arrears > context.balance * 0.3) {
    return {
      type: "freeze_request",
      reason: "Significant arrears — request a freeze to prevent further deterioration",
    };
  }
  return {
    type: "hardship_request",
    reason: "Standard hardship request — the default approach for most situations",
  };
}

export type { HardshipLetterType, HardshipLetterContext, CreditorPlaybook, AdvocacyAction, EscalationStep } from "./types";
