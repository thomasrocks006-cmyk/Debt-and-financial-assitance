"use client";

import { useState, useEffect } from "react";

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

const PLAN_STYLES: Record<string, { color: string; badge: string; badgeLabel: string }> = {
  survival: {
    color: "border-red-200 bg-red-50",
    badge: "bg-red-100 text-red-700",
    badgeLabel: "Low Risk of Default",
  },
  balanced: {
    color: "border-brand-200 bg-brand-50",
    badge: "bg-brand-100 text-brand-700",
    badgeLabel: "Recommended",
  },
  aggressive: {
    color: "border-purple-200 bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    badgeLabel: "Fastest Payoff",
  },
};

export default function PlanPage() {
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [disposableIncome, setDisposableIncome] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        setDisposableIncome(data.disposableIncome ?? 0);
        const options: PlanOption[] = (data.plans ?? []).map((p: {
          name: string;
          label: string;
          strategy: string;
          monthlyPayment: number;
          totalMonths: number;
          failureProbability: number;
          riskScore: number;
          stage: string;
          description: string;
          recommended?: boolean;
          allocations: Array<{ creditor: string; monthlyPayment: number; allocationPercent: number }>;
        }) => ({
          name: p.name,
          label: p.label,
          strategy: p.strategy,
          monthly: p.monthlyPayment,
          months: p.totalMonths,
          failureProb: p.failureProbability,
          riskScore: p.riskScore,
          stage: p.stage,
          description: p.description,
          highlighted: p.recommended ?? false,
          ...(PLAN_STYLES[p.name] ?? {
            color: "border-gray-200 bg-gray-50",
            badge: "bg-gray-100 text-gray-700",
            badgeLabel: p.name,
          }),
          allocations: (p.allocations ?? []).map((a) => ({
            creditor: a.creditor,
            amount: a.monthlyPayment,
            percent: a.allocationPercent,
          })),
        }));
        setPlanOptions(options);
      })
      .catch(() => setError("Unable to load plans. Please try again."))
      .finally(() => setLoading(false));
  }, []);

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
      setSelectedPlan(planName);
      setConfirmed(true);
    }
    setConfirming(false);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded w-2/3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Recovery Plan</h1>
        <p className="text-gray-600 mt-1">
          Based on your affordability assessment. Disposable income:{" "}
          <strong>${disposableIncome.toLocaleString()}/month</strong>.
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
