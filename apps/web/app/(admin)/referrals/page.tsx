"use client";

import { useState } from "react";

interface Referral {
  id: string;
  client: string;
  service: string;
  provider: string;
  status: string;
  consentGiven: boolean;
  sentAt: string | null;
}

const initialReferrals: Referral[] = [
  { id: "r1", client: "Sarah Wilson", service: "FAMILY_VIOLENCE", provider: "1800RESPECT", status: "SENT", consentGiven: true, sentAt: "1 day ago" },
  { id: "r2", client: "Alex Demo", service: "DEBT_MANAGEMENT", provider: "National Debt Helpline", status: "PENDING", consentGiven: false, sentAt: null },
  { id: "r3", client: "James Chen", service: "GAMBLING_SUPPORT", provider: "Gamblers Help", status: "ACCEPTED", consentGiven: true, sentAt: "3 days ago" },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-brand-100 text-brand-700",
  COMPLETED: "bg-green-200 text-green-800",
  DECLINED: "bg-red-100 text-red-700",
};

const serviceDirectory = [
  { name: "National Debt Helpline", service: "Debt Management", phone: "1800 007 007", type: "DEBT_MANAGEMENT" },
  { name: "1800RESPECT", service: "Family Violence Support", phone: "1800 737 732", type: "FAMILY_VIOLENCE" },
  { name: "Gamblers Help", service: "Gambling Support", phone: "1800 858 858", type: "GAMBLING_SUPPORT" },
  { name: "Foodbank Australia", service: "Emergency Food Relief", phone: "1300 367 599", type: "EMERGENCY_RELIEF" },
  { name: "Salvation Army", service: "Emergency Assistance", phone: "13 72 58", type: "EMERGENCY_RELIEF" },
  { name: "Legal Aid", service: "Legal Assistance", phone: "1300 888 529", type: "LEGAL_AID" },
  { name: "Tenancy Advice", service: "Rental/Housing Support", phone: "1300 402 558", type: "RENTAL_STRESS" },
  { name: "Centrelink", service: "Government Support", phone: "136 240", type: "GOVERNMENT" },
];

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals);
  const [showDirectory, setShowDirectory] = useState(false);
  const [showNewReferral, setShowNewReferral] = useState(false);
  const [newReferral, setNewReferral] = useState({ client: "", service: "", provider: "" });

  function handleGrantConsent(refId: string) {
    setReferrals(referrals.map((r) =>
      r.id === refId ? { ...r, consentGiven: true } : r
    ));
  }

  function handleSendReferral(refId: string) {
    setReferrals(referrals.map((r) =>
      r.id === refId ? { ...r, status: "SENT", sentAt: "Just now" } : r
    ));
  }

  function handleCompleteReferral(refId: string) {
    setReferrals(referrals.map((r) =>
      r.id === refId ? { ...r, status: "COMPLETED" } : r
    ));
  }

  function handleAddReferral() {
    if (!newReferral.client || !newReferral.provider) return;
    const ref: Referral = {
      id: `r${Date.now()}`,
      client: newReferral.client,
      service: newReferral.service,
      provider: newReferral.provider,
      status: "PENDING",
      consentGiven: false,
      sentAt: null,
    };
    setReferrals([...referrals, ref]);
    setNewReferral({ client: "", service: "", provider: "" });
    setShowNewReferral(false);
  }

  const awaitingConsent = referrals.filter((r) => !r.consentGiven).length;
  const accepted = referrals.filter((r) => r.status === "ACCEPTED").length;
  const completed = referrals.filter((r) => r.status === "COMPLETED").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage client referrals to support services</p>
        </div>
        <button
          onClick={() => setShowNewReferral(true)}
          className="btn-primary text-sm"
        >
          + New Referral
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">{referrals.length}</div>
          <div className="text-sm text-gray-500">Total Referrals</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{awaitingConsent}</div>
          <div className="text-sm text-gray-500">Awaiting Consent</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{accepted}</div>
          <div className="text-sm text-gray-500">Accepted</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-brand-600">{completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
      </div>

      {/* New Referral Form */}
      {showNewReferral && (
        <div className="card mb-6 border-2 border-brand-200">
          <h3 className="font-semibold text-gray-900 mb-4">Create New Referral</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Client</label>
              <input
                type="text"
                value={newReferral.client}
                onChange={(e) => setNewReferral({ ...newReferral, client: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="Client name"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Service Type</label>
              <select
                value={newReferral.service}
                onChange={(e) => setNewReferral({ ...newReferral, service: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
              >
                <option value="">Select...</option>
                <option value="DEBT_MANAGEMENT">Debt Management</option>
                <option value="FAMILY_VIOLENCE">Family Violence</option>
                <option value="GAMBLING_SUPPORT">Gambling Support</option>
                <option value="EMERGENCY_RELIEF">Emergency Relief</option>
                <option value="LEGAL_AID">Legal Aid</option>
                <option value="RENTAL_STRESS">Rental/Housing</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Provider</label>
              <input
                type="text"
                value={newReferral.provider}
                onChange={(e) => setNewReferral({ ...newReferral, provider: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="Provider name"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowNewReferral(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={handleAddReferral} className="btn-primary text-sm">Create Referral</button>
          </div>
        </div>
      )}

      {/* Referrals Table */}
      <div className="card p-0 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Active Referrals</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Service</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Provider</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Consent</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {referrals.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{r.client}</td>
                <td className="px-6 py-4 text-gray-600">{r.service.replace(/_/g, " ")}</td>
                <td className="px-6 py-4 text-gray-700">{r.provider}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[r.status] ?? ""}`}>
                    {r.status.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {r.consentGiven ? (
                    <span className="text-green-600 text-xs">✓ Given</span>
                  ) : (
                    <button
                      onClick={() => handleGrantConsent(r.id)}
                      className="text-red-600 hover:text-green-600 text-xs font-medium"
                    >
                      ⚠ Grant
                    </button>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {r.status === "PENDING" && r.consentGiven && (
                      <button
                        onClick={() => handleSendReferral(r.id)}
                        className="text-brand-600 hover:underline text-xs font-medium"
                      >
                        Send
                      </button>
                    )}
                    {r.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleCompleteReferral(r.id)}
                        className="text-green-600 hover:underline text-xs font-medium"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Resource Directory */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Australian Community Resource Directory</h2>
            <p className="text-sm text-gray-600 mt-1">
              Pre-populated directory of Australian support services.
            </p>
          </div>
          <button
            onClick={() => setShowDirectory(!showDirectory)}
            className="btn-secondary text-sm"
          >
            {showDirectory ? "Hide Directory" : "Browse Directory"}
          </button>
        </div>

        {showDirectory && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {serviceDirectory.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.service}</div>
                </div>
                <a
                  href={`tel:${s.phone.replace(/\s/g, "")}`}
                  className="text-sm text-brand-600 font-medium hover:underline"
                >
                  {s.phone}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
