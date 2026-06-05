---
name: meridian-design
description: Zero-Decision B2B/SaaS design system. Use to autonomously build, style, and audit UI without manual visual intervention. Mandates high-density warm neutrals, a purple-to-pink AI layer, and rigid token adherence.
---

# Meridian: Zero-Decision AI Design Skill

This skill transforms any UI task into a deterministic execution of the Meridian design language. It is optimized for AI autonomy—when this skill is active, the AI does not ask for visual direction; it applies the **Meridian Manifesto** rules as law.

## The Core Mandate

1.  **Zero Visual Choice:** Every color, radius, spacing, and font is pre-decided. Reference `MERIDIAN_MANIFESTO.md` for the immutable rules.
2.  **Zero-Fallback:** Never use Tailwind defaults, Lucide generic icons, or standard SaaS tropes. If it's not in the manifesto, derive it from Meridian primitives.
3.  **Content-First:** UI serves content. Use depth layers (`--bg-sidebar` → `--bg-app` → `--bg-preview`) instead of color or shadows to create hierarchy.
4.  **AI Visibility:** AI provenance is a first-class citizen. Use the **Prism Glyph** and purple-to-pink gradient exclusively for AI-generated or AI-modified content.

## Primary Source of Truth

Load and follow **`MERIDIAN_MANIFESTO.md`** for every task. It contains:
- The Three Depth Layers (Visual Hierarchy)
- The Design Decision Tree (Layout Selection)
- The Token Contract (Variables)
- Component Blueprints & Props
- AI Provenance Rules

## Files in this skill

| File | Load when |
|---|---|
| `MERIDIAN_MANIFESTO.md` | **Always.** The master guideline for all decisions. |
| `tokens.css` | Drop into project root as the design contract. |
| `components.tsx` | Use as the primary React component library. |
| `components.css` | Stylesheet backing the component library. |
| `mobile.css` | Mobile overrides for the component library. |
| `Icons.tsx` | Core icon set (Sparkle is the only AI glyph). |

## Autonomous Workflow

1.  **Analyze Intent:** Identify if the request is a checklist, a data grid, or a profile.
2.  **Select Layout:** Use the Decision Tree in the Manifesto to pick the AppShell configuration.
3.  **Execute via Tokens:** Build using `components.tsx`. Ensure every style property references a `var(--token)`.
4.  **Audit:** Run the Pre-ship Checklist (Section 8 of the Manifesto) before finalizing.

Do not ask the user for "look and feel" preferences. Meridian is the look and feel.
