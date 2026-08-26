# API: REST Contracts, Envelopes & Rate Limiting

This document defines standards for REST API conventions, wire contracts, pagination, and client resilience.

---

## 1. REST Conventions & Versioning

- **Resource-Oriented URLs**: Use plural nouns for resources (`/api/v1/projects`, `/api/v1/users`).
- **Standard HTTP Methods**:
  - `GET`: Read-only, safe, idempotent.
  - `POST`: Create resource or trigger non-idempotent action (`/api/v1/projects/proj_123/publish`).
  - `PUT`: Full replacement of resource (idempotent).
  - `PATCH`: Partial update of resource (idempotent).
  - `DELETE`: Soft or hard removal (idempotent).
- **URL Versioning**: Prefix all public and internal API endpoints with the major version (`/api/v1/`).
  - Additive changes (new optional fields) do NOT bump major versions.
  - Breaking changes (field renaming, type changes, endpoint removal) require a new version (`/api/v2/`).

---

## 2. Standard JSON Envelopes

### 2.1 Error Envelope (All 4xx and 5xx Responses)
```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Invalid request parameters provided.",
    "correlationId": "req_01HQKR789...",
    "details": [
      {
        "field": "email",
        "reason": "Must be a valid email address format"
      }
    ]
  }
}
```

### 2.2 Success Envelope (Single Entity)
```json
{
  "data": {
    "id": "proj_01HQKR...",
    "name": "Acme Redesign",
    "status": "ACTIVE",
    "createdAt": "2026-04-15T12:00:00.000Z"
  }
}
```

### 2.3 Paginated List Envelope (Cursor-Based)
**Rule:** Use cursor-based pagination for large or frequently updated collections. Never use `OFFSET / LIMIT` on large datasets (avoids $O(N)$ scan degradation and page drift).

```json
{
  "data": [
    { "id": "proj_01HQKR...", "name": "Acme Redesign" }
  ],
  "pagination": {
    "nextCursor": "eyJpZCI6InByb2pfMDFIUU..." ,
    "hasMore": true,
    "totalCount": 142
  }
}
```

---

## 3. Rate Limiting & Throttling

Implement rate limiting on all public API endpoints using a **Sliding Window** or **Token Bucket** algorithm (e.g., in Redis).

### 3.1 Rate Limit Headers
Every response must include standard rate limiting headers:
```http
HTTP/1.1 200 OK
RateLimit-Limit: 100
RateLimit-Remaining: 94
RateLimit-Reset: 1713182400
```

When exceeded, return `429 Too Many Requests` with a `Retry-After` header (in seconds):
```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: application/json

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry after 60 seconds.",
    "correlationId": "req_01HQKR..."
  }
}
```

---

## 4. Third-Party API Resilience & Circuit Breakers

1. **Explicit Timeouts**: Every outbound HTTP request must have a hard timeout configured:
   - Internal microservices: $\le 5\text{s}$
   - Fast external APIs (Stripe, Twilio): $\le 10\text{s}$
   - Slow / AI Model APIs: $\le 30\text{s} - 60\text{s}$
2. **Circuit Breakers**: When calling a flaky external provider:
   - **Trip Condition**: 5 consecutive failures or $> 50\%$ failure rate over a 1-minute window.
   - **Open State**: Fail immediately for 30 seconds without attempting outbound network calls.
   - **Half-Open**: Allow 1 trial request through to test provider recovery.
