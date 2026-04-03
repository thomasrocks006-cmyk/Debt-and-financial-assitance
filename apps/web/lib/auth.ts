import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth.js configuration for RecoveryOS.
 *
 * Uses a credentials provider against a demo user store.
 * In production this should validate against the database with hashed passwords.
 */

interface RecoveryOSUser {
  id: string;
  email: string;
  name: string;
  role: "CLIENT" | "CASE_MANAGER" | "ADVOCACY_SPECIALIST" | "COMPLIANCE_OFFICER" | "ADMIN";
}

// Demo user store — replace with database lookup in production
const DEMO_USERS: Array<RecoveryOSUser & { password: string }> = [
  {
    id: "usr_admin",
    email: "admin@recoveryos.com.au",
    name: "Admin User",
    role: "ADMIN",
    password: "admin123",
  },
  {
    id: "usr_cm",
    email: "case.manager@recoveryos.com.au",
    name: "Jane Smith",
    role: "CASE_MANAGER",
    password: "manager123",
  },
  {
    id: "usr_client",
    email: "demo.client@example.com",
    name: "Alex Demo",
    role: "CLIENT",
    password: "client123",
  },
];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "RecoveryOS",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = DEMO_USERS.find(
          (u) =>
            u.email.toLowerCase() === credentials.email.toLowerCase() &&
            u.password === credentials.password,
        );

        if (!user) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.role = (user as RecoveryOSUser).role;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        (session.user as RecoveryOSUser).role = token.role as RecoveryOSUser["role"];
        (session.user as RecoveryOSUser).id = token.userId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET ?? "recoveryos-dev-secret-change-in-production",
};
