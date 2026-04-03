"use client";

import { useState } from "react";

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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSelectCrisis(optionId: string) {
    setSelectedOption(optionId);
    setProcessing(true);
    // Simulate action processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setProcessing(false);
    setSubmitted(true);
  }

  const selected = crisisOptions.find((o) => o.id === selectedOption);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-red-50">
      {/* Crisis header bar */}
      <div className="bg-red-600 text-white py-3">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="font-bold text-lg">Crisis Mode</span>
        </div>
      </div>

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
          <a href="tel:000" className="bg-white text-red-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition-colors">
            Call 000
          </a>
        </div>

        {/* Success State */}
        {submitted && selected && (
          <div className="card bg-green-50 border-green-200 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-2xl">✓</span>
              <div>
                <h3 className="font-semibold text-green-900">Help is on the way</h3>
                <p className="text-sm text-green-700 mt-1">
                  We&apos;ve logged your crisis and are taking action: {selected.action}
                </p>
                <p className="text-sm text-green-700 mt-2">
                  Your case manager will contact you within 2 hours. If you need immediate
                  assistance, use the helpline numbers below.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setSelectedOption(null); }}
                  className="btn-secondary text-sm mt-3"
                >
                  Report another issue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Crisis Options */}
        {!submitted && (
          <div className="space-y-3 mb-8">
            {crisisOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectCrisis(option.id)}
                disabled={processing}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all disabled:opacity-50 ${
                  option.emergency
                    ? "border-red-500 bg-red-100 hover:bg-red-200"
                    : selectedOption === option.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-red-200 bg-white hover:bg-red-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{option.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-1">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.action}</div>
                  </div>
                  {processing && selectedOption === option.id && (
                    <div className="text-sm text-brand-600 animate-pulse font-medium">
                      Processing...
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Quick Contacts */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Immediate help lines</h3>
          <div className="space-y-2 text-sm">
            <a href="tel:1800007007" className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors">
              <span>📞 National Debt Helpline</span>
              <span className="font-medium text-brand-600">1800 007 007</span>
            </a>
            <a href="tel:1800737732" className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors">
              <span>🆘 1800RESPECT (Family Violence)</span>
              <span className="font-medium text-brand-600">1800 737 732</span>
            </a>
            <a href="tel:131114" className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors">
              <span>💙 Lifeline Australia</span>
              <span className="font-medium text-brand-600">13 11 14</span>
            </a>
            <a href="tel:131245" className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors">
              <span>⚡ AGL Hardship Team</span>
              <span className="font-medium text-brand-600">131 245</span>
            </a>
            <a href="tel:136240" className="flex items-center justify-between p-2 rounded hover:bg-gray-50 transition-colors">
              <span>🏛️ Centrelink</span>
              <span className="font-medium text-brand-600">136 240</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
