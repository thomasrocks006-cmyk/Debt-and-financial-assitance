# RecoveryOS v3 — Build Tiers & Integration Plan

> Deep-scan document covering every build tier: what it does, where it lives in the codebase, how to integrate it cleanly, and what it depends on.

---

## Quick Reference

| Build | Title | Status | Primary Files |
|-------|-------|--------|---------------|
| B-001 | Monorepo Scaffold | ✅ Complete | `package.json`, `pnpm-workspace.yaml`, `turbo.json` |
| B-002 | Core Engines | ✅ Complete | `packages/engines/src/**` |
| B-003 | Shared Types & Constants | ✅ Complete | `packages/shared/src/**` |
| B-004 | Prisma Schema & Seed | ✅ Complete | `packages/database/prisma/**` |
| B-005 | Auth System (NextAuth) | ✅ Complete | `apps/web/lib/auth.ts`, `middleware.ts` |
| B-006 | Client UI Pages | ✅ Complete | `apps/web/app/(client)/**` |
| B-007 | Admin UI Pages | ✅ Complete | `apps/web/app/(admin)/**` |
| B-008 | Core API Routes | ✅ Complete | `apps/web/app/api/**` |
| B-009 | Wire Client Pages → API | ✅ Complete | `(client)/dashboard`, `debts`, `budget`, `plan` |
| B-010 | Wire Onboarding → Triage API | ✅ Complete | `(client)/onboarding/page.tsx` |
| B-011 | Wire Admin Pipeline/Triage → API | ✅ Complete | `(admin)/pipeline`, `triage` |
| B-012 | Wire Admin Advocacy/Referrals → API | ✅ Complete | `(admin)/advocacy`, `referrals` |
| B-013 | Wire Admin Compliance/Cases → API | ✅ Complete | `(admin)/compliance`, `cases/[id]` |
| B-014 | Replace Mock Data with Prisma (DB) | 🟡 Next | All `api/*/route.ts` files |
| B-015 | Real Authentication (credentials DB) | 🟡 Next | `lib/auth.ts`, `api/auth/**` |
| B-016 | Case Management (assign, transitions) | 🟡 Next | `api/cases/route.ts`, `(admin)/cases/**` |
| B-017 | PDF Letter Generation | 🔵 Planned | `api/advocacy/letter/route.ts` |
| B-018 | BullMQ Job Queue | 🔵 Planned | New `packages/queue/**` |
| B-019 | Notification System | 🔵 Planned | New `api/notifications/**` |
| B-020 | AFCA Complaint Workflow | 🔵 Planned | New `api/complaints/**` |
| B-021 | Creditor Contact Database | 🔵 Planned | New `packages/creditors/**` |
| B-022 | Analytics & Reporting | 🔵 Planned | New `(admin)/analytics/**` |
| B-023 | Financial Calendar & Reminders | 🔵 Planned | New `(client)/calendar/**` |
| B-024 | E2E Testing Suite (Playwright) | 🔵 Planned | `apps/web/playwright.config.ts` |
| B-025 | Mobile PWA | 🔵 Planned | `apps/web/app/manifest.json` |
| B-026 | Multi-tenancy / Organisations | 🔵 Planned | `packages/database/prisma/schema.prisma` |
| B-027 | Real-time Updates (WebSockets) | 🔵 Planned | New `packages/realtime/**` |
| B-028 | Audit Log / Compliance Ledger | 🔵 Planned | New `api/audit/**` |
| B-029 | CI/CD Pipeline & Deployment | 🔵 Planned | `.github/workflows/**` |
| B-030 | Client Mobile App (Expo) | 🔵 Future | New `apps/mobile/**` |

---

## Completed Builds

---

### B-001 — Monorepo Scaffold

**What it does:** Establishes the pnpm workspace with Turborepo, shared ESLint/TypeScript configs, and the three top-level packages (`engines`, `database`, `shared`).

**Files:**
```
package.json                    ← root workspace
pnpm-workspace.yaml             ← workspace declaration
pnpm-lock.yaml
turbo.json                      ← Turborepo pipeline (build, dev, test, lint)
packages/config/eslint/base.js
packages/config/typescript/base.json
packages/config/typescript/nextjs.json
```

**Integration notes:**
- All `apps/*` and `packages/*` inherit lint/TS configs via `extends` in their local configs.
- Turborepo `pipeline` chains: `database#build` → `engines#build` → `web#build`.
- No regression risk — config only, no runtime code.

---

### B-002 — Core Engines

**What it does:** Implements the 7 business-logic engines as a pure TypeScript package (`packages/engines`). No side effects, fully testable in isolation.

**Files:**
```
packages/engines/src/triage/index.ts          ← CrisisLevel, serviceStreams derivation
packages/engines/src/triage/rules.ts          ← threshold rules per stress factor
packages/engines/src/triage/types.ts
packages/engines/src/affordability/calculator.ts  ← HEM benchmarking
packages/engines/src/affordability/index.ts
packages/engines/src/affordability/types.ts
packages/engines/src/plan-builder/index.ts    ← 3 plan strategies
packages/engines/src/plan-builder/strategies.ts
packages/engines/src/plan-builder/types.ts
packages/engines/src/advocacy/index.ts        ← hardship letter generation
packages/engines/src/advocacy/types.ts
packages/engines/src/referral/index.ts        ← community resource lookup
packages/engines/src/referral/types.ts
packages/engines/src/adaptive/index.ts        ← trigger detection, plan updates
packages/engines/src/adaptive/types.ts
packages/engines/src/compliance/index.ts      ← NCCP/ASIC/AFCA checks
packages/engines/src/compliance/types.ts
packages/engines/index.ts                     ← barrel export
packages/engines/vitest.config.ts
```

**Tests:**
```
packages/engines/src/__tests__/adaptive.test.ts
packages/engines/src/__tests__/advocacy.test.ts
packages/engines/src/__tests__/plan-builder.test.ts
packages/engines/src/triage/triage.test.ts
packages/engines/src/affordability/affordability.test.ts
packages/engines/src/compliance/compliance.test.ts
```

**Integration notes:**
- Engines are consumed by API routes via `import { triageEngine } from '@repo/engines'`.
- Currently API routes use inline mock logic — B-014 wires them to DB + engines properly.
- Run tests: `pnpm --filter @repo/engines test`

---

### B-003 — Shared Types & Constants

**What it does:** Single source of truth for TypeScript types and domain constants shared between engines, API routes, and UI.

**Files:**
```
packages/shared/src/types/case.ts
packages/shared/src/types/client.ts
packages/shared/src/types/debt.ts
packages/shared/src/types/enums.ts       ← CrisisLevel, ServiceStream, DebtStatus...
packages/shared/src/types/plan.ts
packages/shared/src/constants/creditor-categories.ts
packages/shared/src/constants/debt-types.ts
packages/shared/src/constants/hardship-flags.ts
packages/shared/src/utils/index.ts
packages/shared/index.ts
```

**Integration notes:**
- Import via `import { CrisisLevel } from '@repo/shared'`.
- When adding new domain concepts, define types here first, then consume in engines + API.

---

### B-004 — Prisma Schema & Seed

**What it does:** Defines the PostgreSQL schema for all entities and seeds demo data.

**Files:**
```
packages/database/prisma/schema.prisma    ← User, Client, Case, Debt, Plan, Budget...
packages/database/prisma/seed.ts          ← seeds demo cases for local dev
packages/database/index.ts               ← exports PrismaClient singleton
packages/database/package.json
```

**Integration notes:**
- Run `pnpm db:generate` after schema changes to regenerate Prisma Client.
- Run `pnpm db:push` to sync schema with the dev database.
- Run `pnpm db:seed` to populate demo data.
- The `PrismaClient` singleton export is used in B-014 when API routes are switched from mock to DB.

---

### B-005 — Auth System (NextAuth)

**What it does:** JWT-based session auth with RBAC (`ADMIN` / `CLIENT` roles). Middleware protects all routes.

**Files:**
```
apps/web/lib/auth.ts                          ← NextAuth config, session strategy
apps/web/middleware.ts                        ← route protection by role
apps/web/app/api/auth/[...nextauth]/route.ts  ← NextAuth handler
apps/web/app/(auth)/login/page.tsx
apps/web/app/(auth)/register/page.tsx
apps/web/app/(auth)/layout.tsx
apps/web/app/providers.tsx                    ← SessionProvider wrapper
```

**Integration notes:**
- `middleware.ts` guards: `/dashboard`, `/debts`, `/budget`, `/plan`, `/onboarding` → CLIENT role
- `/pipeline`, `/triage`, `/advocacy`, `/compliance`, `/referrals`, `/cases` → ADMIN role
- B-015 replaces the demo-credential mock with real DB credential lookup.

---

### B-006 — Client UI Pages

**What it does:** Full interactive UI for the financial recovery client journey.

**Files:**
```
apps/web/app/(client)/layout.tsx
apps/web/app/(client)/dashboard/page.tsx   ← recovery score, metrics, tasks
apps/web/app/(client)/debts/page.tsx       ← debt list, add debt, hardship flag
apps/web/app/(client)/budget/page.tsx      ← income/expense tracking, HEM comparison
apps/web/app/(client)/plan/page.tsx        ← 3 plan options, select & confirm
apps/web/app/(client)/onboarding/page.tsx  ← 5-step intake form + triage scoring
apps/web/app/(client)/crisis/page.tsx      ← emergency resources, safety planning
```

**Integration notes:**
- All pages are `"use client"` with loading skeletons and error banners.
- B-009/B-010 wires these pages to live API data (see below).

---

### B-007 — Admin UI Pages

**What it does:** Full admin UI for case managers to manage the pipeline.

**Files:**
```
apps/web/app/(admin)/layout.tsx
apps/web/app/(admin)/pipeline/page.tsx     ← case pipeline with filter/sort/search
apps/web/app/(admin)/triage/page.tsx       ← crisis distribution, urgent queue
apps/web/app/(admin)/advocacy/page.tsx     ← negotiations management + letter gen
apps/web/app/(admin)/referrals/page.tsx    ← referral management + directory
apps/web/app/(admin)/compliance/page.tsx   ← NCCP/ASIC compliance dashboard
apps/web/app/(admin)/cases/[id]/page.tsx   ← full case detail + notes + stage mgmt
```

**Integration notes:**
- B-011/B-012/B-013 wires these pages to live API data.

---

### B-008 — Core API Routes

**What it does:** Next.js App Router API handlers for all domain entities.

**Files:**
```
apps/web/app/api/debts/route.ts        ← GET/POST /api/debts
apps/web/app/api/budget/route.ts       ← GET/POST /api/budget
apps/web/app/api/plans/route.ts        ← GET/POST /api/plans (plan builder)
apps/web/app/api/triage/route.ts       ← GET/POST /api/triage (triage engine)
apps/web/app/api/cases/route.ts        ← GET/POST /api/cases
apps/web/app/api/cases/[id]/route.ts   ← GET /api/cases/:id (full case detail)
apps/web/app/api/compliance/route.ts   ← GET /api/compliance
apps/web/app/api/advocacy/route.ts     ← GET /api/advocacy (negotiations)
apps/web/app/api/advocacy/letter/route.ts  ← POST /api/advocacy/letter
apps/web/app/api/referrals/route.ts    ← GET/POST /api/referrals
```

**Current data layer:** All routes return mock/in-memory data.
**Next step (B-014):** Replace with Prisma DB queries + engine calls.

**Request/Response Contracts:**

| Route | Method | Body | Response |
|-------|--------|------|----------|
| `/api/debts` | GET | — | `{ debts, summary }` |
| `/api/debts` | POST | `{ creditor, type, currentBalance, ... }` | `{ debt }` |
| `/api/budget` | GET | — | `{ income, expenses, summary }` |
| `/api/budget` | POST | `{ type, source/category, amount, ... }` | `{ item }` |
| `/api/plans` | GET | — | `{ plans, disposableIncome }` |
| `/api/plans` | POST | `{ planName }` | `{ plan }` |
| `/api/triage` | POST | `{ debtStress, rentalStress, ... }` | `{ triageResult }` |
| `/api/cases` | GET | — | `{ cases, total, stages }` |
| `/api/cases/:id` | GET | — | `{ id, name, status, debts, compliance, notes, ... }` |
| `/api/compliance` | GET | — | `{ items, summary, checkedAt }` |
| `/api/advocacy` | GET | — | `{ negotiations }` |
| `/api/advocacy/letter` | POST | `{ templateId, clientName?, creditor? }` | `{ letter }` |
| `/api/referrals` | GET | — | `{ referrals }` |
| `/api/referrals` | POST | `{ client, service, provider }` | `{ referral }` |

---

### B-009 — Wire Client Pages → Live API

**What it does:** Replaces the 600ms `setTimeout` simulation and hardcoded arrays in the 4 client pages with real `fetch()` calls on mount.

**Files modified:**
```
apps/web/app/(client)/dashboard/page.tsx   ← parallel fetch /api/debts + /api/budget + /api/plans
apps/web/app/(client)/debts/page.tsx       ← GET /api/debts on mount; POST /api/debts on add
apps/web/app/(client)/budget/page.tsx      ← GET /api/budget on mount; POST /api/budget on add
apps/web/app/(client)/plan/page.tsx        ← GET /api/plans on mount; POST /api/plans on select
```

**Key patterns used:**
- `useEffect(() => { fetch(...).then(...).finally(() => setLoading(false)) }, [])`
- Field mapping from API response (e.g. `currentBalance → balance`, `source → label`)
- Loading skeleton (`animate-pulse`) + error banner states
- Optimistic local-state fallback on network failure for mutations

**No regressions:** All local state interactions (UI filtering, form state) unchanged.

---

### B-010 — Wire Onboarding → Triage API

**What it does:** The final onboarding step (`handleComplete`) now calls `POST /api/triage` and shows the triage result (crisis level, service streams, recommended action) before redirecting.

**File modified:**
```
apps/web/app/(client)/onboarding/page.tsx
```

**Key additions:**
```typescript
const REDIRECT_DELAY_MS = 2000;
// handleComplete: POST /api/triage → setTriageResult → setShowingResults → auto-redirect
// redirectTimerRef: cleared on unmount and on manual "Continue →" click
```

**Validation:** `response.ok` checked before parsing; error fallback navigates to `/dashboard` directly.

---

### B-011 — Wire Admin Pipeline & Triage → Live API

**What it does:** Both admin pages (`/pipeline` and `/triage`) now fetch live data instead of rendering hardcoded static arrays.

**Files modified:**
```
apps/web/app/(admin)/pipeline/page.tsx   ← GET /api/cases; maps clientName→name, status→stage
apps/web/app/(admin)/triage/page.tsx     ← GET /api/triage; populates urgentCases, distribution, awaitingCount
```

**Key patterns:**
- `stageConfig` array (style-only, no counts) combined with live `stageCounts` from API
- Division-by-zero guard: `totalCases > 0 ? (d.count / totalCases) * 100 : 0`
- `awaitingCount - processedCount > 0 ? ... : 0` prevents negative display

---

### B-012 — Wire Admin Advocacy & Referrals → Live API

**What it does:** Creates two new API route files and connects the advocacy/referrals admin pages to them.

**Files created:**
```
apps/web/app/api/advocacy/route.ts          ← GET /api/advocacy → negotiations list
apps/web/app/api/advocacy/letter/route.ts   ← POST /api/advocacy/letter → letter generation
apps/web/app/api/referrals/route.ts         ← GET + POST /api/referrals
```

**Files modified:**
```
apps/web/app/(admin)/advocacy/page.tsx   ← useEffect fetches negotiations; handleGenerateLetter calls POST
apps/web/app/(admin)/referrals/page.tsx  ← useEffect fetches referrals; handleAddReferral calls POST
```

**Letter template substitution:**
```typescript
template.replace(/\{clientName\}/g, clientName).replace(/\{creditor\}/g, creditor)
```

---

### B-013 — Wire Admin Compliance & Case Detail → Live API

**What it does:** Creates the new `GET /api/cases/[id]` route and connects the compliance dashboard and case detail page.

**Files created:**
```
apps/web/app/api/cases/[id]/route.ts   ← full case shape: debts, compliance, notes per case
```

**Files modified:**
```
apps/web/app/(admin)/compliance/page.tsx    ← useCallback fetchCompliance; Run Check re-fetches
apps/web/app/(admin)/cases/[id]/page.tsx    ← useEffect GET /api/cases/${id}; 404 vs error states
```

**Type safety improvements:**
- `caseManager: string | null` — null rendered as `"Unassigned"` in UI
- Separate `notFound` / `fetchError` states for distinct UX

---

## Upcoming Builds

---

### B-014 — Replace Mock Data with Prisma (Database Layer)

**What it does:** Swaps all in-memory mock arrays in API routes for real Prisma database queries. This is the single biggest integration step.

**Files to modify:** Every `apps/web/app/api/*/route.ts` file.

**Integration plan:**
1. Import `prisma` from `@repo/database` in each route file
2. Replace mock array reads with `prisma.debt.findMany(...)`, `prisma.case.findMany(...)`, etc.
3. Replace mock mutations with `prisma.debt.create(...)`, etc.
4. Pass session `userId` from `getServerSession(authOptions)` to scope queries per user
5. Add `try/catch` with `NextResponse.json({ error }, { status: 500 })` fallback

**Dependencies:** B-004 (schema), B-005 (auth), B-015 (real user records)

**Risk mitigation:**
- Keep mock route files alongside DB files during transition (feature flags)
- Run `pnpm db:push && pnpm db:seed` to ensure schema is current
- Test each route individually with Postman/curl before connecting UI

---

### B-015 — Real Authentication (Credentials in DB)

**What it does:** Replaces the demo hardcoded credentials in `lib/auth.ts` with a real database lookup, password hashing (bcrypt), and registration flow.

**Files to modify:**
```
apps/web/lib/auth.ts                    ← CredentialsProvider → prisma.user.findUnique + bcrypt
apps/web/app/(auth)/register/page.tsx   ← POST /api/auth/register with hashed password
```

**Files to create:**
```
apps/web/app/api/auth/register/route.ts   ← POST: validate email, hash password, prisma.user.create
```

**Dependencies:** B-014 (Prisma user model accessible)

**Packages needed:** `bcryptjs`, `@types/bcryptjs`

---

### B-016 — Case Management (Full Lifecycle)

**What it does:** Makes case stage transitions, case manager assignment, and case creation persist to the database.

**Files to modify:**
```
apps/web/app/api/cases/route.ts         ← POST: prisma.case.create
apps/web/app/api/cases/[id]/route.ts    ← PATCH: update status, assignedTo; DELETE
apps/web/app/(admin)/cases/[id]/page.tsx  ← PATCH /api/cases/${id} on stage advance
apps/web/app/(admin)/pipeline/page.tsx  ← POST /api/cases on case creation (future)
```

**Prisma operations:**
```typescript
await prisma.case.update({ where: { id }, data: { status: newStatus, updatedAt: new Date() } });
```

---

### B-017 — PDF Letter Generation

**What it does:** Generates properly formatted PDFs for hardship letters, rather than plain text strings.

**Files to modify:**
```
apps/web/app/api/advocacy/letter/route.ts   ← add PDF generation mode
```

**Files to create:**
```
packages/engines/src/advocacy/pdf.ts   ← PDF template using @react-pdf/renderer or pdfmake
```

**Package options:** `@react-pdf/renderer` (React-based), `pdfmake` (JSON template), `puppeteer` (HTML→PDF)

**Response:** Change `Content-Type` to `application/pdf` when `format=pdf` query param present; otherwise return `{ letter }` text as before (backward compatible).

---

### B-018 — BullMQ Job Queue

**What it does:** Moves long-running operations (letter sending, compliance checks, plan generation) to background workers.

**Files to create:**
```
packages/queue/index.ts               ← BullMQ Queue/Worker factory
packages/queue/jobs/triage.ts         ← triage processing job
packages/queue/jobs/advocacy.ts       ← letter delivery job
packages/queue/jobs/compliance.ts     ← scheduled compliance re-check
apps/web/app/api/jobs/route.ts        ← enqueue endpoint
```

**Dependencies:** Redis 7 (already configured in devcontainer), `bullmq`

**Integration approach:**
```typescript
import { Queue } from 'bullmq';
const advocacyQueue = new Queue('advocacy', { connection: redis });
await advocacyQueue.add('send-letter', { caseId, templateId, recipientEmail });
```

---

### B-019 — Notification System

**What it does:** Emails and SMS notifications for critical events (eviction risk, hardship response received, deadline approaching).

**Files to create:**
```
packages/notifications/index.ts          ← notification dispatcher
packages/notifications/templates/        ← email HTML templates
apps/web/app/api/notifications/route.ts  ← GET notifications, POST mark-read
```

**Prisma additions needed:**
```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      String
  message   String
  read      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

**Integration:** Triggered by BullMQ workers (B-018) on deadline events.

---

### B-020 — AFCA Complaint Workflow

**What it does:** Structured workflow for preparing and tracking AFCA (Australian Financial Complaints Authority) complaints.

**Files to create:**
```
apps/web/app/(admin)/complaints/page.tsx    ← complaint builder UI
apps/web/app/api/complaints/route.ts        ← GET/POST /api/complaints
packages/engines/src/complaints/index.ts    ← AFCA eligibility check, letter generation
```

**Compliance context:** AFCA complaints are only available after internal dispute resolution (IDR) has been attempted. Engine should enforce this.

---

### B-021 — Creditor Contact Database

**What it does:** Searchable directory of Australian creditor hardship contacts, phone numbers, and policy references.

**Files to create:**
```
packages/creditors/data/creditors.json    ← 100+ creditor records
packages/creditors/index.ts              ← lookup by name/ABN
apps/web/app/api/creditors/route.ts      ← GET /api/creditors?q=
apps/web/app/(admin)/creditors/page.tsx  ← admin directory browser
```

**Integration:** Advocacy letter generation (`B-012`) auto-populates creditor contact from this database when clientName + creditor are known.

---

### B-022 — Analytics & Reporting Dashboards

**What it does:** Admin analytics: cohort outcomes, service stream distributions, recovery rates, time-in-stage metrics.

**Files to create:**
```
apps/web/app/(admin)/analytics/page.tsx     ← charts, KPI cards
apps/web/app/api/analytics/route.ts         ← aggregation queries
```

**Dependencies:** B-014 (real DB data to aggregate), Recharts or Chart.js

**Key metrics:**
- Recovery rate by crisis level at intake
- Average days per pipeline stage
- Most common service streams
- Advocacy success rate (ACCEPTED responses)

---

### B-023 — Financial Calendar & Reminders

**What it does:** Client-facing calendar showing upcoming payment due dates, court dates, hardship review deadlines.

**Files to create:**
```
apps/web/app/(client)/calendar/page.tsx    ← calendar UI (monthly/list view)
apps/web/app/api/calendar/route.ts         ← GET events from debts + cases
```

**Data sources:** Debt minimum payment dates, hardship response windows (21 days NCCP), AFCA lodgement windows.

---

### B-024 — E2E Testing Suite (Playwright)

**What it does:** Full Playwright test coverage for the client and admin journeys.

**Files to modify/create:**
```
apps/web/playwright.config.ts             ← already scaffolded
apps/web/tests/client/onboarding.spec.ts  ← 5-step onboarding flow
apps/web/tests/client/dashboard.spec.ts   ← dashboard load, metric display
apps/web/tests/admin/pipeline.spec.ts     ← filter, sort, case open
apps/web/tests/admin/triage.spec.ts       ← queue processing
apps/web/tests/admin/advocacy.spec.ts     ← letter generation
```

**Run:** `pnpm --filter web test:e2e`

**Dependencies:** App must be running at `localhost:3000`. Use `webServer` in `playwright.config.ts`.

---

### B-025 — Mobile PWA

**What it does:** Makes the web app installable as a Progressive Web App on iOS and Android.

**Files to create:**
```
apps/web/app/manifest.json        ← PWA manifest (name, icons, theme_color)
apps/web/app/sw.ts               ← service worker (offline cache)
apps/web/public/icons/           ← icon set (192px, 512px)
```

**next.config.js changes:**
```javascript
const withPWA = require('next-pwa')({ dest: 'public' });
module.exports = withPWA({ /* existing config */ });
```

**Offline strategy:** Cache all static pages; network-first for API routes; offline fallback for `/dashboard`.

---

### B-026 — Multi-tenancy / Organisations

**What it does:** Supports multiple financial counselling organisations on a single instance, each with isolated data.

**Prisma schema additions:**
```prisma
model Organisation {
  id       String @id @default(cuid())
  name     String
  slug     String @unique
  users    User[]
  cases    Case[]
}
```

**Files affected:** Every Prisma query needs `where: { organisationId }` scoping. Middleware needs to resolve `orgId` from subdomain/session.

**Risk:** This is a breaking schema change. Must be planned as a migration milestone, not incrementally added.

---

### B-027 — Real-time Updates (WebSockets / SSE)

**What it does:** Live updates to the admin pipeline when a case changes stage, or when a new referral comes in.

**Technology choice:** Server-Sent Events (SSE) via Next.js Route Handlers or a WebSocket server on a separate port.

**Files to create:**
```
apps/web/app/api/events/route.ts   ← SSE endpoint, emits case update events
apps/web/hooks/useSSE.ts           ← React hook wrapping EventSource
```

---

### B-028 — Audit Log / Compliance Ledger

**What it does:** Records every compliance-relevant action (consent obtained, assessment completed, fee disclosed) with timestamp and actor.

**Prisma model:**
```prisma
model AuditLog {
  id         String   @id @default(cuid())
  caseId     String
  actorId    String
  action     String   ← e.g. "CONSENT_RECORDED", "HARDSHIP_LETTER_SENT"
  metadata   Json?
  created    DateTime @default(now())
}
```

**Files to create:**
```
packages/audit/index.ts               ← createAuditEntry() helper
apps/web/app/api/audit/route.ts       ← GET /api/audit?caseId=
apps/web/app/(admin)/cases/[id]/page.tsx  ← audit timeline section
```

---

### B-029 — CI/CD Pipeline & Deployment

**What it does:** GitHub Actions workflow for lint, type-check, unit test, E2E test, and deploy.

**Files to create:**
```
.github/workflows/ci.yml          ← on push/PR: lint + tsc + vitest + playwright
.github/workflows/deploy.yml      ← on merge to main: deploy to Vercel/Railway
.gitignore                        ← add .env, .next, node_modules
```

**CI steps:**
1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate`
3. `pnpm lint`
4. `pnpm typecheck`
5. `pnpm test` (Vitest)
6. `pnpm test:e2e` (Playwright against preview deploy)

---

### B-030 — Client Mobile App (Expo)

**What it does:** React Native mobile app for clients (iOS/Android) sharing the same API layer.

**Files to create:**
```
apps/mobile/                         ← new Expo app
apps/mobile/app/(tabs)/dashboard.tsx
apps/mobile/app/(tabs)/debts.tsx
apps/mobile/app/(tabs)/plan.tsx
```

**Shared code:** `packages/shared` types are already React Native-compatible (pure TS, no DOM deps). `packages/engines` are also compatible.

**API:** Mobile app calls the same `apps/web/app/api/**` endpoints over HTTPS.

---

## Integration Rules

### Do Not Break What Works
- All mock API routes remain fully functional — B-014 DB migration is behind a feature flag
- No `"use client"` directives removed from existing pages
- All loading/error states preserved in refactors

### File Ownership (No Cross-Agent Overlap)
| Agent Zone | Files |
|------------|-------|
| Client UI | `apps/web/app/(client)/**` |
| Admin UI | `apps/web/app/(admin)/**` |
| API Routes | `apps/web/app/api/**` |
| Engines | `packages/engines/**` |
| Database | `packages/database/**` |
| Shared | `packages/shared/**` |

### Adding a New API Route
1. Add route file at `apps/web/app/api/{resource}/route.ts`
2. Export `GET` and/or `POST` named functions
3. Add mock data or DB query
4. Document contract in B-008 table above
5. Connect to UI via `useEffect` fetch

### Adding a New UI Page
1. Create page at `apps/web/app/(client or admin)/{route}/page.tsx`
2. Start with `"use client"` + loading/error skeleton
3. `useEffect` fetch on mount
4. Update layout nav links in `(client)/layout.tsx` or `(admin)/layout.tsx`
5. Add Playwright test in B-024

---

## Running the Project

```bash
# Install
pnpm install

# Setup DB
pnpm db:generate
pnpm db:push
pnpm db:seed

# Dev server
pnpm dev

# Unit tests (engines)
pnpm --filter @repo/engines test

# E2E tests
pnpm --filter web test:e2e
```

---

*Last updated: April 2026 — post B-013 merge.*
