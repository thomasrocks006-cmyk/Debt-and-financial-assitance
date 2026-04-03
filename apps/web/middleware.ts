import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Route-protection middleware for RecoveryOS.
 *
 * - Public routes: /, /login, /register, /crisis, /api/auth
 * - Client routes: /dashboard, /debts, /budget, /plan, /onboarding  (require CLIENT or above)
 * - Admin routes: /pipeline, /triage, /advocacy, /referrals, /compliance, /cases (require staff role)
 */

const PUBLIC_PATHS = ["/", "/login", "/register", "/crisis"];

const ADMIN_PREFIXES = [
  "/pipeline",
  "/triage",
  "/advocacy",
  "/referrals",
  "/compliance",
  "/cases",
];

const ADMIN_ROLES = new Set([
  "ADMIN",
  "CASE_MANAGER",
  "ADVOCACY_SPECIALIST",
  "COMPLIANCE_OFFICER",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths, API routes, and static assets
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? "recoveryos-dev-secret-change-in-production",
  });

  // Not authenticated → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes require staff role
  const isAdminRoute = ADMIN_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isAdminRoute && !ADMIN_ROLES.has(token.role as string)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
