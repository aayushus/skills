# DECISION-[Number]: [Title in active voice]

<!--
This is the canonical ADR template used across the pack. If you find yourself
wanting a lighter version, that's a signal you should write a code comment or a
PR description instead — not an ADR. ADRs exist to fossilise decisions that
outlive the person who made them.

For the workflow around ADRs (when to write, how to review, where to store,
how to supersede), see Documentation.md §4.
-->

* **Status:** Proposed | Accepted | Superseded by DECISION-XXXX | Deprecated
* **Decider(s):** [Names / roles of the people who agreed to this]
* **Date:** YYYY-MM-DD
* **Supersedes:** [DECISION-XXXX if applicable]
* **Superseded by:** [DECISION-XXXX if applicable, added later]

---

## Context

State the problem and the forces at play. Constraints (technical, organisational, time, budget), the environment this decision lives in, and the failure mode that pushed us to decide now. Link to any tickets, discussions, or prior ADRs that led here.

An ADR without context is unreadable in six months. Assume the reader has no memory of what was happening in the team when you wrote this.

---

## Decision

State the chosen path. One paragraph or one bullet list. No hedging language ("we might" / "probably" / "in some cases") — an ADR is a decision, not a discussion.

If the decision has a specific applicability (only for a bounded module, only until a triggering event, only for tenants above a size threshold), state that here.

---

## Alternatives considered

The decisions we didn't make, and why. This is the section future readers will use most, because they will show up with the alternatives already in mind and want to know whether the previous team already thought about them.

### Option A: [Name]

Brief description. Why we rejected it — cost, complexity, risk, team skill, lock-in, timing. Be specific; "not the right fit" is not a reason.

### Option B: [Name]

As above.

### Option C: Do nothing

Include this option if there was one. "We could have left it as-is" is a legitimate alternative and often the right one; document why we chose to change instead.

---

## Consequences

The trade-offs. Not "everything is fine" — every decision has costs; name them.

### Positive

What is easier now. What class of bugs is prevented. What options this opens up.

### Negative

What is harder now. What we're locked into. What we'll have to deal with when we outgrow this choice.

### Neutral / to watch

Things that might be positive or negative depending on how the world evolves. Set the tripwire — "if X happens, revisit this ADR."

---

## Implementation notes

Optional. If the decision requires specific mechanics (migration steps, feature flags, review checkpoints), capture them so the ADR is actionable.

If you're deviating from a standard in the engineering pack (README.md §3), this section MUST reference the specific standard being deviated from and describe how compliance with the *intent* of that standard is still met.

---

## References

* Related ADRs
* External articles, RFCs, or standards
* Ticket / PR links
* Prior discussion threads

---

<!--
CHANGELOG
=========
v2.0 (1 July 2026)

- Aligned with Documentation.md §4.3 which had a richer template than the
  previous version of this file. Both files should now agree; if they drift,
  Documentation.md §4 is the source of truth for process, this file is the
  source of truth for the template itself.

- Added explicit fields: Supersedes / Superseded by (missing before), Decider(s)
  (was implicit), Applicability (added into the Decision section).

- Added the "Alternatives considered — Option C: Do nothing" prompt. This is
  one of the most under-used sections and often the correct choice, so it's now
  prompted for by default.

- Added the "Implementation notes" section, which is where deviations from a
  standard in this pack must be reconciled (README.md §3). Before, deviations
  had no home in the ADR structure; now they do.

- Removed the "Compliance" section from the previous version. That was really
  about enforcement of the decision (lint rules etc.), which belongs in the
  code / CI, not the ADR. If a decision needs an enforcement mechanism,
  reference it from Implementation notes.

- Removed the "Based on the Documentation.md standards" footer since this
  template IS the standard; the pointer added confusion.
-->
