import Link from "next/link";

const complianceItems = [
  {
    id: "c1",
    client: "Alex Demo",
    affordability: true,
    consent: true,
    feeDisclosure: true,
    serviceTerms: true,
    complaintProcess: false,
    privacy: true,
    isCompliant: false,
    issues: 1,
  },
  {
    id: "c2",
    client: "Sarah Wilson",
    affordability: true,
    consent: true,
    feeDisclosure: true,
    serviceTerms: true,
    complaintProcess: true,
    privacy: true,
    isCompliant: true,
    issues: 0,
  },
  {
    id: "c3",
    client: "James Chen",
    affordability: true,
    consent: false,
    feeDisclosure: false,
    serviceTerms: false,
    complaintProcess: false,
    privacy: false,
    isCompliant: false,
    issues: 4,
  },
];

export default function ComplianceDashboardPage() {
  const compliant = complianceItems.filter((c) => c.isCompliant).length;
  const nonCompliant = complianceItems.filter((c) => !c.isCompliant).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/pipeline" className="text-sm text-gray-600 hover:text-gray-900">
            ← Pipeline
          </Link>
          <h1 className="font-semibold text-gray-900">Compliance Dashboard</h1>
          <button className="btn-primary text-sm">Run Compliance Check</button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{compliant}</div>
            <div className="text-sm text-gray-500">Fully Compliant</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600">{nonCompliant}</div>
            <div className="text-sm text-gray-500">Non-Compliant</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((compliant / complianceItems.length) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Compliance Rate</div>
          </div>
        </div>

        {/* Checklist Table */}
        <div className="card p-0 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Case Compliance Status</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Affordability</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Consent</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fee Disc.</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Terms</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Complaint</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Privacy</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complianceItems.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.client}</td>
                  {[c.affordability, c.consent, c.feeDisclosure, c.serviceTerms, c.complaintProcess, c.privacy].map((v, i) => (
                    <td key={i} className="text-center px-4 py-4">
                      <span className={v ? "text-green-500" : "text-red-500"}>
                        {v ? "✓" : "✗"}
                      </span>
                    </td>
                  ))}
                  <td className="text-center px-4 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      c.isCompliant ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {c.isCompliant ? "✓ OK" : `${c.issues} issue${c.issues > 1 ? "s" : ""}`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Regulatory Reference */}
        <div className="card bg-blue-50 border-blue-200">
          <h2 className="font-semibold text-gray-900 mb-2">Regulatory Framework</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <div className="font-medium">NCCP Act</div>
              <div className="text-gray-600">National Consumer Credit Protection — Responsible Lending obligations</div>
            </div>
            <div>
              <div className="font-medium">ASIC RG 209</div>
              <div className="text-gray-600">Affordability assessment requirements for credit providers</div>
            </div>
            <div>
              <div className="font-medium">AFCA Rules</div>
              <div className="text-gray-600">Complaint handling and dispute resolution requirements</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
