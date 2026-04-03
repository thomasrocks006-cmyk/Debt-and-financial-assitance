export interface ComplianceCheckResult {
  caseId: string;
  isCompliant: boolean;
  blockingIssues: ComplianceIssue[];
  warnings: ComplianceIssue[];
  checkedAt: Date;
}

export interface ComplianceIssue {
  code: string;
  description: string;
  severity: "blocking" | "warning";
  remediation: string;
}

export interface ComplianceCheckInput {
  caseId: string;
  hasAffordabilityAssessment: boolean;
  hasConsentRecord: boolean;
  hasFeeDisclosure: boolean;
  hasServiceTermsDisclosure: boolean;
  hasComplaintProcessDisclosure: boolean;
  hasPrivacyDisclosure: boolean;
  consentIsValid: boolean;
  consentIsRecent: boolean;
}
