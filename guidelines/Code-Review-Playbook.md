---
name: code-review-playbook
description: How to conduct code review at principal-engineer depth. Covers the review mindset, severity ladder (Blocker/Major/Minor/Nit), three review contexts (design review, code review, post-merge retro), per-domain checklists that reference the standards docs, and the style of review comment that lands well. Use this every time you review a PR or a design.
---

# Code Review Playbook

**Version 1.0** · Last updated 1 July 2026

This is the missing piece of the standards pack. The other docs are the *reference* — what "good" looks like. This one is the *skill* — how to spot deviations from good, in a way that improves the code without demoralising the author.

Read this before your first review. Return to it when a review starts feeling adversarial, or when you find yourself commenting on trivia while the real issue goes unchallenged.

---

## 1. The review mindset

**1.1 Review the code, not the person.** Every review comment refers to a specific line, decision, or pattern — never to the author's competence, taste, or history. If your comment could be paraphrased as "you don't understand X", rewrite it.

**1.2 Reviewers are second brains, not gatekeepers.** Your job is to raise the quality floor of what ships. That means catching what the author couldn't see because they were too close to it, not proving you know more than they do. A review that "finds nothing" and green-lights the PR is a legitimate outcome.

**1.3 The severity of a comment matches the severity of the risk.** A production data-loss risk and a naming preference are not equally important. Signalling them at the same level is how PRs get bogged down in nits and real issues get missed. Use the severity ladder in §2.

**1.4 State the standard, not just the opinion.** "This should be X" is an opinion. "Per Security.md §6.3, we don't coerce types at the boundary; the correct pattern here is …" is a review comment. When you don't have a standard to point at, either write the review comment as a *suggestion* explicitly, or write the standard.

**1.5 Ask before asserting.** If you don't know the context, ask. "Was there a reason you chose this over the pattern in Architecture.md §4.2?" invites explanation; "This should be async" invites a fight.

**1.6 Own the disagreement.** If the author pushes back and you still think you're right, escalate to a third opinion or write an ADR. Don't approve to end the argument, and don't block without a plan.

---

## 2. Severity ladder

Every review comment is labelled with one of four severity markers so the author knows what to fix now, what to fix later, and what is preference.

| Marker | Meaning | Response required from author |
| --- | --- | --- |
| **`[blocker]`** | Cannot merge until this is resolved. Data loss, security hole, correctness breach, missing tests for a critical path, protocol violation, ADR-required deviation without an ADR. | Fix or open a discussion; reviewer must approve resolution. |
| **`[major]`** | Should not merge without addressing. Missing edge case, poor error handling, N+1 query on a hot path, missing observability, contract-breaking change without version bump. | Fix, or open a follow-up ticket with a defined SLA. |
| **`[minor]`** | Should probably fix in this PR but merge is acceptable if not. Naming that could be clearer, small refactor opportunity, missing unit test for a non-critical path. | Fix if quick; otherwise defer. |
| **`[nit]`** | Preference. Non-binding. Author can ignore. | None. |

**Ground rules for using the ladder:**

- If everything is a `[nit]`, you have not reviewed. Look harder.
- If everything is a `[blocker]`, you have not calibrated. Almost nothing rises to blocker; most quality issues are `[major]` or `[minor]`.
- Never use `[blocker]` for style preferences — that's a fight the reviewer will lose and should lose.
- The author is responsible for responding to every `[blocker]` and `[major]`. Ignoring them is a review-process failure.

---

## 3. The three review contexts

Not all review is code review. Principal-level engineers spend as much time on design review and post-merge retro as on line-by-line PR review. Each has a different rhythm.

### 3.1 Design review (pre-implementation)

**When:** before code is written, when the shape of the change is still cheap to alter.

**Trigger:** any change that touches Architecture.md's scope — new service, new external dependency, new cross-service call, new data model, new auth surface, new tenant boundary, new performance-critical path.

**What to review:** the design doc or ADR draft, not code. Ask:

- Does this fit the existing service topology (Architecture.md §2), or does it force a new service? Is that justified?
- Does the tenancy model hold (§3)?
- What is the failure mode? What breaks first under load, and how does it degrade?
- What is the rollback story? If we deploy this and it's wrong, how long to undo?
- Have alternatives been considered? If not, ask "what did you consider and reject?"
- Is there an ADR? For anything with lasting shape, yes.

**Output:** approve the design (author proceeds to implementation) or request revision. Design-review comments are almost never `[nit]`; if it's not worth talking about at the design stage, it's not worth a design review.

### 3.2 Code review (during PR)

**When:** on every PR, before merge.

**What to review:** the diff, in the order below. Reviewing bottom-up (starting with the smallest lint issues) is a common mistake — you spend your attention budget on trivia and run out before the important stuff.

**Order of attention (top to bottom):**

1. **The description.** If the PR doesn't say what it changes and why, ask for that first before reading a line of code. Undescribed PRs waste reviewer time.
2. **The public interface / contract.** If this changes an API, event schema, or shared type, review that first. Everything else is easier to reverse.
3. **The tenancy and auth boundaries.** Per Security.md §3 and Architecture.md §3, cross-tenant leakage is the highest-cost failure. Look at every query, every scoping condition, every "trust this" decision.
4. **Correctness of the core change.** Does it do what the description says? Are the edge cases handled? Are the errors handled? Are the assumptions documented?
5. **Tests.** Are they testing the *right* things (per Testing.md), or just re-asserting the implementation? If you deleted the test, would the reviewer of a future regression notice?
6. **Observability.** Can we tell in production whether this is working? Structured logs, metrics, traces, error reporting per the observability conventions.
7. **Craft.** Naming, structure, readability, dead code (Code-Quality.md). Comment as `[minor]` or `[nit]` unless it's genuinely confusing.

**What NOT to spend time on in code review:**

- Style issues that a linter should catch. If it's not caught, fix the linter, not the PR.
- Personal-preference bike-shedding on names when the current name is fine.
- Suggesting a rewrite of code that works and is within style. If it works and the pattern isn't harmful, `[nit]` it or leave it alone.

### 3.3 Post-merge retro (occasional)

**When:** after an incident, after a release with unusually many follow-up PRs, when a subsystem starts feeling flaky.

**What to review:** the recent history of a subsystem, not a single change. Ask:

- Is there a pattern across the last N PRs that suggests a design flaw the individual reviews couldn't see?
- Are the same bugs recurring in different code paths (a sign the underlying invariant isn't enforced by the type system or the database)?
- Are review comments getting shallower over time (a sign of reviewer fatigue on this area)?

**Output:** either an ADR to change the design, or a note in the appropriate standards doc so future reviewers know what to watch for.

---

## 4. Per-domain checklists

Each checklist references the standards doc that owns the domain. During code review, run the checklists for the domains the PR actually touches — don't drag in unrelated ones.

### 4.1 Architecture (see Architecture.md)

- [ ] Change fits the current service topology, or the topology change is justified in the PR description / an ADR
- [ ] No new synchronous dependency across service boundaries without a fallback / timeout
- [ ] No new cross-tenant primitives (queries, cache keys, background jobs) that don't scope by tenant
- [ ] No new stateful component that isn't in the recovery playbook (see Incident-Response.md §8)

### 4.2 Security (see Security.md)

- [ ] Every new input path validates at the boundary (§6)
- [ ] Every new query is parameterised or ORM-safe (§8)
- [ ] Every new authorization decision uses the central permission check, not an ad-hoc conditional (§3)
- [ ] Every new secret is stored in the secrets manager, not in code, environment files committed to git, or CI variables set once and forgotten (§5)
- [ ] Every new external HTTP call has a timeout (§4)
- [ ] Every new file upload validates content-type and size (§6.4)

### 4.3 Code quality (see Code-Quality.md)

- [ ] Naming reflects intent, not implementation (§3)
- [ ] Functions do one thing; the one thing is named clearly (§2, §3)
- [ ] Errors are handled where they can be recovered from, not swallowed
- [ ] No `any` / untyped shortcuts (in typed languages) unless clearly justified inline
- [ ] Comments explain "why" not "what" (§6.1)
- [ ] Public API surface is deliberate; no accidental exports

### 4.4 Performance (see Performance.md)

- [ ] No obvious N+1 query in a request path (§8)
- [ ] Any new synchronous work on a hot path is measured or budgeted
- [ ] Any new UI-blocking work has a loading state
- [ ] Any new large object is streamed or paginated, not held in memory
- [ ] Any new cache has an invalidation story

### 4.5 Testing (see Testing.md)

- [ ] Unit tests for new business logic
- [ ] Integration tests for new API endpoints or cross-service calls
- [ ] Contract tests updated if a shared schema changed
- [ ] Regression test for any bug fix (bug can't recur silently)
- [ ] Test names read as assertions ("returns 404 when …"), not as descriptions ("test the not-found case")

### 4.6 API design (see API-Design.md)

- [ ] Versioned URL / header
- [ ] Standard error envelope
- [ ] Idempotency-Key supported on all mutating operations
- [ ] Timeouts declared on cross-service calls
- [ ] Breaking change flagged and communicated per §5 (or explicitly not breaking)

### 4.7 Documentation (see Documentation.md)

- [ ] ADR written for anything with lasting shape (§4)
- [ ] Public API changes reflected in the API docs
- [ ] README updated if setup, dependencies, or entry points changed
- [ ] Changelog entry for anything a user, customer, or downstream service will notice

### 4.8 Containers (see Container-Guidelines.md)

- [ ] Base image pinned to a version, not `latest`
- [ ] Healthcheck present for every new service
- [ ] Resource limits declared even in dev
- [ ] No secrets in the image; injected at runtime

### 4.9 Incident readiness (see Incident-Response.md)

- [ ] New feature has a rollback plan (deploy-only, feature flag, or runtime toggle)
- [ ] New feature emits enough observability for on-call to diagnose without reading source
- [ ] Runbook updated if a new operational failure mode is introduced

### 4.10 AI-assisted code (see AI-Workflow.md)

- [ ] The reviewer read the code, not just the description. AI-authored code is code; treat it as such.
- [ ] Where AI generated boilerplate, the boilerplate is *right* — no hallucinated APIs, no wrong types, no drifted names
- [ ] Where AI made an architectural decision, the reviewer double-checks that decision against Architecture.md — AI defaults are not necessarily this org's defaults

---

## 5. The style of review comment that lands well

**Structure of a good comment:**

1. **Severity marker** — `[blocker]` / `[major]` / `[minor]` / `[nit]`
2. **The observation** — what you're seeing, on a specific line
3. **The reference** — the standard or reasoning that makes this a comment
4. **The suggestion** — what to do, or a question if you're not sure

**Good:**

> `[major]` This query at line 143 selects from `orders` without a `tenant_id` scoping condition. Per Architecture.md §3.2, tenant scoping is enforced at the query layer, not the application layer, to make leakage impossible rather than merely unlikely. Suggest adding `.where('tenant_id', ctx.tenantId)` — or switching to the tenant-scoped repository helper if you have access to it.

**Bad (same issue):**

> This is a security issue.

The bad version leaves the author guessing what the issue is, why it matters, and how to fix it. The good version is longer but ends the round-trip — the author knows exactly what to change and why.

**Good (nit):**

> `[nit]` I'd probably call this `resolveTenantContext` rather than `getTenant` — the name doesn't have to change, but it would signal that this is more than a lookup. Optional.

**Bad (nit):**

> `getTenant` is misleading.

The bad version reads as a verdict. The good version reads as an offering.

**Good (question):**

> Was there a reason you chose a raw SQL query here over the ORM path? Not blocking — just curious, because we'd usually use `db.orders.findMany` for this and the raw query means the tenant scoping isn't enforced by the ORM defaults.

**Bad (question):**

> Why did you use raw SQL?

The bad version reads as accusatory. The good version reads as inquisitive and gives the author room to explain.

---

## 6. When to block, when to suggest, when to defer

- **Block** — data loss risk, security breach, protocol violation, missing tests on a critical path, undocumented breaking change, ADR-required deviation with no ADR. These are the `[blocker]` cases from §2.
- **Suggest with strong preference (major)** — poor error handling, missing observability, hot-path N+1, edge cases obviously missed. Author is expected to address or open a tracked follow-up.
- **Suggest with light preference (minor)** — naming, small refactor opportunities, test coverage gaps that aren't on the critical path. Author decides.
- **Defer** — anything that's a broader design concern than this PR should carry. If the design is wrong at a level this PR can't fix, that's a separate conversation (design review or ADR). Don't make the PR author refactor the world on a PR that was doing something else.

**The escape hatch for reviewer-author disagreement:** if you and the author fundamentally disagree on a `[blocker]` or `[major]`, escalate. Either bring in a third reviewer, or write the ADR that captures the disagreement and settles it at the standards level. Don't approve to end the argument.

---

## 7. Common pitfalls a principal-level reviewer catches

Things line-level reviewers often miss that show up in production:

- **Silent cross-tenant reads** — a query without a tenancy predicate that happens to return only the current tenant's data *today* because of an accident of the seed data. Requires the tenancy predicate at the query level, always.
- **Latent N+1** — a loop that calls a repository method that itself queries the DB. Reads fine in the diff; kills the p99 in production. Look for loops around anything that hits I/O.
- **Type coercion at the boundary** — accepting a string and coercing it to a number, or accepting `1` for `true`. The boundary is where invariants are established; loose typing there leaks bad state into the whole system.
- **Missing idempotency on retries** — a mutating operation that isn't safe to run twice. Retries are inevitable (network blips, timeouts). Not idempotent = double-charged customers.
- **Errors caught and swallowed** — `try { … } catch { /* ignore */ }` or its equivalents. If you can't recover, propagate; if you can, log the reason.
- **Feature flags that never get cleaned up** — a flag added to guard a rollout, then left in code six months later. This is how codebases turn into archaeological digs.
- **Time zones, always** — anything that stores or compares dates without an explicit time zone will bite. UTC everywhere internal; convert at the boundary.
- **Missing observability on the new failure mode** — you added a new external dependency and forgot to add error metrics for it. On-call finds out about it during the incident.
- **Assumed ordering** — code that assumes a list comes back sorted, or that a background job runs before another one, or that a queue delivers in order. These assumptions are fragile; make them explicit or don't rely on them.
- **AI-generated boilerplate that looks right but references APIs that don't exist** — read the imports, then read them again.

---

## 8. When *not* to do a code review

- **When you're the wrong reviewer.** If the PR touches a subsystem you don't know, either learn it (with the author's help) or route to a reviewer who does. Rubber-stamping is worse than blocking.
- **When you're tired.** Reviews done late in the day or under time pressure miss more than they catch. If it's not urgent, come back to it fresh.
- **When you disagree with the design at a level the PR can't fix.** The PR shouldn't be the venue for that fight. Take it to design review or an ADR.

---

*Owner: Gaurav Bhatnagar · Next review: 1 October 2026*
