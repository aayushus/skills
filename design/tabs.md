# Tabs

> Dependencies: tokens.css

Tabs are used to switch between related views within the same context. Don't use tabs for primary app-level navigation — that belongs in the sidebar or bottom tab bar.

## Core Specs

- Typography: 13px `var(--f-sans)`, weight 500, `var(--text-3)` inactive
- Transitions: `color 80ms var(--ease)`, `border-color 80ms var(--ease)`

## Variants

### 1. Underline (Default)

Use for primary content views within a card or page section.

**Wrapper:** `1px var(--divider)` bottom border

**Tab item:**
- Padding: 14px horizontal, 12px vertical
- Bottom border: `2px solid transparent`
- `border-bottom: 2px solid var(--accent)` when active
- `color: var(--text-default)` when active, `var(--text-3)` when inactive

| State | Appearance |
|---|---|
| Active | `var(--text-default)` text, `var(--accent)` bottom border 2px |
| Inactive | `var(--text-3)` text; hover → `var(--text-default)`, `var(--divider-strong)` bottom border |
| Disabled | `var(--text-4)`, not-allowed cursor |
| Focus | double box-shadow halo in `--accent` + `--accent-bg` |

### 2. Pill (Segmented tab bar)

Use inside cards, panels, and secondary navigation within a section.

**Tab item:**
- Padding: 14px horizontal, 8px vertical
- Radius: `--r-md` (5px)
- Transition: `background 80ms var(--ease)`, `color 80ms var(--ease)`

| State | Appearance |
|---|---|
| Active | `var(--bg-active)` background, `var(--text-default)` text, weight 600 |
| Inactive | transparent background, `var(--text-3)` text; hover → `var(--bg-hover)`, `var(--text-2)` |
| Disabled | `var(--text-4)`, not-allowed cursor |
| Focus | double box-shadow halo in `--accent` + `--accent-bg` |

### 3. Full Width (Joined borders)

Use when tabs divide a fixed-width container into equal sections (e.g., a 3-column selector).

Children overlap with `-1px` left margin — same technique as `button-group.md`.

**Tab item:**
- Flex: `1`, centered text
- Padding: 12px horizontal, 10px vertical
- Background: `var(--bg-app)`
- Border: `1px var(--divider)`
- Transition: `background 80ms var(--ease)`
- First item: `--r-md` radius on start side
- Last item: `--r-md` radius on end side

| State | Appearance |
|---|---|
| Active | `var(--bg-gray)` background, `var(--accent)` text, weight 600 |
| Inactive | `var(--bg-app)` background, `var(--text-2)` text; hover → `var(--bg-hover)` |

## Tabs with Icons

- Icon size: 14×14px
- Gap: 6px between icon and label
- Layout: `inline-flex`, vertically centered
- Icons inherit the tab state text color

## Tab Panels

- `role="tabpanel"`, `aria-labelledby` pointing to the active tab's id
- Hidden panels use `hidden` attribute (not `display: none` in CSS, which breaks screen readers)
- Panel content padding: match the tab bar's horizontal padding for visual alignment

## Accessibility

- Tab list: `role="tablist"`
- Each tab: `role="tab"`, `aria-selected` (true/false), `aria-controls` pointing to panel id
- Keyboard within the tab list: ← → arrows move focus; Home/End jump to first/last; Tab moves to the panel
- Never use `tabIndex=-1` on tabs — only the active tab should be in the natural tab order
