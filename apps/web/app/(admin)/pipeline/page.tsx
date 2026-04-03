"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const stageConfig = [
  { id: "TRIAGE", label: "Triage", color: "border-blue-200 bg-blue-50" },
  { id: "CRISIS_STABILISATION", label: "Crisis", color: "border-red-200 bg-red-50" },
  { id: "ASSESSMENT", label: "Assessment", color: "border-yellow-200 bg-yellow-50" },
  { id: "PLAN_DESIGN", label: "Plan Design", color: "border-purple-200 bg-purple-50" },
  { id: "NEGOTIATING", label: "Negotiating", color: "border-orange-200 bg-orange-50" },
  { id: "ACTIVE_RECOVERY", label: "Active Recovery", color: "border-green-200 bg-green-50" },
  { id: "MONITORING", label: "Monitoring", color: "border-teal-200 bg-teal-50" },
];

const crisisColors: Record<string, string> = {
  NONE: "bg-gray-100 text-gray-600",
  LOW: "bg-yellow-100 text-yellow-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  HIGH: "bg-red-100 text-red-700",
  CRITICAL: "bg-red-600 text-white",
};

type SortField = "name" | "crisis" | "debt" | "days";

interface CaseRow {
  id: string;
  name: string;
  stage: string;
  crisis: string;
  debt: number;
  days: number;
}

interface StagesData {
  TRIAGE: number;
  CRISIS_STABILISATION: number;
  ASSESSMENT: number;
  PLAN_DESIGN: number;
  NEGOTIATING: number;
  ACTIVE_RECOVERY: number;
  MONITORING: number;
}

export default function PipelinePage() {
  const [filterStage, setFilterStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("days");
  const [sortAsc, setSortAsc] = useState(true);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [stageCounts, setStageCounts] = useState<StagesData>({
    TRIAGE: 0,
    CRISIS_STABILISATION: 0,
    ASSESSMENT: 0,
    PLAN_DESIGN: 0,
    NEGOTIATING: 0,
    ACTIVE_RECOVERY: 0,
    MONITORING: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cases")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cases");
        return res.json();
      })
      .then((data) => {
        const mapped: CaseRow[] = (data.cases ?? []).map(
          (c: { id: string; clientName: string; status: string; crisisLevel: string; totalDebt: number; daysSinceUpdate: number }) => ({
            id: c.id,
            name: c.clientName,
            stage: c.status,
            crisis: c.crisisLevel,
            debt: c.totalDebt,
            days: c.daysSinceUpdate,
          }),
        );
        setCases(mapped);
        if (data.stages) {
          setStageCounts(data.stages as StagesData);
        }
      })
      .catch(() => setError("Unable to load cases. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const stages = stageConfig.map((s) => ({
    ...s,
    count: stageCounts[s.id as keyof StagesData] ?? 0,
  }));

  const filteredCases = cases
    .filter((c) => {
      if (filterStage && c.stage !== filterStage) return false;
      if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      switch (sortField) {
        case "name": return a.name.localeCompare(b.name) * dir;
        case "crisis": {
          const order = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"];
          return (order.indexOf(a.crisis) - order.indexOf(b.crisis)) * dir;
        }
        case "debt": return (a.debt - b.debt) * dir;
        case "days": return (a.days - b.days) * dir;
        default: return 0;
      }
    });

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Case Pipeline</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clients..."
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
          />
          {filterStage && (
            <button
              onClick={() => setFilterStage(null)}
              className="btn-secondary text-sm"
            >
              Clear filter ✕
            </button>
          )}
        </div>
      </div>

      {/* Stage Summary */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-3 mb-8 animate-pulse">
          {stageConfig.map((s) => (
            <div key={s.id} className={`rounded-lg border p-3 ${s.color}`}>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-7 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
          {stages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => setFilterStage(filterStage === stage.id ? null : stage.id)}
              className={`rounded-lg border p-3 text-left transition-all hover:shadow-md ${stage.color} ${
                filterStage === stage.id ? "ring-2 ring-brand-500" : ""
              }`}
            >
              <div className="text-xs font-medium text-gray-600 truncate">{stage.label}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{stage.count}</div>
            </button>
          ))}
        </div>
      )}

      {/* Cases Table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            {filterStage ? `${filterStage.replace(/_/g, " ")} Cases` : "All Cases"}
          </h2>
          <span className="text-sm text-gray-500">{filteredCases.length} cases</span>
        </div>
        {loading ? (
          <div className="animate-pulse divide-y divide-gray-100">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-4">
                <div className="h-4 bg-gray-200 rounded w-32" />
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-12" />
              </div>
            ))}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("name")}
                >
                  Client {sortField === "name" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Stage</th>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("crisis")}
                >
                  Crisis Level {sortField === "crisis" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("debt")}
                >
                  Total Debt {sortField === "debt" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th
                  className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("days")}
                >
                  Days {sortField === "days" ? (sortAsc ? "↑" : "↓") : ""}
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 text-gray-600">{c.stage.replace(/_/g, " ")}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${crisisColors[c.crisis] ?? ""}`}>
                      {c.crisis}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">${c.debt.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-500">{c.days}d ago</td>
                  <td className="px-6 py-4">
                    <Link href={`/cases/${c.id}`} className="text-brand-600 hover:underline text-xs font-medium">
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No cases found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
