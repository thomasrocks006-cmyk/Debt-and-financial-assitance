"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

type ContactPreference = "email" | "phone" | "sms";

interface OnboardingState {
  // Step 1: About you
  contactPreference: ContactPreference;
  isSafeToContact: boolean | null;
  alternateContactMethod: string;
  // Step 2: Financial situation
  employmentStatus: string;
  monthlyIncome: string;
  incomeFrequency: string;
  hardshipFlags: string[];
  // Step 3: Your debts
  debts: Array<{
    creditor: string;
    type: string;
    balance: string;
    minimumPayment: string;
    interestRate: string;
    inArrears: boolean;
  }>;
  // Step 4: Triage assessment
  debtStress: number;
  rentalStress: number;
  utilityStress: number;
  foodInsecurity: number;
  safetyRisk: number;
  // Step 5: Review
  agreed: boolean;
}

const INITIAL_STATE: OnboardingState = {
  contactPreference: "email",
  isSafeToContact: null,
  alternateContactMethod: "",
  employmentStatus: "",
  monthlyIncome: "",
  incomeFrequency: "monthly",
  hardshipFlags: [],
  debts: [{ creditor: "", type: "CREDIT_CARD", balance: "", minimumPayment: "", interestRate: "", inArrears: false }],
  debtStress: 0,
  rentalStress: 0,
  utilityStress: 0,
  foodInsecurity: 0,
  safetyRisk: 0,
  agreed: false,
};

const HARDSHIP_OPTIONS = [
  { id: "job_loss", label: "Job loss or redundancy" },
  { id: "reduced_hours", label: "Reduced work hours" },
  { id: "illness_injury", label: "Illness or injury" },
  { id: "mental_health", label: "Mental health challenges" },
  { id: "family_violence", label: "Family/domestic violence" },
  { id: "separation_divorce", label: "Separation or divorce" },
  { id: "caring_responsibilities", label: "Caring responsibilities" },
  { id: "natural_disaster", label: "Natural disaster impact" },
];

const DEBT_TYPES = [
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "PERSONAL_LOAN", label: "Personal Loan" },
  { value: "CAR_LOAN", label: "Car Loan" },
  { value: "MORTGAGE", label: "Mortgage" },
  { value: "BNPL", label: "Buy Now Pay Later" },
  { value: "UTILITY", label: "Utility Bill" },
  { value: "TELCO", label: "Phone/Internet" },
  { value: "TAX_DEBT", label: "Tax Debt" },
  { value: "OTHER", label: "Other" },
];

const REDIRECT_DELAY_MS = 2000;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<OnboardingState>(INITIAL_STATE);
  const [submitting, setSubmitting] = useState(false);
  const [showingResults, setShowingResults] = useState(false);
  const [triageResult, setTriageResult] = useState<{
    crisisLevel: string;
    score: number;
    serviceStreams: string[];
    recommendedAction: string;
  } | null>(null);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  const steps = [
    { id: 1, title: "Tell us about yourself", description: "Basic contact and safety information" },
    { id: 2, title: "Your financial situation", description: "Income, expenses, and hardship flags" },
    { id: 3, title: "Your debts", description: "List each debt so we can triage properly" },
    { id: 4, title: "Triage assessment", description: "We'll run a quick assessment and determine next steps" },
    { id: 5, title: "Your recovery plan", description: "Review options and confirm your path forward" },
  ];

  function updateState<K extends keyof OnboardingState>(key: K, value: OnboardingState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function addDebt() {
    setState((prev) => ({
      ...prev,
      debts: [...prev.debts, { creditor: "", type: "CREDIT_CARD", balance: "", minimumPayment: "", interestRate: "", inArrears: false }],
    }));
  }

  function updateDebt(index: number, field: string, value: string | boolean) {
    setState((prev) => ({
      ...prev,
      debts: prev.debts.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    }));
  }

  function removeDebt(index: number) {
    if (state.debts.length <= 1) return;
    setState((prev) => ({
      ...prev,
      debts: prev.debts.filter((_, i) => i !== index),
    }));
  }

  async function runTriage() {
    setSubmitting(true);
    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debtStress: state.debtStress,
          rentalStress: state.rentalStress,
          utilityStress: state.utilityStress,
          foodInsecurity: state.foodInsecurity,
          safetyRisk: state.safetyRisk,
        }),
      });
      const data = await response.json();
      setTriageResult(data.triageResult);
    } catch {
      setTriageResult({
        crisisLevel: "MEDIUM",
        score: 45,
        serviceStreams: ["DEBT_MANAGEMENT"],
        recommendedAction: "Standard case management",
      });
    }
    setSubmitting(false);
  }

  async function handleComplete(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debtStress: state.debtStress,
          rentalStress: state.rentalStress,
          utilityStress: state.utilityStress,
          foodInsecurity: state.foodInsecurity,
          safetyRisk: state.safetyRisk,
          gamblingRisk: 0, // not collected in this form; default to no gambling risk
        }),
      });
      if (!response.ok) {
        throw new Error(`Triage API returned ${response.status}`);
      }
      const data = await response.json();
      setTriageResult(data.triageResult);
      setSubmitting(false);
      setShowingResults(true);
      redirectTimerRef.current = setTimeout(() => router.push("/dashboard"), REDIRECT_DELAY_MS);
    } catch (err) {
      console.error("Triage submission failed:", err);
      setSubmitting(false);
      router.push("/dashboard");
    }
  }

  function canProceed(): boolean {
    switch (step) {
      case 1:
        return state.isSafeToContact !== null;
      case 2:
        return state.employmentStatus !== "" && state.monthlyIncome !== "";
      case 3:
        return state.debts.every((d) => d.creditor !== "" && d.balance !== "");
      case 4:
        return triageResult !== null;
      case 5:
        return state.agreed;
      default:
        return false;
    }
  }

  const crisisColors: Record<string, string> = {
    NONE: "bg-gray-100 text-gray-700",
    LOW: "bg-yellow-100 text-yellow-700",
    MEDIUM: "bg-orange-100 text-orange-700",
    HIGH: "bg-red-100 text-red-700",
    CRITICAL: "bg-red-600 text-white",
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
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
          {steps.map((s) => (
            <div key={s.id} className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold transition-colors ${
                  s.id < step
                    ? "bg-green-500 text-white"
                    : s.id === step
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-500"
                }`}
              >
                {s.id < step ? "✓" : s.id}
              </div>
              <div className="pt-1">
                <div className={`font-medium ${
                  s.id === step ? "text-brand-700" : s.id < step ? "text-green-700" : "text-gray-700"
                }`}>
                  {s.title}
                </div>
                <div className="text-sm text-gray-500">{s.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-semibold">
            {step}
          </div>
          <h2 className="font-semibold text-gray-900">{steps[step - 1].title}</h2>
        </div>

        {/* Step 1: About You */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                How should we contact you if it&apos;s safe to do so?
              </label>
              <select
                value={state.contactPreference}
                onChange={(e) => updateState("contactPreference", e.target.value as ContactPreference)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="email">Email</option>
                <option value="phone">Phone call</option>
                <option value="sms">SMS</option>
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
                    <button
                      type="button"
                      onClick={() => updateState("isSafeToContact", true)}
                      className={`text-sm py-1.5 px-4 rounded-lg transition-colors ${
                        state.isSafeToContact === true
                          ? "bg-green-600 text-white"
                          : "btn-secondary"
                      }`}
                    >
                      Yes, it&apos;s safe
                    </button>
                    <button
                      type="button"
                      onClick={() => updateState("isSafeToContact", false)}
                      className={`text-sm py-1.5 px-4 rounded-lg transition-colors ${
                        state.isSafeToContact === false
                          ? "bg-red-600 text-white"
                          : "btn-secondary"
                      }`}
                    >
                      I need privacy options
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {state.isSafeToContact === false && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-sm text-red-800">
                  <strong>Your safety is our priority.</strong> We&apos;ll use discreet communication.
                  How would you prefer us to reach you?
                </div>
                <input
                  type="text"
                  value={state.alternateContactMethod}
                  onChange={(e) => updateState("alternateContactMethod", e.target.value)}
                  className="mt-2 w-full px-3 py-2 border border-red-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Describe your safe contact method..."
                />
                <p className="text-xs text-red-600 mt-2">
                  If you&apos;re in immediate danger, call 000 or 1800RESPECT (1800 737 732).
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Financial Situation */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment status
              </label>
              <select
                value={state.employmentStatus}
                onChange={(e) => updateState("employmentStatus", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Select...</option>
                <option value="full_time">Full-time employed</option>
                <option value="part_time">Part-time employed</option>
                <option value="casual">Casual employment</option>
                <option value="self_employed">Self-employed</option>
                <option value="centrelink">Centrelink/Government payments</option>
                <option value="unemployed">Unemployed</option>
                <option value="retired">Retired</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Take-home income ($)
                </label>
                <input
                  type="number"
                  value={state.monthlyIncome}
                  onChange={(e) => updateState("monthlyIncome", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="e.g. 3200"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={state.incomeFrequency}
                  onChange={(e) => updateState("incomeFrequency", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="fortnightly">Fortnightly</option>
                  <option value="monthly">Monthly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What&apos;s contributing to your financial hardship? (select all that apply)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {HARDSHIP_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      state.hardshipFlags.includes(option.id)
                        ? "border-brand-500 bg-brand-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={state.hardshipFlags.includes(option.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateState("hardshipFlags", [...state.hardshipFlags, option.id]);
                        } else {
                          updateState(
                            "hardshipFlags",
                            state.hardshipFlags.filter((f) => f !== option.id),
                          );
                        }
                      }}
                      className="rounded border-gray-300 text-brand-600"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Your Debts */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              List each debt you currently have. This helps us calculate your total position
              and build an accurate recovery plan.
            </p>

            {state.debts.map((debt, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Debt #{index + 1}
                  </span>
                  {state.debts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDebt(index)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Creditor</label>
                    <input
                      type="text"
                      value={debt.creditor}
                      onChange={(e) => updateDebt(index, "creditor", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="e.g. ANZ Bank"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Type</label>
                    <select
                      value={debt.type}
                      onChange={(e) => updateDebt(index, "type", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {DEBT_TYPES.map((dt) => (
                        <option key={dt.value} value={dt.value}>
                          {dt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Balance ($)</label>
                    <input
                      type="number"
                      value={debt.balance}
                      onChange={(e) => updateDebt(index, "balance", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="7500"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Min Payment ($)</label>
                    <input
                      type="number"
                      value={debt.minimumPayment}
                      onChange={(e) => updateDebt(index, "minimumPayment", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="150"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Interest Rate (%)</label>
                    <input
                      type="number"
                      value={debt.interestRate}
                      onChange={(e) => updateDebt(index, "interestRate", e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="19.99"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 pb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={debt.inArrears}
                        onChange={(e) => updateDebt(index, "inArrears", e.target.checked)}
                        className="rounded border-gray-300 text-red-600"
                      />
                      <span className="text-sm text-gray-700">In arrears</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addDebt}
              className="btn-secondary w-full"
            >
              + Add another debt
            </button>

            {state.debts.length > 0 && state.debts.some((d) => d.balance) && (
              <div className="bg-brand-50 border border-brand-200 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  <strong>Total debts:</strong> {state.debts.length} ·{" "}
                  <strong>Total balance:</strong> $
                  {state.debts
                    .reduce((s, d) => s + (parseFloat(d.balance) || 0), 0)
                    .toLocaleString()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Triage Assessment */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-2">
              Rate each area from 0 (no stress) to 1 (severe stress). This helps us
              determine your crisis level and prioritise your support.
            </p>

            {[
              { key: "debtStress" as const, label: "Debt stress", desc: "How stressed are you about your debts?" },
              { key: "rentalStress" as const, label: "Rental/housing stress", desc: "Are you at risk of losing your housing?" },
              { key: "utilityStress" as const, label: "Utility stress", desc: "Are you at risk of disconnection?" },
              { key: "foodInsecurity" as const, label: "Food insecurity", desc: "Do you have difficulty affording food?" },
              { key: "safetyRisk" as const, label: "Safety risk", desc: "Are you or your family at risk of harm?" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-500">
                    {state[key] === 0 ? "No stress" : state[key] === 1 ? "Severe" : `${state[key]}`}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{desc}</p>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={state[key]}
                  onChange={(e) => updateState(key, parseFloat(e.target.value))}
                  className="w-full accent-brand-600"
                />
              </div>
            ))}

            {!triageResult && (
              <button
                type="button"
                onClick={runTriage}
                disabled={submitting}
                className="btn-primary w-full disabled:opacity-50"
              >
                {submitting ? "Running triage..." : "Run Triage Assessment"}
              </button>
            )}

            {triageResult && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Crisis Level</span>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${crisisColors[triageResult.crisisLevel] ?? ""}`}>
                    {triageResult.crisisLevel}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Score</span>
                  <span className="font-medium">{triageResult.score}/100</span>
                </div>
                <div className="text-sm text-gray-600">
                  <strong>Recommendation:</strong> {triageResult.recommendedAction}
                </div>
                {triageResult.serviceStreams.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {triageResult.serviceStreams.map((s) => (
                      <span key={s} className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                        {s.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review & Confirm */}
        {step === 5 && (
          <form onSubmit={handleComplete} className="space-y-4">
            {showingResults ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Assessment complete. Taking you to your dashboard…
                </p>
                {triageResult && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Crisis Level</span>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${crisisColors[triageResult.crisisLevel] ?? ""}`}>
                        {triageResult.crisisLevel}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Recommended Action:</strong> {triageResult.recommendedAction}
                    </div>
                    {triageResult.serviceStreams.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {triageResult.serviceStreams.map((s) => (
                          <span key={s} className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                            {s.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
                    router.push("/dashboard");
                  }}
                  className="btn-primary w-full"
                >
                  Continue →
                </button>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Your Summary</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Contact preference</span>
                    <span className="font-medium">{state.contactPreference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employment</span>
                    <span className="font-medium">{state.employmentStatus || "Not specified"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly income</span>
                    <span className="font-medium">${state.monthlyIncome || "0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Number of debts</span>
                    <span className="font-medium">{state.debts.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total debt balance</span>
                    <span className="font-medium">
                      ${state.debts.reduce((s, d) => s + (parseFloat(d.balance) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  {triageResult && (
                    <div className="flex justify-between">
                      <span>Crisis level</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${crisisColors[triageResult.crisisLevel] ?? ""}`}>
                        {triageResult.crisisLevel}
                      </span>
                    </div>
                  )}
                  {state.hardshipFlags.length > 0 && (
                    <div>
                      <span className="text-gray-500">Hardship factors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {state.hardshipFlags.map((f) => (
                          <span key={f} className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                            {f.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.agreed}
                    onChange={(e) => updateState("agreed", e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-xs text-blue-800">
                    I confirm the information above is accurate to the best of my knowledge.
                    I consent to RecoveryOS using this information to provide financial
                    recovery services. I understand I can withdraw consent at any time.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={!state.agreed || submitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Assessing..." : "Agree & Submit"}
              </button>
            </div>
            )}
          </form>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex justify-between mt-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="btn-secondary"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
