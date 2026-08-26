# Quality: Code Standards, Typing & Error Handling

This document defines standards for code craft, readability, type safety, and error handling.

---

## 1. Core Principles

1. **Clarity Beats Cleverness**: Code is read 100x more than it is written. A straightforward function any developer can understand in 30 seconds beats an opaque "clever" one-liner.
2. **Delete More Than You Add**: Code is a liability. Every line must be tested, secured, and maintained. Leave files cleaner than you found them.
3. **Make the Wrong Thing Hard**: Use the type system and domain constraints so that invalid states cannot compile or execute.

---

## 2. File & Function Limits

- **Files**: Aim for $\le 300$ lines. Hard cap at $500$ lines. If a file exceeds 500 lines, it has more than one responsibility.
- **Functions**: Aim for $\le 40$ lines. Hard cap at $80$ lines.
- **Parameters**: Functions should accept at most 3 positional arguments. Use a typed options object for 4+ arguments.

---

## 3. Naming Conventions

- **Descriptive Purpose**: Names describe *what* or *why*, not implementation details (`activeUsers` vs `cachedUserList`).
- **Boolean Prefixes**: Always prefix boolean variables with `is`, `has`, `can`, or `should` (`isActive`, `hasPermission`, `canEdit`).
- **No Ambiguous Abbreviations**: Avoid `usr`, `mgr`, `ctx` (unless React Context), `btn`. Use full words (`user`, `manager`, `button`).

---

## 4. Strict Type Safety (TypeScript)

- **Compiler Flags**: Always enable `strict: true` and `noUncheckedIndexedAccess` in `tsconfig.json`.
- **No `any`**: Never use `any`. Use `unknown` with type guards or union narrowing:
  ```ts
  // ❌ Unsafe: bypasses type checking
  function parseData(input: any) { return input.name; }

  // ✅ Safe: type narrowing with schema validation
  function parseData(input: unknown): string {
    const parsed = UserSchema.parse(input);
    return parsed.name;
  }
  ```
- **No TypeScript `enum`**: Use string literal union types instead of `enum`:
  ```ts
  // ❌ Generates runtime JavaScript boilerplate
  enum Status { Active = 'ACTIVE', Inactive = 'INACTIVE' }

  // ✅ Zero runtime overhead, clean type checking
  export type Status = 'ACTIVE' | 'INACTIVE';
  ```

---

## 5. Error Handling: Exceptions vs. Result Types

| Error Type | What It Means | Handling Strategy |
|---|---|---|
| **Programming Errors** (Bugs) | Null pointer, DB connection dead, out of memory | **Throw Exception**. Let global error middleware catch, log structured trace, and return `500`. |
| **Domain / Expected Failures** | User not found, validation error, insufficient funds | **Return Result Type** (`{ success: true, data } \| { success: false, error }`). |

### 5.1 Result Pattern Example
```ts
export type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E };

export function transferFunds(input: TransferInput): Result<Transaction, TransferError> {
  if (input.balance < input.amount) {
    return { ok: false, error: new InsufficientFundsError() };
  }
  const tx = executeTransfer(input);
  return { ok: true, value: tx };
}
```

---

## 6. Code Hygiene

- **No Commented-Out Code**: Delete dead code. Git history preserves previous versions.
- **No `console.log` in Production Paths**: Use the structured logger (`logger.info`, `logger.error`).
- **Early Returns**: Avoid deeply nested `if/else` blocks by returning early on edge conditions:
  ```ts
  // ✅ Clean guard clause
  if (!user) return null;
  if (!user.isActive) return null;
  return user.profile;
  ```
