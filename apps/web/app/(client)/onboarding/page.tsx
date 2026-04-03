export default function OnboardingPage() {
  const steps = [
    { id: 1, title: "Tell us about yourself", description: "Basic contact and safety information" },
    { id: 2, title: "Your financial situation", description: "Income, expenses, and hardship flags" },
    { id: 3, title: "Your debts", description: "List each debt so we can triage properly" },
    { id: 4, title: "Triage assessment", description: "We'll run a quick assessment and determine next steps" },
    { id: 5, title: "Your recovery plan", description: "Review options and confirm your path forward" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Let&apos;s get started</h1>
          <p className="text-gray-600 mt-2">
            This onboarding wizard takes about 10 minutes and gives us everything
            we need to build your personalised recovery plan.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What we&apos;ll cover</h2>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold ${
                  index === 0
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-500"
                }`}>
                  {step.id}
                </div>
                <div className="pt-1">
                  <div className={`font-medium ${index === 0 ? "text-brand-700" : "text-gray-700"}`}>
                    {step.title}
                  </div>
                  <div className="text-sm text-gray-500">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic Info Placeholder */}
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-semibold">1</div>
            <h2 className="font-semibold text-gray-900">Tell us about yourself</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How should we contact you if it&apos;s safe to do so?
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option>Email</option>
                <option>Phone call</option>
                <option>SMS</option>
              </select>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-amber-600 text-lg">⚠️</span>
                <div>
                  <div className="font-medium text-amber-900 text-sm">Safety check</div>
                  <div className="text-amber-800 text-sm mt-1">
                    Is it safe for us to contact you on your registered email/phone?
                    Some clients need us to use discreet communication methods.
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button className="btn-primary text-sm py-1.5">Yes, it&apos;s safe</button>
                    <button className="btn-secondary text-sm py-1.5">I need privacy options</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button className="btn-primary">
              Continue →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
