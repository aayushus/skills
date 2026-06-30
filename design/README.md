# Prism Design System v3.0

**A Zero-Decision AI Design System for B2B/SaaS Cathedral-Grade Interfaces.**

Prism is not a component library you "use"—it is a language you "speak." It is designed for absolute AI autonomy, ensuring that production-grade interfaces can be built at the speed of thought without manual visual intervention.

## 🚀 Quick Start (Production Setup)

### 1. Install Fonts
Prism requires **Instrument Sans** and **IBM Plex Mono**. Add this to your HTML `<head>` or CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=IBM+Plex+Mono:ital,wght@0,100..700;1,100..700&display=swap');
```

### 2. Import the Design Contract
If installed through `aayushus-skills`, these files live in `src/design/` when your project has `src/`, otherwise `design/`:
- `tokens.css`
- `components.css`
- `mobile.css`
- `components.tsx`
- `Icons.tsx`

### 3. Initialize at App Root
Import the styles once in your root layout file (e.g., `layout.tsx` or `main.tsx`):

```tsx
import './design/tokens.css';
import './design/components.css';
import './design/mobile.css'; // Optional: for responsive overrides

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
```

## 🧠 The AI Skill Protocol
If you are using an AI agent (like Gemini CLI) to build with Prism, ensure you feed it the `PRISM_MANIFESTO.md`. 

**The AI Mandate:**
- **Zero Visual Choice:** Do not ask for colors or radii. Use the Manifesto's Decision Tree.
- **Prism Provenance:** All AI-touched content MUST use the `Prism` icon and the `--ai-grad` layer.
- **Submerged Logic:** Use the `AgentActivity` component to hide complex logs from non-power users.

## 🎨 Design Philosophy (The Soul)
- **Warm Neutrals:** Software should feel like high-quality paper.
- **Depth Layers:** Use depth (Basement → Canvas → Inspector) instead of borders or shadows for hierarchy.
- **Human Amplification:** Design isn't about the UI; it's about the user's work. The UI should disappear.

---
*Created with intent by Aayush Mediratta.*
