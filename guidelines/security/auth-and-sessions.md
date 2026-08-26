# Security: Authentication, Sessions & RBAC

This document defines standards for identity verification, session management, and authorization controls.

---

## 1. Password Hashing & Credentials

- **Algorithm**: Use modern memory-hard hashing functions:
  - **Argon2id** (Recommended default: $m=64\text{MB}, t=3, p=4$)
  - **bcrypt** (Cost factor $\ge 12$)
- **Never Use**: MD5, SHA-1, SHA-256, or unsalted hashes for user passwords.
- **Timing Attack Defense**: Use constant-time comparison algorithms (e.g., `crypto.timingSafeEqual`) when validating API tokens, secrets, or verification codes.

---

## 2. Session Management

| Strategy | When to Use | Key Requirements |
|---|---|---|
| **Server-Side Opaque Tokens (Redis/DB)** | Default for web applications & B2B SaaS | Revocable instantly, 64+ bits entropy, stored in `HttpOnly, Secure, SameSite=Lax` cookie |
| **JWTs (Stateless Tokens)** | High-throughput microservices / Service-to-Service | Short-lived ($\le 15\text{ mins}$), signed with asymmetric keys (RS256/Ed25519), strict audience & issuer validation |

### 2.1 Session Security Rules
1. **Cookie Flags**: All session cookies MUST set:
   - `HttpOnly`: Prevents access via client-side JavaScript (XSS defense).
   - `Secure`: Transmitted only over HTTPS.
   - `SameSite=Lax` (or `Strict`): Prevents CSRF attacks.
2. **Session Rotation**: Rotate session identifiers on:
   - Successful login
   - Password reset
   - Privilege change (e.g., role upgrade)
   - MFA enrollment/verification
3. **Session Invalidation**:
   - Explicit logout must invalidate the server-side record immediately.
   - Support "Log out of all devices" by invalidating all user sessions in the store.

---

## 3. Role-Based Access Control (RBAC) & IDOR Prevention

### 3.1 Authorization at the Endpoint
Never rely solely on frontend navigation guards. Every backend handler must verify permissions:
```ts
// Enforce role + tenant boundary
export async function deleteProjectHandler(req: Request, res: Response) {
  const { tenantId, userId, role } = req.session;
  const { projectId } = req.params;

  if (role !== 'ADMIN') {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } });
  }

  // Prevent Insecure Direct Object References (IDOR) by including tenantId
  const deleted = await db.project.deleteMany({
    where: { id: projectId, tenantId }
  });

  if (deleted.count === 0) {
    // Return 404 to prevent entity existence disclosure
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Project not found' } });
  }

  return res.status(200).json({ data: { success: true } });
}
```

### 3.2 Existence Leaks (404 vs. 403)
When a user attempts to access an unauthorized resource, return `404 Not Found` (or verify tenant ownership before checking fine-grained permissions) to prevent attackers from discovering valid IDs.
