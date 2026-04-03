"use client";

import Link from "next/link";
import { useState, use } from "react";

interface CaseDetailPageProps {
  params: Promise<{ id: string }>;
}

// Mock case database
const caseData: Record<string, {
  name: string;
  status: string;
  crisisLevel: string;
  stage: string;
  caseManager: string;
  debts: Array<{ creditor: string; type: string; balance: number; interest: number; arrears: number }>;
  compliance: Array<{ label: string; passed: boolean }>;
  notes: Array<{ author: string; time: string; text: string }>;
}> = {
  c1: {
    name: "Alex Demo",
    status: "ASSESSMENT",
    crisisLevel: "MEDIUM",
    stage: "Stabilise",
    caseManager: "Jane Smith",
    debts: [
      { creditor: "ANZ Bank", type: "Credit Card", balance: 7500, interest: 19.99, arrears: 300 },
      { creditor: "Latitude Finance", type: "Personal Loan", balance: 9800, interest: 14.99, arrears: 0 },
    ],
    compliance: [
      { label: "Consent recorded", passed: true },
      { label: "Affordability assessed", passed: true },
      { label: "Fee disclosure delivered", passed: true },
      { label: "Service terms provided", passed: true },
      { label: "Complaint process sent", passed: false },
      { label: "Privacy disclosure", passed: true },
    ],
    notes: [
      { author: "Jane Smith", time: "2 days ago", text: "Initial assessment completed. Client in stabilise phase. ANZ hardship application to be submitted." },
    ],
  },
  c2: {
    name: "Sarah Wilson",
    status: "CRISIS_STABILISATION",
    crisisLevel: "HIGH",
    stage: "Survive",
    caseManager: "Jane Smith",
    debts: [
      { creditor: "CBA", type: "Credit Card", balance: 12000, interest: 21.49, arrears: 2500 },
      { creditor: "Westpac", type: "Mortgage", balance: 30000, interest: 5.99, arrears: 4500 },
    ],
    compliance: [
      { label: "Consent recorded", passed: true },
      { label: "Affordability assessed", passed: false },
      { label: "Fee disclosure delivered", passed: true },
      { label: "Service terms provided", passed: true },
      { label: "Complaint process sent", passed: true },
      { label: "Privacy disclosure", passed: true },
    ],
    notes: [
      { author: "Jane Smith", time: "1 day ago", text: "Eviction notice received. Urgent referral to tenancy support. Safety assessment completed — no immediate safety concerns." },
      { author: "System", time: "1 day ago", text: "Auto-triage: CRITICAL → HIGH after initial stabilisation. Service streams: RENTAL_STRESS, FAMILY_VIOLENCE." },
    ],
  },
};

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
  const data = caseData[id];
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState(data?.notes ?? []);
  const [caseStatus, setCaseStatus] = useState(data?.status ?? "TRIAGE");

  if (!data) {
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
