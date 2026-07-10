---
name: engineering-standards
description: The binding engineering standards for this organisation. Covers architecture, code quality, security, performance, testing, API design, documentation, containerisation, incident response, and AI-assisted development. Use as the reference during design review, code review, and pre-release verification.
---

# Engineering Standards

**Version 2.0** · Last updated 1 July 2026

These are the binding engineering standards for how we design, build, review, and operate systems in this organisation. They are not templates and not aspirational — they are the reference every reviewer uses and every contributor is expected to know.

If a specific project has a good reason to deviate from any standard on this page, that reason is captured in an **Architecture Decision Record (ADR)** and linked from the project's `docs/adr/` index. Deviations without an ADR are review blockers.

---

## Changelog

**v2.0 (1 July 2026)** — the substantive re-baseline. Change summary:

- **Stance flipped from "aspirational templates" to binding standards.** The previous README described the pack as "aspirational, reference templates … not strict constraints." That reading is no longer accurate; the pack is now the reference used during review, and any deviation is documented via ADR (see §3 below). This aligns the README with the imperative "must / never / mandatory" language the individual docs already use.
- **Added the navigation table (§2)** so a reviewer or contributor can find the right doc without opening each one.
- **Added the deviation-via-ADR process (§3).** This is what makes "binding" workable in practice — teams get an escape valve, but the deviation is visible.
- **Added maintenance & review cadence (§4)** so the pack stays current and doesn't drift back to April 2026 date-stamps.
- **Added YAML frontmatter** so this pack is loadable as an agent skill (Claude Code, Cursor, Codex, Copilot) in addition to being human-readable.

---

## 1. Reading order

Read once, in this order, before your first review or PR:

1. **This README** — the stance, the deviation process, and where to find things.
2. **Code-Review-Playbook.md** — how to *apply* the standards during review. This is the "skill", the others are the "reference".
3. **Architecture.md** — system shape, service boundaries, multi-tenancy, database, communication.
4. **Security.md** — threat model and controls.
5. **Code-Quality.md** — daily craft: naming, structure, language conventions, review-ready code.
6. **Performance.md**, **Testing.md**, **Documentation.md**, **API-Design.md**, **Container-Guidelines.md**, **Incident-Response.md**, **AI-Workflow.md** — as your work touches those areas.

---

## 2. Pack contents

| Doc | Scope | Binding on |
| --- | --- | --- |
| **Code-Review-Playbook.md** | How to review at principal-engineer depth: severity ladder, three review contexts, checklists per domain, review-comment style. | Everyone who reviews or gets reviewed. |
| **Architecture.md** | Service topology, multi-tenancy, service communication, API design at the system level, database design, event-driven patterns, decision log. | Every design review, every new service. |
| **Security.md** | Threat model, authentication, authorization, session, API keys, input validation, injection prevention, secrets, audit. | Every feature that touches auth, data, or user input. |
| **Code-Quality.md** | Project structure, naming, language conventions, comments, error handling, testing craft, refactoring, tech debt. | Every PR. |
| **Performance.md** | Budgets and SLOs, measurement, frontend performance, Core Web Vitals, bundling, rendering, backend response times, database performance. | Every feature that is user-facing or on a hot path. |
| **Testing.md** | Testing pyramid, contract testing, E2E, AI/RAG evaluation, visual regression, pre-ship checklist. | Every PR that changes behaviour. |
| **Documentation.md** | ADRs, API docs, READMEs, changelogs, diagrams. | Every architectural decision, every public interface, every release. |
| **API-Design.md** | Versioning, request/response shape, webhooks, cross-service communication. | Every public or cross-service API. |
| **Container-Guidelines.md** | Compose file conventions, storage, networking, build, secrets, operational standards. | Every project that ships or runs in containers. |
| **Incident-Response.md** | Severity levels, response roles, communication, post-mortems, runbooks. | Everyone on-call or shipping to production. |
| **AI-Workflow.md** | Model tier selection, escalation ladder, context-window discipline, parallel agents. | Everyone using AI assistants to write code. |
| **TEMPLATE-Decision.md** | Canonical ADR template. | Every decision that changes the intent of any standard. |

---

## 3. Deviating from a standard — the ADR process

Standards are binding, but reality has edges. When a project needs to deviate:

1. **Write an ADR** using `TEMPLATE-Decision.md`. State which standard you are deviating from, why the deviation is justified in this project's context, what alternatives you considered, and what the trade-offs are.
2. **Get review** from the principal engineer responsible for the standard being deviated from (see the "owner" section of each doc).
3. **Link the ADR** from the project's `docs/adr/` index and from the PR that introduces the deviation.
4. **Revisit** during the periodic review cadence (§4). Deviations that persist across multiple projects are a signal the standard itself needs updating.

An ADR is not a rubber stamp — it is the reviewable justification. Reviewers can and do reject deviations they don't find justified.

**What doesn't need an ADR:** stack-specific choices where the standards are silent (e.g., which Python HTTP client library you use), or local naming conventions inside a bounded module. If the standard doesn't take a position, you don't need an ADR to make a choice.

---

## 4. Maintenance & review cadence

- **Owner** — every doc in the pack has a named owner listed in its front-matter. The owner is accountable for keeping the doc accurate.
- **Cadence** — the pack is reviewed **quarterly**. Every doc is either re-affirmed (date-stamp updated) or revised. Docs older than two quarters without a review are flagged.
- **Deviation review** — the accumulated ADRs across projects are reviewed at the same cadence. Common deviations are candidates for absorbing back into the standard.
- **Model / stack drift** — this pack intentionally avoids naming specific model versions or library versions in the main body (see §5). When examples in appendices go stale, they are refreshed at the quarterly review.

---

## 5. Stack agnosticism

The main body of every doc is **stack-agnostic**. Rules are stated in language that applies whether you are writing TypeScript, Python, Go, Rust, or something else. Concrete examples in a specific stack live in **appendices** at the end of each doc, clearly labelled as illustrative.

Rationale: standards that hard-code "Express" or "FastAPI" or "Prisma" become invalid the moment a new project chooses a different stack. Standards stated in terms of intent (e.g., "validate at the boundary", "use parameterised queries") stay valid across stacks; the illustration in an appendix updates without touching the norm.

---

## 6. How this pack was built

This pack was assembled by consolidating existing engineering standards, code-review notes, incident retrospectives, and public playbooks. It is not a checklist — it is a set of positions we hold, with the reasoning attached. Read the reasoning. When you disagree with a position, that's an ADR waiting to be written.

---

*Owner: Gaurav Bhatnagar · Reviewed by: Engineering Principals · Next review: 1 October 2026*
