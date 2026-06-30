---
name: product-management
description: B2B/SaaS product management skill. Use when writing PRDs, user stories, acceptance criteria, or structuring roadmaps. Ensures every task has a clear why, a defined who, and binary acceptance criteria before touching code.
---

# Product Management Skill

When this skill is active, apply these standards to all product planning, scoping, and task-writing work. Do not start implementation until scope is correctly defined. Push back on vague requests — ask for the problem, persona, and success metric.

---

## Principles

**Solve problems, not features.** We don't build "a search bar"; we solve: "Users can't find specific entities quickly." Always reframe feature requests as the underlying problem.

**Data-informed, not data-driven.** Data tells you *what* is happening; empathy and intuition explain *why*. Use both.

**Iterative over big-bang.** Ship the smallest version that provides value, then iterate based on real usage. Never commit to the full vision before validating the core.

**The "Why" is mandatory.** Any task without a clear benefit to the user or the business is tech debt in the making. Reject or defer stories without a why.

---

## Hierarchy of Work

Three layers, each with a distinct time horizon:

| Layer | Name | Horizon | Example |
|---|---|---|---|
| Strategic | Roadmap goal | 3–6 months | "Enterprise Readiness" |
| Tactical | Project / Epic | 2–4 weeks | "OAuth2 Integration" |
| Operational | Issue / Story | 1–3 days | "Google Login Button" |

Never jump from roadmap to code. Every implemented story must trace back to an epic, which traces back to a roadmap goal.

---

## PRD Template

Every Epic must have a PRD before any development starts. Record it in a `PRODUCT-[feature-name].md` file or in the internal wiki.

```markdown
## Problem Statement
What pain is the user feeling? Be specific — name the user type and the friction.

## User Persona
Who are we building this for? (Admin / Member / End-user / etc.)

## Goals
What does success look like? Use measurable outcomes.
- e.g., "Login conversion improves by 20%"
- e.g., "Support tickets about password resets drop by 50%"

## User Stories
High-level list (detailed ACs go on individual issues):
- As a [Persona], I want [Action] so that [Value].

## Constraints & Risks
- Security: [any auth, data, or compliance considerations]
- Performance: [any budgets or SLOs that apply]
- Technical: [any architectural limitations]

## Success Metrics
How will we measure this 30 days after launch?
```

---

## User Story Standard

Write stories from the perspective of the user, not the system.

**Format:**
```
As a [Persona]
I want [Action]
So that [Value/Benefit]
```

**Bad:** `Create /api/v1/auth/google endpoint.`
**Good:** `As a Member, I want to log in via Google so that I don't have to remember another password.`

**Acceptance Criteria (AC):** Every story must have binary ACs — each item is either done or it isn't. "It works" is not an AC.

```markdown
- [ ] User can click "Sign in with Google"
- [ ] User is redirected to the Google OAuth consent screen
- [ ] After approval, user is redirected to the Dashboard
- [ ] A new user record is created in the database on first login
- [ ] Existing users who sign in via Google are matched by email
```

---

## Issue Readiness Checklist

A story is ready to pull into development when it has:

- [ ] Clear title (user-facing outcome, not the technical step)
- [ ] Validated user story format (As a / I want / So that)
- [ ] Binary acceptance criteria (every item is checkable)
- [ ] Design assets linked or explicitly noted as not needed
- [ ] PRD linked (for stories that are part of an Epic)

---

## Post-Launch Review

30 days after a Project ships, check the success metrics defined in the PRD:
- Did the metrics move?
- What did users do that we didn't expect?
- Is there a follow-on Epic, or is this roadmap item closed?

If a feature isn't being used, propose removing it — unused code is a maintenance burden.

---

## When to Push Back

When you receive a task or feature request, check:
1. **Is there a user problem defined?** If not, ask "what pain does this solve?"
2. **Is the persona clear?** If not, ask "who specifically benefits?"
3. **Is there acceptance criteria?** If not, write it and confirm before starting.
4. **Is this the smallest viable version?** If not, propose splitting it.

Never start implementation on a vague task. The cost of clarification is 5 minutes; the cost of building the wrong thing is days.
