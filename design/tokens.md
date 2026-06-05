# Tokens

The complete token contract for the Prism design system. Every value here has been measured against WCAG 2.2 AA requirements in both light and dark mode. See the [Contrast reference](#contrast-reference) at the end for measured ratios.

**If you need a value that isn't here, add it here first.** Adding colours directly in component CSS is how design systems rot. The whole point is that components reference tokens and tokens can change centrally.

## Table of contents

1. [Surfaces](#surfaces)
2. [Text](#text)
3. [Dividers](#dividers)
4. [Accent (product)](#accent-product)
5. [AI layer](#ai-layer)
6. [Semantic](#semantic)
7. [Radii](#radii)
8. [Typography](#typography)
9. [Spacing scale](#spacing-scale)
10. [Motion](#motion)
11. [Elevation](#elevation)
12. [Full `:root` for copy-paste](#full-root-for-copy-paste)
13. [Contrast reference](#contrast-reference)

---

## Surfaces

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg-app` | `#FFFFFF` | `#191919` | Main canvas |
| `--bg-sidebar` | `#F7F7F5` | `#202020` | Sidebar base |
| `--bg-sidebar-deep` | `#F2F1EE` | `#181818` | Sidebar footer |
| `--bg-preview` | `#FBFBFA` | `#1C1C1C` | Secondary / preview pane |
| `--bg-hover` | `rgba(55,53,47,0.04)` | `rgba(255,255,255,0.055)` | Row hover |
| `--bg-hover-2` | `rgba(55,53,47,0.08)` | `rgba(255,255,255,0.09)` | Deeper hover |
| `--bg-active` | `rgba(55,53,47,0.08)` | `rgba(255,255,255,0.08)` | Selected row |
| `--bg-input-h` | `rgba(55,53,47,0.03)` | `rgba(255,255,255,0.04)` | Input hover fill |

### Tinted surfaces

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg-gray` | `rgba(241,241,239,0.9)` | `rgba(47,47,47,0.8)` | Neutral pill / tag |
| `--bg-blue` | `rgba(231,243,248,0.7)` | `rgba(17,57,84,0.45)` | Info callout |
| `--bg-green` | `rgba(219,237,219,0.55)` | `rgba(36,61,48,0.55)` | Success |
| `--bg-yellow` | `rgba(251,236,221,0.6)` | `rgba(89,70,40,0.55)` | Warning |
| `--bg-purple` | `rgba(232,222,238,0.55)` | `rgba(60,45,90,0.5)` | Neutral purple (non-AI) |

### Dark mode hierarchy rule

Light mode goes *lighter* inward (sidebar `#F7F7F5` → canvas `#FFFFFF`). Dark mode *also* goes lighter inward (sidebar `#202020` → canvas `#191919` — the canvas is darker than the sidebar here, which is intentional and matches Notion). The "deep" layer (`--bg-sidebar-deep`) is darker still, creating a subtle basement feel for the footer.

---

## Text

All light-mode text uses `rgb(55, 53, 47)` at various opacities. Never pure black. All dark-mode text uses white at various opacities.

| Token | Light (opacity) | Dark (opacity) | Use |
|---|---|---|---|
| `--text-default` | 100% | 92% | Primary text |
| `--text-2` | 72% | 70% | Secondary labels, field labels |
| `--text-3` | **62%** | **55%** | Metadata, tertiary (AA-safe) |
| `--text-4` | 36% | 30% | Decorative only (NOT for content) |
| `--text-placeholder` | **45%** | **28%** | Input placeholders |

**Important changes from earlier drafts:** `text-3` was bumped from 52% → 62% (light) and 45% → 55% (dark) to pass WCAG AA. `text-placeholder` was bumped from 30% → 45% (light). These are non-negotiable — earlier values fail contrast.

`--text-4` explicitly does not pass contrast and should **only be used for decorative elements** (connector lines, watermarks, inactive step numbers in a passed step). Never use for anything a user needs to read to use the product.

---

## Dividers

| Token | Light | Dark | Use |
|---|---|---|---|
| `--divider` | `rgba(55,53,47,0.08)` | `rgba(255,255,255,0.08)` | Standard hairline |
| `--divider-strong` | `rgba(55,53,47,0.16)` | `rgba(255,255,255,0.14)` | Outline buttons, emphasised borders |

---

## Accent (product)

This is the product primary colour. In two-persona apps it shifts by role: role A is blue, role B is violet. Single-persona apps just use the default (role A).

### Role A (default)

| Token | Light | Dark |
|---|---|---|
| `--accent` | `#1B70C5` | `#529CCA` |
| `--accent-h` | `#0B6BCB` | `#6FB0DC` |
| `--accent-bg` | `rgba(27,112,197,0.08)` | `rgba(82,156,202,0.13)` |
| `--accent-bg-s` | `rgba(27,112,197,0.14)` | `rgba(82,156,202,0.22)` |

**Important:** `--accent` light was darkened from `#2383E2` → `#1B70C5` so white text on the primary CTA button hits AA (5:1 ratio). Earlier `#2383E2` only passed AA-Large and would fail accessibility audits for 13px button labels.

### Role B override (optional second persona)

```css
[data-role="role-b"] {
  --accent: #7C3AED;
  --accent-h: #6D28D9;
  --accent-bg: rgba(124, 58, 237, 0.08);
  --accent-bg-s: rgba(124, 58, 237, 0.14);
}

[data-theme="dark"][data-role="role-b"] {
  --accent: #A78BFA;
  --accent-h: #C4B5FD;
  --accent-bg: rgba(167, 139, 250, 0.13);
  --accent-bg-s: rgba(167, 139, 250, 0.22);
}
```

### Button text colour (`--accent-text`)

Because dark-mode accents are light (for contrast against dark surfaces), white text stops reading on them. Introduce a role-aware text colour:

```css
:root {
  --accent-text: #FFFFFF;      /* white on dark accent */
  --ai-text: #FFFFFF;
}

[data-theme="dark"] {
  --accent-text: #191919;      /* dark text on light accent */
  --ai-text: #191919;
}
```

Use `color: var(--accent-text)` and `color: var(--ai-text)` on primary/AI buttons. Never hardcode `color: white`.

---

## AI layer

The AI layer is visually distinct from the product accent. It uses a purple-to-pink gradient as its signature. **Never use flat purple for AI** — always the gradient (for fills), or the specific `--ai` hex (for text/icons).

| Token | Light | Dark |
|---|---|---|
| `--ai` | `#8B5CF6` | `#A78BFA` |
| `--ai-2` | `#A78BFA` | `#C4B5FD` |
| `--ai-bg` | `rgba(139,92,246,0.08)` | `rgba(167,139,250,0.1)` |
| `--ai-bg-s` | `rgba(139,92,246,0.14)` | `rgba(167,139,250,0.18)` |
| `--ai-border` | `rgba(139,92,246,0.2)` | `rgba(167,139,250,0.24)` |
| `--ai-border-s` | `rgba(139,92,246,0.32)` | `rgba(167,139,250,0.36)` |
| `--ai-grad` | `linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)` | same |
| `--ai-grad-soft` | soft purple→pink tint | slightly lifted for dark |

### AI contrast note

`--ai` as text on white = 4.23:1 — AA-Large only. For AI *body text* (13px+), use `#7C3AED` (AA at 5.7:1) or darken. For AI *icons, backgrounds, gradients, avatars* — `#8B5CF6` is fine because icons meet the 3:1 UI contrast standard, not the 4.5:1 text standard.

**Rule of thumb:** AI body text → darker violet. AI avatars, icons, sparkles, gradient fills → the standard `#8B5CF6 → #EC4899`.

---

## Semantic

Used for state (success, warning, error), not branding.

| Token | Light | Dark | Use |
|---|---|---|---|
| `--green` | `#448361` | `#529E72` | Success, verified, done |
| `--red` | `#B93A35` | `#DF5452` | Error, required asterisk |
| `--yellow` | `#95651A` | `#CA9849` | Warning, pending |
| `--purple` | `#6940A5` | `#9A7ECA` | Reserved (not for AI) |

**Important changes from earlier drafts:**
- `--red` darkened from `#D44C47` → `#B93A35` in light mode. The old value only hit AA-Large (4.26:1); small required asterisks at 11px now read cleanly at 5.67:1.
- `--yellow` darkened from `#CB912F` → `#95651A` in light mode. The old value failed badly on yellow backgrounds (2.53:1). The new value hits 5:1 and still reads as a yellow-category warning.

### Yellow usage rule

Yellow is the trickiest colour for accessibility. Apply carefully:

- `--yellow` as **text**: use the new `#95651A` value — this is mustard-toned, still reads as "warning yellow"
- `--bg-yellow` as **background**: the tinted `rgba(251,236,221,0.6)` is fine as a pill background
- `--yellow` as **bar fill** or **icon tint**: fine at any lightness — meets 3:1 UI component standard
- **Never** use bright yellow (`#FFD700` etc.) for text

---

## Radii

| Token | Value | Use |
|---|---|---|
| `--r-xs` | `3px` | Tags, pills, input fields, kbd, tooltips |
| `--r-sm` | `4px` | Rows, nav items, small buttons |
| `--r-md` | `5px` | Buttons, menus, segmented controls |
| `--r-lg` | `8px` | Cards, hero panels, finding cards |
| `--r-xl` | `10px` | Profile cards, AI verdict, review cards |

### Pairing rule

Radius scales with container size. A 24px pill uses `--r-xs`. A 400px card uses `--r-lg`. When in doubt, go smaller — large radii on small elements look cartoonish; small radii on large elements look sharp.

When nesting, inner radius can be smaller than outer — don't force matching. Forcing inner up makes the inner element look bloated.

---

## Typography

```css
--f-sans: -apple-system, BlinkMacSystemFont, "Segoe UI",
          "Helvetica Neue", Helvetica, "Apple Color Emoji",
          Arial, sans-serif;
--f-mono: "SF Mono", ui-monospace, Menlo, "Consolas", monospace;
```

**No third font. No Google Fonts.** System stack renders native on every OS and has zero load cost. If the user asks for a custom font, push back — it's rarely worth the tradeoff.

### Scale

| Role | Size | Weight | Use |
|---|---|---|---|
| Display | 22px | 700 | Section titles (§ 01) |
| Heading | 18px | 700 | Card names |
| Body-L | 14px | 400 | Default body |
| Body | 13px–13.5px | 400–500 | Sidebar items |
| Meta | 12px–12.5px | 400 | Captions |
| Micro | 11px | 500–600 | Uppercase labels |
| Mono-meta | 10.5px–11px | 400 | Data values, timestamps |

### Rules

- Weights: 400 (body), 500 (UI), 600 (labels, active), 700 (display). Never 300 or 800+.
- Letter-spacing: display `-0.015em to -0.025em`; body `-0.003em to 0`; uppercase labels `0.04em to 0.08em`; mono default.
- Line-height: display 1.2; body 1.5; meta 1.4; mono data 1.
- Uppercase labels never larger than 12px — tracking degrades.

---

## Spacing scale

All spacing is a multiple of 4px. These are the canonical values — do not use anything outside this list.

**Allowed values:** 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64 (all in px)

**Never use:** 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 21–23, 25+ (breaks the rhythm)

| px | Common use |
|---|---|
| 4 | Icon-text gap, micro padding |
| 8 | Tight inline gaps, compact row padding |
| 12 | Default form row gap, tag padding |
| 16 | Card padding (mobile), section gap (mobile) |
| 20 | Card padding (desktop) |
| 24 | Between related blocks within a section |
| 28 | Between form rows |
| 32 | Main column horizontal padding |
| 36 | Between major sections |
| 40 | Loose page top padding |
| 48 | Empty state vertical padding |
| 56 | Mobile tab bar height |
| 64 | Hero / banner height |

---

## Motion

```css
--ease: cubic-bezier(0.16, 1, 0.3, 1);
```

**One easing curve for the whole system.** Never add other curves.

### Duration scale

| Duration | Use |
|---|---|
| `60ms` | Row background hover, tree item hover |
| `80ms` | Border-colour, box-shadow, button hover |
| `120ms` | Card picks, toggle switches |
| `240ms` | Tab fade, content rise-in |
| `400ms` | Progress bar fill, score animations |

Anything longer than 400ms is suspicious (spinners excluded).

### Reduced motion (required)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Every project-wide stylesheet must include this. No exceptions.

---

## Elevation

**No drop shadows on flat surfaces.** Elevation is expressed via background shifts (app → sidebar → sidebar-deep) and hairline borders.

### Four allowed shadows

1. **Floating action bar** — `0 4px 16px rgba(0,0,0,0.06)` light / `0 4px 16px rgba(0,0,0,0.4)` dark
2. **Workspace avatars** — `0 1px 2px rgba(0,0,0,0.1)`
3. **AI avatar / sparkle badges** — `0 2px 6px rgba(139,92,246,0.3)` (coloured glow)
4. **Primary CTA button on hover** — `0 1px 2px rgba(0,0,0,0.06)`

Any other card, panel, or container uses border + background only.

### Focus rings

Always a double box-shadow halo, never `outline`:

```css
box-shadow: 0 0 0 1px var(--accent), 0 0 0 3px var(--accent-bg);
```

For AI inputs, swap `--accent` for `--ai`. For error states, swap to `--red` with a red-tinted outer halo.

---

## Full `:root` for copy-paste

Ready to paste into any new project. See also `assets/tokens.css` for the file with the base reset included.

```css
:root {
  /* Surfaces */
  --bg-app: #FFFFFF;
  --bg-sidebar: #F7F7F5;
  --bg-sidebar-deep: #F2F1EE;
  --bg-preview: #FBFBFA;
  --bg-hover: rgba(55, 53, 47, 0.04);
  --bg-hover-2: rgba(55, 53, 47, 0.08);
  --bg-active: rgba(55, 53, 47, 0.08);
  --bg-input-h: rgba(55, 53, 47, 0.03);

  /* Tinted surfaces */
  --bg-gray: rgba(241, 241, 239, 0.9);
  --bg-blue: rgba(231, 243, 248, 0.7);
  --bg-green: rgba(219, 237, 219, 0.55);
  --bg-yellow: rgba(251, 236, 221, 0.6);
  --bg-purple: rgba(232, 222, 238, 0.55);

  /* Text (AA-verified) */
  --text-default: rgb(55, 53, 47);
  --text-2: rgba(55, 53, 47, 0.72);
  --text-3: rgba(55, 53, 47, 0.62);
  --text-4: rgba(55, 53, 47, 0.36);
  --text-placeholder: rgba(55, 53, 47, 0.45);

  /* Dividers */
  --divider: rgba(55, 53, 47, 0.08);
  --divider-strong: rgba(55, 53, 47, 0.16);

  /* Product accent — role A default (AA-verified) */
  --accent: #1B70C5;
  --accent-h: #0B6BCB;
  --accent-bg: rgba(27, 112, 197, 0.08);
  --accent-bg-s: rgba(27, 112, 197, 0.14);
  --accent-text: #FFFFFF;

  /* AI layer */
  --ai: #8B5CF6;
  --ai-2: #A78BFA;
  --ai-bg: rgba(139, 92, 246, 0.08);
  --ai-bg-s: rgba(139, 92, 246, 0.14);
  --ai-border: rgba(139, 92, 246, 0.2);
  --ai-border-s: rgba(139, 92, 246, 0.32);
  --ai-grad: linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%);
  --ai-grad-soft: linear-gradient(135deg,
                                   rgba(139, 92, 246, 0.1) 0%,
                                   rgba(236, 72, 153, 0.08) 100%);
  --ai-text: #FFFFFF;

  /* Semantic (AA-verified) */
  --green: #448361;
  --red: #B93A35;
  --yellow: #95651A;
  --purple: #6940A5;

  /* Radii */
  --r-xs: 3px;
  --r-sm: 4px;
  --r-md: 5px;
  --r-lg: 8px;
  --r-xl: 10px;

  /* Typography */
  --f-sans: -apple-system, BlinkMacSystemFont, "Segoe UI",
            "Helvetica Neue", Helvetica, "Apple Color Emoji",
            Arial, sans-serif;
  --f-mono: "SF Mono", ui-monospace, Menlo, "Consolas", monospace;

  /* Motion */
  --ease: cubic-bezier(0.16, 1, 0.3, 1);

  /* Shadows (only 4 uses allowed — see elevation) */
  --shadow-float: 0 4px 16px rgba(0, 0, 0, 0.06),
                   0 1px 3px rgba(0, 0, 0, 0.04);
  --shadow-avatar: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-ai: 0 2px 6px rgba(139, 92, 246, 0.3);
}

[data-role="role-b"] {
  --accent: #7C3AED;
  --accent-h: #6D28D9;
  --accent-bg: rgba(124, 58, 237, 0.08);
  --accent-bg-s: rgba(124, 58, 237, 0.14);
}

[data-theme="dark"] {
  --bg-app: #191919;
  --bg-sidebar: #202020;
  --bg-sidebar-deep: #181818;
  --bg-preview: #1C1C1C;
  --bg-hover: rgba(255, 255, 255, 0.055);
  --bg-hover-2: rgba(255, 255, 255, 0.09);
  --bg-active: rgba(255, 255, 255, 0.08);
  --bg-input-h: rgba(255, 255, 255, 0.04);

  --bg-gray: rgba(47, 47, 47, 0.8);
  --bg-blue: rgba(17, 57, 84, 0.45);
  --bg-green: rgba(36, 61, 48, 0.55);
  --bg-yellow: rgba(89, 70, 40, 0.55);
  --bg-purple: rgba(60, 45, 90, 0.5);

  --text-default: rgba(255, 255, 255, 0.92);
  --text-2: rgba(255, 255, 255, 0.70);
  --text-3: rgba(255, 255, 255, 0.55);
  --text-4: rgba(255, 255, 255, 0.30);
  --text-placeholder: rgba(255, 255, 255, 0.28);

  --divider: rgba(255, 255, 255, 0.08);
  --divider-strong: rgba(255, 255, 255, 0.14);

  --accent: #529CCA;
  --accent-h: #6FB0DC;
  --accent-bg: rgba(82, 156, 202, 0.13);
  --accent-bg-s: rgba(82, 156, 202, 0.22);
  --accent-text: #191919;

  --ai: #A78BFA;
  --ai-2: #C4B5FD;
  --ai-bg: rgba(167, 139, 250, 0.1);
  --ai-bg-s: rgba(167, 139, 250, 0.18);
  --ai-border: rgba(167, 139, 250, 0.24);
  --ai-border-s: rgba(167, 139, 250, 0.36);
  --ai-grad-soft: linear-gradient(135deg,
                                   rgba(167, 139, 250, 0.14) 0%,
                                   rgba(244, 114, 182, 0.08) 100%);
  --ai-text: #191919;

  --green: #529E72;
  --red: #DF5452;
  --yellow: #CA9849;
  --purple: #9A7ECA;

  --shadow-float: 0 4px 16px rgba(0, 0, 0, 0.4),
                   0 1px 3px rgba(0, 0, 0, 0.2);
}

[data-theme="dark"][data-role="role-b"] {
  --accent: #A78BFA;
  --accent-h: #C4B5FD;
  --accent-bg: rgba(167, 139, 250, 0.13);
  --accent-bg-s: rgba(167, 139, 250, 0.22);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Contrast reference

All ratios measured against the corresponding `--bg-app`. AA requires 4.5:1 for normal text, 3:1 for large text (18pt regular or 14pt bold) and UI components.

### Light mode

| Text colour | On `--bg-app` | Verdict |
|---|---|---|
| `--text-default` | 12.26:1 | AAA |
| `--text-2` | 5.11:1 | AA |
| `--text-3` (0.62 opacity) | 4.56:1 | AA ✓ |
| `--text-placeholder` (0.45) | 3.65:1 | AA-Large ✓ |
| `--accent` (`#1B70C5`) | 5.02:1 | AA |
| `--accent` role-b (`#7C3AED`) | 5.70:1 | AA |
| `--ai` (`#8B5CF6`) | 4.23:1 | AA-Large (use for ≥18px or swap to `#7C3AED`) |
| `--green` | 4.50:1 | AA |
| `--red` (`#B93A35`) | 5.67:1 | AA |
| `--yellow` (`#95651A`) | 4.98:1 | AA |

### Dark mode

| Text colour | On `--bg-app` | Verdict |
|---|---|---|
| `--text-default` | 15.02:1 | AAA |
| `--text-2` | 9.06:1 | AAA |
| `--text-3` (0.55) | ~5.4:1 | AA |
| `--accent` role-a (`#529CCA`) | 5.83:1 | AA |
| `--ai` (`#A78BFA`) | 6.46:1 | AA |
| `--green` | 5.44:1 | AA |

### Button contrast

| Button | Light | Dark |
|---|---|---|
| White on `--accent` role-a | 5.02:1 ✓ | n/a |
| Dark (#191919) on dark-mode `--accent` role-a | n/a | 5.87:1 ✓ |
| Dark (#191919) on dark-mode `--accent` role-b | n/a | 6.50:1 ✓ |

**Any time you use a button, use `color: var(--accent-text)` or `color: var(--ai-text)` — never hardcode white or black.**
