# Codebase rules — read before every response

## Stack
TypeScript (strict) + Node.js + Express + Prisma + PostgreSQL + Redis + BullMQ.
AI service: Python 3.12 + FastAPI (separate process).
Frontend: Next.js + React.
Design system: Prism (tokens.css + components.tsx — see design/ skill folder).

---

## HARD RULES — never violate these

### Data & multi-tenancy (existential)
- Every Prisma query that touches tenant data MUST filter by `tenantId` — enforced by middleware, but always verify
- Never use `$queryRaw` or `$executeRaw` unless explicitly reviewed — use parameterised Prisma queries only
- Shared database, shared schema, `tenantId` column — never schema-per-tenant
- Soft deletes only — never hard-delete tenant data (`deletedAt` timestamp)
- No `ON DELETE CASCADE` on tenant-scoped tables
- Unauthorised reads return 404, not 403 — prevents existence leak
- `tenantId` comes from the session, never from URL params or request body

### IDs & pagination
- ULIDs for all primary keys — not auto-increment integers, not UUIDs
- Cursor-based pagination only — never offset/limit on large tables
- Max page size: 100 items, default: 25

### Async & queuing
- Any operation > 1 second must be async via BullMQ — never block an HTTP handler
- Only queue: BullMQ on Redis — not Kafka, SQS, RabbitMQ
- Use outbox pattern for events (write to DB first, worker publishes) — never `queue.add()` directly from HTTP handlers
- Idempotency keys on every mutation that has external side effects
- Every async job: 5 retries max, exponential backoff (2s base), idempotent

### Network & timeouts
- Every network call has a timeout: 10s (internal HTTP), 5s (fast external APIs), 30s (slow), 60s (AI — async only)
- Retries only on 5xx and network errors — NEVER retry 4xx
- Circuit breaker: open after 5 failures in 10s, stay open 30s

### Auth & security
- Passwords: Argon2id only (`time=3, memory=64MB, parallelism=4`) — never bcrypt, never MD5, never SHA-1
- API keys: Argon2id hashed before storage, displayed once only
- Sessions: opaque 256-bit random tokens stored in Redis — NOT JWTs for user sessions
- Session rotation on: login, logout, MFA completion, role change
- Password reset does NOT log the user in — they re-authenticate after
- Never reveal whether an email exists — always respond `200 RESET_EMAIL_SENT_IF_EXISTS`
- Failed logins: lock account after 10 failures, rate-limit 5/hour per account
- MFA required for `owner` and `admin` roles (TOTP, RFC 6238)
- Role changes require dedicated endpoint — never via generic PATCH, user cannot change own role
- Admin impersonation TTL: 1 hour max

### Input & output
- Validate every input at every boundary with Zod (TypeScript) or Pydantic `.strict()` (Python)
- All strings must have max length — prevents DoS
- File uploads: magic-number type validation, ClamAV virus scan, re-encode images (strips EXIF), store on object storage only (signed URLs)
- Never use `dangerouslySetInnerHTML` without DOMPurify + explicit code-review tag
- AI output: validate with Zod schema before use, never trust for authorisation decisions
- SSRF: DNS-resolve before fetching, reject private IPs

### Secrets & config
- All secrets in Doppler or AWS Secrets Manager — never in code, never in `.env` files committed to git
- One place reads `process.env`: `shared/config.ts` with Zod schema — nowhere else
- No secrets in logs, errors, or API responses
- Secrets rotated quarterly — dual-key rotation window

### Logging & observability
- Structured JSON logs only — required fields: `timestamp`, `level`, `service`, `correlationId`, `tenantId`, `userId`, `message`
- Correlation ID propagates through all logs, queue jobs, cross-service calls, and audit entries
- Audit log is append-only — 7-year retention, no UPDATE/DELETE at DB role level
- Every route emits: `http_requests_total`, `http_request_duration_seconds`

### API design
- REST + JSON — no GraphQL unless multiple first-party clients with wildly different data needs
- URL versioning: `/api/v1/`, `/api/v2/` — not header-based
- Standard error envelope: `{ code, message, correlationId, details }`
- Rate limits: 100 req/60s per user (default), 5/60s for login and password-reset

---

## CODE QUALITY RULES

- TypeScript `strict: true` + `noUncheckedIndexedAccess` + `noImplicitOverride` — no exceptions
- Never use `any` — use `unknown` with type narrowing
- Never use TypeScript `enum` — use string literal unions or `as const` objects
- Functions ≤ 80 lines (aim ≤ 30), files ≤ 500 lines (aim ≤ 300)
- No `console.log` — use the structured logger
- No commented-out code — delete it or put it in a ticket
- Boolean variables: `is/has/can/should` prefix
- No N+1 queries — always use Prisma `include/select` or a JOIN
- Error handling: throw exceptions for programming errors, return Result types for expected failures (validation, not-found, rate-limit)
- Async/await always — never raw `.then()` chains
- PR size: ≤ 400 lines unless generated code — split larger changes

---

## PERFORMANCE BUDGETS (hard caps)

| Interaction | Target |
|---|---|
| UI response (click, hover) | ≤ 100ms |
| API read (cached, single) | p95 < 200ms |
| API read (list, paginated) | p95 < 300ms |
| API write | p95 < 300ms |
| LCP | ≤ 2.5s (p75) |
| INP | ≤ 200ms (p75) |
| CLS | ≤ 0.1 (p75) |
| JS bundle (gzipped) | ≤ 170KB |
| CSS bundle (gzipped) | ≤ 30KB |
| DB query (indexed lookup) | ≤ 10ms |
| DB query (list with joins) | ≤ 200ms |

---

## PRISM DESIGN SYSTEM RULES

- Never hardcode colours, radii, or font names — use CSS tokens (`var(--token-name)`)
- Never use pure `#000` or `#fff` as text — use `rgb(55, 53, 47)` (off-black) via `var(--text-default)`
- Three colour layers: neutrals (90% of pixels), product accent (`--accent`), AI gradient (`--ai-grad`) — never mix them
- Sparkle star is the ONLY AI glyph — no robots, brains, lightbulbs, or wands
- Never import Tailwind, Radix defaults, or shadcn themes — use components.tsx from the design system
- Touch targets: 44×44px minimum on mobile
- Never use `font-size` < 16px on mobile inputs — iOS Safari zooms on focus
- Dark mode: use `[data-theme="dark"]` selector overrides — never `@media (prefers-color-scheme: dark)` in component CSS
- Every component must work in light AND dark mode
- Spacing: multiples of 4px only — allowed values: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64

---

## WHEN TO CHECK FULL DOCS

Full guidelines live in the Skills folder. Load them when:

| Situation | Read |
|---|---|
| Building any UI component or screen | `design/SKILL.md` → then the relevant `patterns-*.md` |
| Adding auth, tenant logic, or a new service | `guidelines/architecture-guidelines.md` |
| Adding file upload, external API, or AI feature | `guidelines/security-guidelines.md` |
| Writing tests or refactoring | `guidelines/code-quality-guidelines.md` |
| Slow queries, caching, bundle size | `guidelines/performance-guidelines.md` |
| Writing an ADR or README | `guidelines/documentation-guidelines.md` |
| Building a new component from scratch | `design/implementation-guide.md` |

---

## ARCHITECTURE DECISIONS ALREADY MADE (don't re-litigate)

| Decision | Choice | Reason |
|---|---|---|
| DB access | Prisma only | Parameterised by default, tenant middleware |
| Queue | BullMQ on Redis | Single system, battle-tested at this scale |
| Sessions | Opaque tokens in Redis | Revocable, no JWT signature key management |
| Search | PostgreSQL FTS | Sufficient to 100k users; extract to Typesense at scale |
| DB topology | Shared Postgres, tenant_id column | Schema-per-tenant impossible at scale for migrations |
| API style | REST + JSON | Debuggable, works across Node + Python |
| Passwords | Argon2id | bcrypt is deprecated for this use case |
| Deployment | Fly Machines (preferred) → ECS → K8s (only with SRE) | Operational complexity ladder |
