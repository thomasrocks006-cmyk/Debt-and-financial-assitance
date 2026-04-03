import type {
  ComplianceCheckInput,
  ComplianceCheckResult,
  ComplianceIssue,
} from "./types";

/**
 * Check compliance requirements for a case
 * Based on ASIC Regulatory Guide 209, National Credit Code, and AFCA membership obligations
 */
export function checkCompliance(input: ComplianceCheckInput): ComplianceCheckResult {
  const blockingIssues: ComplianceIssue[] = [];
  const warnings: ComplianceIssue[] = [];

  // Required: Affordability assessment
  if (!input.hasAffordabilityAssessment) {
    blockingIssues.push({
      code: "MISSING_AFFORDABILITY",
      description: "No affordability assessment completed",
      severity: "blocking",
      remediation: "Complete income/expense assessment before activating any payment plan",
    });
  }

  // Required: Consent record
  if (!input.hasConsentRecord) {
    blockingIssues.push({
      code: "MISSING_CONSENT",
      description: "No consent record found",
      severity: "blocking",
      remediation: "Obtain explicit written or electronic consent before contacting creditors or sharing client data",
    });
  }

  // Required: Valid consent
  if (input.hasConsentRecord && !input.consentIsValid) {
    blockingIssues.push({
      code: "INVALID_CONSENT",
      description: "Consent has been revoked or is no longer valid",
      severity: "blocking",
      remediation: "Obtain new consent from client before proceeding",
    });
  }

  // Required: Fee disclosure
  if (!input.hasFeeDisclosure) {
    blockingIssues.push({
      code: "MISSING_FEE_DISCLOSURE",
      description: "Fee disclosure has not been delivered to client",
      severity: "blocking",
      remediation: "Deliver fee disclosure document and obtain acknowledgement",
    });
  }

  // Required: Service terms
  if (!input.hasServiceTermsDisclosure) {
    blockingIssues.push({
      code: "MISSING_SERVICE_TERMS",
      description: "Service terms disclosure not delivered",
      severity: "blocking",
      remediation: "Deliver service terms and conditions to client",
    });
  }

  // Warning: Complaint process disclosure
  if (!input.hasComplaintProcessDisclosure) {
    warnings.push({
      code: "MISSING_COMPLAINT_PROCESS",
      description: "Complaint process disclosure not delivered",
      severity: "warning",
      remediation: "Deliver complaint process information to client at next contact",
    });
  }

  // Warning: Privacy disclosure
  if (!input.hasPrivacyDisclosure) {
    warnings.push({
      code: "MISSING_PRIVACY_DISCLOSURE",
      description: "Privacy disclosure not delivered",
      severity: "warning",
      remediation: "Deliver privacy policy to client",
    });
  }

  // Warning: Consent recency
  if (input.hasConsentRecord && input.consentIsValid && !input.consentIsRecent) {
    warnings.push({
      code: "STALE_CONSENT",
      description: "Consent record is older than 12 months",
      severity: "warning",
      remediation: "Refresh consent with client at next interaction",
    });
  }

  return {
    caseId: input.caseId,
    isCompliant: blockingIssues.length === 0,
    blockingIssues,
    warnings,
    checkedAt: new Date(),
  };
}

export type { ComplianceCheckInput, ComplianceCheckResult, ComplianceIssue } from "./types";
