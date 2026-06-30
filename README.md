# aayushus-skills

A zero-dependency interactive CLI to install custom AI agent configurations, design system templates, engineering guidelines, and SOPs into any target repository.

## Installation / Usage

Run the following command in your target project directory to open the interactive checklist menu:

```bash
npx aayushus-skills
```

### Options & Subcommands
You can bypass the interactive menu to install specific components directly:

- **All Components**: `npx aayushus-skills all`
- **Prism Design System**: `npx aayushus-skills design`
- **Development Guidelines**: `npx aayushus-skills guidelines`
- **Solo Developer AI SOP**: `npx aayushus-skills sop`
- **Cursor Rules**: `npx aayushus-skills cursor`
- **Antigravity Rules**: `npx aayushus-skills antigravity`
- **Devin Rules**: `npx aayushus-skills devin`
- **Claude Rules**: `npx aayushus-skills claude`
- **Codex/Copilot Rules**: `npx aayushus-skills codex`

### Preview changes (Dry Run)
Add `-d` or `--dry-run` to preview the files that would be installed without making any modifications to disk:
```bash
npx aayushus-skills --dry-run
npx aayushus-skills design --dry-run
```

### Overwriting existing files
By default, the installer **skips** any file that already exists at the destination and prints a warning. To overwrite, pass `-f` or `--force`:
```bash
npx aayushus-skills --force
npx aayushus-skills claude --force
```

## Included Components

- **AI Agent Configurations**: Custom-tailored rule files matching your selected editor:
  - **Antigravity**: `.antigravityrules`
  - **Devin**: `.devin/rules/rules.md` & `AGENTS.md`
  - **Cursor**: `.cursorrules`
  - **Claude**: `CLAUDE.md`
  - **Codex/Copilot**: `.github/copilot-instructions.md`
- **Prism Design System**: Copies zero-decision B2B/SaaS design components and styling tokens (CSS/TSX) to `./src/design/` or `./design/`.
- **Development Guidelines**: Copies standard stack-agnostic development reference docs (API Design, Architecture, Code Quality, Security, Performance, etc.) to `./docs/guidelines/`.
- **Solo Developer AI SOP**: Installs the `Solo-Developer-AI-SOP.md` file in the project root containing guidelines for budget management and AI escalation.

---

## Attribution & Disclaimer

Please note that the design elements, guidelines, and templates included in the Prism Design System are not entirely original works. They have been collected, aggregated, and adapted from various online resources, design frameworks, and community best practices, and subsequently customized and refined to suit specific project requirements and agent workflows.

