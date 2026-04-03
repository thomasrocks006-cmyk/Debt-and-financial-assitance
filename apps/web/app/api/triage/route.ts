import { NextResponse } from "next/server";

/**
 * POST /api/triage — run a triage assessment based on client responses.
 * GET /api/triage — get triage queue summary.
 */

// Simulate the triage engine output
export async function POST(request: Request) {
  const body = await request.json();

  // Validate input
  if (!body.debtStress && !body.rentalStress && !body.utilityStress) {
    return NextResponse.json(
      { error: "At least one stress indicator is required" },
      { status: 400 },
    );
  }

  // Simulate triage engine scoring
  const scores = {
    debtStress: body.debtStress ?? 0,
    rentalStress: body.rentalStress ?? 0,
    utilityStress: body.utilityStress ?? 0,
    gamblingRisk: body.gamblingRisk ?? 0,
    foodInsecurity: body.foodInsecurity ?? 0,
    safetyRisk: body.safetyRisk ?? 0,
  };

  // Weighted scoring (mirrors triage engine)
  const weightedScore =
    scores.safetyRisk * 10 +
    scores.foodInsecurity * 8 +
    scores.debtStress * 5 +
    scores.rentalStress * 6 +
    scores.utilityStress * 5 +
    scores.gamblingRisk * 4;

  const maxPossible = 10 + 8 + 5 + 6 + 5 + 4; // 38
  const normalised = (weightedScore / maxPossible) * 100;

  let crisisLevel: string;
  if (normalised >= 80) crisisLevel = "CRITICAL";
  else if (normalised >= 60) crisisLevel = "HIGH";
  else if (normalised >= 40) crisisLevel = "MEDIUM";
  else if (normalised >= 20) crisisLevel = "LOW";
  else crisisLevel = "NONE";

  const requiresHumanEscalation =
    scores.safetyRisk > 0 || scores.gamblingRisk > 0 || crisisLevel === "CRITICAL";

  const serviceStreams: string[] = [];
  if (scores.debtStress > 0) serviceStreams.push("DEBT_MANAGEMENT");
  if (scores.rentalStress > 0) serviceStreams.push("RENTAL_STRESS");
  if (scores.utilityStress > 0) serviceStreams.push("UTILITY_HARDSHIP");
  if (scores.gamblingRisk > 0) serviceStreams.push("GAMBLING_SUPPORT");
  if (scores.foodInsecurity > 0) serviceStreams.push("EMERGENCY_RELIEF");
  if (scores.safetyRisk > 0) serviceStreams.push("FAMILY_VIOLENCE");

  return NextResponse.json({
    triageResult: {
      crisisLevel,
      score: Math.round(normalised),
      serviceStreams,
      requiresHumanEscalation,
      selfServeEligible: !requiresHumanEscalation && normalised < 40,
      recommendedAction:
        crisisLevel === "CRITICAL"
          ? "Immediate human intervention required"
          : crisisLevel === "HIGH"
            ? "Priority case manager assignment"
            : crisisLevel === "MEDIUM"
              ? "Standard case management"
              : "Self-serve with monitoring",
      assessedAt: new Date().toISOString(),
    },
  });
}

export async function GET() {
  return NextResponse.json({
    queue: {
      total: 4,
      awaiting: 2,
      inProgress: 1,
      completed: 1,
    },
    distribution: {
      CRITICAL: 1,
      HIGH: 4,
      MEDIUM: 9,
      LOW: 12,
      NONE: 18,
    },
    urgentCases: [
      {
        id: "c2",
        name: "Sarah Wilson",
        crisisLevel: "CRITICAL",
        issue: "Eviction notice received — 3 days",
        urgency: 1,
      },
      {
        id: "c5",
        name: "Michael Brown",
        crisisLevel: "HIGH",
        issue: "Utility disconnection risk",
        urgency: 2,
      },
      {
        id: "c6",
        name: "Emma Davis",
        crisisLevel: "HIGH",
        issue: "Family violence flag — coerced debt",
        urgency: 2,
      },
    ],
  });
}
