"use client";

import Link from "next/link";
import { useState } from "react";

interface Debt {
  id: string;
  creditor: string;
  type: string;
  balance: number;
  minimum: number;
  interest: number;
  status: string;
  arrears: number;
}

const initialDebts: Debt[] = [
  { id: "1", creditor: "ANZ Bank", type: "Credit Card", balance: 7500, minimum: 150, interest: 19.99, status: "ACTIVE", arrears: 300 },
  { id: "2", creditor: "Latitude Finance", type: "Personal Loan", balance: 9800, minimum: 280, interest: 14.99, status: "ACTIVE", arrears: 0 },
];

const statusColors: Record<string, string> = {
  ACTIVE: "bg-gray-100 text-gray-700",
  IN_HARDSHIP: "bg-blue-100 text-blue-700",
  NEGOTIATING: "bg-yellow-100 text-yellow-700",
  SETTLED: "bg-green-100 text-green-700",
  PAID_OFF: "bg-green-200 text-green-800",
};

export default function DebtsPage() {
  const [debts, setDebts] = useState<Debt[]>(initialDebts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDebt, setNewDebt] = useState({ creditor: "", type: "Credit Card", balance: "", minimum: "", interest: "" });

  const total = debts.reduce((s, d) => s + d.balance, 0);
  const totalMinimum = debts.reduce((s, d) => s + d.minimum, 0);
  const totalArrears = debts.reduce((s, d) => s + d.arrears, 0);

  function handleAddDebt() {
    if (!newDebt.creditor || !newDebt.balance) return;
    const debt: Debt = {
      id: String(Date.now()),
      creditor: newDebt.creditor,
      type: newDebt.type,
      balance: parseFloat(newDebt.balance),
      minimum: parseFloat(newDebt.minimum) || 0,
      interest: parseFloat(newDebt.interest) || 0,
      status: "ACTIVE",
      arrears: 0,
    };
    setDebts([...debts, debt]);
    setNewDebt({ creditor: "", type: "Credit Card", balance: "", minimum: "", interest: "" });
    setShowAddForm(false);
  }

  function handleRequestHardship(debtId: string) {
    setDebts(debts.map((d) => (d.id === debtId ? { ...d, status: "IN_HARDSHIP" } : d)));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Debts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track all your debts in one place</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary text-sm">
          + Add Debt
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-gray-500">Total Debt</div>
          <div className="text-3xl font-bold text-gray-900">${total.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Monthly Minimums</div>
          <div className="text-3xl font-bold text-gray-900">${totalMinimum}/mo</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-500">Total Arrears</div>
          <div className={`text-3xl font-bold ${totalArrears > 0 ? "text-red-600" : "text-green-600"}`}>
            ${totalArrears.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Add Debt Form */}
      {showAddForm && (
        <div className="card mb-6 border-2 border-brand-200">
          <h3 className="font-semibold text-gray-900 mb-4">Add New Debt</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Creditor</label>
              <input
                type="text"
                value={newDebt.creditor}
                onChange={(e) => setNewDebt({ ...newDebt, creditor: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="e.g. ANZ Bank"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select
                value={newDebt.type}
                onChange={(e) => setNewDebt({ ...newDebt, type: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option>Credit Card</option>
                <option>Personal Loan</option>
                <option>Car Loan</option>
                <option>Mortgage</option>
                <option>BNPL</option>
                <option>Utility Bill</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Balance ($)</label>
              <input
                type="number"
                value={newDebt.balance}
                onChange={(e) => setNewDebt({ ...newDebt, balance: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="7500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Payment ($/mo)</label>
              <input
                type="number"
                value={newDebt.minimum}
                onChange={(e) => setNewDebt({ ...newDebt, minimum: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="150"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Interest Rate (% p.a.)</label>
              <input
                type="number"
                value={newDebt.interest}
                onChange={(e) => setNewDebt({ ...newDebt, interest: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="19.99"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowAddForm(false)} className="btn-secondary text-sm">
              Cancel
            </button>
            <button onClick={handleAddDebt} className="btn-primary text-sm">
              Add Debt
            </button>
          </div>
        </div>
      )}

      {/* Debt List */}
      <div className="space-y-4">
        {debts.map((debt) => (
          <div key={debt.id} className="card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900">{debt.creditor}</div>
                <div className="text-sm text-gray-500">{debt.type}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[debt.status] ?? "bg-gray-100"}`}>
                {debt.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-gray-500">Balance</div>
                <div className="font-semibold text-gray-900">${debt.balance.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Min Payment</div>
                <div className="font-semibold text-gray-900">${debt.minimum}/mo</div>
              </div>
              <div>
                <div className="text-gray-500">Interest Rate</div>
                <div className="font-semibold text-gray-900">{debt.interest}% p.a.</div>
              </div>
            </div>

            {debt.arrears > 0 && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
                ⚠️ ${debt.arrears} in arrears — action required
              </div>
            )}

            <div className="flex gap-2 mt-4">
              {debt.status === "ACTIVE" && (
                <button
                  onClick={() => handleRequestHardship(debt.id)}
                  className="btn-secondary text-xs py-1.5"
                >
                  Request Hardship
                </button>
              )}
              {debt.status === "IN_HARDSHIP" && (
                <span className="text-xs text-blue-600 py-1.5">✓ Hardship request submitted</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Need help negotiating with creditors?{" "}
          <a href="tel:1800007007" className="text-brand-600 hover:underline">
            Call the National Debt Helpline: 1800 007 007
          </a>
        </p>
      </div>
    </div>
  );
}
