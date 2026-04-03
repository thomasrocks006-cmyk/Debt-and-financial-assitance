import Link from "next/link";

const crisisOptions = [
  {
    id: "cant_pay",
    icon: "💸",
    label: "I can't make my payment this week",
    action: "We'll request an immediate payment pause from your creditors",
    severity: "high",
  },
  {
    id: "eviction",
    icon: "🏠",
    label: "I've received an eviction notice",
    action: "We'll connect you with urgent tenancy support and legal aid",
    severity: "critical",
  },
  {
    id: "disconnection",
    icon: "⚡",
    label: "My power/gas/water has been disconnected",
    action: "We'll contact your utility provider's hardship team immediately",
    severity: "high",
  },
  {
    id: "no_food",
    icon: "🛒",
    label: "I don't have enough money for food",
    action: "We'll find emergency food relief near you right now",
    severity: "critical",
  },
  {
    id: "safety",
    icon: "🆘",
    label: "I'm not safe at home",
    action: "This is a safety emergency — we'll connect you with immediate support",
    severity: "critical",
    emergency: true,
  },
];

export default function CrisisPage() {
  return (
    <main className="min-h-screen bg-red-50">
      {/* Header */}
      <header className="bg-red-600 text-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-red-200 hover:text-white text-sm">
            ← Back to Dashboard
          </Link>
          <h1 className="font-bold text-lg">⚡ Crisis Mode</h1>
          <span />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">What&apos;s happening right now?</h2>
          <p className="text-gray-600 mt-2">
            Tell us the most urgent situation and we&apos;ll take immediate action.
          </p>
        </div>

        {/* Emergency Banner */}
        <div className="bg-red-600 text-white rounded-xl p-4 mb-6 flex items-center justify-between">
          <div>
            <div className="font-bold">In immediate danger?</div>
            <div className="text-red-100 text-sm">Call 000 for police, fire, or ambulance</div>
          </div>
          <a href="tel:000" className="bg-white text-red-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-50">
            Call 000
          </a>
        </div>

        <div className="space-y-3 mb-8">
          {crisisOptions.map((option) => (
            <button
              key={option.id}
              className={`w-full text-left p-5 rounded-xl border-2 transition-colors ${
                option.emergency
                  ? "border-red-500 bg-red-100 hover:bg-red-200"
                  : "border-red-200 bg-white hover:bg-red-50"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{option.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.action}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Quick Contacts */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Immediate help lines</h3>
          <div className="space-y-2 text-sm">
            <a href="tel:1800007007" className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <span>📞 National Debt Helpline</span>
              <span className="font-medium text-brand-600">1800 007 007</span>
            </a>
            <a href="tel:1800737732" className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <span>🆘 1800RESPECT (Family Violence)</span>
              <span className="font-medium text-brand-600">1800 737 732</span>
            </a>
            <a href="tel:131245" className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <span>⚡ AGL Hardship Team</span>
              <span className="font-medium text-brand-600">131 245</span>
            </a>
            <a href="tel:136240" className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
              <span>🏛️ Centrelink</span>
              <span className="font-medium text-brand-600">136 240</span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
