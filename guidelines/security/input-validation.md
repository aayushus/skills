# Security: Input Validation & Injection Defense

This document defines standards for boundary validation, sanitization, and defense against injection vulnerabilities.

---

## 1. Boundary Schema Validation

**Validate 100% of inputs at all system boundaries (HTTP request bodies, query params, headers, webhook payloads, and queue messages).**

### 1.1 Strict Schema Rules (e.g., Zod / Pydantic)
1. **Strip Unknown Keys**: Enforce strict validation (`.strict()` in Zod) to reject unexpected parameters and prevent mass-assignment attacks.
2. **Mandatory Length Caps**: All string fields must have explicit minimum and maximum lengths to prevent payload-based Denial of Service (DoS):
   ```ts
   import { z } from 'zod';

   export const CreateUserInput = z.object({
     name: z.string().trim().min(1).max(100),
     email: z.string().trim().email().max(255),
     bio: z.string().max(1000).optional(),
     role: z.enum(['MEMBER', 'ADMIN']),
   }).strict();
   ```

---

## 2. Injection Defenses

### 2.1 SQL / NoSQL Injection
- **Rule**: Use ORM methods or parameterized queries exclusively.
- **Forbidden**: Never concatenate or interpolate user input directly into SQL strings:
  ```ts
  // ❌ Vulnerable to SQL Injection
  db.$queryRawUnsafe(`SELECT * FROM users WHERE email = '${email}'`);

  // ✅ Safe: Parameterized query
  db.$queryRaw`SELECT * FROM users WHERE email = ${email}`;
  ```

### 2.2 Cross-Site Scripting (XSS)
- **HTML Auto-Escaping**: Rely on React/Vue/Svelte template auto-escaping.
- **Rich Text / Raw HTML**: If user-submitted HTML must be rendered, sanitize using an allowlist sanitizer (e.g., `DOMPurify`) with strict element and attribute policies.
- **Content Security Policy (CSP)**: Set strict HTTP CSP headers (`script-src 'self'`).

### 2.3 Server-Side Request Forgery (SSRF)
When fetching user-provided URLs (e.g., webhook testing, link unfurling, image scraping):
1. Parse the URL protocol (allow `https://` only; reject `file://`, `gopher://`, `ftp://`).
2. Resolve DNS and **block private/internal IP ranges**:
   - `127.0.0.0/8` (Localhost)
   - `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` (Private RFC1918)
   - `169.254.169.254` (Cloud Instance Metadata Service)
   - `::1` (IPv6 localhost)

---

## 3. Safe File Uploads

1. **Verify MIME Types by Magic Bytes**: Do not rely on client-supplied `Content-Type` headers or file extensions alone. Inspect the initial buffer magic numbers.
2. **Randomize Filenames**: Generate a new UUID/ULID for the stored filename on the server. Never write user-supplied filenames to disk (prevents path traversal `../../`).
3. **Private Object Storage**: Store uploaded files in an S3-compatible bucket or dedicated blob store with private access. Serve via authenticated presigned URLs or a dedicated CDN.
