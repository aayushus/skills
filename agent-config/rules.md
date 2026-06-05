# Codebase rules — read before every response

> [!IMPORTANT]
> **CUSTOMIZATION NOTICE**: This rules file contains guidelines for development. Update the Stack and Hard Rules sections in your local project rules file to match your project's actual stack.

## Stack
<!-- CUSTOMIZE: Replace this section with your project's actual stack -->
- **Frontend/Backend**: [e.g., Next.js 14 App Router, React + Vite, Express, FastAPI]
- **Database/ORM**: [e.g., Drizzle ORM, Prisma, SQLAlchemy]
- **Primary Database**: [e.g., PostgreSQL, SQLite, MySQL]
- **Async Queue**: [e.g., BullMQ, Celery, None/Direct Background Streaming]
- **Design System**: Prism (tokens.css + components.tsx)

---

## HARD RULES — never violate these

### Data & Tenancy (Database Rules)
- **Tenancy**: If the project is multi-tenant, every database query touching tenant data MUST filter by `tenantId` (typically enforced via query middleware/middleware helpers). If single-tenant, ignore tenant constraints.
- **ORM & Raw Queries**: Prefer parameterized query builder/ORM methods. Never use raw SQL statements unless parameterized, type-safe, and explicitly reviewed.
- **Deletes**: Default to soft deletes (`deletedAt` timestamp) for business-critical data; avoid hard deletion unless explicitly requested.
- **Primary Keys**: Align with the project database design (e.g., ULIDs for distributed/multi-tenant systems, UUIDs, or Serial Auto-Incrementing Integers for standard/monolithic tables).

### Async & Queuing
- **Long-Running Operations**: Any operation taking > 1 second should run asynchronously in a background worker (e.g., BullMQ, Celery, or background threads depending on the stack) so the main HTTP thread remains responsive.
- **Reliability**: Ensure background tasks have maximum retries (e.g., 5 retries with exponential backoff) and are designed to be idempotent.

### Network & Timeouts
- **Timeouts**: Every external network call must have a timeout configured (e.g., 10s for internal services, 5s for fast APIs, 30s-60s for slow/AI APIs).
- **Retries**: Retry only on 5xx server errors and network dropouts. Never retry client-side 4xx errors.

### Auth & Security
- **Passwords & Hashing**: Use secure modern hashing algorithms (e.g., Argon2id or equivalent standard platform hashing library) for passwords and API keys.
- **Sessions**: Prefer secure session storage (e.g., server-side session stores) over JWTs for user sessions where revocability is needed.
- **Input Validation**: Validate 100% of inputs at all system boundaries using schema validators (e.g., Zod, Pydantic) with strict checks.

### Observability & Logging
- **Structured Logs**: Use structured JSON logging output containing standard metadata (`timestamp`, `level`, `correlationId`, `message`).
- **Correlation**: Propagate correlation IDs across system boundaries (HTTP request, queue worker, database query).

---

## CODE QUALITY RULES

- **Type Safety**: Enforce strict type checking in your language of choice (e.g., `strict: true` and `noUncheckedIndexedAccess` in TypeScript).
- **Narrowing**: Never bypass type safety with `any` — use `unknown` or union type narrowing.
- **Readability**: Keep functions concise (aim under 40 lines) and files focused (aim under 300 lines).
- **Error Handling**: Throw exceptions for programming/unexpected errors; return structured success/failure wrappers (e.g., Result/Either patterns) for expected business logic path failures.

---

## PERFORMANCE BUDGETS (hard caps)

| Interaction | Target |
|---|---|
| UI response (click, hover) | ≤ 100ms |
| API read (cached, single) | p95 < 200ms |
| API read (list, paginated) | p95 < 300ms |
| API write | p95 < 300ms |
| LCP / INP | ≤ 2.5s / ≤ 200ms |
| JS / CSS bundle (gzipped) | ≤ 170KB / ≤ 30KB |
| DB query (indexed lookup) | ≤ 10ms |

---

## PRISM DESIGN SYSTEM RULES

- **Tokens**: Never hardcode colors, radii, or fonts — always use CSS design tokens (`var(--token-name)`).
- **Themes**: Implement dark/light mode switches via data attributes (e.g. `[data-theme="dark"]`) rather than media queries where theme switching is required.
- **Consistency**: Keep spacing aligned to the project grid system (e.g., multiples of 4px).
- **AI Glyphs**: Use only the Prism Sparkle/Prism icon as the visual representation for AI-generated assets.

---

## WHEN TO CHECK FULL DOCS

Detailed guidelines live in the Docs/Guidelines folder. Refer to them when working on core modules:

| Topic | Reference Document |
|---|---|
| Building any UI component or screen | `design/SKILL.md` (or `src/design/SKILL.md`) |
| Adding auth, tenant logic, or architecture choices | `docs/guidelines/Architecture.md` |
| Adding security controls, file uploads, API endpoints | `docs/guidelines/Security.md` |
| Writing tests or performing large refactoring | `docs/guidelines/Code-Quality.md` |
| Performance optimizations, database indexing | `docs/guidelines/Performance.md` |
| Writing an ADR, design documentation, or README | `docs/guidelines/Documentation.md` |
