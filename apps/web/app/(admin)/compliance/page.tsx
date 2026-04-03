"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ComplianceItem {
  id: string;
  client: string;
  affordability: boolean;
  consent: boolean;
  feeDisclosure: boolean;
  serviceTerms: boolean;
  complaintProcess: boolean;
  privacy: boolean;
  isCompliant: boolean;
  issues: number;
}

const MOCK_ITEMS: ComplianceItem[] = [
  { id: "c1", client: "Alex Demo", affordability: true, consent: true, feeDisclosure: true, serviceTerms: true, complaintProcess: false, privacy: true, isCompliant: false, issues: 1 },
  { id: "c2", client: "Sarah Wilson", affordability: true, consent: true, feeDisclosure: true, serviceTerms: true, complaintProcess: true, privacy: true, isCompliant: true, issues: 0 },
  { id: "c3", client: "James Chen", affordability: true, consent: false, feeDisclosure: false, serviceTerms: false, complaintProcess: false, privacy: false, isCompliant: false, issues: 4 },
];

const ISSUE_FIELDS: Array<{ key: keyof ComplianceItem; label: string; issueCode: string }> = [
  { key: "affordability", label: "Affordability", issueCode: "MISSING_AFFORDABILITY" },
  { key: "consent", label: "Consent", issueCode: "MISSING_CONSENT" },
  { key: "feeDisclosure", label: "Fee Disc.", issueCode: "MISSING_FEE_DISCLOSURE" },
  { key: "serviceTerms", label: "Terms", issueCode: "MISSING_SERVICE_TERMS" },
  { key: "complaintProcess", label: "Complaint", issueCode: "MISSING_COMPLAINT_PROCESS" },
  { key: "privacy", label: "Privacy", issueCode: "MISSING_PRIVACY_DISCLOSURE" },
];

export default function ComplianceDashboardPage() {
  const [items, setItems] = useState<ComplianceItem[]>(MOCK_ITEMS);
  const [resolving, setResolving] = useState<string | null>(null);
  const [rechecking, setRechecking] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/compliance")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.cases) && data.cases.length > 0) setItems(data.cases);
      })
      .catch(() => {/* use mock data */})
      .finally(() => setLoading(false));
  }, []);

  async function handleResolve(itemId: string, issueCode: string) {
    const key = `${itemId}-${issueCode}`;
    setResolving(key);
    try {
      await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: itemId, issueCode, action: "mark_resolved" }),
      });
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== itemId) return item;
          const fieldKey = ISSUE_FIELDS.find((f) => f.issueCode === issueCode)?.key;
          if (!fieldKey) return item;
          const updated = { ...item, [fieldKey]: true };
          const newIssues = ISSUE_FIELDS.filter((f) => !updated[f.key as keyof ComplianceItem]).length;
          return { ...updated, issues: newIssues, isCompliant: newIssues === 0 };
        })
      );
    } catch {/* silent */} finally {
      setResolving(null);
    }
  }

  async function handleRecheck(itemId: string) {
    setRechecking(itemId);
    try {
      const res = await fetch("/api/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId: itemId, action: "recheck" }),
      });
      const data = await res.json();
      if (data.updated) {
        setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...data.updated } : item)));
      }
    } catch {/* silent */} finally {
      setRechecking(null);
    }
  }

  const compliant = items.filter((c) => c.isCompliant).length;
  const nonCompliant = items.filter((c) => !c.isCompliant).length;

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/pipeline" className="text-sm text-gray-600 hover:text-gray-900">← Pipeline</Link>
          <h1 className="font-semibold text-gray-900">Compliance Dashboard</h1>
          <span className="text-xs text-gray-400">NCCP · ASIC RG 209 · AFCA</span>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center">
            <div className="text-2xl font-bold text-green-600">{compliant}</div>
            <div className="text-sm text-gray-500">Fully Compliant</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-red-600">{nonCompliant}</div>
            <div className="text-sm text-gray-500">Non-Compliant</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-gray-900">
              {items.length > 0 ? Math.round((compliant / items.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-500">Compliance Rate</div>
          </div>
        </div>

        {loading ? (
          <div className="card text-center text-gray-500 py-12">Loading compliance data…</div>
        ) : (
          <div className="space-y-4">
            {items.map((c) => (
              <div key={c.id} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{c.client}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.isCompliant ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {c.isCompliant ? "✓ Compliant" : `${c.issues} issue${c.issues !== 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRecheck(c.id)}
                    disabled={rechecking === c.id}
                    className="btn-secondary text-xs py-1"
                  >
                    {rechecking === c.id ? "Checking…" : "Re-check"}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ISSUE_FIELDS.map(({ key, label, issueCode }) => {
                    const ok = c[key as keyof ComplianceItem] as boolean;
                    const resolvingKey = `${c.id}-${issueCode}`;
                    return (
                      <div key={key} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${ok ? "bg-green-50" : "bg-red-50"}`}>
                        <span className={ok ? "text-green-700" : "text-red-700"}>
                          {ok ? "✓" : "✗"} {label}
                        </span>
                        {!ok && (
                          <button
                            onClick={() => handleResolve(c.id, issueCode)}
                            disabled={resolving === resolvingKey}
                            className="text-xs text-brand-600 hover:text-brand-800 font-medium ml-2"
                          >
                            {resolving === resolvingKey ? "…" : "Resolve"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card bg-blue-50 border-blue-200 mt-6">
          <h2 className="font-semibold text-gray-900 mb-2">Regulatory Framework</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-700">
            <div><div className="font-medium">NCCP Act</div><div className="text-gray-600">National Consumer Credit Protection — Responsible Lending obligations</div></div>
            <div><div className="font-medium">ASIC RG 209</div><div className="text-gray-600">Affordability assessment requirements for credit providers</div></div>
            <div><div className="font-medium">AFCA Rules</div><div className="text-gray-600">Complaint handling and dispute resolution requirements</div></div>
          </div>
        </div>
      </div>
    </main>
  );
}
