# Mobile patterns

Desktop patterns don't port cleanly to phones. The sidebar gets replaced, the split workspace collapses, touch targets grow, navigation flips from persistent to contextual. This file documents how each desktop pattern adapts, and the mobile-specific patterns that only exist on small screens.

Mobile-first is **not** the default stance for this system — Prism targets desktop-primary B2B/SaaS products. But the mobile experience still has to be first-class when it's needed (checking an inbox on the train; approving a review while travelling).

## Table of contents

1. [Breakpoints](#breakpoints)
2. [Type scale](#type-scale)
3. [Touch targets](#touch-targets)
4. [Navigation](#navigation)
5. [Bottom tab bar](#bottom-tab-bar)
6. [AI entry on mobile](#ai-entry-on-mobile)
7. [Field adaptations](#field-adaptations)
8. [Buttons](#buttons)
9. [Cards and lists](#cards-and-lists)
10. [Sheets and modals](#sheets-and-modals)
11. [Split-view collapse](#split-view-collapse)
12. [Gestures](#gestures)
13. [Safe areas](#safe-areas)

---

## Breakpoints

Three breakpoints. Use them consistently via CSS custom media queries.

| Name | Range | Use |
|---|---|---|
| `mobile` | `< 640px` | Phones |
| `tablet` | `640px – 1023px` | Tablets, foldables, narrow desktop windows |
| `desktop` | `≥ 1024px` | Main desktop target |

```css
/* Mobile only */
@media (max-width: 639px) { /* … */ }

/* Tablet and down */
@media (max-width: 1023px) { /* … */ }

/* Desktop only (default stance — no media query needed) */
```

Don't add extra breakpoints (`sm`, `md`, `lg`, `xl`, `2xl`) — three is enough for a B2B product. If something genuinely needs a fourth, push back on the design before adding it.

### Tablet stance

Tablets are a degraded desktop, not an enlarged phone. Keep the sidebar — optionally collapsed to icons-only (48px wide). Keep the topnav. Don't introduce bottom tabs on tablets unless the app runs primarily in landscape orientation.

```css
@media (max-width: 1023px) and (min-width: 640px) {
  .sidebar { width: 48px; /* icons only */ }
  .sidebar .label, .sidebar .progress-capsule, .sidebar .tree-label { display: none; }
}
```

---

## Type scale

Mobile bumps body text up for thumb-distance readability. The scale:

| Role | Desktop | Mobile |
|---|---|---|
| Display | 22px | 24px |
| Heading | 18px | 18-20px |
| Body-L | 14px | 15-16px |
| Body | 13px | 14-15px |
| Meta | 12px | 12-13px |
| Micro | 11px | 11-12px |

The uppercase labels stay small (don't bump them) — they're markers, not content.

Rule: if a user is reading text on their phone (body copy, field values, AI summaries), it should be at least 14px. Never go below 12px for anything readable; reserve 11px for uppercase labels and kbd chips.

---

## Touch targets

**Minimum 44×44 CSS pixels for any tappable target.** This is a hard rule, not a suggestion — Apple HIG requires it, Android MD recommends 48dp, WCAG 2.5.8 mandates it for AA compliance.

Apply to: buttons, nav items, icon buttons, row taps, close buttons, checkbox/radio clicks.

The visible element can be smaller (e.g., a 28px close icon) but the tappable area must extend to 44px via padding or `::before` pseudo-element:

```css
.close-btn {
  width: 28px; height: 28px;
  /* … */
  position: relative;
}
.close-btn::before {
  content: '';
  position: absolute;
  inset: -8px; /* extends tap area to 44px */
}
```

Spacing between targets: at least `4px`, ideally `8px`, to prevent mis-taps.

---

## Navigation

Desktop has a persistent sidebar. Mobile has **three** navigation surfaces:

1. **Top bar** — page title + back + overflow. Height 44px (or 52px if a subtitle row is needed).
2. **Bottom tab bar** — primary app-level navigation. Always visible. Height 56px + safe-area-inset-bottom.
3. **Off-canvas drawer** — workspace switcher and tree, accessed from the top-bar avatar. Slides in from the left.

Never combine a mobile hamburger menu with a bottom tab bar — pick one. Bottom tabs win for B2B tools because they stay out of the way and expose primary surfaces constantly.

### Top bar

```
┌─────────────────────────────────────┐
│ [←]  Project Atlas            [⋯]   │
│      Design review                  │
└─────────────────────────────────────┘
```

- Left: back chevron (44×44 tap area) OR workspace avatar (tap → drawer).
- Center: page title (15px 600) with optional subtitle (12px `--text-3`) stacked below.
- Right: overflow dots OR primary contextual action (e.g., `[Save]` during an edit flow).

When the page scrolls, the top bar can get a bottom shadow or `--divider` hairline — apply only once the scroll position is > 0.

---

## Bottom tab bar

Five tabs maximum. Four is better — avoids the centre-tab ambiguity. Never fewer than three.

Structure:

```
┌─────┬─────┬────✦────┬─────┬─────┐
│Home │Find │  Ask    │Inbox│ You │
│     │     │   AI    │     │     │
└─────┴─────┴─────────┴─────┴─────┘
```

- Height: `56px` + `env(safe-area-inset-bottom)`
- Background: `--bg-app`
- Top border: `1px var(--divider)`
- Each tab: flex-1, 44px min tap height, icon 22px + label 10.5px 500
- Active tab: icon + label in `--accent`, inactive in `--text-3`

### The AI tab is always centre

The centre slot is reserved for AI entry — typically labelled "Ask AI". Use a raised centre button with the AI gradient, or a standard tab with the sparkle icon in gradient-filled mode. Two treatments:

**Option A — flush tab** (preferred for B2B):
```
Regular 5-tab bar, centre icon uses var(--ai-grad) fill, label "Ask AI"
```

**Option B — raised FAB style**:
```css
.tab-ai {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 52px; height: 52px;
  border-radius: 50%;
  background: var(--ai-grad);
  box-shadow: var(--shadow-ai);
  display: flex; align-items: center; justify-content: center;
  color: white;
}
```

Only use Option B if the product is AI-first. For utility B2B apps, use Option A — the FAB is too assertive.

### Role-specific tabs

If the product has two personas, tab labels can adapt by role:

| Role | Tabs (in order) |
|---|---|
| role-a | Home · Projects · Ask AI · Inbox · Profile |
| role-b | Home · Search · Ask AI · Inbox · You |

---

## AI entry on mobile

Desktop has three AI entry points: command bar in top nav, inline section buttons, AskAI dock tile in sidebar. On mobile, consolidate to one primary entry:

- **The Ask AI tab in the bottom bar.**

When tapped, it opens a bottom sheet with a text input auto-focused, suggested prompts (3-4 chips), and the agent activity feed. Desktop's "command bar" becomes a full-height sheet on mobile.

Inline AI buttons (per-section `Verify`, `Improve`, `Re-check`) stay — they appear in a section's overflow menu OR as full-width buttons below the section header, since hover doesn't exist on touch.

Provenance markers (AI-filled field indicators) stay the same — the 3px purple left-bar works at any screen size.

---

## Field adaptations

### Stack label above input

The desktop 168px-label + 1fr-input grid doesn't fit on mobile. Stack:

```css
@media (max-width: 639px) {
  .f {
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 12px 16px;
  }
  .f-label { padding-top: 0; font-weight: 500; color: var(--text-2); }
  .f-input, .f-area, .f-select {
    font-size: 16px;  /* prevents iOS zoom on focus */
    padding: 10px 12px;
    border: 1px solid var(--divider-strong);
    border-radius: var(--r-sm);
    background: var(--bg-app);
    min-height: 44px;
  }
}
```

**Critical:** inputs must be ≥16px font-size on mobile or iOS Safari zooms the viewport on focus. This is a UX failure that looks like a bug.

### Keyboard type hints

Use the right `inputmode` and `type` so the mobile keyboard shows the right layout:

| Input | Attribute |
|---|---|
| Email | `type="email"` |
| Phone | `type="tel"` |
| Numeric (currency, qty) | `inputmode="decimal"` |
| Integer | `inputmode="numeric"` |
| URL | `type="url"` |
| Search | `type="search"` |

### Left-bar state indicators

The `-12px` offset doesn't work on mobile because page padding is tighter. Move the bar inline, at the field's left edge (x=0) instead:

```css
@media (max-width: 639px) {
  .f::before {
    left: 0; /* was -12px */
  }
  .f { padding-left: 16px; }  /* add space for bar */
}
```

---

## Buttons

Height grows to 44px on mobile for comfortable tapping. Padding grows proportionally.

```css
@media (max-width: 639px) {
  .btn {
    height: 44px;
    padding: 0 16px;
    font-size: 14px;
  }
}
```

### Full-width primary actions

On mobile, primary CTAs are usually full-width at the bottom of the screen or card — not a 120px pill. This signals "this is the one thing to do on this screen":

```css
.btn-primary.full {
  width: 100%;
}
```

### Floating action bar on mobile

Desktop floats the action bar as an absolute-positioned card. Mobile pins it to the bottom, above the tab bar, full-width:

```css
@media (max-width: 639px) {
  .action-bar {
    position: fixed;
    left: 0; right: 0;
    bottom: calc(56px + env(safe-area-inset-bottom));  /* above tab bar */
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-bottom: none;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.06);
  }
  .action-bar .action-actions .btn-primary { flex: 1; } /* primary fills */
}
```

---

## Cards and lists

### Cards go full-width

Desktop cards have variable widths depending on column. On mobile, cards fill the viewport with `16px` horizontal page padding.

```css
@media (max-width: 639px) {
  .profile, .progress-capsule, .ai-review-card {
    border-radius: var(--r-lg);  /* slightly smaller */
    margin: 0 0 12px;
  }
}
```

### Step rows collapse the connector

The 14px vertical line between steps can feel tight on mobile. Either shrink to 10px or remove and replace with 1px dividers between rows:

```css
@media (max-width: 639px) {
  .step-line { display: none; }
  .step-row {
    border-bottom: 1px solid var(--divider);
    padding: 12px 16px;
  }
}
```

### Stat strip goes 2-column

3-column stat strips cramp at mobile widths. Switch to 2-column with a third row if needed:

```css
@media (max-width: 639px) {
  .stat-strip {
    grid-template-columns: 1fr 1fr;
  }
  .stat-cell:nth-child(odd) { border-right: 1px solid var(--divider); }
  .stat-cell { border-bottom: 1px solid var(--divider); }
}
```

### Size chooser goes 2-column

4 columns cramp badly. Switch to 2:

```css
@media (max-width: 639px) {
  .size-chooser {
    grid-template-columns: 1fr 1fr !important;
  }
}
```

---

## Sheets and modals

Desktop modals overlay in the centre. Mobile should use **bottom sheets** instead — they slide up from the bottom, preserve the underlying context at the top of the screen, and are easier to dismiss (swipe down).

### Bottom sheet anatomy

```
┌─────────────────────────────┐
│                             │
│ (underlying page, tinted)   │
│                             │
├─────────────────────────────┤
│          ▬▬▬                │ ← drag handle
│                             │
│ Sheet title                 │
│                             │
│ Content…                    │
│                             │
│ [────────────────────────]  │ ← full-width primary CTA
└─────────────────────────────┘
```

- Handle: 40px wide × 4px tall, `--divider-strong`, centered, `4px` radius, 12px top padding.
- Sheet: `--bg-app`, top-corners `--r-xl` (10px), bottom edge touches viewport bottom.
- Backdrop: `rgba(0, 0, 0, 0.35)` over the page, fade in 200ms.
- Swipe down to dismiss. Tap backdrop to dismiss.

Use bottom sheets for: AI command interface, filters, detail views, action menus, decision cards.

### Full-screen sheets

When the content is too dense for a partial sheet (e.g., a detail record, long AI review), use a full-screen sheet instead. Slide up from bottom, fills the viewport, top bar has a close `[×]` on the right and page title centered.

---

## Split-view collapse

Desktop has many split-workspace screens (edit left / preview right). On mobile, collapse to single column with a **segmented control** at the top to switch views.

```
┌─────────────────────────────┐
│  [ Edit ]  [ Preview ]      │ ← segmented toggle
├─────────────────────────────┤
│                             │
│  (only one pane at a time)  │
│                             │
└─────────────────────────────┘
```

Segmented control: same pattern as the `ThemeToggle` (2-column button group with `--bg-gray` container and `--bg-app` active state).

For detail/review screens specifically: default view on mobile is the **AI Verdict + criteria checklist** (left desktop pane). Tap `Preview` to see the record detail card (right desktop pane).

---

## Gestures

Respect platform gestures. Don't fight them.

| Gesture | Use |
|---|---|
| Swipe right on list row | Reveal row actions (archive, assign, mark done) |
| Swipe left on list row | Destructive action (delete, reject) — show red |
| Pull to refresh | List refresh |
| Swipe down on sheet | Dismiss bottom sheet |
| Swipe down from top | OS notification area — don't intercept |
| Long-press | Multi-select entry, context menu |

### Don't

- Don't use swipe gestures without visible affordances — hidden gestures are undiscovered gestures.
- Don't override system back gesture (Android/iOS both have hardware/software back).
- Don't use pinch-to-zoom on text content (only use on images/maps).

---

## Safe areas

Respect the notch, home indicator, and round corners on modern phones. Use CSS env variables:

```css
.page {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

.tab-bar {
  padding-bottom: env(safe-area-inset-bottom);  /* keeps tabs above home indicator */
}

.top-bar {
  padding-top: env(safe-area-inset-top);  /* keeps title below notch */
}
```

Configure viewport to allow `viewport-fit=cover`:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

Without this, `env(safe-area-inset-*)` resolves to 0 on iOS and everything clips under the notch.

---

## Responsive testing checklist

Before shipping a mobile view, test:

- [ ] 360×640 (small Android phones)
- [ ] 375×667 (iPhone SE)
- [ ] 390×844 (iPhone 15)
- [ ] 430×932 (iPhone 15 Pro Max)
- [ ] Landscape on a phone (often forgotten)
- [ ] iPad portrait (768×1024) — should use the tablet stance
- [ ] Dynamic Type at 200% on iOS (text grows; does your layout still work?)
- [ ] Dark mode in all the above
- [ ] Scroll depth keeps top bar visible (if sticky) and tab bar visible
- [ ] Keyboard open state — bottom sheet and inputs must still be visible
