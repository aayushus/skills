# Solo Developer AI SOP

### Standard Operating Procedure for AI-Assisted Development

_Budget: $20/mo · Stack: Multi-language · Intensity: Heavy (9-hour days)_

---

## Tool Stack

|Tool|Model|Cost|Purpose|
|---|---|---|---|
|**Claude Code** (terminal)|Opus 4.6|💰 High — use sparingly|Deep thinking, architecture, hard bugs|
|**Windsurf** (IDE)|SWE-1.5|🟢 Free|Daily coding, tab autocomplete|
|**Windsurf** (IDE)|Sonnet 4.6|🟡 Medium|Bridge when SWE-1.5 falls short|
|**Antigravity** (IDE)|Gemini Flash|🟢 Free|Workhorse — routine work, large context|
|**Antigravity** (IDE)|Gemini Flash|🟢 Free|Parallel agents, background tasks|

---

## The Golden Rule

> **Never jump straight to Opus.**
> 
> The escalation ladder is: **SWE-1.5 → Gemini Flash → Sonnet 4.6 → Opus 4.6**
> 
> Most problems resolve at step 1 or 2. Opus is the last rung, not the first. If you reach for Opus out of habit, your monthly budget is gone by Wednesday.

---

## The Decision Gate

Run this before every task:

### Is it mechanical?

_(generate, scaffold, rename, format, document, convert)_ → **Gemini Flash** or **SWE-1.5** — do not open Claude Code.

### Does it require reading a large codebase?

_(many files, orientation, blast radius analysis)_ → **Gemini Flash in Antigravity** — 2M token context, free. Dump the whole codebase.

### Is it ambiguous or complex with real tradeoffs?

- Hard to reverse → **Opus 4.6** (architecture, data model, security design)
- Reversible → Try **Sonnet 4.6** first. Escalate to Opus only if the answer feels wrong.

### Is it a hard bug with unclear root cause?

→ Try Flash + Sonnet first (30 min). Still stuck? → **Opus 4.6** with a scoped prompt.

---

## 9-Hour Day Structure

```
09:00 ──────────────────────────────────────────────────────
  Morning Opus Block                          [Opus 4.6]
  Attack your hardest problem first.
  Fresh 5-hour window — don't waste it on easy tasks.
  Use the prompt you wrote the night before.

10:30 ──────────────────────────────────────────────────────
  Implementation Block              [SWE-1.5 + Gemini Flash]
  Execute what Opus designed.
  Antigravity Manager running background tasks in parallel.
  Stay in flow — free models keep you there.

13:00 ──────────────────────────────────────────────────────
  Lunch + Reset Window
  5-hour Opus window resets at ~14:00 if you started at 09:00.
  Don't tinker during lunch — save the reset for the afternoon.

14:00 ──────────────────────────────────────────────────────
  Afternoon Opus Block                        [Opus 4.6]
  Second hard problem of the day — if one exists.
  If no hard problem: skip Opus entirely, use Flash/Sonnet.

15:30 ──────────────────────────────────────────────────────
  Wind-Down Block                   [Gemini Flash + SWE-1.5]
  Feature work, tests, cleanup, PR prep, docs.
  Dispatch async tasks to Antigravity Manager.
  Check on morning background agent results.

17:30 ──────────────────────────────────────────────────────
  End-of-Day Ritual
  Update CLAUDE.md with today's decisions.
  Write tomorrow's Opus prompt while context is fresh.
  Close all Antigravity agent sessions.

18:00 ──────────────────────────────────────────────────────
```

---

## Task Routing by Type

### 🟢 Free — Gemini Flash (Antigravity) or SWE-1.5 (Windsurf)

|Task|Best Tool|Notes|
|---|---|---|
|New project setup — structure, configs, CI, env|Gemini Flash|Any language|
|CRUD, endpoints, forms, simple components|SWE-1.5|In Windsurf|
|Tab autocomplete as you type|SWE-1-mini|Always on in Windsurf|
|Unit + integration test generation|Gemini Flash|Dispatch and forget|
|"What does this whole codebase do?"|Gemini Flash|2M context window — best tool for this|
|Code review — style, consistency, obvious bugs|Gemini Flash|Load full diff in Antigravity|
|Documentation, README, inline comments, changelogs|Gemini Flash||
|Exploring a library / summarising docs|Gemini Flash|Antigravity browser agent|
|Batch migrations — rename, restructure, update imports|Gemini Flash|Antigravity parallel agents|
|Frontend visual testing / screenshots|Gemini Flash|Antigravity browser agent|

### 🟡 Medium — Sonnet 4.6 (Windsurf)

|Task|When to escalate from Flash/SWE|
|---|---|
|Medium refactors, API integration|SWE-1.5 gives a wrong or incomplete answer|
|State management, data transforms|Needs more reasoning than SWE-1.5 can provide|
|Cross-file logic changes|More than ~5 files involved|

### 🔴 High — Opus 4.6 (Claude Code terminal)

|Task|Why Opus|Notes|
|---|---|---|
|System architecture — services, data flow, tech choices|Hard to reverse, high stakes|Spend budget here|
|Database schema, API contracts, auth strategy|Foundational decisions||
|Cross-language design decisions|Ambiguous, multiple valid approaches|Python vs Go, REST vs GraphQL|
|Hard bug — unclear root cause|Multi-layer reasoning needed|After 30 min of Flash/Sonnet|
|Ambiguous requirement — high-stakes design|Multiple valid designs, need tradeoff analysis||

---

## Opus 4.6 — Before You Invoke

Before opening Claude Code for an Opus session, check:

- [ ] Have I already tried **Gemini Flash or SWE-1.5** on this? If not, start there.
- [ ] Is this decision **hard to reverse**? If easily rewritten in 10 min, it doesn't need Opus.
- [ ] Is the problem **ambiguous** or **complex**? Tedious ≠ complex. Large ≠ complex.
- [ ] Have I written a **tight, scoped prompt**? "Given X with constraint Y, what's the right approach for Z?" Not "look at my code and tell me what's wrong."
- [ ] Will I use `/compact` to keep the session lean? Don't carry yesterday's context.

---

## Antigravity — Parallel Agent Workflow

Antigravity's Manager view lets you run multiple agents asynchronously while you work on something else. These all run on Gemini Flash — free.

**Dispatch and forget — check back in 20–30 min:**

- Generate test suite for a module you just finished
- Explore an unfamiliar library and summarise the API
- Migrate a naming pattern across all files in a directory
- Write docs for a module while you code the next one
- Run browser agent to visually test a UI change
- Orientation pass on a new codebase before you start work

**How to dispatch effectively:**

1. Give the agent a clear, bounded task with a defined deliverable
2. Point it at specific files or directories — don't say "look at the whole project"
3. Specify the output format: "summarise as bullet points", "write as JSDoc", "output as a table"
4. Move on. Don't babysit it.

---

## Claude Code — Getting the Most from the 44K Window

The 5-hour token window is your most constrained resource. Protect it:

**Before the session:**

- Write your prompt the day before while context is fresh
- Scope it tightly — one specific problem, not a broad investigation
- Use Gemini Flash to orient first ("what files are involved in X?"), then bring the specific question to Opus

**During the session:**

- Use `/compact` after each distinct problem — don't accumulate a massive context thread
- Start a fresh session for each new problem
- If the session wanders, stop and restart with a tighter prompt

**CLAUDE.md saves you 30–50% of your window:** Every session Claude re-discovers your project from scratch if you don't have one. A good CLAUDE.md means Claude starts with full context and spends the window reasoning, not orienting.

---

## CLAUDE.md Template

Create this file at the root of every project:

```markdown
# Project: [name]

## What this is
[One sentence description]

## Stack
- Frontend: [language/framework]
- Backend: [language/framework]
- Database: [type + name]
- Infrastructure: [cloud/hosting]

## Key files
- Entry point: [path]
- Config: [path]
- Core logic: [path]
- Tests: [path]

## Conventions
- Naming: [camelCase / snake_case / PascalCase]
- Error handling: [pattern — throw vs return, custom errors]
- Auth: [approach — JWT, sessions, API keys]
- API style: [REST / GraphQL / RPC]

## Patterns to follow
- [example: always use repository pattern for DB access]
- [example: prefer composition over inheritance]

## Patterns to avoid
- [example: no direct DB queries in route handlers]
- [example: no global state outside store]

## Architecture decisions
- [date]: [decision and why — e.g. "2026-04-01: chose PostgreSQL over MongoDB for
  relational data integrity across user/order/payment tables"]
- [date]: [decision and why]
```

**Rules for CLAUDE.md:**

- Update it every time you make a significant architectural decision
- Keep it under 500 lines — it should be a reference, not a novel
- When you change a pattern, update the doc the same day
- Include the _why_ behind decisions, not just the _what_

---

## Multi-Language Context Switching

When switching between languages mid-day:

1. **Don't cold-start Opus on a new language.** Use Gemini Flash first to re-orient — "here's the existing Python backend, I'm now adding a Go service that calls it. Explain how they currently communicate."
    
2. **Language boundary bugs → Opus.** When a bug lives at the interface between two languages (serialisation, type mismatches, protocol differences), it's often genuinely complex. This is a legitimate Opus use case.
    
3. **Keep per-language context in CLAUDE.md.** If your project spans Python + TypeScript, add a section per language with its own conventions and key files.
    

---

## Non-Negotiable Rules

1. **CLAUDE.md is mandatory** — every project, always. No exceptions.
    
2. **Never use Opus for tasks you can describe as "generate", "write", "rename", "convert", or "document"** — those go to Flash or SWE-1.5.
    
3. **Write tomorrow's Opus prompt today** — end every day by crystallising your hardest current problem into a tight question while your brain is still warm.
    
4. **Antigravity background = free throughput** — any task that doesn't need your attention right now gets dispatched to Antigravity Manager. You're running a free second developer.
    
5. **Escalation ladder always** — SWE-1.5 → Flash → Sonnet → Opus. Never skip steps.
    
6. **/compact aggressively** — one session per problem. Don't carry context threads across your whole day.
    

---

_Last updated: April 2026_