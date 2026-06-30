# aayushus-skills

**One command to scaffold AI agent configs, a design system, engineering guidelines, and a PM skill into any project.**

Zero dependencies. Works with any stack. Safe by default — never overwrites existing files unless you say so.

```bash
npx aayushus-skills
```

---

## What's included

| Component | What gets installed | Destination |
|---|---|---|
| **Antigravity Rules** | `.antigravityrules` | project root |
| **Devin Rules** | `.devin/rules/rules.md` + `AGENTS.md` | project root |
| **Cursor Rules** | `.cursorrules` | project root |
| **Claude Rules** | `CLAUDE.md` | project root |
| **Codex / Copilot Rules** | `.github/copilot-instructions.md` | project root |
| **Prism Design System** | tokens, components CSS/TSX, design spec docs | `src/design/` or `design/` |
| **Engineering Guidelines** | Architecture, Security, Performance, API Design, Testing, Code Quality, AI Workflow, and more | `docs/guidelines/` |
| **Product Management Skill** | PRD templates, user story standards, acceptance criteria patterns | `docs/pm/` |

All rule files are **stack-agnostic** with `<!-- CUSTOMIZE -->` markers where your project-specific tech choices belong (ORM, queue, session strategy, etc.).

---

## Usage

### Setup wizard (default)

Run in your project root. The wizard walks you through agent selection, stack configuration, and optional components — then writes everything in one shot.

```bash
npx aayushus-skills
```

Agent configs are pre-selected. Stack answers are injected directly into your rule files. Design system, guidelines, and PM skill are opt-in.

### Flat menu

Skip the wizard and use the original checklist menu:

```bash
npx aayushus-skills --simple
```

### Direct subcommands

Skip all menus and install specific components:

```bash
npx aayushus-skills all           # everything
npx aayushus-skills claude        # CLAUDE.md only
npx aayushus-skills cursor        # .cursorrules only
npx aayushus-skills devin         # Devin rules only
npx aayushus-skills antigravity   # Antigravity rules only
npx aayushus-skills codex         # Codex/Copilot rules only
npx aayushus-skills design        # Prism Design System only
npx aayushus-skills guidelines    # Engineering Guidelines only
npx aayushus-skills pm            # Product Management Skill only
```

### Flags

| Flag | Description |
|---|---|
| `-d`, `--dry-run` | Preview every file that would be written — nothing is modified |
| `-f`, `--force` | Overwrite files that already exist (default skips them with a warning) |
| `--simple` | Use the flat checklist menu instead of the wizard |

```bash
# Preview before committing
npx aayushus-skills --dry-run
npx aayushus-skills design --dry-run

# Re-install over an existing setup
npx aayushus-skills claude --force
npx aayushus-skills all --force
```

---

## Design system detail

The **Prism Design System** is a zero-decision B2B/SaaS design language. It installs a complete set of:

- `tokens.css` — CSS custom properties for color, spacing, radius, shadow, and typography
- `components.tsx` + `components.css` — ready-to-use React components
- `SKILL.md` — agent instruction file (load this into your AI agent so it builds UI autonomously without asking for visual direction)
- Component specs: accordion, alerts, avatars, badges, button groups, tabs, pagination, form controls (radios, checkboxes, toggles), and more

---

## Guidelines detail

The **Engineering Guidelines** are a stack-agnostic engineering playbook:

- `Architecture.md` — service structure, DB schema, module boundaries
- `Security.md` — auth, file uploads, API security, secrets management
- `Code-Quality.md` — testing, refactoring, PR review standards
- `Performance.md` — caching, indexing, query optimization
- `API-Design.md` — REST conventions, versioning, error shapes
- `Testing.md` — unit, integration, and E2E test strategy
- `Documentation.md` — ADR templates, README standards
- `AI-Workflow.md` — model escalation strategy, context window discipline, parallel agent patterns
- And more — see `docs/guidelines/` after install

---

## PM skill detail

The **Product Management Skill** (`docs/pm/SKILL.md`) is a Claude Code-compatible skill file. Load it into your agent when doing product planning work:

- PRD template — problem statement, persona, goals, constraints, success metrics
- User story standard — As a / I want / So that format with binary acceptance criteria
- Issue readiness checklist — gates for pulling work into development
- Escalation rules — when to push back on vague or poorly scoped requests

---

## Attribution

The design elements, guidelines, and templates included in this package have been collected, adapted, and refined from various open resources, design frameworks, and community best practices — then customized for AI agent workflows. They are not entirely original works.

---

*Made by [Aayush Mediratta](https://mercpl.us/) · [GitHub](https://github.com/aayushus)*
