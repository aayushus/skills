# Architecture: Database Design, Tenancy & Migrations

This document defines standards for schema design, multi-tenant isolation, and zero-downtime database evolution.

---

## 1. Primary Keys & Identifiers

Align on a consistent primary key strategy across all tables:

| ID Strategy | When to Use | Advantages |
|---|---|---|
| **ULID / UUID v7** | Default recommendation for B2B/SaaS | Time-ordered, URL-safe, non-enumerable, index-friendly |
| **UUID v4** | Distributed systems with existing UUID conventions | Globally unique, opaque |
| **BigInt (Auto-Increment)** | Internal monolithic systems with low enumeration risk | Compact storage, fast sequential inserts |

**Rule:** Never expose sequential integer IDs in public URLs or APIs to prevent enumeration / scraping attacks.

---

## 2. Multi-Tenancy Isolation

If the project is multi-tenant:

1. **Explicit `tenantId` on Every Tenant Row**: Every table holding customer data must have a `tenantId` foreign key referencing the tenant/organization.
2. **Session-Derived `tenantId`**: Derive `tenantId` strictly from the authenticated session/token context. Never accept `tenantId` from URL route parameters or request bodies.
3. **Composite Indexing**: Create composite indexes with `tenantId` as the leading column for tenant-scoped lookups:
   ```sql
   CREATE INDEX idx_projects_tenant_status ON projects (tenant_id, status);
   ```
4. **Row-Level Security (RLS) / Middleware**: Enforce tenant filtering at the database layer (e.g., Postgres RLS) or via ORM query extensions/middleware.

---

## 3. Data Integrity & Deletion Strategy

- **Soft Deletes by Default**: Default to soft deletes using a nullable `deleted_at TIMESTAMPTZ` column for business-critical entities.
- **Unique Constraints with Soft Deletes**: When using unique constraints on soft-deleted tables, use partial indexes:
   ```sql
   CREATE UNIQUE INDEX uq_tenant_user_email 
   ON users (tenant_id, email) 
   WHERE deleted_at IS NULL;
   ```
- **Hard Deletes**: Reserve hard deletes for transient records (e.g., expired verification tokens, rate limit counters) or strict GDPR/right-to-be-forgotten requests.
- **Parameterized Queries**: Always use ORM methods or parameterized queries. Never concatenate variables into SQL strings.

---

## 4. Zero-Downtime Migrations (Expand-and-Contract)

Never make breaking database changes in a single deployment. Always use the **Expand-and-Contract** pattern across three phases:

```
Phase 1: Expand       → Add new column/table as nullable. Deploy app that writes to both old & new.
Phase 2: Backfill     → Backfill historical data in small batches via background worker.
Phase 3: Contract     → Switch app to read from new column. Deprecate & safely drop old column.
```

### 4.1 Adding a Non-Nullable Column
1. **Deployment 1 (Expand)**: Add the column as `NULLABLE` (with optional default). Deploy code that writes to the new column.
2. **Backfill**: Run a background job updating existing rows in batches of 1,000 to avoid table locks.
3. **Deployment 2 (Contract)**: Apply `ALTER TABLE ... ALTER COLUMN SET NOT NULL`.

### 4.2 Renaming a Column
1. **Deployment 1 (Expand)**: Add the new column name. Update application to write to both columns and read from the old column.
2. **Backfill**: Copy historical values from old to new column.
3. **Deployment 2 (Cutover)**: Update application to read from the new column.
4. **Deployment 3 (Contract)**: Remove dual-writing code and drop the old column.

### 4.3 Safe Index Creation
In PostgreSQL, always create indexes concurrently on production tables:
```sql
CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders (created_at);
```
*(Avoids exclusive table write locks during index generation).*
