"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const crisisLevelColors: Record<string, string> = {
  CRITICAL: "bg-red-600",
  HIGH: "bg-red-400",
  MEDIUM: "bg-orange-400",
  LOW: "bg-yellow-400",
  NONE: "bg-gray-300",
};

const crisisLevelOrder = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "NONE"] as const;

interface UrgentCase {
  id: string;
  name: string;
  crisisLevel: string;
  issue: string;
  urgency: number;
}

interface DistributionData {
  CRITICAL: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
  NONE: number;
}

export default function TriageDashboardPage() {
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [criticalCases, setCriticalCases] = useState<UrgentCase[]>([]);
  const [distribution, setDistribution] = useState<DistributionData>({
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    NONE: 0,
  });
  const [awaitingCount, setAwaitingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/triage")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch triage data");
        return res.json();
      })
      .then((data) => {
        if (data.urgentCases) setCriticalCases(data.urgentCases);
        if (data.distribution) setDistribution(data.distribution as DistributionData);
        if (data.queue?.awaiting !== undefined) setAwaitingCount(data.queue.awaiting);
      })
      .catch(() => setError("Unable to load triage data. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const crisisDistribution = crisisLevelOrder.map((level) => ({
    level,
    count: distribution[level],
    color: crisisLevelColors[level],
  }));

  const totalCases = crisisDistribution.reduce((s, d) => s + d.count, 0);

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
          {loading ? (
            <div className="animate-pulse mt-1 h-4 bg-gray-200 rounded w-56" />
          ) : (
            <p className="text-sm text-gray-500 mt-1">
              {totalCases} total cases · {distribution.CRITICAL + distribution.HIGH} requiring attention
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {error && (
          <div className="lg:col-span-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {/* Crisis Distribution */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Crisis Level Distribution</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {crisisLevelOrder.map((level) => (
                <div key={level} className="flex items-center gap-3">
                  <div className="h-3 bg-gray-200 rounded w-20" />
                  <div className="flex-1 h-4 bg-gray-200 rounded-full" />
                  <div className="h-3 bg-gray-200 rounded w-6" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {crisisDistribution.map((d) => (
                  <div key={d.level} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-20 text-right text-gray-600">{d.level}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-4">
                      <div
                        className={`${d.color} h-4 rounded-full transition-all duration-500`}
                        style={{ width: totalCases > 0 ? `${(d.count / totalCases) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-6">{d.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <div className="text-lg font-bold text-red-600">{distribution.CRITICAL + distribution.HIGH}</div>
                  <div className="text-gray-500">High/Critical</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{distribution.MEDIUM}</div>
                  <div className="text-gray-500">Medium</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-600">{distribution.LOW + distribution.NONE}</div>
                  <div className="text-gray-500">Low/None</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Urgent Cases */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">
            🚨 Requires Immediate Action
            <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">
              {criticalCases.length} cases
            </span>
          </h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-48" />
                </div>
              ))}
            </div>
          ) : (
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
          )}
        </div>
      </div>

      {/* Triage Queue */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Triage Queue</h2>
            <span className="text-sm text-gray-500">
              {awaitingCount - processedCount > 0 ? awaitingCount - processedCount : 0} awaiting assessment
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
