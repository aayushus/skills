# AI surfaces

Prism treats AI as a first-class capability, not a feature bolted on. These rules keep AI surfaces recognisable without letting them dominate the product. The whole system is designed so a user can always tell, at a glance, *what did a person create, and what did the AI create*.

## Table of contents

1. [The three rules that cannot break](#the-three-rules-that-cannot-break)
2. [The four AI surface patterns](#the-four-ai-surface-patterns)
3. [Iconography — the Prism rule](#iconography--the-prism-rule)
4. [Gradient vs flat purple](#gradient-vs-flat-purple)
5. [Loading states](#loading-states)
6. [Provenance markers](#provenance-markers)
7. [Agent activity feed](#agent-activity-feed)
8. [AI review / verdict card](#ai-review--verdict-card)
9. [What AI never does](#what-ai-never-does)
10. [Copy conventions](#copy-conventions)

---

## The three rules that cannot break

1. **AI never uses the product accent colour.** Blue (role-a) and violet (role-b) belong to the user's actions, not to AI. Swap to `--ai` or `--ai-grad`.

2. **Product primary never uses the AI gradient.** A regular `Save` or `Continue` button never gets the purple-pink fill, no matter how important it is. Keep the colour layers separate.

3. **The Prism is the only AI glyph.** One icon, used for every AI surface, at every size. No robots, brains, lightbulbs, magic wands, sparkles, crystal balls, or generic "AI" circles. No exceptions — substitutions fracture the design language.

Violating any of these three destroys the affordance that AI surfaces rely on. Users stop being able to tell at a glance whether a field was auto-filled, whether a score is AI-generated, or whether a verdict is human or machine. Once that clarity is lost, it's very hard to recover.

---

## The four AI surface patterns

Every AI surface in the product is one of these four. Don't invent a fifth without explicit discussion.

### 1. Ambient command bar

Persistent top-nav AI input, max-width `480px`, `--ai-grad-soft` background, `--ai-border` outline. Keyboard shortcut: `⌘J` (Cmd+J). Always visible on desktop.

```
┌─────────────────────────────────────────────────┐
│ ✦  Ask AI anything…                       ⌘J   │
└─────────────────────────────────────────────────┘
```

- Icon: sparkle, 14px, `--ai` colour
- Input: 13px, `--text-default`, transparent bg
- Kbd chip: 11px SF Mono, `--bg-app` bg, `--divider` border

On focus: background lifts to `--bg-app`, border goes to `--ai`, outer halo `--ai-bg` at 3px.

On mobile: this pattern becomes a **bottom sheet** triggered from the bottom tab bar. See [Mobile patterns § AI entry on mobile](./patterns-mobile.md#ai-entry-on-mobile).

### 2. Inline generative actions

Per-section `Verify` / `Suggest` / `Improve` / `Re-check` buttons that appear in section headers. These are context-sensitive — they act on the section's content.

```
§ 02  Company profile                          [✦ Improve]
```

Button style: 24px height, `--ai-bg` background, `1px --ai-border` border, `--ai` text colour, `--r-sm` radius, `11.5px 500` text, optional 10px sparkle icon on the left.

Hover reveal: fade in via opacity `0 → 1` over 150ms when hovering the section header. On mobile (no hover), these either stay visible or move into an overflow menu.

### 3. Provenance markers

When AI has filled, generated, or modified content, it leaves a visible mark. The user can always see what was AI-generated and click the mark to see what AI did.

The canonical provenance marker is on form fields:

- 3px `--ai` left-bar outside the field (offset `-12px`)
- `box-shadow: 0 0 4px var(--ai)` subtle glow on the bar
- An `AI` pill tag inside the field control: `9.5px 600 uppercase`, `--ai-bg` background, `--ai-border` border, `--ai` text

```
│   Full name                  Acme Corp  [AI]
│   About                      Acme Corp is a leading provider…
│▌  (AI-filled)
```

Other provenance markers:
- AI-generated score numbers use the `--ai-grad` fill via `background-clip: text`
- AI-generated summaries have a purple left border on their container
- AI-matched tags use `.tag-ai` styling (the only tag variant with a border)

### 4. AI review panel

Full-surface AI output. Lives in a dedicated tab or card, not a modal. Used for: content quality review, submission evaluation verdict, record analysis, anomaly detection.

See [AI review / verdict card](#ai-review--verdict-card) for the full pattern.

---

## Iconography — the sparkle-star rule

The sparkle-star is the AI glyph at every size, in every surface:

```
Size       Use
9px        Inline badges (AI field tag, step-row AI badge)
10-12px    Buttons, small icons
14px       Command bar, dock tile
18-20px    AI avatar in review cards
```

### Stroke weight

The sparkle uses variable stroke weight by size. Thinner at small sizes so points don't blur; thicker at large sizes so it reads as confident.

| Size | Stroke width |
|---|---|
| 9px | 2.0 |
| 10-12px | 1.8 |
| 14-16px | 1.6 |
| 18-22px | 1.6 |

### Fill vs stroke

Default: stroke only (outlined sparkle) at `currentColor` — so it inherits `--ai`.
When the sparkle is the *entire* element (e.g., inside the 28px gradient avatar in the AskAI dock tile), switch to solid white stroke against the gradient fill.

### Never combine the sparkle with another symbol

Don't put `✦ AI` or `✦ Agent` or `✦ Claude` in the same label with multiple glyphs. The sparkle alone is enough — text label after it if needed.

---

## Gradient vs flat purple

The AI layer uses *both* a flat hex and a gradient. Know which to use when:

| Use | Colour |
|---|---|
| AI body text (13px+) | `#7C3AED` (AA-safe at 5.7:1) |
| AI body text large (18px+) | `#8B5CF6` (`--ai`) is fine |
| AI icon at any size | `#8B5CF6` (`--ai`) |
| AI button background | `--ai-grad` (the gradient) |
| AI avatar fill | `--ai-grad` |
| AI score number | `background-clip: text` with `--ai-grad` |
| AI card / panel background | `--ai-grad-soft` (tinted) |
| AI tag / pill background | `--ai-bg` or `--ai-bg-s` |
| AI border | `--ai-border` |

**Rule of thumb:** fills and large coloured surfaces get the gradient. Text and icons get the flat hex.

### Never use flat purple on role-b pages for AI

Role-b accent is `#7C3AED` (violet). AI body text `#7C3AED` would be indistinguishable. On role-b pages specifically, AI surfaces **must** use the gradient for fills and `#8B5CF6` (`--ai`) for icons — the gradient's presence is what separates AI from the role-b accent.

---

## Loading states

AI actions have three visual states — never more.

### Idle (default)
- Sparkle icon in `--ai` colour
- Static (no animation)

### Running
- Sparkle icon in `--ai` colour, inside an 18px box with `--ai-bg-s` background
- A 1.5px `--ai` border spinning around the box at `0.8s linear infinite`
- The border is open on the right side (`border-right-color: transparent`) to create the spinning effect

```css
.agent-ico.running {
  background: var(--ai-bg-s);
  position: relative;
}
.agent-ico.running::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: var(--r-md);
  border: 1.5px solid var(--ai);
  border-right-color: transparent;
  animation: spin 0.8s linear infinite;
}
```

### Done
- Checkmark icon in `--green` colour, inside an 18px box with `--bg-green` background
- Hold for 1.4s, then revert to idle (OR replace with a warn/error state if the action failed)

### For longer operations

If an AI action takes more than 3 seconds, switch from spinning sparkle to a **shimmer progress bar** with `--ai-grad` fill + travelling highlight. Don't fake progress percentages — just the shimmer.

---

## Provenance markers

When AI modifies a field or generates content, mark it. Provenance markers serve three purposes: (1) build user trust that they're in control, (2) make it easy to audit AI changes, (3) let users click-through to see what AI did.

### Field-level provenance

- 3px `--ai` left-bar outside the field
- `AI` pill inside the field control
- On click: open a popover showing "AI filled this from public registry on 2024-04-16. Sources: [link]"

Never remove the marker even if the user edits the field. Edited-by-user fields can have a different marker (a pencil icon in `--text-3`) — but AI-originated content stays marked.

### Content-level provenance (AI-generated paragraphs)

- Paragraph gets a left border in `--ai-border` + 12px left padding
- A small header above: `✦ Drafted by AI · Edit to make it yours`

User edits convert the paragraph to "human-edited AI draft" — visible by the marker shifting from border-only to border + a pencil icon in the header.

### Bulk provenance

If AI has modified many items at once (e.g., "Applied 12 suggestions"), show a dismissible banner at the top of the workspace with what was done, a "View changes" button, and an "Undo all" button. Don't inline-mark all 12 items — that's visual noise.

---

## Agent activity feed

The live feed of what AI is doing — typically in the sidebar dock, below the AskAI tile.

### Anatomy

Each agent item is a row with an 18px status icon + task text + meta line.

```
[ ✦ ]  Drafting "About" from your website
       running · pulling 3 sources

[ ✓ ]  Verified business registration
       just now · registry match

[ ⚠ ]  Missing required credential
       section 3 incomplete
```

- Icon box: `--r-sm` radius, 18px square
  - Running: `--ai-bg-s` bg, `--ai` sparkle, spinning border ring
  - Done: `--bg-green` bg, `--green` checkmark
  - Warn: `--bg-yellow` bg, `--yellow` triangle
  - Error (rare): `rgba(red, 0.12)` bg, `--red` cross

- Task text: 12px 500 `--text-default`, truncate with ellipsis
- Meta line: 10.5px SF Mono, `--text-3`, with emphasis values coloured by status (`--ai`, `--green`, `--yellow`, `--red`)

### Behaviour

- New items animate in at the top (slide down + fade, 240ms)
- Items auto-dismiss after 60s unless warn/error (which stay until user clears)
- Entire feed has a "Clear" link in the top-right of the section header
- Clicking an item opens a detail popover OR navigates to the relevant context (e.g., the field that was filled)

---

## AI review / verdict card

The hero surface for AI output. Used for content quality reviews, record evaluations, submission analysis, and similar.

### Structure

1. **Head** — AI avatar (40px gradient square with sparkle + green status dot in corner) + `AI evaluation` / `AI review` label + title + timestamp in SF Mono
2. **Score row** — big number with gradient `background-clip: text`, `/100` suffix in `--text-4`, recommendation text beside it
3. **Summary** — one paragraph, 13.5px `--text-2`, with highlighted terms in `em` tags (pill styling in `--ai-bg` + `--ai`)
4. **Findings** — list of finding cards, each with icon + title + body + optional CTA

### Anatomy

```css
.ai-review-card {
  background: var(--ai-grad-soft);
  border: 1px solid var(--ai-border);
  border-radius: var(--r-xl);
  padding: 16px 18px;
  position: relative;
  overflow: hidden;
}
.ai-review-card::before {
  /* soft radial glow top-right for texture */
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 160px; height: 160px;
  background: radial-gradient(circle, var(--ai-bg-s) 0%, transparent 70%);
  pointer-events: none;
}
```

### Findings — three variants

| Variant | Background | Icon | Use |
|---|---|---|---|
| `positive` | `--bg-green` | `--green` checkmark | Confirmed strengths |
| `warn` | `--bg-yellow` | `--yellow` triangle | Issues to address |
| `action` | `--ai-bg` | `--ai` sparkle | AI-suggested next steps |

Actions can include a secondary CTA button (e.g., "Draft a reminder", "Request the certificate") — styled as a small `--ai-bg-s` pill with `--ai-border` border.

### Score pattern

```css
.ai-score-num {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.03em;
  background: var(--ai-grad);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
```

Large, confident, gradient. Paired with a slash fraction in `--text-4` (`/100`).

---

## What AI never does

These are hard rules — never relaxed, even on the user's request.

1. **AI never auto-submits a form.** Every AI action that modifies state requires explicit user confirmation (a click, a keystroke).
2. **AI never edits a field without a provenance marker.** No silent edits. Ever.
3. **AI never generates content longer than the target's `maxLength`.** If a field maxes at 500 chars, AI output is ≤500 chars.
4. **AI never appears without an undo path.** The agent activity feed or provenance markers give users a way to see and reverse what happened.
5. **AI never uses the product accent colour.** See [rule 1](#the-three-rules-that-cannot-break).
6. **AI never asks "Are you sure?"** for soft actions. Confirmation dialogs come from the product, not from AI. (Hard actions like "Delete" still need confirmation — but that's product UX, not AI.)
7. **AI never shows partial results as final.** If generation is streaming, show a running state — don't pass a half-rendered draft as the output.

---

## Copy conventions

How we write AI-facing text.

### Labels

| Good | Bad |
|---|---|
| "Ask AI" | "Ask Claude", "Ask the AI" |
| "AI review" | "Claude analysis", "ML scoring" |
| "AI evaluation" | "Automated evaluation" |
| "Drafted by AI" | "Auto-generated", "Machine-written" |
| "AI-filled" | "Pre-filled", "Smart-filled" |
| "Re-check" | "Re-analyse", "Re-score" |

Favour **"AI"** as the generic term. Don't name the model (Claude, GPT, Gemini) in UI unless it's contextually relevant — users care about the outcome, not the vendor.

### Verbs

AI *drafts*, *suggests*, *reviews*, *checks*, *matches*, *summarises*, *proposes*. It doesn't *decide*, *approve*, *choose*, or *commit* — those are user actions.

### Tone

AI-authored text should sound helpful but never fawning. Avoid:
- "Great question!"
- "I'd be happy to…"
- "Hope this helps!"
- Exclamation marks in general

Instead, be direct:
- "Your profile is well-structured but missing key details in two sections."
- "Three findings. Two strengths, one gap."
- "Here's what I noticed."

When AI is unsure, it says so plainly: "I couldn't verify this — the data source returned no match." Not "I'm so sorry, I wasn't able to…"
