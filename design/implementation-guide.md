# Implementation guide

Practical rules for building new components in Prism. Read this before writing any CSS or TSX.

---

## Dark mode — how to implement it

Dark mode is handled entirely by CSS tokens. You do NOT need JavaScript or conditional rendering.

### The mechanism

`tokens.css` defines all colours in `:root` (light mode). The `[data-theme="dark"]` selector on `<html>` overrides them:

```css
:root {
  --bg-app: #FFFFFF;
  --text-default: rgb(55, 53, 47);
}
[data-theme="dark"] {
  --bg-app: #191919;
  --text-default: rgba(255, 255, 255, 0.92);
}
```

Because components use `var(--token-name)`, they automatically get the right colour in both modes — **no extra CSS needed for most components**.

### When you DO need a dark mode override

You need an explicit `[data-theme="dark"]` rule when:

1. **You used a hardcoded colour** (an exception — see the Exceptions section below)
2. **You have a gradient or image background** — gradients don't auto-swap
3. **A white-text component sits on a light-in-dark-mode accent** (e.g., profile banner)
4. **Box shadows** — dark mode needs higher opacity shadows

```css
/* Example: gradient background needs dark override */
.hero-banner {
  background: linear-gradient(var(--accent), var(--accent-h));
  color: var(--accent-text); /* this auto-swaps ✓ */
}
[data-theme="dark"] .hero-banner {
  /* Dark accent (#529CCA) is light — overlay a dark tint so white text reads */
  background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.3)),
              linear-gradient(var(--accent), var(--accent-h));
}
```

### Implementing dark mode in a new component — recipe

1. Write all colours as `var(--token)`. Most tokens auto-swap. Done for 90% of cases.
2. If you used a gradient or image background, add a `[data-theme="dark"]` override.
3. Review `--accent` usage: in dark mode `--accent` is `#529CCA` (light blue). White text on this fails WCAG. Use `var(--accent-text)` for text on accent backgrounds — it swaps automatically to `#191919` in dark mode.
4. Review shadows: `--shadow-float` already has dark-mode variants in tokens.css. Don't add custom `rgba(0,0,0,X)` shadows.
5. Open DevTools → toggle `[data-theme="dark"]` on `<html>` → visually inspect. Don't trust your memory.

### `prefers-color-scheme` — important note

Prism uses **`[data-theme]` attribute theming**, NOT `@media (prefers-color-scheme: dark)`.

This is intentional — it lets the app respect OS preference on first load AND let the user override it in-app. Wire it up at startup:

```ts
// At app init (before first render)
const saved = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const theme = saved ?? (prefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', theme);
```

**Do NOT** use `@media (prefers-color-scheme: dark)` for component CSS — it will fight with the in-app toggle.

---

## Spacing scale

All spacing must be a multiple of 4px. These are the allowed values:

| Token | px | Common use |
|---|---|---|
| `4px` | 4 | Icon gaps, micro padding |
| `8px` | 8 | Tight inline gaps, compact rows |
| `12px` | 12 | Default form field padding, tag padding |
| `16px` | 16 | Section padding, card padding (mobile) |
| `20px` | 20 | Card padding (desktop) |
| `24px` | 24 | Between related blocks within a section |
| `28px` | 28 | Between form rows |
| `32px` | 32 | Section horizontal padding (desktop) |
| `36px` | 36 | Between major sections |
| `40px` | 40 | Loose page padding |
| `48px` | 48 | Empty state top/bottom padding |
| `56px` | 56 | Mobile tab bar height |
| `64px` | 64 | Hero/banner areas |

**Never use:** 5px, 6px, 7px, 9px, 10px, 11px, 13px, 14px, 15px, 17px, 18px, 19px, 21px, 22px, 23px, 25px — these break the rhythm.

The 4px grid isn't just aesthetic — it keeps spacing consistent so alignment feels "right" without explaining why.

### Layout-level spacing (apply to .workspace, .left-col, .right-col)

| Context | Value |
|---|---|
| Main column horizontal padding | `32px–40px` |
| Main column top padding | `28px–32px` |
| Between sections on a page | `36px` |
| Within a section (between related blocks) | `16px–24px` |
| Card internal padding | `20px` (desktop), `16px` (mobile) |

---

## Exceptions — when you can hardcode a value

The hard rule is "never hardcode colours, radii, or font names." But there are five **allowed exception types**:

| Exception type | Example | Why it's allowed |
|---|---|---|
| **Fixed overlay tints** | `rgba(0,0,0,0.35)` on modal/sheet backdrop | These don't represent brand colour — they're purely lightness masks, and no token exists for them |
| **White on coloured bg** | `rgba(255,255,255,0.22)` for `.kbd-inline` border | The element sits on a coloured button background; the white-opacity value is relative to that background, not to the theme |
| **Semantic opacity** | `rgba(68,131,97,0.4)` for `.step-row.done .step-line` | Tinted/muted version of a semantic colour with no opacity token. Accept or add a new token. |
| **Shadow tints** | `rgba(0,0,0,0.06)` in `--shadow-float` | Shadow tokens already use these values — don't re-tokenise them inside component CSS |
| **Dark overlay on gradient** | `rgba(0,0,0,0.5)` dark tint over accent gradient in dark mode | Required for WCAG contrast; gradient overlays can't use CSS tokens |

**When you add an exception:** Always add a comment on the same line: `/* intentional exception — [reason] */`

**When you're unsure:** Add a token in `tokens.css` instead of hardcoding. Tokens are cheap; inconsistency is expensive.

**Never hardcode:** Brand colours (`#1B70C5`, `#8B5CF6`), neutral greys, border colours, accent shades — these all have tokens.

---

## Adding a token to tokens.css

When you need a value that doesn't exist as a token:

1. Add it in `:root` with a descriptive name
2. Add a `[data-theme="dark"]` override if the dark value is different
3. Document it with a WCAG ratio comment if it's a text colour
4. Never add tokens in component files — only in `tokens.css`

```css
/* Example: adding a new bg tint */
:root {
  --bg-red: rgba(185, 58, 53, 0.08);  /* ~--red 8% */
}
[data-theme="dark"] {
  --bg-red: rgba(223, 84, 82, 0.12);  /* slightly higher opacity for dark bg */
}
```

---

## Radius pairing rule

When a component has nested elements with rounded corners, the inner radius must always be smaller than the outer:

| Outer | Inner | Example |
|---|---|---|
| `--r-xl` (10px) | `--r-lg` (8px) | Profile card (`--r-xl`) → avatar (`--r-lg`) |
| `--r-lg` (8px) | `--r-md` (5px) | Dropdown menu (`--r-lg`) → menu item (`--r-sm`) |
| `--r-md` (5px) | `--r-sm` (4px) | Button (`--r-md`) → kbd chip inside (`--r-xs`) |

**Never** use the same radius for outer and inner elements — it creates a "flat corner" optical illusion where the inner element appears to touch the outer edge.

---

## Component code checklist (before committing)

Before committing a new component, verify:

- [ ] Every colour is `var(--token)` — no hex, no `rgb()` literals (unless a documented exception)
- [ ] Every radius is `var(--r-*)` — no arbitrary `6px`, `7px`, `12px`
- [ ] Every font reference is `var(--f-sans)` or `var(--f-mono)`
- [ ] Every transition uses `var(--ease)` for the curve
- [ ] Dark mode works: toggle `data-theme="dark"` on `<html>`, inspect visually
- [ ] Role theming works: toggle `data-role="role-b"` on `<html>`, check accent references
- [ ] Mobile works: test at 390px width
- [ ] Hover states are gated with `@media (hover: hover)` if they use `:hover`
- [ ] Touch targets ≥ 44×44px on mobile
- [ ] Accessible: `aria-label` on icon-only buttons, `role` on custom controls
- [ ] JSDoc added with `@param` and `@example`
