import Link from "next/link";

export default function DashboardPage() {
  const recoveryScore = 42;
  const stage = "Stabilise";

  const metrics = [
    { label: "Total Debt", value: "$17,300", change: "-$200", positive: true },
    { label: "Monthly Payment", value: "$450", change: "On track", positive: true },
    { label: "Next Milestone", value: "3 months", change: "Emergency fund", positive: true },
    { label: "Crisis Level", value: "MEDIUM", change: "Improving", positive: true },
  ];

  const upcomingTasks = [
    { title: "Submit hardship application to ANZ", due: "2 days", priority: "high" },
    { title: "Update budget with new income", due: "5 days", priority: "medium" },
    { title: "Review plan with case manager", due: "1 week", priority: "medium" },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-gray-900">RecoveryOS</span>
          </div>
          <nav className="flex items-center gap-6 text-sm">
            <Link href="/dashboard" className="text-brand-600 font-medium">Dashboard</Link>
            <Link href="/debts" className="text-gray-600 hover:text-gray-900">Debts</Link>
            <Link href="/budget" className="text-gray-600 hover:text-gray-900">Budget</Link>
            <Link href="/plan" className="text-gray-600 hover:text-gray-900">Plan</Link>
            <Link href="/crisis" className="text-red-600 hover:text-red-800 font-medium">⚡ Crisis</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Good morning, Alex</h1>
            <p className="text-gray-600 mt-1">You&apos;re in <strong>{stage}</strong> stage. Keep going — you&apos;re making progress.</p>
          </div>
          <Link href="/crisis" className="btn-danger text-sm">
            ⚡ I can&apos;t make a payment
          </Link>
        </div>

        {/* Recovery Score */}
        <div className="card mb-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-brand-100 text-sm font-medium mb-1">Recovery Score</div>
              <div className="text-5xl font-bold">{recoveryScore}</div>
              <div className="text-brand-100 text-sm mt-1">out of 100 — {stage} Phase</div>
            </div>
            <div className="w-24 h-24 rounded-full border-4 border-brand-400 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{recoveryScore}%</div>
                <div className="text-xs text-brand-200">recovered</div>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-brand-800 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all"
              style={{ width: `${recoveryScore}%` }}
            />
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="card">
              <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
              <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
              <div className={`text-xs mt-1 ${metric.positive ? "text-green-600" : "text-red-600"}`}>
                {metric.change}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks */}
          <div className="lg:col-span-2 card">
            <h2 className="font-semibold text-gray-900 mb-4">Your next actions</h2>
            <div className="space-y-3">
              {upcomingTasks.map((task, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === "high" ? "bg-red-500" : "bg-amber-400"
                  }`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    <div className="text-xs text-gray-500">Due in {task.due}</div>
                  </div>
                  <button className="text-xs text-brand-600 hover:underline">Start</button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
            <div className="space-y-2">
              <Link href="/debts" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                💳 View my debts
              </Link>
              <Link href="/budget" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                📊 Update budget
              </Link>
              <Link href="/plan" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                📋 My recovery plan
              </Link>
              <a href="tel:1800007007" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                📞 Call financial counsellor
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
