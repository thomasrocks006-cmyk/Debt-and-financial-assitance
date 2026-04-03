import Link from "next/link";

const stages = [
  { id: "TRIAGE", label: "Triage", count: 4, color: "border-blue-200 bg-blue-50" },
  { id: "CRISIS_STABILISATION", label: "Crisis", count: 2, color: "border-red-200 bg-red-50" },
  { id: "ASSESSMENT", label: "Assessment", count: 7, color: "border-yellow-200 bg-yellow-50" },
  { id: "PLAN_DESIGN", label: "Plan Design", count: 5, color: "border-purple-200 bg-purple-50" },
  { id: "NEGOTIATING", label: "Negotiating", count: 3, color: "border-orange-200 bg-orange-50" },
  { id: "ACTIVE_RECOVERY", label: "Active Recovery", count: 12, color: "border-green-200 bg-green-50" },
  { id: "MONITORING", label: "Monitoring", count: 8, color: "border-teal-200 bg-teal-50" },
];

const mockCases = [
  { id: "c1", name: "Alex Demo", stage: "ASSESSMENT", crisis: "MEDIUM", debt: 17300, days: 3 },
  { id: "c2", name: "Sarah Wilson", stage: "CRISIS_STABILISATION", crisis: "HIGH", debt: 42000, days: 1 },
  { id: "c3", name: "James Chen", stage: "TRIAGE", crisis: "LOW", debt: 8500, days: 14 },
  { id: "c4", name: "Maria Santos", stage: "PLAN_DESIGN", crisis: "MEDIUM", debt: 23000, days: 7 },
];

const crisisColors: Record<string, string> = {
  NONE: "bg-gray-100 text-gray-600",
  LOW: "bg-yellow-100 text-yellow-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  HIGH: "bg-red-100 text-red-700",
  CRITICAL: "bg-red-600 text-white",
};

export default function PipelinePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-gray-900">RecoveryOS Admin</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/pipeline" className="text-brand-600 font-medium">Pipeline</Link>
            <Link href="/triage" className="text-gray-600 hover:text-gray-900">Triage</Link>
            <Link href="/advocacy" className="text-gray-600 hover:text-gray-900">Advocacy</Link>
            <Link href="/referrals" className="text-gray-600 hover:text-gray-900">Referrals</Link>
            <Link href="/compliance" className="text-gray-600 hover:text-gray-900">Compliance</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Case Pipeline</h1>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm">Filter</button>
            <button className="btn-primary text-sm">+ New Case</button>
          </div>
        </div>

        {/* Stage Summary */}
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {stages.map((stage) => (
            <div key={stage.id} className={`rounded-lg border p-3 ${stage.color}`}>
              <div className="text-xs font-medium text-gray-600 truncate">{stage.label}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stage.count}</div>
            </div>
          ))}
        </div>

        {/* Cases Table */}
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Active Cases</h2>
            <span className="text-sm text-gray-500">{mockCases.length} cases</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Crisis Level</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total Debt</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Days</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockCases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-gray-600">{c.stage.replace(/_/g, " ")}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${crisisColors[c.crisis] ?? ""}`}>
                      {c.crisis}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">${c.debt.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500">{c.days}d ago</td>
                  <td className="px-6 py-4">
                    <Link href={`/cases/${c.id}`} className="text-brand-600 hover:underline text-xs font-medium">
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
