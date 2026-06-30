# Accordion

> Dependencies: tokens.css

## Core Specs

- **Wrapper:** full width, `1px var(--divider)` border, `--r-lg` radius — clips first/last item corners
- **Item separator:** `1px var(--divider)` bottom border on every item except last

## Trigger (Button)

- **Layout:** flex, space-between, full width
- **Padding:** 20px horizontal, 14px vertical
- **Font:** 13px `var(--f-sans)`, weight 500
- **Text color:** `var(--text-default)`
- **Background:** `var(--bg-app)` (light) / `var(--bg-sidebar)` (dark)
- **Hover:** `var(--bg-hover)` background
- **Focus:** `box-shadow: 0 0 0 1px var(--accent), 0 0 0 3px var(--accent-bg)` — never browser outline
- **Transition:** `background-color 80ms var(--ease)`
- **Open state:** `var(--bg-hover)` background

## Panel (Content)

- **Padding:** 20px horizontal, 14px vertical
- **Background:** `var(--bg-app)`
- **Top border:** `1px var(--divider)`
- **Font:** 13.5px, `var(--text-2)`, `1.5` line-height

## Chevron Icon

- Size: 14×14px
- Color: `var(--text-3)`
- Closed: 0deg rotation
- Open: 180deg rotation
- Transition: `transform 150ms var(--ease)`

## Variants

### Default (Collapse)
One panel open at a time. Items stacked inside a single shared bordered/rounded wrapper.

### Flush
No outer border. Trigger and panel have transparent backgrounds. Only `1px var(--divider)` bottom borders between items. Use inside cards or panels that already provide a background.

### Separated
Each item is independent — its own `1px var(--divider)` border, `--r-lg` radius, `8px` bottom margin. No shared outer wrapper.

### Always Open
Multiple panels can expand simultaneously. Same base styling as Default.

## States

| State | Trigger appearance |
|---|---|
| Closed | `var(--text-default)`, `var(--bg-app)` background |
| Open | `var(--text-default)`, `var(--bg-hover)` background |
| Hover | `var(--bg-hover)` background |
| Focus | double box-shadow halo in `--accent` + `--accent-bg` |
| Disabled | `var(--text-3)`, not-allowed cursor, no hover/focus |

## Accessibility

- Trigger uses `<button>` with `aria-expanded` (true/false) and `aria-controls` pointing to the panel id
- Panel uses `role="region"` and `aria-labelledby` pointing to its trigger id
- Keyboard: Space/Enter toggles; Tab moves between triggers
