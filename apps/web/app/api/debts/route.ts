import { NextResponse } from "next/server";

/**
 * GET /api/debts — returns debt accounts for the authenticated user.
 * POST /api/debts — add a new debt account.
 */

const mockDebts = [
  {
    id: "d1",
    creditor: "ANZ Bank",
    creditorId: "anz",
    type: "CREDIT_CARD",
    originalBalance: 8200,
    currentBalance: 7500,
    minimumPayment: 150,
    interestRate: 19.99,
    status: "ACTIVE",
    arrears: 300,
    isCoercedDebt: false,
    externalRef: "4111-XXXX-XXXX-1234",
    createdAt: "2025-06-15T00:00:00Z",
    updatedAt: "2026-04-01T00:00:00Z",
  },
  {
    id: "d2",
    creditor: "Latitude Finance",
    creditorId: "latitude",
    type: "PERSONAL_LOAN",
    originalBalance: 12000,
    currentBalance: 9800,
    minimumPayment: 280,
    interestRate: 14.99,
    status: "ACTIVE",
    arrears: 0,
    isCoercedDebt: false,
    externalRef: "LAT-987654",
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2026-03-28T00:00:00Z",
  },
];

export async function GET() {
  const total = mockDebts.reduce((s, d) => s + d.currentBalance, 0);
  const totalMinimum = mockDebts.reduce((s, d) => s + d.minimumPayment, 0);
  const totalArrears = mockDebts.reduce((s, d) => s + d.arrears, 0);

  return NextResponse.json({
    debts: mockDebts,
    summary: {
      totalBalance: total,
      totalMinimumPayments: totalMinimum,
      totalArrears,
      debtCount: mockDebts.length,
      averageInterestRate:
        mockDebts.reduce((s, d) => s + d.interestRate, 0) / mockDebts.length,
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Validate required fields
  const required = ["creditor", "type", "currentBalance", "minimumPayment", "interestRate"];
  for (const field of required) {
    if (body[field] === undefined || body[field] === null) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 },
      );
    }
  }

  const newDebt = {
    id: `d${Date.now()}`,
    creditor: body.creditor,
    creditorId: body.creditorId ?? null,
    type: body.type,
    originalBalance: body.originalBalance ?? body.currentBalance,
    currentBalance: body.currentBalance,
    minimumPayment: body.minimumPayment,
    interestRate: body.interestRate,
    status: "ACTIVE",
    arrears: body.arrears ?? 0,
    isCoercedDebt: body.isCoercedDebt ?? false,
    externalRef: body.externalRef ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ debt: newDebt }, { status: 201 });
}
