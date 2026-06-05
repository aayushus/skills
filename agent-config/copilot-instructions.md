# GitHub Copilot workspace instructions

This codebase uses an opinionated stack with hard rules that must never be broken.
Always follow these. When in doubt, check the full guidelines in the Skills folder.

## Stack
TypeScript strict + Node.js + Express + Prisma + PostgreSQL + Redis + BullMQ.
AI service: Python 3.12 + FastAPI. Frontend: Next.js + React + Meridian design system.

## Critical rules (catastrophic if missed)

1. **Every Prisma query on tenant data filters by `tenantId`** — the middleware enforces it, but always include it explicitly
2. **No raw SQL concatenation** — parameterised Prisma queries only; `$queryRaw` requires explicit review
3. **`tenantId` comes from the session** — never from URL params or request body
4. **Unauthorized reads return 404** — never 403 (prevents existence leak)
5. **Soft deletes only** — `deletedAt` timestamp, never hard DELETE on tenant data
6. **ULIDs for all primary keys** — not auto-increment, not UUID
7. **Cursor pagination only** — never offset/limit
8. **Async anything > 1 second** — use BullMQ, never block an HTTP handler
9. **Argon2id for passwords** (`time=3, memory=64MB, parallelism=4`) — never bcrypt
10. **Opaque session tokens in Redis** — not JWTs for user sessions
11. **Zod validation on every input boundary** — with `.strict()`, including max lengths
12. **Structured JSON logs only** — with `correlationId` + `tenantId` on every line
13. **Secrets in Doppler/KMS** — never in code, never logged
14. **No `any` in TypeScript** — use `unknown` with narrowing
15. **No N+1 queries** — use Prisma `include/select`

## Design system rules
- Use CSS tokens (`var(--token-name)`) — never hardcode colours, radii, or font names
- Use components from `components.tsx` — never import Tailwind or shadcn
- Sparkle star is the only AI glyph — no robots, brains, or lightbulbs
- Touch targets: 44×44px minimum on mobile
- Spacing: multiples of 4px only (4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64)

## Error handling
- Throw exceptions for programming errors (bugs)
- Return Result types for expected failures (validation, not-found, rate-limit)
- Never silence errors — always log or rethrow

## Code style
- TypeScript `strict: true` + `noUncheckedIndexedAccess`
- Functions ≤ 80 lines, files ≤ 500 lines
- No `console.log` — use the structured logger
- No commented-out code — delete it
- Boolean variables: `is/has/can/should` prefix
- No TypeScript `enum` — use string literal unions

## Performance hard caps
- UI response: ≤ 100ms | API p95: < 300ms | DB indexed lookup: ≤ 10ms
- JS bundle gzipped: ≤ 170KB | CSS gzipped: ≤ 30KB
- LCP: ≤ 2.5s | INP: ≤ 200ms | CLS: ≤ 0.1
