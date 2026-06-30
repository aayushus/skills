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
- **Design System**: [e.g., existing component library / Prism if installed / project CSS system]

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

### Input validation
- Validate 100% of inputs at all system boundaries (HTTP, queue, file upload) using a schema validator (e.g., Zod, Pydantic) with strict/no-extra-keys mode.
- All strings must have a max length — prevents DoS.

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

---

## When to read optional full guidelines

| Task | File to read |
|---|---|
| New service, module extraction, DB schema | If installed: `docs/guidelines/Architecture.md` |
| Auth, file upload, AI integration, external API | If installed: `docs/guidelines/Security.md` |
| Tests, refactoring, PR review | If installed: `docs/guidelines/Code-Quality.md` |
| Performance, caching, queries | If installed: `docs/guidelines/Performance.md` |
| ADRs, READMEs, API docs | If installed: `docs/guidelines/Documentation.md` |
| Any UI work | If installed: `src/design/SKILL.md` or `design/SKILL.md`; otherwise use the existing project UI system |

---

## Decisions already made — don't re-open
<!-- CUSTOMIZE: Replace with your project's actual closed decisions. Remove entries that haven't been decided yet. -->
- **DB**: [e.g., Prisma + PostgreSQL / Drizzle + SQLite]
- **Queue**: [e.g., BullMQ on Redis / Celery on RabbitMQ / none]
- **Sessions**: [e.g., opaque tokens in Redis / database sessions / JWTs]
- **Search**: [e.g., PostgreSQL FTS / Typesense / Elasticsearch]
- **API style**: [e.g., REST + JSON / GraphQL / tRPC]
- **Passwords**: [e.g., Argon2id / bcrypt cost 12]
- **IDs**: [e.g., ULIDs / UUID v4 / auto-increment]
- **Deployment**: [e.g., Fly.io / Railway / ECS / K8s]
