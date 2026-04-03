import Link from "next/link";

const triageOptions = [
  {
    id: "bills",
    label: "I'm behind on bills",
    description: "Credit cards, loans, utilities, rent",
    icon: "💳",
    color: "border-orange-200 bg-orange-50 hover:bg-orange-100",
  },
  {
    id: "housing",
    label: "I might lose my home",
    description: "Eviction notice, mortgage default",
    icon: "🏠",
    color: "border-red-200 bg-red-50 hover:bg-red-100",
  },
  {
    id: "essentials",
    label: "I can't afford essentials",
    description: "Food, electricity, water, medicine",
    icon: "🛒",
    color: "border-red-300 bg-red-100 hover:bg-red-200",
  },
  {
    id: "overwhelmed",
    label: "I feel completely overwhelmed",
    description: "Don't know where to start",
    icon: "😰",
    color: "border-purple-200 bg-purple-50 hover:bg-purple-100",
  },
  {
    id: "ahead",
    label: "I want to get ahead",
    description: "Plan my finances and reduce debt",
    icon: "📈",
    color: "border-green-200 bg-green-50 hover:bg-green-100",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-gray-900">RecoveryOS</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign in
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
          Australian Financial Recovery Platform
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          What&apos;s happening right now?
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          RecoveryOS is a free triage, advocacy, and recovery platform for Australians
          experiencing financial hardship. Tell us what&apos;s going on and we&apos;ll help
          you take the right next step.
        </p>

        {/* Triage Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left mb-8">
          {triageOptions.map((option) => (
            <Link
              key={option.id}
              href={`/onboarding?situation=${option.id}`}
              className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-colors cursor-pointer ${option.color}`}
            >
              <span className="text-3xl flex-shrink-0">{option.icon}</span>
              <div>
                <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-sm text-gray-500">
          Free service. No judgment. Your information is private and secure.
        </p>
      </section>

      {/* Trust Indicators */}
      <section className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">
            Built for Australia&apos;s regulatory framework
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-2xl font-bold text-brand-600 mb-1">NCCP</div>
              <div className="text-sm text-gray-600">National Consumer Credit Protection Act</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-brand-600 mb-1">AFCA</div>
              <div className="text-sm text-gray-600">Australian Financial Complaints Authority</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-brand-600 mb-1">ASIC</div>
              <div className="text-sm text-gray-600">RG 209 Compliant Affordability Assessment</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>
            RecoveryOS v3 — For immediate help, call the{" "}
            <a href="tel:1800007007" className="text-brand-600 hover:underline font-medium">
              National Debt Helpline: 1800 007 007
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
