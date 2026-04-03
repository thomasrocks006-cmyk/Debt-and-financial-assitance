# RecoveryOS v3 — Comprehensive Build & Integration Document

> **Purpose:** This document defines every planned improvement and feature tier for RecoveryOS v3. Each entry describes what is being built, exactly where it fits in the codebase, and the step-by-step integration approach to avoid regression or breakage of existing functionality.
>
> **Based on:** Full repository scan of all 80+ source files, 7 business-logic engines, 25+ Prisma models, 7 API routes, 15 pages (client + admin), and 62 Vitest unit tests.

---

## Table of Contents

1. [Tier 1 – API-to-Database Integration (Mock → Real Data)](#tier-1)
2. [Tier 2 – Real Authentication with Hashed Passwords](#tier-2)
3. [Tier 3 – Onboarding Form → Database Persistence](#tier-3)
4. [Tier 4 – Dashboard Live Data Wiring](#tier-4)
5. [Tier 5 – Advocacy Admin Page (Full Build)](#tier-5)
6. [Tier 6 – Referrals Admin Page (Full Build)](#tier-6)
7. [Tier 7 – Hardship Letter PDF Generation](#tier-7)
8. [Tier 8 – Email & SMS Notification System](#tier-8)
9. [Tier 9 – Document Upload & Storage](#tier-9)
10. [Tier 10 – BullMQ Background Job Workers](#tier-10)
11. [Tier 11 – Playwright End-to-End Test Suite](#tier-11)
12. [Tier 12 – Compliance Remediation Workflow](#tier-12)
13. [Tier 13 – Audit Log Viewer](#tier-13)
14. [Tier 14 – Payment Processing (Stripe)](#tier-14)
15. [Tier 15 – Creditor Response Tracking Workflow](#tier-15)
16. [Tier 16 – Advanced Search & Filter UI](#tier-16)
17. [Tier 17 – Bulk Case Management Actions](#tier-17)
18. [Tier 18 – Adaptive Engine → Live Trigger Processing](#tier-18)
19. [Tier 19 – Recovery Score Widget (Real-time)](#tier-19)
20. [Tier 20 – Case Analytics Dashboard](#tier-20)
21. [Tier 21 – Referral Tracking & Feedback Loop](#tier-21)
22. [Tier 22 – Budget Trend Visualisation](#tier-22)
23. [Tier 23 – Negotiation Module (Case Manager UX)](#tier-23)
24. [Tier 24 – Client Mobile-Responsive Redesign](#tier-24)
25. [Tier 25 – Multilingual Support (i18n)](#tier-25)

---

## Global Conventions

| Convention | Value |
|---|---|
| **Monorepo tool** | pnpm workspaces + Turborepo |
| **Frontend framework** | Next.js 15 (App Router) |
| **Database ORM** | Prisma + PostgreSQL 16 |
| **Auth** | NextAuth.js v4 (JWT, Credentials provider) |
| **Business logic** | `packages/engines/` — 7 engines, all independently tested |
| **Shared types/constants** | `packages/shared/` |
| **Tests** | Vitest (`pnpm vitest run` from `packages/engines/`) |
| **API style** | Next.js Route Handlers (`NextRequest`/`NextResponse`) |
| **Styling** | Tailwind CSS with brand colour tokens |
| **Role hierarchy** | CLIENT < CASE_MANAGER < ADVOCACY_SPECIALIST < COMPLIANCE_OFFICER < ADMIN |

**Before every Tier build:**
1. Pull latest from `main`.
2. Create a feature branch: `feat/tier-N-short-description`.
3. Run `pnpm vitest run` from `packages/engines/` — all 62 tests should pass.
4. Run `pnpm lint` from root — zero errors.
5. After completing the Tier, run the same checks again before opening a PR.

---

<a name="tier-1"></a>
## Tier 1 — API-to-Database Integration (Mock → Real Data)

### What is being built
All six Next.js API route handlers currently return hardcoded mock JSON arrays. This Tier replaces every mock payload with genuine Prisma queries, wiring the existing route contracts to the PostgreSQL database via the `@recoveryos/database` package.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/api/debts/route.ts` | Returns hardcoded debt array | Replace with `prisma.debtAccount.findMany({ where: { case: { client: ... } } })` |
| `apps/web/app/api/budget/route.ts` | Returns hardcoded income/expense arrays | Replace with `prisma.incomeSource.findMany` + `prisma.expenseItem.findMany` |
| `apps/web/app/api/plans/route.ts` | Returns hardcoded plan options | Fetch `PaymentPlan` + run `buildPlans()` engine if no plan exists |
| `apps/web/app/api/cases/route.ts` | Returns 6 hardcoded cases | Replace with `prisma.case.findMany({ include: { client: true, … } })` |
| `apps/web/app/api/triage/route.ts` | Calls `runTriage()` but writes nothing | Persist result to `prisma.triageAssessment.create` |
| `apps/web/app/api/compliance/route.ts` | Returns hardcoded compliance table | Replace with `prisma.case.findMany` + run `checkCompliance()` engine per case |
| `apps/web/lib/prisma.ts` | Does not exist | Create singleton Prisma client (see below) |

### Integration approach — no regression

1. **Create `apps/web/lib/prisma.ts`**
   ```ts
   import { PrismaClient } from '@recoveryos/database'
   const globalForPrisma = global as unknown as { prisma: PrismaClient }
   export const prisma = globalForPrisma.prisma ?? new PrismaClient()
   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```
   This is the standard Next.js singleton pattern — no hot-reload client proliferation.

2. **Replace each route file one at a time.** The JSON shape must remain identical to the existing mock so every client page continues to function without modification. Only the data source changes.

3. **Add `@recoveryos/database` to `apps/web/package.json` dependencies** if not already present (it is a workspace package: `"@recoveryos/database": "workspace:*"`).

4. **Guard with session check.** Every route that returns user-specific data should validate `getServerSession()` from `apps/web/lib/auth.ts` before querying. The existing mock routes already import but do not enforce the session — this Tier enforces it.

5. **Error handling wrapper:** Wrap all Prisma calls in `try/catch` and return `NextResponse.json({ error: '…' }, { status: 500 })` on failure. Do not expose Prisma error messages to the client.

### Testing strategy
- Run the engine unit tests (unchanged) to confirm no imports were broken.
- Manually test each endpoint with `curl` or the browser after seeding (`pnpm db:seed`).
- For automated regression, the existing Vitest suite covers engine purity; integration tests are added in **Tier 11**.

### Dependencies
- `packages/database` must have a running PostgreSQL instance (see `.devcontainer/docker-compose.yml`).
- `pnpm db:push` and `pnpm db:seed` must have been run before testing.

---

<a name="tier-2"></a>
## Tier 2 — Real Authentication with Hashed Passwords

### What is being built
`apps/web/lib/auth.ts` contains a hardcoded in-memory array of demo users. This Tier replaces it with a proper database-backed credential lookup using `bcryptjs` for password comparison.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/lib/auth.ts` | `DEMO_USERS` array, plain-text password comparison | Query `prisma.user.findUnique({ where: { email } })` + `bcrypt.compare(password, user.passwordHash)` |
| `packages/database/prisma/schema.prisma` | `User.passwordHash String` field exists | No schema change needed |
| `packages/database/prisma/seed.ts` | Creates demo users — check if passwords are hashed | Hash passwords with `bcrypt.hash('…', 12)` in seeder if not already |
| `apps/web/package.json` | No bcrypt dependency | Add `"bcryptjs": "^2.4.3"` and `"@types/bcryptjs": "^2.4.6"` |

### Integration approach — no regression

1. **Add `bcrypt`** to `apps/web/package.json`. Use the native `bcrypt` package (C++ bindings) rather than the pure-JavaScript `bcryptjs` for production-grade performance — at scale, hashing latency matters.
   ```
   pnpm add bcrypt @types/bcrypt --filter @recoveryos/web
   ```
   > **Note:** `bcryptjs` is acceptable for local development if native compilation is unavailable, but native `bcrypt` must be used in production.

2. **Update `auth.ts` `authorize()` callback:**
   ```ts
   import bcrypt from 'bcrypt'
   ```

   authorize: async (credentials) => {
     if (!credentials?.email || !credentials?.password) return null
     const user = await prisma.user.findUnique({ where: { email: credentials.email } })
     if (!user) return null
     const valid = await bcrypt.compare(credentials.password, user.passwordHash)
     if (!valid) return null
     return { id: user.id, email: user.email, name: user.name, role: user.role }
   }
   ```

3. **Update `seed.ts`** to hash all demo passwords before inserting:
   ```ts
   import bcrypt from 'bcrypt'
   const hash = await bcrypt.hash('admin123', 12)
   await prisma.user.upsert({ where: { email: 'admin@recoveryos.com.au' }, update: {}, create: { …, passwordHash: hash } })
   ```
   > ⚠️ **Development only:** The password `admin123` in the seed script is intentionally weak and used **only for local development**. Production deployments must force a password change on first login for all seeded admin accounts and must never use this seed in a production database.

4. **JWT and session callbacks** in `auth.ts` are already correct — they just read `token.role` from the user object; no change needed there.

5. **Existing middleware.ts** is unchanged — it reads the session cookie which NextAuth still issues identically.

### Testing strategy
- Log in as each demo user in the browser (`/login`) and confirm redirect to correct destination.
- Confirm that a wrong password returns to `/login` with error (existing NextAuth error handling).
- No engine tests are affected.

### Dependencies
- Tier 1 must be complete (prisma singleton must exist).
- DB must be seeded with hashed passwords.

---

<a name="tier-3"></a>
## Tier 3 — Onboarding Form → Database Persistence

### What is being built
`apps/web/app/(client)/onboarding/page.tsx` is a 5-step form (28 KB) that collects contact info, income, expenses, debts, and submits. Currently no API route processes this submission. This Tier adds a `POST /api/onboarding` route that orchestrates all engines and persists every entity.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(client)/onboarding/page.tsx` | Has `handleSubmit` with a TODO comment | Point `fetch` call to `/api/onboarding` |
| `apps/web/app/api/onboarding/route.ts` | Does not exist | Create this file |
| `packages/engines/src/triage/index.ts` | `runTriage(input)` — exported, tested | Call from new route |
| `packages/engines/src/affordability/index.ts` | `calculateAffordability(input)` | Call from new route |
| `packages/engines/src/plan-builder/index.ts` | `buildPlans(input)` | Call from new route |
| `packages/engines/src/compliance/index.ts` | `checkCompliance(input)` | Call after case created |

### Integration approach — no regression

1. **Create `apps/web/app/api/onboarding/route.ts`** with a single `POST` handler:

   ```
   POST /api/onboarding
   Body: { contact, income: [], expenses: [], debts: [], hardshipFlags: [] }
   ```

   Orchestration sequence (all wrapped in a Prisma transaction):
   ```
   a. getServerSession() → assert authenticated user
   b. prisma.clientProfile.upsert(contact data)
   c. runTriage(hardshipFlags) → TriageResult
   d. prisma.triageAssessment.create(triageResult)
   e. prisma.case.create({ status: TRIAGE, crisisLevel })
   f. prisma.incomeSource.createMany(income)
   g. prisma.expenseItem.createMany(expenses)
   h. prisma.debtAccount.createMany(debts)
   i. calculateAffordability(income, expenses, debts) → AffordabilityResult
   j. prisma.budgetSnapshot.create(affordabilityResult)
   k. buildPlans(affordabilityResult, debts) → PlanOption[]
   l. prisma.paymentPlan.create(recommendedPlan) // balanced plan auto-saved
   m. checkCompliance({ case, consents: [] }) → log any blocking issues
   n. Return { caseId, crisisLevel, triage, plans, redirectTo: '/dashboard' }
   ```

2. **All operations run inside `prisma.$transaction([…])`** so a partial failure rolls back completely.

3. **Onboarding page** simply POSTs and `router.push(data.redirectTo)` on success. No structural changes to the form UI.

4. **Existing API routes** (`/api/debts`, `/api/budget`, `/api/plans`) are untouched — they will automatically return correct data from the DB after onboarding populates it (once Tier 1 is done).

### Testing strategy
- Fill out the onboarding form in the browser as the demo client user.
- After submission, navigate to `/dashboard` and confirm all 4 metric cards show real data.
- Confirm in the DB: `SELECT * FROM "Case"`, `SELECT * FROM "DebtAccount"`.

### Dependencies
- Tier 1 (Prisma singleton) and Tier 2 (real auth, so `getServerSession()` returns a real userId).

---

<a name="tier-4"></a>
## Tier 4 — Dashboard Live Data Wiring

### What is being built
`apps/web/app/(client)/dashboard/page.tsx` shows a Recovery Score, 4 metric cards, task list, and activity feed — all currently hardcoded. This Tier converts all static values to live API fetches.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(client)/dashboard/page.tsx` | Hardcoded values | Replace with `fetch()` calls to API routes |
| `apps/web/app/api/dashboard/route.ts` | Does not exist | Create a single aggregation endpoint |
| `packages/engines/src/adaptive/index.ts` | `calculateRecoveryScore(input)` + `detectTriggers(input)` | Call from new dashboard route |

### Integration approach — no regression

1. **Create `apps/web/app/api/dashboard/route.ts`** `GET` handler:
   - Accepts authenticated session.
   - Queries: `Case`, `DebtAccount`, `PaymentPlan`, `Task`, `LedgerEntry` (recent 10), `TriageAssessment`.
   - Calls `calculateRecoveryScore(caseData)` from adaptive engine.
   - Returns: `{ recoveryScore, stage, totalDebt, monthlyPayment, nextMilestone, crisisLevel, tasks, activityFeed }`.

2. **Dashboard page** uses `useEffect` + `fetch('/api/dashboard')` (or Next.js `fetch` in Server Component) to populate state.

3. **StatCard, CrisisBadge components** already accept dynamic props — no component changes needed.

4. **Existing component files** (`StatCard.tsx`, `CrisisBadge.tsx`, `AlertBanner.tsx`) are unchanged.

### Testing strategy
- Login as demo client, visit `/dashboard`, verify metric cards show real DB values.
- Open DevTools Network tab — confirm `GET /api/dashboard` returns 200 with expected payload.

### Dependencies
- Tier 1 (Prisma singleton), Tier 3 (case exists in DB after onboarding).

---

<a name="tier-5"></a>
## Tier 5 — Advocacy Admin Page (Full Build)

### What is being built
`apps/web/app/(admin)/advocacy/page.tsx` exists but has minimal content. This Tier builds the full advocacy management interface: negotiation case list, creditor playbook access, hardship letter drafting, and correspondence tracking.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(admin)/advocacy/page.tsx` | Stub with minimal content | Full rebuild of page content |
| `apps/web/app/api/advocacy/route.ts` | Does not exist | Create GET (list) + POST (create action) |
| `packages/engines/src/advocacy/index.ts` | `generateHardshipLetter()`, `getCreditorPlaybook()`, `recommendLetterType()` — fully implemented | Import and call from new route |
| `apps/web/components/ui/` | 3 components | No change; add `LetterPreviewModal.tsx` if needed |

### Integration approach — no regression

1. **Create `apps/web/app/api/advocacy/route.ts`**:
   - `GET`: Returns all `Negotiation` records joined with `DebtAccount.creditorName`, `AdvocacyAction` history, pending letter status.
   - `POST`: Accepts `{ caseId, debtId, letterType, context }` → calls `generateHardshipLetter(letterType, context)` → stores in `prisma.advocacyAction.create`.

2. **Advocacy page sections:**
   - **Active Negotiations table** — columns: Client, Creditor, Debt Balance, Letter Type, Status, Last Action, Days Open.
   - **Creditor Playbook panel** — click creditor → shows hardship process steps, contact details, escalation path (from `getCreditorPlaybook()`).
   - **Generate Letter panel** — dropdown (letter type), text preview of generated letter, "Copy to clipboard" + "Download .txt" buttons.
   - **Correspondence timeline** — per-negotiation feed of `AdvocacyAction` records.

3. **No engine changes** — advocacy engine is fully implemented and tested. The page only calls the API route which calls the engine.

4. **Role guard:** Page is already in the `(admin)` group and protected by middleware. No middleware changes needed.

### Testing strategy
- Login as `case.manager@recoveryos.com.au`.
- Navigate to `/advocacy`.
- Click a creditor → confirm playbook content renders correctly.
- Click "Generate Letter" → confirm letter text appears.
- Confirm letter text matches what `generateHardshipLetter()` engine produces (compare with unit test fixtures).

### Dependencies
- Tier 1 (Prisma — for negotiations data).
- Engine tests for advocacy already pass; no new engine tests needed.

---

<a name="tier-6"></a>
## Tier 6 — Referrals Admin Page (Full Build)

### What is being built
`apps/web/app/(admin)/referrals/page.tsx` is a stub. This Tier builds: referral cases table, community resource directory (filterable by state and service stream), and referral status management.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(admin)/referrals/page.tsx` | Stub | Full rebuild |
| `apps/web/app/api/referrals/route.ts` | Does not exist | Create GET + POST routes |
| `packages/engines/src/referral/index.ts` | `getRecommendedReferrals()` — fully implemented, 30+ resources | Import in new route |

### Integration approach — no regression

1. **Create `apps/web/app/api/referrals/route.ts`**:
   - `GET /api/referrals?caseId=…&serviceStream=…&state=…`: Returns `Referral` records from DB + calls `getRecommendedReferrals(serviceStreams, state)` engine to suggest new ones.
   - `POST /api/referrals`: Creates a `Referral` record in DB (status: PENDING).
   - `PATCH /api/referrals/[id]`: Updates referral status (SENT, ACCEPTED, IN_PROGRESS, COMPLETED, DECLINED).

2. **Referrals page sections:**
   - **Active Referrals table** — Client, Service Stream, Organisation, Status, Created, Last Updated, Outcome.
   - **Resource Directory** — filterable card grid by state (NSW/VIC/QLD/SA/WA) and service stream. Each card shows: org name, phone, URL, service description, emergency flag badge.
   - **"Refer Client" modal** — pick case, pick resource from directory, add notes → POST to API.

3. **No engine changes** — referral engine is complete and tested.

4. **State filter** uses `packages/shared/src/constants/` data; no new constants needed.

### Testing strategy
- Navigate to `/referrals` as admin.
- Filter directory by "VIC" + "FAMILY_VIOLENCE" — confirm matching resources appear.
- Create a referral → confirm it appears in the Active Referrals table.

### Dependencies
- Tier 1 (Prisma for Referral records), Tier 3 (cases exist in DB).

---

<a name="tier-7"></a>
## Tier 7 — Hardship Letter PDF Generation

### What is being built
`packages/engines/src/advocacy/index.ts` already generates hardship letter text. This Tier adds PDF export using `@react-pdf/renderer` so case managers and clients can download professional letters with branding.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `packages/engines/src/advocacy/index.ts` | Returns letter as plain string | Add optional `format: 'text' | 'pdf-data'` parameter |
| `apps/web/app/api/advocacy/letter/route.ts` | Does not exist | Create route that streams PDF bytes |
| `apps/web/components/ui/` | 3 components | Add `HardshipLetterPDF.tsx` (React PDF template) |
| `apps/web/package.json` | No PDF dependency | Add `@react-pdf/renderer` |

### Integration approach — no regression

1. **Add dependency** (run the advisory security check before adding — see `gh-advisory-database` tool):
   ```
   pnpm add @react-pdf/renderer --filter @recoveryos/web
   ```
   > **Security note:** `@react-pdf/renderer` processes potentially sensitive financial data (hardship letters, client details). Vet it against the GitHub Advisory Database before adding to production and run `pnpm audit` after installation.

2. **Create `apps/web/components/ui/HardshipLetterPDF.tsx`** — a React PDF document component:
   ```tsx
   import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
   // Renders the letter with: logo, date, creditor address, body paragraphs, signature block
   ```

3. **Create `apps/web/app/api/advocacy/letter/route.ts`** `GET` handler:
   ```ts
   // Query params: caseId, debtId, letterType
   // 1. Fetch case + debt from DB
   // 2. Call generateHardshipLetter(letterType, context) → text
   // 3. Render <HardshipLetterPDF text={…} /> with ReactPDF.renderToStream()
   // 4. Return stream as application/pdf response
   ```

4. **Advocacy page** adds a "Download PDF" button that calls `GET /api/advocacy/letter?caseId=…&letterType=…` with `response.blob()` → `URL.createObjectURL` download pattern.

5. **Engine is not modified** — only a new parameter (`format`) is added with a default that preserves existing behaviour.

### Testing strategy
- In the browser, click "Download PDF" on the advocacy page.
- Confirm a well-formatted PDF downloads with correct letter content, date, and creditor address.
- Run engine unit tests to confirm existing text generation is unchanged.

### Dependencies
- Tier 5 (advocacy page must exist), Tier 1 (DB data for letter context).

---

<a name="tier-8"></a>
## Tier 8 — Email & SMS Notification System

### What is being built
No notification system exists. This Tier adds a notification service using SendGrid (email) and Twilio (SMS) triggered by key case lifecycle events: new case created, plan activated, payment reminder, hardship letter sent, crisis escalation.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `packages/engines/` | No notification concerns | No change — engines remain pure |
| `apps/web/lib/notifications.ts` | Does not exist | Create notification dispatcher |
| `apps/web/app/api/onboarding/route.ts` | (Tier 3) Creates case | Add `sendWelcomeEmail(user)` call after case creation |
| `apps/web/app/api/plans/route.ts` | Plan selection endpoint | Add `sendPlanActivatedEmail(user, plan)` after plan selected |
| `apps/web/app/api/triage/route.ts` | Triage assessment | Add `sendCrisisAlert(caseManager, client)` if CRITICAL/HIGH |
| `.env.example` | Has DATABASE_URL, NEXTAUTH_SECRET | Add SENDGRID_API_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER |

### Integration approach — no regression

1. **Add dependencies:**
   ```
   pnpm add @sendgrid/mail twilio --filter @recoveryos/web
   ```

2. **Create `apps/web/lib/notifications.ts`** with typed notification functions:
   ```ts
   export async function sendWelcomeEmail(to: string, name: string): Promise<void>
   export async function sendPlanActivatedEmail(to: string, plan: PaymentPlan): Promise<void>
   export async function sendPaymentReminderSMS(to: string, amount: number, date: string): Promise<void>
   export async function sendCrisisAlertEmail(staffEmail: string, client: ClientProfile): Promise<void>
   ```
   Each function checks for missing env vars and logs a warning (not throws) in development — this ensures the app continues to work without credentials configured.

3. **All notification calls are fire-and-forget** (`void sendX(…)`) inside API routes — they do not block the response or cause failures if the email service is down.

4. **No changes to engines, pages, or middleware.**

### Testing strategy
- Set `SENDGRID_API_KEY=test` in `.env.local` and confirm no crash on startup.
- In a test environment, mock `@sendgrid/mail` with `vi.mock` and verify the notification function is called with the right arguments after plan activation.

### Dependencies
- Tier 3 (onboarding creates case), Tier 1 (plan selection writes to DB).

---

<a name="tier-9"></a>
## Tier 9 — Document Upload & Storage

### What is being built
The `Document` Prisma model exists but no upload UI or API endpoint does. This Tier adds document upload for consent forms, affordability evidence, and hardship letters using presigned S3 URLs (or local file system in dev).

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `packages/database/prisma/schema.prisma` | `Document` model: id, caseId, type, url, filename, mimeType, uploadedAt | No schema change |
| `apps/web/app/api/documents/route.ts` | Does not exist | Create POST (upload), GET (list) |
| `apps/web/app/(client)/dashboard/page.tsx` | No document section | Add "Documents" card with upload button |
| `apps/web/app/(admin)/cases/[id]/page.tsx` | Documents tab placeholder | Wire to new API |
| `apps/web/lib/storage.ts` | Does not exist | Create storage adapter (local in dev, S3 in prod) |
| `.env.example` | — | Add AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, AWS_REGION (local dev only; use IAM roles in production) |

### Integration approach — no regression

1. **Create `apps/web/lib/storage.ts`** — storage adapter pattern:
   ```ts
   export async function uploadFile(file: Buffer, filename: string, mimeType: string): Promise<string>
   // In dev (no S3 env vars): writes to /tmp/recoveryos-uploads/ and returns a local path
   // In prod (S3 env vars set): uploads to S3, returns public URL
   ```
   > **Production deployment:** Use IAM roles (e.g., EC2 instance profile or ECS task role) rather than long-lived `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` credentials. The env vars are provided only for local development convenience.

2. **Create `apps/web/app/api/documents/route.ts`**:
   - `POST /api/documents` — accepts `multipart/form-data`.
   - **Multi-layer validation before storing:**
     1. Check file extension allowlist (`.pdf`, `.jpg`, `.jpeg`, `.png`).
     2. Verify `Content-Type` header is in `['application/pdf', 'image/jpeg', 'image/png']`.
     3. Read the first 4 bytes of the buffer and verify magic bytes match the declared MIME type (PDF: `%PDF`, JPEG: `FF D8 FF`, PNG: `89 50 4E 47`).
     4. Enforce 10 MB limit at the server (in addition to any client-side limit).
     5. Sanitise the filename (strip path separators, whitespace, control characters).
   - On passing validation, calls `uploadFile()`, then `prisma.document.create()`.
   - `GET /api/documents?caseId=…` — returns document list for a case.

3. **Add file upload UI** to the case detail page `(admin)/cases/[id]/page.tsx` under the existing Documents tab — a simple `<input type="file">` wrapped in a form.

4. **No engine changes** — engines do not handle file I/O.

### Testing strategy
- Upload a PDF as admin on a case detail page.
- Confirm document appears in the Documents tab with filename and upload timestamp.
- In dev, confirm the file is written to `/tmp/recoveryos-uploads/`.

### Dependencies
- Tier 1 (Prisma singleton for `document.create`).

---

<a name="tier-10"></a>
## Tier 10 — BullMQ Background Job Workers

### What is being built
Redis (BullMQ) is stubbed in the dev container but no workers exist. This Tier implements a job queue for async tasks: plan recalculation, nightly compliance sweeps, payment reminder scheduling, and creditor follow-up reminders.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `.devcontainer/docker-compose.yml` | Redis 7 service defined | No change |
| `.env.example` | Has REDIS_URL | No change |
| `apps/web/workers/` | Does not exist | Create this directory and workers |
| `apps/web/workers/queues.ts` | Does not exist | Define BullMQ queue instances |
| `apps/web/workers/plan-recalculation.ts` | Does not exist | Worker: on income-change trigger, recalculate affordability + plans |
| `apps/web/workers/compliance-sweep.ts` | Does not exist | Worker: nightly job checks all open cases for compliance issues |
| `apps/web/workers/payment-reminder.ts` | Does not exist | Worker: scheduled job sends payment reminders 3 days before due date |
| `apps/web/app/api/jobs/route.ts` | Does not exist | POST endpoint to enqueue jobs from API routes |

### Integration approach — no regression

1. **Add BullMQ dependency:**
   ```
   pnpm add bullmq ioredis --filter @recoveryos/web
   ```

2. **Create `apps/web/workers/queues.ts`** — queue singletons:
   ```ts
   import { Queue } from 'bullmq'
   export const planRecalcQueue = new Queue('plan-recalculation', { connection: redisConnection })
   export const complianceSweepQueue = new Queue('compliance-sweep', { connection: redisConnection })
   export const paymentReminderQueue = new Queue('payment-reminder', { connection: redisConnection })
   ```

3. **Each worker file** imports the `packages/engines` functions directly — engines are pure TypeScript functions with no I/O so they run fine in worker threads.

4. **Workers are started by a separate process** (`node apps/web/workers/start.ts`) not by Next.js. Add a `"workers:dev"` script to `apps/web/package.json`.

5. **Existing API routes** enqueue jobs rather than doing expensive synchronous work:
   - Triage route: after detecting HIGH/CRITICAL → `planRecalcQueue.add(…)`
   - Adaptive engine trigger: `complianceSweepQueue.add(…)`

6. **No engine changes** — workers call the same engine functions.

### Testing strategy
- Run `pnpm workers:dev` in one terminal.
- Trigger a triage assessment via `/api/triage`.
- Confirm job appears in BullMQ dashboard (or check Redis `KEYS *`).
- Confirm worker picks it up and the DB record is updated.

### Dependencies
- Tier 1 (Prisma in workers), Redis running from devcontainer.

---

<a name="tier-11"></a>
## Tier 11 — Playwright End-to-End Test Suite

### What is being built
`apps/web/playwright.config.ts` exists but no test files do. This Tier creates a comprehensive E2E suite covering the full user journey: landing → triage → onboarding → dashboard → debt management → plan selection → admin pipeline.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/playwright.config.ts` | Config exists (no tests) | Add `testDir: './e2e'` if not already set |
| `apps/web/e2e/` | Does not exist | Create this directory |
| `apps/web/e2e/auth.spec.ts` | Does not exist | Login/logout flow |
| `apps/web/e2e/onboarding.spec.ts` | Does not exist | Full 5-step onboarding |
| `apps/web/e2e/dashboard.spec.ts` | Does not exist | Dashboard data assertions |
| `apps/web/e2e/admin-pipeline.spec.ts` | Does not exist | Admin case management |
| `apps/web/e2e/compliance.spec.ts` | Does not exist | Compliance page checks |

### Integration approach — no regression

1. **Add Playwright dependency** (likely already in `apps/web/package.json` given the config exists):
   ```
   pnpm add -D @playwright/test --filter @recoveryos/web
   pnpm exec playwright install chromium
   ```

2. **Create `apps/web/e2e/helpers/auth.ts`** — shared login helper:
   ```ts
   export async function loginAsClient(page: Page) {
     await page.goto('/login')
     await page.fill('[name=email]', 'demo.client@example.com')
     await page.fill('[name=password]', 'client123')
     await page.click('button[type=submit]')
     await page.waitForURL('/dashboard')
   }
   ```

3. **Each spec follows the pattern:** setup → navigate → assert. No shared state between tests (each test logs in fresh).

4. **Existing tests** (`packages/engines/__tests__/`) are Vitest unit tests and are completely unaffected.

5. **Add `"test:e2e"` script** to `apps/web/package.json`: `"playwright test"`.

### Testing strategy
E2E tests ARE the testing strategy for this Tier. All tests must pass with `pnpm test:e2e` after Tiers 1–4 are done (live DB required).

### Dependencies
- All of Tiers 1–4 (live data must exist); Tier 11 is an integration-only Tier.

---

<a name="tier-12"></a>
## Tier 12 — Compliance Remediation Workflow

### What is being built
`apps/web/app/(admin)/compliance/page.tsx` shows compliance issues but has no action buttons. This Tier adds a remediation workflow: case managers can resolve blocking issues directly from the compliance page (e.g., upload consent form, mark fee disclosure as sent).

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(admin)/compliance/page.tsx` | Shows issues, no actions | Add "Fix" action buttons per issue type |
| `apps/web/app/api/compliance/[caseId]/route.ts` | Does not exist | Create PATCH endpoint to mark items resolved |
| `packages/engines/src/compliance/index.ts` | `checkCompliance()` — pure function | No change needed |
| `packages/database/prisma/schema.prisma` | `ConsentRecord`, `DisclosureRecord` models exist | No schema change |

### Integration approach — no regression

1. **Create `PATCH /api/compliance/[caseId]`** handler:
   - Body: `{ action: 'record_consent' | 'record_disclosure' | 'upload_affordability', metadata: {} }`
   - Each action creates the appropriate Prisma record (`ConsentRecord`, `DisclosureRecord`, etc.).
   - After the record is created, re-runs `checkCompliance()` and returns updated status.

2. **Compliance page** adds an inline "Resolve" button next to each blocking issue. Clicking opens a mini-form:
   - `MISSING_CONSENT` → "Record consent now" (records date + method).
   - `MISSING_FEE_DISCLOSURE` → "Mark as sent" (records sent date + document).
   - `MISSING_AFFORDABILITY` → "Go to budget assessment" link to `/budget`.

3. **After remediation**, the page re-fetches `GET /api/compliance` and the issue disappears from the list.

4. **Compliance engine is not modified** — it remains a pure function called from both the GET and PATCH routes.

### Testing strategy
- Navigate to `/compliance`, find a non-compliant case.
- Click "Resolve" on the consent issue → confirm the ConsentRecord is created in DB.
- Reload the page → confirm the case now shows as compliant.

### Dependencies
- Tier 1 (Prisma writes), Tier 3 (cases in DB).

---

<a name="tier-13"></a>
## Tier 13 — Audit Log Viewer

### What is being built
The `AuditEvent` Prisma model is defined and captures entity changes. This Tier adds an admin-only audit log viewer where admins can search and filter all audit events by entity type, user, date range, and action type.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(admin)/audit/page.tsx` | Does not exist | Create new admin page |
| `apps/web/app/api/audit/route.ts` | Does not exist | Create GET endpoint with filters |
| `apps/web/middleware.ts` | Admin routes defined | Add `/audit` to admin paths |
| `apps/web/app/(admin)/layout.tsx` | Admin sidebar nav | Add "Audit Log" nav item |

### Integration approach — no regression

1. **Create `apps/web/app/api/audit/route.ts`** `GET` handler:
   ```
   Query params: entityType, userId, action, fromDate, toDate, page, limit
   Returns: { events: AuditEvent[], total, page }
   ```

2. **Create `apps/web/app/(admin)/audit/page.tsx`**:
   - Filter bar: entity type dropdown, date range picker, user search.
   - Table: Timestamp, User, Action, Entity Type, Entity ID, Changes (JSON diff), IP Address.
   - Export to CSV button.

3. **Add `AuditEvent` writes** in all API routes that modify data (Tiers 1–7). Each write adds to `AuditEvent` after the primary Prisma operation succeeds.

4. **Route protection:** Add `/audit` to the admin-only paths in `apps/web/middleware.ts`:
   ```ts
   const ADMIN_PATHS = ['/pipeline', '/triage', '/advocacy', '/referrals', '/compliance', '/cases', '/audit']
   ```

5. **No engine changes** — audit is a data-layer concern.

### Testing strategy
- Log in as admin, navigate to `/audit`.
- Update a case status (any admin action) and confirm a new AuditEvent row appears.
- Filter by entity type "Case" and confirm only case events show.

### Dependencies
- Tier 1 (Prisma for AuditEvent records).

---

<a name="tier-14"></a>
## Tier 14 — Payment Processing (Stripe)

### What is being built
No payment gateway exists. This Tier adds Stripe integration for collecting plan payments from clients. Payments are scheduled according to the active `PaymentPlan`, recorded in the `LedgerEntry` model, and clients can update their card details from the plan page.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/api/payments/route.ts` | Does not exist | Create POST (initiate payment), GET (payment history) |
| `apps/web/app/api/payments/webhook/route.ts` | Does not exist | Create Stripe webhook handler |
| `apps/web/app/(client)/plan/page.tsx` | Shows plan details | Add "Set up automatic payments" button |
| `packages/database/prisma/schema.prisma` | `LedgerEntry` model exists | Add `stripePaymentIntentId String?` to `LedgerEntry` |
| `apps/web/lib/stripe.ts` | Does not exist | Stripe client singleton |
| `.env.example` | — | Add STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET |

### Integration approach — no regression

1. **Add Stripe SDK:**
   ```
   pnpm add stripe @stripe/stripe-js --filter @recoveryos/web
   ```

2. **Create `apps/web/lib/stripe.ts`** — Stripe singleton (same pattern as Prisma singleton).

3. **`POST /api/payments`** — creates a Stripe PaymentIntent for the plan's monthly amount.

4. **`POST /api/payments/webhook`** — handles `payment_intent.succeeded` and `payment_intent.payment_failed` events:
   - **Signature verification is mandatory** — every webhook request must be verified using `stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)` before any processing. Reject requests without a valid signature with HTTP 400. This prevents spoofed webhook attacks.
   - On verified success: `prisma.ledgerEntry.create({ type: CREDIT, … })`.
   - On verified failure: `prisma.ledgerEntry.create({ type: FAILED_DEBIT, … })` + enqueue adaptive trigger.

5. **Client plan page** adds a `<PaymentSetup />` component (Stripe Elements) shown when no active payment method is on file.

6. **No engine changes** — `LedgerEntry` records feed into the adaptive engine trigger detection (missed payments), which already handles this via the `missed_payment` trigger type.

### Testing strategy
- Use Stripe test card `4242 4242 4242 4242` in the plan page.
- Confirm a `LedgerEntry` of type CREDIT is created.
- Use card `4000 0000 0000 9995` (insufficient funds) and confirm `FAILED_DEBIT` is created.

### Dependencies
- Tier 1 (Prisma singleton), Tier 3 (active plan exists in DB).

---

<a name="tier-15"></a>
## Tier 15 — Creditor Response Tracking Workflow

### What is being built
`Negotiation` records exist in Prisma but no UI workflow tracks hardship responses from creditors. This Tier adds a full creditor response workflow: log response (accepted/rejected/counter-offer), auto-update negotiation status, and trigger adaptive engine recommendations.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(admin)/advocacy/page.tsx` | (Tier 5 adds this) | Add "Log Response" button to negotiations table |
| `apps/web/app/api/negotiations/route.ts` | Does not exist | Create GET (list), POST (create), PATCH (log response) |
| `packages/engines/src/adaptive/index.ts` | `detectTriggers(input)` handles `creditor_response` trigger | Call from `PATCH` route after response logged |
| `packages/database/prisma/schema.prisma` | `Negotiation` model: status, terms, responseDetails | No schema change |

### Integration approach — no regression

1. **Create `apps/web/app/api/negotiations/route.ts`**:
   - `GET /api/negotiations?caseId=…` — list negotiations with debt context.
   - `POST /api/negotiations` — start a new negotiation (status: SENT).
   - `PATCH /api/negotiations/[id]` — log creditor response:
     - Body: `{ response: 'accepted' | 'rejected' | 'counter_offer', terms: {} }`
     - Updates `Negotiation.status`.
     - Calls `detectTriggers({ triggers: [{ type: 'creditor_response', response }] })` from adaptive engine.
     - If engine recommends escalation: creates a `Task` for the case manager.

2. **Advocacy page** adds a "Log Response" modal button on each negotiation row. The modal has three tabs: Accepted, Rejected, Counter-Offer (each with relevant fields).

3. **Adaptive engine recommendations** are surfaced as a notification banner on the case detail page after a response is logged.

4. **No engine modifications** — the adaptive engine already has full logic for the `creditor_response` trigger type.

### Testing strategy
- Navigate to a case with an active negotiation.
- Log a "Rejected" response.
- Confirm `Negotiation.status` is updated to REJECTED in the DB.
- Confirm the adaptive engine generates a "Contact client, consider escalation to AFCA" recommendation.

### Dependencies
- Tier 5 (advocacy page), Tier 1 (Prisma), Tier 4 (adaptive engine wired).

---

<a name="tier-16"></a>
## Tier 16 — Advanced Search & Filter UI

### What is being built
Admin tables (pipeline, triage, compliance) have no search or filter controls. This Tier adds client-side search, column sorting, status filter dropdowns, and date range filters to all admin tables, and a global case search bar in the admin nav.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(admin)/pipeline/page.tsx` | Static list | Add search input, status filter, sort |
| `apps/web/app/(admin)/triage/page.tsx` | Static list | Add crisis level filter, urgency sort |
| `apps/web/app/(admin)/compliance/page.tsx` | Static list | Add compliance status filter |
| `apps/web/app/(admin)/layout.tsx` | Nav sidebar | Add global search input |
| `apps/web/app/api/cases/route.ts` | Accepts `status` query param | Add `search`, `crisisLevel`, `fromDate`, `toDate` params |
| `apps/web/components/ui/SearchFilter.tsx` | Does not exist | Create reusable search + filter component |

### Integration approach — no regression

1. **Create `apps/web/components/ui/SearchFilter.tsx`** — accepts `filters: FilterConfig[]` and `onChange` callback. No page logic inside the component.

2. **API route updates** — add query param parsing to `GET /api/cases`:
   ```ts
   const search = url.searchParams.get('search')
   // Prisma: where: { OR: [{ client: { name: { contains: search } } }, { id: { contains: search } }] }
   ```

3. **Page updates** — each admin table page:
   - Renders `<SearchFilter />` above the table.
   - On filter change, re-fetches the API with updated query params.
   - Uses `useState` for filter values; `useEffect` triggers API call on filter change.

4. **Global search** in admin layout: a `<input>` that routes to `/pipeline?search=…` on Enter.

5. **No engine changes** — filtering is a data query concern only.

### Testing strategy
- Type a client name in the pipeline search bar.
- Confirm only matching cases appear in the table.
- Change status filter to "TRIAGE" — confirm only triage-stage cases show.

### Dependencies
- Tier 1 (real Prisma data for meaningful search results).

---

<a name="tier-17"></a>
## Tier 17 — Bulk Case Management Actions

### What is being built
Case managers need to update multiple cases at once (e.g., bulk reassign to a different case manager, bulk mark as reviewed, bulk export to CSV). This Tier adds checkbox selection to the pipeline table and a bulk action toolbar.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(admin)/pipeline/page.tsx` | No row selection | Add checkbox column, selection state, bulk toolbar |
| `apps/web/app/api/cases/bulk/route.ts` | Does not exist | Create POST endpoint for bulk operations |
| `apps/web/components/ui/BulkActionBar.tsx` | Does not exist | Create floating bulk action component |

### Integration approach — no regression

1. **Create `apps/web/app/api/cases/bulk/route.ts`** `POST` handler:
   - Body: `{ caseIds: string[], action: 'assign' | 'export' | 'mark_reviewed', metadata: {} }`
   - `assign`: `prisma.case.updateMany({ where: { id: { in: caseIds } }, data: { assignedToId } })`
   - `export`: Queries all selected cases + related data, returns a CSV-formatted response.
   - `mark_reviewed`: Sets a `reviewedAt` timestamp on each case.

2. **Pipeline page** maintains `selectedCaseIds: Set<string>` state. A "Select all" checkbox and per-row checkboxes update this state.

3. **Create `BulkActionBar.tsx`** — a fixed bottom bar that appears when `selectedCaseIds.size > 0`. Shows "N cases selected", action buttons.

4. **No engine changes.** No change to any other existing page.

### Testing strategy
- Select 3 cases in the pipeline.
- Click "Reassign" → pick a case manager → confirm all 3 cases show the new manager.
- Click "Export CSV" → confirm a CSV file downloads with all 3 cases' data.

### Dependencies
- Tier 1 (Prisma writes), Tier 16 (the pipeline table already has search/filter context).

---

<a name="tier-18"></a>
## Tier 18 — Adaptive Engine → Live Trigger Processing

### What is being built
The adaptive engine (`packages/engines/src/adaptive/index.ts`) is fully implemented but never called from the live API layer. This Tier wires trigger detection into a dedicated API route that is called whenever a case-significant event occurs, and surfaces the resulting recommendations to case managers.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `packages/engines/src/adaptive/index.ts` | Fully implemented, tested | No change |
| `apps/web/app/api/adaptive/route.ts` | Does not exist | Create POST endpoint |
| `apps/web/app/(admin)/cases/[id]/page.tsx` | Case detail page | Add "Recommendations" banner from adaptive engine |
| All event-producing routes (plans, debts, triage) | No trigger firing | Add `fetch('/api/adaptive', { method: 'POST', … })` call after significant writes |

### Integration approach — no regression

1. **Create `apps/web/app/api/adaptive/route.ts`** `POST` handler:
   ```ts
   Body: { caseId: string, trigger: AdaptiveTrigger }
   // 1. Load case context from DB (debts, payments, budget, stage)
   // 2. Call detectTriggers(caseContext) → AdaptiveRecommendation[]
   // 3. For each recommendation with escalateToHuman=true: create Task in DB
   // 4. Store recommendations in a new AdaptiveRecommendation table or as Notes
   // 5. Return recommendations
   ```

2. **Case detail page** adds a "Smart Recommendations" section that fetches `GET /api/adaptive?caseId=…` and shows a priority-ordered list of recommended actions with urgency badges.

3. **Event-producing routes** fire triggers asynchronously (fire-and-forget):
   - Plan selected → `income_change` trigger (if income changed since last plan).
   - New debt added → `new_debt` trigger.
   - Triage completed → check for `stage_timeout` trigger.

4. **Engine unchanged** — this Tier is purely wiring-layer.

### Testing strategy
- Add a new debt to a case.
- Navigate to the case detail → confirm "New Debt Added" recommendation appears under Smart Recommendations.
- Confirm the recommendation matches the adaptive engine's `new_debt` trigger output.

### Dependencies
- Tier 1, Tier 3, Tier 4 (case context must exist in DB for meaningful trigger evaluation).

---

<a name="tier-19"></a>
## Tier 19 — Recovery Score Widget (Real-time)

### What is being built
The dashboard shows a static "Recovery Score" circle. This Tier replaces it with a live, animated score that updates in real time using server-sent events (SSE) or a polling mechanism, fed by the adaptive engine's `calculateRecoveryScore()` function.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(client)/dashboard/page.tsx` | Static recovery score number | Replace with `<RecoveryScoreWidget caseId={…} />` |
| `apps/web/components/ui/RecoveryScoreWidget.tsx` | Does not exist | Create animated progress ring component |
| `apps/web/app/api/recovery-score/route.ts` | Does not exist | Create GET endpoint (JSON + SSE stream variant) |
| `packages/engines/src/adaptive/index.ts` | `calculateRecoveryScore(input)` — implemented | No change |

### Integration approach — no regression

1. **Create `apps/web/app/api/recovery-score/route.ts`** `GET` handler:
   ```ts
   // Accepts ?caseId=… 
   // Queries DB: stage, payments (consecutive on-time), budget surplus flag, debt reduction ratio, months in program
   // Calls calculateRecoveryScore(caseScoreInput) → number (0-100)
   // Returns { score: number, stage: RecoveryStage, breakdown: { … } }
   ```

2. **Create `apps/web/components/ui/RecoveryScoreWidget.tsx`**:
   - SVG circular progress ring.
   - Colour: red (0-33), amber (34-66), green (67-100).
   - Polls `/api/recovery-score?caseId=…` every 30 seconds or on page focus.
   - Shows stage label (Survive / Stabilise / Recover / Rebuild) below the ring.
   - Shows score breakdown tooltip on hover.

3. **Dashboard page** replaces the hardcoded score value block with `<RecoveryScoreWidget caseId={session.caseId} />`.

4. **Existing `StatCard` component** is unchanged.

### Testing strategy
- Login as client, navigate to `/dashboard`.
- Confirm Recovery Score circle renders with a value between 0 and 100.
- In the DB, manually update a `PaymentPlan` to add a consecutive on-time payment count, then reload — confirm score increases.

### Dependencies
- Tier 1, Tier 4 (dashboard live data).

---

<a name="tier-20"></a>
## Tier 20 — Case Analytics Dashboard

### What is being built
No analytics page exists. This Tier adds an admin-only analytics dashboard showing: case volume by stage over time, crisis level distribution, average time-to-resolution, plan success rates, compliance rate trend, and top referral organisations.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(admin)/analytics/page.tsx` | Does not exist | Create new admin page |
| `apps/web/app/api/analytics/route.ts` | Does not exist | Create GET endpoint with aggregations |
| `apps/web/app/(admin)/layout.tsx` | Admin nav | Add "Analytics" nav item |
| `apps/web/middleware.ts` | Admin paths | Add `/analytics` |
| `apps/web/package.json` | No chart library | Add `recharts` (or `chart.js` + `react-chartjs-2`) |

### Integration approach — no regression

1. **Add `recharts`** (lightweight, React-native):
   ```
   pnpm add recharts --filter @recoveryos/web
   ```

2. **Create `apps/web/app/api/analytics/route.ts`** `GET` handler using Prisma aggregations:
   ```ts
   const casesByStage = await prisma.case.groupBy({ by: ['status'], _count: true })
   const crisisDistribution = await prisma.triageAssessment.groupBy({ by: ['crisisLevel'], _count: true })
   const avgResolutionDays = await prisma.$queryRaw`…`
   // etc.
   ```

3. **Analytics page** is a grid of Recharts components: `<BarChart>`, `<PieChart>`, `<LineChart>`. Each chart fetches from `/api/analytics?metric=…`.

4. **No engine changes.** Analytics are read-only aggregations.

### Testing strategy
- Navigate to `/analytics` as admin.
- Confirm all 6 charts render without errors.
- Confirm chart data matches a manual SQL count (cross-check one metric).

### Dependencies
- Tier 1, Tier 3 (sufficient data in DB to make analytics meaningful).

---

<a name="tier-21"></a>
## Tier 21 — Referral Tracking & Feedback Loop

### What is being built
`Referral` records exist but status is never updated after creation. This Tier adds a feedback loop: case managers log referral outcomes (accepted, declined, in-progress), and a summary of referral effectiveness by organisation is displayed on the referrals page.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(admin)/referrals/page.tsx` | (Tier 6 builds base) | Add status update controls + effectiveness summary |
| `apps/web/app/api/referrals/[id]/route.ts` | Does not exist | Create PATCH endpoint for status updates |
| `packages/engines/src/referral/index.ts` | Resource lookup only | No change |
| `packages/database/prisma/schema.prisma` | `Referral.status` + `outcome String?` fields | Confirm fields exist; add `outcomeNotes String?` if missing |

### Integration approach — no regression

1. **Create `PATCH /api/referrals/[id]`** handler:
   - Body: `{ status, outcomeNotes? }`
   - Updates `Referral.status` and `outcomeNotes`.

2. **Referrals page** adds an "Update Outcome" button on each referral row. Clicking opens an inline status select and notes field.

3. **Effectiveness summary section** at the top of the referrals page:
   - Table: Organisation, Total Referrals Sent, Accepted %, Declined %, In-Progress count.
   - Sourced from a `GET /api/referrals/stats` endpoint using `prisma.referral.groupBy`.

4. **No engine changes.** Feedback data informs future referral engine improvements but doesn't change its logic now.

### Testing strategy
- Update a referral status to "ACCEPTED".
- Reload the referrals page → confirm effectiveness table shows 1 accepted referral.

### Dependencies
- Tier 6 (referrals page base), Tier 1 (Prisma).

---

<a name="tier-22"></a>
## Tier 22 — Budget Trend Visualisation

### What is being built
The budget page shows a current snapshot but no historical trends. This Tier adds a line chart showing income, expenses, and disposable income trends over time using `BudgetSnapshot` records.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(client)/budget/page.tsx` | Snapshot only | Add `<BudgetTrendChart caseId={…} />` at top |
| `apps/web/app/api/budget/trend/route.ts` | Does not exist | Create GET endpoint returning historical snapshots |
| `apps/web/components/ui/BudgetTrendChart.tsx` | Does not exist | Create Recharts LineChart component |
| `packages/database/prisma/schema.prisma` | `BudgetSnapshot` model has `createdAt` | No change |

### Integration approach — no regression

1. **Create `GET /api/budget/trend?caseId=…&months=6`** — returns last N `BudgetSnapshot` records ordered by date.

2. **Create `apps/web/components/ui/BudgetTrendChart.tsx`** — Recharts `<LineChart>` with three lines: income (green), expenses (red), disposable (blue). X-axis: month labels.

3. **Budget page** adds the chart above the existing income/expenses lists. The existing lists are unchanged.

4. **`BudgetSnapshot` records** are created by the onboarding flow (Tier 3) and by the adaptive engine recalculation (Tier 10/18) — so historical data accumulates automatically over time.

### Testing strategy
- Log in as client, navigate to `/budget`.
- Confirm a trend chart renders (may show only 1 data point initially, which is fine).
- Seed 3 months of `BudgetSnapshot` records and confirm the chart shows a multi-point trend.

### Dependencies
- Tier 1, Tier 3 (budget snapshots in DB), Tier 20 (`recharts` already added).

---

<a name="tier-23"></a>
## Tier 23 — Negotiation Module (Case Manager UX)

### What is being built
Case managers need a structured workflow to manage creditor negotiations end-to-end: initiate → send letter → log response → counter-negotiate → close. This Tier builds a dedicated negotiation module inside the case detail page with timeline and status machine.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(admin)/cases/[id]/page.tsx` | Negotiations section placeholder | Replace with full negotiation module |
| `apps/web/app/api/negotiations/route.ts` | (Tier 15 creates this) | Add full CRUD |
| `apps/web/components/ui/NegotiationTimeline.tsx` | Does not exist | Create negotiation status timeline component |
| `packages/engines/src/advocacy/index.ts` | `recommendLetterType()` — implemented | Call on negotiation init to auto-select letter type |

### Integration approach — no regression

1. **`NegotiationTimeline.tsx`** renders a vertical timeline of `AdvocacyAction` records:
   - Each node: date, action type (icon), description, outcome.
   - Active node: highlighted with pulsing dot.
   - Add note form at bottom.

2. **Negotiation module sections in case detail:**
   - Per-debt negotiation card: Creditor, Balance, Current Negotiation Status, Days Open.
   - "Start Negotiation" button (if no active negotiation) → opens "Select Letter Type" dropdown pre-populated with `recommendLetterType()` suggestion.
   - Timeline (from `NegotiationTimeline`).
   - "Log Response" button (Tier 15).
   - "Escalate to AFCA" button (shown when creditor rejected after 21+ days; creates AdvocacyAction of type ESCALATION).

3. **No engine changes.** All logic is already in the advocacy and adaptive engines.

### Testing strategy
- Open a case with an active debt.
- Click "Start Negotiation" → confirm a `Negotiation` record is created with SENT status.
- Log a "Counter-Offer" response → confirm timeline shows both the send and the counter-offer nodes.

### Dependencies
- Tier 5 (advocacy page patterns), Tier 15 (negotiations API), Tier 7 (letter PDF generation).

---

<a name="tier-24"></a>
## Tier 24 — Client Mobile-Responsive Redesign

### What is being built
The client-facing pages (dashboard, debts, budget, plan, crisis) are built with Tailwind but not optimised for small screens. This Tier adds full mobile-responsive layouts: collapsible nav, stacked stat cards, touch-friendly buttons, and a bottom tab bar on mobile.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/app/(client)/layout.tsx` | Desktop sidebar nav | Add responsive hamburger nav + mobile bottom tab bar |
| `apps/web/app/(client)/dashboard/page.tsx` | 4-column stat card grid | Convert to responsive 2-col on mobile, 1-col on xs |
| `apps/web/app/(client)/debts/page.tsx` | Table layout | Convert table to card list on mobile |
| `apps/web/app/(client)/budget/page.tsx` | Two-column layout | Stack columns on mobile |
| `apps/web/app/(client)/plan/page.tsx` | 3-column plan cards | Stack on mobile, swipe carousel on xs |
| `apps/web/components/ui/StatCard.tsx` | No mobile-specific styles | Add `sm:` breakpoint variants |
| `apps/web/tailwind.config.ts` | Standard breakpoints | Confirm `sm`, `md`, `lg` breakpoints — no change needed |

### Integration approach — no regression

1. **Client layout** adds a mobile navigation:
   ```tsx
   // At mobile breakpoint:
   // - Hide desktop sidebar
   // - Show hamburger menu (opens slide-in drawer)
   // - Show bottom tab bar: Dashboard | Debts | Budget | Plan
   ```

2. **All page changes are Tailwind class additions only** — no component logic changes. Specifically:
   - Replace `grid-cols-4` with `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`.
   - Replace `<table>` layouts with responsive card lists using `block sm:table` pattern.
   - Add `overflow-x-auto` wrappers to tables that must remain tabular on mobile.

3. **Desktop layout is unchanged** — all responsive classes use `sm:` / `md:` / `lg:` prefixes, preserving existing desktop behaviour.

4. **No API or engine changes.**

### Testing strategy
- Open Chrome DevTools, toggle mobile view (375px).
- Navigate through all client pages → confirm no horizontal overflow, readable text, tappable buttons.
- On desktop view → confirm all layouts are identical to before.

### Dependencies
- No backend dependencies. Can be built independently at any time.

---

<a name="tier-25"></a>
## Tier 25 — Multilingual Support (i18n)

### What is being built
RecoveryOS serves diverse Australian communities. This Tier adds i18n support for Simplified Chinese (zh), Vietnamese (vi), Arabic (ar), and Spanish (es) in addition to English, using Next.js's built-in i18n routing and `next-intl`.

### Codebase location

| File | Current state | Change required |
|---|---|---|
| `apps/web/next.config.js` | No i18n config | No change — App Router uses middleware-based routing, not the Pages Router `i18n` config key |
| `apps/web/middleware.ts` | Route protection middleware | Add locale detection and redirect logic before existing route guards |
| `apps/web/app/[lang]/` | Does not exist | Restructure `app/` routes under a `[lang]` dynamic segment |
| `apps/web/messages/en.json` | Does not exist | Create with all English UI strings |
| `apps/web/messages/zh.json` | Does not exist | Create with Simplified Chinese translations |
| `apps/web/messages/vi.json` | Does not exist | Create with Vietnamese translations |
| `apps/web/messages/ar.json` | Does not exist | Create with Arabic translations (RTL flag) |
| `apps/web/messages/es.json` | Does not exist | Create with Spanish translations |
| `apps/web/app/layout.tsx` | `<html lang="en">` | Change to `<html lang={params.lang} dir={isRtl ? 'rtl' : 'ltr'}>` |
| All client page strings | Hardcoded English | Replace with `t('key')` calls via `next-intl` |
| `apps/web/app/(client)/layout.tsx` | No language switcher | Add language dropdown in nav header |
| `apps/web/package.json` | No i18n library | Add `next-intl` |

### Integration approach — no regression

> ⚠️ **App Router i18n note:** Next.js 13+ App Router does **not** use the `i18n` key in `next.config.js` (that is Pages Router only). The correct approach for App Router is: (1) `next-intl` middleware for locale detection/redirect, (2) a `[lang]` dynamic segment wrapping all routes, (3) `getMessages()` to load the correct message file per request.

1. **Add `next-intl`:**
   ```
   pnpm add next-intl --filter @recoveryos/web
   ```

2. **Restructure app routes** under a `[lang]` segment:
   ```
   apps/web/app/
   ├── [lang]/
   │   ├── layout.tsx          (was app/layout.tsx — reads params.lang)
   │   ├── page.tsx            (landing)
   │   ├── (auth)/...
   │   ├── (client)/...
   │   └── (admin)/...
   └── layout.tsx              (minimal root layout, no locale logic)
   ```
   This is a structural refactor but each individual page file is **unchanged** — only the directory is moved one level deeper. All existing routing and role protection continues to work.

3. **Update `apps/web/middleware.ts`** to add `next-intl` locale middleware **before** the existing session/role checks:
   ```ts
   import createMiddleware from 'next-intl/middleware'
   const intlMiddleware = createMiddleware({ locales: ['en', 'zh', 'vi', 'ar', 'es'], defaultLocale: 'en' })
   // Run intlMiddleware first, then existing route guards
   ```

4. **Create `apps/web/i18n.ts`** — locale configuration per `next-intl` docs (maps `params.lang` to `messages/*.json`).

5. **Extract all hardcoded strings** from client pages into `messages/en.json` first. Then translate into each target language. This is the largest effort in this Tier.

6. **Arabic (ar)** requires `dir="rtl"` on the `<html>` element. Tailwind has RTL support via the `rtl:` variant — flip margins/paddings where needed.

7. **Hardship letter content** in the advocacy engine remains in English only (legal/formal letters must be in English for NCCP purposes). Only the UI shell is translated.

8. **Language preference** is stored in the URL path prefix (e.g., `/zh/dashboard`) by `next-intl` — no localStorage/cookie hack needed. The `defaultLocale` (`en`) has no prefix (`/dashboard` = English).

### Testing strategy
- Switch language to "中文" via the nav dropdown.
- Confirm URL changes to `/zh/dashboard` and all labels are in Simplified Chinese.
- Switch to Arabic → confirm URL is `/ar/dashboard`, text is right-to-left, and no layout breaks.
- Navigate back to English (default, no prefix: `/dashboard`) → confirm English layout is identical to before.
- Run engine unit tests (unchanged — engines don't deal with UI strings).

### Dependencies
- Tier 24 (mobile layout complete — easier to add RTL support at the same time as responsive layout). All other tiers can be built alongside or before this.

---

## Cross-Tier Integration Map

```
TIER 1  ──► TIER 2 ──► TIER 3 ──► TIER 4
 (Prisma)   (Auth)    (Onboard)  (Dashboard)
                                    │
              ┌─────────────────────┼──────────────────────┐
              ▼                     ▼                       ▼
           TIER 5               TIER 8                  TIER 10
        (Advocacy UI)        (Notifications)          (BullMQ Jobs)
              │                     │                       │
           TIER 7               TIER 9                  TIER 18
         (PDF Letters)        (Doc Upload)           (Adaptive Engine Live)
              │
           TIER 15
        (Creditor Response)
              │
           TIER 23
        (Negotiation Module)

TIER 6 ──► TIER 21 (Referral Tracking)
TIER 11 (E2E Tests — runs after Tiers 1-4)
TIER 12 (Compliance Remediation — after Tier 1)
TIER 13 (Audit Log — after Tier 1)
TIER 14 (Stripe — after Tiers 1, 3)
TIER 16 (Search/Filter — after Tier 1)
TIER 17 (Bulk Actions — after Tier 16)
TIER 19 (Recovery Score — after Tiers 1, 4)
TIER 20 (Analytics — after Tiers 1, 3)
TIER 22 (Budget Trends — after Tiers 1, 3, 20)
TIER 24 (Mobile — independent)
TIER 25 (i18n — after Tier 24)
```

---

## Sequencing & Priorities

### Phase 1 — Foundation (Required for all other Tiers)
| # | Tier | Est. Effort | Blocks |
|---|---|---|---|
| 1 | API-to-Database Integration | 2 days | All data-dependent tiers |
| 2 | Real Authentication | 1 day | Tier 3 |
| 3 | Onboarding Persistence | 2 days | Tiers 4, 5, 6, 14, 18 |
| 4 | Dashboard Live Data | 1 day | Tier 19 |

### Phase 2 — Admin UX Completion
| # | Tier | Est. Effort | Blocks |
|---|---|---|---|
| 5 | Advocacy Page | 2 days | Tiers 7, 15, 23 |
| 6 | Referrals Page | 1 day | Tier 21 |
| 12 | Compliance Remediation | 1 day | — |
| 13 | Audit Log | 1 day | — |

### Phase 3 — Core Feature Builds
| # | Tier | Est. Effort | Blocks |
|---|---|---|---|
| 7 | Hardship Letter PDF | 2 days | Tier 23 |
| 8 | Email & SMS | 2 days | — |
| 9 | Document Upload | 2 days | — |
| 14 | Stripe Payments | 3 days | — |
| 15 | Creditor Response | 1 day | Tier 23 |

### Phase 4 — Intelligence & Analytics
| # | Tier | Est. Effort | Blocks |
|---|---|---|---|
| 18 | Adaptive Engine Live | 2 days | Tier 19 |
| 19 | Recovery Score Widget | 1 day | — |
| 20 | Analytics Dashboard | 2 days | Tier 22 |
| 21 | Referral Feedback | 1 day | — |
| 22 | Budget Trends | 1 day | — |
| 23 | Negotiation Module | 2 days | — |

### Phase 5 — Quality, Scale & Reach
| # | Tier | Est. Effort | Blocks |
|---|---|---|---|
| 10 | BullMQ Workers | 2 days | — |
| 11 | Playwright E2E Tests | 3 days | — |
| 16 | Search & Filter | 2 days | Tier 17 |
| 17 | Bulk Case Actions | 1 day | — |
| 24 | Mobile Redesign | 3 days | Tier 25 |
| 25 | Multilingual (i18n) | 4 days | — |

**Total estimated effort: ~45 developer-days (9 weeks solo, 4–5 weeks with a 2-person team)**

---

## Pre-Build Checklist (Run Before Any Tier)

```bash
# 1. Confirm all engine tests pass (zero regressions)
cd packages/engines && pnpm vitest run

# 2. Confirm lint is clean
pnpm lint

# 3. Confirm TypeScript compiles
pnpm build

# 4. Confirm DB is up and seeded
pnpm db:push && pnpm db:seed
```

---

## Non-Regression Rules

1. **Never modify engine files** (`packages/engines/src/**`) without adding/updating the corresponding Vitest tests.
2. **Never change the JSON shape** of an existing API route response without updating all client pages that consume it.
3. **Never change shared types** in `packages/shared/src/types/` without checking all 80+ source files that import them.
4. **Always wrap Prisma writes in a transaction** when multiple related models are written together.
5. **Never hardcode credentials** — all secrets use `process.env.*` with `.env.example` documentation.
6. **Always add to `.gitignore`** any new build output, upload directory, or secrets file.
7. **Role-protect all new admin routes** by checking they fall under the `(admin)` route group and are covered by `middleware.ts`.
