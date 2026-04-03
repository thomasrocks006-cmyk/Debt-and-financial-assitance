import Link from "next/link";

const negotiations = [
  {
    id: "n1",
    client: "Alex Demo",
    creditor: "ANZ Bank",
    type: "Hardship Request",
    status: "PENDING",
    sent: null,
    deadline: "3 days",
  },
  {
    id: "n2",
    client: "Sarah Wilson",
    creditor: "Origin Energy",
    type: "Utility Hardship",
    status: "SENT",
    sent: "2 days ago",
    deadline: "8 days",
  },
  {
    id: "n3",
    client: "James Chen",
    creditor: "Latitude Finance",
    type: "Settlement Offer",
    status: "RESPONSE_RECEIVED",
    sent: "5 days ago",
    deadline: null,
  },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  RESPONSE_RECEIVED: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  ESCALATED: "bg-purple-100 text-purple-700",
};

export default function AdvocacyPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/pipeline" className="text-sm text-gray-600 hover:text-gray-900">
            ← Pipeline
          </Link>
          <h1 className="font-semibold text-gray-900">Advocacy Workspace</h1>
          <button className="btn-primary text-sm">+ New Action</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-500">Active Negotiations</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-yellow-600">1</div>
            <div className="text-sm text-gray-500">Awaiting Response</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-500">Escalated to AFCA</div>
          </div>
        </div>

        {/* Negotiations Table */}
        <div className="card p-0 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Creditor Negotiations</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Creditor</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Deadline</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {negotiations.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{n.client}</td>
                  <td className="px-6 py-4 text-gray-700">{n.creditor}</td>
                  <td className="px-6 py-4 text-gray-600">{n.type}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[n.status] ?? ""}`}>
                      {n.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {n.deadline ? `${n.deadline} remaining` : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-brand-600 hover:underline text-xs font-medium">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Templates */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Hardship Letter Templates</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {["Hardship Request", "Settlement Offer", "Interest Freeze", "Dispute"].map((t) => (
              <button key={t} className="btn-secondary text-sm p-3 text-center">
                📄 {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
