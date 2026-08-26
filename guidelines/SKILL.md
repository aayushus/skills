---
name: engineering-guidelines
description: Comprehensive engineering standards and architecture playbook. Use when designing system topology, database schemas, auth/security controls, REST APIs, testing strategies, performance budgets, or incident response procedures.
---

# Engineering Guidelines Skill

When this skill is active, apply these engineering standards and architectural patterns across all design, coding, security, and testing tasks.

---

## 1. Domain Navigation Router

Load the relevant atomic guideline file based on the task:

| Domain | When working on | Load Document |
|---|---|---|
| **Architecture** | Service boundaries, monolith vs microservices, module seams | `docs/guidelines/architecture/service-topology.md` |
| | Database schema, primary keys, tenancy isolation, zero-downtime migrations | `docs/guidelines/architecture/database-and-tenancy.md` |
| | Background jobs, worker queues, retry policies, idempotency | `docs/guidelines/architecture/async-and-queues.md` |
| **Security** | Passwords, session revocation, cookie flags, RBAC permissions | `docs/guidelines/security/auth-and-sessions.md` |
| | Boundary schema validation (Zod), XSS, SSRF, SQL injection defenses | `docs/guidelines/security/input-validation.md` |
| | Secrets management, encryption at rest/transit, key rotation | `docs/guidelines/security/secrets-and-crypto.md` |
| | OWASP Top 10 for LLMs, prompt injection defense, PII scrubbing, tool sandboxing | `docs/guidelines/security/ai-security.md` |
| **API** | REST endpoint conventions, URL versioning, JSON error/data envelopes, rate limits | `docs/guidelines/api/api-contracts.md` |
| | Inbound/outbound webhooks, HMAC signature verification, idempotency, DLQs | `docs/guidelines/api/webhooks-and-events.md` |
| **Testing** | Test pyramid (70/20/10), unit testing, integration DB isolation, mocks, CI gates | `docs/guidelines/testing/testing-strategy.md` |
| | Playwright E2E browser flows, visual regression, golden sets, LLM-as-a-judge | `docs/guidelines/testing/e2e-and-ai-testing.md` |
| **Quality & Performance** | TypeScript strictness, Result/Either error types, function & file caps | `docs/guidelines/quality-performance/code-standards.md` |
| | p95 latency budgets, Core Web Vitals, caching layers, bundle size budgets | `docs/guidelines/quality-performance/performance-budgets.md` |
| | Structured JSON logging, correlation ID propagation, tracing | `docs/guidelines/quality-performance/observability.md` |
| **Operations** | Production outage triage, SEV 1–4 severity levels, Incident Commander role | `docs/guidelines/operations/incident-response.md` |
| | Branching, PR sizing (<300 lines), feature flags, semantic versioning | `docs/guidelines/operations/git-and-release.md` |
| | Architecture Decision Records (ADRs), README standards, changelogs | `docs/guidelines/operations/documentation-and-adrs.md` |
| | Docker Compose standards, multi-stage production builds, non-root users | `docs/guidelines/operations/container-standards.md` |
| | Model escalation tiers (Tier 1-3), context window discipline, parallel agents | `docs/guidelines/operations/ai-workflow.md` |
| | ADR Template for recording new technical decisions | `docs/guidelines/operations/TEMPLATE-Decision.md` |

---

## 2. Universal Hard Rules

1. **Tenancy Isolation**: If multi-tenant, every database query touching customer data MUST filter by `tenantId` derived strictly from session context.
2. **Parameterized Queries**: Never concatenate user input into raw SQL queries.
3. **Async > 1 Second**: Any operation taking longer than 1,000ms must run in a background worker.
4. **Input Validation**: Validate 100% of inputs at system boundaries with strict schemas (e.g., Zod / Pydantic).
5. **No Blind `eval()`**: Never evaluate raw LLM-generated code or SQL strings directly in production.
6. **Structured Logging**: Output all production logs as single-line JSON with `correlationId` and `timestamp`.
7. **Strict Typing**: Enforce `strict: true` and `noUncheckedIndexedAccess` in TypeScript; never use `any`.
