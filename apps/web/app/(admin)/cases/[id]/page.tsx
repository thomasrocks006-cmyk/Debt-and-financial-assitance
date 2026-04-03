"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

interface CaseData {
  name: string;
  status: string;
  crisisLevel: string;
  stage: string;
  caseManager: string;
  debts: Array<{ creditor: string; type: string; balance: number; interest: number; arrears: number }>;
  compliance: Array<{ label: string; passed: boolean }>;
  notes: Array<{ author: string; time: string; text: string }>;
}

const statusColors: Record<string, string> = {
  TRIAGE: "bg-blue-100 text-blue-700",
  CRISIS_STABILISATION: "bg-red-100 text-red-700",
  ASSESSMENT: "bg-yellow-100 text-yellow-700",
  PLAN_DESIGN: "bg-purple-100 text-purple-700",
  NEGOTIATING: "bg-orange-100 text-orange-700",
  ACTIVE_RECOVERY: "bg-green-100 text-green-700",
  MONITORING: "bg-teal-100 text-teal-700",
};

const crisisColors: Record<string, string> = {
  NONE: "bg-gray-100 text-gray-700",
  LOW: "bg-yellow-100 text-yellow-700",
  MEDIUM: "bg-orange-100 text-orange-700",
  HIGH: "bg-red-100 text-red-700",
  CRITICAL: "bg-red-600 text-white",
};

export default function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { id } = use(params);
  const [data, setData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState<Array<{ author: string; time: string; text: string }>>([]);
  const [caseStatus, setCaseStatus] = useState("TRIAGE");

  useEffect(() => {
    fetch(`/api/cases/${id}`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setFetchError(true);
          return;
        }
        const json: CaseData = await res.json();
        setData(json);
        setNotes(json.notes);
        setCaseStatus(json.status);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-80 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="card h-48 bg-gray-100" />
            <div className="card h-40 bg-gray-100" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <div className="card h-40 bg-gray-100" />
            <div className="card h-48 bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Case #{id} Not Found</h1>
        <p className="text-gray-600 mb-6">This case could not be found in the system.</p>
        <Link href="/pipeline" className="btn-primary">
          ← Back to Pipeline
        </Link>
      </div>
    );
  }

  if (fetchError || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Case</h1>
        <p className="text-gray-600 mb-6">There was an error loading case #{id}. Please try again later.</p>
        <Link href="/pipeline" className="btn-primary">
          ← Back to Pipeline
        </Link>
      </div>
    );
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    setNotes([
      ...notes,
      { author: "You", time: "Just now", text: noteText.trim() },
    ]);
    setNoteText("");
  }

  function handleAdvanceStage() {
    const stageOrder = [
      "TRIAGE", "CRISIS_STABILISATION", "ASSESSMENT", "PLAN_DESIGN",
      "NEGOTIATING", "ACTIVE_RECOVERY", "MONITORING",
    ];
    const currentIndex = stageOrder.indexOf(caseStatus);
    if (currentIndex < stageOrder.length - 1) {
      setCaseStatus(stageOrder[currentIndex + 1]);
    }
  }

  const totalDebt = data.debts.reduce((s, d) => s + d.balance, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/pipeline" className="text-sm text-gray-600 hover:text-gray-900">
            ← Pipeline
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Case #{id} — {data.name}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleAdvanceStage} className="btn-secondary text-sm">
            Advance Stage →
          </button>
          <Link href={`/advocacy`} className="btn-primary text-sm">
            Start Advocacy
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Client Info */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Client Profile</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium">{data.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Case Status</span>
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${statusColors[caseStatus] ?? ""}`}>
                  {caseStatus.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Crisis Level</span>
                <span className={`font-medium px-2 py-0.5 rounded-full text-xs ${crisisColors[data.crisisLevel] ?? ""}`}>
                  {data.crisisLevel}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Stage</span>
                <span className="font-medium">{data.stage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Case Manager</span>
                <span className="font-medium">{data.caseManager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Debt</span>
                <span className="font-semibold text-gray-900">${totalDebt.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Compliance Status</h2>
            <div className="space-y-2 text-sm">
              {data.compliance.map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={item.passed ? "text-green-500" : "text-yellow-500"}>
                    {item.passed ? "✓" : "⚠"}
                  </span>
                  <span className={item.passed ? "" : "text-yellow-700"}>{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {data.compliance.filter((c) => c.passed).length}/{data.compliance.length} requirements met
              </div>
            </div>
          </div>
        </div>

        {/* Center: Debts & Notes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Debt Summary</h2>
            <div className="space-y-3">
              {data.debts.map((debt, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <div>
                    <div className="font-medium">{debt.creditor} — {debt.type}</div>
                    <div className="text-gray-500">
                      {debt.interest}% p.a.
                      {debt.arrears > 0 && ` · $${debt.arrears} arrears`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${debt.balance.toLocaleString()}</div>
                    {debt.arrears > 0 && (
                      <div className="text-xs text-red-600">⚠ Arrears</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>${totalDebt.toLocaleString()}</span>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Notes & Activity</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {notes.map((note, i) => (
                <div key={i} className={`rounded-lg p-3 text-sm ${
                  note.author === "System" ? "bg-gray-50" : "bg-blue-50"
                }`}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className="font-medium">{note.author}</span>
                    <span>{note.time}</span>
                  </div>
                  <div>{note.text}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                placeholder="Add a note..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button onClick={handleAddNote} className="btn-primary text-sm">
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
