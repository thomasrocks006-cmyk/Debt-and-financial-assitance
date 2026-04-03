import Link from "next/link";

const incomeItems = [
  { source: "Employment", amount: 3200, frequency: "monthly", stable: true },
];

const expenseItems = [
  { category: "Rent", amount: 1600, frequency: "monthly", essential: true },
  { category: "Food & groceries", amount: 600, frequency: "monthly", essential: true },
  { category: "Utilities", amount: 200, frequency: "monthly", essential: true },
  { category: "Transport", amount: 150, frequency: "monthly", essential: true },
];

export default function BudgetPage() {
  const totalIncome = incomeItems.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenseItems.reduce((s, e) => s + e.amount, 0);
  const disposable = totalIncome - totalExpenses;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Dashboard
          </Link>
          <h1 className="font-semibold text-gray-900">Budget Builder</h1>
          <button className="btn-primary text-sm">Save Budget</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Budget Summary */}
        <div className="card mb-6 bg-brand-50 border-brand-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600">Monthly Income</div>
              <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Monthly Expenses</div>
              <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Disposable Income</div>
              <div className={`text-2xl font-bold ${disposable >= 0 ? "text-brand-600" : "text-red-600"}`}>
                ${disposable.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">💰 Income</h2>
              <button className="text-sm text-brand-600 hover:underline">+ Add</button>
            </div>
            <div className="space-y-3">
              {incomeItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.source}</div>
                    <div className="text-xs text-gray-500">{item.frequency}</div>
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    +${item.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expenses */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">💸 Expenses</h2>
              <button className="text-sm text-brand-600 hover:underline">+ Add</button>
            </div>
            <div className="space-y-3">
              {expenseItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.category}</div>
                    <div className="text-xs text-gray-500">
                      {item.essential ? "Essential" : "Non-essential"} · {item.frequency}
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-red-600">
                    -${item.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* HEM Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <strong>Australian HEM Benchmarks:</strong> Your essential expenses are checked against
          the Household Expenditure Measure to ensure your budget is realistic and defensible
          for hardship applications.
        </div>
      </div>
    </main>
  );
}
