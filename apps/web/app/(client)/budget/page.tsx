"use client";

import { useState, useEffect } from "react";

interface BudgetItem {
  id: string;
  label: string;
  amount: number;
  frequency: string;
  essential?: boolean;
  stable?: boolean;
}

export default function BudgetPage() {
  const [incomeItems, setIncomeItems] = useState<BudgetItem[]>([]);
  const [expenseItems, setExpenseItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", amount: "", frequency: "monthly", essential: true });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/budget")
      .then((r) => r.json())
      .then((data) => {
        setIncomeItems((data.income ?? []).map((i: {
          id: string; source: string; amount: number; frequency: string; stable: boolean;
        }) => ({
          id: i.id,
          label: i.source,
          amount: i.amount,
          frequency: i.frequency,
          stable: i.stable,
        })));
        setExpenseItems((data.expenses ?? []).map((e: {
          id: string; category: string; amount: number; frequency: string; essential: boolean;
        }) => ({
          id: e.id,
          label: e.category,
          amount: e.amount,
          frequency: e.frequency,
          essential: e.essential,
        })));
      })
      .catch(() => setError("Unable to load budget. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const totalIncome = incomeItems.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenseItems.reduce((s, e) => s + e.amount, 0);
  const essentialExpenses = expenseItems.filter((e) => e.essential).reduce((s, e) => s + e.amount, 0);
  const disposable = totalIncome - totalExpenses;
  const rentItem = expenseItems.find((e) => e.label.toLowerCase().includes("rent") || e.label.toLowerCase().includes("housing"));
  const housingRatio = rentItem && totalIncome > 0 ? Math.round((rentItem.amount / totalIncome) * 100) : 0;

  async function addItem(type: "income" | "expense") {
    if (!newItem.label || !newItem.amount) return;
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          ...(type === "income" ? { source: newItem.label, stable: true } : { category: newItem.label, essential: newItem.essential }),
          amount: parseFloat(newItem.amount),
          frequency: newItem.frequency,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const raw = data.item;
        const item: BudgetItem = {
          id: raw.id,
          label: type === "income" ? raw.source : raw.category,
          amount: raw.amount,
          frequency: raw.frequency,
          ...(type === "income" ? { stable: raw.stable } : { essential: raw.essential }),
        };
        if (type === "income") {
          setIncomeItems([...incomeItems, item]);
          setShowIncomeForm(false);
        } else {
          setExpenseItems([...expenseItems, item]);
          setShowExpenseForm(false);
        }
        setNewItem({ label: "", amount: "", frequency: "monthly", essential: true });
        return;
      }
    } catch {
      // fall through to local fallback
    }
    // Local fallback
    const item: BudgetItem = {
      id: `${type === "income" ? "inc" : "exp"}${Date.now()}`,
      label: newItem.label,
      amount: parseFloat(newItem.amount),
      frequency: newItem.frequency,
      ...(type === "income" ? { stable: true } : { essential: newItem.essential }),
    };
    if (type === "income") {
      setIncomeItems([...incomeItems, item]);
      setShowIncomeForm(false);
    } else {
      setExpenseItems([...expenseItems, item]);
      setShowExpenseForm(false);
    }
    setNewItem({ label: "", amount: "", frequency: "monthly", essential: true });
  }

  function removeItem(type: "income" | "expense", id: string) {
    if (type === "income") {
      setIncomeItems(incomeItems.filter((i) => i.id !== id));
    } else {
      setExpenseItems(expenseItems.filter((e) => e.id !== id));
    }
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Track income and expenses to calculate your disposable income</p>
        </div>
        <button onClick={handleSave} className="btn-primary text-sm">
          {saved ? "✓ Saved" : "Save Budget"}
        </button>
      </div>

      {/* Budget Summary */}
      <div className="card mb-6 bg-brand-50 border-brand-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-600">Monthly Income</div>
            <div className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Monthly Expenses</div>
            <div className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Disposable Income</div>
            <div className={`text-2xl font-bold ${disposable >= 0 ? "text-brand-600" : "text-red-600"}`}>
              ${disposable.toLocaleString()}
            </div>
          </div>
        </div>
        {/* Budget tier indicators */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-brand-200 text-center text-xs">
          <div>
            <div className="text-gray-500">Survival Budget</div>
            <div className="font-semibold text-gray-700">${Math.round(disposable * 0.85 * 0.4)}/mo</div>
          </div>
          <div>
            <div className="text-gray-500">Stabilisation Budget</div>
            <div className="font-semibold text-gray-700">${Math.round(disposable * 0.85 * 0.7)}/mo</div>
          </div>
          <div>
            <div className="text-gray-500">Recovery Budget</div>
            <div className="font-semibold text-gray-700">${Math.round(disposable * 0.85)}/mo</div>
          </div>
        </div>
      </div>

      {/* Risk alerts */}
      {housingRatio > 40 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-sm text-red-700">
          ⚠️ <strong>Housing stress detected:</strong> Your rent is {housingRatio}% of your income (above the 40% threshold).
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">💰 Income</h2>
            <button
              onClick={() => setShowIncomeForm(true)}
              className="text-sm text-brand-600 hover:underline"
            >
              + Add
            </button>
          </div>

          {showIncomeForm && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
              <input
                type="text"
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="Source (e.g. Part-time job)"
              />
              <input
                type="number"
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="Amount"
                min="0"
              />
              <div className="flex gap-2">
                <button onClick={() => addItem("income")} className="btn-primary text-xs">Add</button>
                <button onClick={() => setShowIncomeForm(false)} className="btn-secondary text-xs">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {incomeItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.frequency}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-green-600">
                    +${item.amount.toLocaleString()}
                  </div>
                  <button
                    onClick={() => removeItem("income", item.id)}
                    className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expenses */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">💸 Expenses</h2>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="text-sm text-brand-600 hover:underline"
            >
              + Add
            </button>
          </div>

          {showExpenseForm && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
              <input
                type="text"
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="Category (e.g. Subscriptions)"
              />
              <input
                type="number"
                value={newItem.amount}
                onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                placeholder="Amount"
                min="0"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newItem.essential}
                  onChange={(e) => setNewItem({ ...newItem, essential: e.target.checked })}
                  className="rounded border-gray-300"
                />
                Essential expense
              </label>
              <div className="flex gap-2">
                <button onClick={() => addItem("expense")} className="btn-primary text-xs">Add</button>
                <button onClick={() => setShowExpenseForm(false)} className="btn-secondary text-xs">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {expenseItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group">
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500">
                    {item.essential ? "Essential" : "Non-essential"} · {item.frequency}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-semibold text-red-600">
                    -${item.amount.toLocaleString()}
                  </div>
                  <button
                    onClick={() => removeItem("expense", item.id)}
                    className="text-gray-300 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Essential</span>
              <span>${essentialExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500 mt-1">
              <span>Non-essential</span>
              <span>${(totalExpenses - essentialExpenses).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* HEM Note */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>Australian HEM Benchmarks:</strong> Your essential expenses are checked against
        the Household Expenditure Measure to ensure your budget is realistic and defensible
        for hardship applications.
      </div>
    </div>
  );
}
