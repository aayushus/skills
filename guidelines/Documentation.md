---
name: documentation-standards
description: The binding standards for documentation — what to document and what not to, ADRs, system diagrams, API documentation, READMEs, changelogs, semantic versioning, release notes, internal docs, writing style, maintenance, and per-project / per-PR checklists. Undocumented decisions become re-debated decisions; this doc is the process for recording what code alone can't carry.
---

# Documentation Standards

**Version 2.0** · Last updated 1 July 2026

This is the binding standard for how the docs that code alone can't carry get written. Deviations require an ADR ([README.md](README.md) §3 and §17 below).

This is a **companion** to [Architecture.md](Architecture.md), [Security.md](Security.md), [Code-Quality.md](Code-Quality.md), and [Performance.md](Performance.md). Those docs tell you *how* to build. This one tells you how to *record* what you built so future-you and future-teammates can understand the choices without spelunking through git history.

**Core stance:** undocumented decisions become re-debated decisions. Undocumented APIs become guessed-at APIs. Undocumented setup becomes a three-day onboarding. The cost of writing the doc once is always less than the accumulated cost of not writing it.

> **See also:** [TEMPLATE-Decision.md](TEMPLATE-Decision.md) — the canonical ADR template this doc's §4 references | [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.7 — reviewer checklist for documentation | [README.md](README.md) — pack stance, deviation process, pack navigation | [Architecture.md](Architecture.md) §15 — when architectural decisions require an ADR

---

## Changelog

**v2.0 (1 July 2026):**

* **Renamed formally to "Documentation Standards"** (was already this — kept, but added the pack-wide pattern: frontmatter, changelog, version, cross-links).
* **§4.3 ADR template no longer embedded here.** The previous version embedded a full ADR template inline. That template diverged from the canonical [TEMPLATE-Decision.md](TEMPLATE-Decision.md) in the pack — two homes, guaranteed to drift. §4.3 now describes the ADR structure and points to the template file; the template itself lives in one place.
* **§4.8 numbering conflict fixed.** The previous version had TWO subsections numbered §4.8 ("Verification" and "ADRs vs RFCs vs Design Docs"). "Verification" had no content and has been removed; the RFC-vs-ADR-vs-design-doc distinction stays as §4.8.
* **System diagrams (C4 model) promoted to §5.** Previously an unnumbered section between §4 and §5, invisible in the ToC. This shifted the numbers of every subsequent section by +1. Mapping: old §5 API documentation → new §6; old §6 README → §7; old §7 Changelogs → §8; old §8 Semver → §9; old §9 Release notes → §10; old §10 Internal docs → §11; old §11 Writing style → §12; old §12 Maintenance → §13; old §13 Anti-patterns → §14; old §14 Per-project checklist → §15; old §15 Per-PR checklist → §16.
* **Stack-specific examples moved to Appendix A.** OpenAPI TypeScript imports, Prisma-specific fragments, and other tool-tied examples pushed to Appendix A. The body describes the intent; the appendix shows how it maps to specific tools.
* **§4.4 ADR worked example kept.** The ULID worked example is genuinely instructive; a shorter version stays in the body.
* **§17 (new) "Deviating from this standard"** — pack-wide ADR clause.
* **YAML frontmatter added.**
* **Cross-references updated** to reflect Architecture.md v2.0 and Security.md v2.0 renumbering.

---

## Table of contents

1. [Principles](#1-principles)
2. [What to document, what not to](#2-what-to-document-what-not-to)
3. [Documentation structure per project](#3-documentation-structure-per-project)
4. [ADRs — Architecture Decision Records](#4-adrs--architecture-decision-records)
5. [System diagrams — C4 model](#5-system-diagrams--c4-model)
6. [API documentation](#6-api-documentation)
7. [README standards](#7-readme-standards)
8. [Changelogs](#8-changelogs)
9. [Semantic versioning](#9-semantic-versioning)
10. [Release notes](#10-release-notes)
11. [Internal documentation](#11-internal-documentation)
12. [Writing style](#12-writing-style)
13. [Maintenance](#13-maintenance)
14. [Anti-patterns](#14-anti-patterns)
15. [Per-project checklist](#15-per-project-checklist)
16. [Per-PR checklist](#16-per-pr-checklist)
17. [Deviating from this standard](#17-deviating-from-this-standard)
18. [Appendix A — Stack-specific illustrations](#appendix-a--stack-specific-illustrations)

---

## 1. Principles

Five principles.

**1.1 Documents that go stale are worse than no documents.** A doc that once described how something worked, but now doesn't, actively lies to the reader. Every document has an owner and a review cadence; unmaintained docs are deleted, not left to rot.

**1.2 Write for the reader you don't know.** Docs are for the engineer who joins next month, the security auditor, the future-you with no context, the AI agent trying to help. Assume none of them share your recent memory.

**1.3 Record decisions, not opinions.** Docs capture what we decided and why. Opinions belong in the discussion that led to the decision, not in the doc that records it.

**1.4 Live with the code where possible.** Docs that live in the codebase (README, ADRs, module docstrings) get updated with PRs. Docs that live in a separate system (wiki, Notion) drift. Prefer in-repo unless the doc is genuinely cross-project.

**1.5 The doc is done when a stranger can act on it.** Not when the author is happy with it. The test is: can someone new to this thing read the doc and do the thing without asking questions?

---

## 2. What to document, what not to

### 2.1 Document

* **Decisions** — why we chose this over the alternatives (ADRs).
* **Contracts** — API shapes, event shapes, module public surfaces.
* **Non-obvious constraints** — "this runs single-threaded because", "this needs to complete under 5s because".
* **Operational procedures** — how to run, restart, roll back, debug in production.
* **Domain terminology** — what "tenant", "verification", "release" mean in this system specifically.
* **Onboarding path** — the first hour, first day, first week of a new engineer.

### 2.2 Don't document

* **What the code already says clearly.** A function called `sendVerificationEmail` doesn't need a comment saying "sends the verification email".
* **Every method in every class.** Doc comments on obvious accessors are noise.
* **Meeting notes as documentation.** Meetings produce decisions; the decisions become ADRs. The notes themselves are throwaway.
* **Historic implementation details.** How the old thing worked is git history, not documentation.
* **Tribal knowledge that changes weekly.** Rapid-change knowledge belongs in team chat, not docs.

### 2.3 The staleness test

For any doc, ask:

* When was this last updated?
* Would the current maintainer confirm this is still accurate?
* Would a new engineer be misled by this?

If the answer to the second is "no" or the third is "yes", the doc is doing harm. Fix or delete.

---

## 3. Documentation structure per project

Every project has these locations, whatever the exact filesystem layout:

| Location | Contains |
| --- | --- |
| `README.md` (root) | Quick start, overview, links to deeper docs. See §7. |
| `CHANGELOG.md` (root) | User-visible change history. See §8. |
| `docs/adr/` | ADRs (see §4). One markdown file per decision. |
| `docs/architecture/` | System diagrams and architecture overview (see §5, §11.1). |
| `docs/runbooks/` | Operational procedures (see §11.2). |
| `docs/guides/` | Longer how-to guides (see §11.3). |
| `openapi.yaml` or `docs/api/` | API specification (see §6). |
| `CONTRIBUTING.md` (root) | How to contribute — setup, tests, PR expectations. |

Everything else in the codebase is either code, code-adjacent comments, or configuration.

---

## 4. ADRs — Architecture Decision Records

ADRs record decisions that outlive the code that implements them. They are the answer to "why does the system look this way" that new engineers, auditors, and future-you will keep asking.

### 4.1 When to write an ADR

Write an ADR when:

* Introducing a new framework, language, database, or third-party service
* Changing a foundational shape: tenant model, ID format, timestamp format, money representation
* Adding a new service to the topology (see [Architecture.md](Architecture.md) §2.3)
* Changing versioning, error, or authentication schemes
* **Deviating from any standard in this pack** — mandatory per [README.md](README.md) §3
* Making any decision future-you will ask "why did we do it this way?" about

Do NOT write an ADR for:

* Bug fixes
* Refactors that preserve intent
* Stack-specific micro-choices (which HTTP client library, which lint rule set) where the standards are silent

### 4.2 When to write it

**Before merging the code that implements the decision.** The ADR is part of the change, not after-the-fact narration. Write it as you're working through the choice; it becomes both your own thinking aid and the team's permanent record.

If an ADR is discovered later (the decision predates the practice), write a retrospective one — mark it clearly as retrospective and date it both: when the decision was made and when it was documented.

### 4.3 ADR template

The canonical template is **[TEMPLATE-Decision.md](TEMPLATE-Decision.md)**. Copy it, rename to `DECISION-Kebab-Case-Title.md`, fill it in.

The template has these sections (in order):

* **Status** — Proposed / Accepted / Superseded by DECISION-XXXX / Deprecated
* **Decider(s)** — the people who agreed to this
* **Date** — YYYY-MM-DD
* **Supersedes / Superseded by** — filled in over the ADR's lifetime
* **Context** — the problem, constraints, and forces in play. 2–4 paragraphs.
* **Decision** — what we're doing. One paragraph or a short bullet list. No hedging.
* **Alternatives considered** — options considered and rejected, one per subsection. Include "do nothing" as an explicit option where applicable.
* **Consequences** — trade-offs. Split into Positive, Negative, Neutral / to watch.
* **Implementation notes** — optional; pointers to code, configuration, migrations. For deviations from a pack standard, this section MUST reference the specific standard and describe the compensating control.
* **References** — related ADRs, external sources, tickets.

Do not add sections to the template. Do not remove sections. If a section is not applicable, write "N/A" — that itself is signal.

### 4.4 ADR worked example

A shortened but real example (full form of a real decision):

```markdown
# DECISION-Use-ULIDs: Use ULIDs for primary keys

**Status:** Accepted
**Decider(s):** Engineering (2026-04-10)
**Date:** 2026-04-10

## Context

We need a primary key strategy for every application table. IDs appear
in URLs, API responses, logs, and debugging output. They need to be:
globally unique across tables, safe to expose in URLs (no scale leakage),
efficient as a DB index (good locality, fixed size), and sortable by
creation time (useful for pagination and debugging).

## Decision

All primary keys are ULIDs (26-character Crockford base32, 128 bits of
entropy, timestamp-prefix for sort order). Generated at the application
layer.

## Alternatives considered

### Option A: Auto-increment integers
Compact, fast, native to databases. Rejected: leaks row count / growth
rate through URLs; enables enumeration; doesn't work across shards.

### Option B: UUIDs v4
Globally unique, non-sequential, universally supported. Rejected: not
sortable; poor B-tree index locality; 36 characters with hyphens.

### Option C: UUIDs v7 (time-ordered)
Combines UUID uniqueness with time ordering. Rejected at decision time:
only draft-standardised; library support inconsistent; still 36 chars.

### Option D: Do nothing (keep whatever the ORM defaults to)
Rejected: the default varies by ORM and by database; we'd end up with a
mix.

## Consequences

### Positive
- Cursor pagination is straightforward (ULIDs sort naturally)
- Logs are chronologically readable
- No row-count leakage through IDs

### Negative
- Small overhead vs integers in index size (26 chars vs 8 bytes)
- Team has to know what a ULID is

### Neutral / to watch
- If we ever shard, time-ordered locality reduces
- Revisit if UUIDv7 gains broad ecosystem support

## Implementation notes

Illustrative implementation patterns (ORM generator, type alias,
validation regex) live in Appendix A of Code-Quality.md.

## References
- DECISION-Tenant-Isolation
- https://github.com/ulid/spec
```

### 4.5 ADR lifecycle

ADRs are immutable history. Once an ADR is marked as **Accepted**, its content is not edited. If the decision changes, write a new ADR with `Supersedes DECISION-Old-Title` in its status, and update the old ADR's status to `Superseded by DECISION-New-Title`.

Never delete an ADR. Superseded ADRs stay in the repo — the history matters.

Filenames: `DECISION-Kebab-Case-Title.md`. Numbering (`DECISION-014-...`) is optional; if used, do not renumber.

### 4.6 ADR status values

* **Proposed** — draft, under discussion
* **Accepted** — decided, in effect
* **Deprecated** — no longer recommended, but still in use somewhere
* **Superseded by DECISION-XXXX** — replaced by a newer decision

Status changes over the ADR's life. When you supersede one, update the old ADR's status line; don't delete it. ADRs are immutable in content but mutable in status.

### 4.7 ADR index

The `docs/adr/` directory acts as the index. For humans, keep a summary in the project README or a dedicated `docs/adr/README.md` that lists ADRs with a one-line summary and status. Update the index when adding or superseding an ADR.

### 4.8 ADRs vs RFCs vs Design docs

These sometimes get confused. The distinctions:

* **ADR** — records a decision that has been made (or is being made). Past-to-present tense. Short (1–3 pages).
* **RFC** (Request for Comments) — proposes a change for discussion. Future tense. Longer, with more detail on implementation.
* **Design doc** — detailed plan for building something substantial. Often living, updated as the work progresses.

For most projects, ADRs alone are enough. Large projects add RFCs for major changes; design docs for significant features. Do not adopt three processes when one will do.

---

## 5. System diagrams — C4 model

All architecture diagrams follow the **C4 model** (Context → Containers → Components → Code). This gives everyone a shared vocabulary and prevents diagrams that are either too abstract to be useful or too detailed to be understood.

### 5.1 The four levels

| Level | What it shows | Audience |
| --- | --- | --- |
| **Level 1 — System Context** | The system as a single box + the users and external systems it interacts with | Non-technical stakeholders, executives, new joiners |
| **Level 2 — Containers** | Deployable units (services, databases, queues) and how they communicate | Engineers, architects, on-call |
| **Level 3 — Components** | Major building blocks inside a container (modules, services within a monolith) | Engineers working in that container |
| **Level 4 — Code** | Class or function-level structure. Rarely worth maintaining by hand — generate from code if needed | Engineers modifying a component |

Rule of thumb: **maintain Level 1 and Level 2 always. Maintain Level 3 for the components an on-call engineer needs to understand. Skip Level 4** unless a specific component is unusually complex.

### 5.2 What to maintain

Every project has at least these two diagrams, kept current:

1. **`docs/architecture/context.md`** — the Level 1 System Context diagram. Shows the system, its users, and the external systems it depends on.
2. **`docs/architecture/containers.md`** — the Level 2 Container diagram. Shows the deployable units, the data stores, the queues, and how they communicate.

More detailed diagrams (Level 3) are added per subsystem as they earn their keep.

### 5.3 Diagram format

Diagrams live as Mermaid, PlantUML, or Structurizr source in the repository. Source-controlled diagrams update with code. Image-only diagrams (PNGs pasted into wikis) rot.

### 5.4 Staleness rule

Diagrams are re-checked at every quarterly documentation review (§13.2). A diagram that no longer matches the system is deleted, not left. A wrong diagram is worse than no diagram.

### 5.5 Where diagrams live

* Container / Context diagrams: `docs/architecture/`
* Sequence / interaction diagrams for specific features: in the ADR or design doc for that feature
* Deployment topology: `docs/architecture/deployment.md`

---

## 6. API documentation

### 6.1 Source of truth: the spec file

The OpenAPI (or equivalent) specification is the source of truth for the API. Two directions:

* **Spec-first** — you write the OpenAPI YAML/JSON, then the server implements it. Types and client SDKs are generated from the spec.
* **Code-first** — you annotate the server code, and the spec is generated. Types and clients are generated from the extracted spec.

Both are acceptable; pick one per project via ADR. What's not acceptable is having neither — an API without a machine-readable spec is an API nobody can safely integrate with.

### 6.2 What every endpoint documents

For every endpoint, the spec records:

* **Path, method, tags.**
* **Summary** — one-line human-readable purpose.
* **Description** — longer explanation of what the endpoint does, when to use it, edge cases.
* **Request parameters** — path, query, headers, body — each with type, required/optional, description, and an example.
* **Response schemas** — one per status code, with an example.
* **Error responses** — every `code` the endpoint can return, per the error envelope in [API-Design.md](API-Design.md) §3.1.
* **Auth requirements** — which scheme, which scopes.
* **Rate limits** — if different from the default.
* **Deprecation status** — if applicable, with sunset date.

### 6.3 Error documentation

Every registered `error.code` from [API-Design.md](API-Design.md) §3.1 has a short description in the API documentation: what triggers it, what the client should do about it, and any related `details` fields.

### 6.4 Deprecation and sunsetting

* Mark endpoints `deprecated: true` in the spec.
* Add `Deprecation: true` and `Sunset: <RFC 1123 date>` response headers to the deprecated endpoints.
* Log every request to a deprecated endpoint with the client ID / API key so integrators can be notified.
* Sunset date must give at least the pack-wide minimum (12 months; 18 for enterprise clients) — see [Architecture.md](Architecture.md) §5.11.

### 6.5 API reference site

The rendered spec is published to a documentation portal, refreshed on every deploy. Options: Redoc, Stoplight, Scalar, Swagger UI — any of them works; pick one and stick with it.

### 6.6 SDK and client generation

For public APIs, publish typed client SDKs generated from the spec. Regenerate on every version bump. Do not hand-write clients — they will drift from the spec.

Illustrative OpenAPI configuration and generation examples are in Appendix A.

### 6.7 Webhook documentation

Webhooks the API sends outward are documented as thoroughly as inbound endpoints:

* Event names and when each fires
* Payload schema
* Retry behaviour and dead-letter behaviour ([API-Design.md](API-Design.md) §4.2)
* Signature verification steps ([Security.md](Security.md) §5.7)
* Idempotency key semantics ([API-Design.md](API-Design.md) §4.1)

### 6.8 Changelog for the API

The API has its own changelog separate from the application changelog. It records:

* Breaking changes (with the version bump)
* New endpoints and fields
* Deprecated endpoints and their sunset dates
* Behavioural changes that clients might notice even without a version bump

The API changelog is what integrators consume; keep it current.

---

## 7. README standards

Every project — every repository, every module inside a monorepo — has a README. If you have to explain what a project is verbally, you're missing a README.

### 7.1 The README covers

In order:

1. **Name and one-line description** — what this is, in one sentence.
2. **Quick start** — the shortest path from clone to running. Ideally under 5 minutes and 5 commands.
3. **What it is** — a paragraph or two on what the project does and why it exists.
4. **How it works** — high-level architecture with a Level 2 C4 diagram or equivalent.
5. **Requirements** — languages, runtimes, external services, credentials required.
6. **Setup** — full setup steps, more detailed than Quick Start; expected to work first time.
7. **Usage** — how to run tests, dev server, deploy.
8. **Project structure** — annotated view of the top-level directories.
9. **Configuration** — environment variables and their meaning; the value of `.env.example` is what's in the README, not what's in the file.
10. **Contributing** — pointer to `CONTRIBUTING.md`, or inline if trivial.
11. **License** — one line, pointing at LICENSE.

### 7.2 README rules

* **First words matter.** The reader knows nothing; open with what this is, not with the badges.
* **Copy-paste-able commands.** Every shell command is in a fenced block so it's clearly a command.
* **No dead links.** Every link is checked at PR review.
* **No pictures where words work.** Screenshots rot faster than diagrams; use them for genuine UI reference, not as decoration.
* **No inspirational quotes, no acronyms without definition, no "TL;DR" (write the DR shorter instead).**

### 7.3 Quick Start test

Regularly (every quarter, at minimum) run the Quick Start on a fresh machine. If it doesn't work, that's a P1 — the README is lying.

### 7.4 Screenshots and diagrams

* Include a Level 2 architecture diagram for anything more complex than a single service.
* If the product has a UI, include one representative screenshot near the top so readers see what they're getting.
* Diagrams live in `docs/architecture/`, referenced from the README.

### 7.5 Badges

Optional. If used: only badges that reflect current, meaningful status (build passing, test coverage, latest release). Badges that stay green because nobody's noticed the check is broken are worse than no badges.

### 7.6 When the project is part of a larger repo

Monorepo modules each have their own README. The root README explains the monorepo shape and points at the module READMEs. Do not duplicate module content in the root.

---

## 8. Changelogs

### 8.1 Format

Follow the **Keep a Changelog** format (keepachangelog.com). Every project's `CHANGELOG.md` opens with a link to that spec so contributors know what format to write in.

### 8.2 Section headings

Standardised categories, in this order:

* **Added** — new features
* **Changed** — changes in existing functionality
* **Deprecated** — soon-to-be removed features
* **Removed** — removed features
* **Fixed** — bug fixes
* **Security** — security-relevant fixes

Only include categories that have entries. Empty categories are noise.

### 8.3 Entry format

Each entry is one line, past tense, action-first. Include a ticket / PR reference where applicable.

Good:

> * Added tenant-scoped API key permissions (SEAL-123)
> * Fixed duplicate emails on password reset (#4218)

Bad:

> * We added a new feature to help users manage things
> * Some fixes and improvements

### 8.4 What gets a changelog entry

* Anything a user, customer, integrator, or downstream service will notice.

What does NOT get a changelog entry:

* Refactors that don't change behaviour
* Internal test-only changes
* Documentation-only changes (unless they're user-facing docs)
* Version bumps of dependencies with no behavioural impact

### 8.5 Breaking changes

Breaking changes are called out under a `### ⚠️ Breaking changes` heading at the top of the release entry, before Added / Changed / etc. They also require a corresponding major version bump per §9.

Every breaking change entry includes: what changed, what to do about it, and a link to the migration guide.

### 8.6 When to update the changelog

**In the same PR that makes the change.** Not "batched at release time" — that guarantees the changelog is incomplete because someone forgets.

If a PR's changes are entirely internal (no user-visible effect), the PR description explicitly says "no changelog entry" so a reviewer can confirm.

### 8.7 Release process

At release time:

1. Move everything under `## [Unreleased]` to a new versioned heading with the release date.
2. Create a new empty `## [Unreleased]` at the top.
3. Tag the release commit with the version number.

Illustrative changelog format is in Appendix A.

### 8.8 Machine-readable changelog

For public APIs and SDKs, a machine-readable changelog (JSON alongside the markdown) allows integrators to programmatically detect changes affecting them. Publish it if you have downstream consumers who would use it.

---

## 9. Semantic versioning

### 9.1 The semver contract

**MAJOR.MINOR.PATCH.**

* **MAJOR** — incompatible / breaking changes to the public API
* **MINOR** — new functionality in a backwards-compatible manner
* **PATCH** — backwards-compatible bug fixes

The contract is with the consumer of the "public API". Whatever the version says, the change must match.

### 9.2 Pre-release and build metadata

* `1.2.3-rc.1` — pre-release
* `1.2.3+20260410.abc123` — build metadata

Pre-releases are for testing candidates; do not use them for internal deployment tracking. Build metadata is fine for CI tags.

### 9.3 Versioning apps vs libraries

* **Libraries and SDKs** — strict semver. Consumers depend on the contract.
* **Applications** (deployed as services) — semver still helps, but "breaking change" is defined against the API you expose, not against internal changes.

### 9.4 What counts as "public API"

The public API of a library is the set of exported symbols and their documented behaviour. Adding a new optional parameter is a MINOR change. Renaming a function is MAJOR. Changing the return type is MAJOR. Fixing a documented bug (i.e., changing behaviour that consumers may have depended on) is a judgment call — err on MAJOR when in doubt.

For a service, the public API is the HTTP surface (see [Architecture.md](Architecture.md) §5.3), event schemas, webhook payloads, and SDK signatures.

### 9.5 Zero-version (`0.x.y`)

`0.x.y` versions signal instability: the public API may change at any minor version. Move to `1.0.0` when you're willing to commit to semver from that point onward — not before.

---

## 10. Release notes

Release notes are the human-readable companion to the changelog. The changelog is dense and complete; release notes are narrative and selective.

### 10.1 When you need them

* Every MAJOR release (always)
* Every MINOR release that includes features users would want to try
* PATCH releases only if the fix is notable (a security fix, a widely-reported bug)

Not every release needs release notes; every release needs a changelog entry.

### 10.2 Structure

* **Highlights** — 2–3 short paragraphs on what's most important in this release
* **What's new** — the features, with screenshots where relevant
* **Improvements** — meaningful changes that aren't features
* **Bug fixes** — notable fixes; a general "and many others" for the long tail
* **Breaking changes** — always, if any. What changed, why, how to migrate.
* **Deprecated** — announcements of things to be removed in the next major

### 10.3 Tone

* Active voice, plain language.
* Address the reader directly ("you can now …").
* Show, don't tell — screenshots, short code snippets, links to guides.
* Avoid marketing puffery. Users can tell the difference.

### 10.4 Where they live

* In-repo: `docs/releases/` as markdown, one file per release.
* Rendered: on the product's public docs site, indexed by version.
* Communicated: linked in the release announcement (email, in-app, blog).

---

## 11. Internal documentation

### 11.1 Architecture overview (`docs/architecture/overview.md`)

Every project has an architecture overview that supplements the C4 diagrams (§5) with prose:

* What each container does at a high level
* Where the trust boundaries are
* Where the data flows
* Which decisions in `docs/adr/` are most relevant to understanding the system

Kept current at every quarterly review.

### 11.2 Runbooks (`docs/runbooks/RUNBOOK-*.md`)

A runbook is the answer to "we're on-call, something has gone wrong, what do we do?". Every runbook has this structure:

* **When to use this** — the specific symptom or alert that triggers this runbook
* **Prerequisites** — access, credentials, tools needed
* **Steps** — the exact commands to run, in order, with expected output
* **Verification** — how you know the fix worked
* **Rollback** — what to do if the fix made it worse
* **Escalation** — who to page if this runbook doesn't resolve it

Runbooks are exercised (tabletop or actual) at least once per quarter. A runbook that hasn't been run in a year is a runbook that no longer works.

Common runbooks (see [Incident-Response.md](Incident-Response.md) §8):

* Database restore
* Rollback procedure
* DDoS mitigation
* Secret rotation

### 11.3 Guides (`docs/guides/`)

Longer how-to documents for things that don't fit in the README, aren't ADRs, and aren't runbooks. Examples:

* How to onboard a new tenant
* How to add a new type of AI evaluation
* How to migrate from one integration to another

Guides are versioned alongside the code. Delete guides that no longer describe the current state.

---

## 12. Writing style

### 12.1 Voice and tense

* Active voice. "The user submits the form", not "the form is submitted by the user".
* Present tense for describing what code does. "Returns 404 when the resource does not exist" — not "will return".
* Past tense in ADRs for the context ("we needed a primary key strategy").

### 12.2 Tone

* Direct. Do not soften ("perhaps this might be a good idea") when you mean "do this".
* Do not be cute. Documentation is not the place for jokes or pop-culture references — they age badly and confuse non-native speakers.
* Do not be condescending. Assume the reader is competent but unfamiliar.

### 12.3 Structure

* Lead with the action. "To restart the service, run …" — not "The way to restart the service is by running …".
* One idea per paragraph.
* Use lists for enumeration, tables for comparison, prose for narrative.
* Short sentences. If a sentence has more than one comma, it's probably two sentences.

### 12.4 Code examples

* Every code block is annotated with its language for syntax highlighting.
* Examples run. Copy-paste-able. Not "// ...".
* Show the whole minimum working example, not a fragment that assumes context.
* Prefer real code from the codebase over invented examples — real code catches drift.

### 12.5 Links

* Link the first substantive reference to a term; don't over-link.
* Prefer stable links (in-repo, semver'd public docs) over volatile ones (Slack, wiki pages that might move).
* Broken links are a review blocker.

### 12.6 Common words and phrases to cut

* "Simply" — if it were simple, we wouldn't need docs. Remove.
* "Just" — same. Remove.
* "Basically", "essentially" — filler. Remove.
* "Please" in imperative instructions — unnecessary. Remove.
* "Note that" — if it's worth saying, just say it. Remove the preamble.

### 12.7 Callouts

Use sparingly. Callouts (info / warning / note boxes) are for genuine emphasis, not decoration. If every third paragraph is a callout, nothing stands out.

### 12.8 Diagrams

* Diagrams complement text; they do not replace it.
* Every diagram has a caption explaining what it shows.
* Diagrams are source-controlled (see §5.3).

---

## 13. Maintenance

### 13.1 Ownership

Every document has a named owner — the person accountable for its accuracy. Ownership is:

* Written into the doc (typically as a footer or frontmatter field).
* Transferred explicitly when the owner leaves the team.
* Reviewed at the quarterly cadence (§13.2).

Docs without owners are docs that will rot.

### 13.2 Review cadence

* **Quarterly** — every doc in `docs/` is either re-affirmed (date-stamp updated) or revised.
* **On release** — the changelog and release notes are always current.
* **On incident** — runbooks are updated after every incident that used them ([Incident-Response.md](Incident-Response.md) §7).
* **On architectural change** — ADRs are written before merge; C4 diagrams are updated within the same PR.

### 13.3 Deletion

**A doc that is wrong is worse than no doc.** When a doc no longer describes the system:

1. First choice: fix it.
2. Second choice: delete it. A note on the previous location's index says "this used to describe X; removed on <date> because it no longer matched the system. See <replacement>".

Never leave a wrong doc in place because "someone might need it eventually".

### 13.4 CI enforcement

Automated checks catch some staleness:

* Broken markdown links fail CI.
* README code blocks that claim to be executable are tested (dry-run or full execution).
* OpenAPI spec is validated on every PR.
* Docs referring to files that no longer exist fail CI.

These are cheap; add them early in the project.

### 13.5 Docs-as-code

Docs live in the same repo as the code, get reviewed in the same PRs, get merged with the same discipline. Do not maintain docs in a separate wiki that engineers forget to update — parallel systems drift.

Exception: docs that legitimately span multiple repos (org-wide standards like this pack) live in a dedicated docs repo. Even then: source-controlled, reviewed, versioned.

---

## 14. Anti-patterns

### 14.1 The wiki graveyard

Symptom: three years of Confluence pages, half of which describe systems that no longer exist. Nobody knows what's current.

Reality: docs need ownership and a review cadence (§13). Wiki systems that lack this are graveyards. Fix or migrate to a docs-as-code system.

### 14.2 The "we'll document it later" release

Symptom: release ships without a changelog entry or updated docs. "We'll write it up next week."

Reality: docs written after the fact are hallucinated docs. They describe what the author remembers, not what actually shipped. Write the docs in the same PR.

### 14.3 The 47-page README

Symptom: the README is 5,000 lines and covers everything from git setup to deployment to team lore.

Reality: the README is the entry point, not the manual. Split into `README.md` (entry), `docs/` (specifics). See §7.1.

### 14.4 The meeting-notes-as-documentation pipeline

Symptom: decisions get recorded as meeting notes in a wiki. Nobody can find the current decision because there are five overlapping meeting notes on the same topic.

Reality: meetings produce decisions; decisions become ADRs. The notes themselves are throwaway. See §4.

### 14.5 The "let's just use the code comments" stance

Symptom: no external docs. All context lives in inline comments and commit messages.

Reality: some things (why, alternatives considered, cross-service invariants) don't fit in code comments. ADRs, READMEs, and API docs exist because code cannot carry that information alone.

### 14.6 The stale runbook

Symptom: the DDoS runbook was written in 2023. It references a monitoring tool nobody uses anymore.

Reality: runbooks are exercised quarterly (§11.2). Ones that haven't been run are deleted, not preserved.

### 14.7 Documentation as performance

Symptom: 100-page design doc that took two weeks to write and gets read once.

Reality: documentation exists to be read multiple times by different readers. Write for the reader you don't know, not for the reviewer at the design meeting. Shorter, sharper, more findable.

### 14.8 The ADR log nobody reads

Symptom: `docs/adr/` has 47 entries, but nobody remembers what any of them decided.

Reality: an index (§4.7) with one-line summaries makes ADRs discoverable. Referencing ADRs from PRs and code comments makes them living, not archived.

### 14.9 The API doc that says what the code says

Symptom: `POST /entities — creates an entity`. Nothing else.

Reality: docs restate what the code already tells you, without adding intent, constraints, or examples. Every endpoint needs at minimum: what it does, when to use it, edge cases, error behaviour (§6.2).

### 14.10 The heroic CHANGELOG entry on release day

Symptom: one person spends the afternoon before release trying to reconstruct what changed by reading git log.

Reality: changelog entries land in the PR that made the change (§8.6). Release day is a merge of the `## [Unreleased]` section into a versioned heading, nothing more.

---

## 15. Per-project checklist

For any project entering production, verify:

### 15.1 Structure

* [ ] `README.md` at root, current, passes Quick Start test
* [ ] `CHANGELOG.md` at root, `## [Unreleased]` section present
* [ ] `docs/adr/` exists with at least the initial ADRs
* [ ] `docs/architecture/context.md` and `containers.md` exist and are current
* [ ] `docs/runbooks/` exists with rollback, secret rotation, and any project-specific runbooks
* [ ] `openapi.yaml` (or equivalent) exists if the project exposes an API

### 15.2 Ownership

* [ ] Every doc has a named owner
* [ ] Quarterly review cadence is on someone's calendar

### 15.3 Automation

* [ ] Broken links fail CI
* [ ] OpenAPI validation runs on every PR
* [ ] Changelog entry is enforced by PR template

### 15.4 Substantive

* [ ] ADRs exist for the foundational decisions (tenant model, ID format, API design)
* [ ] The Quick Start actually works on a fresh machine
* [ ] The API docs are rendered on a public / internal doc site
* [ ] Runbooks have been tabletop-exercised

---

## 16. Per-PR checklist

For every PR, the reviewer confirms (see also [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.7):

### 16.1 Documentation changes

* [ ] Changelog updated for anything user-visible
* [ ] README updated if setup, entry point, dependencies, or configuration changed
* [ ] API docs updated if the API surface changed
* [ ] Guide or runbook updated if operational behaviour changed

### 16.2 ADR

* [ ] ADR written for any architecturally significant decision
* [ ] ADR follows the canonical template ([TEMPLATE-Decision.md](TEMPLATE-Decision.md))
* [ ] ADR references any standards being deviated from
* [ ] ADR is in the PR, not "in a follow-up"

### 16.3 Quality

* [ ] Code examples in docs are copy-paste-able and tested
* [ ] Links resolve
* [ ] Diagrams (if updated) reflect the code changes
* [ ] Prose is direct — no "simply", "just", "basically"

---

## 17. Deviating from this standard

Standards in this pack are binding ([README.md](README.md) §3). If a project has good reason to deviate from a documentation rule — for example, an existing repo with a wiki-based documentation system that can't be migrated in this quarter, or a legacy service that doesn't have OpenAPI — write an ADR using [TEMPLATE-Decision.md](TEMPLATE-Decision.md). State which section you're deviating from, why, what alternatives you considered, and the trade-offs. Deviations without an ADR are review blockers.

For documentation deviations specifically, the ADR must include a **plan back to compliance** — documentation deviations tend to become permanent unless the ADR explicitly names the trigger and timeline for closing the gap.

---

## Appendix A — Stack-specific illustrations

The main body of this doc is stack-agnostic. This appendix contains concrete illustrations of how the rules apply to specific stacks.

### A.1 Illustrative changelog format (Keep a Changelog)

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [2.4.0] — 2026-04-10

### Added
- Tenant-scoped API key permissions (SEAL-123)
- ULID validation on all path parameters (SEAL-145)

### Fixed
- Duplicate emails on password reset (#4218)
- Correlation ID missing from AI service traces (#4231)
```

### A.2 Illustrative release notes header

```markdown
# Release 2.4.0 — 10 April 2026

## Highlights

Tenant-scoped API key permissions are now generally available.
See the [migration guide](https://docs.example.com/migrate/api-keys-v2).

## What's new
- Tenant-scoped API keys — see the guide above.
- Ability to restrict API keys to specific resources.

## Improvements
- 30% faster search on tenants with more than 10k entities.

## Bug fixes
- Fixed duplicate emails on password reset (#4218).

## Breaking changes
None.

## Deprecated
- The legacy `X-API-Key` header is deprecated. Migrate to `Authorization: Bearer`.
```

### A.3 Illustrative OpenAPI spec organisation

```yaml
# openapi.yaml (root)
openapi: 3.1.0
info:
  title: App API
  version: 2.4.0
  description: |
    Public API for App. See https://docs.example.com/api.

servers:
  - url: https://api.example.com/api/v1
    description: Production
  - url: https://api-staging.example.com/api/v1
    description: Staging

paths:
  /entities:
    $ref: './paths/entities.yaml'
  /entities/{id}:
    $ref: './paths/entities-by-id.yaml'
  # ...

components:
  schemas:
    $ref: './schemas/index.yaml'
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
```

Paths in separate files keep the root spec navigable.

### A.4 Illustrative OpenAPI TypeScript client generation

```bash
# One-shot generation
npx openapi-typescript ./openapi.yaml -o ./src/generated/api.ts

# In CI
- name: Verify API types are in sync
  run: |
    npx openapi-typescript ./openapi.yaml -o /tmp/api.ts
    diff /tmp/api.ts ./src/generated/api.ts
```

### A.5 Illustrative runbook

```markdown
# Runbook: Database restore

## When to use this
The primary application database is unavailable and the on-call engineer
has determined that a restore is required (see docs/adr/DECISION-DR-Strategy.md).

## Prerequisites
- Access to the cloud provider console (IAM role: db-admin)
- Access to the secrets manager (permission: db-credentials.read)
- The tenant list from the last 7 days for post-restore comms

## Steps
1. In the cloud console, identify the target restore point ...
2. Restore to a staging instance first ...
3. Verify data integrity with the smoke-query set ...
4. Promote to primary via environment variable swap ...

## Verification
- Application health endpoint returns 200
- Error rate in observability is at or below baseline
- Sample writes succeed

## Rollback
- Re-point to the previous primary if healthy
- Otherwise, restore to an earlier point

## Escalation
- Page the CTO if the restore doesn't complete in 4 hours (RTO breach)
- Notify Legal if data loss is suspected
```

### A.6 Illustrative broken-links CI check

```yaml
# .github/workflows/docs.yml
name: Docs
on: [pull_request]
jobs:
  linkcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: lycheeverse/lychee-action@v2
        with:
          args: '--verbose --no-progress ./**/*.md'
```

---

*Owner: Gaurav Bhatnagar · Next review: 1 October 2026*
