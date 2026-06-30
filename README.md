# aayushus-skills

**One command to scaffold AI agent configs, a design system, and engineering guidelines into any project.**

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

All rule files are **stack-agnostic** with `<!-- CUSTOMIZE -->` markers where your project-specific tech choices belong (ORM, queue, session strategy, etc.).

---

## Usage

### Interactive menu (default)

Run in your project root. Use `↑ ↓` to navigate, `space` to toggle, `enter` to install.

```bash
npx aayushus-skills
```

Agent configs are pre-selected. Design system and guidelines are opt-in.

### Direct subcommands

Skip the menu and install specific components:

```bash
npx aayushus-skills all           # everything
npx aayushus-skills claude        # CLAUDE.md only
npx aayushus-skills cursor        # .cursorrules only
npx aayushus-skills devin         # Devin rules only
npx aayushus-skills antigravity   # Antigravity rules only
npx aayushus-skills codex         # Codex/Copilot rules only
npx aayushus-skills design        # Prism Design System only
npx aayushus-skills guidelines    # Engineering Guidelines only
```

### Flags

| Flag | Description |
|---|---|
| `-d`, `--dry-run` | Preview every file that would be written — nothing is modified |
| `-f`, `--force` | Overwrite files that already exist (default skips them with a warning) |

```bash
# See exactly what would be installed before committing
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

## Attribution

The design elements, guidelines, and templates included in this package have been collected, adapted, and refined from various open resources, design frameworks, and community best practices — then customized for AI agent workflows. They are not entirely original works.

---

*Made by [Aayush Mediratta](https://mercpl.us/) · [GitHub](https://github.com/aayushus)*
