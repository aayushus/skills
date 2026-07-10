---
name: ai-workflow
description: How to use AI coding assistants effectively — escalation ladder across model tiers, task routing, context-window discipline, parallel-agent patterns, and rules for when NOT to use the top tier. Read this before starting any development session that involves an AI assistant. Applies alongside the Code-Review-Playbook (which covers reviewing AI-generated code).
---

# AI Development Workflow

**Version 2.0** · Last updated 1 July 2026

**A model-agnostic guide to using AI coding assistants effectively without burning your budget.**

> **See also:** [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.10 — how to review AI-generated code | [Code-Quality.md](Code-Quality.md) — the craft standards AI output is held to | [README.md](README.md) — pack stance and ADR process

---

## Changelog

**v2.0 (1 July 2026):**

* Added YAML frontmatter so the doc is loadable as an agent skill.
* Added the See-also cross-references at the top so this file is discoverable in context of the wider pack.
* Added §12 "AI code is code" — a short, binding rule that AI-generated code is held to the same standard as human-written code and reviewed against the same checklist. This mattered enough to make explicit; the Code-Review-Playbook §4.10 has the reviewer-side detail.
* Added §13 "Deviation via ADR" — the pack-wide clause. If a project has reason to deviate from the escalation ladder (e.g., a research spike where you legitimately need Tier 3 for exploration), write an ADR.
* Tightened §5 "Getting the Most from Your Context Window" — was slightly redundant; consolidated bullet points and removed the CLAUDE.md percentage claim which was unsourced.
* No changes to the core escalation ladder or task-routing tables — those were already sound and model-agnostic.

---

## The Core Principle

> **Never jump to the most capable (most expensive) model first.**
>
> Most problems resolve at a lower tier. Save your high-capability quota for genuinely hard problems.

---

## 1. The Escalation Ladder

Work bottom-up. Only escalate when the current tier fails:

```
Tier 1 — Free / fast models (autocomplete, small tasks)
    ↓  fails or wrong answer
Tier 2 — Mid-tier chat model (medium complexity, cross-file edits)
    ↓  still wrong, or decision is hard to reverse
Tier 3 — Most capable model (architecture, hard bugs, ambiguous design)
```

Never start at Tier 3. Tedious ≠ complex. Large ≠ complex.

---

## 2. The Decision Gate

Run this before every task:

### Is it mechanical?
*(generate, scaffold, rename, format, document, convert)*
→ **Tier 1** — autocomplete or fast chat. Do not open an expensive session.

### Does it require reading a large codebase?
*(many files, orientation, blast radius analysis)*
→ **Tier 1** — use whichever model has the largest context window for orientation. Dump the whole codebase if needed.

### Is it ambiguous or complex with real tradeoffs?

* Hard to reverse → **Tier 3** (architecture, data model, security design)
* Reversible → Try **Tier 2** first. Escalate only if the answer feels wrong.

### Is it a hard bug with unclear root cause?
→ Try Tier 1 + Tier 2 first (give it ~30 min). Still stuck? → **Tier 3** with a scoped prompt.

---

## 3. Before You Invoke a High-Capability Model

Check these before starting an expensive session:

* [ ] Have I tried a cheaper/faster model on this first?
* [ ] Is this decision hard to reverse? If easily rewritten in 10 min, it doesn't need the top tier.
* [ ] Is the problem genuinely ambiguous or complex? (Tedious ≠ complex)
* [ ] Have I written a tight, scoped prompt? "Given X with constraint Y, what's the right approach for Z?" — not "look at my code and tell me what's wrong."
* [ ] Will I keep the session lean? Start fresh for each distinct problem.

---

## 4. Task Routing by Type

### Free / Fast — Tier 1

| Task | Notes |
| --- | --- |
| New project setup — structure, configs, CI, env | Any framework |
| CRUD, endpoints, forms, simple components | Mechanical output |
| Tab autocomplete while typing | Always on |
| Unit + integration test generation | Dispatch and forget |
| "What does this whole codebase do?" | Use largest context window |
| Code review — style, consistency, obvious bugs | Load full diff |
| Documentation, README, inline comments, changelogs | |
| Batch migrations — rename, restructure, update imports | Parallel if possible |

### Mid-Tier — Tier 2

| Task | When to escalate from Tier 1 |
| --- | --- |
| Medium refactors, API integration | Tier 1 gives wrong or incomplete answer |
| State management, data transforms | Needs more reasoning |
| Cross-file logic changes | More than ~5 files involved |

### High-Capability — Tier 3

| Task | Why |
| --- | --- |
| System architecture — services, data flow, tech choices | Hard to reverse, high stakes |
| Database schema, API contracts, auth strategy | Foundational decisions |
| Hard bug — unclear root cause | Multi-layer reasoning needed (after 30 min of Tier 1/2) |
| Ambiguous requirement — high-stakes design | Multiple valid designs, need tradeoff analysis |

---

## 5. Getting the Most from Your Context Window

Your context window is a constrained resource. Protect it:

**Before a session:**

* Scope tightly — one specific problem, not a broad investigation.
* Use a cheaper model to orient first ("what files are involved in X?"), then bring the specific question to the top tier.
* Prepare your prompt while context is fresh (ideally the night before).

**During a session:**

* Start a fresh session for each new problem — don't carry state from unrelated problems.
* Use `/compact` (or equivalent) after distinct sub-problems if your tool supports it.
* If the session wanders, stop and restart with a tighter prompt.

**A project-level context file (e.g., `CLAUDE.md`, `.cursorrules`, or equivalent) saves substantial context window on every session.** Without one, the AI re-discovers your project from scratch each session, spending its budget on orientation instead of reasoning. Every project should have one.

---

## 6. Parallel Agent Workflow

If your tooling supports multiple parallel agents, use them for background tasks while you work on something else:

**Dispatch and forget (check back in 20–30 min):**

* Generate test suite for a module you just finished.
* Explore an unfamiliar library and summarise the API.
* Migrate a naming pattern across all files in a directory.
* Write docs for a module while you code the next one.
* Orientation pass on a new codebase.

**How to dispatch effectively:**

1. Give a clear, bounded task with a defined deliverable.
2. Point it at specific files or directories — not "look at the whole project".
3. Specify the output format: "summarise as bullet points", "write as JSDoc", "output as a table".
4. Move on — don't babysit it.

---

## 7. Non-Negotiable Rules

1. **A project context file is mandatory** (`CLAUDE.md`, `.cursorrules`, or equivalent) — every project, always. No exceptions.
2. **Never use Tier 3 for "generate", "write", "rename", "convert", or "document"** — those go to Tier 1.
3. **Escalation ladder always** — never skip tiers out of habit.
4. **Session discipline** — one session per problem, start fresh for each.
5. **Free background capacity** — any task that doesn't need your attention right now can run in the background. You're running a free second developer.

---

## 8. Multi-Language / Multi-Context Projects

When switching between domains (languages, services, repos) mid-day:

1. **Don't cold-start Tier 3 on a new context.** Use a cheaper model first to re-orient — "here's the existing Python backend, I'm now adding a Go service that calls it. Explain how they currently communicate."
2. **Language boundary bugs → Tier 3.** When a bug lives at the interface between two systems (serialisation, type mismatches, protocol differences), it's often genuinely complex. Legitimate top-tier use case.
3. **Keep per-domain context in the project context file.** If your project spans multiple languages or services, add a section per domain with its own conventions and key files.

---

## 12. AI code is code

AI-generated code is held to the same standard as human-written code. It is reviewed against the same checklist ([Code-Review-Playbook.md](Code-Review-Playbook.md) §4), meets the same quality bar ([Code-Quality.md](Code-Quality.md)), and — if it touches architecture, security, or performance — needs the same evidence of thought.

Two failure modes to watch for:

* **Confident hallucination.** AI output often looks polished while referencing APIs that don't exist, wrong versions of libraries, or patterns that were valid in a different codebase. Read the imports; run the tests; don't merge on trust.
* **AI defaults drifting from house defaults.** AI assistants tend to reach for popular patterns, which are not always this org's patterns. The Code-Quality and Architecture docs define house defaults; check AI output against them, not against generic "best practice".

If you find yourself frequently correcting the AI on the same house pattern, that's a signal to codify the pattern in the project context file (`CLAUDE.md` etc.), not to keep correcting.

---

## 13. Deviating from this workflow

Standards in this pack are binding (see [README.md](README.md) §3). If a project has good reason to deviate from the escalation ladder — for example, a time-boxed research spike where jumping to Tier 3 to explore an unfamiliar problem is genuinely the right call — write an ADR using [TEMPLATE-Decision.md](TEMPLATE-Decision.md). Reference which rule you're deviating from and why. Deviations without an ADR are review blockers.

---

*Owner: Gaurav Bhatnagar · Next review: 1 October 2026*
