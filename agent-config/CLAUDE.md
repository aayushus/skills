# Project rules for Claude Code

> [!IMPORTANT]
> **CUSTOMIZATION NOTICE**: This file contains generic best-practice rules. Update the Stack, Hard Rules, and Decisions sections to reflect your project's actual technology choices before committing.

## Optional installed materials
<!-- CUSTOMIZE: Update paths to match the components installed in this project -->
- **Design system**: If `src/design/SKILL.md` or `design/SKILL.md` exists, load it before building UI. If neither exists, follow the project's existing UI conventions.
- **Engineering guidelines**: If `docs/guidelines/` exists, read the relevant file before architectural, security-sensitive, performance, testing, or documentation work. If it is absent, rely on the local stack and rules in this file.

## Stack
<!-- CUSTOMIZE: Replace with your project's actual stack -->
- **Frontend/Backend**: [e.g., Next.js 14 App Router, React + Vite, Express, FastAPI]
- **ORM / Query layer**: [e.g., Drizzle ORM, Prisma, SQLAlchemy, raw SQL]
- **Primary Database**: [e.g., PostgreSQL, SQLite, MySQL]
- **Async Queue**: [e.g., BullMQ, Celery, None/Direct Background Streaming]
- **Session Store**: [e.g., Redis, database-backed sessions, JWTs]
- **API Style**: [e.g., REST + JSON / GraphQL / tRPC]
- **Design System**: [e.g., existing component library / Prism if installed / project CSS system]
- **Testing / QA**: [e.g., Unit + integration + E2E smoke tests / Unit + integration / Manual QA]
- **CI Quality Gates**: [e.g., Typecheck + lint + tests on every PR / Typecheck + unit tests / Existing CI only]

---

## Hard rules — never ask, always follow

### Data integrity
<!-- CUSTOMIZE: Adjust tenancy rules to match your data model (multi-tenant vs single-tenant) -->
- **Tenancy**: If multi-tenant, every query on tenant data MUST filter by `tenantId` — never derive it from URL params or request body, only from the authenticated session. If single-tenant, ignore tenant constraints.
- **Raw queries**: Prefer parameterized ORM methods. Never concatenate raw SQL — use parameterized queries or tagged template literals only.
- **Deletes**: Default to soft deletes (`deletedAt` timestamp) for business-critical data; avoid hard deletion unless explicitly requested.
- **Primary keys**: Align with the project database design (e.g., ULIDs, UUIDs, or auto-incrementing integers — pick one and be consistent).
- **Pagination**: Prefer cursor-based pagination over offset/limit for large or frequently-updated datasets.
- **Unauthorized reads**: Return 404, not 403.

### Auth & secrets
<!-- CUSTOMIZE: Replace with the hashing algorithm and session strategy your project uses -->
- **Passwords**: Use a secure modern hashing algorithm (e.g., Argon2id, bcrypt with cost ≥ 12) — never MD5 or SHA-1.
- **Sessions**: Prefer server-side opaque session tokens over JWTs for user sessions where revocability matters.
- **Secrets**: Store in a secrets manager (e.g., environment variables, Doppler, AWS Secrets Manager) — never in code, never logged.
- **Session rotation**: Rotate session tokens on login, logout, MFA events, and role changes.

### Input validation & AI security
- Validate 100% of inputs at all system boundaries (HTTP, queue, file upload) using a schema validator (e.g., Zod, Pydantic) with strict/no-extra-keys mode.
- All strings must have a max length — prevents DoS.
- Never execute raw LLM-generated code or SQL directly without strict validation; scrub PII before calling external model providers.

### Async & queuing
<!-- CUSTOMIZE: Replace BullMQ with your project's queue technology -->
- Any operation taking > 1 second must run asynchronously in a background worker — never block an HTTP handler.
- Every network call must have a timeout configured (e.g., 10s internal, 5s fast external, 30s slow, 60s AI).
- Retry only on 5xx and network errors — never on 4xx.
- Ensure background tasks are idempotent and have a maximum retry count with exponential backoff.

### Logging & observability
- Structured JSON logs only — include `correlationId`, `userId`, and a `timestamp` on every line.
- Never log secrets, tokens, or PII.
- Audit logs are append-only — never UPDATE or DELETE audit records.

### Code quality
- TypeScript: `strict: true` + `noUncheckedIndexedAccess` — never use `any`, use `unknown` with narrowing.
- Avoid N+1 queries — use eager loading (`include`/`select`) or batch fetches.
- Error handling: throw for unexpected/programming errors; return a Result/Either type for expected business-logic failures.
- No `console.log` in production paths — use the structured logger.

### Testing & QA
- Follow the project's selected testing / QA approach from the Stack section.
- Add or update tests for changed behavior whenever an adjacent test pattern exists.
- Run the narrowest relevant validation first, then broader checks when confidence is needed.
- If QA is manual or not yet configured, call that out explicitly rather than pretending coverage exists.

---

## When to read optional full guidelines

| Task | File to read |
|---|---|
| Service boundaries, domain modules, topology | If installed: `docs/guidelines/architecture/service-topology.md` |
| Database schema, migrations, tenancy isolation | If installed: `docs/guidelines/architecture/database-and-tenancy.md` |
| Background jobs, queue reliability, retries | If installed: `docs/guidelines/architecture/async-and-queues.md` |
| Auth, session lifecycle, RBAC permissions | If installed: `docs/guidelines/security/auth-and-sessions.md` |
| Input validation, sanitization, injection defense | If installed: `docs/guidelines/security/input-validation.md` |
| Secrets management, crypto, token generation | If installed: `docs/guidelines/security/secrets-and-crypto.md` |
| AI security, prompt injection, PII scrubbing | If installed: `docs/guidelines/security/ai-security.md` |
| REST API endpoints, JSON envelopes, rate limiting | If installed: `docs/guidelines/api/api-contracts.md` |
| Webhook delivery, signing, idempotency keys | If installed: `docs/guidelines/api/webhooks-and-events.md` |
| Unit & integration test strategy, mocking, DB isolation | If installed: `docs/guidelines/testing/testing-strategy.md` |
| E2E browser flows, AI evaluation sets | If installed: `docs/guidelines/testing/e2e-and-ai-testing.md` |
| TypeScript conventions, Result error types, limits | If installed: `docs/guidelines/quality-performance/code-standards.md` |
| Latency budgets, caching layers, bundle limits | If installed: `docs/guidelines/quality-performance/performance-budgets.md` |
| Structured JSON logging, correlation IDs, tracing | If installed: `docs/guidelines/quality-performance/observability.md` |
| Production incidents, severity levels, post-mortems | If installed: `docs/guidelines/operations/incident-response.md` |
| Git workflow, PR sizing (<300 lines), feature flags | If installed: `docs/guidelines/operations/git-and-release.md` |
| ADRs, READMEs, changelog standards | If installed: `docs/guidelines/operations/documentation-and-adrs.md` |
| Docker Compose, container standards | If installed: `docs/guidelines/operations/container-standards.md` |
| AI workflow, model escalation tiers, context discipline | If installed: `docs/guidelines/operations/ai-workflow.md` |
| Product planning, PRDs, user stories, acceptance criteria | If installed: `docs/pm/SKILL.md` |
| Codebase knowledge graph, GraphRAG, file relationships | If installed: `skills/graphify/SKILL.md` or check `graphify-out/graph.json` |
| Any UI work | If installed: `src/design/SKILL.md` or `design/SKILL.md`; otherwise use the existing project UI system |

---

## Decisions already made — don't re-open
<!-- CUSTOMIZE: Replace with your project's actual closed decisions. Remove entries that haven't been decided yet. -->
- **DB**: [e.g., Prisma + PostgreSQL / Drizzle + SQLite]
- **Queue**: [e.g., BullMQ on Redis / Celery on RabbitMQ / none]
- **Sessions**: [e.g., opaque tokens in Redis / database sessions / JWTs]
- **Search**: [e.g., PostgreSQL FTS / Typesense / Elasticsearch]
- **API style**: [e.g., REST + JSON / GraphQL / tRPC]
- **Testing / QA**: [e.g., Unit + integration + E2E smoke tests / Unit + integration / Manual QA]
- **CI gates**: [e.g., Typecheck + lint + tests on every PR / Typecheck + unit tests / Existing CI only]
- **Passwords**: [e.g., Argon2id / bcrypt cost 12]
- **IDs**: [e.g., ULIDs / UUID v4 / auto-increment]
- **Deployment**: [e.g., Fly.io / Railway / ECS / K8s]
