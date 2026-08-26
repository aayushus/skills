# aayushus-skills

**One command to scaffold AI agent configs, a design system, engineering guidelines, and a PM skill into any project.**

Zero dependencies. Works with any stack. Safe by default — never overwrites existing files unless you say so.

```bash
npx --yes aayushus-skills
```

---

## The 4-Pillar AI-First SDLC Architecture

This package bootstraps the **[AI-First SDLC Playbook](https://aayushus.github.io/)** by provisioning the 4 core pillars needed for autonomous and paired AI development:

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
```

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
| **All Engineering Guidelines** | Complete 6-domain playbook (18 atomic specs + master skill & index) | `docs/guidelines/` |
| ↳ *Architecture* | Service topology, database schema & tenancy, zero-downtime migrations, queues | `docs/guidelines/architecture/` |
| ↳ *Security & AI Guardrails* | Auth, input validation, secrets, OWASP Top 10 for LLMs, prompt injection, PII | `docs/guidelines/security/` |
| ↳ *API & Webhooks* | REST conventions, JSON envelopes, rate limiting, webhook signing (HMAC) | `docs/guidelines/api/` |
| ↳ *Testing & AI Eval* | 70/20/10 test pyramid, DB isolation, Playwright E2E, LLM-as-a-judge golden sets | `docs/guidelines/testing/` |
| ↳ *Quality & Performance* | Strict TypeScript, Result types, p95 budgets, bundle caps, structured JSON logs | `docs/guidelines/quality-performance/` |
| ↳ *Operations & SDLC* | Incident response (SEV 1–4), PR sizing (<300 lines), feature flags, ADRs, Docker | `docs/guidelines/operations/` |

All rule files are **stack-agnostic** with `<!-- CUSTOMIZE -->` markers where your project-specific choices belong (ORM, queue, session strategy, QA approach, CI gates, etc.).

---

## Usage

### Setup wizard (default)

Run in your project root. The wizard walks you through agent selection, stack/QA configuration, and optional components — then writes everything in one shot.

```bash
npx --yes aayushus-skills
```

Claude and Cursor configs are pre-selected; every other agent/config component can be picked independently. Stack and QA answers are injected directly into selected rule files. Design system, guidelines, and PM skill are opt-in.

### Wizard questions

The default wizard captures the core decisions agents need before they start editing a project:

| Area | What it asks |
|---|---|
| Agent rules | Claude, Cursor, Devin/Windsurf, Codex, GitHub Copilot, Antigravity |
| Application stack | Frontend/framework, ORM/query layer, database, queue, API style, auth/session strategy, tenancy |
| Quality setup | Testing/QA approach and CI quality gates |
| Modular capabilities | Prism design system, PM skill, or specific guideline domain packs |

Answers are written only into the rule files you choose. Optional installs remain independent; you can install just QA-aware rules without installing the design system, guidelines, or PM skill.

### Flat menu

Skip the wizard and use the checklist menu:

```bash
npx --yes aayushus-skills --simple
```

### Direct subcommands

Skip all menus and install specific components directly:

```bash
npx --yes aayushus-skills all           # everything
npx --yes aayushus-skills design        # Prism Design System only
npx --yes aayushus-skills pm            # Product Management Skill only
npx --yes aayushus-skills guidelines    # All Engineering Guidelines
npx --yes aayushus-skills architecture  # Architecture Guidelines only
npx --yes aayushus-skills security      # Security & AI Guardrails only
npx --yes aayushus-skills api           # API & Webhook Contracts only
npx --yes aayushus-skills testing       # Testing & AI Evaluation only
npx --yes aayushus-skills quality       # Code Quality & Performance only
npx --yes aayushus-skills operations    # Operations & SDLC only
npx --yes aayushus-skills claude        # CLAUDE.md only
npx --yes aayushus-skills cursor        # .cursorrules only
npx --yes aayushus-skills devin         # Devin / Windsurf rules only
npx --yes aayushus-skills antigravity   # Antigravity rules only
npx --yes aayushus-skills codex         # AGENTS.md only
npx --yes aayushus-skills copilot       # GitHub Copilot rules only
```

### Flags

| Flag | Description |
|---|---|
| `-d`, `--dry-run` | Preview every file that would be written — nothing is modified |
| `-f`, `--force` | Overwrite files that already exist (default skips them with a warning) |
| `--simple` | Use the flat checklist menu instead of the wizard |

```bash
# Preview before committing
npx --yes aayushus-skills --dry-run
npx --yes aayushus-skills security --dry-run

# Re-install over an existing setup
npx --yes aayushus-skills claude --force
npx --yes aayushus-skills all --force
```

---

## Design system detail

The **Prism Design System** is a zero-decision B2B/SaaS design language. It installs a complete set of:

- `tokens.css` — CSS custom properties for depth layers, warm neutrals, spacing, radius, and typography
- `components.tsx` + `components.css` — ready-to-use React components backed by Prism tokens
- `Icons.tsx` — SVG icon set featuring the canonical Prism Glyph for AI provenance
- `SKILL.md` — agent instruction file (load this into your AI agent so it builds UI autonomously without asking for visual direction)
- 11 component & pattern specs: accordion, alerts, avatars, badges, button groups, tabs, pagination, form controls (radios, checkboxes, toggles), AI surfaces, and responsive mobile patterns

---

## Guidelines detail

The **Engineering Guidelines** are a modular, stack-agnostic engineering playbook organized into 6 domains (18 atomic files) + an agent entrypoint (`docs/guidelines/SKILL.md`):

- **Architecture** (`docs/guidelines/architecture/`) — service topology, database schema & tenancy, zero-downtime migrations (expand-and-contract), async background queues
- **Security & AI Guardrails** (`docs/guidelines/security/`) — auth & sessions, boundary input validation (Zod), secrets management, OWASP Top 10 for LLMs, direct & indirect prompt injection defense, PII scrubbing
- **API & Webhooks** (`docs/guidelines/api/`) — REST conventions, standard JSON envelopes, cursor pagination, rate limiting, HMAC webhook signing & DLQs
- **Testing & QA** (`docs/guidelines/testing/`) — 70/20/10 test pyramid, database test isolation, mocking, Playwright E2E, golden evaluation sets & LLM-as-a-judge evaluation
- **Quality & Performance** (`docs/guidelines/quality-performance/`) — strict TypeScript standards, Result error types, p95 latency budgets, caching, structured JSON logging with correlation IDs
- **Operations & SDLC** (`docs/guidelines/operations/`) — SEV 1–4 incident response, PR sizing caps (<300 lines), feature flags, ADR templates, Docker Compose standards, AI workflow escalation tiers

---

## PM skill detail

The **Product Management Skill** (`docs/pm/SKILL.md`) is an AI agent-compatible skill file. Load it into your agent when doing product planning or task scoping:

- **PRD template** — problem statement, user persona, measurable goals, constraints, 30-day success metrics
- **AI feature scoping extension** — model tier selection (Tier 1 Fast vs Tier 3 Frontier), streaming latency budgets, failure/fallback UX, golden evaluation rubrics
- **User story standard** — As a / I want / So that format with binary acceptance criteria
- **Technical spike template** — time-boxed discovery format for architectural unknowns before writing stories
- **Vertical story slicing** — rules for keeping stories sized to $\le 1\text{ to }2\text{ days}$
- **Issue readiness checklist** — gates for pulling work into active development

---

## Part of the AI-First SDLC

This package is the bootstrap step for the **[AI-First SDLC Playbook](https://aayushus.github.io/)** — a seven-chapter operating model with named AI agents running across Jira, GitHub, Teams, and Confluence. Run `npx aayushus-skills` when setting up a new project to scaffold the agent configs, conventions, and quality gates the playbook assumes are in place.

---

## Attribution

The design elements, guidelines, and templates included in this package have been collected, adapted, and refined from various open resources, design frameworks, and community best practices — then customized for AI agent workflows. They are not entirely original works.

---

*Made by [Aayush Mediratta](https://mercpl.us/) · [GitHub](https://github.com/aayushus/skills)*
