# Changelog

## 1.3.x

### 1.3.1 *(next)*
- Add API style and auth/session strategy to wizard stack questions
- Wizard now fills 6 of the 8 "Decisions already made" entries in CLAUDE.md
- Rename "Devin" → "Devin / Windsurf" throughout (shared rule format)
- Fix component count in wizard: 25 → 11 (accurate spec file count)
- Remove `DECISION-Modular-Monolith.md` — `TEMPLATE-Decision.md` covers ADR templates
- Remove internal source-only docs from repo (`agent-config/howto.md`, `agent-config/README.md`)
- Remove "Recommended for solo" tags from queue and tenancy wizard options

### 1.3.0
- **Setup wizard** — new default interactive mode replacing the flat checklist
- Wizard injects stack answers (framework, ORM, database, queue, tenancy) into CLAUDE.md and rules.md before writing
- `--simple` flag restores the original flat checklist menu
- **Product Management Skill** — `docs/pm/SKILL.md`, loadable agent skill for PRDs, user stories, and acceptance criteria
- **AI Workflow guideline** — generalized from personal SOP into `guidelines/AI-Workflow.md`
- Remove SOP as a separate install option (content merged into guidelines)
- Remove `design/package.json` (was being copied to target projects)
- Anonymize `DECISION-Modular-Monolith.md`
- Narrow `files` field in `package.json` to exclude agent-config internals from published package
- Fix `--simple` mode bug: premature `process.exit(0)` killed the process before the menu was interactive
- Standardize naming to "Engineering Guidelines" everywhere

## 1.2.x

### 1.2.6
- Fix bin field: `"./cli.js"` → `"cli.js"` (npm auto-correction committed)

### 1.2.5
- Published manually after npm login fix

### 1.2.4
- Add docs/guidelines playbook disclaimer banner

### 1.2.3
- Documentation release

### 1.2.2
- Generic rules update

### 1.2.1
- Add `--force` / `-f` flag for overwriting existing files
- Add `--dry-run` / `-d` flag with per-file output
- `design`, `guidelines`, `sop` default to unchecked in interactive menu
- Agent config warning when `agent-config/` directory is missing
- `copyFolderSync` now uses per-file overwrite protection
- `listFilesRecursively()` helper for dry-run folder expansion
- CLAUDE.md rewritten as stack-agnostic template with `<!-- CUSTOMIZE -->` markers

### 1.2.0
- Add Prism Design System component specs: accordion, alerts, avatars, badges, button groups, tabs, pagination, form controls
- Add gap analysis against Paper Design System

### 1.1.x
- Add `copilot` as alias for `codex` subcommand
- README optimized for npmjs.com
- Add website link

### 1.0.0
- Initial release: agent config installer, Prism Design System, development guidelines, SOP
- Interactive checklist menu with raw-mode terminal input
- Direct subcommands: `all`, `claude`, `cursor`, `devin`, `antigravity`, `codex`, `design`, `guidelines`, `sop`
