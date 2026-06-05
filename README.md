# aayushus-skills

A zero-dependency interactive CLI to install custom AI agent configurations, design system templates, engineering guidelines, and SOPs into any target repository.

## Installation / Usage

Run the following command in your target project directory:

```bash
npx aayushus-skills
```

Or to bypass the interactive menu and install everything automatically:

```bash
npx aayushus-skills all
```

## Included Components

- **AI Agent Configurations**: Configures `.claudecoderc` (for global rules/prompts), `.windsurfrules`, `.windsurfrules-global`, `CLAUDE.md`, and `.github/copilot-instructions.md`.
- **Prism Design System**: Copies zero-decision B2B/SaaS design components and styling tokens (CSS/TSX) to `./src/design/` or `./design/`.
- **Development Guidelines**: Copies standard development docs (API Design, Architecture, Code Quality, Container Guidelines, Performance, Security, etc.) to `./docs/guidelines/`.
- **Solo Developer AI SOP**: Installs the `Solo-Developer-AI-SOP.md` file in the project root containing guidelines for budget management and AI escalation.

---

## Local Development & Testing

To test this CLI tool locally without publishing to NPM:

1. Clone or navigate to the `Skills` repository directory.
2. Link the CLI globally or run it directly against a test folder:
   ```bash
   node /path/to/Skills/cli.js
   ```

## Publishing to NPM

1. Set up your NPM account and log in using the terminal:
   ```bash
   npm login
   ```
2. Publish the package:
   ```bash
   npm publish --access public
   ```
3. Update version in `package.json` for subsequent releases:
   ```json
   "version": "1.0.1"
   ```

---

## Attribution & Disclaimer

Please note that the design elements, guidelines, and templates included in the Prism Design System are not entirely original works. They have been collected, aggregated, and adapted from various online resources, design frameworks, and community best practices, and subsequently customized and refined to suit specific project requirements and agent workflows.

