---
name: api-design-standards
description: The binding standards for API design — versioning, error envelopes, list responses, webhooks (idempotency, retries, signing), and cross-service communication. Applies to every public API and every cross-service call. Complements Architecture.md §5 (which owns system-level API shape); this doc owns the wire-level details.
---

# API Design Standards

**Version 2.0** · Last updated 1 July 2026

This is the binding standard for how APIs are shaped, versioned, and exchanged. Deviations require an ADR ([README.md](README.md) §3).

> **See also:** [Architecture.md](Architecture.md) §5 — system-level API design (this doc is the wire-level companion) | [Security.md](Security.md) §5 — API keys, service credentials, and webhook signing | [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.6 — reviewer checklist for API changes

---

## Changelog

**v2.0 (1 July 2026):**

* **Scoped explicitly against Architecture.md §5.** The previous version overlapped substantially with the API-design section of the Architecture doc — same content, two homes, guaranteed to drift. Now: Architecture.md §5 owns system-level shape (versioning strategy, resource design, breaking-change protocol). This doc owns wire-level details (error envelope, list envelope, webhook mechanics, cross-service auth). Cross-references go both ways.
* **Removed hardcoded "Express ↔ FastAPI" section title.** The previous §5 was titled "Cross-Service Communication (Express ↔ FastAPI)" — pinning a supposedly generic standard to two specific frameworks. Renamed to "Cross-service communication" with the stack-specific note moved to Appendix A.
* **Reframed the versioning-strategy content** as a pointer to Architecture.md §5.3 rather than duplicating it. The version-numbering rules were identical in both docs.
* **Added ADR clause (§6)** — pack-wide pattern.
* **Added YAML frontmatter** for skill loading.
* **Tightened the "success envelope" section** — was only shown for lists. Clarified that non-list responses do not require an envelope; wrapping single-resource responses adds noise without value.

---

## 1. Principles

**1.1 Pragmatic REST.** Follow RESTful principles where they make sense (resource-based URLs, standard HTTP methods) but prioritise developer experience over academic purity.

**1.2 Versioning is mandatory.** No API is ever "final." Version from day one to allow for breaking changes without breaking clients. The strategy is in [Architecture.md](Architecture.md) §5.3.

**1.3 Fail predictably.** Errors follow a strict schema so consumers (frontend, other services, AI systems) can handle them programmatically.

**1.4 Idempotency by default.** Every mutating operation must be safe to retry. Non-idempotent operations require an ADR and a documented mitigation.

---

## 2. Versioning

Versioning strategy, breaking-change protocol, and sunset policy live in **[Architecture.md](Architecture.md) §5.3** and are canonical there. This doc doesn't duplicate them.

**Wire-level rule that lives here:** every response includes the responding API version in a `X-API-Version` header. Consumers assert on the version they expected; a mismatch is a fail-loud signal, not a silent shrug.

---

## 3. Request & Response Standards

### 3.1 Error envelope

All error responses (4xx and 5xx) must follow this JSON structure:

```json
{
  "error": {
    "code": "ENTITY_NOT_FOUND",
    "message": "The entity with ID '01H...' was not found.",
    "correlationId": "01HQKR...",
    "details": {
      "field": "entityId",
      "reason": "Invalid ULID format"
    }
  }
}
```

Rules:

* `code` is a stable machine-readable identifier. Never change a `code` value; deprecate and add a new one instead.
* `message` is human-readable. It can change over time and is not part of the API contract.
* `correlationId` is the request's trace ID and is required on every error response.
* `details` is optional and contains structured, machine-usable diagnostics — never a stack trace, never internal system names, never anything that leaks implementation.

### 3.2 List envelope

List responses are wrapped to allow for metadata and pagination:

```json
{
  "data": [ ... ],
  "pagination": {
    "nextCursor": "eyJ...",
    "hasMore": true,
    "totalCount": 1250
  }
}
```

`totalCount` is optional — for large collections where computing the count is expensive, omit it and set `hasMore` to signal continuation.

### 3.3 Single-resource responses

Single-resource responses (GET /entities/{id}, POST /entities, PATCH /entities/{id}) return the resource directly without an envelope. Wrapping a single resource in `{ "data": {...} }` adds ceremony without value and diverges from the shape most clients expect.

---

## 4. Webhooks

### 4.1 Idempotency

All mutating webhooks must support the `Idempotency-Key` header.

* If a request is received with a key that has been processed in the last 24 hours, return the original response without re-processing.
* Keys are opaque to the receiver; do not parse or infer meaning.
* Consumers are responsible for choosing keys stable across their retry cycle.

### 4.2 Retries (outbound webhooks)

* **Backoff:** exponential with jitter.
* **Retry budget:** max 8 attempts over 48 hours.
* **DLQ:** if all retries fail, the payload moves to a dead-letter queue and the tenant is alerted through the tenant-notification channel.

### 4.3 Signing

All outbound webhooks must be signed. The signing scheme, header names, and rotation policy are in [Security.md](Security.md) §5.7.

---

## 5. Cross-service communication

When one service calls another (backend → AI service, worker → API, etc.):

* **Authentication:** service-to-service JWTs, short-lived (max 15 minutes), scoped to the specific operation. Long-lived static tokens are a review blocker.
* **Timeouts:** every cross-service call has an explicit timeout. Sensible defaults: 30 seconds for AI/LLM calls, 5 seconds for standard service calls. Timeouts without a specific justification are a review blocker.
* **Circuit breakers:** if a service fails 5 times in 1 minute, open the circuit for 30 seconds. This is a floor; adjust per criticality.
* **Retries:** only retry idempotent operations. For non-idempotent operations, fail loudly and surface the error.
* **Correlation:** propagate the correlation ID header on every outbound call so a single logical request can be traced across services.

Stack-specific patterns and library defaults are in Appendix A.

---

## 6. Deviating from this standard

Standards in this pack are binding ([README.md](README.md) §3). If a project has good reason to deviate — for example, a legacy service that already has a differently-shaped error envelope and can't be changed without a client migration — write an ADR using [TEMPLATE-Decision.md](TEMPLATE-Decision.md). Deviations without an ADR are review blockers.

---

## Appendix A — Stack-specific illustrations

The rules above are stack-agnostic. The following patterns illustrate how they map to common stacks; they are not normative.

**Correlation-ID header** — commonly named `X-Correlation-ID`, `X-Request-ID`, or `traceparent` (W3C Trace Context). Prefer `traceparent` for new services so tracing tools work out of the box.

**Service-to-service JWTs** — issued by an internal auth service or the identity provider. Scope claims should name the specific operation (e.g., `scope: "orders.read"`), not broad categories.

**Circuit breakers** — most language ecosystems have a mature library (Resilience4j, polly, opossum, tenacity, etc.). Pick one per language and standardise.

**Timeouts** — most HTTP clients default to no timeout or an unreasonably long one. Set the timeout explicitly at the client-configuration layer; do not rely on ambient defaults.

---

*Owner: Gaurav Bhatnagar · Next review: 1 October 2026*
