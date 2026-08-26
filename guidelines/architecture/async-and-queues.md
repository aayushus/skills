# Architecture: Async Processing & Background Queues

This document defines standards for background processing, worker queues, and event reliability.

---

## 1. The 1-Second Rule

**Any operation taking longer than 1,000ms MUST execute asynchronously in a background worker.**

The main HTTP request/response thread must never block on:
- Sending transactional emails or SMS notifications
- Generating PDFs, reports, or data exports
- Calling slow external APIs or AI/LLM models
- Large batch data updates or migrations
- Image processing or file transcoding

**Response Pattern:** Return `202 Accepted` immediately with a Job ID or polling/status endpoint, and process work off-thread.

---

## 2. Queue Payload Design

1. **Pass Identifiers, Not State**: Store only the record ID and tenant ID in the job payload. Fetch the latest state from the database inside the worker handler.
   ```json
   // ✅ Good: Lightweight, fetches latest state
   { "jobId": "job_01H...", "tenantId": "org_123", "orderId": "ord_456" }

   // ❌ Bad: Stale data, bloated queue memory
   { "jobId": "job_01H...", "orderData": { "status": "pending", "items": [...] } }
   ```
2. **Include Trace Metadata**: Propagate `correlationId` and `tenantId` across queue boundaries to maintain end-to-end observability.

---

## 3. Idempotency & Concurrency

All background job handlers must be **idempotent** (running the job multiple times produces the exact same side-effects as running it once).

### 3.1 Idempotency Key Pattern
```ts
async function processWebhookJob(job: Job<WebhookPayload>) {
  const { idempotencyKey, payload } = job.data;

  // 1. Check if already processed
  const existing = await db.processedJobs.findUnique({ where: { key: idempotencyKey } });
  if (existing) return existing.result;

  // 2. Execute mutation inside a transaction
  return await db.$transaction(async (tx) => {
    const result = await executeBusinessLogic(tx, payload);
    await tx.processedJobs.create({ data: { key: idempotencyKey, result } });
    return result;
  });
}
```

---

## 4. Retries, Backoff & Dead Letter Queues (DLQ)

1. **Exponential Backoff with Jitter**:
   - Max retries: 5 attempts.
   - Initial delay: 2 seconds, doubling per attempt with random jitter:
     $$\text{delay} = \text{initialDelay} \times 2^{\text{attempt}} + \text{randomJitter}(0, 1000\text{ms})$$
2. **Transient vs. Non-Transient Errors**:
   - Retry on: Network dropouts, 5xx server errors, rate limits (429 with backoff).
   - Fail immediately (no retry) on: 4xx client validation errors, malformed payloads.
3. **Dead Letter Queue (DLQ)**:
   - When a job exceeds its maximum retries, move it to a dedicated DLQ.
   - Trigger an alert to engineering with payload, stack trace, and correlation ID.
   - Provide an administrative replay tool to re-queue resolved DLQ items.

---

## 5. Worker Concurrency & Graceful Shutdown

- **Concurrency Caps**: Set explicit concurrency limits per worker based on memory and database connection pool size.
- **Graceful Shutdown**: Intercept `SIGTERM` and `SIGINT`. Stop pulling new jobs, allow in-flight jobs up to 30 seconds to finish, then close database connections.
