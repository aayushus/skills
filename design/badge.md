# Badges & Chips

> Dependencies: tokens.css
> Note: The tags/pills in `patterns-desktop.md` cover basic inline state labels. This spec covers standalone badges, dismissible chips, and notification dots.

## Core Specs

- **Border:** none by default (fill-only). AI variant is the exception with a border.
- **Default radius:** `--r-xs` (3px)
- **Pill radius:** 9999px

## Sizes

| Size | Font size | H padding | V padding | Min height |
|---|---|---|---|---|
| SM (default) | 11.5px | 6px | 2px | — |
| MD | 13px | 8px | 4px | — |
| LG | 13px | 10px | 6px | — |

## Variants

### Gray (neutral)
- **Background:** `var(--bg-gray)`
- **Text:** `var(--text-2)`

### Accent (brand highlight)
- **Background:** `var(--accent-bg-s)`
- **Text:** `var(--accent)`

### Green (success/verified)
- **Background:** `var(--bg-green)`
- **Text:** `var(--green)`

### Yellow (warning/pending)
- **Background:** `var(--bg-yellow)`
- **Text:** `var(--yellow)`

### Red (error/critical)
- **Background:** `rgba(185, 58, 53, 0.12)` (see exception rules in `implementation-guide.md`)
- **Text:** `var(--red)`

### AI
- **Background:** `var(--ai-bg-s)`
- **Border:** `1px var(--ai-border)`
- **Text:** `var(--ai)`

### Dark (inverse)
- **Background:** `var(--text-default)` (near-black in light, near-white in dark)
- **Text:** `var(--bg-app)` (inverted surface)

## Pill Badges

Use `border-radius: 9999px` on any variant. Use for status labels where the pill silhouette conveys "state" (e.g., `● Active`, `✓ Verified`).

## Badges with Icons

- Leading icon size: 10px (SM), 12px (MD–LG)
- Icon `color` inherits badge text color
- Gap between icon and label: 4px

## Icon-only Badge

Square — equalize dimensions to `20px` (SM) or `24px` (MD). No horizontal text padding.

## Dismissible Chips

Badge content + an `×` close button. The close `×` button:
- Size: 14×14px tappable area
- Icon: 8px `×`
- `margin-left: 4px`
- Hover background (per variant):

| Variant | Close hover background |
|---|---|
| Gray | `var(--bg-hover-2)` |
| Accent | `var(--accent-bg-s)` |
| Green | `rgba(68, 131, 97, 0.15)` |
| Yellow | `rgba(149, 101, 26, 0.12)` |
| Red | `rgba(185, 58, 53, 0.18)` |
| AI | `var(--ai-bg-s)` |

## Notification Dot

- Positioned absolutely: `-3px` top, `-3px` right of the parent element
- Size: 8px (default), 10px (prominent)
- Fully rounded
- `2px solid var(--bg-app)` border (background buffer)
- Background: `var(--red)` (alerts/errors) or `var(--accent)` (info)
- Optionally shows a count label at 9px, white, weight 600 — hide if zero

## Rules

- Weight: always 500 (medium) — never 400 or 600 in a badge
- Only the AI variant uses a border — all others use fill-only
- Don't use a badge to convey information that needs more than 3 words — use a callout or tag row instead
- State-indicating badges (Active, Pending, Done) use a `●` or `✓` leading glyph, not just color alone
- Color is never the only differentiator — always pair with a glyph or label text
