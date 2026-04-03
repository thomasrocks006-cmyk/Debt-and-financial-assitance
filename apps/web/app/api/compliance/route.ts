import { NextResponse } from "next/server";

/**
 * GET /api/compliance — returns compliance status for all cases.
 * POST /api/compliance/check — run compliance engine on a specific case.
 */

export async function GET() {
  const items = [
    {
      caseId: "c1",
      clientName: "Alex Demo",
      affordabilityAssessed: true,
      consentRecorded: true,
      consentValid: true,
      feeDisclosure: true,
      serviceTerms: true,
      complaintProcess: false,
      privacyDisclosure: true,
      isCompliant: false,
      issues: [
        {
          requirement: "Complaint process disclosure",
          severity: "warning",
          remediation: "Send complaint handling process document to client",
        },
      ],
    },
    {
      caseId: "c2",
      clientName: "Sarah Wilson",
      affordabilityAssessed: true,
      consentRecorded: true,
      consentValid: true,
      feeDisclosure: true,
      serviceTerms: true,
      complaintProcess: true,
      privacyDisclosure: true,
      isCompliant: true,
      issues: [],
    },
    {
      caseId: "c3",
      clientName: "James Chen",
      affordabilityAssessed: true,
      consentRecorded: false,
      consentValid: false,
      feeDisclosure: false,
      serviceTerms: false,
      complaintProcess: false,
      privacyDisclosure: false,
      isCompliant: false,
      issues: [
        {
          requirement: "Consent record",
          severity: "blocking",
          remediation: "Obtain and record client consent before proceeding",
        },
        {
          requirement: "Fee disclosure",
          severity: "blocking",
          remediation: "Deliver fee disclosure document and record acknowledgement",
        },
        {
          requirement: "Service terms",
          severity: "blocking",
          remediation: "Provide service terms and record acceptance",
        },
        {
          requirement: "Complaint process",
          severity: "warning",
          remediation: "Send complaint handling process document",
        },
      ],
    },
  ];

  const compliant = items.filter((c) => c.isCompliant).length;

  return NextResponse.json({
    items,
    summary: {
      total: items.length,
      compliant,
      nonCompliant: items.length - compliant,
      complianceRate: Math.round((compliant / items.length) * 100),
      blockingIssues: items.reduce(
        (s, c) => s + c.issues.filter((i) => i.severity === "blocking").length,
        0,
      ),
      warnings: items.reduce(
        (s, c) => s + c.issues.filter((i) => i.severity === "warning").length,
        0,
      ),
    },
    checkedAt: new Date().toISOString(),
  });
}
