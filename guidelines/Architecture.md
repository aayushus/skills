---
name: architecture-standards
description: The binding standards for system architecture — service topology, multi-tenancy, service communication, API design at the system level, database design, event-driven patterns, failure modes, observability, disaster recovery, scaling timeline, security defaults, AI service integration, deployment, decisions, anti-patterns, and the review checklist. This is the spine of the pack; other docs cross-reference into it.
---

# Architecture Standards

**Version 2.0** · Last updated 1 July 2026

This is the binding architecture standard. It states positions we hold about system shape, at a level of specificity that would let a new engineer make correct decisions on their first week without ambiguity. Deviations require an ADR (see [README.md](README.md) §3 and §17 below).

> **See also:** [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.1 — reviewer checklist for architectural changes | [Security.md](Security.md) — the deep security reference §12 here summarises | [Performance.md](Performance.md) — budgets, SLOs, caching strategy | [API-Design.md](API-Design.md) — wire-level API details this doc's §5 does not restate | [Documentation.md](Documentation.md) — ADR process, system diagrams | [README.md](README.md) — pack stance and ADR deviation process

---

## Changelog

**v2.0 (1 July 2026):**

* **Reframed as "Architecture Standards"** (not "Guidelines") to match pack terminology.
* **Added YAML frontmatter** so the doc is loadable as an agent skill.
* **Stack examples moved to Appendix A.** The previous version wove Node/Express/TypeScript/Prisma/Python/FastAPI examples through the normative body. In v2.0, the body states rules stack-agnostically; concrete code and library-specific illustrations live in Appendix A at the end of the file. This means the rules stay valid when a project uses a different stack — the principle is what's binding, the illustration is not.
* **§5 API design tightened, deduplicated against API-Design.md.** The previous version restated the error envelope shape, list envelope shape, and webhook rules that also lived in API-Design.md — two homes, guaranteed to drift. Now: this doc owns *strategy* (versioning approach, breaking-change protocol, URL structure, HTTP-method discipline, rate-limit approach); API-Design.md owns *wire-level details* (exact envelope JSON, webhook mechanics, cross-service auth mechanics). Cross-references go both ways.
* **§12 Security defaults reduced to a summary; Security.md is canonical.** Previously this section duplicated large parts of Security.md. Now it lists the defaults with pointers to the specific Security.md sections that own each control.
* **Disaster recovery and Scaling timeline are now numbered §10 and §11.** Both were substantive sections that appeared between §9 and §10 without any section number — they were effectively invisible in the ToC. Numbering means they are now findable and cross-linkable.
* **§15 Decision log** (was §13) now references [TEMPLATE-Decision.md](TEMPLATE-Decision.md) instead of embedding a malformed inline template. The previous version had a code block that wasn't properly closed and a template that diverged from the pack template.
* **§18 (new) "Deviating from this standard"** — the pack-wide ADR clause.
* **§17 Review checklist** now cross-references [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.1 — that doc is the reviewer's version of this checklist with severity-ladder guidance. Both should be kept in sync.
* **Anti-patterns (§16) unchanged.** That section was already gold; no edits needed beyond stack-agnostic phrasing.
* **The example stack baseline block moved to Appendix A.** The intro now describes the target *shape* (a modular monolith, an AI service, an MCP server, a frontend, a database) rather than naming Node 20 / Express / Prisma / React / FastAPI in the first paragraph.

---

## Table of contents

1. [Principles](#1-principles)
2. [Service topology](#2-service-topology)
3. [Multi-tenancy model](#3-multi-tenancy-model)
4. [Service communication](#4-service-communication)
5. [API design (system level)](#5-api-design-system-level)
6. [Database design](#6-database-design)
7. [Event-driven and async patterns](#7-event-driven-and-async-patterns)
8. [Failure modes and resilience](#8-failure-modes-and-resilience)
9. [Observability](#9-observability)
10. [Disaster recovery](#10-disaster-recovery)
11. [Scaling timeline](#11-scaling-timeline)
12. [Security defaults](#12-security-defaults)
13. [AI service integration](#13-ai-service-integration)
14. [Deployment and environments](#14-deployment-and-environments)
15. [Decision log (ADR process)](#15-decision-log-adr-process)
16. [Anti-patterns](#16-anti-patterns)
17. [Review checklist](#17-review-checklist)
18. [Deviating from this standard](#18-deviating-from-this-standard)
19. [Appendix A — Stack-specific illustrations](#appendix-a--stack-specific-illustrations)

---

## 1. Principles

Five principles, in priority order. Earlier wins when they conflict.

**1.1 Boring technology.** Every load-bearing choice is deliberately boring: a relational database, a cache, HTTP, JSON. Boring technology has surprise-free operational behaviour. The novelty budget is spent on the product, not the plumbing. If you find yourself reaching for an exotic database, a cutting-edge framework, or a newly-announced pattern, the default answer is no — come back with an ADR that names the specific problem a boring choice can't solve.

**1.2 Reversibility over elegance.** Prefer decisions that are cheap to reverse. A monolith that could become two services is better than two services that can't become one. JSON-over-HTTP between internal services is reversible; a proprietary RPC protocol is not. Relational tables you can migrate with `ALTER TABLE` are reversible; a document store with thousands of varying shapes is not. Every irreversible decision (database engine, tenant model, ID format) requires an ADR.

**1.3 Explicit over implicit.** Tenant IDs are in every row, every log line, every trace. Versions are in every URL. Idempotency keys are required for every mutating webhook. Nothing important is ever "assumed from context" — because context evaporates at 3am when something is broken. If a value is load-bearing, it is explicit and it is logged.

**1.4 Failure is the default state.** Every network call will fail. Every database will disconnect. Every external API will return 500. Code is written assuming failure, not success. Retries, timeouts, circuit breakers, and dead-letter queues are not optional decorations — they are the design.

**1.5 Data is forever, code is disposable.** You can rewrite a service in a weekend. You cannot rewrite a database with ten million rows over the weekend. Schema decisions, ID formats, naming conventions, tenant boundaries — these get scrutinised harder than anything else. Wrong code is annoying; wrong data is existential.

---

## 2. Service topology

### 2.1 Start with a modular monolith

The backend is a modular monolith by default. All HTTP endpoints, business logic, and data-access code live in one deployable. This is correct for the target scale (a 10k-user multi-tenant SaaS is not a microservices shape).

The monolith is organised **by domain module, not by technical layer** — each module owns its data, its business logic, and its HTTP surface. Modules communicate through a narrow, documented public API per module; direct cross-module imports are a review blocker.

An illustrative directory layout for a typical stack is in Appendix A.

**Rule:** modules may depend on shared infrastructure (database client, queue client, HTTP client, auth guards, logger, telemetry). Modules may NOT directly import from other modules except through a narrow, documented `public` export surface per module. This gives you the seams to split services later if you need to, without doing it prematurely.

### 2.2 Services we keep separate from the start

Four services, because each has a real reason to be independent — not because "microservices are modern":

| Service | Reason for separate deploy |
| --- | --- |
| **Backend** | The system of record. Owns the primary database, runs business logic, serves authenticated HTTP. |
| **AI service** | Different language ecosystem (Python for model SDKs and numerical libraries). Different failure profile (slow, flaky). Different scaling curve (CPU/memory heavy, bursty). |
| **MCP server** | Exposes resource data via Model Context Protocol to external AI agents. Different auth model (OAuth 2 for AI clients). Different trust boundary. |
| **Frontend** | Static build. Separate deploy cadence, CDN-hosted, no server-side state. |

That's the whole topology until traffic forces a change. Do not add a fifth service without an ADR.

### 2.3 When to extract a new service

A module becomes its own service only when at least two of these are true:

1. **Different scaling curve.** The module is CPU-bound while the rest is IO-bound, or vice-versa. You're over-provisioning the monolith to serve it.
2. **Different reliability profile.** The module's failures are routinely taking the rest of the system down, or its retries are blocking hot paths.
3. **Different deploy cadence.** The module ships multiple times per day while the monolith ships weekly, and coupling is slowing both teams.
4. **Different runtime.** The module genuinely needs a different language or framework (not "would be nice in Go").

If only one is true, the fix is almost always inside the monolith — move it behind a queue, isolate it in a worker process, or put it behind a circuit breaker. Extraction is a last resort.

### Decision tree: when to extract a module into a service

Use this before proposing any service extraction. All three conditions must be true before extraction is justified.

```
Is the module deployed at a different cadence than the monolith?
  └─ No → Stay in monolith. Extraction adds operational cost with no benefit.
  └─ Yes → Continue ↓

Does the module have clearly owned data that no other module reads directly?
  └─ No → Stay in monolith. Shared data = distributed transactions = pain.
  └─ Yes → Continue ↓

Does the module have distinct scaling requirements (10× more/less traffic)?
  └─ No → Stay in monolith. Identical scaling = no infrastructure benefit.
  └─ Yes → ✓ Extraction is justified. Proceed with the extraction checklist below.
```

**Extraction checklist (when all three conditions are true):**

* [ ] Define the service API contract (OpenAPI spec or equivalent) before writing a line of code
* [ ] Write contract tests against the spec, not the implementation
* [ ] Migrate data ownership: service owns its schema, exposes it only via API
* [ ] Deploy the service behind a feature flag — route traffic gradually
* [ ] Keep the monolith implementation live until the new service handles 100% of traffic for 2 weeks
* [ ] Delete the monolith code only after the flag is fully rolled out

### 2.4 Orchestration exit strategy

Container orchestration at the Compose level is fine up to roughly 1,000 users and one production host. Beyond that, a real orchestrator is required. The choice — Kubernetes, a managed platform, or a lighter orchestrator — is an ADR at the moment it's needed, not now.

The exit is planned but not executed: keep the monolith and services deployable in a way that a switch to a real orchestrator is a configuration change, not a rewrite. In practice, this means treating containers as the deployable unit and avoiding orchestration-specific mechanisms (Compose file features that don't map to other orchestrators, host-mount patterns, etc.).

---

## 3. Multi-tenancy model

### 3.1 The decision: shared database, shared schema, tenant_id column

A single database, single schema, with a `tenant_id` column on every tenant-scoped table. Not schema-per-tenant. Not database-per-tenant.

Why this over the alternatives:

* **Schema-per-tenant** breaks down at hundreds of tenants (each schema has fixed overhead, migrations must fan out, backups get expensive).
* **Database-per-tenant** is only justified for regulated single-tenant customers (finance, health, defence) — and even then, only when contractually required.

The shared model has one big risk: cross-tenant data leakage from a missing `WHERE tenant_id = ?`. §3.2 makes that risk structurally hard, not just "the developer will remember".

### 3.2 Enforcement — make leakage impossible, not just unlikely

Three layers of enforcement. All three are required. Any layer alone is insufficient.

**Layer 1: at the database.** Every tenant-scoped table has a `tenant_id` column, NOT NULL, foreign-keyed to `tenants.tenants(id)`, and included as the leading column of every meaningful index. Row-level security (RLS) at the database is the belt to the application's braces; when the database is directly queried (analytics, incident response, ad-hoc scripts), RLS still enforces isolation.

**Layer 2: at the ORM / data-access layer.** All queries against tenant-scoped tables are routed through a middleware that automatically injects `tenant_id = ctx.tenantId`. The middleware refuses to run a query on a tenant-scoped table without the predicate. This is where 99% of leakage bugs get caught in practice.

**Layer 3: at the request boundary.** Every authenticated request establishes a tenant context (from the session or API key). Middleware sets `AsyncLocalStorage` (or equivalent per-request context) with the tenant ID. Data-access code reads from this context. Controllers do not pass `tenantId` as an argument — that's where forgetting happens.

Illustrative code for a specific stack is in Appendix A.

### 3.3 Tenant context propagation

The tenant ID rides along with every operation:

* **HTTP requests** carry it in the session token or API key (resolved at the auth middleware).
* **Queue jobs** carry it in their payload; the worker sets tenant context before invoking the handler.
* **Logs, traces, and audit entries** include `tenantId` as a required structured field. Log lines without a tenant context (system-scoped operations) are explicitly marked as such.

### 3.4 Roles vs tenants

Users belong to tenants via a `Membership` join table. A single user can be a member of multiple tenants (employees who also act as buyers, agencies, consultants). The current active tenant is part of the session, not the user record.

```
User ──┬── Membership(tenantId, userId, role, status) ──── Tenant
       └── Membership ──── Tenant
```

Roles are enum-valued, scoped to the tenant: `owner`, `admin`, `member`, `viewer`. Roles are never stored as free-text strings.

> **Cross-reference:** [Security.md](Security.md) §3 covers the authorization layer that enforces these tenant boundaries at the request level.

---

## 4. Service communication

### 4.1 Default: synchronous HTTP + JSON

Internal services talk to each other over HTTP with JSON bodies, protected by mTLS or a shared-secret header, inside the container network. No gRPC, no Thrift, no ProtoBuf until there is a measured reason. The reason will probably never come at this scale.

Why HTTP + JSON:

* Debuggable with `curl`
* Works across languages without codegen
* Every tracing tool understands it
* Client libraries are the standard library, not something special

### 4.2 When to go async (queue instead of HTTP)

Use a queue (not HTTP) when **any** of these are true:

1. The operation can take longer than 1 second.
2. The caller doesn't need the result right now.
3. The operation is retryable on failure (most things are).
4. The caller shouldn't fail if the callee is temporarily down.

Concretely: every AI call, every email send, every webhook delivery, every PDF generation, every external API sync goes through a queue. The user-facing HTTP path never waits for any of them.

See §7 for the queue architecture.

### 4.3 HTTP client rules

All outbound HTTP goes through a shared client wrapper with these mandatory defaults:

* **Timeouts are mandatory.** Default 10 seconds; shorter for hot paths (3 seconds), longer for known-slow calls (AI inference up to 60 seconds — but only via queue, never inline).
* **Retries only on 5xx and network errors. Never on 4xx.** 4xx are caller errors; retrying will not help and may cause duplicate writes if the server processed the first request successfully.
* **Idempotency keys on mutations.** Every POST/PUT/PATCH that isn't purely read-only sends an `Idempotency-Key` header. See [API-Design.md](API-Design.md) §4.1.
* **Circuit breakers on every external dependency.** If a downstream returns 5xx N times in a row (default 5), open the circuit for T seconds (default 30). Defer to a library rather than hand-rolling.
* **Correlation ID propagation.** Every outbound call carries the current request's correlation ID header so the whole call graph traces to one request.

A concrete illustration for a specific HTTP client library is in Appendix A.

### 4.4 Service-to-service auth

Internal service calls authenticate via a short-lived service credential (a signed token or shared secret, rotated on a fixed schedule) plus mTLS at the network level when running in a real orchestrator.

**Never use the end-user's session token to make service-to-service calls.** That collapses the trust boundary and leaks user identity across services that shouldn't see it. Instead, forward an attenuated claim (tenant ID, user ID, user roles) as separate headers. The receiving service trusts these because it trusts the service credential that accompanied them.

Detailed rules for service tokens, scoping, and rotation live in [Security.md](Security.md) §5.

---

## 5. API design (system level)

This section covers the *strategy* of API design: how APIs are versioned, structured, and evolved. The *wire-level details* — the exact JSON shape of error envelopes, list envelopes, webhook mechanics, and cross-service auth mechanics — live in [API-Design.md](API-Design.md). This split means the strategic positions stay in the spine, and the wire-level details have one canonical home.

### 5.1 REST first, GraphQL never (yet)

All external APIs are REST over HTTP with JSON bodies. GraphQL is not a default option — it introduces N+1 query risks, versioning is hard, authorisation is hard, and for a system of this size it is more rope than reach.

Reconsider GraphQL only if BOTH are true:

* You have multiple first-party clients (web + mobile + third-party apps) that need wildly different shapes of the same data, AND
* You have someone who has shipped production GraphQL before.

If you eventually add GraphQL, it is a *facade* over the REST API, not a replacement. Add via ADR.

### 5.2 URL structure

Pattern: `/api/v{N}/{resource}[/{id}][/{subresource}]`

**Rules:**

* Resources are plural nouns: `entities`, not `entity`.
* Lowercase with hyphens if multi-word: `purchase-orders`.
* IDs are ULIDs in path (see §6.3).
* Non-CRUD actions go under `/actions/{verb}`. Never invent clever REST verbs like `POST /entities/{id}` meaning "verify".

### 5.3 Versioning

**URL-prefix versioning.** `/api/v1/`, `/api/v2/`. No header-based, no content-type-based, no query-string-based versioning. URL-prefix is ugly but universally understood by humans, logs, CDNs, and debuggers.

**Rules:**

* Breaking changes require a new major version. No exceptions.
* Non-breaking changes (adding optional fields, adding endpoints, adding enum values with the "ignore unknown" contract) go into the existing version.
* Support the previous major version for **at least 12 months** after a new major ships. For enterprise clients, 18 months. Announce deprecation in `Deprecation` and `Sunset` response headers.
* Internal APIs between our own services can break more freely (they deploy together), but still use `/v1/` for clarity.

**What counts as breaking:**

* Removing a field from a response
* Changing a field's type
* Renaming a field
* Adding a new required request field
* Changing authentication or authorisation rules
* Changing the shape of an error
* Changing default pagination behaviour

**What does NOT count as breaking:**

* Adding new optional request fields
* Adding new response fields
* Adding new endpoints
* Adding new enum values, IF clients are specified to ignore unknown enum values

### 5.4 HTTP methods and status codes

| Method | Use | Idempotent | Typical success |
| --- | --- | --- | --- |
| `GET` | Read | ✓ | 200 |
| `POST` | Create, non-idempotent action | ✗ | 201 Created, or 200 if returning body only |
| `PUT` | Replace (full resource) | ✓ | 200, 204 |
| `PATCH` | Partial update | depends | 200, 204 |
| `DELETE` | Soft-delete | ✓ | 204 |

Status code discipline:

* `200` — OK, response has a body
* `201` — Created (new resource); `Location` header points to it
* `202` — Accepted (async job enqueued); response body contains a job URL to poll
* `204` — No Content (successful mutation, no body)
* `400` — Bad request (validation error); body contains the error envelope
* `401` — Not authenticated (no valid session)
* `403` — Authenticated but not authorised for this action
* `404` — Resource not found, OR resource exists but caller has no access (prefer 404 over 403 for unauthorised reads, to avoid leaking existence — see [Security.md](Security.md) §3.5)
* `409` — Conflict (optimistic lock failure, duplicate key)
* `410` — Gone (resource existed, now permanently deleted — rare; soft-delete is preferred)
* `422` — Unprocessable (valid JSON, but semantically invalid business rule)
* `429` — Rate limited; `Retry-After` header included
* `500` — Server error; correlation ID in body
* `502 / 503 / 504` — Upstream failure; caller should retry with backoff

**Do not invent statuses.** `499`, `520`, `999` are not things this API returns.

### 5.5 Error envelope

Error envelope structure (exact JSON shape, `code` conventions, `correlationId` requirement, `details` field discipline) is owned by [API-Design.md](API-Design.md) §3.1. Every service in the system produces errors in that shape.

**System-level rules that live here:**

* Every service maintains a canonical error code registry as a single source file. New codes go there, not inline in handlers.
* `code` values are stable; once shipped, they are never renamed, only deprecated.

### 5.6 Pagination

**Cursor-based pagination, never offset-based.** Offset pagination breaks at scale (duplicates and missing rows when data changes mid-scroll) and is O(N) on the database.

**Rules:**

* Default `limit` is 25. Maximum is 100. Requests for more return `400 BAD_LIMIT`.
* Cursors are opaque, base64-encoded, and signed with a TTL. Clients do not parse them.
* Cursors expire after 24 hours. Stale cursors return `410 CURSOR_EXPIRED`.
* Sorting: one default sort per collection, documented; alternate sorts via `?sort=field,-direction`. Always secondary-sort by ID to break ties.

Request/response envelope shape is in [API-Design.md](API-Design.md) §3.2.

### 5.7 Filtering

Filters as query params, typed:

**Rules:**

* Every filterable field is explicitly documented. Unknown filter params return `400 UNKNOWN_FILTER`.
* Range operators use bracket syntax: `[gte]`, `[lte]`, `[gt]`, `[lt]`.
* Array filters use comma: `?status=verified,pending`. Max 50 values per array filter.
* Free-text search is a separate `q=` parameter, not a field filter. It uses the database's native full-text search (see §6.7), not `LIKE`.

### 5.8 Naming

| Element | Convention | Example |
| --- | --- | --- |
| URL path | kebab-case | `/purchase-orders` |
| Query param | camelCase | `?sortBy=createdAt` |
| JSON field | camelCase | `"resourceId": "..."` |
| DB column | snake_case | `resource_id` |
| Enum value | pick one and stick to it project-wide (lowerCamel in JSON, UPPER_SNAKE in code is common) | `"status": "awaitingReview"` |
| Timestamp field | camelCase + `At` suffix | `createdAt`, `publishedAt`, `deletedAt` |
| Boolean field | `is` or `has` prefix | `isVerified`, `hasCredentials` |
| Count field | `Count` suffix | `entityCount`, `invitationCount` |

Timestamps are **always ISO 8601 UTC with milliseconds and the `Z` suffix**: `"2026-07-01T14:30:00.000Z"`. Never Unix timestamps, never local time, never date-only strings unless the field is semantically a calendar date (`"startDate": "2026-07-01"`).

Money is always **string-encoded decimal with currency**:

```json
"price": { "amount": "1234.56", "currency": "GBP" }
```

Never floats. Never cents-as-integer (ambiguous across currencies with different exponents).

### 5.9 Idempotency

Every mutating endpoint (`POST`, `PUT`, `PATCH`, `DELETE`) accepts an optional `Idempotency-Key` header from the client. The server stores `(tenant_id, idempotency_key, request_hash, response)` in an `idempotency_records` table with a 24-hour TTL.

On duplicate key:

* Same request hash → return the stored response verbatim (same status, same body)
* Different request hash → return `409 IDEMPOTENCY_KEY_CONFLICT`

Idempotency is **mandatory** for endpoints that:

* Create money-adjacent records (projects, invoices)
* Send external side effects (emails, webhooks)
* Are frequently called from retry-prone paths (mobile, AI agents)

For simple reads and trivial mutations it's optional. If it's optional in the code, it must be optional in the docs — do not surprise API consumers.

### 5.10 Rate limiting

All endpoints are rate-limited by `(tenant_id, user_id, route)`. Default: 100 requests per 60 seconds per user per route. Login and password-reset endpoints are stricter: 5 per 60 seconds per IP.

Rate-limit state is in a shared, low-latency store (Redis by default). On hit, the response includes `Retry-After`, `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` headers.

The MCP server has its own rate-limit rules because external AI agents behave differently from humans (see §13.4).

### 5.11 Breaking-change protocol

When you need to ship a breaking change:

1. Create `/api/v{N+1}/` routes alongside the current version.
2. Dual-publish: the old version still works.
3. Add `Deprecation: true` and `Sunset: <RFC 1123 date>` response headers to the old version.
4. Log every request to the old version with the client ID so you can notify them.
5. Wait at least 12 months. For enterprise clients, 18.
6. Return `410 Gone` after sunset with a link to the migration guide.

Never do the "we'll just update everyone's code" manoeuvre. Outside your own frontend, someone always depends on your API in ways you don't know.

---

## 6. Database design

### 6.1 One relational database, multiple schemas by domain

All tenant data lives in one relational database. Inside that database, split into schemas by domain module. Public schema for shared reference data; per-domain schemas for the modules that own that data.

**Why separate schemas, not separate databases:** schemas are free; separate databases require separate connection pools, separate backups, and block cross-domain foreign keys. Schemas give you namespacing and clean introspection without the operational cost.

**Rule:** modules only read/write their own schema plus shared reference data. Cross-module reads happen via the module's public API (function call in the monolith, HTTP when split). Enforce with database roles that grant per-schema access when this scales beyond code review.

### 6.2 Table naming

* Plural, snake_case: `entities`, `request_invitations`, not `entity` or `requestInvitation`.
* Foreign keys named `{referenced_singular}_id`: `entity_id`, `tenant_id`.
* Join tables named `{a}_{b}` alphabetically: `entities_tags`, not `tag_entities`.
* Timestamps end in `_at`: `created_at`, `deleted_at`.

### 6.3 IDs

ULIDs for all primary keys. Not auto-increment integers, not UUIDv4.

Why:

* Sortable by creation time (unlike UUIDv4)
* Safe to include in URLs (no scale leakage like auto-increment)
* Compact string representation, human-referenceable

If ULIDs are unavailable in your stack, UUIDv7 is an acceptable substitute. Auto-increment integers require an ADR.

### 6.4 Required columns on every tenant-scoped table

Every tenant-scoped table has, at minimum:

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | ULID | Primary key |
| `tenant_id` | ULID (FK to `tenants.tenants`) | Tenant isolation |
| `created_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | Auditability |
| `updated_at` | TIMESTAMPTZ NOT NULL DEFAULT NOW() | Auditability + optimistic locking |
| `deleted_at` | TIMESTAMPTZ NULL | Soft delete (see §6.8) |
| `version` | INTEGER NOT NULL DEFAULT 1 | Optimistic locking (see §6.9) |

### 6.5 Foreign keys

Every referential relationship uses a foreign key with an explicit `ON DELETE` policy. **Never `ON DELETE CASCADE`** on tenant-scoped tables — cascades delete silently, which at scale becomes "we lost 50,000 rows because someone hit a button". Use `RESTRICT` and require explicit cleanup in application code. The one exception: join-only tables that have no identity of their own (tags, labels).

### 6.6 Indexing

Every query in production hits an index. No exceptions.

**Rules:**

1. Every foreign key has an index. Most databases do not create them automatically.
2. Every `WHERE` clause in a query-plan-hot path has an index that covers it.
3. Composite indexes order columns by **selectivity first, then range**. `(tenant_id, status, created_at DESC)` not `(created_at, tenant_id, status)`.
4. `tenant_id` is the leading column of almost every index on tenant-scoped tables.
5. Partial indexes for common filtered queries (e.g., excluding soft-deleted rows).
6. Use `EXPLAIN (ANALYZE, BUFFERS)` (or your database's equivalent) before shipping any new query that could run on large tables.
7. Add indexes in a separate migration, create them concurrently (non-blocking), and never in a migration that also alters the table.

### 6.7 Search

Free-text search uses the database's native full-text search capability (Postgres FTS with `tsvector`, or equivalent), not `LIKE '%foo%'`.

If search requirements outgrow the database's built-in FTS — fuzzy matching at scale, faceted search, vector similarity beyond what the database's vector extension can handle — migrate to a dedicated search index (OpenSearch, Typesense, Meilisearch). Do this only when built-in FTS is demonstrably the bottleneck, not preemptively.

### 6.8 Soft deletes

Never hard-delete tenant data. Every `DELETE` is `UPDATE ... SET deleted_at = NOW()`.

The tenant middleware automatically filters `deleted_at IS NULL` from all reads. An explicit `{ withDeleted: true }` flag can opt into including soft-deleted rows (for admin views, audit). Purging soft-deleted data is a separate, scheduled job that runs after a retention period (default 90 days).

**Exceptions:** ephemeral data (sessions, idempotency records, rate-limit counters) can hard-delete. Anything a user could ask "what happened to my X?" gets soft-deleted.

### 6.9 Optimistic locking

Every mutable entity has a `version INTEGER`. Every update increments it and checks the previous value in the WHERE clause. If affected rows = 0, the update lost the race — return `409 VERSION_CONFLICT`. The client refetches and retries with the user.

This catches the classic "two tabs open, one stale" bug without requiring pessimistic row locks. Illustrative SQL is in Appendix A.

### 6.10 Migrations

Schema changes use the ORM's migration system where possible; handwritten SQL where the ORM can't express what's needed.

**Rules for migrations at 10k+ users:**

1. **Never combine schema change and data change in the same migration.** Ship the column as nullable first (migration A). Backfill data (migration B, possibly a job). Make NOT NULL (migration C). Three deploys.
2. **Never drop columns immediately.** Rename to `{column}_deprecated_{yyyymmdd}`, let it sit for one release cycle, then drop. This protects you from "rolled back deploy that still had the old column".
3. **Create indexes concurrently.** Non-concurrent index creation locks the table.
4. **Run migrations before the deploy, not during.** The application must run against both the old and new schema during the cutover window. This is the "expand / contract" pattern (also called "parallel change").
5. **Test on a production-size database.** `EXPLAIN` on 100 rows lies. Keep an anonymised copy of prod data for migration rehearsal.
6. **Every migration has a rollback plan.** "Re-add the column" and "restore from backup" both count, but you need to know which.
7. **`CREATE TABLE` only in the schema the module owns.** No module reaches across schemas to create tables in another module's schema.

### 6.11 Connection pooling

The backend holds a single database client with a pool of connections (typically 10–20). Don't create clients per request. Other services (AI service, workers) have their own pools.

At scale, place a transaction-mode pooler (PgBouncer for Postgres, or the equivalent for your database) in front of the primary. This lets you have a small pool to the database and thousands of in-flight application connections. Do this before you need it, not after.

---

## 7. Event-driven and async patterns

### 7.1 One queue system

All async work — email, webhooks, AI calls, PDF rendering, sync jobs — goes through a single queue system. One backing store (Redis or equivalent) for queues, rate limits, and session storage. Separate logical databases within, not separate instances, until that is proven necessary.

**Do not add a second queue framework** (Kafka, RabbitMQ, SQS, "event bus") until there is a concrete capability the primary queue cannot provide. At 10k users, there is none.

### 7.2 Job design

Every job has:

* **Typed input**, validated on dequeue. Malformed payloads go straight to DLQ.
* **A timeout** — the maximum time the job may run.
* **An attempts count** — how many retries.
* **A backoff policy** — exponential with jitter is default.
* **A tenant context** — set before the handler is invoked.
* **Idempotency** — see §7.4.

A concrete illustration for a specific queue library is in Appendix A.

### 7.3 The outbox pattern (events from the database)

When a business action (entity verified, request published, project created) should trigger async work, **do not publish to the queue from inside the HTTP handler**. The handler commits the transaction, then publishes — but if the process crashes between commit and publish, the event is lost.

Instead: write the event to an `outbox` table inside the same transaction. A separate poller (the "outbox worker") reads unpublished events, publishes them to the queue, marks them as published. Retries on failure; alerts if the backlog grows.

This guarantees at-least-once delivery. Combined with idempotent consumers (§7.4), it is effectively exactly-once from the consumer's perspective.

### 7.4 Idempotency

Every queue consumer MUST be idempotent. Duplicates will happen — queues retry on timeout even if the original succeeded; the outbox worker can publish twice if its own tracking fails; network partitions happen.

Pattern: every job carries an `idempotencyKey` in its payload. The handler checks a `processed_jobs` table before doing the work; if the key is present, return the stored result. `processed_jobs` has a 7-day TTL cleaned up by a nightly job — long-lived idempotency is expensive; 7 days covers every realistic retry window.

### 7.5 Retries and backoff

| Scenario | Attempts | Backoff |
| --- | --- | --- |
| Transient network error (DNS, connection refused) | 5 | Exponential, 2s base |
| 5xx from upstream | 5 | Exponential, 2s base |
| 429 rate-limited | 10 | Use `Retry-After` if present, else exponential |
| 4xx (not 429) | 0 | DO NOT retry — caller error |
| Timeout | 3 | Exponential, 5s base |
| AI model error | 3 | Exponential, 5s base; fall back to smaller model |

After max attempts, the job goes to a **dead-letter queue** with its original payload and error history. DLQ is monitored (alerts when entries exceed a threshold per hour per queue) and manually replay-able from an admin panel.

### 7.6 Pub/sub within the monolith

Inside the monolith, modules communicate via an in-process event bus for fire-and-forget notifications.

**Rules:**

* Event names: `{domain}.{past-tense-verb}` — `entity.verified`, `request.published`, `project.cancelled`.
* Events are typed.
* Handlers that do I/O MUST be enqueued to the queue, not run inline. The event bus is only for "tell module B something happened"; the actual work is a queued job.
* Events describe what happened (past tense). They do not command what should happen.

When a module extracts into its own service, these events become queue messages across services. The naming survives.

### 7.7 Scheduled jobs

Use the queue's repeatable-jobs feature, not cron containers. Cron containers drift with deploys and don't scale. Repeatable jobs live in the queue's state, survive deploys, and can be paused / resumed from an admin UI.

Scheduled jobs that iterate over tenants use the outbox pattern: emit one event per tenant into the outbox, process each tenant independently. Do not loop over all tenants in one giant job — one slow tenant blocks everyone.

---

## 8. Failure modes and resilience

### 8.1 Timeouts on everything

Every network call has an explicit timeout. There are no infinite waits anywhere. Defaults:

| Call type | Timeout |
| --- | --- |
| Internal HTTP (backend ↔ AI service) | 10s |
| Outbound HTTP to known-fast APIs | 5s |
| Outbound HTTP to known-slow APIs (registries, third-party checks) | 30s |
| Database query | 15s |
| AI inference (inside a job) | 60s |
| Job total runtime | Varies, always set |

Defaults are in the shared HTTP client; overrides are per-call-site and require a comment justifying why.

### 8.2 Circuit breakers

Every dependency on a separately-deployed thing (AI service, third-party APIs, email provider) has a circuit breaker. After N consecutive failures within M seconds, the breaker opens for T seconds — subsequent calls fail immediately rather than waiting for timeouts.

Defaults: N = 5 failures, M = 10 seconds window, T = 30 seconds open. Tune per dependency based on observed behaviour.

This protects both the caller (not wasting threads on a known-dead service) and the callee (not being retry-stormed when it comes back up).

### 8.3 Bulkheads

Don't let one slow dependency drown the service. Isolate:

* AI calls go through a queue — they never hold an HTTP handler open.
* External API calls run in separate worker pools from user-facing request handling.
* Long-running jobs run on separate worker processes from the HTTP server, with a separate database connection pool.

At scale, this means a separate deployment tier for workers vs API. At the current scale, it means workers is its own service with its own containers, even if the code is shared.

### 8.4 Graceful degradation

User-facing paths must have a working answer even if downstream systems are down:

* AI service down → show a banner, let users fall back to manual forms; read-only routes still work.
* Email provider down → enqueue the email with extra retries, return success to the user; they find out when they check their inbox, not when they click "send".
* Search index stale → return with a warning, let users sort / filter instead.

The pattern: separate "this action succeeded" from "this action had all its side-effects happen synchronously". The user-facing path returns success as soon as the durable record is committed. Side effects are async.

### 8.5 Backpressure

When a queue backlog grows, the upstream producer must slow down or shed load. Either:

* **Rate limit at the producer** — cap new work creations when the backlog exceeds a threshold.
* **Fail fast at the producer** — return `503 BACKPRESSURE` to the client with a `Retry-After` header.

Never let a queue grow unbounded. Monitor queue depth; alert at 1,000 / 10,000 / 100,000 thresholds per queue. Unbounded growth is how you find out the queue's memory is exhausted at 3am.

### 8.6 Correlation IDs

Every request has a correlation ID (`X-Correlation-Id` header; generate one if not provided). It propagates through:

* All outbound HTTP calls (add header)
* All log lines (required field)
* All queue jobs (include in job payload)
* All audit log entries (include in row)

This is how you debug "what happened on that one request last Tuesday". Without correlation IDs, distributed debugging is guesswork.

---

## 9. Observability

Observability is not optional at 10k users. You will not remember what the system was doing yesterday. Logs, metrics, and traces are the product.

### 9.1 Structured logs

Every log line is JSON with fixed required fields: `timestamp`, `level`, `service`, `correlationId`, `tenantId`, `userId`, `message`, and any relevant business identifiers.

**Rules:**

* Never log PII (emails, phone numbers, addresses) in clear text. Hash if needed for correlation.
* Never log secrets or tokens.
* Never log entire request bodies; log the fields you care about explicitly.
* Log levels: `fatal` (process will exit), `error` (request failed, investigate), `warn` (degraded), `info` (business event), `debug` (dev only, off in prod).

Aggregate logs with a hosted service — never "look at files on the server". At 10k users you'll have millions of lines per day.

### 9.2 Metrics

Export Prometheus-style metrics (or the equivalent for your monitoring stack). Minimum set:

* `http_requests_total{route, method, status, tenant}` — counter
* `http_request_duration_seconds{route, method}` — histogram
* `queue_jobs_total{queue, status}` — counter
* `queue_job_duration_seconds{queue}` — histogram
* `queue_depth{queue}` — gauge
* `db_query_duration_seconds{operation}` — histogram
* `external_api_calls_total{service, status}` — counter
* Business metrics: sign-ups, verifications, matches, invitations — one counter per significant event

### 9.3 Distributed tracing

Every request generates a trace. Every service participates in the trace via OpenTelemetry (or an equivalent standard). Traces include: HTTP handler spans, database query spans, external HTTP calls, queue enqueue and dequeue.

Sample at 100% for errors, 10% for successful requests at the current scale. Sampling percentages are tunable.

### 9.4 Alerting

Alert on symptoms, not causes:

* API error rate above 1% for 5 minutes → page
* p95 latency above 2× baseline for 10 minutes → page
* Queue depth above threshold for 15 minutes → page
* External dependency circuit breaker open for 5 minutes → page
* DLQ entry rate above threshold → page

Cause-based alerts (CPU high, memory high) are noisy and low-signal at this scale.

### 9.5 Audit logging

Every state-changing action produces an audit log entry: `who, what, when, from where, correlation ID`. Audit is separate from application logging — audit is a compliance artifact and has different retention (typically 7 years) and different access controls (append-only, no update or delete).

Audit tables partitioned monthly, retained for 7 years, and revoked from application roles at the database level.

---

## 10. Disaster recovery

### 10.1 RTO and RPO targets

| Target | Value | Meaning |
| --- | --- | --- |
| **RTO** (Recovery Time Objective) | **4 hours** | Maximum acceptable downtime before service is restored |
| **RPO** (Recovery Point Objective) | **1 hour** | Maximum acceptable data loss window |

These targets apply to the primary application database and job queue. Static assets served from CDN have an effective RTO of minutes (CDN failover is automatic).

Adjust RTO / RPO in an ADR when a project's contractual obligations differ.

### 10.2 What gets backed up and how

| Asset | Method | Frequency | Retention |
| --- | --- | --- | --- |
| Primary database | Point-in-time recovery (provider) | Continuous | 7 days |
| Primary database | Full backup to cold storage | Weekly | 90 days |
| Job queue state | Snapshot | Every 15 min | 24 hours |
| Secrets | Managed by secret manager — no separate backup needed | — | — |
| Application code | Git + container registry | Every deploy | Indefinite |

### 10.3 Runbook: database restore

1. Confirm incident scope — is this data corruption, deletion, or hardware failure?
2. Identify the restore point: for accidental deletion, use PITR to 5 minutes before the incident. For hardware failure, use the most recent snapshot.
3. Restore to a staging instance first; verify data integrity with queries against affected tables.
4. Promote the restored instance to primary (connection string swap via environment variable).
5. Run smoke tests. Check the application error rate in your observability platform.
6. Write a post-mortem within 48 hours ([Incident-Response.md](Incident-Response.md) §7). Update this runbook if the process was incorrect.

### 10.4 Declaring a disaster

A disaster is declared when:

* Primary database is unavailable for > 30 minutes with no ETA, OR
* Data loss is confirmed or suspected, OR
* The incident cannot be resolved by the on-call engineer without specialist escalation.

When declared: notify stakeholders within 15 minutes, begin the restore runbook, open a dedicated incident channel (see [Incident-Response.md](Incident-Response.md)).

---

## 11. Scaling timeline

Current architecture is sized for **≤ 50k monthly active users** on a single-region deployment. Below is what changes at each scale threshold — use as a planning horizon, not a to-do list.

### 11.1 At 10k MAU (current target)

* Monolith + 4 extracted services ✓
* Single primary database with read replica ✓
* One queue system on a shared backing store ✓
* Single region deployment ✓
* Vertical scaling is sufficient for all services

**Watch for:** slow query warnings (>500ms), queue depth growing without draining, p95 API latency climbing above 800ms.

### 11.2 At 50k MAU

No structural changes needed. Tune before you scale:

* Add database connection pooling if connection count exceeds 80% of the database's max
* Move large blob storage out of the database if blob columns appear in query plans
* Review cache hit rates — anything below 80% is leaving performance on the table
* Add a second read replica if read queries are saturating the first

**Likely first bottleneck:** database connection pool exhaustion or a hot query without an index.

### 11.3 At 100k MAU

Begin planning these changes (6–12 month horizon):

| What | Why | How |
| --- | --- | --- |
| Extract the notification service | High write volume, independent scaling, separate failure domain | Meets all three extraction criteria; move to dedicated service + queue |
| Introduce a dedicated search index | Native full-text search at this scale saturates the primary database | Add Typesense / Meilisearch / OpenSearch; sync via outbox events |
| Evaluate multi-region | Latency SLOs become harder to meet from a single region | Route read traffic to nearest region; writes stay primary |
| Formalise on-call rotation | 1 person can no longer cover all incidents | Two-person on-call with documented escalation |
| SOC 2 Type II audit | Enterprise customers will require it | 6-month observation period; engage a readiness firm |

**Likely first bottleneck:** search latency, or a single large tenant monopolising database I/O (review tenant resource quotas).

### 11.4 At 500k MAU+

Major architectural evolution required — this is Series B+ territory:

* Database sharding or move to a distributed database
* Multi-region active-active with a conflict resolution strategy
* Dedicated data warehouse — OLAP queries off primary database
* API gateway with per-tenant rate limits enforced at the edge
* CQRS for the most read-heavy entities

**At this scale, revisit every architectural decision in this document with a fresh set of eyes.** The trade-offs change significantly.

---

## 12. Security defaults

This section is a summary. [Security.md](Security.md) is the canonical deep reference; it owns the detailed rules. Where a rule appears in both, Security.md wins.

### 12.1 Authentication

* Users authenticate with email + password (bcrypt or equivalent, cost 12+) or OAuth (Google, Microsoft).
* Sessions are opaque server-side tokens (random 256 bits, stored server-side with TTL). Not JWTs — see [Security.md](Security.md) §4.1 for why.
* JWTs are fine for service-to-service, not for user sessions. Session revocation is too important to hand to "wait for expiry".
* MFA via TOTP. Required for `owner` and `admin` roles, optional for others.
* Session TTL: 30 days, refreshed on activity. Hard cap 90 days, then reauth.

Detailed rules: [Security.md](Security.md) §2.

### 12.2 Authorization

* Default-deny. Endpoints without an explicit role decorator return 403.
* Never check roles inside the handler — always via middleware.
* Authorisation logic lives in one place, tested, and audited. No "just this one time I'll check inline".

Detailed rules: [Security.md](Security.md) §3.

### 12.3 API keys

* Tenant-scoped, role-scoped, and optionally resource-scoped.
* Hashed at rest (Argon2 or equivalent). Shown to the user once at creation.
* Have a last-used-at, rotation reminder, and optional expiry.
* Can be revoked instantly.

Detailed rules: [Security.md](Security.md) §5.

### 12.4 Secrets

Secrets live in environment variables at runtime, sourced from the platform's secret store. Never in code. Never in container images. Never in logs. Never in error messages.

Detailed rules: [Security.md](Security.md) §5 and [Container-Guidelines.md](Container-Guidelines.md) §4.

### 12.5 Input validation

Every request body is validated with a schema library at the route boundary. Unvalidated input never reaches business logic.

Detailed rules: [Security.md](Security.md) §6.

### 12.6 Output encoding and content security

* JSON responses never include unescaped user content in error messages.
* HTML never renders user content without escaping.
* CSP headers, restrictive by default.
* CORS: explicit allow-list of origins, not `*`. Credentialed requests only from configured frontend origin.

Detailed rules: [Security.md](Security.md) §7.

### 12.7 Rate limits — security angle

Already covered in §5.10. Re-listed here because it's a security control, not just a UX control. Rate limits defend against brute force, credential stuffing, and runaway scripts.

### 12.8 Injection defences

* SQL injection: parameterised queries only. Raw SQL requires explicit placeholders; never string concatenation.
* XSS: framework auto-escapes; unescaped HTML rendering requires code review.
* CSRF: double-submit cookie pattern for session-authenticated state-changing requests. API-key requests are immune (keys are in `Authorization` header, not cookies).

Detailed rules: [Security.md](Security.md) §8.

---

## 13. AI service integration

The AI service is architecturally distinct because it has different failure and scaling properties. This section covers the rules for how it integrates with the rest of the system.

### 13.1 The backend is the system of record, always

The AI service is **stateless**. It does not own any database tables. All state lives in the backend's database. The AI service calls back into the backend via HTTP for anything it needs to know about tenants, entities, requests.

Why: AI workloads are bursty and flaky. You do not want a service with volatile uptime to hold data. The AI service restarting or going down should not affect what a user sees in their profile.

### 13.2 All AI work is async

No HTTP handler ever awaits an AI call inline. Pattern:

1. User triggers an AI action (e.g., "score this entity").
2. Backend creates a `JobRecord` in the database with status `pending`, returns a job URL to the client.
3. Backend enqueues a job.
4. Worker pops the job, calls the AI service over HTTP with a 60s timeout.
5. Worker receives result, writes to the database, updates `JobRecord` to `completed`, emits event.
6. Client polls `/jobs/{id}` or subscribes to a WebSocket for the completion event.

This gives you: retry logic for free, no frontend timeouts, observability of AI cost per tenant, backpressure when the AI service is slow.

### 13.3 Model and provider abstraction

All calls to LLM APIs go through a shared client that:

* Adds correlation ID and tenant ID to every call.
* Logs token usage per call, per tenant.
* Implements fallback (primary model fails → smaller model → cached response → graceful error).
* Enforces per-tenant rate limits on token spend.

Never call provider SDKs directly from route handlers. Always go through the abstraction. This is how you change providers without rewriting 40 endpoints.

Model tiers, escalation, and cost discipline in day-to-day development are in [AI-Workflow.md](AI-Workflow.md).

### 13.4 MCP auth and rate limits

The MCP server exposes resource data to external AI agents via Model Context Protocol. Its trust model is different from the backend's:

* **Auth:** OAuth 2 access tokens with explicit scopes (e.g., `entity.read`, `request.read`). Never a user session.
* **Rate limits:** stricter than human-facing routes. 30 req/min default, 10 req/min for heavy operations. AI agents retry aggressively if not rate-limited.
* **Data exposure:** only explicitly-flagged public-or-shared fields. Everything else returns 404 to MCP clients.
* **Logging:** every MCP request is audit-logged with the agent's OAuth app ID, not just the tenant.

The MCP server is effectively an external-facing public API with extra stringency. Treat any data reachable via MCP as published to the internet by the tenant, because functionally it is.

### 13.5 AI output validation

Treat AI output like untrusted user input:

* **Validate shape:** run every AI response through a schema before persisting. If the model "almost" returned valid JSON, reject and retry — do not heroics-parse.
* **Validate content:** if the AI is supposed to return a score 0–100, clamp and validate. If it's supposed to categorise into 5 enum values, reject anything else.
* **Cap length:** every AI-generated string has a max length enforced server-side, even if the prompt said "max 500 chars".
* **Never trust AI output for authorisation decisions.** AI can *recommend* "grant access" but a human or a deterministic rule makes the call.

Prompt-injection defences: [Security.md](Security.md) §8.

### 13.6 Cost accounting

Every AI call records: model used, input tokens, output tokens, cached tokens (if applicable), cost in USD (computed from a versioned provider pricing table in the repo), tenant ID, user ID, job ID.

Roll up daily per tenant. Expose in admin. This is how you find the single tenant burning 80% of your AI budget before accounting does.

---

## 14. Deployment and environments

### 14.1 Environments

Three, no more:

| Env | Purpose | Data |
| --- | --- | --- |
| `dev` | Local development via container orchestration | Seed data, throwaway |
| `staging` | Pre-production verification | Anonymised prod snapshot |
| `prod` | Production | Real data |

No `qa`, `uat`, `demo`, `preprod` — they become stale and nobody trusts them. If you need a sandbox for enterprise clients, it's a tenant *inside* prod with feature flags.

### 14.2 Configuration via environment variables

Every difference between environments is an environment variable. The code in `prod` is bit-identical to the code in `staging`. Never `if (env === 'prod')` in code — that's how you ship bugs that only show up in prod.

Twelve-factor. Read environment variables in one place, validate schema on boot, fail fast if missing. Export a typed config object; nothing else reads environment variables directly.

### 14.3 Migrations at deploy time

Migrations run as a pre-deploy step, not inside the application startup. Sequence:

1. Run the migration tool against the target environment's database.
2. Deploy the new application image.
3. Old instances drain, new instances start.

The application must be compatible with **both** the old and new schema during the overlap window. This is why §6.10 requires expand / contract: any schema change has to be additive first.

### 14.4 Zero-downtime deploys

* Healthchecks on every service (`/healthz` for liveness, `/readyz` for readiness).
* Graceful shutdown: on SIGTERM, stop accepting new requests, drain in-flight requests (up to 30s), close database connections, exit.
* Rolling deploy: replace instances one at a time, not all at once.
* Session state in a shared store so a user's session survives an instance being replaced.
* No long-running requests in the HTTP path (enforced by the 10s timeout default).

### 14.5 Rollback plan

Every deploy has a rollback:

1. Re-deploy the previous container image tag.
2. If the deploy included a schema migration that cannot be reversed, do **not** roll back — roll forward with a fix.

This is why §6.10 rule 2 ("never drop columns immediately") matters — it keeps rollback available for a release window.

### 14.6 Feature flags

Use a flag service (LaunchDarkly, Flagsmith, or a simple home-grown table) for:

* Rolling out features to specific tenants first
* Disabling features quickly when something breaks
* A/B testing where relevant
* Kill switches for expensive operations

**Rule:** every risky change ships behind a flag. "Risky" means: touches money, touches PII, touches the hot path, or is the first deploy of a new pattern.

---

## 15. Decision log (ADR process)

All architecturally significant decisions are recorded as ADRs at the project root with the `DECISION-` prefix. The canonical template is [TEMPLATE-Decision.md](TEMPLATE-Decision.md). Process (when to write, how to review, how to supersede) is [Documentation.md](Documentation.md) §4.

**When to write an ADR:**

* Introducing a new framework, language, database, or third-party service
* Changing the tenant isolation model
* Changing the ID format, timestamp format, or money representation
* Adding a new service to the topology
* Changing the versioning scheme
* Deviating from a standard in this pack (mandatory — see §18 and [README.md](README.md) §3)
* Anything else future-you will ask "why did we do it this way?" about

**When NOT to write an ADR:**

* Bug fixes
* Refactors that preserve behaviour and intent
* Stack-specific choices where the standards are silent (which HTTP client library, which lint rule set)

ADRs are numbered and never renumbered. Superseded ADRs stay in the repo with a `Superseded by DECISION-XXXX` link — the history matters.

---

## 16. Anti-patterns

Things this architecture explicitly rejects.

### 16.1 Extracting services because "microservices are modern"

Symptom: a small module gets its own service before it meets any of the three extraction criteria in §2.3.

Reality: if there's no measured reason (§2.3), extracting it creates network overhead, deploy complexity, and a distributed transaction problem — in exchange for no benefit. Leave it in the monolith.

### 16.2 Premature event-driven everything

Symptom: every business action becomes an event, every event has three listeners, and debugging "what happened when the user clicked Save" requires reading 8 different log streams.

Reality: events are great for fan-out. They're terrible for "module A should do X and then module B should do Y as a logical continuation". If the work is logically synchronous (user waits, error must be surfaced), keep it synchronous. Use events for things that are genuinely async and fire-and-forget.

### 16.3 Stringly-typed statuses

Symptom: `entity.status = 'verified'` in one place, `'VERIFIED'` in another, `'Verified'` in a third. Enum-typed config that expands with every PR.

Reality: use database enums or ORM enums. Enforce at the type level. Fuzzy strings leak casing bugs and become impossible to rename.

### 16.4 Cache-first reads

Symptom: someone added a cache on a path and now there's a bug where stale entity data shows up for 5 minutes.

Reality: add caching **only** when profiling shows the database is the bottleneck, and only behind an explicit invalidation strategy. Default to no cache. The database is faster than you think.

### 16.5 "Just one more field" JSONB columns

Symptom: `settings JSONB` on every table, loaded with 50 keys nobody documents.

Reality: JSONB (or your database's equivalent) is correct for genuinely variable, per-row-custom data (tenant-specific field extensions, AI-generated metadata). It's wrong for "we didn't want to do a migration this sprint". If a field applies to all rows and is ever queried, it's a column.

### 16.6 Mega-migrations

Symptom: one PR that adds 3 tables, renames 5 columns, drops an index, and backfills a column "because they're related".

Reality: each schema change is its own migration. Each one is reversible. Each one is reviewable. Mega-migrations are how you end up at 11pm on a Saturday restoring from backup.

### 16.7 Distributed monoliths

Symptom: three services, but deploying any of them requires deploying the others. They share a database. They call each other synchronously for every request.

Reality: you have a monolith with network overhead. Either merge them back into one deployable, or do the work to make them actually independent (own database, async communication, independent deploy).

### 16.8 "Temporary" scripts in production

Symptom: a one-off script that backfills data, kept around "in case we need it again".

Reality: every one-off script is either a migration (run once, checked in, tracked) or a job (repeatable, tested, monitored). There is no third category. Scripts in `/scripts` that nobody maintains are time bombs.

### 16.9 Hardcoded tenant IDs in config

Symptom: "the demo tenant" has a hardcoded ULID in the codebase. Someone seeded it once.

Reality: there is no such thing as a hardcoded tenant in a multi-tenant system. The demo tenant is created by a seed script. The script is idempotent. Everything references it by slug (`demo`), never by ID.

### 16.10 Auth in the route handler

Symptom: `if (req.user.role !== 'admin') return res.status(403).end();` inside a handler.

Reality: authorisation belongs in middleware, tested in isolation, applied uniformly. Handlers that check auth inline are handlers where someone will forget to check auth.

### 16.11 Offset pagination on large tables

Already covered in §5.6. Listed again because it's the single most common scaling failure in B2B SaaS.

### 16.12 Swallowed exceptions

Symptom: `try { ... } catch (e) { /* ignore */ }` or `catch (e) { logger.info('something went wrong'); }`.

Reality: errors are information. Either handle them meaningfully (retry, degrade, surface to user) or let them propagate. Silent catches are how you discover bugs 6 weeks later from user complaints.

### 16.13 "Let's give the AI service direct DB access for speed"

Symptom: the AI service gains direct database access "because HTTP is slow".

Reality: now you have two sources of truth for schema, two places where migrations happen, two places to enforce tenant isolation, and no clear contract between services. Keep the backend as the database owner. HTTP is not slow at internal-network latency.

### 16.14 Logs as the only observability

Symptom: when something breaks, the answer is always "let me grep the logs".

Reality: logs are for debugging specific requests. Metrics are for knowing the system's health. Traces are for understanding cross-service behaviour. You need all three. Grepping logs at 10k users is a time sink.

### 16.15 Scheduled jobs as cron containers

Symptom: a container whose entrypoint is `cron` and a crontab. It sometimes runs jobs. Sometimes it doesn't. Nobody is sure why.

Reality: use the queue (§7.7). Cron containers don't survive deploys, don't have retry semantics, don't have observability, and don't scale horizontally.

---

## 17. Review checklist

Before merging any PR that touches architecturally significant code — APIs, schemas, services, queues — run this checklist. The reviewer's version, with severity-ladder guidance for how to phrase findings, is [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.1.

### Data model

* [ ] Every new table has `id` (ULID), `tenant_id`, `created_at`, `updated_at`, `deleted_at`, `version`
* [ ] Every foreign key has an index
* [ ] Every query hit-path has an index that covers the WHERE clause
* [ ] Migration is additive (expand); destructive changes deferred to a later migration (contract)
* [ ] Migration creates indexes concurrently
* [ ] No `ON DELETE CASCADE` on tenant-scoped tables
* [ ] Tenant isolation enforced at middleware level, not just in handlers

### API

* [ ] URL is `/api/v{N}/{resources}/{id}` with plural kebab-case
* [ ] New endpoints documented in OpenAPI / docs
* [ ] Request body validated at the boundary
* [ ] Errors use the standard envelope with a registered `code` (see [API-Design.md](API-Design.md) §3.1)
* [ ] Mutating endpoints accept `Idempotency-Key` header (when applicable)
* [ ] Pagination uses cursor, not offset
* [ ] Breaking changes ship as `/v{N+1}/`, not edits to `/v{N}/`
* [ ] Rate-limit rules set appropriately for the endpoint

### Security

* [ ] Authentication middleware applied
* [ ] Authorisation middleware with explicit required role
* [ ] No user-controlled `tenant_id` anywhere
* [ ] No secrets in code, logs, or error messages
* [ ] All inputs validated, all outputs escaped where rendered

### Async / jobs

* [ ] Handlers don't await slow operations inline (AI, email, external APIs)
* [ ] New jobs are idempotent (check processed-jobs table)
* [ ] Timeouts, attempts, and backoff set explicitly
* [ ] Events follow `domain.past-tense-verb` naming
* [ ] Cross-tenant iteration uses per-tenant jobs, not one mega-job

### Observability

* [ ] Every log line has `correlationId`, `tenantId`, `userId` (or is explicitly system-scoped)
* [ ] New routes emit `http_requests_total` and `http_request_duration_seconds` metrics
* [ ] Significant new operations have their own span or metric
* [ ] Mutations write audit log entries
* [ ] No PII in logs

### Failure modes

* [ ] Every network call has a timeout
* [ ] Retries only on 5xx and network errors, never 4xx
* [ ] External dependency has a circuit breaker
* [ ] Graceful degradation considered — what happens if this dependency is down?
* [ ] Dead-letter queue behaviour defined

### Deployment

* [ ] Migration + code can run side-by-side (expand / contract respected)
* [ ] Rollback plan documented (even if "roll forward with a fix")
* [ ] Feature flag on risky paths
* [ ] `/healthz` and `/readyz` still work

### Documentation

* [ ] ADR written for architecturally significant decisions
* [ ] README updated for new services, env vars, or setup steps
* [ ] API changes reflected in external docs

If every box is ticked: ship it. If any are unticked: fix before merging, not "in a follow-up".

---

## 18. Deviating from this standard

Standards in this pack are binding ([README.md](README.md) §3). Real projects find real reasons to deviate — a legacy service with a different tenancy model, a proof-of-concept that doesn't warrant all the ceremony, a scale that changes what's economical. When you deviate:

1. **Write an ADR** using [TEMPLATE-Decision.md](TEMPLATE-Decision.md). State which section of this doc you're deviating from, why the deviation is justified in this project's context, what alternatives you considered, and what the trade-offs are.
2. **Get review** from a principal engineer.
3. **Link the ADR** from the project's `docs/adr/` index and from the PR that introduces the deviation.
4. **Revisit** during the quarterly pack review. Deviations that persist across multiple projects are a signal this standard itself should be updated.

An ADR is not a rubber stamp; it is the reviewable justification. Reviewers can and do reject deviations they don't find justified. Deviations without an ADR are review blockers.

---

## Appendix A — Stack-specific illustrations

The main body of this doc is stack-agnostic. This appendix contains concrete illustrations of how the rules apply to specific stacks. Illustrations are not normative — they are examples of how the *intent* of the rule maps to a real codebase. When a project uses a different stack, the rule still applies; the illustration adapts.

### A.1 Illustrative directory layout for a Node + TypeScript modular monolith

```
backend/src/
├── modules/
│   ├── auth/           # login, sessions, invites
│   ├── tenants/        # orgs, members, roles
│   ├── entities/       # resource profiles, onboarding
│   ├── requests/       # requests, matching, shortlists
│   ├── reviews/        # reviewer evaluations, decisions
│   ├── projects/       # contracts, deliverables
│   ├── messaging/      # inbox, threads
│   ├── notifications/  # email, in-app
│   └── billing/        # plans, invoices
├── shared/
│   ├── db/             # Database client, tx helpers
│   ├── queue/          # Queue clients
│   ├── http/           # HTTP wrapper with timeouts, retries
│   ├── auth/           # session guards, tenant guard
│   ├── errors/         # error classes, error middleware
│   ├── logger/         # structured logger, correlation IDs
│   └── telemetry/      # OpenTelemetry setup
└── server.ts           # entry point
```

Each module exports through a narrow `public.ts` file. Cross-module imports go through `public.ts` only; direct reach-in imports are a review blocker.

### A.2 Illustrative example stack baseline

```
backend/       Node.js 20 + Express + TypeScript + Prisma
frontend/      React 18 + Vite + TailwindCSS
ai-service/    Python 3.12 + Pydantic AI + FastAPI
mcp-server/    Node.js 20 (MCP protocol implementation)
containers/    Container files per service
```

Other stacks are equally valid; the rules in the main body don't depend on this specific choice.

### A.3 Illustrative HTTP client wrapper (TypeScript / axios)

```ts
// shared/http/client.ts
import axios from 'axios';
import axiosRetry from 'axios-retry';

export function createClient(baseURL: string, opts: ClientOpts = {}) {
  const c = axios.create({
    baseURL,
    timeout: opts.timeoutMs ?? 10_000,  // hard default 10s
    headers: { 'User-Agent': `app-backend/${VERSION}` },
  });

  axiosRetry(c, {
    retries: opts.retries ?? 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => (
      axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error)
    ),
  });

  c.interceptors.request.use(injectTraceHeaders);
  c.interceptors.request.use(injectTenantHeader);
  c.interceptors.response.use(null, normaliseError);

  return c;
}
```

### A.4 Illustrative queue job definition (BullMQ / TypeScript)

```ts
export const sendEmailJob = defineJob({
  name: 'notifications.send-email',
  schema: z.object({
    tenantId: z.string().ulid(),
    to: z.string().email(),
    templateId: z.string(),
    variables: z.record(z.unknown()),
    idempotencyKey: z.string(),
  }),
  timeout: 30_000,
  attempts: 5,
  backoff: { type: 'exponential', delay: 2_000 },
  handler: async (data) => {
    await withTenant(data.tenantId, async () => {
      await emailProvider.send({ ... });
    });
  },
});
```

### A.5 Illustrative optimistic-lock SQL (Postgres)

```sql
UPDATE entities.entities
   SET name = $1, version = version + 1, updated_at = NOW()
 WHERE id = $2 AND tenant_id = $3 AND version = $4;
```

If affected rows = 0, return `409 VERSION_CONFLICT`.

### A.6 Illustrative outbox table (Postgres)

```sql
CREATE TABLE jobs.outbox (
  id              TEXT PRIMARY KEY,
  tenant_id       TEXT NOT NULL,
  aggregate_type  TEXT NOT NULL,
  aggregate_id    TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  payload         JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at    TIMESTAMPTZ NULL,
  attempts        INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_outbox_unpublished
   ON jobs.outbox (created_at)
WHERE published_at IS NULL;
```

### A.7 Illustrative audit table with partitioning (Postgres)

```sql
CREATE TABLE audit.audit_log (
  id              BIGSERIAL,
  tenant_id       TEXT NOT NULL,
  user_id         TEXT NULL,
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       TEXT NULL,
  correlation_id  TEXT NOT NULL,
  ip_address      INET NULL,
  user_agent      TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);
```

Partition monthly. Retain for 7 years (legal, contractual). Never delete. Audit entries are append-only — no UPDATE, no DELETE. Revoke those rights at the DB-role level.

---

*Owner: Gaurav Bhatnagar · Next review: 1 October 2026*
