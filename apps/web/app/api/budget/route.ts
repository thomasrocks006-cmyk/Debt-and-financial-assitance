import { NextResponse } from "next/server";

/**
 * GET /api/budget — returns income, expenses, and affordability summary.
 * POST /api/budget — save/update budget items.
 */

const mockIncome = [
  { id: "inc1", source: "Employment", amount: 3200, frequency: "monthly", stable: true },
];

const mockExpenses = [
  { id: "exp1", category: "Rent", amount: 1600, frequency: "monthly", essential: true },
  { id: "exp2", category: "Food & groceries", amount: 600, frequency: "monthly", essential: true },
  { id: "exp3", category: "Utilities", amount: 200, frequency: "monthly", essential: true },
  { id: "exp4", category: "Transport", amount: 150, frequency: "monthly", essential: true },
  { id: "exp5", category: "Phone & internet", amount: 80, frequency: "monthly", essential: false },
  { id: "exp6", category: "Insurance", amount: 120, frequency: "monthly", essential: true },
];

export async function GET() {
  const totalIncome = mockIncome.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = mockExpenses.reduce((s, e) => s + e.amount, 0);
  const essentialExpenses = mockExpenses
    .filter((e) => e.essential)
    .reduce((s, e) => s + e.amount, 0);
  const disposable = totalIncome - totalExpenses;

  // Budget tiers based on affordability engine calculations
  const behaviouralBuffer = 0.85; // 15% reduction for prudency
  const adjustedDisposable = disposable * behaviouralBuffer;

  return NextResponse.json({
    income: mockIncome,
    expenses: mockExpenses,
    summary: {
      totalIncome,
      totalExpenses,
      essentialExpenses,
      nonEssentialExpenses: totalExpenses - essentialExpenses,
      disposableIncome: disposable,
      adjustedDisposable: Math.round(adjustedDisposable),
      housingRatio: Math.round((1600 / totalIncome) * 100),
      housingAtRisk: 1600 / totalIncome > 0.4,
    },
    budgetTiers: {
      survival: {
        label: "Survival",
        monthlyPaymentCapacity: Math.round(adjustedDisposable * 0.4),
        description: "40% of adjusted disposable income",
      },
      stabilisation: {
        label: "Stabilisation",
        monthlyPaymentCapacity: Math.round(adjustedDisposable * 0.7),
        description: "70% of adjusted disposable income",
      },
      recovery: {
        label: "Recovery",
        monthlyPaymentCapacity: Math.round(adjustedDisposable),
        description: "100% of adjusted disposable income",
      },
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.type || !["income", "expense"].includes(body.type)) {
    return NextResponse.json(
      { error: "type must be 'income' or 'expense'" },
      { status: 400 },
    );
  }

  if (!body.amount || body.amount <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number" },
      { status: 400 },
    );
  }

  const item = {
    id: `${body.type === "income" ? "inc" : "exp"}${Date.now()}`,
    ...(body.type === "income"
      ? { source: body.source ?? "Other", stable: body.stable ?? false }
      : { category: body.category ?? "Other", essential: body.essential ?? false }),
    amount: body.amount,
    frequency: body.frequency ?? "monthly",
  };

  return NextResponse.json({ item }, { status: 201 });
}
