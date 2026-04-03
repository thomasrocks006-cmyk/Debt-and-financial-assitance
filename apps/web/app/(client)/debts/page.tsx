import Link from "next/link";

const mockDebts = [
  {
    id: "1",
    creditor: "ANZ Bank",
    type: "Credit Card",
    balance: 7500,
    minimum: 150,
    interest: 19.99,
    status: "ACTIVE",
    arrears: 300,
  },
  {
    id: "2",
    creditor: "Latitude Finance",
    type: "Personal Loan",
    balance: 9800,
    minimum: 280,
    interest: 14.99,
    status: "ACTIVE",
    arrears: 0,
  },
];

const statusColors: Record<string, string> = {
  ACTIVE: "bg-gray-100 text-gray-700",
  IN_HARDSHIP: "bg-blue-100 text-blue-700",
  NEGOTIATING: "bg-yellow-100 text-yellow-700",
  SETTLED: "bg-green-100 text-green-700",
  PAID_OFF: "bg-green-200 text-green-800",
};

export default function DebtsPage() {
  const total = mockDebts.reduce((s, d) => s + d.balance, 0);
  const totalMinimum = mockDebts.reduce((s, d) => s + d.minimum, 0);

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
          <h1 className="font-semibold text-gray-900">My Debts</h1>
          <button className="btn-primary text-sm">+ Add Debt</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card">
            <div className="text-sm text-gray-500">Total Debt</div>
            <div className="text-3xl font-bold text-gray-900">
              ${total.toLocaleString()}
            </div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-500">Total Minimum Payments</div>
            <div className="text-3xl font-bold text-gray-900">
              ${totalMinimum}/mo
            </div>
          </div>
        </div>

        {/* Debt List */}
        <div className="space-y-4">
          {mockDebts.map((debt) => (
            <div key={debt.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-gray-900">{debt.creditor}</div>
                  <div className="text-sm text-gray-500">{debt.type}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[debt.status] ?? "bg-gray-100"}`}>
                  {debt.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Balance</div>
                  <div className="font-semibold text-gray-900">${debt.balance.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Min Payment</div>
                  <div className="font-semibold text-gray-900">${debt.minimum}/mo</div>
                </div>
                <div>
                  <div className="text-gray-500">Interest Rate</div>
                  <div className="font-semibold text-gray-900">{debt.interest}% p.a.</div>
                </div>
              </div>

              {debt.arrears > 0 && (
                <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                  ⚠️ ${debt.arrears} in arrears — action required
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <button className="btn-secondary text-xs py-1.5">Request Hardship</button>
                <button className="btn-secondary text-xs py-1.5">Edit</button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Need help negotiating with creditors?{" "}
            <a href="tel:1800007007" className="text-brand-600 hover:underline">
              Call the National Debt Helpline: 1800 007 007
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
