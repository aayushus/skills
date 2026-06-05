# Engineering Workflow

**Version 1.0** · Last updated 2 May 2026

This document defines how we manage work, from the first spark of an idea to the final merge. It prioritizes **speed, clarity, and async communication**. While written to be tool-agnostic, it is optimized for modern platforms like the issue tracker.

---

## 1. Principles

**1.1 One Source of Truth.** If it isn't in the issue tracker, it doesn't exist. No verbal tasks, no team chat-only requests.

**1.2 High Signal, Low Ceremony.** Minimize manual status updates. Use automation (Git integrations) to move tasks through the lifecycle.

**1.3 Outcome-Oriented.** Issues describe **what** the user gets or **what** the system can now do, not the technical steps to get there. See [Product Management](Product-Management.md) for User Story standards.

**1.4 Async-First.** Use the issue as the central hub for discussion. Decisions made in meetings or team chat must be summarized in the issue.

---

## 2. Issue Lifecycle

### 2.1 Writing the Issue
- **Title:** User-facing outcome or specific technical goal.
    - *Good:* `OAuth login with Google`
    - *Bad:* `Refactor auth handler`
- **Description:** Provide enough context for a stranger to pick up the task cold. Include links to relevant docs/designs.
- **Acceptance Criteria (AC):** A checklist of verifiable outcomes. "It works" is not an AC.

### 2.2 Triage & Priority
All new issues enter a `Triage` state and must be reviewed within 24 hours.
- **Urgent (P0):** Production down or data loss. Immediate action.
- **High (P1):** Blocking core feature or major bug. Current cycle.
- **Normal (P2):** Standard feature/improvement. Upcoming cycle.
- **Low (P3):** "Nice to have" or minor tech debt. Backlog.

### 2.3 Status Transitions
The lifecycle follows: `Triage → Backlog → Todo → In Progress → In Review → Done`.
- **In Progress:** When work starts and a branch is created.
- **In Review:** When a PR is opened.
- **Done:** Automatically triggered by the merge of the linked PR.

---

## 3. Git & Pull Request Strategy

### 3.1 Branch Naming
Reference the issue ID in the branch name for automatic linking.
- `feature/ENG-123-oauth-login`
- `fix/ENG-456-button-misalignment`

### 3.2 The Pull Request
PRs are the primary gate for code quality.
- **Linking:** Use magic words (`Fixes #123`, `Resolves ENG-456`) in the PR description to auto-close the issue on merge.
- **Scope:** One PR = One Task. Avoid "while I'm at it" refactors.
- **Mandatory Testing:** Every bug fix or feature resolution **MUST** include a corresponding test case (unit or integration) that reproduces the issue or verifies the fix. No PR will be merged without verification logic.
- **Checklist:** Every PR must include:
    - [ ] Tests (Unit/Integration) covering the specific change
    - [ ] Documentation updated
    - [ ] Self-review performed

---

## 4. Definition of Done (DoD)

A task is only **Done** when:
1.  Code is merged to the main branch.
2.  Automated tests (including the new test case for the fix) pass in CI.
3.  Documentation (README, API, ADR) is updated to reflect changes.
4.  The issue is closed in the tracker.

---

## 5. Cycles & Planning

We operate in **2-week cycles**.
- **Planning:** Pull tasks from the prioritized backlog based on team velocity. Leave 20% "buffer" for unplanned bugs.
- **Mid-Cycle Review:** Adjust scope if blockers are discovered.
- **Closing:** Incomplete tasks are moved to the next cycle or back to the backlog; they never "just stay in progress."

---

## 6. Communication & Decisions

- **Issue Comments:** For technical questions and design discussions.
- **team chat:** For urgent "is this breaking?" talk or quick syncs.
- **Meetings:** For high-bandwidth creative brainstorming.
- **Record:** Any decision that changes the system's architecture MUST be recorded in a `DECISION-` file (ADR), regardless of where it was discussed.

---

*End of document. This workflow is audited quarterly to remove friction.*
