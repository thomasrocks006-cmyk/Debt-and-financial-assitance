import Link from "next/link";

const referrals = [
  {
    id: "r1",
    client: "Sarah Wilson",
    service: "FAMILY_VIOLENCE",
    provider: "1800RESPECT",
    status: "SENT",
    consentGiven: true,
    sentAt: "1 day ago",
  },
  {
    id: "r2",
    client: "Alex Demo",
    service: "DEBT_MANAGEMENT",
    provider: "National Debt Helpline",
    status: "PENDING",
    consentGiven: false,
    sentAt: null,
  },
  {
    id: "r3",
    client: "James Chen",
    service: "GAMBLING_SUPPORT",
    provider: "Gamblers Help",
    status: "ACCEPTED",
    consentGiven: true,
    sentAt: "3 days ago",
  },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-brand-100 text-brand-700",
  COMPLETED: "bg-green-200 text-green-800",
  DECLINED: "bg-red-100 text-red-700",
};

export default function ReferralsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/pipeline" className="text-sm text-gray-600 hover:text-gray-900">
            ← Pipeline
          </Link>
          <h1 className="font-semibold text-gray-900">Referral Management</h1>
          <button className="btn-primary text-sm">+ New Referral</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-500">Total Referrals</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">1</div>
            <div className="text-sm text-gray-500">Awaiting Consent</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">1</div>
            <div className="text-sm text-gray-500">Accepted</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-brand-600">0</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>

        {/* Referrals Table */}
        <div className="card p-0 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Active Referrals</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Service</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Provider</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Consent</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.client}</td>
                  <td className="px-6 py-4 text-gray-600">{r.service.replace(/_/g, " ")}</td>
                  <td className="px-6 py-4 text-gray-700">{r.provider}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[r.status] ?? ""}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {r.consentGiven ? (
                      <span className="text-green-600 text-xs">✓ Given</span>
                    ) : (
                      <span className="text-red-600 text-xs">⚠ Required</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-brand-600 hover:underline text-xs font-medium">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Resource Directory */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-2">Australian Community Resource Directory</h2>
          <p className="text-sm text-gray-600 mb-4">
            Pre-populated directory of Australian support services. Use this to find and
            refer clients to the right provider based on their needs and location.
          </p>
          <button className="btn-secondary text-sm">Browse Directory</button>
        </div>
      </div>
    </main>
  );
}
