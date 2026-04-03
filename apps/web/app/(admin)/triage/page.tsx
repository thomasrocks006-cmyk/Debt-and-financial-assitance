"use client";

import Link from "next/link";
import { useState } from "react";

const initialCriticalCases = [
  { id: "c2", name: "Sarah Wilson", crisis: "CRITICAL", issue: "Eviction notice received — 3 days", urgency: 1 },
  { id: "c5", name: "Michael Brown", crisis: "HIGH", issue: "Utility disconnection risk", urgency: 2 },
  { id: "c6", name: "Emma Davis", crisis: "HIGH", issue: "Family violence flag — coerced debt", urgency: 2 },
];

const crisisDistribution = [
  { level: "CRITICAL", count: 1, color: "bg-red-600" },
  { level: "HIGH", count: 4, color: "bg-red-400" },
  { level: "MEDIUM", count: 9, color: "bg-orange-400" },
  { level: "LOW", count: 12, color: "bg-yellow-400" },
  { level: "NONE", count: 18, color: "bg-gray-300" },
];

const totalCases = crisisDistribution.reduce((s, d) => s + d.count, 0);

export default function TriageDashboardPage() {
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [criticalCases, setCriticalCases] = useState(initialCriticalCases);

  async function handleProcessQueue() {
    setProcessing(true);
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setProcessedCount((prev) => prev + 2);
    setProcessing(false);
  }

  function handleDismissCase(caseId: string) {
    setCriticalCases(criticalCases.filter((c) => c.id !== caseId));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Triage Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalCases} total cases · {crisisDistribution[0].count + crisisDistribution[1].count} requiring attention
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crisis Distribution */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Crisis Level Distribution</h2>
          <div className="space-y-3">
            {crisisDistribution.map((d) => (
              <div key={d.level} className="flex items-center gap-3">
                <span className="text-xs font-medium w-20 text-right text-gray-600">{d.level}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-4">
                  <div
                    className={`${d.color} h-4 rounded-full transition-all duration-500`}
                    style={{ width: `${(d.count / totalCases) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-gray-700 w-6">{d.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="text-lg font-bold text-red-600">{crisisDistribution[0].count + crisisDistribution[1].count}</div>
              <div className="text-gray-500">High/Critical</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-600">{crisisDistribution[2].count}</div>
              <div className="text-gray-500">Medium</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-600">{crisisDistribution[3].count + crisisDistribution[4].count}</div>
              <div className="text-gray-500">Low/None</div>
            </div>
          </div>
        </div>

        {/* Urgent Cases */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">
            🚨 Requires Immediate Action
            <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
              {criticalCases.length} cases
            </span>
          </h2>
          <div className="space-y-3">
            {criticalCases.map((c) => (
              <div key={c.id} className="flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{c.name}</div>
                  <div className="text-xs text-red-700 mt-0.5">{c.issue}</div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/cases/${c.id}`} className="btn-danger text-xs py-1 px-3">
                    Open
                  </Link>
                  <button
                    onClick={() => handleDismissCase(c.id)}
                    className="text-xs text-gray-400 hover:text-gray-600 py-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {criticalCases.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                ✓ All urgent cases have been reviewed
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Triage Queue */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Triage Queue</h2>
            <span className="text-sm text-gray-500">
              {4 - processedCount} awaiting assessment
              {processedCount > 0 && ` · ${processedCount} processed today`}
            </span>
          </div>
          <button
            onClick={handleProcessQueue}
            disabled={processing}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {processing ? "Processing..." : "Process Queue"}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          New clients who have completed the initial questionnaire and are awaiting
          triage assessment. The triage engine has scored them — review and confirm
          the crisis level and service streams.
        </p>
        {processedCount > 0 && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
            ✓ {processedCount} cases processed and assigned to case managers.
          </div>
        )}
      </div>
    </div>
  );
}
