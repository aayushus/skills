# Modular Monolith Architecture

*   **Status:** Accepted
*   **Decider(s):** [your name]
*   **Date:** [date]

## Context
We are building a B2B SaaS platform targeting 10k users. While the long-term goal may require microservices, the initial complexity of distributed systems (deployment overhead, eventual consistency, network latency) is a risk to velocity. We need a system that is easy to develop but allows for clear boundaries that can be split later.

## Decision
We will use a **Modular Monolith** architecture.
*   Single repository and single deployment unit (Node.js/Express).
*   Strict domain boundaries enforced via folder structure (`src/modules/[domain]`).
*   Modules communicate via internal service calls, not direct database access to other modules' tables.
*   Shared database (Postgres) but with logical schema separation per module.

## Consequences
*   **Easier Deployment:** One pipeline, one artifact.
*   **Strong Consistency:** ACID transactions across modules are still possible if absolutely necessary.
*   **Velocity:** No need to manage service meshes, distributed tracing, or complex local setups.
*   **Refactoring:** Moving code between modules is easier than moving code between services.
*   **Risk:** If developers bypass module boundaries (e.g., direct DB joins across modules), the monolith becomes "tangled." This requires strict PR review and linting.

## Compliance
*   **Linting:** `eslint-plugin-import` rules to prevent cross-module imports except through designated service entry points.
*   **Code Review:** PRs that introduce cross-module database joins or bypass internal APIs will be rejected per `Architecture.md`.
