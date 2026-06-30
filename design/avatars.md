# Avatars

> Dependencies: tokens.css

## Core Specs

- **Circle shape:** `border-radius: 9999px`
- **Rounded square shape:** `--r-md` (5px) for MD–XL, `--r-sm` (4px) for XS–SM
- **Image fit:** `object-fit: cover`

## Sizes

| Size | Dimensions | Radius (rounded square) |
|---|---|---|
| XS | 20×20px | `--r-sm` (4px) |
| SM | 28×28px | `--r-sm` (4px) |
| MD | 36×36px | `--r-md` (5px) |
| LG | 48×48px | `--r-md` (5px) |
| XL | 56×56px | `--r-lg` (8px) |
| 2XL | 72×72px | `--r-lg` (8px) |

## Fallback (initials)

When no image is provided, show initials:
- Background: `--accent` (role-A) or `--bg-gray` (neutral)
- Text: `var(--accent-text)` (on accent bg) or `var(--text-2)` (on gray bg)
- Font: same size as the icon would be at that avatar size, weight 600
- Never show a broken `<img>` — always handle the fallback

## Bordered Avatar

- `3px solid var(--bg-app)` border (creates a buffer gap against parent background)
- Alternative for outlined emphasis: `outline: 1.5px solid var(--divider-strong)`

## Status Dot

- Positioned absolutely: bottom-right corner of the avatar
- Size: 8px (SM), 10px (MD–LG), 12px (XL–2XL)
- Fully rounded
- `2px solid var(--bg-app)` border (background buffer)
- Colors: `var(--green)` for online, `var(--yellow)` for away, `var(--text-3)` for offline

## Stacked Avatars

- Displayed in a flex row
- Each avatar: fully rounded, `2px solid var(--bg-app)` border (background buffer)
- Overlap: `-10px` negative left margin on all except first

### Stacked Counter
- Same size/radius as the other avatars, fully rounded
- Background: `var(--bg-gray)`
- Text: `var(--text-2)`, 11px, weight 600
- Same overlap margin

## Avatar with Text

- Flex row, `10px` gap
- Name: `var(--text-default)`, 13px, weight 500
- Subtitle: `var(--text-3)`, 12px

## Rules

- Use the same shape (circle vs. rounded square) consistently within a surface — don't mix shapes in the same list
- In a stacked group, all avatars must be the same size and shape
- Fallback initials must never overlap with status dots — keep dots strictly outside the avatar bounds
- Never scale an avatar below 20×20px — below that, use an icon shape instead (see `icon-shapes.md`)
