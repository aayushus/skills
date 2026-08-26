# ADR Template

Use this template when recording a non-obvious, irreversible, or contentious technical decision.

File naming: `DECISION-00X-short-slug.md` (e.g. `DECISION-001-primary-database-postgres.md`).

---

# DECISION-[00X]: [Short title in imperative mood]

- **Status:** [ PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED by DECISION-00Y ]
- **Date:** YYYY-MM-DD
- **Deciders:** [Names or GitHub handles of who made the call]
- **Relevant files:** [List of key files or modules affected]

---

## Context and Problem Statement

What is the situation? What problem are we trying to solve? Why does a decision need to be made now?

State the technical and business constraints clearly.

---

## Decision Drivers

- Driver 1 (e.g. "We need sub-10ms read latency for user profiles")
- Driver 2 (e.g. "The team has deep operational experience with PostgreSQL")
- Driver 3 (e.g. "Budget constraints cap hosted infrastructure at $X/month")

---

## Considered Options

1. **Option 1**: [Description]
2. **Option 2**: [Description]
3. **Option 3**: [Description]

---

## Decision Outcome

**Chosen option:** Option X because [concise justification linking back to decision drivers].

### Positive Consequences
- [Advantage 1]
- [Advantage 2]

### Negative Consequences / Tradeoffs
- [Tradeoff 1 that we accept]
- [Tradeoff 2 that we must mitigate]

---

## Pros and Cons of the Options

### Option 1: [Title]
- Good, because [argument]
- Bad, because [argument]

### Option 2: [Title]
- Good, because [argument]
- Bad, because [argument]

---

## Implementation Notes
- Migration or rollout steps
- Monitoring and success metrics
