# PRISM DESIGN MANIFESTO
**Version:** 3.0 (The Soul Update)
**Status:** Canonical Source of Truth

This is the definitive design language for Prism. It prioritizes **Human Amplification** over mere utility. It is a "Zero-Decision" system that values beauty, precision, and the disappearance of the interface.

---

## 1. THE MANDATE (HUMAN-FIRST)

1.  **Beauty is a Requirement:** If it is only functional, it is incomplete. Use white space as a structural element, not a "gap."
2.  **Instrumental Typography:** We use **Instrument Sans** for UI and **IBM Plex Mono** for data. We never use system defaults.
3.  **The AI is a Tool, Not Magic:** AI provenance uses the **Prism Glyph** (structured intelligence). We avoid "Magic" tropes.
4.  **Submerged Logic:** Show the results to everyone; show the "plumbing" only to those who ask.

---

## 2. THE THREE DEPTH LAYERS (REFINED)

| Level | Token | Feel |
| :--- | :--- | :--- |
| **0: Basement** | `--bg-sidebar-deep` | Deep focus, recessed. |
| **1: Secondary** | `--bg-sidebar` | Navigation, the "Library." |
| **2: Primary** | `--bg-app` | The "Canvas." Pure, airy, sacred. |
| **3: Inspector** | `--bg-preview` | The "Loupe." Elevated for focus. |

**Rule:** No shadows for separation. Use `1px solid var(--divider)`. Shadows are reserved for **Elevated Intent** (floating bars, active AI insights).

---

## 3. TYPOGRAPHY (THE VOICE)

*   **UI/Display:** *Instrument Sans*. Tracking: `-0.02em` for headings, `-0.01em` for UI.
*   **Body Prose:** *Instrument Sans*. Line-height: `1.6`. This is for reading, not scanning.
*   **Data/Code:** *IBM Plex Mono*. For numbers, dates, and AI logic strings.

---

## 4. THE AI PRISM (PROVENANCE)

We don't use magic sparkles. We use the **Prism Glyph**.
*   **Visual:** A geometric 4-pointed diamond with a center focal point.
*   **Meaning:** Precision, Refraction, Structured Intelligence.
*   **Usage:** Mandatory on every AI-generated field. Use the `--ai-grad` exclusively for this layer.

---

## 5. DESIGN DECISION TREE (THE BRAIN)

### 5.1 Layout Selection
*   **Editor/Review?** → `Sidebar` + `Main` + `SideDrawer` (The "Inspector").
*   **Agentic Work?** → Use the **Ghost Pane** pattern. 
    *   *Default View:* A single status dot in the `SidebarFooter`.
    *   *Power View:* Click to expand `SideDrawer` with `AgentActivity` logs.

### 5.2 Optical Grid
*   **The Rule of Tension:** Use `64px` vertical gaps between major content sections (`SectionHead`).
*   **Optical Centering:** If an icon has heavy weight (e.g., a square), nudge it `1px` to the left to balance the visual center.

---

## 6. COMPONENT BLUEPRINTS (REFINED)

| Component | AI Instruction |
| :--- | :--- |
| **PrismGlyph** | The only AI marker. Geometric, structured. |
| **SideDrawer** | The "Inspector." Use for 90% of editing. |
| **AgentActivity** | "Submerged." Hide logs inside a toggle for power users. |
| **Typography** | Use `typo-h1` through `typo-muted` with *Instrument Sans*. |

### 5.1 Charting Rules
*   **Series 1** must always use `--accent`.
*   **AI-derived series** must always use `--chart-ai` or the `--ai-grad`.
*   **Grid & Axes:** Use `--divider` for grid lines and `--text-4` for axis lines.
*   **Tooltips:** Must use `--bg-app` and `--shadow-float`. No hardcoded shadows.
*   **Integration:** If using Recharts, map tokens to props: `<Bar fill="var(--chart-1)" />`.

---

## 6. LAYOUT BLUEPRINTS (SHELLS)

Use these pre-composed shells for 100% autonomous page construction.

### 6.1 The "Editor" Shell
*   **Structure:** `Sidebar` (Nav) + `Main` (Canvas) + `SideDrawer` (Inspector).
*   **Use Case:** Building/editing a specific entity (e.g., Contract Editor, Profile Settings).
*   **Logic:** Keep the center canvas clean. Move all configuration to the right-side `SideDrawer`.

### 6.2 The "Dashboard" Shell
*   **Structure:** `Topnav` (Breadcrumbs) + `Main` (Grid).
*   **Components:** `StatStrip` (Top) + `DataTable` (Bottom).
*   **Use Case:** High-level overview, project lists, financial summaries.

### 6.3 The "Agent" Shell (Agentic UI)
*   **Structure:** `Sidebar` (contains `ProgressCapsule`) + `Main` (Canvas) + `Sidebar` (Right, contains `AgentActivity`).
*   **Use Case:** Autonomous workflows where the AI is performing work in real-time.
*   **Logic:** The right rail is dedicated to the live work log. The center is the "Output."

---

## 7. AI PROVENANCE & FEEDBACK (CRITICAL)

AI actions must be visually distinct to build trust.

1.  **Prism Glyph Only:** Use the `Prism` icon for all AI entry points.
2.  **AI Filled Fields:** Set `aiFilled={true}` on `Field`. This adds a 3px purple left-bar and an `[AI]` badge.
3.  **Agent Feedback:** When an AI action is running, use the `AgentActivity` feed with the `running` (spinning) status.
4.  **Zero Auto-Submit:** Never allow an AI to submit state without a user clicking a `primary` or `ai` button.

---

## 7. MOBILE ADAPTATION

*   **Breakpoint:** `< 640px`.
*   **Collapse Rule:** Convert `Sidebar` to a hidden drawer. Add `TabBar` (bottom).
*   **Fields:** Stack labels above inputs. Force `font-size: 16px` to prevent iOS zoom.
*   **Buttons:** Grow to `height: 44px`. Full-width for primary CTAs.

---

## 8. PRE-SHIP AUDIT (SELF-CHECK)

Before outputting code, the AI must verify:
- [ ] No hex codes or Tailwind classes in CSS.
- [ ] All colors use `var(--token)`.
- [ ] AI gradient is never used for non-AI buttons.
- [ ] Shadows are not used for layout separation (use borders).
- [ ] Content uses the 4px grid (4, 8, 12, 16, 20, 24, 32...).

---
**END OF MANIFESTO**
