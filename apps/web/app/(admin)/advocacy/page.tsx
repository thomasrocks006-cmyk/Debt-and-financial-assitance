"use client";

import { useState } from "react";

interface Negotiation {
  id: string;
  client: string;
  creditor: string;
  type: string;
  status: string;
  sent: string | null;
  deadline: string | null;
}

const initialNegotiations: Negotiation[] = [
  { id: "n1", client: "Alex Demo", creditor: "ANZ Bank", type: "Hardship Request", status: "PENDING", sent: null, deadline: "3 days" },
  { id: "n2", client: "Sarah Wilson", creditor: "Origin Energy", type: "Utility Hardship", status: "SENT", sent: "2 days ago", deadline: "8 days" },
  { id: "n3", client: "James Chen", creditor: "Latitude Finance", type: "Settlement Offer", status: "RESPONSE_RECEIVED", sent: "5 days ago", deadline: null },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  RESPONSE_RECEIVED: "bg-yellow-100 text-yellow-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  ESCALATED: "bg-purple-100 text-purple-700",
};

const letterTypes = [
  { id: "hardship_request", label: "Hardship Request", icon: "📄", description: "Request a hardship arrangement with your creditor" },
  { id: "settlement_offer", label: "Settlement Offer", icon: "💰", description: "Propose a lump-sum settlement" },
  { id: "freeze_request", label: "Interest Freeze", icon: "❄️", description: "Request a temporary freeze on interest and fees" },
  { id: "reduction_request", label: "Rate Reduction", icon: "📉", description: "Request a reduction in interest rate" },
  { id: "dispute", label: "Formal Dispute", icon: "⚖️", description: "Formally dispute a debt or charge" },
];

export default function AdvocacyPage() {
  const [negotiations, setNegotiations] = useState<Negotiation[]>(initialNegotiations);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  function handleUpdateStatus(negId: string, newStatus: string) {
    setNegotiations(negotiations.map((n) =>
      n.id === negId ? { ...n, status: newStatus } : n
    ));
  }

  function handleEscalate(negId: string) {
    setNegotiations(negotiations.map((n) =>
      n.id === negId ? { ...n, status: "ESCALATED" } : n
    ));
  }

  async function handleGenerateLetter(templateId: string) {
    setSelectedTemplate(templateId);
    setGenerating(true);
    // Simulate letter generation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const templates: Record<string, string> = {
      hardship_request: `Dear ANZ Bank Hardship Team,

I am writing to request a hardship arrangement for my credit card account.

I am currently experiencing financial hardship due to reduced work hours and am unable to maintain my regular repayments. I am requesting a temporary reduction in my repayments to $75 per month while I work to stabilise my financial situation.

I understand my obligations and am committed to resolving this debt. I would appreciate your consideration of this request within 21 days as required under the National Credit Code.

Please contact me to discuss.

Sincerely,
Alex Demo`,
      settlement_offer: `Dear Latitude Finance,

I am writing to propose a full and final settlement of my personal loan account.

Due to ongoing financial hardship, I am unable to continue with regular repayments. I am able to offer a lump sum settlement of $6,500 in full satisfaction of this debt (representing approximately 66% of the outstanding balance).

I believe this is a reasonable offer given my financial circumstances and would appreciate your response within 21 days.

Sincerely,
Alex Demo`,
      freeze_request: `Dear Creditor Hardship Team,

I am requesting a temporary freeze on my account including all interest charges and fees for a period of 90 days.

I am currently experiencing financial hardship and require this pause to stabilise my situation before recommencing payments.

Sincerely,
Alex Demo`,
      reduction_request: `Dear Creditor,

I am requesting a reduction in my current interest rate due to financial hardship. A lower rate would enable me to continue making regular payments and avoid defaulting on my obligations.

Sincerely,
Alex Demo`,
      dispute: `Dear Creditor,

I am writing to formally dispute the balance on my account. I believe there are charges that have been incorrectly applied and I request a full review of my account history.

I request a detailed statement of all transactions, fees, and interest charged to this account.

Sincerely,
Alex Demo`,
    };

    setGeneratedLetter(templates[templateId] ?? "Template not found.");
    setGenerating(false);
  }

  const activeCount = negotiations.filter((n) => !["ACCEPTED", "REJECTED"].includes(n.status)).length;
  const awaitingResponse = negotiations.filter((n) => n.status === "SENT").length;
  const escalated = negotiations.filter((n) => n.status === "ESCALATED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advocacy Workspace</h1>
          <p className="text-sm text-gray-500 mt-1">Manage creditor negotiations and generate hardship letters</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
          <div className="text-sm text-gray-500">Active Negotiations</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{awaitingResponse}</div>
          <div className="text-sm text-gray-500">Awaiting Response</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-purple-600">{escalated}</div>
          <div className="text-sm text-gray-500">Escalated to AFCA</div>
        </div>
      </div>

      {/* Negotiations Table */}
      <div className="card p-0 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Creditor Negotiations</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Creditor</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Deadline</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {negotiations.map((n) => (
              <tr key={n.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{n.client}</td>
                <td className="px-6 py-4 text-gray-700">{n.creditor}</td>
                <td className="px-6 py-4 text-gray-600">{n.type}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[n.status] ?? ""}`}>
                    {n.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {n.deadline ? `${n.deadline} remaining` : "—"}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {n.status === "PENDING" && (
                      <button
                        onClick={() => handleUpdateStatus(n.id, "SENT")}
                        className="text-brand-600 hover:underline text-xs font-medium"
                      >
                        Mark Sent
                      </button>
                    )}
                    {n.status === "SENT" && (
                      <button
                        onClick={() => handleUpdateStatus(n.id, "RESPONSE_RECEIVED")}
                        className="text-brand-600 hover:underline text-xs font-medium"
                      >
                        Response Received
                      </button>
                    )}
                    {n.status === "RESPONSE_RECEIVED" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(n.id, "ACCEPTED")}
                          className="text-green-600 hover:underline text-xs font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleEscalate(n.id)}
                          className="text-purple-600 hover:underline text-xs font-medium"
                        >
                          Escalate
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Templates */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Hardship Letter Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {letterTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => handleGenerateLetter(t.id)}
              className={`text-left p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                selectedTemplate === t.id
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="font-medium text-gray-900 text-sm">{t.label}</div>
              <div className="text-xs text-gray-500 mt-1">{t.description}</div>
            </button>
          ))}
        </div>

        {generating && (
          <div className="bg-brand-50 rounded-xl p-6 text-center">
            <div className="animate-pulse text-brand-600 font-medium">Generating letter...</div>
          </div>
        )}

        {generatedLetter && !generating && (
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Generated Letter</h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedLetter);
                }}
                className="btn-secondary text-xs"
              >
                Copy to clipboard
              </button>
            </div>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
              {generatedLetter}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
