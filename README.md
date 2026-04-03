# RecoveryOS v3 — Financial Recovery Platform

> A regulated financial recovery operating system for Australian consumers in financial stress. This is NOT a simple debt consolidation app — it is a **Hardship Operating System** that triages, stabilises, advocates, refers, and then optimises repayment and recovery.

---

## Overview

RecoveryOS v3 is a Codespaces-ready monorepo that provides a full-stack platform for Australian financial recovery. It is built on Australian regulatory frameworks (NCCP Act, ASIC RG 209, AFCA rules) and provides:

- **Triage Engine** — Assesses crisis level and determines service streams
- **Affordability Engine** — HEM-benchmarked budget assessment
- **Plan Builder Engine** — Generates 3 plan options (survival, balanced, aggressive)
- **Advocacy Engine** — Hardship letter generation and creditor playbooks
- **Referral Engine** — Australian community resource directory
- **Adaptive Engine** — Trigger detection and plan adjustment
- **Compliance Engine** — NCCP/ASIC/AFCA compliance checking

---

## Architecture

```
┌─────────────────────────────────────┐
│         apps/web (Next.js)          │
│   Client UI + Admin UI + API Routes │
└────────────────┬────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌───────▼──────┐
│  packages/   │  │  packages/   │
│   engines    │  │  database    │
│ (core logic) │  │  (Prisma)    │
└───────┬──────┘  └───────┬──────┘
        │                 │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │  packages/      │
        │   shared        │
        │ (types/utils)   │
        └─────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes (monolith) |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Queue/Workers | BullMQ + Redis (stubbed) |
| Auth | NextAuth.js (Auth.js) with RBAC |
| Monorepo | pnpm workspaces + Turborepo |
| Testing | Vitest + Playwright (config only) |

---

## Getting Started (GitHub Codespaces)

1. **Open in Codespaces** — Click "Code" → "Open with Codespaces" on GitHub

2. **Wait for container setup** — The devcontainer will automatically:
   - Install Node 22, pnpm, Prisma CLI, GitHub CLI
   - Start PostgreSQL and Redis services
   - Run `pnpm install`
   - Copy `.env.example` to `.env`

3. **Set up the database**:
   ```bash
   pnpm db:generate
   pnpm db:push
   pnpm db:seed
   ```

4. **Start development**:
   ```bash
   pnpm dev
   ```

5. **Open the app** at `http://localhost:3000`

---

## Local Development

### Prerequisites
- Node 22+
- pnpm 9+
- PostgreSQL 16
- Redis 7

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database/Redis URLs

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with demo data
pnpm db:seed

# Start development server
pnpm dev
```

---

## Project Structure

```
/
├── .devcontainer/          # Codespaces devcontainer config
│   └── devcontainer.json
├── apps/
│   └── web/                # Next.js App Router
│       ├── app/
│       │   ├── (auth)/     # Login, Register
│       │   ├── (client)/   # Client-facing pages
│       │   └── (admin)/    # Admin/case manager pages
│       ├── components/     # Shared UI components
│       └── lib/            # Utilities
├── packages/
│   ├── database/           # Prisma schema + seed
│   ├── engines/            # Core business logic
│   ├── shared/             # Types, constants, utils
│   └── config/             # Shared ESLint/TS config
├── turbo.json
├── pnpm-workspace.yaml
└── .env.example
```

---

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in dev mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed with demo data |
| `pnpm db:studio` | Open Prisma Studio |

---

## Module Descriptions

### `packages/engines`

Core business logic engines:

- **Triage Engine** (`src/triage/`) — Scores hardship inputs and determines crisis level, service streams, and whether human intervention is required
- **Affordability Engine** (`src/affordability/`) — Calculates 3 budget tiers using HEM benchmarks and a 15% behavioural buffer
- **Plan Builder Engine** (`src/plan-builder/`) — Generates survival/balanced/aggressive payment plans with pro-rata, priority, and avalanche strategies
- **Advocacy Engine** (`src/advocacy/`) — Template-based hardship letter generation and creditor playbooks
- **Referral Engine** (`src/referral/`) — Australian community resource directory (NDHL, 1800RESPECT, Gamblers Help, energy ombudsmen, etc.)
- **Adaptive Engine** (`src/adaptive/`) — Trigger detection (missed payments, income changes) and stage transition logic
- **Compliance Engine** (`src/compliance/`) — NCCP/ASIC/AFCA compliance checks

### `packages/database`

Prisma schema with 25+ models covering:
- Users & RBAC (CLIENT, CASE_MANAGER, ADVOCACY_SPECIALIST, COMPLIANCE_OFFICER, ADMIN)
- Full case lifecycle (LEAD → TRIAGE → CRISIS_STABILISATION → ASSESSMENT → PLAN_DESIGN → NEGOTIATING → ACTIVE_RECOVERY → MONITORING → REBUILD → COMPLETED)
- Financial data (debts, income, expenses, budget snapshots)
- Payment plans & ledger
- Negotiations & advocacy
- Referrals & support needs
- Safety flags & crisis events
- Compliance, audit, documents, consent

### `packages/shared`

Shared TypeScript types, constants, and utilities:
- Australian debt types and categories
- Hardship flags (job loss, family violence, gambling, etc.)
- Creditor categories with hardship contact details
- Financial calculation utilities (HEM, payment calculations)

---

## Client Pages

| Route | Description |
|-------|-------------|
| `/` | Landing/triage entry — "What's happening right now?" |
| `/onboarding` | Multi-step onboarding wizard |
| `/dashboard` | Recovery progress dashboard |
| `/debts` | Debt overview and management |
| `/budget` | Income/expense budget builder |
| `/plan` | Plan options selection |
| `/crisis` | Crisis mode — immediate action |

## Admin Pages

| Route | Description |
|-------|-------------|
| `/pipeline` | Case pipeline kanban view |
| `/cases/[id]` | Full case detail view |
| `/triage` | Crisis levels and triage queue |
| `/advocacy` | Creditor negotiations workspace |
| `/referrals` | Referral management |
| `/compliance` | NCCP/AFCA compliance dashboard |

---

## User Roles

| Role | Description |
|------|-------------|
| `CLIENT` | Consumer using the self-serve portal |
| `CASE_MANAGER` | Financial counsellor managing cases |
| `ADVOCACY_SPECIALIST` | Handles creditor negotiations and advocacy |
| `COMPLIANCE_OFFICER` | Reviews compliance and audit |
| `ADMIN` | System administrator |

---

## Immediate Help

If you are in financial stress right now:

- **National Debt Helpline**: 📞 [1800 007 007](tel:1800007007) — Free financial counselling
- **1800RESPECT** (Family Violence): 📞 [1800 737 732](tel:1800737732)
- **Gamblers Help**: 📞 [1800 858 858](tel:1800858858)
- **Emergency**: 📞 [000](tel:000)

---

## License

Private — RecoveryOS v3 is a proprietary platform.