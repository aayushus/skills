---
tags: [howto, ai-tools, windsurf, vscode, claude-code, setup]
---

# How to wire AI coding agents to follow project guidelines

This vault contains two sets of rules that all AI coding agents should follow:
- **Design system** — `design/SKILL.md` + supporting files (Meridian)
- **Engineering guidelines** — `guidelines/` (architecture, security, performance, code quality, documentation)

This guide explains how to load them into Windsurf, VS Code Copilot, and Claude Code so agents follow them automatically — without you having to paste context into every conversation.

---

## Two-layer model

Rules split into two layers so they work across multiple projects (Anti Gravity, new projects, etc.) without rewriting anything:

**Layer 1 — Universal (global, set once)**
Stack-agnostic hard rules: security principles, code quality, performance budgets, Meridian design system, observability. These never change between projects.

**Layer 2 — Project-specific (per repo)**
Stack decisions, architectural choices, module structure. Different for every project.

| File | Layer | For | Contains |
|---|---|---|---|
| `windsurfrules-global` | Universal | Windsurf global settings | Security, code quality, performance, design system — all projects |
| `project-templates/windsurfrules-node-prisma` | Project | `.windsurfrules` in Node/Prisma repos | Stack-specific rules for this project |
| `project-templates/windsurfrules-blank` | Project | `.windsurfrules` in any new repo | Template to fill in for a new project |
| `copilot-instructions.md` | Both | VS Code Copilot | Critical universal rules, compact |
| `CLAUDE.md` | Both | Claude Code | Rules + skill loading instructions |

The full guidelines are always the source of truth.

---

## Windsurf

### Step 1 — Global rules (one-time setup, applies to every project)

1. Open Windsurf
2. `Cmd+,` → search **"Rules"** → click **Edit Global Rules**
3. Paste the full contents of `windsurfrules-global`
4. Save

Every Cascade conversation in every workspace now follows the universal rules automatically.

### Step 2 — Per-project rules (stack + architecture decisions)

For an existing Node.js + Prisma project:
```bash
cp /path/to/obsidian/04_Resources/Skills/agent-config/project-templates/windsurfrules-node-prisma \
   /your-project/.windsurfrules
```

For a new project (Anti Gravity, etc.):
```bash
cp /path/to/obsidian/04_Resources/Skills/agent-config/project-templates/windsurfrules-blank \
   /your-project/.windsurfrules
# Then fill in the stack, decisions, and repo structure sections
```

Windsurf reads `.windsurfrules` from the project root automatically — no further configuration needed.

**The two layers stack**: global rules apply everywhere, `.windsurfrules` adds project context on top. An agent in Anti Gravity gets the universal security/quality/design rules plus Anti Gravity's specific stack decisions.

---

## VS Code — GitHub Copilot

### Per-project (workspace instructions)

```bash
mkdir -p /your-project/.github
cp /path/to/obsidian/04_Resources/Skills/agent-config/copilot-instructions.md \
   /your-project/.github/copilot-instructions.md
```

VS Code reads `.github/copilot-instructions.md` automatically in Copilot Chat and inline suggestions. Requires VS Code ≥ 1.90. No setting needed — just commit the file.

### User-level (applies to all projects)

1. `Cmd+,` → search **"Copilot Instructions"**
2. Click **Edit in settings.json**
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

### Per-project

```bash
cp /path/to/obsidian/04_Resources/Skills/agent-config/CLAUDE.md /your-project/CLAUDE.md
```

Claude Code reads `CLAUDE.md` from the project root automatically at the start of every session.

### Global (applies to all projects)

```bash
cp /path/to/obsidian/04_Resources/Skills/agent-config/CLAUDE.md ~/.claude/CLAUDE.md
```

Project-level and global `CLAUDE.md` are merged — use global for universal rules, project-level for repo-specific context.

### Design system skill (Claude Code only)

The Meridian design system is already set up as a Claude Code skill in this vault. When working on UI, tell Claude:

```
use the meridian-design skill
```

Claude will load `design/SKILL.md` and the relevant pattern files automatically. No extra setup needed.

---

## What each tool sees

```
Windsurf global settings (windsurfrules-global)
  └─ Universal rules: security, code quality, performance budgets, Meridian design
  └─ Active on every conversation, every project — Anti Gravity, new projects, all of them

.windsurfrules (project root — different per project)
  └─ Stack decisions: "this project uses Supabase not Prisma"
  └─ Architecture choices: "cursor pagination, ULIDs, REST not GraphQL"
  └─ Current context: "billing module, don't touch auth branch"

.github/copilot-instructions.md (project root)
  └─ Compact version of universal rules for Copilot's shorter context window
  └─ Committed to repo — teammates get it automatically

CLAUDE.md (project root or ~/.claude/)
  └─ Universal rules + instructions to load Meridian skill for UI work
  └─ Points to full guidelines for deep dives
```

### Result for any project

An agent in **any** project gets:
1. Universal hard rules (from global settings) — automatically
2. That project's stack and architecture decisions (from `.windsurfrules`) — from the repo
3. Design system (from Meridian skill or CLAUDE.md reference) — on demand

---

## Keeping rules in sync

When guidelines change (new architectural decision, updated security rule, etc.):

1. Update the source file in `guidelines/` or `design/`
2. Update the relevant section in `windsurfrules`, `copilot-instructions.md`, and `CLAUDE.md`
3. If you used Windsurf global rules, re-paste the updated content into settings

The distillation files should always reflect the most critical rules from the full guidelines. If a rule is important enough to be in the guidelines, it's important enough to be in the distillation.

---

## New project checklist

When starting a new project (Anti Gravity, anything else):

- [ ] Windsurf global rules already set — nothing to do
- [ ] Copy `project-templates/windsurfrules-blank` → `.windsurfrules` in project root
- [ ] Fill in: stack, architecture decisions, repo structure, current focus
- [ ] Copy `copilot-instructions.md` → `.github/copilot-instructions.md`
- [ ] Copy `CLAUDE.md` → project root `CLAUDE.md`
- [ ] Commit all three so teammates get them automatically

## Adding a new IDE or coding LLM

The universal rules (security, quality, performance, design system) are written in plain markdown — they work in any tool that accepts a system prompt or rules file:

| Tool | Where to paste `windsurfrules-global` |
|---|---|
| Windsurf | Settings → Edit Global Rules |
| Cursor | Settings → Rules for AI (global) or `.cursorrules` in project root |
| Cline (VS Code) | Extension settings → System Prompt |
| Aider | `--system-prompt` flag or `.aider.conf.yml` |
| GitHub Copilot | `.github/copilot-instructions.md` or user settings.json |
| Claude Code | `~/.claude/CLAUDE.md` (global) or `CLAUDE.md` (project) |
| Any chat-based LLM | Paste as the first message or system prompt |

For any new tool: paste `windsurfrules-global` as the system/global rules, then add project context from the relevant `.windsurfrules` template.
