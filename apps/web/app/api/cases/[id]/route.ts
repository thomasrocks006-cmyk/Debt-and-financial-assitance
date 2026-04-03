import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/cases/[id] — returns full case detail including debts, compliance, and notes.
 */

const mockCases = [
  {
    id: "c1",
    clientName: "Alex Demo",
    status: "ASSESSMENT",
    crisisLevel: "MEDIUM",
    stage: "Stabilise",
    assignedTo: "Jane Smith",
  },
  {
    id: "c2",
    clientName: "Sarah Wilson",
    status: "CRISIS_STABILISATION",
    crisisLevel: "HIGH",
    stage: "Survive",
    assignedTo: "Jane Smith",
  },
  {
    id: "c3",
    clientName: "James Chen",
    status: "TRIAGE",
    crisisLevel: "LOW",
    stage: "Stabilise",
    assignedTo: null,
  },
  {
    id: "c4",
    clientName: "Maria Santos",
    status: "PLAN_DESIGN",
    crisisLevel: "MEDIUM",
    stage: "Stabilise",
    assignedTo: "Jane Smith",
  },
  {
    id: "c5",
    clientName: "Michael Brown",
    status: "CRISIS_STABILISATION",
    crisisLevel: "HIGH",
    stage: "Survive",
    assignedTo: "Jane Smith",
  },
  {
    id: "c6",
    clientName: "Emma Davis",
    status: "TRIAGE",
    crisisLevel: "HIGH",
    stage: "Survive",
    assignedTo: null,
  },
];

const caseDebts: Record<
  string,
  Array<{ creditor: string; type: string; balance: number; interest: number; arrears: number }>
> = {
  c1: [
    { creditor: "ANZ Bank", type: "Credit Card", balance: 7500, interest: 19.99, arrears: 300 },
    { creditor: "Latitude Finance", type: "Personal Loan", balance: 9800, interest: 14.99, arrears: 0 },
  ],
  c2: [
    { creditor: "CBA", type: "Credit Card", balance: 12000, interest: 21.49, arrears: 2500 },
    { creditor: "Westpac", type: "Mortgage", balance: 30000, interest: 5.99, arrears: 4500 },
  ],
  c3: [
    { creditor: "ATO", type: "Tax Debt", balance: 5500, interest: 7.07, arrears: 0 },
    { creditor: "Nimble", type: "Personal Loan", balance: 3000, interest: 48.0, arrears: 800 },
  ],
  c4: [
    { creditor: "Westpac", type: "Credit Card", balance: 8000, interest: 20.24, arrears: 0 },
    { creditor: "St.George", type: "Personal Loan", balance: 15000, interest: 12.99, arrears: 0 },
  ],
  c5: [
    { creditor: "Origin Energy", type: "Utility Debt", balance: 2200, interest: 0, arrears: 2200 },
    { creditor: "AGL", type: "Utility Debt", balance: 1800, interest: 0, arrears: 1800 },
    { creditor: "ANZ Bank", type: "Credit Card", balance: 11200, interest: 19.99, arrears: 0 },
  ],
  c6: [
    { creditor: "NAB", type: "Credit Card", balance: 14000, interest: 21.99, arrears: 3000 },
    { creditor: "Westpac", type: "Personal Loan", balance: 17000, interest: 14.49, arrears: 500 },
  ],
};

const caseCompliance: Record<
  string,
  Array<{ label: string; passed: boolean }>
> = {
  c1: [
    { label: "Consent recorded", passed: true },
    { label: "Affordability assessed", passed: true },
    { label: "Fee disclosure delivered", passed: true },
    { label: "Service terms provided", passed: true },
    { label: "Complaint process sent", passed: false },
    { label: "Privacy disclosure", passed: true },
  ],
  c2: [
    { label: "Consent recorded", passed: true },
    { label: "Affordability assessed", passed: true },
    { label: "Fee disclosure delivered", passed: true },
    { label: "Service terms provided", passed: true },
    { label: "Complaint process sent", passed: true },
    { label: "Privacy disclosure", passed: true },
  ],
  c3: [
    { label: "Consent recorded", passed: false },
    { label: "Affordability assessed", passed: true },
    { label: "Fee disclosure delivered", passed: false },
    { label: "Service terms provided", passed: false },
    { label: "Complaint process sent", passed: false },
    { label: "Privacy disclosure", passed: false },
  ],
  c4: [
    { label: "Consent recorded", passed: true },
    { label: "Affordability assessed", passed: true },
    { label: "Fee disclosure delivered", passed: true },
    { label: "Service terms provided", passed: true },
    { label: "Complaint process sent", passed: true },
    { label: "Privacy disclosure", passed: true },
  ],
  c5: [
    { label: "Consent recorded", passed: true },
    { label: "Affordability assessed", passed: false },
    { label: "Fee disclosure delivered", passed: true },
    { label: "Service terms provided", passed: true },
    { label: "Complaint process sent", passed: false },
    { label: "Privacy disclosure", passed: true },
  ],
  c6: [
    { label: "Consent recorded", passed: false },
    { label: "Affordability assessed", passed: false },
    { label: "Fee disclosure delivered", passed: false },
    { label: "Service terms provided", passed: false },
    { label: "Complaint process sent", passed: false },
    { label: "Privacy disclosure", passed: false },
  ],
};

const caseNotes: Record<
  string,
  Array<{ author: string; time: string; text: string }>
> = {
  c1: [
    {
      author: "Jane Smith",
      time: "2 days ago",
      text: "Initial assessment completed. Client in stabilise phase. ANZ hardship application to be submitted.",
    },
  ],
  c2: [
    {
      author: "Jane Smith",
      time: "1 day ago",
      text: "Eviction notice received. Urgent referral to tenancy support. Safety assessment completed — no immediate safety concerns.",
    },
    {
      author: "System",
      time: "1 day ago",
      text: "Auto-triage: CRITICAL → HIGH after initial stabilisation. Service streams: RENTAL_STRESS, FAMILY_VIOLENCE.",
    },
  ],
  c3: [
    {
      author: "System",
      time: "14 days ago",
      text: "Case created via triage. No case manager assigned. Awaiting intake.",
    },
  ],
  c4: [
    {
      author: "Jane Smith",
      time: "7 days ago",
      text: "Budget analysis completed. Surplus of $180/mo identified for debt repayment.",
    },
  ],
  c5: [
    {
      author: "Jane Smith",
      time: "1 day ago",
      text: "Utility hardship applications submitted to Origin and AGL. Awaiting response.",
    },
  ],
  c6: [
    {
      author: "System",
      time: "Today",
      text: "New case created. High crisis level — urgent triage required.",
    },
  ],
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const found = mockCases.find((c) => c.id === id);

  if (!found) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: found.id,
    name: found.clientName,
    status: found.status,
    crisisLevel: found.crisisLevel,
    stage: found.stage,
    caseManager: found.assignedTo ?? "Unassigned",
    debts: caseDebts[id] ?? [],
    compliance: caseCompliance[id] ?? [],
    notes: caseNotes[id] ?? [],
  });
}
