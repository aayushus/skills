# GitHub Copilot workspace instructions

This codebase uses project-specific conventions with hard rules that must never be broken.
Always follow these. When in doubt, check installed project docs such as `docs/guidelines/` if they exist.

## Stack
<!-- CUSTOMIZE: Replace this section with your project's actual stack -->
- **Frontend/Backend**: [e.g., Next.js 14 App Router, React + Vite, Express, FastAPI]
- **ORM / Query layer**: [e.g., Drizzle ORM, Prisma, SQLAlchemy, raw SQL]
- **Primary Database**: [e.g., PostgreSQL, SQLite, MySQL]
- **Async Queue**: [e.g., BullMQ, Celery, None/Direct Background Streaming]
- **Session Store**: [e.g., Redis, database-backed sessions, JWTs]
- **API style**: [e.g., REST + JSON / GraphQL / tRPC]
- **Testing / QA**: [e.g., Unit + integration + E2E smoke tests / Unit + integration / Manual QA]
- **CI Quality Gates**: [e.g., Typecheck + lint + tests on every PR / Typecheck + unit tests / Existing CI only]

## Critical rules (catastrophic if missed)

<!-- CUSTOMIZE: Adjust tenancy rules to match your data model (multi-tenant vs single-tenant) -->
1. **Tenancy boundaries** — if multi-tenant, every query on tenant data filters by `tenantId`; if single-tenant, ignore tenant constraints
2. **No raw SQL concatenation** — use parameterized ORM/query-builder calls; raw SQL requires explicit review
3. **Tenant identity comes from auth context** — never from URL params or request body
4. **Unauthorized reads return 404** — never 403 (prevents existence leak)
5. **Soft deletes for recoverable business data** — avoid hard deletes unless the domain explicitly requires them
6. **Consistent primary keys** — use the project's chosen ID strategy everywhere
7. **Cursor pagination only** — never offset/limit
8. **Async anything > 1 second** — use the project's background queue/worker strategy, never block an HTTP handler
9. **Modern password hashing** — use Argon2id, bcrypt cost ≥ 12, or the platform-approved equivalent
10. **Revocable user sessions** — prefer server-side session storage where revocation matters
11. **Schema validation on every input boundary** — strict/no-extra-keys mode, including max lengths
12. **Structured logs only** — include request/correlation IDs and tenant IDs where applicable
13. **Secrets in a secrets manager or environment** — never in code, never logged
14. **No unsafe dynamic typing** — use `unknown` with narrowing in TypeScript instead of `any`
15. **No N+1 queries** — batch, join, preload, or select related data intentionally

## Design system rules
- If `src/design/SKILL.md` or `design/SKILL.md` exists, load it before UI work
- If no design skill exists, follow the project's existing component library and styles
- Do not introduce Tailwind, shadcn, Material UI, or another visual system unless the project already uses it or the user explicitly asks
- Prefer project tokens for colours, radii, spacing, and font names when tokens exist
- Touch targets: 44×44px minimum on mobile

## Error handling
- Throw exceptions for programming errors (bugs)
- Return Result types for expected failures (validation, not-found, rate-limit)
- Never silence errors — always log or rethrow

## Code style
- TypeScript `strict: true` + `noUncheckedIndexedAccess`
- Functions ≤ 80 lines, files ≤ 500 lines
- No ad-hoc `console.log` debugging — use the project logger
- No commented-out code — delete it
- Boolean variables: `is/has/can/should` prefix
- No TypeScript `enum` — use string literal unions

## Testing and QA
- Follow the project's selected testing / QA approach from the Stack section
- Add or update tests for changed behavior when adjacent test patterns exist
- Run the narrowest relevant validation first, then broader checks when confidence is needed
- If QA is manual or not yet configured, say so explicitly

## Performance hard caps
- UI response: ≤ 100ms | API p95: < 300ms | DB indexed lookup: ≤ 10ms
- JS bundle gzipped: ≤ 170KB | CSS gzipped: ≤ 30KB
- LCP: ≤ 2.5s | INP: ≤ 200ms | CLS: ≤ 0.1
