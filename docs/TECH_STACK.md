# Epitrello Technical Stack

This document explains the main technologies used in Epitrello, **why we chose them**, their **advantages**, and how they fit together.

## Overview

- **Architecture**: Full-stack web application (API + SPA) with a shared PostgreSQL database.
- **Backend**: NestJS GraphQL API with Prisma and PostgreSQL.
- **Frontend**: Next.js (App Router) React application.
- **Infrastructure**: Docker for local dev, Terraform + GCP (Cloud Run, Cloud SQL, Cloud Storage, Secret Manager) for staging.
- **CI/CD**: GitHub Actions for tests, quality checks, infrastructure, and deployment.

---

## Backend

### Why we chose these technologies

| Technology | Why we chose it | Main advantages |
| ---------- | -----------------|------------------|
| **TypeScript** | Same language as the frontend, strong typing reduces bugs and improves refactoring. | Type safety, better IDE support, self-documenting code, fewer runtime errors. |
| **NestJS** | Structured, modular backend with dependency injection; excellent fit for GraphQL and large teams. | Clear architecture, built-in support for guards/pipes/interceptors, easy to test and scale. |
| **GraphQL (Apollo)** | Frontend can request exactly the data it needs (boards, lists, cards, nested relations) in one call; real-time via subscriptions. | Less over/under-fetching than REST, single endpoint, schema as contract, subscriptions for live updates. |
| **Prisma** | Type-safe ORM with a single schema file, migrations, and great DX. | Type-safe queries, automatic migrations, Prisma Studio, no raw SQL for most use cases. |
| **PostgreSQL** | Robust relational DB; relations (users, boards, lists, cards, members) map naturally. | ACID, JSON support, mature ecosystem, Cloud SQL for managed hosting. |
| **JWT + Passport** | Stateless auth for API and SPA; Passport integrates many OAuth providers with little boilerplate. | No server-side sessions, works well with Cloud Run; Google/Microsoft/Slack login out of the box. |
| **class-validator / class-transformer** | Declarative validation on DTOs; aligns with NestJS and GraphQL inputs. | Consistent validation, less manual checks, clear error messages. |

### Stack summary

- **Language**: TypeScript
- **Framework**: NestJS
- **API**: GraphQL (Apollo Server)
- **ORM**: Prisma
- **Database**: PostgreSQL (Cloud SQL in staging, Docker in local)
- **Auth**:
  - JWT-based authentication
  - OAuth providers (Google, Microsoft, Slack, …) via Passport strategies
- **Validation & DTOs**:
  - `class-validator` and `class-transformer` for input validation
  - DTOs and GraphQL types generated/defined in `backend/src`
- **Modules (non-exhaustive)**:
  - `auth`, `users`, `workspaces`, `invitations`
  - `boards`, `lists`, `cards`, `labels`, `checklists`, `comments`, `attachments`
  - `activity`, `notifications`, `email`, `upload`
- **Database access**:
  - `PrismaService` exposes the Prisma client to modules
  - Migrations managed with Prisma (`prisma migrate`)

For details, see:
- `backend/README.md`
- `backend/ARCHITECTURE.md`

---

## Frontend

### Why we chose these technologies

| Technology | Why we chose it | Main advantages |
| ---------- | -----------------|------------------|
| **Next.js (App Router)** | Full-stack React framework with file-based routing, server components, and simple deployment. | SEO-friendly, fast navigation, API routes if needed, good defaults and ecosystem. |
| **React** | Component-based UI; large ecosystem and team familiarity. | Reusable components, rich ecosystem, predictable updates with state. |
| **TypeScript** | Same as backend: type safety and better DX across the stack. | Fewer bugs, better refactoring, shared types with GraphQL codegen possible. |
| **Tailwind CSS** | Utility-first CSS without leaving the markup; fast to build consistent UIs. | No context switching, small bundle with purging, responsive and theming built-in. |
| **shadcn/ui** | High-quality, accessible component library built on Radix UI + Tailwind; code lives in the repo (copy-paste, not a black-box dependency). | Accessible (a11y) out of the box, customizable (we own the components in `components/ui/`), consistent design system, Dialog/Dropdown/Select/Toast etc. without reinventing the wheel. |
| **Radix UI** | Primitives under shadcn/ui: unstyled, accessible, keyboard and focus management. | WAI-ARIA compliant, composable, headless so we style with Tailwind. |
| **Playwright** | Modern E2E runner for browsers; reliable and fast. | Cross-browser, auto-wait, good debugging, integrates with CI. |

### Stack summary

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: React, Tailwind CSS, **shadcn/ui** (Radix UI primitives in `frontend/components/ui/`)
- **State & data fetching**: GraphQL API at `NEXT_PUBLIC_API_URL`, env in `frontend/.env.local`
- **Features**: Board / list / card UI (Trello-like), auth flows, E2E with Playwright (`frontend/e2e`)

For details, see:
- `frontend/README.md`

---

## Database & Data Model

### Why we chose PostgreSQL

| Aspect | Why we chose it | Main advantages |
| ------ | -----------------|------------------|
| **PostgreSQL** | Relational model fits workspaces, boards, lists, cards, members, and permissions. | ACID, strong consistency, JSON/JSONB for flexible fields, full-text search, mature and reliable. |
| **Prisma schema** | Single source of truth for schema and migrations; works the same locally and on Cloud SQL. | Versioned migrations, type-safe client, easy to evolve the model. |
| **Cloud SQL (staging)** | Managed PostgreSQL on GCP; same provider as Cloud Run and Terraform. | Backups, high availability, no DB server to maintain, private networking possible. |

### Stack summary

- **Engine**: PostgreSQL (Docker locally, Cloud SQL in staging)
- **Schema**: Prisma (`backend/prisma/schema.prisma`)
- **Key entities**: `User`, `Workspace`, `Board`, `List`, `Card`, `Comment`, `Attachment`, `Label`, `Checklist`, `Notification`; junction tables (`BoardMember`, `WorkspaceMember`, `CardAssignee`, `CardLabel`)

Migrations: `pnpm prisma migrate dev` (local), `prisma migrate deploy` (staging).

---

## Infrastructure (Terraform + GCP)

### Why we chose Terraform and GCP

| Technology | Why we chose it | Main advantages |
| ---------- | -----------------|------------------|
| **Terraform** | Infrastructure as Code: same config for staging (and future envs); reviewable in Git. | Reproducible, no manual clicks, drift detection, shared modules (cloud-run, cloud-sql, etc.). |
| **GCP** | One cloud for app, DB, storage, and CI; good fit for Node/containers. | Cloud Run scales to zero, Cloud SQL managed DB, GCS for files, Secret Manager for secrets. |
| **Cloud Run** | Run backend and frontend as containers without managing VMs or clusters. | Pay per request, auto-scaling, HTTPS by default, simple deploy from Docker. |
| **Cloud SQL** | Managed PostgreSQL; Terraform creates instance and DB. | Backups, patches, high availability; private IP option. |
| **Cloud Storage** | Store uploaded files and static docs (e.g. GraphQL docs). | Durable, signed URLs, versioning, low cost. |
| **Secret Manager** | Store DB password, JWT secret, API keys; inject into Cloud Run. | No secrets in code or env files, rotation and audit. |
| **Workload Identity Federation** | GitHub Actions authenticates to GCP without long-lived keys. | Keyless auth, no key rotation, least-privilege per repo. |

### What Terraform manages

- **Cloud Run**: Backend (NestJS), Frontend (Next.js)
- **Cloud SQL**: PostgreSQL instance, DB, user, networking
- **Cloud Storage**: Upload buckets, docs bucket
- **Secret Manager**: DB credentials, JWT, Resend, OAuth
- **Networking**: VPC, connectors for Cloud SQL
- **Service accounts**: Cloud Run and CI/CD (via `terraform-wif/`)

For a detailed view, see `terraform/README.md`.

---

## CI/CD (GitHub Actions)

### Why we chose GitHub Actions

| Aspect | Why we chose it | Main advantages |
| ------ | -----------------|------------------|
| **GitHub Actions** | Already where the code lives; no separate CI product to pay or configure. | Integrated with PRs and branches, free for public repos, large marketplace of actions. |
| **Modular workflows** | Separate workflows for backend, frontend, deploy, DB, quality. | Run only what changed (path filters), clear ownership, easier to debug. |
| **Terraform in CI** | Apply infra from the same repo; state in GCS. | Consistent staging env, no manual apply, audit trail. |
| **Workload Identity** | No GCP keys in GitHub secrets. | Safer, no key rotation, recommended by GCP. |

### Workflows summary

- **`backend-ci.yml`**: Lint, build, unit tests (coverage), integration tests
- **`frontend-ci.yml`**: Lint, type-check, build, E2E (Playwright)
- **`deploy.yml`**: Change detection, Trivy, Terraform plan/apply, Docker build & deploy to Cloud Run, smoke tests
- **`code-quality.yml`**: Prisma validate, CodeQL, dependency review
- **`database-migrations.yml`**: Apply Prisma migrations on staging
- **`cleanup-cost-management.yml`**: Cleanup and cost reporting

More details: `.github/workflows/README.md`.

---

## Local Development Tooling

### Why we chose these tools

| Tool | Why we chose it | Main advantages |
| -----|-----------------|------------------|
| **Node.js 20+** | LTS, native fetch, same runtime as production. | Stable, good performance, aligned with Cloud Run. |
| **pnpm** | Fast installs, strict dependency tree, less disk usage. | Speed, monorepo-friendly, fewer phantom dependencies. |
| **Docker / Compose** | Same DB and services locally as in docs and CI. | Reproducible dev env, no local PostgreSQL install required. |
| **Jest** | Standard for Node/TypeScript; integrates with NestJS. | Unit + integration + E2E, coverage, mocks. |
| **Playwright** | Reliable E2E for the frontend; modern API. | Cross-browser, stable selectors, good CI integration. |
| **ESLint + Prettier** | Consistent style and fewer bugs; TypeScript support. | Auto-fix, shared config, better code review. |

### Summary

- **Runtime**: Node.js 20+, pnpm
- **Local stack**: Docker Compose (PostgreSQL, backend, frontend); scripts and Makefile (`make docker-start`, `make dev-backend`, `make dev-frontend`)
- **Testing**: Jest (backend), Playwright (frontend E2E)
- **Quality**: ESLint, Prettier, TypeScript

See the root `README.md` and the backend/frontend READMEs for command examples.

