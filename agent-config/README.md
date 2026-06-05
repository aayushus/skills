# Agent config — setup instructions

Three files in this folder. One per tool. Copy them into each new project.

---

## Windsurf

### Option A — Global (recommended, one-time setup, applies to all projects)

1. Open Windsurf
2. `Cmd+,` → Settings → search "Rules" → click **"Edit Global Rules"**
3. Paste the entire contents of `windsurfrules` into the editor
4. Save

Every Cascade conversation in every workspace will now follow these rules automatically.

### Option B — Per-project (for project-specific additions on top of global)

```bash
cp windsurfrules /your-project/.windsurfrules
```

Windsurf reads `.windsurfrules` from the project root automatically — no configuration needed.

**Use both**: set global rules for the universal hard rules, and add project-specific context (repo structure, active sprint focus) in `.windsurfrules`.

---

## VS Code — GitHub Copilot

```bash
mkdir -p /your-project/.github
cp copilot-instructions.md /your-project/.github/copilot-instructions.md
```

Copilot reads `.github/copilot-instructions.md` automatically in Chat and inline completions (VS Code ≥ 1.90). No setting required.

For **user-level instructions** (applies to all projects):
1. `Cmd+,` → search "Copilot Instructions"
2. Click **"Edit in settings.json"**
3. Add:
```json
"github.copilot.chat.codeGeneration.instructions": [
  {
    "text": "PASTE CONTENTS OF copilot-instructions.md HERE"
  }
]
```

---

## Claude Code

```bash
cp CLAUDE.md /your-project/CLAUDE.md
```

Claude Code reads `CLAUDE.md` from the project root automatically at the start of every session.

For **global rules** (applies to all projects):
```bash
cp CLAUDE.md ~/.claude/CLAUDE.md
```

The project-level `CLAUDE.md` is merged with the global one — use global for universal rules, project-level for repo-specific context.

The design system skill (`@prism-design`) is already set up in your Obsidian vault and Claude Code loads it automatically when referenced.

---

## Which file is which

| File | Tool | Where it goes | Scope |
|---|---|---|---|
| `windsurfrules` | Windsurf | Windsurf global settings OR `.windsurfrules` in project root | All conversations |
| `copilot-instructions.md` | VS Code Copilot | `.github/copilot-instructions.md` in project root | Workspace |
| `CLAUDE.md` | Claude Code | `CLAUDE.md` in project root OR `~/.claude/CLAUDE.md` | Project or global |

---

## Keeping rules in sync

When the guidelines change (new security rule, architectural decision, etc.):
1. Update the source in `guidelines/` or `design/`
2. Update the condensed rules in `windsurfrules`, `copilot-instructions.md`, and `CLAUDE.md`
3. Re-paste into Windsurf global settings if you used Option A

The source of truth is always the full guidelines. These files are distillations.
