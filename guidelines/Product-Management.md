# Product Management Guidelines

**Version 1.0** · Last updated 2 May 2026

This document defines how we bridge the gap between business vision and engineering execution. It ensures that every line of code written has a clear "Why," a defined "Who," and a measurable "Success."

---

## 1. Principles

**1.1 Solve Problems, Not Features.** We don't build "a search bar"; we solve the problem: "Users can't find specific entities quickly."

**1.2 Data-Informed, Not Data-Driven.** Data provides the "what," but empathy and intuition provide the "why." Use both.

**1.3 Iterative over Big-Bang.** Ship the smallest version that provides value (MVP), then iterate based on real usage.

**1.4 The "Why" is Mandatory.** Every project or story without a clear benefit to the user or the business is tech debt in the making.

---

## 2. The Hierarchy of Work

We organize work into three layers:

1.  **Roadmap (Strategic):** 3–6 month view of high-level goals (e.g., "Enterprise Readiness").
2.  **Projects / Epics (Tactical):** 2–4 week initiatives with a specific outcome (e.g., "OAuth2 Integration").
3.  **Issues / Stories (Operational):** 1–3 day tasks that contribute to a Project (e.g., "Google Login Button").

---

## 3. Product Requirement Document (PRD)

Every **Project/Epic** must have a PRD (recorded in the internal wiki or a `PRODUCT-` markdown file).

### PRD Template
- **Problem Statement:** What pain is the user feeling?
- **User Persona:** Who are we building this for? (Admin, Viewer, End-user)
- **Goals:** What does success look like? (e.g., "Login time reduced by 50%")
- **User Stories:** High-level list of "As a... I want... So that..."
- **Constraints/Risks:** Security concerns, performance budgets, or technical limitations.
- **Success Metrics:** How will we measure this after launch?

---

## 4. User Story Standards

We write stories from the perspective of the user, not the system.

**Format:**
> **As a** [Persona]
> **I want** [Action]
> **So that** [Value/Benefit]

**Example:**
*   *Bad:* `Create /api/v1/auth/google endpoint.`
*   *Good:* `As a Member, I want to log in via Google so that I don't have to remember another password.`

**Acceptance Criteria (AC):**
Every story must have ACs that are binary (either it's done or it isn't).
- [ ] User can click "Sign in with Google."
- [ ] User is redirected to Google OAuth flow.
- [ ] After success, user is redirected to the Dashboard.
- [ ] New user record is created in the database on first login.

---

## 5. The Triage & Handoff Process

1.  **Discovery:** PM and Lead Engineer discuss the PRD to ensure technical feasibility.
2.  **Decomposition:** The Project is broken down into small, independent Issues (Stories).
3.  **Grooming:** The team reviews the Stories to ensure the "Why" and "AC" are clear.
4.  **Ready for Dev:** A story is ready when it has:
    - Clear Title & Description.
    - Validated User Story format.
    - Binary Acceptance Criteria.
    - Design assets attached (if applicable).

---

## 6. Feedback & Analytics

- **Post-Launch Review:** 30 days after a Project is "Done," review the success metrics.
- **User Feedback:** Direct feedback from the team chat or support tickets is triaged back into the Roadmap.
- **Sunsetting:** If a feature isn't being used (based on analytics), propose a `DECISION-` to remove it.

---

*End of document. Product standards are reviewed every 6 months.*
