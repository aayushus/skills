# aayushus-skills

One command to bootstrap production-ready AI agent configs, a B2B design system, modular engineering guidelines, a PM skill, and Graphify into any repo.

Zero dependencies. Works with any tech stack. Safe by default (never overwrites existing files without `--force`).

```bash
npx --yes aayushus-skills
```

---

## The Problem

Setting up AI coding assistants for real-world projects today is frustrating:

1. **The repetitive setup chore**: Every time you start a new repository or onboard an existing codebase, you spend an hour manually creating `.cursorrules`, `CLAUDE.md`, copy-pasting architecture guidelines, wiring up design tokens, and figuring out what context each tool needs.
2. **Agents code before thinking**: Without strict boundaries, agents jump straight into writing 500 lines of spaghetti code without a clear problem statement, user persona, or binary acceptance criteria.
3. **Visual chaos & UI bikeshedding**: Without a rigid token contract, agents invent random hex codes, mismatching paddings, and generic icon sets that clash with the rest of your app.
4. **Silent security & architecture drift**: AI assistants regularly produce code that skips input validation, ignores multi-tenant isolation, forgets rate limits, and introduces OWASP Top 10 LLM risks.
5. **Team tool fragmentation**: One developer uses Cursor, another uses Claude Code, a third uses Copilot. With no shared ruleset, everyone gets inconsistent outputs and code quality degrades.

---

## What This CLI Does

Instead of manually copy-pasting markdown files and prompts across repos, `aayushus-skills` scaffolds an integrated operating model in 5 seconds:

```
                 ┌──────────────────────────────────────────────┐
                 │       AGENT RULES (The Orchestrator)         │
                 │   CLAUDE.md · rules.md · copilot-instructions│
                 └──────────────────────┬───────────────────────┘
                                        │ (routes tasks to)
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌─────────────────┐           ┌──────────────────┐           ┌───────────────────┐
│   PRODUCT MGMT  │           │   DESIGN SYSTEM  │           │  ENG GUIDELINES   │
│  (docs/pm/)     │           │   (src/design/)  │           │ (docs/guidelines/)│
│ PRDs · Stories  │           │ Tokens · UI code │           │ 6 SDLC Domains    │
│ ACs · Spikes    │           │ AI Surfaces      │           │ 18 Atomic Specs   │
└─────────────────┘           └──────────────────┘           └───────────────────┘
                                        │
                                        ▼
                              ┌───────────────────┐
                              │     GRAPHIFY      │
                              │(skills/graphify/) │
                              │Knowledge Graph    │
                              │GraphRAG & MCP     │
                              └───────────────────┘
```

- **Agent Orchestrator**: Synchronizes Claude, Cursor, Antigravity, Devin, Codex, and Copilot around the same mental model and project stack.
- **Product Management (`docs/pm/`)**: Enforces "Why before Code" with PRD templates, binary acceptance criteria, AI feature specs (model tiering, latency budgets, fallback UX), technical spikes, and vertical slicing.
- **Prism Design System (`src/design/` or `design/`)**: Zero-decision design language with tokens, pre-built React components, and strict AI provenance rules (Prism glyph + purple/pink gradient).
- **Modular Engineering Guidelines (`docs/guidelines/`)**: 18 atomic specifications across Architecture (zero-downtime DB migrations, queues), Security (auth, OWASP Top 10 for LLMs, PII scrubbing), API contracts, Testing (pyramid, Playwright, LLM-as-a-judge), Quality (strict TS, p95 budgets), and Operations (SEV 1–4, PR sizing <300 lines).
- **Graphify (`skills/graphify/` + CLI Tool)**: Automatically installs the `graphify` CLI tool (via `uv`/`pip`) and scaffolds the skill to turn any codebase into an interactive knowledge graph with community detection, GraphRAG JSON, and MCP stdio server.

---

## What's included

| Component | What gets installed | Destination |
|---|---|---|
| **Antigravity Rules** | `.antigravityrules` | project root |
| **Devin / Windsurf Rules** | `.devin/rules/rules.md` | project root |
| **Cursor Rules** | `.cursorrules` | project root |
| **Claude Rules** | `CLAUDE.md` | project root |
| **Codex Rules** | `AGENTS.md` | project root |
| **GitHub Copilot Rules** | `.github/copilot-instructions.md` | project root |
| **Prism Design System** | tokens, components CSS/TSX, 11 pattern specs, AI surfaces | `src/design/` or `design/` |
| **Product Management Skill** | PRD templates, user stories, binary ACs, AI feature scoping, technical spikes | `docs/pm/SKILL.md` |
| **Graphify Knowledge Graph** | Graphify CLI tool + skill for codebase navigation & GraphRAG | `skills/graphify/SKILL.md` + System CLI |
| **All Engineering Guidelines** | Complete 6-domain playbook (18 atomic specs + master skill & index) | `docs/guidelines/` |
| ↳ *Architecture* | Service topology, database schema & tenancy, zero-downtime migrations, queues | `docs/guidelines/architecture/` |
| ↳ *Security & AI Guardrails* | Auth, input validation, secrets, OWASP Top 10 for LLMs, prompt injection, PII | `docs/guidelines/security/` |
| ↳ *API & Webhooks* | REST conventions, JSON envelopes, rate limiting, webhook signing (HMAC) | `docs/guidelines/api/` |
| ↳ *Testing & AI Eval* | 70/20/10 test pyramid, DB isolation, Playwright E2E, LLM-as-a-judge golden sets | `docs/guidelines/testing/` |
| ↳ *Quality & Performance* | Strict TypeScript, Result types, p95 budgets, bundle caps, structured JSON logs | `docs/guidelines/quality-performance/` |
| ↳ *Operations & SDLC* | Incident response (SEV 1–4), PR sizing (<300 lines), feature flags, ADRs, Docker | `docs/guidelines/operations/` |

---

## Usage

### Interactive Wizard (Default)

Prompts you for your stack choices (framework, ORM, database, queues, auth, tenancy, CI gates) and writes tailored configs in one pass:

```bash
npx --yes aayushus-skills
```

### Install Specific Parts

You can install only what you need, either as full packages or atomic domain packs:

```bash
# Everything
npx --yes aayushus-skills all

# Design, PM & Graphify
npx --yes aayushus-skills design        # Prism Design System
npx --yes aayushus-skills pm            # Product Management Skill
npx --yes aayushus-skills graphify      # Graphify CLI tool + Skill

# Engineering Guidelines (All or by domain)
npx --yes aayushus-skills guidelines    # All 6 domains (18 docs)
npx --yes aayushus-skills security      # Security & AI Guardrails only
npx --yes aayushus-skills architecture  # Architecture & Database Tenancy only
npx --yes aayushus-skills api           # REST Contracts & Webhook Signing only
npx --yes aayushus-skills testing       # Testing Strategy & AI Evaluation only
npx --yes aayushus-skills quality       # Code Standards & Performance Budgets only
npx --yes aayushus-skills operations    # Incident Response, PR Sizing & ADRs only

# Individual Agent Rules
npx --yes aayushus-skills claude        # CLAUDE.md
npx --yes aayushus-skills cursor        # .cursorrules
npx --yes aayushus-skills antigravity   # .antigravityrules
npx --yes aayushus-skills codex         # AGENTS.md
npx --yes aayushus-skills devin         # .devin/rules/rules.md
npx --yes aayushus-skills copilot       # .github/copilot-instructions.md
```

### Flags

- `-d, --dry-run`: Preview every file that will be written without making changes.
- `-f, --force`: Overwrite existing files (default skips them safely).
- `--simple`: Use a fast, single-screen checklist menu instead of the wizard.

```bash
# Dry run example
npx --yes aayushus-skills security --dry-run
npx --yes aayushus-skills graphify --dry-run
```

---

## Recommended Companion: Project CodeGuard

For continuous automated enforcement of security guardrails and preventing agent regressions in CI, we recommend pairing this repository with **[Project CodeGuard (OASIS CoSAI)](https://github.com/cosai-oasis/project-codeguard/releases/tag/v1.4.0)**. 

CodeGuard provides automated scanning to ensure AI-generated code conforms to the secure coding standards, input validation, and LLM safety guardrails scaffolded by this CLI.

---

## Part of the AI-First SDLC

This CLI is the bootstrap step for the **[AI-First SDLC Playbook](https://aayushus.github.io/)** — a complete operating model for teams building software alongside autonomous and paired AI agents.

---

## Attribution

Design tokens, guideline specs, and prompt structures in this package have been synthesized and refined from community best practices, open design systems, and real-world production setups, adapted specifically for agentic workflows.

---

*Maintained by [Aayush Mediratta](https://mercpl.us/) · [GitHub](https://github.com/aayushus/skills)*
