# Operations: AI-Assisted Development Workflow

This document defines the standard operating procedure for collaborating with AI coding agents effectively and cost-efficiently.

---

## 1. The Golden Rule

> **Never jump straight to the most capable (most expensive) model first.**
>
> Most problems resolve at Tier 1 or Tier 2. Reserve high-capability reasoning quota strictly for genuinely hard, irreversible architectural problems.

---

## 2. The Escalation Ladder

Work bottom-up. Escalate only when the lower tier fails:

```
Tier 1 — Free / Fast Models (Autocomplete, boilerplate, scaffolding, formatting)
    ↓  fails or gives incomplete answer
Tier 2 — Mid-Tier Reasoning (Cross-file edits, medium refactoring, feature work)
    ↓  still stuck, or decision is hard to reverse
Tier 3 — High-Capability Models (System architecture, complex data models, elusive root causes)
```

---

## 3. The Decision Gate

Run this mental check before starting any task:

### 3.1 Is it mechanical?
*(Scaffolding, renaming, lint formatting, generating boilerplate, writing types)*
→ **Tier 1 (Fast / Free)**. Do not open an expensive reasoning session.

### 3.2 Does it require reading a massive codebase?
*(Many files, architecture orientation, blast radius analysis)*
→ **Tier 1 (Large Context Window)**. Feed the codebase into a high-context, fast model.

### 3.3 Is it ambiguous with real tradeoffs?
- **Hard to reverse** (Database schema, auth strategy, core data models) → **Tier 3**.
- **Easily reversible** (UI layout tweak, API route implementation) → **Tier 2**.

### 3.4 Is it a hard bug with an unclear root cause?
→ Attempt with Tier 1 + Tier 2 first (give it 20–30 mins). Still stuck? → **Tier 3** with a tightly scoped prompt and reproduction steps.

---

## 4. Task Routing Matrix

| Task Type | Recommended Model Tier | Practical Notes |
|---|---|---|
| New project scaffolding & configs | **Tier 1** | Fast generation |
| CRUD endpoints, simple forms, UI components | **Tier 1 / Tier 2** | Use established patterns |
| Real-time tab autocomplete | **Tier 1** | Inline suggestions |
| Unit & integration test generation | **Tier 1 / Tier 2** | Dispatch in parallel |
| Codebase architecture orientation | **Tier 1** (High Context) | 1M+ token context models |
| PR review & lint verification | **Tier 1 / Tier 2** | Automated checks |
| System architecture & core data models | **Tier 3** | Foundational, high stakes |
| Elusive multi-service concurrency bugs | **Tier 3** | Deep multi-hop reasoning |

---

## 5. High-Capability Checklist (Before You Invoke)

Before launching an expensive top-tier reasoning session:
- [ ] Have I tried resolving this with Tier 1 or Tier 2 first?
- [ ] Is this decision difficult or expensive to reverse later?
- [ ] Have I written a **tight, scoped prompt** with clear constraints (not "look at my code and fix it")?
- [ ] Have I gathered exact error logs, stack traces, and relevant file paths?
- [ ] Am I starting with a clean session to avoid context window pollution?

---

## 6. Parallel Agent Workflows

When using an agentic environment that supports background subagents:

**Dispatch and continue other work (check back in 20–30 mins):**
- Generate comprehensive test suites for a newly completed module.
- Perform codebase-wide import migrations or naming refactors.
- Generate API documentation and markdown guides.
- Research third-party library API contracts.

**Dispatch Rules:**
1. Give a bounded task with an explicit deliverable.
2. Scope to specific directories (`src/modules/billing/`).
3. Define the output format (e.g., "return as unit test file").

---

## 7. Context Window Discipline

- **Keep Sessions Fresh**: Start a new session for each distinct problem. Carrying yesterday's context degrades reasoning quality and wastes tokens.
- **Compact Periodically**: Use `/compact` or reset context after completing a major milestone.
- **Rule Files Save Context**: Maintaining `CLAUDE.md` / `rules.md` / `AGENTS.md` prevents agents from spending tokens rediscovering project conventions.
