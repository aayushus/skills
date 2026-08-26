---
name: product-management
description: B2B/SaaS product management skill. Use when writing PRDs, user stories, acceptance criteria, scoping AI features, or structuring roadmaps. Ensures every task has a clear why, a defined who, and binary acceptance criteria before touching code.
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

Every Epic must have a PRD before any development starts. Record it in a `PRODUCT-[feature-name].md` file or in the project wiki.

```markdown
## Problem Statement
What pain is the user feeling? Be specific — name the user type and the friction.

## User Persona
Who are we building this for? (Admin / Member / End-user / etc.)

## Goals & Measurable Outcomes
What does success look like? Use measurable numbers.
- e.g., "Login conversion improves by 20%"
- e.g., "Support tickets about password resets drop by 50%"

## User Stories
High-level list (detailed ACs go on individual issues):
- As a [Persona], I want [Action] so that [Value].

## Constraints & Risks
- Security: [any auth, data, or compliance considerations — see `docs/guidelines/security/auth-and-sessions.md` & `ai-security.md`]
- Performance: [any budgets or SLOs that apply — see `docs/guidelines/quality-performance/performance-budgets.md`]
- Technical: [any architectural limitations — see `docs/guidelines/architecture/service-topology.md`]

## Success Metrics (30-Day Evaluation)
How will we measure this 30 days after launch?
```

---

## AI Feature Scoping Extension (For GenAI / LLM Features)

When scoping features powered by AI / LLMs, append this section to the PRD:

```markdown
## AI Feature Specifications

### 1. Model & Latency Targets
- **Model Tier**: [e.g., Tier 1 Fast / Tier 2 Reasoning / Tier 3 Frontier]
- **Target Response Time**: [e.g., < 2.0s streaming, < 1.0s first token]
- **Cost Budget**: [e.g., Max $0.02 per user invocation]

### 2. Failure & Fallback Behavior
- What happens if the AI model returns a 500, times out, or hallucinates?
- e.g., "Fallback to manual form input" or "Display cached suggestion with retry button".

### 3. Evaluation Rubric & Golden Dataset
- Required accuracy / precision threshold on the 50-case evaluation set: [e.g., ≥ 90%].
- Specific refusal requirements (safety / prompt injection boundaries).
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

### Acceptance Criteria (AC)
Every story must have **binary ACs** — each item is either done or it isn't. "It works" is not an AC.

```markdown
- [ ] User can click "Sign in with Google" on the login screen
- [ ] User is redirected to the Google OAuth consent screen
- [ ] After approval, user is redirected to the Dashboard
- [ ] A new user record is created in the database on first login with `authProvider: GOOGLE`
- [ ] Existing users who sign in via Google are matched by verified email
```

---

## Technical Spike Template (For Unknowns)

When architectural or technical feasibility is uncertain, create a time-boxed **Spike** before writing user stories:

```markdown
# SPIKE: [Investigate X Technology / Architecture]
- **Time Box**: [e.g., 4 hours / 1 day max]
- **Specific Question to Answer**: [e.g., "Can we stream LLM completions through Cloudflare Workers with <500ms TTFT?"]
- **Expected Deliverable**: Working code prototype or written recommendation document with trade-offs.
```

---

## Story Sizing & Splitting Rules

- **Max Story Duration**: A story should take $\le 1\text{ to }2\text{ days}$ of development.
- **Vertical Slicing**: Slice by thin end-to-end user value, not by technical layer:
  - ❌ **Horizontal (Bad)**: Story 1: Create DB schema. Story 2: Create API routes. Story 3: Build UI.
  - ✅ **Vertical (Good)**: Story 1: User can view list of projects (DB + API + UI). Story 2: User can filter projects by status.

---

## Issue Readiness Checklist

A story is ready to pull into development when it has:

- [ ] Clear user-facing title
- [ ] Validated user story format (`As a` / `I want` / `So that`)
- [ ] Binary acceptance criteria (every item is checkable)
- [ ] Design assets linked or explicitly noted as not needed
- [ ] PRD linked (for stories belonging to an Epic)
- [ ] Sized to $\le 2$ days of engineering effort

---

## When to Push Back

When you receive a task or feature request, check:
1. **Is there a user problem defined?** If not, ask "what pain does this solve?"
2. **Is the persona clear?** If not, ask "who specifically benefits?"
3. **Is there acceptance criteria?** If not, write it and confirm before starting.
4. **Is this the smallest viable version?** If not, propose vertical slicing.

Never start implementation on a vague task. The cost of clarification is 5 minutes; the cost of building the wrong thing is days.
