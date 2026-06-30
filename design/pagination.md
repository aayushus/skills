# Pagination

> Dependencies: tokens.css

## Core Specs

- Font: 13px `var(--f-sans)`, weight 500
- Display: `inline-flex`, items overlap with `-1px` left margin for seamless borders
- Total height: 30px (default), 36px (comfortable)

## Anatomy

### Wrapper
```css
.pagination {
  display: inline-flex;
  font-size: 13px;
  font-weight: 500;
}
```

### Page Item
- Layout: flex, centered both axes
- Size: 30×30px (default) — 36×36px (comfortable)
- Text: `var(--text-3)`
- Background: transparent
- Border: `1px var(--divider)`
- `margin-left: -1px` (all except first) — creates joined seamless border appearance
- Hover: `var(--bg-hover)` background, `var(--text-default)` text
- Focus: double box-shadow halo in `--accent` + `--accent-bg`

### Active Page Item
- Text: `var(--accent)`, weight 600
- Background: `var(--accent-bg)`
- Border: `1px var(--accent-bg-s)`
- Hover: same as active (stays put)

### Previous / Next Buttons
- Horizontal padding: 10px, same height as page items
- Label: 13px "Previous" / "Next" or `‹` / `›` chevron icons at 12px
- First item: `--r-md` radius on start side
- Last item: `--r-md` radius on end side
- Disabled state (at first/last page): `var(--text-4)`, not-allowed cursor

### Ellipsis Item
- Non-interactive `…` character
- Same size as page items
- Text: `var(--text-3)`
- No hover or focus state

## Compact Variant

When space is tight (e.g., inside a card footer):
- Remove individual page number items
- Show just `‹ Previous` · `Page 3 of 12` · `Next ›`
- The page count uses `--f-mono` for numeric alignment

## Items Per Page Selector

Optionally pair with a small dropdown to the right of the pagination controls:

```
[Rows per page: 25 ▾]    ‹ Previous  1  2  3  Next ›
```

- Dropdown trigger: 13px, `var(--text-2)`, inline with the word "Rows per page:"
- Follows the dropdown patterns from `patterns-desktop.md`

## Mobile

On mobile (< 640px), collapse to compact variant automatically. Never show more than 3 page number items on small screens — use the `Page X of Y` text instead.

## Accessibility

- Wrapper: `role="navigation"`, `aria-label="Pagination"`
- Active page item: `aria-current="page"`
- Previous/Next: descriptive `aria-label` ("Go to previous page", "Go to next page")
- Disabled controls: `aria-disabled="true"`, not `disabled` attribute — lets screen readers still announce them
