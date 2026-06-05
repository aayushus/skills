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

## Attribution & Disclaimer

Please note that the design elements, guidelines, and templates included in the Prism Design System are not entirely original works. They have been collected, aggregated, and adapted from various online resources, design frameworks, and community best practices, and subsequently customized and refined to suit specific project requirements and agent workflows.

