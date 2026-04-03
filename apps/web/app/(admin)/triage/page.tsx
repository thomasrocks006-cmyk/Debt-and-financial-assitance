import Link from "next/link";

const criticalCases = [
  { id: "c2", name: "Sarah Wilson", crisis: "CRITICAL", issue: "Eviction notice received — 3 days", urgency: 1 },
  { id: "c5", name: "Michael Brown", crisis: "HIGH", issue: "Utility disconnection risk", urgency: 2 },
  { id: "c6", name: "Emma Davis", crisis: "HIGH", issue: "Family violence flag — coerced debt", urgency: 2 },
];

const crisisDistribution = [
  { level: "CRITICAL", count: 1, color: "bg-red-600" },
  { level: "HIGH", count: 4, color: "bg-red-400" },
  { level: "MEDIUM", count: 9, color: "bg-orange-400" },
  { level: "LOW", count: 12, color: "bg-yellow-400" },
  { level: "NONE", count: 18, color: "bg-gray-300" },
];

export default function TriageDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/pipeline" className="text-sm text-gray-600 hover:text-gray-900">
            ← Pipeline
          </Link>
          <h1 className="font-semibold text-gray-900">Triage Dashboard</h1>
          <button className="btn-primary text-sm">Run Triage</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crisis Distribution */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Crisis Level Distribution</h2>
            <div className="space-y-3">
              {crisisDistribution.map((d) => (
                <div key={d.level} className="flex items-center gap-3">
                  <span className={`text-xs font-medium w-20 text-right text-gray-600`}>{d.level}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-4">
                    <div
                      className={`${d.color} h-4 rounded-full`}
                      style={{ width: `${(d.count / 44) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-6">{d.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Urgent Cases */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">
              🚨 Requires Immediate Action
              <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
                {criticalCases.length} cases
              </span>
            </h2>
            <div className="space-y-3">
              {criticalCases.map((c) => (
                <div key={c.id} className="flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{c.name}</div>
                    <div className="text-xs text-red-700 mt-0.5">{c.issue}</div>
                  </div>
                  <Link href={`/cases/${c.id}`} className="btn-danger text-xs py-1 px-3">
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Triage Queue */}
        <div className="card mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Triage Queue</h2>
            <span className="text-sm text-gray-500">4 awaiting assessment</span>
          </div>
          <p className="text-sm text-gray-600">
            New clients who have completed the initial questionnaire and are awaiting
            triage assessment. The triage engine has scored them — review and confirm
            the crisis level and service streams.
          </p>
          <button className="btn-primary text-sm mt-4">Process Queue</button>
        </div>
      </div>
    </main>
  );
}
