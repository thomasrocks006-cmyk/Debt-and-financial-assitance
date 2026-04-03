"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const adminNavItems = [
  { href: "/pipeline", label: "Pipeline", icon: "📋" },
  { href: "/triage", label: "Triage", icon: "🔍" },
  { href: "/advocacy", label: "Advocacy", icon: "📣" },
  { href: "/referrals", label: "Referrals", icon: "🤝" },
  { href: "/compliance", label: "Compliance", icon: "✅" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userName = session?.user?.name ?? "Admin";
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? "ADMIN";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation */}
      <header className="bg-gray-900 text-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/pipeline" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-semibold">RecoveryOS</span>
              <span className="text-gray-400 text-xs ml-2">Admin</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-gray-700 text-white font-medium"
                      : "text-gray-300 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  <span className="hidden sm:inline">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm text-gray-200">{userName}</span>
              <span className="text-xs text-gray-400">{userRole.replace(/_/g, " ")}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm text-gray-400 hover:text-white transition-colors"
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
