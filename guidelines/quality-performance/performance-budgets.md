# Performance: Budgets, Caching & Core Web Vitals

This document defines performance budgets, caching strategies, and Core Web Vitals (CWV) thresholds.

---

## 1. Performance Budgets (Hard Caps)

Every feature must operate within these production performance budgets:

| Metric / Interaction | Target Budget | Enforcement Point |
|---|---|---|
| **UI Response (Click, Input, Toggle)** | $\le 100\text{ms}$ | Frontend profiling / INP |
| **API Read (Single entity, cached)** | $p95 < 200\text{ms}$ | API monitoring & alerting |
| **API Read (Paginated list)** | $p95 < 300\text{ms}$ | API monitoring & alerting |
| **API Write (Mutating action)** | $p95 < 300\text{ms}$ | API monitoring & alerting |
| **Database Query (Indexed lookup)** | $\le 10\text{ms}$ | Database slow-query log |
| **Largest Contentful Paint (LCP)** | $\le 2.5\text{s}$ | Lighthouse / Core Web Vitals |
| **Interaction to Next Paint (INP)** | $\le 200\text{ms}$ | Lighthouse / Core Web Vitals |
| **Cumulative Layout Shift (CLS)** | $\le 0.1$ | Lighthouse / Core Web Vitals |
| **Initial JS Bundle (Gzipped)** | $\le 170\text{KB}$ | CI bundle analyzer |
| **Initial CSS Bundle (Gzipped)** | $\le 30\text{KB}$ | CI bundle analyzer |

---

## 2. Database Query Optimization & N+1 Prevention

1. **Prevent N+1 Queries**: Always eager-load related records using ORM relations (`include`, `select`, or DataLoader) instead of querying inside loops:
   ```ts
   // ❌ N+1 query vulnerability: 1 query for projects + N queries for users
   const projects = await db.project.findMany();
   for (const p of projects) {
     p.owner = await db.user.findUnique({ where: { id: p.ownerId } });
   }

   // ✅ 1 single query with SQL JOIN / batch fetch
   const projects = await db.project.findMany({
     include: { owner: true }
   });
   ```
2. **Mandatory Indexing**: Add database indexes for:
   - Foreign key columns used in `JOIN` conditions.
   - Columns in `WHERE` filtering clauses.
   - Columns in `ORDER BY` sorting clauses.
3. **Analyze Query Plans**: Run `EXPLAIN ANALYZE` on any query that runs $> 20\text{ms}$ in staging to ensure an `Index Scan` (not `Seq Scan`) is used.

---

## 3. Caching Strategy

### 3.1 Cache-Aside Pattern (Redis)
Use the Cache-Aside pattern for frequently accessed, slow-to-calculate reads:
1. Check cache for key (`project:proj_123`).
2. If hit: return cached data immediately ($< 5\text{ms}$).
3. If miss: query database, write to cache with explicit TTL (Time-To-Live), and return.

### 3.2 Invalidation over Long TTLs
- Set explicit TTLs on all cached keys (e.g., 5 to 60 minutes).
- Explicitly delete/invalidate cache keys upon mutation (`POST / PUT / PATCH / DELETE`).

### 3.3 HTTP Caching Headers
- Static assets (images, hashed JS/CSS): `Cache-Control: public, max-age=31536000, immutable`.
- Authenticated user data: `Cache-Control: private, no-cache, no-store, must-revalidate`.

---

## 4. Frontend Bundle & Asset Discipline

1. **Code Splitting**: Dynamically import routes and heavy dialogs/drawers using React `lazy()` or framework dynamic imports.
2. **Image Optimization**: Serve modern image formats (WebP/AVIF) with explicit `width` and `height` attributes to eliminate Layout Shift (CLS).
3. **Font Loading**: Preload critical UI fonts with `font-display: swap`.
