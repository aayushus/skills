# Repository Instructions

This package is a zero-dependency CLI that installs independent agent configs, design assets, guideline docs, and product-management docs into other projects.

## Context

This package is the bootstrap step for the [AI-First SDLC Playbook](https://aayushus.github.io/). The playbook defines the operating model (agents, governance, traceability); this CLI scaffolds the agent configs and conventions each project needs to participate in that model.

## Core Rules

- Keep every install option independent. Users must be able to install any agent config, design system, guidelines, or PM skill without hidden dependencies on the others.
- Preserve safe-by-default behavior: never overwrite existing files unless `--force` is provided.
- Keep generated rule files stack-agnostic. Use `<!-- CUSTOMIZE -->` markers and examples instead of hard-coding one project stack.
- Treat `docs/guidelines/`, `src/design/`, `design/`, and `docs/pm/` as optional. Generated agent rules may reference them only with existence checks or “if installed” language.
- Do not add runtime dependencies unless explicitly requested.

## Validation

Run these before committing changes:

```bash
node --check cli.js
NPM_CONFIG_CACHE=/tmp/aayushus-npm-cache npm pack --dry-run
```

For behavior changes, also dry-run relevant direct commands in a temp directory, for example:

```bash
node /path/to/cli.js codex --dry-run
node /path/to/cli.js copilot --dry-run
node /path/to/cli.js all --dry-run
```

## Release Checklist

- Update `README.md` whenever commands, destinations, defaults, or component counts change.
- Update `CHANGELOG.md` for user-visible behavior changes.
- Confirm `package.json` `files` includes only publishable package contents.
- Confirm `npm pack --dry-run` includes expected files and excludes source-only/internal files.
