import Link from "next/link";

const planOptions = [
  {
    name: "Survival Plan",
    strategy: "Pro-Rata",
    monthly: 260,
    months: 72,
    failureProb: 0.15,
    riskScore: 8,
    stage: "survive",
    color: "border-red-200 bg-red-50",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "Low Risk of Default",
    description: "Minimum viable payments — protects against default while you stabilise",
  },
  {
    name: "Balanced Plan",
    strategy: "Priority-Based",
    monthly: 450,
    months: 48,
    failureProb: 0.2,
    riskScore: 5,
    stage: "stabilise",
    color: "border-brand-200 bg-brand-50",
    badge: "bg-brand-100 text-brand-700",
    badgeLabel: "Recommended",
    description: "Sustainable payments — prevents further deterioration and begins recovery",
    highlighted: true,
  },
  {
    name: "Aggressive Plan",
    strategy: "High-Interest First",
    monthly: 650,
    months: 32,
    failureProb: 0.35,
    riskScore: 3,
    stage: "recover",
    color: "border-purple-200 bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    badgeLabel: "Fastest Payoff",
    description: "Maximum payments — fastest route to debt freedom",
  },
];

export default function PlanPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
          <h1 className="font-semibold text-gray-900">Recovery Plan</h1>
          <span className="text-sm text-gray-500">3 options generated</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Choose your plan</h2>
          <p className="text-gray-600 mt-1">
            Based on your affordability assessment. Disposable income: <strong>$650/month</strong>.
            All plans are within your capacity — choose the one that feels right.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {planOptions.map((plan) => (
            <div
              key={plan.name}
              className={`card border-2 ${plan.color} ${(plan as { highlighted?: boolean }).highlighted ? "ring-2 ring-brand-400" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-lg">{plan.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.badge}`}>
                      {plan.badgeLabel}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{plan.description}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 my-4">
                <div>
                  <div className="text-xs text-gray-500">Monthly Payment</div>
                  <div className="text-xl font-bold text-gray-900">${plan.monthly}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Time to Debt Free</div>
                  <div className="text-xl font-bold text-gray-900">{plan.months} months</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Strategy</div>
                  <div className="text-base font-semibold text-gray-900">{plan.strategy}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Risk score: {plan.riskScore}/10 · Failure probability: {Math.round(plan.failureProb * 100)}%
                </div>
                <button className="btn-primary text-sm">Select this plan</button>
              </div>
            </div>
          ))}
        </div>

        <div className="card bg-gray-100 border-gray-300 text-sm text-gray-700">
          <strong>Note:</strong> These plans are automatically calculated using your income,
          expenses, and debt data. Your case manager will review and confirm the final plan
          before it becomes active.
        </div>
      </div>
    </main>
  );
}
