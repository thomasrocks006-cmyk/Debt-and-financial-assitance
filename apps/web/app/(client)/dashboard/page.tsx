"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface DashboardData {
  recoveryScore: number;
  stage: string;
  metrics: Array<{ label: string; value: string; change: string; positive: boolean }>;
  tasks: Array<{ title: string; due: string; priority: string; completed: boolean }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "User";

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data from APIs
    const timer = setTimeout(() => {
      setData({
        recoveryScore: 42,
        stage: "Stabilise",
        metrics: [
          { label: "Total Debt", value: "$17,300", change: "-$200", positive: true },
          { label: "Monthly Payment", value: "$450", change: "On track", positive: true },
          { label: "Next Milestone", value: "3 months", change: "Emergency fund", positive: true },
          { label: "Crisis Level", value: "MEDIUM", change: "Improving", positive: true },
        ],
        tasks: [
          { title: "Submit hardship application to ANZ", due: "2 days", priority: "high", completed: false },
          { title: "Update budget with new income", due: "5 days", priority: "medium", completed: false },
          { title: "Review plan with case manager", due: "1 week", priority: "medium", completed: false },
        ],
      });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  const { recoveryScore, stage, metrics, tasks } = data;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good morning, {userName.split(" ")[0]}
          </h1>
          <p className="text-gray-600 mt-1">
            You&apos;re in <strong>{stage}</strong> stage. Keep going — you&apos;re making progress.
          </p>
        </div>
        <Link href="/crisis" className="btn-danger text-sm">
          ⚡ I can&apos;t make a payment
        </Link>
      </div>

      {/* Recovery Score */}
      <div className="card mb-6 bg-gradient-to-r from-brand-600 to-brand-700 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-brand-100 text-sm font-medium mb-1">Recovery Score</div>
            <div className="text-5xl font-bold">{recoveryScore}</div>
            <div className="text-brand-100 text-sm mt-1">out of 100 — {stage} Phase</div>
          </div>
          <div className="w-24 h-24 rounded-full border-4 border-brand-400 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{recoveryScore}%</div>
              <div className="text-xs text-brand-200">recovered</div>
            </div>
          </div>
        </div>
        <div className="mt-4 bg-brand-800 rounded-full h-2">
          <div
            className="bg-white rounded-full h-2 transition-all duration-1000"
            style={{ width: `${recoveryScore}%` }}
          />
        </div>
        {/* Stage progress indicators */}
        <div className="flex justify-between mt-2 text-xs text-brand-200">
          <span className={stage === "Survive" ? "text-white font-medium" : ""}>Survive</span>
          <span className={stage === "Stabilise" ? "text-white font-medium" : ""}>Stabilise</span>
          <span className={stage === "Recover" ? "text-white font-medium" : ""}>Recover</span>
          <span className={stage === "Rebuild" ? "text-white font-medium" : ""}>Rebuild</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric) => (
          <div key={metric.label} className="card">
            <div className="text-sm text-gray-500 mb-1">{metric.label}</div>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
            <div className={`text-xs mt-1 ${metric.positive ? "text-green-600" : "text-red-600"}`}>
              {metric.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks */}
        <div className="lg:col-span-2 card">
          <h2 className="font-semibold text-gray-900 mb-4">Your next actions</h2>
          <div className="space-y-3">
            {tasks.map((task, i) => (
              <TaskItem key={i} task={task} />
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Quick actions</h2>
          <div className="space-y-2">
            <Link href="/debts" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
              💳 View my debts
            </Link>
            <Link href="/budget" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
              📊 Update budget
            </Link>
            <Link href="/plan" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
              📋 My recovery plan
            </Link>
            <a href="tel:1800007007" className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-50 text-sm text-gray-700 transition-colors">
              📞 Call financial counsellor
            </a>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent activity</h3>
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span>Budget updated — 2 days ago</span>
              </div>
              <div className="flex gap-2">
                <span className="text-blue-500">→</span>
                <span>Hardship letter sent to ANZ — 5 days ago</span>
              </div>
              <div className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span>Triage assessment completed — 1 week ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskItem({ task }: { task: { title: string; due: string; priority: string; completed: boolean } }) {
  const [completed, setCompleted] = useState(task.completed);

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
      completed ? "bg-green-50" : "bg-gray-50"
    }`}>
      <button
        onClick={() => setCompleted(!completed)}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          completed
            ? "bg-green-500 border-green-500 text-white"
            : "border-gray-300 hover:border-brand-500"
        }`}
      >
        {completed && <span className="text-xs">✓</span>}
      </button>
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        task.priority === "high" ? "bg-red-500" : "bg-amber-400"
      }`} />
      <div className="flex-1">
        <div className={`text-sm font-medium ${completed ? "line-through text-gray-400" : "text-gray-900"}`}>
          {task.title}
        </div>
        <div className="text-xs text-gray-500">Due in {task.due}</div>
      </div>
      {!completed && (
        <button
          onClick={() => setCompleted(true)}
          className="text-xs text-brand-600 hover:underline"
        >
          Complete
        </button>
      )}
    </div>
  );
}
