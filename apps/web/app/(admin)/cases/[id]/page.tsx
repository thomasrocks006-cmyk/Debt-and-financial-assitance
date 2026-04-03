import Link from "next/link";

interface CaseDetailPageProps {
  params: { id: string };
}

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/pipeline" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Pipeline
          </Link>
          <h1 className="font-semibold text-gray-900">Case #{params.id}</h1>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm">Edit</button>
            <button className="btn-primary text-sm">Take Action</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Client Info */}
          <div className="space-y-4">
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Client Profile</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Name</span>
                  <span className="font-medium">Alex Demo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Case Status</span>
                  <span className="font-medium bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">ASSESSMENT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Crisis Level</span>
                  <span className="font-medium bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs">MEDIUM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Stage</span>
                  <span className="font-medium">Stabilise</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Case Manager</span>
                  <span className="font-medium">Jane Smith</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Compliance Status</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Consent recorded</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Affordability assessed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Fee disclosure delivered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500">⚠</span>
                  <span className="text-yellow-700">Complaint process not sent</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Debts & Plan */}
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Debt Summary</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <div className="font-medium">ANZ Bank — Credit Card</div>
                    <div className="text-gray-500">19.99% p.a. · $300 arrears</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$7,500</div>
                    <div className="text-xs text-red-600">⚠ Arrears</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <div className="font-medium">Latitude Finance — Personal Loan</div>
                    <div className="text-gray-500">14.99% p.a.</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">$9,800</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm font-semibold">
                <span>Total</span>
                <span>$17,300</span>
              </div>
            </div>

            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-4">Notes & Actions</h2>
              <div className="space-y-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Jane Smith</span>
                    <span>2 days ago</span>
                  </div>
                  <div>Initial assessment completed. Client in stabilise phase. ANZ hardship application to be submitted.</div>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button className="btn-primary text-sm">Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
