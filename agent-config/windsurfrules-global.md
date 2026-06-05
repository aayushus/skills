# Universal coding rules — applies to all projects

These rules are tool-agnostic, stack-agnostic hard constraints.
Project-specific stack decisions live in .windsurfrules at the project root.

---

## SECURITY — never negotiate these

- Validate every input at every system boundary — HTTP, queue, file upload, CLI args
- All strings have a max length — no unbounded input
- Passwords: Argon2id only — never bcrypt, MD5, SHA-1, or SHA-256 for passwords
- Secrets in a secrets manager (Doppler, AWS Secrets Manager, Vault) — never in code, env files, or logs
- One place reads environment variables — a config module with schema validation
- Never reveal whether a user/email/resource exists to an unauthenticated caller
- Unauthorised reads return 404, not 403 — prevents existence leak
- Never log secrets, tokens, PII, or raw passwords — redact at the transport layer
- Session tokens rotate on: login, logout, privilege change
- File uploads: validate by magic number (not extension), scan for malware, strip metadata
- SSRF: DNS-resolve before fetching, reject private/loopback IPs
- Every outbound network call has a hard timeout
- Retries only on 5xx and network errors — never on 4xx
- Rate-limit authentication endpoints (login, password reset, MFA)
- CORS: explicit allowlist — never wildcard `*` in production
- Security headers on every response: HSTS, X-Frame-Options, CSP
- TLS 1.2+ everywhere

---

## CODE QUALITY — language-agnostic rules

- Use the strictest type-checking mode available for your language
- Never use the "any" escape hatch (TypeScript `any`, Python `Any` without bounds, Go `interface{}` without assertion)
- Functions ≤ 80 lines (aim ≤ 30); files ≤ 500 lines (aim ≤ 300)
- No `console.log` / `print` in committed code — use a structured logger
- No commented-out code — delete it; use git history
- No TODO without author and date; CI should fail if TODOs accumulate
- Boolean variables use `is/has/can/should` prefix
- Error handling: throw/panic for programming errors (bugs); return typed errors/Result for expected failures (validation, not-found, rate-limit)
- Async/await always — never raw promise chains or callbacks
- Parallelise independent async work — don't await sequentially when parallel is safe
- No N+1 queries — use eager loading, joins, or batching
- No circular imports — signals wrong module boundaries
- PR size ≤ 400 lines unless generated — split larger changes
- Refactoring and feature work never in the same PR

---

## PERFORMANCE — hard budgets

| Interaction | Budget |
|---|---|
| UI response (click, hover, keypress) | ≤ 100ms |
| Page / view transition | ≤ 200ms |
| API read (cached) p95 | < 200ms |
| API read (list) p95 | < 300ms |
| API write p95 | < 300ms |
| Anything > 1s | Show progress indicator; consider async |
| Anything > 10s | Must be async with completion notification |
| LCP | ≤ 2.5s (p75) |
| INP | ≤ 200ms (p75) |
| CLS | ≤ 0.1 (p75) |
| JS bundle gzipped | ≤ 170KB |
| CSS bundle gzipped | ≤ 30KB |
| DB indexed point lookup | ≤ 10ms |
| DB list query | ≤ 200ms |

- Profile before optimising — never optimise by intuition
- Every query must hit an index — no sequential scans on large tables
- Cache keys must include tenant/user scope — never serve one user's cached data to another
- TTL on every cache entry — no infinite caches

---

## OBSERVABILITY — always

- Structured JSON logs — required fields: `timestamp`, `level`, `service`, `correlationId`, `message`
- Correlation ID on every log line, every async job, every cross-service call
- Every HTTP route emits request count + duration metrics
- Slow queries logged automatically — threshold: 50ms dev, 200ms staging, 500ms prod
- Audit logs for any action that changes permissions, deletes data, or touches billing — append-only, never editable

---

## MERIDIAN DESIGN SYSTEM — applies to all UI work

- Never hardcode colours, radii, or font names — use CSS tokens (`var(--token-name)`)
- Never use pure `#000` or `#fff` as text — use `var(--text-default)` (warm off-black)
- Three colour layers: neutrals (90% of pixels) · product accent (`--accent`) · AI gradient (`--ai-grad`) — never mix
- Sparkle star is the only AI glyph — no robots, brains, lightbulbs, wands
- Never import Tailwind, Radix defaults, or shadcn themes — use `components.tsx` from the design system
- Touch targets: 44×44px minimum on mobile
- Mobile inputs: `font-size ≥ 16px` — iOS Safari zooms on focus otherwise
- Dark mode: `[data-theme="dark"]` selector overrides — never `@media (prefers-color-scheme: dark)` in component CSS
- Spacing: multiples of 4px only — allowed: 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64

---

## DOCUMENTATION — always

- ADR for every irreversible architectural decision — written before code merges
- Every public API documented (OpenAPI 3.1 for HTTP, equivalent for others)
- README passes the "5 minutes to running" test
- Every migration is reversible or explicitly documented as one-way
- Diagrams in code (Mermaid preferred) — never in external tools that drift

---

## ASYNC WORK — any language, any queue

- Any work > 1 second belongs in a background job — never block an HTTP handler
- Every job is idempotent — safe to retry without double side effects
- Idempotency keys on mutations with external side effects (email, payment, webhook)
- Jobs have a retry limit with exponential backoff
- Job failure is observable — dead-letter queue or failure log

---

## WHEN TO CHECK FULL DOCS

Full guidelines live in the Obsidian Skills vault:
- Any UI work → load `meridian-design` skill
- Architecture, service boundaries, DB design → `guidelines/architecture-guidelines.md`
- Auth, file upload, external APIs, AI features → `guidelines/security-guidelines.md`
- Tests, refactoring, PR review → `guidelines/code-quality-guidelines.md`
- Performance, caching, queries → `guidelines/performance-guidelines.md`
- ADRs, READMEs, API docs → `guidelines/documentation-guidelines.md`
- New component from scratch → `design/implementation-guide.md`
