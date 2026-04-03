import { NextResponse } from "next/server";

/**
 * GET /api/cases — list all cases (mock data)
 *
 * In production this would query the database via Prisma.
 */

const mockCases = [
  {
    id: "c1",
    clientName: "Alex Demo",
    clientId: "usr_client",
    status: "ASSESSMENT",
    crisisLevel: "MEDIUM",
    stage: "stabilise",
    totalDebt: 17300,
    assignedTo: "Jane Smith",
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-04-01T14:30:00Z",
    daysSinceUpdate: 3,
    serviceStreams: ["DEBT_MANAGEMENT"],
  },
  {
    id: "c2",
    clientName: "Sarah Wilson",
    clientId: "usr_c2",
    status: "CRISIS_STABILISATION",
    crisisLevel: "HIGH",
    stage: "survive",
    totalDebt: 42000,
    assignedTo: "Jane Smith",
    createdAt: "2026-04-01T08:00:00Z",
    updatedAt: "2026-04-02T16:00:00Z",
    daysSinceUpdate: 1,
    serviceStreams: ["FAMILY_VIOLENCE", "RENTAL_STRESS"],
  },
  {
    id: "c3",
    clientName: "James Chen",
    clientId: "usr_c3",
    status: "TRIAGE",
    crisisLevel: "LOW",
    stage: "stabilise",
    totalDebt: 8500,
    assignedTo: null,
    createdAt: "2026-03-20T12:00:00Z",
    updatedAt: "2026-03-20T12:00:00Z",
    daysSinceUpdate: 14,
    serviceStreams: ["DEBT_MANAGEMENT", "GAMBLING_SUPPORT"],
  },
  {
    id: "c4",
    clientName: "Maria Santos",
    clientId: "usr_c4",
    status: "PLAN_DESIGN",
    crisisLevel: "MEDIUM",
    stage: "stabilise",
    totalDebt: 23000,
    assignedTo: "Jane Smith",
    createdAt: "2026-03-25T09:00:00Z",
    updatedAt: "2026-03-27T11:00:00Z",
    daysSinceUpdate: 7,
    serviceStreams: ["DEBT_MANAGEMENT"],
  },
  {
    id: "c5",
    clientName: "Michael Brown",
    clientId: "usr_c5",
    status: "CRISIS_STABILISATION",
    crisisLevel: "HIGH",
    stage: "survive",
    totalDebt: 15200,
    assignedTo: "Jane Smith",
    createdAt: "2026-04-02T07:00:00Z",
    updatedAt: "2026-04-02T18:00:00Z",
    daysSinceUpdate: 1,
    serviceStreams: ["UTILITY_HARDSHIP"],
  },
  {
    id: "c6",
    clientName: "Emma Davis",
    clientId: "usr_c6",
    status: "TRIAGE",
    crisisLevel: "HIGH",
    stage: "survive",
    totalDebt: 31000,
    assignedTo: null,
    createdAt: "2026-04-03T06:00:00Z",
    updatedAt: "2026-04-03T06:00:00Z",
    daysSinceUpdate: 0,
    serviceStreams: ["FAMILY_VIOLENCE", "DEBT_MANAGEMENT"],
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const crisisLevel = searchParams.get("crisisLevel");

  let filtered = mockCases;

  if (status) {
    filtered = filtered.filter((c) => c.status === status);
  }
  if (crisisLevel) {
    filtered = filtered.filter((c) => c.crisisLevel === crisisLevel);
  }

  return NextResponse.json({
    cases: filtered,
    total: filtered.length,
    stages: {
      TRIAGE: mockCases.filter((c) => c.status === "TRIAGE").length,
      CRISIS_STABILISATION: mockCases.filter((c) => c.status === "CRISIS_STABILISATION").length,
      ASSESSMENT: mockCases.filter((c) => c.status === "ASSESSMENT").length,
      PLAN_DESIGN: mockCases.filter((c) => c.status === "PLAN_DESIGN").length,
      NEGOTIATING: mockCases.filter((c) => c.status === "NEGOTIATING").length,
      ACTIVE_RECOVERY: mockCases.filter((c) => c.status === "ACTIVE_RECOVERY").length,
      MONITORING: mockCases.filter((c) => c.status === "MONITORING").length,
    },
  });
}
