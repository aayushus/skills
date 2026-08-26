# Testing: Strategy, Pyramid & Isolation

This document defines standards for test levels, mocking boundaries, database isolation, and CI quality gates.

---

## 1. The Testing Pyramid

Adhere to a **70 / 20 / 10** distribution:

```
        / \
       /   \      10% — E2E & Smoke Tests (Full user flows in browser/Playwright)
      /-----\
     /       \    20% — Integration Tests (Real test DB, HTTP routes, module seams)
    /---------\
   /           \  70% — Unit Tests (Pure functions, domain calculations, schema validation)
  /-------------\
```

---

## 2. Unit Testing Standards (70%)

- **Target**: Pure business logic, validation schemas, data transformations, utility math.
- **Constraints**: No database calls, no network I/O, no filesystem dependencies.
- **Speed**: Individual unit tests should execute in $< 5\text{ms}$. Full unit suite in $< 10\text{s}$.
- **Naming Standard**:
  ```ts
  describe('calculateDiscount', () => {
    it('should apply 20% discount when user has VIP membership', () => {
      const result = calculateDiscount({ tier: 'VIP', amount: 100 });
      expect(result).toBe(80);
    });

    it('should throw ValidationError when amount is negative', () => {
      expect(() => calculateDiscount({ tier: 'VIP', amount: -10 })).toThrow();
    });
  });
  ```

---

## 3. Integration Testing & DB Isolation (20%)

Integration tests verify that domain modules, repositories, and API routes work correctly with real dependencies.

### 3.1 Database Isolation Strategy
1. **Fresh Tenant per Test Suite**: Every test file/suite generates a random `testTenantId = generateId()` to guarantee data isolation.
2. **Transaction Rollbacks / Truncation**: Run each test inside a database transaction that rolls back on completion, or execute `TRUNCATE` across test tables between runs.
3. **No Cross-Test State Leakage**: Tests must create their own prerequisite seed data. Never rely on state left behind by a previous test.

---

## 4. Mocking Guidelines

| What to Mock | What NOT to Mock |
|---|---|
| 3rd-party APIs (Stripe, Twilio, SendGrid) | Internal database queries in integration tests |
| External LLM / AI model endpoints | Validation schemas (Zod/Pydantic) |
| Current time / timers (`vi.useFakeTimers()`) | Cryptographic hashing / token generation |
| File system I/O (in unit tests) | Module boundaries during integration tests |

**Rule:** Mock at the network layer (e.g., using `msw` or HTTP client interceptors) rather than monkey-patching deep internal functions.

---

## 5. CI Quality Gates

Every pull request must pass the automated CI pipeline before merge:
- [ ] **Typecheck**: `tsc --noEmit` passes with 0 errors.
- [ ] **Linter**: `eslint` / code linter passes with 0 warnings/errors.
- [ ] **Unit & Integration Tests**: 100% passing.
- [ ] **Coverage Threshold**: $\ge 70\%$ line coverage on new/modified code.
