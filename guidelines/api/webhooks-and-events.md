# API: Webhooks, Event Delivery & Idempotency

This document defines standards for receiving and delivering webhooks safely and reliably.

---

## 1. Inbound Webhook Handling

When receiving webhooks from third parties (e.g., Stripe, GitHub, Clerk):

1. **Verify Signature Immediately**: Compute HMAC-SHA256 over the raw request buffer using the shared webhook secret. Compare signatures using a constant-time equality check:
   ```ts
   import crypto from 'crypto';

   export function verifyWebhookSignature(payload: Buffer, signature: string, secret: string): boolean {
     const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
     return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
   }
   ```
2. **Immediate Acknowledgment**: Return `200 OK` or `202 Accepted` within 2 seconds. Do not execute heavy business logic in the HTTP handler.
3. **Queue Event**: Insert the raw event into a background job queue or database table for asynchronous processing.
4. **Idempotency Check**: Check event ID against previously processed event IDs to prevent duplicate actions from webhook retries.

---

## 2. Outbound Webhook Delivery

When sending webhooks to customer endpoints:

### 2.1 Payload & Signature Standard
Send a signed header containing a timestamp and HMAC-SHA256 signature to prevent replay attacks:
```http
POST /customer-webhook-endpoint HTTP/1.1
Host: api.customer.com
Content-Type: application/json
X-Signature-Timestamp: 1713182400
X-Signature-V1: a8f7b5...39e1
X-Delivery-Id: del_01HQKR...

{
  "event": "project.created",
  "timestamp": "2026-04-15T12:00:00.000Z",
  "data": {
    "id": "proj_01HQKR...",
    "name": "Acme Redesign"
  }
}
```

### 2.2 Signature Calculation
$$\text{Signature} = \text{HMAC-SHA256}(\text{key} = \text{endpointSecret}, \text{data} = \text{timestamp} + "." + \text{rawJsonBody})$$

---

## 3. Outbound Retry & Failure Policy

1. **Retry Schedule**: Use exponential backoff with jitter across a 48-hour delivery window:
   - Attempt 1: Immediate
   - Attempt 2: 5 minutes
   - Attempt 3: 30 minutes
   - Attempt 4: 2 hours
   - Attempt 5: 6 hours
   - Attempt 6: 12 hours
   - Attempt 7: 24 hours
   - Attempt 8: 48 hours (Final)
2. **Dead Letter Queue (DLQ)**: If all 8 attempts fail, move the delivery to the customer's webhook DLQ and record the final HTTP status code and response body.
3. **Automatic Endpoint Disabling**: If an endpoint fails continuously for 7 days, mark the webhook subscription as `SUSPENDED` and notify the customer admin via email.
