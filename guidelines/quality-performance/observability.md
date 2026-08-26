# Observability: Structured Logging, Tracing & Metrics

This document defines standards for structured logging, correlation ID propagation, and distributed tracing.

---

## 1. Structured JSON Logging

**All logs in production must be single-line structured JSON written to `stdout`.**

Never use unstructured text logging (`console.log("User logged in: " + id)`).

### 1.1 Standard JSON Schema
Every log entry must conform to the following schema:
```json
{
  "timestamp": "2026-04-15T12:00:00.000Z",
  "level": "INFO",
  "message": "Project created successfully",
  "correlationId": "req_01HQKR789...",
  "tenantId": "org_123",
  "userId": "usr_456",
  "service": "api-gateway",
  "durationMs": 42,
  "context": {
    "projectId": "proj_789",
    "status": "ACTIVE"
  }
}
```

---

## 2. Correlation ID Propagation

Maintain an unbroken trace of execution across system boundaries:

```
[Client Request] (X-Correlation-Id: req_01HQ...)
       ↓
[HTTP Middleware] (Attaches req.correlationId)
       ↓
[Database Query] (Appends /* correlationId: req_01HQ... */)
       ↓
[Queue Producer] (Job payload includes correlationId)
       ↓
[Worker Consumer] (Worker logs with correlationId)
```

1. **HTTP Ingestion**: If the incoming request has `X-Correlation-Id`, adopt it; otherwise, generate a new ULID/UUID v7.
2. **HTTP Response**: Always echo `X-Correlation-Id` in the response headers.
3. **Queue Jobs**: Always include `correlationId` in the job payload.

---

## 3. Log Levels & Usage

| Level | When to Use | Alerting Policy |
|---|---|---|
| **DEBUG** | Fine-grained diagnostic info (disabled by default in prod). | None |
| **INFO** | Normal business milestones (user signup, payment success, deployment). | None |
| **WARN** | Degraded performance, high retries, or handled recoverables. | Aggregated metrics |
| **ERROR** | Unhandled exceptions, failed DB writes, or external API outages. | Real-time notification |
| **FATAL** | Service cannot start, database is unreachable, unrecoverable crash. | Immediate on-call page |

---

## 4. Sensitive Data Redaction

The logger must automatically sanitize sensitive keys:
- **Redacted Keys**: `password`, `token`, `secret`, `authorization`, `creditCard`, `ssn`, `apiKey`.
- **Rule**: Replace sensitive values with `"[REDACTED]"` before JSON serialization.

---

## 5. Metrics & Error Tracking

1. **Error Tracking (e.g., Sentry)**: Capture all uncaught exceptions with full stack trace, environment, and user context.
2. **Standard Service Metrics**:
   - RED Metrics for HTTP: **Rate** (req/sec), **Errors** (count & %), **Duration** (p50, p95, p99 latency).
   - USE Metrics for Infrastructure: **Utilization**, **Saturation**, **Errors**.
