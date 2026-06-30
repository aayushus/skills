# Alerts

> Dependencies: tokens.css
> Relationship: This spec formalizes and extends the "Callouts" pattern in `patterns-desktop.md` into a proper alert component with clear semantic variants.

Alerts are non-modal, inline feedback components. Use them for system-level feedback (validation results, action confirmations, warnings) that belongs in the page flow — not in a toast or modal.

## Core Specs

- **Display:** grid (2-column: icon + content) or flex (if no leading icon)
- **Padding:** 12px horizontal, 10px vertical
- **Radius:** `--r-xs` (3px) — alerts inline with content should feel like text, not boxes
- **Border:** `1px solid` (left-accented variant available)
- **Icon:** 16×16px, no-shrink, `6px` right margin

## Variants

### Info (Blue)
- **Background:** `var(--bg-blue)`
- **Border:** `1px solid rgba(27, 112, 197, 0.2)` (see `implementation-guide.md` exceptions)
- **Icon/text:** `var(--accent)` for icon, `var(--text-default)` for body

### Success
- **Background:** `var(--bg-green)`
- **Border:** `1px solid rgba(68, 131, 97, 0.25)` (intentional exception)
- **Icon/text:** `var(--green)` for icon, `var(--text-default)` for body

### Warning
- **Background:** `var(--bg-yellow)`
- **Border:** `1px solid rgba(149, 101, 26, 0.2)` (intentional exception)
- **Icon/text:** `var(--yellow)` for icon, `var(--text-default)` for body

### Danger
- **Background:** `rgba(185, 58, 53, 0.09)` (intentional exception — no `--bg-red` token yet)
- **Border:** `1px solid rgba(185, 58, 53, 0.2)` (intentional exception)
- **Icon/text:** `var(--red)` for icon, `var(--text-default)` for body

### Neutral
- **Background:** `var(--bg-gray)`
- **Border:** `1px solid var(--divider-strong)`
- **Icon/text:** `var(--text-3)` for icon, `var(--text-2)` for body

## Left-Accent Variant

For higher visual emphasis within a dense UI, apply a `3px left border` in the semantic color instead of a full box border:

```css
.alert-accent {
  border: none;
  border-left: 3px solid var(--green); /* or --accent, --yellow, --red */
  border-radius: 0; /* flush left */
  padding-left: 12px;
}
```

Use this variant inside cards, sidebars, or code-adjacent areas where a full box border adds too much weight.

## Anatomy

```
[icon]  Alert heading (13px, 500, --text-default)
        Alert description (13px, 400, --text-2, 1.45 line-height)
        [Optional action link or button]
```

- **Heading:** 13px, weight 500, `var(--text-default)`. Optional — omit for single-line alerts.
- **Body:** 13px, weight 400, `var(--text-2)`, `1.45` line-height
- **Action:** small `btn-ghost` or inline link — `13px`, `var(--accent)`, underlined

## Dismissible Alert

Add an `×` close button at the far right:
- `28×28px` tap target, ghost styling
- `aria-label="Dismiss alert"`
- On dismiss: fade + collapse `max-height` over `200ms var(--ease)`

## Rules

- Use `role="alert"` for dynamic alerts injected after page load (screen readers announce immediately)
- Use `role="status"` for non-urgent updates that don't require immediate attention
- Static alerts rendered with the initial page load need no ARIA role
- Max line length in alert body: ~80 characters — if it's longer, use a card or section instead
- Never use color as the only differentiator — every variant must have a distinct icon
- Don't stack more than 2 alerts in the same view — consolidate into a summary
- Danger alerts should always include a specific action or next step, not just an error description
