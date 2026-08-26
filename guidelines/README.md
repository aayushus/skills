# Engineering Guidelines

A modular, production-grade engineering playbook for building reliable, scalable, and secure software with AI agents.

## Directory Structure

```
docs/guidelines/
├── architecture/                   # System structure, data models, and async patterns
│   ├── service-topology.md         # Monolith vs services, module boundaries, and seams
│   ├── database-and-tenancy.md     # DB schema design, tenancy isolation, zero-downtime migrations
│   └── async-and-queues.md         # Background workers, queues, idempotency, retries
│
├── security/                       # Application security, defenses, and AI guardrails
│   ├── auth-and-sessions.md        # Password hashing, session lifecycle, RBAC, tokens
│   ├── input-validation.md         # Schema validation at system boundaries, injection defense
│   ├── secrets-and-crypto.md       # Secrets management, encryption at rest/transit
│   └── ai-security.md              # OWASP Top 10 for LLMs, prompt injection, PII scrubbing, tool sandboxing
│
├── api/                            # Wire contracts, communication protocols, and webhooks
│   ├── api-contracts.md            # REST conventions, JSON envelopes, pagination, rate limiting
│   └── webhooks-and-events.md      # Webhook signing, idempotency keys, DLQs, retry policies
│
├── testing/                        # Verification strategy, test isolation, and CI gates
│   ├── testing-strategy.md         # 70/20/10 pyramid, unit/integration test isolation, mocks, CI gates
│   └── e2e-and-ai-testing.md       # Playwright E2E flows, golden datasets, LLM evaluation sets
│
├── quality-performance/            # Code craft, latency budgets, and observability
│   ├── code-standards.md           # Naming, file/function size limits, strict typing, Result types
│   ├── performance-budgets.md      # p95 latency SLOs, caching layers, bundle budgets, Core Web Vitals
│   └── observability.md            # Structured JSON logging, correlation IDs, OpenTelemetry tracing
│
└── operations/                     # SDLC workflows, deployment, and operational resilience
    ├── incident-response.md        # SEV 1-4 severity levels, Incident Commander role, runbooks
    ├── git-and-release.md          # PR sizing (<300 lines), trunk-based workflow, feature flags
    ├── documentation-and-adrs.md   # ADR format (DECISION-*.md), README standards, changelogs
    ├── container-standards.md      # Docker/Compose specifications, multi-stage builds, volume isolation
    ├── ai-workflow.md              # Model escalation tiers (Flash → Sonnet → Opus), context discipline
    └── TEMPLATE-Decision.md        # Architecture Decision Record (ADR) template
```

---

## Guidelines by Domain

| Domain | Topics Covered | Key Reference Files |
|---|---|---|
| **Architecture** | System shape, tenancy isolation, database schema evolution, background processing | [`service-topology.md`](architecture/service-topology.md)<br>[`database-and-tenancy.md`](architecture/database-and-tenancy.md)<br>[`async-and-queues.md`](architecture/async-and-queues.md) |
| **Security** | Authentication, input validation, encryption, LLM guardrails (OWASP Top 10) | [`auth-and-sessions.md`](security/auth-and-sessions.md)<br>[`input-validation.md`](security/input-validation.md)<br>[`secrets-and-crypto.md`](security/secrets-and-crypto.md)<br>[`ai-security.md`](security/ai-security.md) |
| **API & Integrations** | REST JSON envelopes, URL versioning, rate limiting, webhook contracts | [`api-contracts.md`](api/api-contracts.md)<br>[`webhooks-and-events.md`](api/webhooks-and-events.md) |
| **Testing & QA** | Test pyramid, integration DB isolation, Playwright E2E, LLM evaluation sets | [`testing-strategy.md`](testing/testing-strategy.md)<br>[`e2e-and-ai-testing.md`](testing/e2e-and-ai-testing.md) |
| **Code & Performance** | TypeScript conventions, Result types, p95 latency budgets, structured logs | [`code-standards.md`](quality-performance/code-standards.md)<br>[`performance-budgets.md`](quality-performance/performance-budgets.md)<br>[`observability.md`](quality-performance/observability.md) |
| **Operations & SDLC** | SEV 1-4 response, PR sizing (<300 lines), ADRs, container builds, AI workflow | [`incident-response.md`](operations/incident-response.md)<br>[`git-and-release.md`](operations/git-and-release.md)<br>[`documentation-and-adrs.md`](operations/documentation-and-adrs.md)<br>[`container-standards.md`](operations/container-standards.md)<br>[`ai-workflow.md`](operations/ai-workflow.md) |

---

## Usage in AI Agent Workflows

When directing AI agents (Claude, Cursor, Antigravity, Devin, Copilot), point the agent directly to the relevant atomic guideline file rather than loading entire repositories into context. This maximizes prompt cache efficiency and instruction adherence.
