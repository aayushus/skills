---
name: testing-standards
description: The binding testing standards. Covers the testing pyramid, contract testing, E2E, AI/RAG evaluation, visual regression, and the pre-ship checklist. Use during code review to verify tests are testing the right things, not just re-asserting the implementation.
---

# Testing Standards

**Version 2.0** · Last updated 1 July 2026

This is the binding testing standard. We don't just "write tests"; we write the *right* tests to ensure the system is stable, AI features remain accurate, and the UI never regresses. Deviations from any rule below require an ADR ([README.md](README.md) §3).

> **See also:** [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.5 — reviewer checklist for tests | [Architecture.md](Architecture.md) — service contracts and integration points | [Security.md](Security.md) — security testing (auth, injection, tenancy) | [Performance.md](Performance.md) — load and performance testing

---

## Changelog

**v2.0 (1 July 2026):**

* **Removed the dated model name.** §4 previously named "Claude 3.5 Sonnet" as the judge model — a 2024 model in a doc updated in 2026. Replaced with a tier-based description ("a stronger model than the one being evaluated") so the standard stays valid as models change.
* **Moved specific tool names to Appendix A.** The main body previously named Pact.io, Playwright, Storybook + Chromatic in the normative text. These are now referenced as "the org's chosen tool" in the body, with the specific defaults captured in Appendix A. Rationale — a project switching from Pact to a different contract-testing tool shouldn't require an ADR against a rule stating the *tool*; it should meet the *intent* of the rule.
* **Reframed as "Testing Standards" not "Testing Guidelines"** to match the pack terminology chosen in the README (§2). "Guidelines" and "Standards" were being used interchangeably; this pack uses "Standards".
* **Added the pre-PR reviewer checklist reference** — the checklist in this doc's §6 is the author's; the reviewer's checklist is in Code-Review-Playbook §4.5. Cross-linked both directions.
* **Added Appendix B: AI evaluation depth.** RAG / LLM evaluation was one paragraph; expanded to cover eval-set curation, offline vs online eval, and the "regression test from every bad response" loop.
* **Added §7 "Deviating from this standard"** — the pack-wide ADR clause.

---

## 1. The Testing Pyramid

We adhere to a **70/20/10 split** by test count and by CI time:

1. **Unit Tests (70%):** Fast, isolated tests for pure functions and business logic. No DB, no network, no filesystem.
2. **Integration Tests (20%):** Tests that hit a real (test) database or a stubbed external service. Verify that modules work together.
3. **E2E & Contract Tests (10%):** High-level tests that verify a full user flow and cross-service contracts.

If your project's ratios drift far from this, that's a signal — either the test suite has grown too heavy at the top (slow feedback, flaky CI) or too thin at the bottom (bugs escaping unit-testable code). Rebalance during the next capacity slot; write an ADR if the deviation is intentional and structural.

---

## 2. Contract Testing

To prevent the "I changed one service and broke another" problem, use **consumer-driven contract testing** whenever the project has multiple independently deployed or separately owned services.

* **When to use:**
  * Between the frontend and backend.
  * Between backend services, workers, AI services, or other separately deployed providers.
* **Workflow:**
  1. The consumer (e.g., frontend) writes a test defining the expected response.
  2. The contract-testing tool generates a machine-readable contract file.
  3. The provider (e.g., backend) verifies its implementation against that contract in its own CI pipeline before deployment.
* **Ownership:** the consumer owns the contract; the provider is responsible for not breaking it. Breaking a contract is a versioning event (see [API-Design.md](API-Design.md) §2).

Tool default: see Appendix A.

---

## 3. End-to-End (E2E) Testing

E2E tests run against a staging-like environment.

* **Priority:** the "happy path" for core business value (signup, primary create/edit flows, checkout, submit, publish). Everything else is a lower priority.
* **Stability:** avoid testing minor UI details in E2E; focus on data flow and state transitions. Assertions on pixel positions or copy tone belong in visual regression, not E2E.
* **Data isolation:** every test run uses a fresh tenant/user (see [Security.md](Security.md) — tenancy isolation).
* **Flakiness:** an E2E test that flakes more than 1% of runs is worse than no test. Fix it, quarantine it, or delete it. Flakes destroy trust in CI.

Tool default: see Appendix A.

---

## 4. AI & RAG Testing

AI features degrade silently and non-deterministically. Standard unit and integration tests don't catch this; specific practices apply:

* **Evaluation sets:** maintain a golden set of at least 50 representative inputs paired with acceptable outputs (or acceptance criteria for outputs). Grow the set over time — never let it shrink.
* **LLM-as-a-judge:** grade production outputs using a **stronger model than the one being evaluated** (e.g., use a top-tier model to grade a mid-tier or fast-tier production model). Score on correctness, tone, and format adherence. Track scores over time; a downward trend is a regression, even if no code changed.
* **Regression from every bad response:** when a user (or an internal review) reports a bad AI response, add that exact input to the golden set with the acceptable output. This prevents silent recurrence.
* **Offline eval before deploy:** every prompt change, model change, or retrieval change runs against the eval set in CI. Changes that reduce the score require a written justification (e.g., a trade-off we're accepting) or a fix before merge.
* **Online eval sampling:** in production, sample real interactions and evaluate them asynchronously. This is the only way to catch drift you didn't anticipate.

See Appendix B for depth on eval-set curation and the online/offline split.

---

## 5. Visual Regression

For the frontend:

* Every change to a design-system component must be visually verified before merge.
* Tests cover mobile and desktop viewports at minimum.
* Snapshots are reviewed by a human, not auto-approved. A "diff is small" isn't the same as "diff is correct".

Tool default: see Appendix A.

---

## 6. Pre-Ship Checklist (Testing)

This is the **author's** checklist before requesting review. The reviewer's version is in [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.5.

* [ ] Unit tests for all new business logic.
* [ ] Integration tests for new API endpoints (hitting a test DB).
* [ ] Contract tests updated if the API schema changed.
* [ ] E2E "smoke test" passes in CI.
* [ ] Golden-set eval updated if the change touches an AI feature.
* [ ] 70% total code coverage met (enforced in CI).
* [ ] Any regression test for a bug fix uses the exact input that reproduced the bug.

---

## 7. Deviating from this standard

Standards in this pack are binding (see [README.md](README.md) §3). If a project has good reason to deviate — for example, a spike that doesn't warrant contract tests, or a prototype with a different coverage bar — write an ADR using [TEMPLATE-Decision.md](TEMPLATE-Decision.md). State which rule you're deviating from, why, and what the trade-off is. Deviations without an ADR are review blockers.

---

## Appendix A — Tool defaults

Illustrative; a project can swap tools by ADR:

| Purpose | Default |
| --- | --- |
| Contract testing | Pact |
| E2E | Playwright |
| Visual regression | Storybook + Chromatic (or Playwright screenshots) |
| Unit / integration | The idiomatic framework for the language (Vitest, Jest, pytest, etc.) |
| Coverage enforcement | CI-native (nyc, coverage.py, or the framework's built-in) |

---

## Appendix B — AI evaluation depth

**Golden set curation.** Start at 50; grow as failure modes surface. Cover: happy paths, common misuse, out-of-scope requests, adversarial inputs, and inputs that resemble prompt injection attempts. Every category should have at least 5 examples.

**Offline eval (pre-merge).** Run the whole eval set on every prompt/model/retrieval change. Score each output with an LLM judge; report the delta from the previous baseline. Merges that drop the score by more than a small threshold (project-defined) require either a fix or a documented trade-off.

**Online eval (post-deploy).** Sample production interactions at a rate that gives statistical significance without exhausting the eval budget. Score asynchronously with the judge model. Alert on drift.

**Judge-model drift.** The judge is also a model, so its scoring can drift when the judge itself is upgraded. Pin the judge model version, and revisit deliberately when you change it.

---

*Owner: Gaurav Bhatnagar · Next review: 1 October 2026*
