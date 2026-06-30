# Form Controls: Radios, Checkboxes & Toggles

> Dependencies: tokens.css

These are selection controls — use them for binary choices and multi-select inputs. All three types receive the same Prism focus ring: `box-shadow: 0 0 0 1px var(--accent), 0 0 0 3px var(--accent-bg)`.

Never use `outline` for focus on form controls — the double box-shadow halo is the Prism standard.

---

## Checkbox

### Specs

- Size: 15×15px
- Radius: `--r-sm` (4px)
- Border: `1.5px solid var(--divider-strong)` (unchecked)
- Background: `var(--bg-app)` (unchecked)
- Transition: `background 80ms var(--ease)`, `border-color 80ms var(--ease)`

### States

| State | Appearance |
|---|---|
| Unchecked | `var(--divider-strong)` border, `var(--bg-app)` background |
| Checked | `var(--accent)` fill + border, white ✓ checkmark |
| Indeterminate | `var(--accent)` fill + border, white `—` line |
| Hover (unchecked) | `var(--accent-bg-s)` background, `var(--accent)` border |
| Focus | double box-shadow halo in `--accent` + `--accent-bg` |
| Disabled | `var(--divider)` border, `var(--bg-gray)` fill, `var(--text-4)` label, not-allowed |

### Label

- `13px var(--f-sans)`, weight 400, `var(--text-2)` color
- `8px` left gap from the control
- Required: `var(--red)` asterisk suffix
- `<label htmlFor>` must match the input `id` — always

---

## Radio

### Specs

- Size: 15×15px
- Radius: 9999px (fully circular)
- Border: `1.5px solid var(--divider-strong)` (unchecked)
- Background: `var(--bg-app)` (unchecked)

### States

| State | Appearance |
|---|---|
| Unchecked | `var(--divider-strong)` border, `var(--bg-app)` background |
| Checked | `var(--accent)` border, `var(--bg-app)` background, `5px var(--accent)` dot centered inside |
| Hover (unchecked) | `var(--accent-bg-s)` background, `var(--accent)` border |
| Focus | double box-shadow halo in `--accent` + `--accent-bg` |
| Disabled | `var(--divider)` border, `var(--bg-gray)` fill, `var(--text-4)` label, not-allowed |

### Group Rules

- All radio inputs in a group must share the same `name` attribute
- Exactly one option per group is always selected (unlike checkboxes)
- Group label uses `<fieldset>` + `<legend>` for screen reader association

---

## Toggle (Switch)

### Track

- Dimensions: 32×18px (default), 40×22px (large)
- Radius: 9999px
- Background unchecked: `var(--divider-strong)`
- Background checked: `var(--accent)`
- Transition: `background 120ms var(--ease)`
- Focus: double box-shadow halo in `--accent` + `--accent-bg` on the track
- Disabled: `var(--divider)` background (both states)

### Thumb

- Size: 14×14px (default), 18×18px (large)
- Radius: 9999px
- Background: white (`#FFFFFF`) — intentional hardcode; see `implementation-guide.md` exceptions
- Offset: `2px` from track edge (unchecked), full right (checked)
- Transition: `transform 120ms var(--ease)`
- `box-shadow: var(--shadow-avatar)` — the one permitted non-float shadow

### Label

- Same as checkbox label: `13px`, `var(--text-2)`, `8px` gap
- Optional helper text below label: `11.5px`, `var(--text-3)`

### States

| State | Track | Thumb |
|---|---|---|
| Off | `var(--divider-strong)` | white, left position |
| On | `var(--accent)` | white, right position |
| Disabled off | `var(--divider)` | `var(--text-4)`, not-allowed |
| Disabled on | `var(--accent-bg-s)` | `var(--text-3)`, not-allowed |

---

## Form Control Layout Patterns

### Vertical List (default)
Stack controls with `12px` vertical gap between items. Used for settings panels and filter menus.

### Inline / Horizontal
Use `inline-flex` with `16px` gap for 2–3 options that benefit from side-by-side comparison (e.g., Yes/No, Public/Private). Never inline more than 3 controls.

### With Description
Each item can have a two-line label (name + helper text) rather than a single line:

```
[✓] Send email notifications
    Receive updates whenever a record changes
```

Name: `13px`, `var(--text-default)`, weight 500
Helper: `11.5px`, `var(--text-3)`, `4px` top margin

---

## Accessibility

- Every control has a unique `id` matching its `<label htmlFor>`
- Radio groups use `<fieldset>` + `<legend>` for the group label
- Indeterminate checkbox: set `indeterminate` property in JS, not via HTML attribute
- Disabled controls must be programmatically disabled (`disabled` attribute), not just visually styled
- Error messages use `aria-describedby` to associate with the control
- The touch target for all controls is `44×44px minimum` on mobile — extend via padding or `::before`
