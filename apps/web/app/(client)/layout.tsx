"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const clientNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/debts", label: "Debts", icon: "💳" },
  { href: "/budget", label: "Budget", icon: "📋" },
  { href: "/plan", label: "Plan", icon: "🎯" },
  { href: "/crisis", label: "Crisis", icon: "⚡", danger: true },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "User";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-semibold text-gray-900 hidden sm:inline">RecoveryOS</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4">
            {clientNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    item.danger
                      ? "text-red-600 hover:bg-red-50 font-medium"
                      : isActive
                        ? "bg-brand-50 text-brand-700 font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="hidden sm:inline">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden md:inline">{userName}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      {children}
    </div>
  );
}
