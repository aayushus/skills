# Operations: Documentation & Architecture Decision Records (ADRs)

This document defines standards for recording architectural decisions, maintaining project READMEs, and tracking changelogs.

---

## 1. Core Principles

1. **Document Why, Not What**: Code tells the reader *what* the system does. Documentation explains *why* it was designed that way and what tradeoffs were accepted.
2. **Keep Docs Near Code**: Store documentation inside the repository (`docs/`) versioned alongside the code it describes.
3. **Decisions are Irreversible Without an ADR**: Any architectural choice with significant tradeoffs or difficult reversal paths requires a written Architecture Decision Record.

---

## 2. Architecture Decision Records (ADRs)

### 2.1 When to Write an ADR
Write an ADR when:
- Selecting or replacing a major framework, database, or queue.
- Establishing a tenancy model or data isolation boundary.
- Defining an authentication or cryptographic strategy.
- Introducing a breaking API protocol change.
- Choosing a novel pattern over an existing standard.

### 2.2 ADR Storage & File Naming
Store records under `docs/decisions/` or `docs/adrs/` with sequential numbering:
`DECISION-001-primary-database-postgres.md`

### 2.3 ADR Lifecycle Statuses
- `PROPOSED`: Under team review; open for feedback.
- `ACCEPTED`: Decision finalized; implementation authorized.
- `DEPRECATED`: Decision no longer enforced.
- `SUPERSEDED`: Replaced by a newer ADR (must link to new ADR).

---

## 3. Project README Standards

Every repository root must have a clear `README.md` containing:
1. **One-Line Pitch**: What the project does and who it is for.
2. **Quickstart / One-Command Setup**: Minimal instructions to run the application locally.
3. **Prerequisites**: Required Node/Python/Go versions, Docker requirements, etc.
4. **Environment Variables**: Table of required `.env` variables with dummy examples.
5. **Testing & Build Commands**: `npm test`, `npm run build`, `npm run lint`.

---

## 4. Changelog Standards

Maintain a `CHANGELOG.md` following the [Keep a Changelog](https://keepachangelog.com/) standard:

```markdown
# Changelog

## [1.2.0] - 2026-04-15
### Added
- Added cursor-based pagination to `/api/v1/projects` endpoint.
- Introduced token bucket rate limiting on public routes.

### Fixed
- Fixed session invalidation bug during password reset.

### Security
- Updated dependency package to patch CVE-2026-XXXX.
```
