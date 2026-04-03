"use client";

import { useState } from "react";

interface PlanOption {
  name: string;
  label: string;
  strategy: string;
  monthly: number;
  months: number;
  failureProb: number;
  riskScore: number;
  stage: string;
  color: string;
  badge: string;
  badgeLabel: string;
  description: string;
  highlighted?: boolean;
  allocations: Array<{ creditor: string; amount: number; percent: number }>;
}

const planOptions: PlanOption[] = [
  {
    name: "survival",
    label: "Survival Plan",
    strategy: "Pro-Rata",
    monthly: 260,
    months: 72,
    failureProb: 0.15,
    riskScore: 8,
    stage: "survive",
    color: "border-red-200 bg-red-50",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "Low Risk of Default",
    description: "Minimum viable payments — protects against default while you stabilise",
    allocations: [
      { creditor: "ANZ Bank (Credit Card)", amount: 113, percent: 43.4 },
      { creditor: "Latitude Finance (Personal Loan)", amount: 147, percent: 56.6 },
    ],
  },
  {
    name: "balanced",
    label: "Balanced Plan",
    strategy: "Priority-Based",
    monthly: 450,
    months: 48,
    failureProb: 0.2,
    riskScore: 5,
    stage: "stabilise",
    color: "border-brand-200 bg-brand-50",
    badge: "bg-brand-100 text-brand-700",
    badgeLabel: "Recommended",
    description: "Sustainable payments — prevents further deterioration and begins recovery",
    highlighted: true,
    allocations: [
      { creditor: "ANZ Bank (Credit Card)", amount: 170, percent: 37.8 },
      { creditor: "Latitude Finance (Personal Loan)", amount: 280, percent: 62.2 },
    ],
  },
  {
    name: "aggressive",
    label: "Aggressive Plan",
    strategy: "High-Interest First",
    monthly: 650,
    months: 32,
    failureProb: 0.35,
    riskScore: 3,
    stage: "recover",
    color: "border-purple-200 bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    badgeLabel: "Fastest Payoff",
    description: "Maximum payments — fastest route to debt freedom",
    allocations: [
      { creditor: "ANZ Bank (Credit Card)", amount: 370, percent: 56.9 },
      { creditor: "Latitude Finance (Personal Loan)", amount: 280, percent: 43.1 },
    ],
  },
];

export default function PlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  async function handleSelectPlan(planName: string) {
    setConfirming(true);
    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planName }),
      });
      if (response.ok) {
        setSelectedPlan(planName);
        setConfirmed(true);
      }
    } catch {
      // Fallback for demo
      setSelectedPlan(planName);
      setConfirmed(true);
    }
    setConfirming(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recovery Plan</h1>
        <p className="text-gray-600 mt-1">
          Based on your affordability assessment. Disposable income: <strong>$650/month</strong>.
          All plans are within your capacity — choose the one that feels right.
        </p>
      </div>

      {confirmed && selectedPlan && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-xl">✓</span>
            <div>
              <div className="font-medium text-green-800">
                {planOptions.find((p) => p.name === selectedPlan)?.label} selected
              </div>
              <div className="text-sm text-green-700">
                Your case manager will review and confirm the plan. You&apos;ll receive a notification once it&apos;s active.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 mb-8">
        {planOptions.map((plan) => {
          const isSelected = selectedPlan === plan.name;
          const isExpanded = expandedPlan === plan.name;

          return (
            <div
              key={plan.name}
              className={`card border-2 transition-all ${plan.color} ${
                plan.highlighted && !selectedPlan ? "ring-2 ring-brand-400" : ""
              } ${isSelected ? "ring-2 ring-green-400 border-green-300" : ""}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-lg">{plan.label}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${plan.badge}`}>
                      {isSelected ? "✓ Selected" : plan.badgeLabel}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{plan.description}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 my-4">
                <div>
                  <div className="text-xs text-gray-500">Monthly Payment</div>
                  <div className="text-xl font-bold text-gray-900">${plan.monthly}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Time to Debt Free</div>
                  <div className="text-xl font-bold text-gray-900">{plan.months} months</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Strategy</div>
                  <div className="text-base font-semibold text-gray-900">{plan.strategy}</div>
                </div>
              </div>

              {/* Allocation breakdown */}
              {isExpanded && (
                <div className="bg-white/50 rounded-lg p-4 mb-4 border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Allocation</h4>
                  {plan.allocations.map((alloc) => (
                    <div key={alloc.creditor} className="flex items-center justify-between text-sm py-1.5">
                      <span className="text-gray-600">{alloc.creditor}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-brand-500 h-2 rounded-full"
                            style={{ width: `${alloc.percent}%` }}
                          />
                        </div>
                        <span className="font-medium text-gray-900 w-16 text-right">${alloc.amount}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-xs text-gray-500">
                    Risk score: {plan.riskScore}/10 · Failure probability: {Math.round(plan.failureProb * 100)}%
                  </div>
                  <button
                    onClick={() => setExpandedPlan(isExpanded ? null : plan.name)}
                    className="text-xs text-brand-600 hover:underline"
                  >
                    {isExpanded ? "Hide details" : "View allocation"}
                  </button>
                </div>
                {!isSelected && (
                  <button
                    onClick={() => handleSelectPlan(plan.name)}
                    disabled={confirming}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {confirming ? "Selecting..." : "Select this plan"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="card bg-gray-100 border-gray-300 text-sm text-gray-700">
        <strong>Note:</strong> These plans are automatically calculated using your income,
        expenses, and debt data. Your case manager will review and confirm the final plan
        before it becomes active.
      </div>
    </div>
  );
}
