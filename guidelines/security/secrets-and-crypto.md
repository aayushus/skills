# Security: Secrets Management & Cryptography

This document defines standards for secret storage, cryptographic operations, and credential hygiene.

---

## 1. Secrets Management Rules

1. **Never in Code**: Secrets, private keys, database passwords, and API tokens must never be committed to git repositories.
2. **Never in Logs**: The structured logger must sanitize known secret keys (`apiKey`, `password`, `authorization`, `token`, `secret`) before writing to stdout.
3. **Environment Injection**: Inject secrets at runtime via environment variables or a dedicated secrets manager (e.g., AWS Secrets Manager, Doppler, Vault, GCP Secret Manager).
4. **Pre-Commit Scanning**: Use automated secret scanning tools (e.g., `gitleaks`, `trufflehog`) in local pre-commit hooks and CI pipelines.

---

## 2. Cryptographic Standards

### 2.1 Encryption at Rest
- **Symmetric Encryption**: Use authenticated encryption algorithms:
  - **AES-256-GCM** (Default standard)
  - **ChaCha20-Poly1305**
- **Nonce/IV Generation**: Generate a unique, cryptographically random initialization vector (IV / Nonce) for every single encryption operation. Never reuse an IV with the same key.

### 2.2 Encryption in Transit
- Enforce **TLS 1.3** (or TLS 1.2 minimum) for all external and internal inter-service communication.
- Disallow legacy TLS 1.0/1.1 and insecure cipher suites.

### 2.3 Cryptographic Randomness
Always use cryptographically secure pseudo-random number generators (CSPRNG):
```ts
import crypto from 'crypto';

// ✅ Cryptographically secure token (32 bytes = 256 bits)
const secureToken = crypto.randomBytes(32).toString('hex');

// ❌ Insecure: predictable pseudo-random number
const insecureToken = Math.random().toString(36).substring(2);
```

---

## 3. Secret Rotation & Compromise Response

- **Regular Rotation**: Rotate production API keys, signing secrets, and database credentials on a regular schedule (e.g., every 90 days).
- **Compromise Procedure**:
  1. Revoke the compromised secret immediately in the provider dashboard.
  2. Issue a new secret and deploy to production environment variables.
  3. Inspect audit logs for unauthorized requests during the exposure window.
