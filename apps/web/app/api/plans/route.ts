import { NextResponse } from "next/server";

/**
 * GET /api/plans — returns generated plan options for the current user.
 * POST /api/plans — select a plan option.
 */

export async function GET() {
  return NextResponse.json({
    disposableIncome: 650,
    plans: [
      {
        name: "survival",
        label: "Survival Plan",
        strategy: "PRO_RATA",
        monthlyPayment: 260,
        totalMonths: 72,
        failureProbability: 0.15,
        riskScore: 8,
        stage: "survive",
        description:
          "Minimum viable payments — protects against default while you stabilise",
        allocations: [
          {
            debtId: "d1",
            creditor: "ANZ Bank",
            monthlyPayment: 113,
            allocationPercent: 43.4,
            monthsToPayoff: 72,
          },
          {
            debtId: "d2",
            creditor: "Latitude Finance",
            monthlyPayment: 147,
            allocationPercent: 56.6,
            monthsToPayoff: 68,
          },
        ],
      },
      {
        name: "balanced",
        label: "Balanced Plan",
        strategy: "PRIORITY_BASED",
        monthlyPayment: 450,
        totalMonths: 48,
        failureProbability: 0.2,
        riskScore: 5,
        stage: "stabilise",
        description:
          "Sustainable payments — prevents further deterioration and begins recovery",
        recommended: true,
        allocations: [
          {
            debtId: "d1",
            creditor: "ANZ Bank",
            monthlyPayment: 170,
            allocationPercent: 37.8,
            monthsToPayoff: 48,
          },
          {
            debtId: "d2",
            creditor: "Latitude Finance",
            monthlyPayment: 280,
            allocationPercent: 62.2,
            monthsToPayoff: 42,
          },
        ],
      },
      {
        name: "aggressive",
        label: "Aggressive Plan",
        strategy: "HIGH_INTEREST_FIRST",
        monthlyPayment: 650,
        totalMonths: 32,
        failureProbability: 0.35,
        riskScore: 3,
        stage: "recover",
        description:
          "Maximum payments targeting high-interest debts — fastest route to debt freedom",
        allocations: [
          {
            debtId: "d1",
            creditor: "ANZ Bank",
            monthlyPayment: 370,
            allocationPercent: 56.9,
            monthsToPayoff: 24,
          },
          {
            debtId: "d2",
            creditor: "Latitude Finance",
            monthlyPayment: 280,
            allocationPercent: 43.1,
            monthsToPayoff: 32,
          },
        ],
      },
    ],
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.planName || !["survival", "balanced", "aggressive"].includes(body.planName)) {
    return NextResponse.json(
      { error: "planName must be one of: survival, balanced, aggressive" },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    selectedPlan: body.planName,
    message: `${body.planName} plan has been selected. Your case manager will review and confirm.`,
    activatedAt: new Date().toISOString(),
  });
}
