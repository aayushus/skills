# Project rules for Claude Code

## Skills to load
This project uses two Claude Code skills. Load them at the start of relevant tasks:

- **Design system**: `@prism-design` — load when building any UI, component, screen, or styling
- **Architecture + guidelines**: read the relevant file from `04_Resources/Skills/guidelines/` when making architectural decisions, writing security-sensitive code, or optimising performance

## Hard rules (never ask — always follow these)

### Data integrity
- Every Prisma query on tenant data must filter by `tenantId` (middleware enforces it, but verify)
- No raw SQL concatenation — `$queryRaw` with tagged templates only, requires ticket to replace
- Soft deletes only — `deletedAt`, never hard DELETE on tenant data
- ULIDs for all primary keys — not auto-increment, not UUID
- Cursor-based pagination only — no offset/limit
- `tenantId` always comes from the session — never from URL params or request body
- Unauthorized reads return 404, not 403

### Auth & secrets
- Argon2id for passwords (`time=3, memory=64MB, parallelism=4`) — never bcrypt
- Opaque session tokens in Redis — not JWTs for user sessions
- Secrets in Doppler or AWS Secrets Manager — never in code, never logged
- Session rotation on: login, logout, MFA, role change

### Input validation
- Zod validation with `.strict()` on every input boundary (HTTP, queue, file upload)
- All strings have max length — prevents DoS

### Async & queuing
- Any work > 1 second uses BullMQ — never block an HTTP handler
- Outbox pattern for events — never `queue.add()` directly from HTTP handlers
- Every network call has a timeout (10s internal, 5s fast external, 30s slow, 60s AI)
- Retries only on 5xx and network errors — never on 4xx

### Logging & observability
- Structured JSON logs only — `correlationId` + `tenantId` + `userId` on every line
- No secrets in logs
- Audit log is append-only — never UPDATE/DELETE audit records

### Code quality
- TypeScript `strict: true` + `noUncheckedIndexedAccess`
- Never use `any` — use `unknown` with narrowing
- No N+1 queries — use Prisma `include/select`
- Error handling: throw for programming errors, return Result type for expected failures
- No `console.log` — use the structured logger

## When to read full guidelines

| Task | File to read |
|---|---|
| New service, module extraction, DB schema | `guidelines/architecture-guidelines.md` |
| Auth, file upload, AI integration, external API | `guidelines/security-guidelines.md` |
| Tests, refactoring, PR review | `guidelines/code-quality-guidelines.md` |
| Performance, caching, queries | `guidelines/performance-guidelines.md` |
| ADRs, READMEs, API docs | `guidelines/documentation-guidelines.md` |
| Any UI work | Load `@prism-design` skill |

## Decisions already made — don't re-open

- DB: Prisma + shared Postgres + `tenantId` column (not schema-per-tenant)
- Queue: BullMQ on Redis (not Kafka, SQS, or RabbitMQ)
- Sessions: opaque tokens in Redis (not JWTs)
- Search: PostgreSQL FTS (until 100k users, then Typesense)
- API: REST + JSON (not GraphQL)
- Passwords: Argon2id (bcrypt is deprecated for this use case)
- IDs: ULIDs (not auto-increment, not UUID v4)
- Deployment: Fly Machines → ECS → K8s only with dedicated SRE
