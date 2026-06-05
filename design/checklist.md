# Pre-ship checklist

Before merging any new component or screen, run this checklist. If any box is unchecked, fix before shipping — not "in a follow-up".

The point of having a design system is that it's cheap to maintain consistency at commit time and expensive to clean up later.

---

## Tokens

- [ ] Every colour references a CSS variable (no hex codes, no `rgb()` literals in component styles)
- [ ] Every radius references `--r-xs` through `--r-xl` (no arbitrary `6px`, `7px`, `12px`)
- [ ] Every spacing is a multiple of 4px (`4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64`)
- [ ] Every border uses `--divider` or `--divider-strong`
- [ ] Every typeface references `--f-sans` or `--f-mono`
- [ ] Every transition uses `var(--ease)` for easing
- [ ] No shadow is used except the four documented exceptions (floating bar, avatar, AI glow, CTA hover)

---

## Colour discipline

- [ ] Accent colour is used only for product primary (CTA, focus ring, active state, selected item)
- [ ] AI purple gradient is used only for AI-provenance surfaces
- [ ] Semantic green/yellow/red indicate *state*, never branding or decoration
- [ ] The **Prism Glyph** is the only AI glyph — no robots, brains, lightbulbs, wands
- [ ] No pink / magenta / cyan anywhere in the design (reserved for the AI gradient endpoint only)

---

## Contrast (WCAG 2.2 AA)

- [ ] Normal body text (<18px or <14px bold) hits ≥4.5:1 against its background
- [ ] Large text (18px+ regular or 14px+ bold) hits ≥3:1
- [ ] UI components (buttons, icons, controls) hit ≥3:1
- [ ] Focus states are visible and hit 3:1 against adjacent colours
- [ ] Text on tinted backgrounds (green pill, yellow callout, AI card) verified, not assumed

Check text-3 usage specifically — if you used it for a 10-12px micro label on a tinted background, re-verify contrast.

---

## Dark mode

- [ ] Component has been viewed in dark mode (not just imagined)
- [ ] All hover, focus, active states work in both modes
- [ ] Gradients have been checked against the dark canvas
- [ ] Shadows were adjusted (darker opacity in dark mode)
- [ ] No hardcoded `color: white` on buttons — use `var(--accent-text)` so it swaps to dark in dark mode

---

## Motion and animation

- [ ] All transitions use `var(--ease)`
- [ ] `@media (prefers-reduced-motion: reduce)` is honoured (either globally in reset or per-animation)
- [ ] No transition exceeds 400ms (except loading spinners)
- [ ] List enters use staggered delays (40ms increments, max 5 items)

---

## Accessibility

- [ ] Icon-only buttons have `aria-label`
- [ ] Progress indicators have `aria-valuenow`
- [ ] Tab lists use proper `role="tablist"` + `role="tab"` + `aria-selected`
- [ ] Form fields have associated `<label>` elements (or `aria-labelledby`)
- [ ] Required fields are marked programmatically (`required` attribute) not just visually
- [ ] Error messages are associated with their fields (`aria-describedby`)
- [ ] Colour is never the *only* way information is conveyed (add icons or text to semantic states)

### Keyboard

- [ ] Every interactive element is reachable via Tab
- [ ] Focus order follows visual order
- [ ] Focus state is visible on every interactive element
- [ ] ⌘K / Ctrl+K is wired for search (if applicable)
- [ ] ⌘J / Ctrl+J is wired for AI command bar (if applicable)
- [ ] ⌘↵ / Ctrl+Enter is wired for primary action (if applicable)
- [ ] Escape dismisses modals, sheets, and menus

---

## Role theming

- [ ] Component works when `--accent` is violet (`data-role="role-b"`) instead of blue (`data-role="role-a"`)
- [ ] Nothing hardcodes `#1B70C5` or `#7C3AED` — all via tokens
- [ ] AI surfaces remain distinct from role-b accent (gradient not flat purple)
- [ ] Role pill is shown where identity matters (multi-persona views)

---

## AI surfaces (if AI is involved)

- [ ] Prism icon is the only AI glyph used
- [ ] AI surfaces use the gradient (or `--ai` hex), never the product accent
- [ ] Provenance markers appear on AI-modified content
- [ ] Loading states use the three documented variants (idle / running / done)
- [ ] AI output has an undo path (either via activity feed or provenance markers)
- [ ] AI-authored copy follows tone conventions (no "Great question!", no exclamation marks)
- [ ] No auto-submit without user confirmation

---

## Mobile (if a mobile view exists)

- [ ] Tested at 360px, 390px, 430px widths
- [ ] All touch targets are ≥44×44 CSS pixels
- [ ] Inputs use `font-size: 16px` to prevent iOS zoom
- [ ] Bottom tab bar respects `env(safe-area-inset-bottom)`
- [ ] Top bar respects `env(safe-area-inset-top)` (when `viewport-fit=cover`)
- [ ] Split-view desktop layouts collapsed to single-column with segmented toggle
- [ ] AI entry moved to bottom-tab-bar sheet (not a floating command bar)
- [ ] Field labels stack above inputs on mobile
- [ ] Size choosers drop from 4-column to 2-column
- [ ] Swipe gestures have visible affordances

---

## Performance (B2B baseline)

- [ ] No Google Fonts or custom font loads (system stack only)
- [ ] CSS bundle isn't ballooning (<50KB gzipped for the design system portion)
- [ ] No layout shift (CLS) on initial paint — reserve space for images, avatars
- [ ] No interactive elements in the critical-render-path that block first paint

---

## Copy & content

- [ ] Section titles are sentence case, not Title Case (except proper nouns)
- [ ] Uppercase labels are used sparingly, never over 12px
- [ ] No placeholder Lorem Ipsum anywhere shipped (even in demos)
- [ ] Error messages are specific ("Phone number must start with a country code") not generic ("Invalid input")
- [ ] Empty states have a next action ("No projects yet. Create one →"), not just a "nothing here"
- [ ] Time displayed in the user's locale (relative where helpful: "2m ago", "just now")

---

## Final sanity pass

Before calling it done:

1. Refresh the page. Does the initial render look correct, or is there a flash of unstyled content?
2. Tab through the screen. Is focus order sensible? Is every element reachable?
3. Zoom the browser to 200%. Does the layout hold, or does text overlap?
4. Disable CSS temporarily. Does the HTML still make semantic sense?
5. Open Lighthouse or WAVE. Are there any flagged issues?
6. Read the screen out loud. Does the content flow naturally, or is it jumpy?

If all six feel good: ship it.
