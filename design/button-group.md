# Button Groups

> Dependencies: tokens.css, patterns-desktop.md (Buttons section)

Button groups are inline-flex containers that join related buttons into a single visual unit by overlapping their borders. Use for mode switches, segmented controls, and paired actions.

## Core Specs

- **Wrapper:** `display: inline-flex`, `--r-md` radius, `1px var(--divider-strong)` outline
- **Children overlap:** `-1px` left margin on all buttons except the first
- **No individual shadows** inside the group — the wrapper provides the shared boundary

## Anatomy

### Wrapper
```css
.btn-group {
  display: inline-flex;
  border-radius: var(--r-md);
  outline: 1px solid var(--divider-strong);
}
```

### First button
- Radius: `var(--r-md)` on inline-start side only, `0` on inline-end

### Middle button(s)
- Radius: `0` on all corners

### Last button
- Radius: `0` on inline-start, `var(--r-md)` on inline-end

### All buttons except first
- `margin-left: -1px` to overlap borders cleanly

## Segmented Control

The most common button group usage — two or three options where exactly one is active at a time. Used for: Edit / Preview toggles, view switchers, tab-style navigation in cards.

```css
.seg-control {
  display: inline-flex;
  background: var(--bg-gray);
  border-radius: var(--r-md);
  padding: 2px;
  gap: 2px;
}
.seg-btn {
  padding: 5px 10px;
  font-size: 12.5px;
  font-weight: 500;
  border-radius: calc(var(--r-md) - 2px); /* inner radius pairing rule */
  background: transparent;
  color: var(--text-2);
  transition: background 80ms var(--ease), color 80ms var(--ease);
}
.seg-btn[aria-selected="true"] {
  background: var(--bg-app);
  color: var(--text-default);
  box-shadow: var(--shadow-float); /* subtle lift for the active pill */
}
```

This is distinct from the outlined button group above — the segmented control uses a filled pill on a tinted track, which is clearer for mode switching.

## Rules

- Buttons inside groups follow all hover, focus, and disabled states from the Buttons section of `patterns-desktop.md`
- Focus ring uses the standard Prism double box-shadow halo (never a CSS outline that bleeds outside the group)
- Icon-only buttons: 14×14px icon, height matches adjacent text buttons
- Minimum 2 buttons, maximum 5 — beyond that, use a dropdown
- Never mix button variants inside a single group (all ghost, or all secondary, etc.)
- In a segmented control, exactly one option must always be selected (never zero)
- Mobile: bump height to 44px and pad proportionally; segmented control pills stay pill-shaped

## Keyboard Navigation

- Arrow keys move focus between buttons within the group
- Enter/Space activates the focused button
- Tab moves focus out of the group to the next interactive element
