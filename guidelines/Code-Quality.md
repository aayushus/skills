---
name: code-quality-standards
description: The binding standards for how code is written and reviewed at the craft level. Covers project structure, naming, language-specific conventions (TypeScript, Python), comments, error handling, logging, functions and modules, Git and commits, code-review author-side responsibilities, refactoring patterns, testing craft, performance craft, anti-patterns, and pre-commit / pre-PR checklists.
---

# Code Quality Standards

**Version 2.0** · Last updated 1 July 2026

This is the binding standard for how code is written and reviewed at the craft level. Deviations require an ADR (see [README.md](README.md) §3 and §18 below).

This doc is a **companion** to [Architecture.md](Architecture.md), [Security.md](Security.md), [Testing.md](Testing.md), and [Performance.md](Performance.md). Architecture covers system shape; security covers attack defences; testing owns the testing pyramid and tooling; performance owns budgets and SLOs; this doc covers everything in between — the daily craft of writing code that won't make you wince in six months.

**Core stance:** code is read 100× more than it's written. Optimise for the reader, not the writer. The reader is usually you, three months from now, with no memory of what you were thinking.

> **See also:** [Code-Review-Playbook.md](Code-Review-Playbook.md) — the reviewer's playbook (this doc §11 is the author's side; the Playbook is the reviewer's side and severity ladder) | [Architecture.md](Architecture.md) — service boundaries, error handling at the system level | [Security.md](Security.md) — input validation, dependency scanning | [Performance.md](Performance.md) — budgets, profiling, optimisation | [Testing.md](Testing.md) — testing tooling and pyramid | [Documentation.md](Documentation.md) — ADR process, inline documentation | [README.md](README.md) — pack stance and ADR deviation process

---

## Changelog

**v2.0 (1 July 2026):**

* **Renamed to "Code Quality Standards"** for pack terminology consistency.
* **Added YAML frontmatter** for skill loading.
* **§4 TypeScript conventions and §5 Python conventions kept in main body but reframed.** These are the substance of the doc for TS/Python projects, not just illustrations, so moving them to an appendix would gut the doc. Now clearly framed as "applies WHEN using this language" — with an explicit note that adopting a new language means adding a new section via ADR, not silently applying the TS/Python rules by analogy.
* **§11 Code review deduplicated against Code-Review-Playbook.md.** The previous version had 6 substantive subsections on review process, reviewer's job, severity, disagreement handling — all of which now live in Code-Review-Playbook. §11 here has been trimmed to author-side responsibilities only (PR description, PR size, responding to comments). Reviewers are pointed at the Playbook.
* **§13 Testing strategy deduplicated against Testing.md.** The pyramid, contract testing, E2E setup, AI/RAG evaluation, coverage enforcement, and tool defaults now live in Testing.md as canonical. This section is trimmed to *test craft* — how to write tests that pay off: arrange-act-assert, what to test vs not, naming, no shared mutable state, flake handling. Both docs cross-reference.
* **§14 Performance trimmed to code-craft level.** Budgets, SLOs, RUM, and Core Web Vitals live in Performance.md. This section keeps only what's about writing code: measure-don't-guess, N+1 avoidance, no premature optimisation, no loading-everything-into-memory, AI token accounting.
* **"When to refactor" is now §12.7** (previously an orphan subsection between §12 and §13 without a section number, invisible in the ToC).
* **§18 (new) "Deviating from this standard"** — pack-wide ADR clause.
* **Cross-references updated** — Architecture.md renumbered in its v2.0 (Disaster Recovery and Scaling promoted to §10/§11, shifting Security/AI/Deployment/etc.); updated the pointers here accordingly (e.g., "Architecture.md §10 Security defaults" → "Architecture.md §12 Security defaults").
* **Stack-agnostic reframing where possible.** The main body still uses TypeScript / Python as the worked examples (per note above), but purely-illustrative code (e.g., framework-specific Express or Prisma calls) inside the language-agnostic sections has been moved to Appendix A or generalised.

---

## Table of contents

1. [Principles](#1-principles)
2. [Project structure](#2-project-structure)
3. [Naming](#3-naming)
4. [TypeScript conventions](#4-typescript-conventions)
5. [Python conventions](#5-python-conventions)
6. [Comments and documentation](#6-comments-and-documentation)
7. [Error handling](#7-error-handling)
8. [Logging](#8-logging)
9. [Functions and modules](#9-functions-and-modules)
10. [Git and commits](#10-git-and-commits)
11. [Code review — author side](#11-code-review--author-side)
12. [Refactoring patterns](#12-refactoring-patterns)
13. [Testing craft](#13-testing-craft)
14. [Performance craft](#14-performance-craft)
15. [Anti-patterns](#15-anti-patterns)
16. [Pre-commit checklist](#16-pre-commit-checklist)
17. [Pre-PR checklist](#17-pre-pr-checklist)
18. [Deviating from this standard](#18-deviating-from-this-standard)
19. [Appendix A — Stack-specific illustrations](#appendix-a--stack-specific-illustrations)

---

## 1. Principles

Six principles, in priority order. Earlier wins when they conflict.

**1.1 Clarity beats cleverness.** A function any junior can read in 30 seconds is better than an "elegant" one-liner that takes 10 minutes to understand. The clever solution often saves three lines and costs three days. If you have to explain it in a comment to make it work, write it the boring way instead.

**1.2 Consistency beats personal preference.** When the codebase does X, do X — even if you'd prefer Y in a green field. Mixed styles cost more cognitive overhead than any single style choice. If the codebase consistency is wrong, fix it everywhere or change nothing; never half-migrate.

**1.3 Make the wrong thing hard.** Wrong code should look wrong. Type the parameter so the wrong call won't compile. Make the function private so it can't be called from where it shouldn't. Throw on invalid input rather than continuing silently. Code that allows mistakes invites them.

**1.4 Delete more than you add.** The best PR is the one that removes 200 lines while adding 50. Code is a liability — every line is a line to maintain, test, secure, and understand. When you touch a file, leave it cleaner than you found it. Deleted code can never break.

**1.5 Optimise for change, not the current shape.** Code is rarely written once and never touched. Architect for the next change you can predict, not the perfect form of the current shape. Premature abstractions cost; premature flexibility also costs. Add structure when there's a second use case, not a hypothetical third.

**1.6 Trust the linter, the type checker, the test suite.** When tooling tells you something is wrong, fix the code, not the tool. Disabling a lint rule should require the same scrutiny as disabling a security check. The tools exist because the team agreed on something — overriding silently breaks the agreement.

---

## 2. Project structure

### 2.1 Organise by domain, not by technical layer

Modules are named by what they *do* (auth, projects, tasks), not by what they *are* (controllers, services, models). This keeps changes local: when you change "how projects work", every change is in one folder. Layer-based organisation makes a single feature touch 5 folders and PR diffs impossible to review.

**Rule:** modules import from `shared/` freely, but only from another module's public export surface (typically a `public.ts` file or equivalent). This gives you the seams to refactor or extract later without ripping internals apart. See [Architecture.md](Architecture.md) §2.1 for the system-level view.

An illustrative directory layout is in Appendix A.

### 2.2 The `utils/` folder is a smell

A `utils/` (or `helpers/`, `misc/`, `common/`) folder is where well-intentioned code goes to die. Every general-purpose function added there outlives its purpose, accretes dependencies, and eventually nobody knows what's safe to delete.

If a function is genuinely shared:

* Belongs to a domain → put it in that domain module's internal helpers.
* Belongs to a technical concern (HTTP, DB, dates) → put it in `shared/{concern}/`.
* Belongs nowhere → it's probably specific to one caller; inline it.

### 2.3 File size limits

* **Aim** for < 300 lines per file.
* **Cap** at 600 lines. Past that, the file has multiple concerns; extract.
* **Exception:** generated files, config files, test files with many table-driven cases.

Long files hide bugs because reviewers stop reading carefully after the fourth screen.

### 2.4 Public API surface per module

Each module exports its public API through a single file (e.g., `public.ts` in TS, `__init__.py` re-exports in Python). Everything else in the module is private — reachable only from within the module.

This is enforced by convention (naming, code review) or by tooling (ESLint boundaries, Python import linters). Direct reach-in imports across modules are review blockers.

---

## 3. Naming

Names are the primary documentation. A well-named function needs no docstring.

### 3.1 Universal rules

* **Names describe what the thing is, not how it's implemented.** `sendEmail` not `smtpDispatch`.
* **Names describe intent, not mechanism.** `retryUntilStable` not `sleepAndRetry`.
* **Bool names read as questions.** `isVerified`, `hasCredentials`, `canPublish`. Never `flag`, `state`, `status` as boolean.
* **Plural for collections.** `users` (list) vs `user` (single).
* **Verbs for functions, nouns for values.** `getUser` (function), `currentUser` (variable). Exceptions: constructors (`User`), factories (`makeUser`), pure predicates (`isEmpty`).
* **Match the domain language, not developer jargon.** If the business calls them "matters", the code calls them `matters`, not `cases` or `records`.
* **Length scales with scope.** `i` is fine for a 3-line loop; `currentIterationIndex` is not. A top-level module export needs a full descriptive name.

### 3.2 Naming patterns by what the thing is

| Thing | Pattern | Example |
| --- | --- | --- |
| Boolean | `is` / `has` / `can` / `should` prefix | `isVerified`, `hasAccess`, `canEdit`, `shouldRetry` |
| Predicate function | Same as boolean | `isValidEmail(x)`, `hasPermission(u, p)` |
| Getter (no side effect) | `get` prefix, or noun-only | `getUser()` or `user()` |
| Fetcher (I/O involved) | `fetch` / `load` / `find` | `fetchUser`, `loadConfig`, `findDraft` |
| Setter / mutator | `set` prefix | `setActiveTenant()` |
| Command (side-effect) | Imperative verb | `publish()`, `revoke()`, `enqueue()` |
| Event (past tense) | `<domain>.<verb-ed>` | `entity.verified`, `payment.failed` |
| Handler | `handle<Event>` or `on<Event>` | `handlePaymentFailed`, `onUserSignup` |
| Factory | `make` / `create` / `build` | `makeUser`, `createSession`, `buildQuery` |
| Converter | `to<Type>` / `from<Type>` | `toCents`, `fromISOString` |
| Count | `Count` suffix | `userCount`, `errorCount` |
| Duration | Explicit units | `timeoutMs`, `retryAfterSeconds`, `sessionTtlDays` |

### 3.3 Specific traps

* **`data`, `info`, `details`, `stuff`** — meaningless. If your variable is called `data`, its type is telling you nothing. Rename to what it actually is.
* **Type-name-repeating.** `userUser`, `orderOrder`. Usually a sign of scope confusion.
* **Hungarian notation.** `strName`, `iCount`, `bIsValid`. No. Types are already declared.
* **`temp`, `tmp`.** Temporary variables have a name — what they *are*, not that they're temporary.
* **Abbreviations without a widely-known expansion.** `cfg`, `req`, `res`, `ctx` are fine (universal). `usrPrf`, `oList` are not.

### 3.4 Casing by language

Follow the language's convention. In TypeScript: `camelCase` for variables/functions, `PascalCase` for types/classes, `UPPER_SNAKE_CASE` for constants. In Python: `snake_case` for variables/functions, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants. Different languages have their own conventions; adopt the local one.

Boundary between languages: convert at the boundary. If the API uses `camelCase` JSON, the Python side maps to `snake_case` internally (typically via Pydantic aliases). Never sprinkle the wrong casing through one codebase to "match" another.

---
## 4. TypeScript conventions

This section applies **when using TypeScript**. If a project uses a different language, follow the equivalent conventions and add a new section via ADR — don't apply TS rules by analogy to a language they don't fit.

### 4.1 Strict mode, always

`tsconfig.json` runs in strict mode. `noUncheckedIndexedAccess` is the unsung hero — it forces you to handle `array[i]` returning `undefined`, which catches a huge class of off-by-one bugs. `exactOptionalPropertyTypes` prevents "undefined vs missing" mismatches. `noPropertyAccessFromIndexSignature` catches typos on dynamic property lookups.

Illustrative baseline config in Appendix A.1.

### 4.2 Types vs interfaces

* Use `type` by default.
* Use `interface` only when you need declaration merging (rare) or extending classes from external libraries.
* Never have both — pick one and apply consistently to a project.

Discriminated unions are one of the top wins in TypeScript; use them for state machines, event shapes, and any "one of N kinds" data.

### 4.3 Avoid `any`, prefer `unknown`

`any` disables the type checker for a value; once `any` is in, it spreads. `unknown` forces explicit narrowing before use:

```ts
// ✗ wrong
function parse(input: any) {
  return input.foo.bar;  // no error, but explodes at runtime
}

// ✓ right
function parse(input: unknown): { foo: { bar: string } } {
  if (typeof input !== 'object' || input === null) throw new Error('invalid');
  // ... narrow further before returning
}
```

Validate external input at the boundary with a schema library (Zod or equivalent — see [Security.md](Security.md) §6). Inside the validated boundary, you have proper types; outside (third-party API responses, `JSON.parse` output), it's `unknown` until proven otherwise.

`as` casts and `!` non-null assertions are escape hatches. Each is a runtime risk the type checker won't catch. Use sparingly; comment when used.

### 4.4 Prefer composition over inheritance

Class hierarchies in TypeScript almost always become a regret. Use functions and types.

Classes still earn their keep for:

* Long-lived objects with internal state (connection pool, cache, circuit breaker)
* Library-imposed shapes (a framework middleware class)
* Domain entities where method-on-object reads more naturally than function-with-data

### 4.5 Async / await, never raw promises

Always `async / await`. Never `.then().then().then()`. Never callbacks for new code.

* `Promise.all` for parallelism when all must succeed.
* `Promise.allSettled` when partial failure is acceptable — inspect each result and act accordingly.

### 4.6 Use `readonly` everywhere it fits

`readonly` doesn't change runtime behaviour but stops accidental mutation. The cost is one keyword; the benefit is a class of bugs that can't happen. Use `readonly` on object properties that shouldn't change after construction, and `ReadonlyArray<T>` for function parameters you don't intend to mutate.

### 4.7 Enums

TypeScript `enum` has runtime quirks (numeric enums leak both ways, `const enum` is problematic with `isolatedModules`). Prefer **string literal unions** or **`as const` objects**:

```ts
// ✓ literal union — preferred
type ProjectStatus = 'pending' | 'verified' | 'rejected' | 'archived';
```

Avoid numeric `enum` and `const enum`.

### 4.8 Linting

ESLint with `@typescript-eslint/strict` + `eslint-plugin-import` + a project-specific ruleset. Mandatory rules include: `no-floating-promises`, `no-misused-promises`, `no-explicit-any` (error level), `prefer-const`, `no-restricted-imports` (enforce module boundaries), and `no-restricted-syntax` (ban `eval`, `with`).

Format with Prettier default config. Don't fight Prettier; the time you spend on style debates is time not spent shipping.

---

## 5. Python conventions

This section applies **when using Python**. If a project uses a different language, follow the equivalent conventions and add a new section via ADR.

### 5.1 Python version and tooling

* **Python 3.12+** for new code. Old type-hint syntax (`List[str]`) is fine in legacy; new code uses `list[str]`.
* **Type hints everywhere** — public function signatures, class attributes, complex local variables. mypy in `strict` mode.
* **Ruff** for lint + format (replaces black, isort, flake8, autoflake; faster and unified).
* **Pyright** alongside mypy for stricter inference if desired; otherwise mypy alone.

Illustrative `pyproject.toml` in Appendix A.2.

### 5.2 Type hints

* Public API of every module is fully typed.
* Internal helpers can skip types only when inference is obvious.
* `Any` is banned outside boundaries (parsing third-party JSON, dynamic dispatch). Validate with Pydantic at the boundary; inside, types are real.
* Use `Literal`, `TypedDict`, `Protocol`, `TypeGuard` aggressively — modern Python's type system is genuinely powerful.

Use built-in generics (`list[str]`, `dict[str, int]`) not the legacy `typing.List`.

### 5.3 Pydantic for data validation

For any external input (HTTP request body, queue message payload, third-party API response, AI output), validate with Pydantic v2.

**Rules:**

* Always `model_config = ConfigDict(extra='forbid')` (rejects unknown fields — defends against mass assignment; see [Security.md](Security.md) §6.2).
* Always explicit max lengths on strings.
* Use `EmailStr`, `HttpUrl`, `constr` with patterns rather than hand-rolling.

### 5.4 Dataclasses vs Pydantic

| Use | When |
| --- | --- |
| `@dataclass(frozen=True)` | Internal value objects with no validation needed |
| `pydantic.BaseModel` | Anything crossing a trust boundary, anything serialised to / from JSON |
| `NamedTuple` | Simple immutable tuples; iteration matters |
| Plain `class` | Long-lived objects with behaviour |
| `dict` | Genuinely dynamic key-value data; rare |

Default to `@dataclass(frozen=True)` for internal data. Reach for Pydantic when validation matters.

### 5.5 Async, but only where it earns its keep

FastAPI (or equivalent async framework) makes HTTP handlers `async def`. Inside, `await` on async I/O.

**But:** don't make everything `async def` reflexively. Pure-CPU functions (parsing, sorting, computing scores) should be plain `def`. They run faster and are easier to test. Wrap in `async def` only when the caller is async and you're calling other async things.

For genuinely-CPU-bound work that needs to not block (image processing, large parsing), use `asyncio.to_thread` or a process pool. Never run heavy CPU work directly in an async handler — it blocks the event loop and freezes other requests.

### 5.6 Error handling — narrow exceptions

Never bare `except:` (catches `SystemExit` and `KeyboardInterrupt`). Almost never bare `except Exception:` — the only defensible place is the absolute outermost layer of a worker process where you log and re-raise.

Catch what you expect; let the rest propagate:

```python
try:
    result = do_thing()
except (TimeoutError, ConnectionError) as e:
    logger.warning("transient error, retrying", exc_info=e)
    raise
```

### 5.7 Idioms to prefer

* `enumerate` when you need an index
* List / dict / set comprehensions for transformation (readable more often than `map` / `filter`)
* Generator expressions for memory efficiency
* Unpacking (`first, *rest = items`)
* Context managers (`async with db.transaction() as tx:`) for resources

### 5.8 Avoid mutable default arguments

```python
# ✗ classic bug — the SAME list is used across every call
def add_tag(project_id: str, tags: list[str] = []) -> None:
    tags.append(get_tag())

# ✓ correct
def add_tag(project_id: str, tags: list[str] | None = None) -> None:
    tags = tags or []
    tags.append(get_tag())
```

Ruff catches this by default (rule `B006`). Never disable that rule.

### 5.9 Linting and formatting

Ruff (replaces black + isort + flake8 + most plugins; one tool, faster, simpler config). Mypy in strict mode alongside. Configuration illustrative in Appendix A.2.

---

## 6. Comments and documentation

### 6.1 The two valid reasons to comment

1. **Why** — the reasoning behind a non-obvious choice. The code shows *what*; the comment shows *why*.
2. **External constraint** — this code looks weird because the API requires it / the browser has a bug / the regulator demands it.

Everything else is noise:

```ts
// ✗ restates what the code does
// loop through projects
for (const p of projects) { ... }

// ✗ obviously redundant
const tenantId = req.tenantId;  // get the tenant id
```

### 6.2 Comments rot — be ready

Comments that describe *what* the code does will be wrong six months from now because the code changed and the comment didn't. Comments that describe *why* rarely rot, because the reasoning changes less often than the implementation.

When you change code, scan for comments above and around. If they're now misleading, update or delete. A wrong comment is worse than no comment.

### 6.3 TODOs and FIXMEs

Format:

* `TODO(@handle, YYYY-MM-DD):` for nice-to-have improvements
* `FIXME(TICKET-###):` for known broken behaviour that must be fixed before the next release
* Always include author or ticket reference and date — anonymous TODOs accumulate forever

CI counts FIXMEs and fails the build past a threshold (per project, e.g. > 20). Forces them to be addressed instead of accumulating.

### 6.4 Function / class doc comments

For public exported functions, write a one-line summary. For complex ones, expand — what it does, what it throws / returns, any performance or timing considerations.

For internal / private functions: a docstring isn't required if the name and signature make the purpose obvious. They usually do.

### 6.5 README per module

Every top-level module / service has a `README.md` covering:

* What it does (one paragraph)
* How to run it locally (commands, env vars needed)
* How to test it (commands)
* Where the entry points are
* Known gotchas

Not a comprehensive doc — a quickstart. Comprehensive docs live per [Documentation.md](Documentation.md).

### 6.6 ADRs for irreversible decisions

Already covered in [Documentation.md](Documentation.md) §4. For code-quality decisions specifically: when you adopt a tool (Ruff over flake8, Vitest over Jest, Prisma over TypeORM), write an ADR. Future-you will ask why; the ADR is the answer.

---

## 7. Error handling

### 7.1 Errors are values, not control flow

Errors should propagate explicitly. They shouldn't:

* Be silently swallowed
* Be caught and re-thrown as a generic "something went wrong"
* Be handled in the wrong layer (HTTP handler trying to retry a database error)

The pattern: catch errors at the **boundary** where you have enough context to act on them. Inside business logic, let them propagate.

### 7.2 Typed error classes

Create a small set of error classes representing categories of failure: `ValidationError`, `NotFoundError`, `AuthorizationError`, `ConflictError`, `ExternalServiceError`. Each carries a stable `code`, an HTTP `statusCode`, and optional `details`.

Throw these from business logic. Catch and translate at the HTTP boundary — see the error envelope in [API-Design.md](API-Design.md) §3.1.

Illustrative error class hierarchy and HTTP middleware in Appendix A.3.

### 7.3 Result types vs exceptions

Some teams prefer `Result<T, E>` over throwing. The argument: it forces handling at every call site. The counter: it pollutes every signature with `Result` wrappers.

The pragmatic middle ground: **throw for genuinely exceptional conditions; return `Result` for recoverable expected failures**.

**Rule of thumb:** if you find yourself writing `try/catch` around a business-logic call (not I/O), that function should return a `Result` type instead.

**Decision tree:**

```
Is this error something the caller can reasonably handle and recover from?
  └─ No (programming error, unexpected system state, corrupted data)
     → Throw. These are bugs, not expected states.
  └─ Yes (validation failure, not-found, rate limit, external API down)
     → Result type. The caller needs to handle this.

Is this on the boundary between your code and external input?
  └─ Yes → Result / union type. External input is always untrusted.
  └─ No  → Throw for programming errors; Result for expected failures.
```

### 7.4 Never silence errors

Every `catch` block does one of: handle the error meaningfully, retry, log + re-throw, or convert to a typed error and throw. "Log and continue" is only valid when the operation is genuinely fire-and-forget (and even then, the log line records *what* failed, not just that something did).

### 7.5 Wrap external errors

When calling an external service, wrap whatever they throw in your own error type. Don't let library-specific errors (axios, pg, boto) leak into business logic — that couples you to those libraries forever.

---

## 8. Logging

Detailed logging conventions live in [Security.md](Security.md) §16 and [Architecture.md](Architecture.md) §9.1 — this section covers the code-craft side.

### 8.1 Use a structured logger, never `console.log`

Structured loggers (pino for Node, structlog for Python, or equivalent) produce JSON, support log levels, redact secrets, and integrate with log aggregators. `console.log` / `print` does none of that.

### 8.2 Log at the right level

| Level | When |
| --- | --- |
| `fatal` | Unrecoverable; process will exit. Almost never. |
| `error` | A request failed unexpectedly; user-visible degradation; investigate now. |
| `warn` | Degraded behaviour; expected-rare condition occurred; investigate later. |
| `info` | Business event (login, verification, order placed). Auditable trail of what the system did. |
| `debug` | Verbose trace; off in production. Useful when reproducing locally. |

Production runs at `info` and above. `debug` is for development and ad-hoc enablement during incidents.

### 8.3 Log shape

Every log line is JSON with fixed fields (enforced by the logger config): `timestamp`, `level`, `service`, `correlationId`, `tenantId`, `userId` (when applicable), `message` (short, one-line), and additional structured fields specific to the event.

Never put structured data in the message string:

```ts
// ✗ grep-only, not queryable
logger.info(`Verified project ${projectId} in ${duration}ms`);

// ✓ queryable in the aggregator
logger.info({ projectId, durationMs: duration }, 'verified project');
```

### 8.4 Don't log inside loops

Logging inside a per-item loop floods the aggregator. Log start, end, summary — with counts and failure details attached.

If you genuinely need per-iteration visibility, log at `debug` level so it's off in production.

---
## 9. Functions and modules

### 9.1 Function size

Aim for ≤ 30 lines. Hard cap 80. Past 80, the function does more than one thing — extract.

This isn't dogma; it's a heuristic for working memory. Long functions hide the bugs in their middle because the reader can't see the whole thing at once.

### 9.2 Single responsibility, real version

The textbook "single responsibility principle" is vague. The useful version: a function has a single responsibility if it can be **named** with one verb phrase and no `and`.

* `verifyProject` — single
* `verifyProjectAndSendEmail` — two responsibilities; split
* `processOrder` — what does "process" mean? Probably 4 things hiding behind a vague verb

If you struggle to name the function, the function is doing too much.

### 9.3 Argument count

* **0–2 arguments** — fine.
* **3 arguments** — starting to smell.
* **4+ arguments** — definitely smells. Use an options object.

The exception: 2–3 arguments where order is universal and obvious (`distance(from, to)`, `clamp(value, min, max)`).

### 9.4 Return types should be honest

A function that returns `Promise<Project | null>` tells the caller "this might not find anything — handle that." A function that returns `Promise<Project>` and throws `NotFoundError` tells the caller "this is supposed to find one; failure is exceptional."

Both are valid. Pick based on whether absence is a **normal outcome** (return null / undefined) or an **error** (throw).

### 9.5 Pure functions where possible

Pure functions (deterministic output for a given input, no side effects) are trivially testable, composable, cacheable, and parallelisable.

Push purity to the edges: business logic that can be pure should be. I/O and mutation belong at the boundary, not interleaved with computation. A `calculateScore` function that just takes the input and returns the score has 50 trivial unit tests; the I/O wrapper that fetches and saves has one integration test.

### 9.6 Module imports

* Imports at the top of the file, never inline (except for genuinely-lazy loading; rare).
* Group: standard library / framework first, third-party next, project last. One blank line between groups.
* Sort within each group alphabetically (let the linter do this).
* No deep imports into other modules' internals (§2.4).
* No circular imports — if you have one, the modules are wrong-shaped; refactor.

---

## 10. Git and commits

### 10.1 Branch model

* `main` is always deployable. Direct pushes blocked by branch protection.
* Feature branches: `feat/<scope>-<short-desc>`. Short-lived (≤ 1 week).
* Fix branches: `fix/<scope>-<short-desc>`.
* Chore branches: `chore/<scope>-<short-desc>`.

No long-lived feature branches. If a feature is too big for a week, ship it behind a feature flag in pieces.

### 10.2 Commit messages

Use Conventional Commits format:

```
<type>(<scope>): <subject>

<body, wrapped at 72 chars>

<footer with breaking changes, issue refs>
```

Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`, `style`, `build`, `ci`, `revert`.

**Rules:**

* Subject in imperative mood ("add", not "added" or "adds")
* Subject lowercase, no period
* Subject ≤ 72 chars
* Body explains *why* (the diff explains *what*)
* Body wrapped at 72 chars per line

### 10.3 Atomic commits

One logical change per commit. A commit that adds a feature, fixes an unrelated bug, and renames three files is unreviewable and unrevertable.

When you find yourself fixing things while building, stash the fixes, finish the feature, then make the fix its own commit. `git commit -p` (patch mode) lets you stage hunks selectively when you've already made a mess.

### 10.4 Squash on merge

Configure the repo to **squash and merge** PRs into `main`. The PR becomes one commit on `main`; the granular history lives on the branch.

This keeps `main`'s history readable (one commit per feature) while preserving the work-in-progress detail elsewhere. Bisecting `main` is then meaningful — every commit was a working state.

### 10.5 Don't rewrite shared history

Force-push (`git push --force`) is fine on **your own branch** before review. Force-push to `main` (or any branch others have pulled) is **never** fine — it silently destroys their work.

Use `git push --force-with-lease` instead of `--force`. It refuses to push if someone else has updated the remote since you fetched. One safer keystroke.

### 10.6 .gitignore hygiene

A messy `.gitignore` is the entry point for committed secrets, large binaries, IDE config. Per-project `.gitignore` covers project-specific things; a global `~/.gitignore` covers OS / IDE files (`.DS_Store`, `.idea/`, `.vscode/`).

Never `git add -A` in a directory you don't fully understand. `git add` specific files or paths.

---

## 11. Code review — author side

The **reviewer's** side of code review lives in [Code-Review-Playbook.md](Code-Review-Playbook.md) — that document owns the severity ladder (`[blocker]` / `[major]` / `[minor]` / `[nit]`), the three review contexts (design review, code review, post-merge retro), per-domain reviewer checklists, comment-style guidance, and disagreement handling. Read it before doing your first review.

This section covers what an **author** does to make review land well.

### 11.1 PR size

Aim for ≤ 400 lines changed. PRs over 1000 lines should be split unless they're a generated change (lockfile, migration).

Big PRs are unreviewable — reviewers either skim (and miss bugs) or bounce (and delay you). If a change is too big to review well, it's too big to ship well.

### 11.2 PR description

Every PR description explains:

* **What** — one-line summary of the change.
* **Why** — context, link to issue / ticket. If there's no ticket, say so.
* **How** — significant design choices and trade-offs. If there's no significant choice, say "straightforward implementation of the ticket."
* **Tested** — what tests were added, how it was manually verified.
* **Risk** — what could go wrong, what to watch in production.
* **Screenshots** — for UI changes, before / after.

Reviewers who can't quickly answer "what changed and why" from the description will spend that time on your review turnaround instead. Front-load it.

### 11.3 Responding to review

* Respond to every reviewer comment, even just to acknowledge with `👍`.
* Don't merge with unresolved `[blocker]` or `[major]` comments — either fix or discuss.
* If you disagree, say so; don't silently ignore. Reviewers can be wrong, but they need to hear the counter-argument, not silence.
* Escalate stuck disagreements (see [Code-Review-Playbook.md](Code-Review-Playbook.md) §6) — don't approve to end the argument, don't let the PR die.

### 11.4 What NOT to argue about

Style issues the linter should catch: fix the linter or the code; don't argue with the reviewer over what the linter allows. Personal-preference naming when the current name is fine: accept the `[nit]` or accept the current name. Save review disagreements for things that actually matter.

### 11.5 Approving and merging

* One approval is the minimum for non-trivial changes; for risky areas (auth, billing, migrations, tenant isolation, AI safety), require two.
* Authors don't merge their own PRs unless the team is genuinely solo. Reviewers merge after approval to confirm the change ships.
* After merge: monitor logs and metrics for the affected area for at least an hour. If it breaks something, revert first, debug second.

---

## 12. Refactoring patterns

Refactoring is changing the shape of code without changing its behaviour. Done routinely, it keeps the codebase young. Done rarely, it requires heroics later.

### 12.1 The rule of three

The first time you write something, write it. The second time, copy-paste with edits. The third time, extract it.

Premature abstraction is more expensive than duplication. Two similar functions are easier to maintain than one over-flexible abstraction with three boolean flags. Wait until the shape is clear.

### 12.2 Refactor before adding to messy code

Before adding a feature to a confusing module, refactor the module to make the change easy. Then make the easy change.

> "Make the change easy, then make the easy change." — Kent Beck

If the refactor and the feature are mixed in one PR, neither is reviewable. Two PRs:

1. Refactor (no behaviour change, all tests still pass)
2. Add feature on top of clean structure

### 12.3 Common refactorings

* **Extract function** — when a code block has its own purpose and no I/O.
* **Extract module** — when a domain emerges. When one module accumulates hundreds of lines of a specific concern, that's a sub-module struggling to be born.
* **Inline function** — the opposite of extract. When a wrapper function adds nothing (`function getUser(id) { return db.user.findUnique({ where: { id } }); }`), delete it and call the underlying operation directly.
* **Replace conditional with polymorphism** — when a switch statement keeps growing (5+ cases across the codebase, more likely coming). For 2–3 stable cases, the switch is fine.
* **Rename for clarity** — the cheapest refactoring with the highest return. Modern IDEs make renames safe. When a name is wrong, fix it. Don't leave wrong names "for compatibility" — that's how confusion compounds.

### 12.4 When NOT to refactor

* The code is touched once a year and works fine. Leave it.
* You're refactoring to a pattern you read about last week. Wait until the second use case.
* The "improvement" is mostly aesthetic and breaks `git blame` for the rest of the team.
* You don't have tests yet. Add tests first; refactor under test cover.

### 12.5 Refactoring under test cover

Before any non-trivial refactor:

1. Are there tests for the behaviour you're about to change? If not, add them. They'll fail in interesting ways during the refactor, which is a feature, not a bug.
2. Run the tests. They must pass before you start.
3. Make small, atomic changes. Run tests after each.
4. If tests fail, revert the last change and try smaller.

Big-bang refactors land broken. Small refactors land working.

### 12.6 The strangler fig pattern

For replacing a large legacy area without a stop-the-world rewrite:

1. Build the new system alongside the old.
2. Route a small fraction of traffic to the new.
3. Compare outputs (shadow mode) for a period.
4. Cut over fully when confident.
5. Delete the old system.

Slow, boring, low-risk. Beats the heroic rewrite that ships with twelve regressions.

### 12.7 When to refactor — decision tree

Refactoring has a cost (time, merge conflicts, test churn). Only do it when the benefit is measurable.

```
Is the code in the path of a feature you're building right now?
  └─ No → Leave it. File a tech-debt ticket if it genuinely bothers you.
  └─ Yes → Continue ↓

Has this code caused a bug or a misunderstanding in the last 3 months?
  └─ No, it's just aesthetically messy → Fix the immediate area you're
     touching. Don't expand scope.
  └─ Yes (caused actual bugs or slowed multiple engineers down) → Continue ↓

Does the code have adequate test coverage (≥ 70% of the logic path)?
  └─ No → Write tests first. Refactoring untested code replaces one risk
     with another.
  └─ Yes → ✓ Refactor. Keep the PR focused — refactor in one PR, feature
     in another.
```

**Refactoring rules:**

1. **One concern per PR.** Refactoring and feature work never go in the same PR. Reviewers can't evaluate both at once.
2. **Tests pass before and after** — run the test suite before starting, not just before merging. If tests were already failing, fix them first.
3. **No behaviour changes.** A refactor changes structure, not observable behaviour. If you need to change behaviour, that's a feature, not a refactor.
4. **Scope to what you touched.** "While I'm in here" is how a 1-hour refactor becomes a 3-day PR. Fix what you came to fix.
5. **Document why, not what.** If the refactored code is significantly different from before, add a comment explaining why the old structure was changed (not describing what the new code does — the code does that).

**Signs that refactoring is overdue** (escalate these in the next team sync):

| Pattern | Why it matters |
| --- | --- |
| Function > 50 lines with no clear sections | Cognitive load makes bugs invisible |
| Module with > 5 direct dependencies on other modules | High coupling; one change ripples everywhere |
| Test file > 3× the size of the source file | Tests are probably over-specified to implementation, not behaviour |
| Same logic exists in 3+ places | One fix needs to land in 3 places — inevitably drifts |
| `any` (or equivalent) in a public function signature | Breaks the type contract the whole codebase relies on |
| TODO comment > 6 months old | It will never be done; make a decision and act |

---
## 13. Testing craft

The **testing strategy** — pyramid ratios, contract testing, E2E defaults, AI / RAG evaluation, coverage enforcement, tool choices — lives in [Testing.md](Testing.md). This section covers the *craft* of writing tests that pay off: what to test, how to structure a test, and how to keep the suite trustworthy.

**Pragmatic stance:** 70% line coverage as a guideline, not a target. Coverage is a smell detector — code below 50% likely has bugs you don't know about; code above 90% is often over-tested or testing the wrong things.

The real metric: **when this code breaks in production, will the test that should have caught it exist?**

### 13.1 What to unit test

* Pure functions with non-trivial logic
* Data transformations
* Business rules (scoring, pricing, validation)
* Edge cases of utility functions
* Error paths

### 13.2 What NOT to unit test

* Trivial getters / setters
* Wiring code (calling A then B then C with no logic)
* Generated code
* Third-party library behaviour
* Configuration loading (test once at boot, not per scenario)

### 13.3 Test structure — Arrange, Act, Assert

Each test has three explicit sections:

1. **Arrange** — set up the state and inputs.
2. **Act** — perform the operation under test.
3. **Assert** — check the outcome.

Keep them separate visually. A test that mixes setup with assertions is unreadable when it fails.

### 13.4 Test rules (unit tests)

* **One assertion per test** ideally; multiple if they're the same logical check (object equality counts as one).
* **Test names describe behaviour** — `it('returns null when project not found')`, not `it('test1')`.
* **No shared mutable state between tests.** Each test stands alone.
* **Fast** — every unit test runs in <50ms. Slow tests are integration tests in disguise.

### 13.5 Test data

* **Factories, not fixtures.** A `makeEntity({ name: 'X' })` factory is more flexible than a static fixture file.
* **Realistic data, not lorem ipsum.** An entity called "Acme Corp Ltd" surfaces bugs that "lorem ipsum" hides (length, special chars, sorting).
* **Deterministic IDs only when needed.** Most tests want random ULIDs. Tests asserting specific IDs are brittle.
* Use a faker library for realistic emails, names, phone numbers.

### 13.6 Integration test rules

Integration tests live in the middle of the pyramid; they hit a real (test) database and mock external HTTP calls.

* **Test through the actual HTTP layer, not by calling the handler directly.** Catches middleware ordering bugs.
* **Verify side effects, not just response.** Check the DB, check the queue, check the audit log.
* **Negative cases mandatory:** auth failure, validation failure, tenant isolation. Not optional.
* **Fresh state per test file** (or fresh transaction rolled back per test if speed matters).
* **Real database in a container**, not SQLite. SQLite "works" for most queries but lies on edge cases (collation, types, constraints).
* **Mock external HTTP calls** with a per-language HTTP mock (`nock`, `respx`) — never call real third-party services.

### 13.7 Mocks vs fakes vs stubs

* **Stub** — returns canned responses; "when called, return this".
* **Mock** — verifies it was called correctly; "expect this method called twice with these args".
* **Fake** — a working implementation, simpler than the real (in-memory DB, in-process queue).

**Prefer fakes over mocks.** Mocks couple tests to implementation; fakes test through the same shape as production. An in-memory queue fake catches more real bugs than a mocked queue with hardcoded responses.

Use mocks sparingly and only for things truly external (third-party APIs).

### 13.8 Snapshot tests

Useful for: rendered output (HTML, JSON shape), AI prompts, generated code.
Dangerous when: snapshots are huge, change frequently, and reviewers thumbs-up "looks right" without reading.

**Rules:**

* Snapshots ≤ 50 lines. Bigger ones are unreviewable.
* Update snapshots intentionally (`--update-snapshots`), never automatically in CI.
* Snapshot diffs in PRs require explicit review.

### 13.9 Test naming

```
describe('<unit under test>', () => {
  describe('<scenario or method>', () => {
    it('<expected behaviour>', () => { ... });
  });
});
```

Examples:

* `describe('EntityService') → describe('verify') → it('marks entity as verified on success')`
* `describe('POST /api/v1/entities') → it('returns 400 when email is missing')`

The test name + the failing assertion should explain the bug without needing to read the test body.

### 13.10 Flaky tests

A flaky test is a broken test. Treat it as a P1.

* Quarantine flaky tests (skip with a tag, log to a dashboard).
* Triage within a week: fix or delete. Don't let them sit indefinitely.
* "Tests fail sometimes" is the start of teams losing trust in their suite. Once trust is gone, nobody runs the tests, and the suite stops catching bugs.

---

## 14. Performance craft

The **performance strategy** — budgets, SLOs, RUM, Core Web Vitals, front-end bundle rules, backend response-time budgets — lives in [Performance.md](Performance.md). This section covers the *craft* of not creating performance problems in normal code.

### 14.1 Measure, don't guess

Performance intuition is wrong more often than right. Profile before optimising. The bottleneck is rarely where you think.

Tools per language and layer:

* Node: `clinic`, `0x`, the built-in `--inspect` profiler
* Python: `py-spy`, `cProfile`
* Database: `EXPLAIN ANALYZE`, slow-query log
* Frontend: Lighthouse, browser devtools performance tab

### 14.2 The N+1 query trap

The single most common backend perf bug. Loading a list, then making one database call per item:

```ts
// ✗ N+1: 1 query for entities + N queries for each one's credentials
const entities = await db.entity.findMany({ where: { tenantId } });
for (const s of entities) {
  s.creds = await db.credential.findMany({ where: { entityId: s.id } });
}

// ✓ 2 queries total
const entities = await db.entity.findMany({
  where: { tenantId },
  include: { credentials: true },
});
```

Watch the database query log in development; when one HTTP request fires 50 queries, you have an N+1.

### 14.3 Don't optimise prematurely

Premature optimisation usually means:

* Caching things that aren't measurably slow
* Choosing exotic data structures for tiny datasets
* Writing unreadable code to save microseconds

Boring code that's slightly slower beats clever code that's slightly faster, every time. Optimise when the profiler tells you to.

### 14.4 Measure cost in tokens, not just time (AI)

For AI calls, latency and tokens both cost money. Track both. A 4-second call using 50k tokens is more expensive than a 6-second call using 5k tokens. See [Architecture.md](Architecture.md) §13.6 for tenant-level cost accounting.

### 14.5 Don't load everything into memory

For collections that could be large (logs, all users, all orders), use streaming or pagination. A query that's fine at 100 rows can crash the process at 100,000.

Pattern: paginate with a cursor; process in batches; never `findMany({})` on an unbounded collection.

---

## 15. Anti-patterns

Things that look like good ideas at first and reliably bite later. Named so you recognise the temptation.

### 15.1 The premature interface

Symptom: every class has an `IFoo` interface "in case we want to mock it later".

Reality: interfaces with one implementation are dead weight. Add the interface when there's a second implementation, not before.

### 15.2 The "smart" comment

Symptom: a 10-line comment explaining a 3-line clever expression.

Reality: rewrite the 3 lines as 5 boring lines. Delete the comment. The boring code is now self-documenting.

### 15.3 The catch-all wrapper

Symptom: every external call wrapped in `try { ... } catch (e) { logger.error(e); throw new InternalError(); }`.

Reality: lossy wrapping destroys the caller's ability to handle specific errors (was it a 404? a 500? a network error?). Wrap selectively, preserve the original error chain.

### 15.4 Boolean parameters

Symptom: `function processOrder(orderId, true, false, true)`.

Reality: at the call site, nobody knows what `true, false, true` means. Use named options or, if it's two enum-like states, two functions (`processDraftOrder` vs `processFinalOrder`).

### 15.5 The big switch

Symptom: a 200-line switch on `event.type`, with each case calling a different module.

Reality: the dispatch is fine in principle; the size is the problem. Each case calling a small handler function is readable. Inline 30-line cases are not.

### 15.6 Stringly-typed APIs

Symptom: `processStatus("pending_approval")` where the string could be anything.

Reality: enums or literal unions. Make the type system catch typos.

### 15.7 Magic numbers and strings

Symptom: `if (response.status === 7) { ... }`.

Reality: named constant. `if (response.status === STATUS_AWAITING_APPROVAL) { ... }`. The constant is documentation.

### 15.8 Massive PRs

Symptom: a PR titled "various improvements" with 2000 lines changed across 50 files.

Reality: unreviewable. Bugs sail through. Split into focused PRs. If it's already huge, ask the author to split; don't approve out of fatigue.

### 15.9 Mixing levels of abstraction

Symptom: a function that orchestrates business logic also fiddles with HTTP headers and parses JSON.

Reality: each layer at its own level. Business logic doesn't know about HTTP. HTTP doesn't know about database queries. Each layer has one job.

### 15.10 Test-driven debugging

Symptom: test passes, code is broken; turns out the test asserted the wrong thing.

Reality: write the test first (or pair-write), watch it fail for the right reason, then make it pass. Tests written after the code often validate the bug.

### 15.11 Disabled / skipped tests

Symptom: 47 tests in `.skip()` from various PRs over the months.

Reality: a skipped test is a deleted test that pretends not to be. Delete or fix within 7 days. Never accumulate skips.

### 15.12 Dead code

Symptom: functions, files, modules that nobody calls. "Might need it later."

Reality: delete it. Git remembers. If you need it later, you'll find it. Dead code costs in maintenance, mental load, and security surface.

### 15.13 The shared state singleton

Symptom: a global object that everything reads and writes (`appState`, `currentUser` outside React, request-context-as-global).

Reality: dependencies become invisible, tests become impossible, race conditions arrive. Pass dependencies explicitly. Use `AsyncLocalStorage` (or the language equivalent) for request context, not a global.

### 15.14 Reinventing the standard library

Symptom: `function arrayUnique(arr) { ... }`, `function isEmpty(obj) { ... }`.

Reality: the standard library or a well-maintained dependency does this better. `[...new Set(arr)]` for unique. Use lodash if you really need a kitchen sink. Don't write your own.

---

## 16. Pre-commit checklist

Before `git commit`:

* [ ] Code compiles / type-checks (`tsc --noEmit`, `mypy`, or equivalent)
* [ ] Linter passes (`eslint`, `ruff`, or equivalent)
* [ ] Formatter applied (Prettier, `ruff format`, or equivalent)
* [ ] Tests for changed code pass locally
* [ ] No `console.log`, `print`, `pdb.set_trace()`, or debugger statements left in
* [ ] No commented-out code blocks
* [ ] No new TODO without an author and date
* [ ] Commit message follows Conventional Commits format
* [ ] Commit is atomic — one logical change

A pre-commit hook (Husky for Node, `pre-commit` for Python) automates the first four. Set it up once per project; don't bypass it.

---

## 17. Pre-PR checklist

Before opening or merging a PR. This is the **author's** checklist. The **reviewer's** checklist is in [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.

### Implementation

* [ ] PR is focused on one change (≤ 400 lines ideally)
* [ ] Branch is up to date with `main`
* [ ] CI passes (build, type check, lint, tests)
* [ ] No skipped tests added
* [ ] Coverage hasn't dropped > 2%

### Tests

* [ ] Unit tests for new pure logic
* [ ] Integration tests for new endpoints / handlers / consumers
* [ ] Negative tests for auth, validation, tenant isolation
* [ ] No flaky test introduced (run suite 3× locally if uncertain)

### Documentation

* [ ] PR description includes what / why / how / tested / risk
* [ ] Public function changes have updated doc comments
* [ ] README updated if setup / config changes
* [ ] ADR written for significant decisions (see [Documentation.md](Documentation.md) §4)

### Cross-cutting

* [ ] Architecture standards respected (module boundaries, tenant isolation, error envelope) — see [Architecture.md](Architecture.md)
* [ ] Security standards respected (input validation, authz, secret handling) — see [Security.md](Security.md)
* [ ] Logging includes correlation ID and tenant ID where applicable
* [ ] Migrations follow expand / contract (additive first)
* [ ] No hardcoded secrets, URLs, IDs

### Quality

* [ ] No new `any`, `as`, non-null `!` (or language equivalents)
* [ ] No new files > 500 lines
* [ ] No new functions > 80 lines
* [ ] Naming follows the conventions (§3)
* [ ] Comments explain *why*, not *what*

If every box is ticked: open the PR. If any are unticked: fix before requesting review.

---

## 18. Deviating from this standard

Standards in this pack are binding ([README.md](README.md) §3). Real projects find real reasons to deviate — a legacy module with its own conventions, a language the pack doesn't yet cover, a tool choice constrained by an existing team's expertise. When you deviate:

1. **Write an ADR** using [TEMPLATE-Decision.md](TEMPLATE-Decision.md). State which section you're deviating from, why, and what the trade-off is.
2. **Get review** from a principal engineer.
3. **Link the ADR** from the project's `docs/adr/` index and from the PR that introduces the deviation.
4. **Revisit** during the quarterly pack review. If the same deviation keeps recurring across projects, the standard itself is a candidate for revision.

**Adding a new language** (Go, Rust, Kotlin, etc.) always requires an ADR that includes the equivalent of §4 or §5 for that language — the pack does not silently allow "apply the TypeScript rules by analogy to Go". The new section becomes part of this standard on the next quarterly review.

Deviations without an ADR are review blockers.

---

## Appendix A — Stack-specific illustrations

The main body of this doc uses TypeScript and Python as the worked-example languages (§§4, 5). This appendix contains the concrete tool-configuration and code snippets that would otherwise clutter the body.

### A.1 TypeScript `tsconfig.json` baseline

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noPropertyAccessFromIndexSignature": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "target": "ES2022",
    "lib": ["ES2022"],
    "skipLibCheck": true
  }
}
```

### A.2 Python `pyproject.toml` baseline

```toml
[tool.ruff]
target-version = "py312"
line-length = 100

[tool.ruff.lint]
select = [
    "E", "F", "W",   # pycodestyle, pyflakes
    "I",             # isort
    "B",             # bugbear (catches mutable default args, etc.)
    "UP",            # pyupgrade
    "N",             # naming
    "S",             # security (bandit)
    "ASYNC",         # async best practices
    "RUF",           # ruff-specific
]

[tool.mypy]
strict = true
python_version = "3.12"
warn_return_any = true
warn_unused_ignores = true
disallow_untyped_defs = true
```

### A.3 Illustrative typed-error hierarchy (TypeScript)

```ts
// shared/errors/index.ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_FAILED', message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} ${id} not found`, 404, { resource, id });
  }
}

export class AuthorizationError extends AppError {
  constructor(action: string) {
    super('UNAUTHORIZED', `Not authorized to ${action}`, 403, { action });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('CONFLICT', message, 409, details);
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, cause: unknown) {
    super('EXTERNAL_SERVICE_ERROR', `${service} unavailable`, 503, { service, cause });
  }
}
```

HTTP boundary middleware translates these into the envelope from [API-Design.md](API-Design.md) §3.1.

### A.4 Illustrative module public surface

**TypeScript** — each module exports through a `public.ts`:

```ts
// modules/projects/public.ts
export { ProjectsService } from './service';
export type { Project, ProjectStatus, CreateProjectInput } from './types';
// Nothing else in the module is reachable from outside.
```

**Python** — each module's `__init__.py` uses `__all__`:

```python
# modules/projects/__init__.py
from .service import ProjectsService
from .types import Project, ProjectStatus, CreateProjectInput

__all__ = ["ProjectsService", "Project", "ProjectStatus", "CreateProjectInput"]
```

Module boundaries are enforced by ESLint (`no-restricted-imports`) or by a Python import linter (`import-linter`).

### A.5 Illustrative directory layout

```
src/
├── modules/
│   ├── auth/
│   │   ├── routes.ts
│   │   ├── service.ts
│   │   ├── repository.ts
│   │   ├── types.ts
│   │   └── public.ts        # explicit cross-module export
│   ├── projects/
│   ├── tasks/
│   └── ...
└── shared/
    ├── db/
    ├── http/
    ├── auth/
    └── errors/
```

---

*Owner: Gaurav Bhatnagar · Next review: 1 October 2026*
