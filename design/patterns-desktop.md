# Desktop patterns

Every pattern in this file has been battle-tested across user onboarding, document editing, review, and admin screens. When building anything new, find the closest pattern here and extend from it — don't invent new visual language unless you've discussed it with the user first.

## Table of contents

1. [Layout](#layout)
2. [Sidebar](#sidebar)
3. [Top nav](#top-nav)
4. [Main column](#main-column)
5. [Form fields](#form-fields)
6. [Buttons](#buttons)
7. [Tags and pills](#tags-and-pills)
8. [Cards](#cards)
9. [Tables and lists](#tables-and-lists)
10. [Step rows](#step-rows)
11. [Stat strip](#stat-strip)
12. [Size chooser](#size-chooser)
13. [Callouts](#callouts)
14. [Floating action bar](#floating-action-bar)
15. [Profile card](#profile-card)
16. [Tables and data grids](#tables-and-data-grids)
17. [Modals (desktop dialogs)](#modals-desktop-dialogs)
18. [Tooltips](#tooltips)
19. [Dropdown menus](#dropdown-menus)
20. [Empty states](#empty-states)
21. [Loading skeletons](#loading-skeletons)

---

## Layout

The canonical app shell is a flex layout with a 268px sidebar and a flexible main column.

```
┌──────────┬─────────────────────────────────────┐
│          │ topnav (44px)                       │
│ sidebar  ├─────────────────────────────────────┤
│ (268px)  │ workspace                           │
│          │ (scrollable)                        │
│          │                                     │
└──────────┴─────────────────────────────────────┘
```

Sidebar width is fixed at 268px — this is wide enough for a workspace switcher with icon + name + role pill, and narrow enough to leave the main column breathing. Don't change without a reason.

For split-workspace screens (edit on left, preview on right), divide the main column 50/50 with a 1px hairline between:

```
┌──────────┬─────────────────┬───────────────────┐
│          │ topnav                              │
│ sidebar  ├─────────────────┼───────────────────┤
│          │ edit column    │ preview column    │
│          │                │                    │
└──────────┴─────────────────┴───────────────────┘
```

Main column content uses `32px–40px` horizontal padding. The preview column uses `32px` with a `24px` vertical padding to give the card inside breathing room.

### App shell — implementation code

This is the standard grid for all desktop apps. Copy this and build from it.

```html
<!-- index.html / _app.tsx root -->
<html data-theme="light">  <!-- add data-role="role-a" for two-persona apps -->
<body>
  <div class="shell">
    <aside class="sidebar">
      <!-- WorkspaceSwitcher -->
      <!-- AskAI tile -->
      <!-- AgentActivity feed -->
      <!-- TreeItem navigation -->
      <!-- SidebarFooter -->
    </aside>
    <div class="main">
      <header class="topnav">
        <!-- Topnav: left=Breadcrumb, center=AIBar, right=actions -->
      </header>
      <div class="workspace">
        <!-- Page content. Add class "two-col" for split view -->
        <div class="left-col"><!-- primary content --></div>
        <div class="right-col"><!-- preview / detail --></div>
      </div>
      <!-- ActionBar sits inside .main, position: sticky bottom -->
    </div>
  </div>
</body>
</html>
```

```css
/* Shell layout — add to your app's root stylesheet */
.shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-app);
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0; /* prevents flex blowout */
}
.workspace {
  flex: 1;
  overflow-y: auto;
  position: relative;
}
/* Split view */
.workspace.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.workspace.two-col::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 1px;
  background: var(--divider);
}
```

**Critical:** Always set `min-width: 0` on `.main` — without it, flex children can overflow the viewport when content is wide.

---

## Sidebar

The sidebar has this vertical structure, in order:

1. **Workspace switcher bar** — 24px avatar + workspace name + optional role pill + caret. Bottom border.
2. **Agent dock** — `AskAI` tile + agent activity feed. Bottom border.
3. **Primary context capsule** — progress capsule (onboarding completion) or active-item capsule (e.g., current document). White card with border and radius `--r-lg`.
4. **Section headers + lists** — onboarding steps, favourites, recent items, etc.
5. **Workspace tree** — collapsible tree of top-level resources (e.g., Projects, Documents, People, Messages).
6. **Footer** — AI credits + theme toggle + help + user pill. Uses `--bg-sidebar-deep` for subtle basement feel.

### Workspace switcher

```
┌─────────────────────────────────┐
│ [A]  Acme Workspace    [caret]  │
│      [Admin] Core team          │
└─────────────────────────────────┘
```

Avatar: 22-24px square, `--r-md`, linear-gradient fill (use the role's accent gradient or a stable assigned colour per workspace). Name: 13px 600. Role pill (if multi-persona): 9.5px 600 uppercase, `--accent-bg-s` bg, `--accent` text, `--r-xs` radius.

### Agent dock

The AskAI tile is the prominent AI entry point. It uses `--ai-grad-soft` background with `--ai-border` border. Inside: a 28px gradient-filled square (`--r-md` 7px) with the sparkle icon, label "Ask AI", a hint like "Fill, review, rewrite…", and a `⌘J` kbd chip. On hover: subtle lift (`translateY(-1px)`) and outer halo (`box-shadow: 0 0 0 3px var(--ai-bg)`).

Agent activity items: 18px icon square (colour by status: purple/running, green/done, yellow/warn) + task text + meta line with emphasis value. Use SF Mono for the meta line.

### Step list rows

See [Step rows](#step-rows).

### Tree

Tree items are 27px min-height rows with 18px chevron + 20px emoji icon + label + optional count pill.

---

## Top nav

Height `44px`, `1px` bottom border using `--divider`. Contents, left to right:

1. **Breadcrumb** — breadcrumb items with separators (`/` in `--text-4`). Current item in 500 weight, `--text-default`. Hoverable.
2. **AI command bar** — centered, max-width 480px, full `--ai-grad-soft` background. See [AI surfaces](./ai-surfaces.md#ambient-command-bar).
3. **Right cluster** — export / share button + primary action (e.g., "Invite", "Publish") + overflow dots.

Breadcrumb items: 13px body, `--text-2` colour, `--r-sm` radius on hover. Separator spacing: 2px horizontal.

---

## Main column

Content max-width is unbounded by default — let it fill. If the content is form-oriented, cap at ~800-920px. Use `32px–40px` horizontal padding depending on column width.

Top of content: section header. Pattern:

```
§ 01  Section title
     Description paragraph below the title.
```

- `§ NN` marker: 11px SF Mono in `--text-4`, padded 2px/6px, `--bg-gray` background, `--r-xs` radius.
- Title: 22px 700, `-0.015em` letter-spacing, `--text-default`.
- Description: 13.5px in `--text-3`, `1.45` line-height. Max 1-2 sentences.
- Hover reveals section action buttons in the right — `Verify`, `Improve`, `Re-check` etc. (fade in via opacity transition, 150ms).

Sections separated by 28-36px vertical margins. Within sections, use 16-24px between related blocks.

---

## Form fields

The canonical field pattern is a 2-column grid: label left (168px), control right (1fr).

```
Label                 [input.............................]
```

### Anatomy

```css
.f {
  display: grid;
  grid-template-columns: 168px 1fr;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 12px;
  border-radius: var(--r-sm);
  position: relative;
  transition: background 60ms var(--ease);
}
.f:hover { background: var(--bg-hover); }
```

- Label: 13px, `--text-3`, padding-top 6px to align with input center.
- Input: 14px, bare (no border), transparent background. On hover: `--bg-input-h` fill. On focus: solid white (`--bg-app`) + 3px outer `--accent-bg` halo + 1px `--accent` border.
- Required marker: `--red` asterisk after label.

### States via left bars

State indicators live *outside* the field as a 3px bar offset `-12px` from the field's left edge. This keeps them from eating input space.

| State | Bar colour | Extras |
|---|---|---|
| Default | transparent | — |
| Done | `--green` | — |
| AI-filled | `--ai` | + `box-shadow: 0 0 4px var(--ai)` glow |
| Error | `--red` | + red focus halo |

AI-filled fields also show a small "AI" tag (9.5px, uppercase, in the field's control area): `--ai-bg` background, `--ai-border` border, `--ai` text, `--r-xs` radius.

### Input variants

| Variant | When |
|---|---|
| `<input>` | Single line |
| `<textarea>` | Multi-line, resize vertical, `min-height: 76px` |
| `<select>` | Dropdowns — `appearance: none`, pad `padding-right: 24px` for native arrow |
| Affix | Prefix (currency, country code) in a SF Mono pill on the left inside a bordered container |

### Focus ring recipe

Always a double box-shadow halo on the input, never browser outline:

```css
.f-input:focus {
  background: var(--bg-app);
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-bg);
}
```

---

## Buttons

Five variants. Use the narrowest fit.

| Variant | Use | CSS summary |
|---|---|---|
| `btn-primary` | Main action per screen (save, submit, continue) | `bg: var(--accent); color: var(--accent-text);` |
| `btn-secondary` | Alternate action (cancel, skip, back) | `transparent bg + 1px border var(--divider-strong)` |
| `btn-ghost` | Tertiary / utility | `transparent bg, no border` |
| `btn-ai` | AI-triggered action | `bg: var(--ai-grad); color: var(--ai-text);` + small purple shadow |
| `btn-danger` | Destructive (decline, delete) | red text, subtle red border, red-tint bg on hover |

Heights: `30px` default, `28px` compact (in top nav), `44px` for mobile touch (see mobile patterns).

Radius: `--r-md` (5px). Padding: `0 10px` (30px height) or `0 12px` (if text is wide).

Font: 13px 500, `-0.003em` letter-spacing.

### Kbd inline hint

Primary buttons can show an inline keyboard shortcut chip:

```tsx
<Button variant="primary" kbd="⌘↵">Continue</Button>
```

The chip: 10.5px SF Mono, `rgba(255,255,255,0.22)` border (on coloured bg) or `--divider-strong` (on neutral bg), `--r-xs` radius, `margin-left: 4px`.

### Icon + text

Icon goes left of text, `6px` gap. Icon size 12-14px. Never use icons larger than the text baseline.

---

## Tags and pills

Six variants. Pattern: 2px/8px padding, 11.5px 500, `--r-xs` radius.

| Variant | bg | text |
|---|---|---|
| `gray` | `--bg-gray` | `--text-2` |
| `accent` | `--accent-bg-s` | `--accent` |
| `green` | `--bg-green` | `--green` |
| `yellow` | `--bg-yellow` | `--yellow` |
| `red` | `rgba(212,76,71,0.12)` | `--red` |
| `ai` | `--ai-bg-s` + `1px --ai-border` border | `--ai` |

Only the `ai` variant has a border — others use fill alone.

### Meaning

Tags with a leading `●` or icon are state. Tags without a leading glyph are category. Don't mix — e.g., a pill showing "Small enterprise" (category) shouldn't have a dot; a pill showing "Verified" (state) should have `✓`.

---

## Cards

Cards use `--bg-app` + `1px --divider` border + `--r-lg` radius (8px). Larger hero cards (profile card, AI verdict) use `--r-xl` (10px).

**No drop shadows on cards.** Elevation comes from background contrast (canvas → card) and the border hairline. Exceptions: AI verdict has a soft coloured glow from its `::before` pseudo-element.

### Progress capsule

Small sidebar card with title, gradient progress bar, and 3-cell stat strip inside:

```css
.progress-capsule {
  margin: 12px 10px;
  padding: 12px;
  background: var(--bg-app);
  border: 1px solid var(--divider);
  border-radius: var(--r-lg);
}
```

The progress bar uses `--ai-grad` fill when the score comes from AI analysis (e.g., a readiness score or completeness estimate). Progress bars that aren't AI-driven should use `--accent` fill instead.

### Decision card

Three-option button grid where user picks one — e.g., Approve / Request changes / Reject. Each button: `padding: 10px 12px`, `--r-md` radius, `1px --divider-strong` border. Selected: `--accent` border + `--accent-bg` fill.

---

## Tables and lists

Avoid full tables when a list-of-rows works. For compact lists (under 20 items), use 1px hairline rows with `--divider` separators. For dense tables, use the same tokens (no zebra striping — just hairlines).

Row pattern for scannable lists:
- Height: 40-48px
- 1px `--divider` bottom border (no border on last item)
- Hover: `--bg-hover`
- Active/selected: `--bg-active` + left 2px `--accent` indicator offset `-12px`

---

## Step rows

The canonical vertical list pattern — used for onboarding steps, checklists, task timelines.

```
┌─ (20 circle) ── Step name [AI badge] ──┐
│      │         Subtitle or status       │
│   (14 line)                              │
│      │                                   │
└─ (20 circle) ── Next step ───────────────┘
```

Grid: `20px` circle column + `1fr` body. Gap 10px.

Circle states:
- **Future:** 1.5px `--divider-strong` border, `--text-3` number inside
- **Active:** `--accent` fill, white number, `3px --accent-bg` halo via box-shadow
- **Done:** `--green` fill, white checkmark

Between circles: a 1.5px × 14px line in `--divider-strong`. When the step is done, the line fades to 40% green opacity.

Body:
- Step name: 13px 500 (600 when active)
- Optional AI badge: 9.5px 600 uppercase in `--ai-bg` + `--ai-border` pill
- Subtitle: 11px in `--text-3`

---

## Stat strip

Horizontal row of numeric cells with 1px hairline dividers between. `--bg-app` background, `--r-lg` radius on the outer container.

```
┌─────────────┬─────────────┬─────────────┐
│ 38          │ 1,204       │ 15 days     │
│ MEMBERS     │ DOCUMENTS   │ AVG REVIEW  │
└─────────────┴─────────────┴─────────────┘
```

Cell padding: `10px 14px`. Value: 14px 600. Label: 10.5px 600 uppercase in `--text-3`, letter-spacing `0.06em`.

---

## Size chooser

A 4-column card grid picker — use for enum-style choices that benefit from visual weight (team size, tier selection, subscription plan).

```
┌──────┬──────┬──────┬──────┐
│ Solo │Micro │Small │ Mid  │
│1 pax │2-9   │10-49 │50-249│
└──────┴──────┴──────┴──────┘
```

Each card: `padding: 10px 12px`, `--r-lg` radius, `1px --divider-strong` border (transparent until hover), `--bg-app`. Selected: `--accent` border + `--accent-bg` fill, checkmark ✓ absolute-positioned top-right.

For 3-5 options; beyond that, switch to a proper select dropdown.

---

## Callouts

Inline content blocks — info, warning, success. Horizontal: emoji/icon left, content right.

```css
.callout {
  display: grid;
  grid-template-columns: 24px 1fr;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--r-xs);
}
.callout-info { background: var(--bg-blue); }
.callout-warn { background: var(--bg-yellow); }
.callout-success { background: var(--bg-green); }
```

Use `--r-xs` (3px) because callouts inline with text should feel like text, not boxes.

Text: 13px `--text-2` with `strong` headers in `--text-default`. Keep callouts short — 1-3 sentences. If it needs more, use a card or section instead.

---

## Floating action bar

Bottom-anchored bar that holds save status + primary/secondary/ghost actions. Appears only on edit screens.

```css
.action-bar {
  position: absolute; /* or fixed inside a scroll container */
  bottom: 16px;
  padding: 8px 10px;
  background: var(--bg-app);
  border: 1px solid var(--divider);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-float);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
```

Anchored to the **primary editing column**, not full-width. In a split layout, this means the bar sits inside the left pane only.

Left side: a 6px status dot + text like "Auto-saved · 12s ago". Dot colour: green (ok), yellow (warn), red (error), neutral (idle).

Right side: buttons in order — `ghost` back → `ai` helper → `primary` continue. Never more than 4 buttons.

---

## Profile card

Hero card for displaying a user, team, or other entity profile. Used in detail/preview panes.

Structure:

1. **Banner** — 68px gradient strip, `--accent` → `--accent-h`, with radial-gradient highlights for texture.
2. **Avatar + verified strip** — avatar 58px overlaps the banner (margin-top: -28px), 3px white border. Verified pill on the right with checkmark if verified.
3. **Head** — name (18px 700) + subtitle meta line (13px `--text-3`).
4. **Tags** — flex-wrap row of pills.
5. **Body** — About paragraph + 2-column info grid (label + value pairs).

Whole card: `--r-xl` radius (10px), 1px `--divider` border, `--bg-app` fill, subtle 1px shadow for definition.

---

## Tables and data grids

Use `DataTable` when you need:
- 4+ data points per row
- Sortable or filterable columns
- Row-level actions (click to open detail, select for bulk action)

For 1–3 data points, use a list with `StepRow` or `StatStrip` instead — tables are heavy.

### Anatomy

```
┌────────────────────────────────────────────────────────────┐
│  NAME           STATUS       UPDATED        SCORE          │  ← header row (11px uppercase)
├────────────────────────────────────────────────────────────┤
│  Atlas project  ● Active     2 days ago     94/100         │  ← data row (13px)
│  Beta launch    ○ Draft      just now       —              │
│  Q4 review      ✓ Done       1 week ago     82/100         │
└────────────────────────────────────────────────────────────┘
```

- **Header:** 11px 600 uppercase `--text-3`, `--bg-sidebar` background, `1px --divider` bottom border. Sticky (position: sticky) for long tables.
- **Row:** 13px `--text-default`, 10px 14px padding, `1px --divider` bottom border. Last row has no border.
- **Clickable rows:** `cursor: pointer`, `--bg-hover` on hover. Never use a chevron inside the row — the whole row is the target.
- **Column widths:** Use `width` prop for fixed columns (status badges, dates). Last column takes remaining space.

### Column types

| Content type | Width | Alignment | Render notes |
|---|---|---|---|
| Name / title | 30–50% | Left | Font-weight 500, `--text-default` |
| Status | 100–120px | Left | Use `<Tag>` component |
| Date / timestamp | 120px | Right | `--f-mono` for alignment |
| Number / score | 80–100px | Right | `--f-mono` |
| Actions | 44px | Center | Icon-only `<Button variant="ghost">` |

### Row selection

For bulk actions (select + archive, select + assign), add a checkbox column:
- First column: 40px, centered `<Checkbox>` — no header label
- When rows are selected, `ActionBar` appears at the bottom with bulk actions
- "Select all" checkbox uses `indeterminate` state when some (not all) rows are selected

### Empty table

Always provide an `emptyState` prop with an `EmptyState` component:
```tsx
<DataTable
  columns={cols}
  rows={[]}
  emptyState={
    <EmptyState
      icon="📊"
      title="No data yet"
      description="Results will appear here once the process runs."
    />
  }
/>
```

### Mobile

Tables scroll horizontally on mobile. Pin the first column (name/title) so users keep context while scrolling:
```css
@media (max-width: 639px) {
  .table-th:first-child,
  .table-td:first-child {
    position: sticky;
    left: 0;
    background: var(--bg-app);
    z-index: 1;
  }
}
```

---

## Modals (desktop dialogs)

Mobile uses bottom sheets. Desktop uses centred modal dialogs.

Use modals for:
- Destructive action confirmation ("Delete this project?")
- Short form dialogs (≤4 fields)
- Decision gates that require focus before proceeding

**Never use modals for:**
- Complex multi-step flows — use a full page instead
- Informational content — use a Callout or side panel instead
- Anything triggered by hover or passive browsing

### Sizes

| Size | Width | Use |
|---|---|---|
| `sm` | 400px | Confirmations, 1–2 field forms |
| `md` | 520px (default) | Standard forms, decisions |
| `lg` | 680px | Detail views, multi-section forms |

### Anatomy

```
┌────────────────────────────────────┐
│  Modal title                   [×] │  ← modal-head (16px 600)
├────────────────────────────────────┤
│                                    │
│  Content area                      │  ← modal-body (scrollable)
│  (14px --text-2, line-height 1.6)  │
│                                    │
├────────────────────────────────────┤
│              [Cancel]  [Confirm →] │  ← modal-foot (right-aligned)
└────────────────────────────────────┘
```

- Backdrop: `rgba(0,0,0,0.35)` — same as mobile sheet
- Animation: fade + 12px upward slide, 200ms `--ease`
- Escape key must close the modal — wire `onKeyDown` to the root or use a focus trap
- Focus must be trapped inside the modal while open (use a library or the `inert` attribute on background content)

### Button order in modal footer

Always: **[secondary/cancel on left] [primary/destructive on right]**. The primary action is always the rightmost button.

```tsx
// Correct
<Modal title="Confirm deletion" onClose={close}
  footer={
    <>
      <Button variant="ghost" onClick={close}>Cancel</Button>
      <Button variant="danger" onClick={deleteProject}>Delete project</Button>
    </>
  }>
  <p>This will permanently delete Atlas and all its data.</p>
</Modal>
```

---

## Tooltips

Use tooltips to label icon-only buttons and clarify non-obvious controls. Never use them to convey critical information — if the user needs it to complete a task, put it in the UI, not a tooltip.

```tsx
// Icon-only button always needs a tooltip
<Tooltip content="Copy link" position="top">
  <Button variant="ghost" size="sm" aria-label="Copy link">
    <Dots />
  </Button>
</Tooltip>
```

### Rules
- Keep tooltip text under 60 characters. If it needs more, use a Callout instead.
- `position="top"` is the default and works in most cases. Use `bottom` for topnav items near the top edge.
- Never put interactive elements (links, buttons) inside a tooltip.
- Tooltips are hidden on touch devices — never put critical information in them.
- Delay: 0ms (appears immediately on hover). Disappears on mouse-out.

---

## Dropdown menus

Use `DropdownMenu` for contextual overflow actions (triggered by the `⋯` Dots icon button).

```tsx
const [open, setOpen] = React.useState(false);

<DropdownMenu
  open={open}
  onClose={() => setOpen(false)}
  items={[
    { label: 'Edit details', icon: <Pencil />, onSelect: edit },
    { label: 'Duplicate',    onSelect: duplicate },
    { separator: true },
    { label: 'Delete',       icon: <Cross />, danger: true, onSelect: confirmDelete },
  ]}>
  <Button variant="ghost" size="sm" onClick={() => setOpen(true)} aria-label="More actions">
    <Dots />
  </Button>
</DropdownMenu>
```

### Placement
The menu opens below and right-aligns to the trigger by default. If the trigger is near the right edge, it will clip — in that case, use `left: 0` on `.dropdown-menu` instead of `right: 0`.

### Item count
- **Minimum:** 2 items. If there's only one action, use a plain `Button` instead.
- **Maximum:** 8 items. If you need more, group them with separators or promote frequent ones to inline buttons.
- **Destructive items** always go last, separated by a `separator`.

### Keyboard
- Arrow keys navigate items
- Enter/Space selects focused item
- Escape closes the menu and returns focus to the trigger

---

## Empty states

Every list, table, and data panel needs an empty state. An empty state that only says "Nothing here" is broken — it leaves the user without a next action.

```tsx
// In a list panel
<EmptyState
  icon="📂"
  title="No projects yet"
  description="Create your first project to start tracking work."
  action={<Button variant="primary" icon={<Plus />} onClick={createProject}>New project</Button>}
/>

// In a search results area
<EmptyState
  icon="🔍"
  title="No results for "atlas""
  description="Try a different search term or clear the filters."
/>

// After an action completes (no action needed)
<EmptyState icon="✓" title="All caught up" />
```

### Copy rules
- **Title:** "No X yet" or "No X found" — noun phrase, not a sentence.
- **Description:** One sentence, max 80 characters. Explains what this space is for, or why it's empty.
- **Action:** Only include if creating something will fill the space. Never show "Refresh" as the only action.

### Icon choice
Use an emoji that represents the content type. Keep it simple:
- Files / projects → 📂
- Search results → 🔍
- Inbox → 📬
- AI / analysis → ✦ (Sparkle SVG preferred over emoji for AI contexts)
- All done / complete → ✓ or ✅

---

## Loading skeletons

Use skeletons (not spinners) when the layout is known but data is loading. Skeletons prevent layout shift and reduce perceived wait time.

```tsx
// Loading a profile card
<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
  <Skeleton variant="avatar" />
  <div style={{ flex: 1 }}>
    <Skeleton variant="title" width="140px" />
    <Skeleton variant="text" width="100px" />
  </div>
</div>

// Loading a data table (show 5 skeleton rows)
{isLoading && Array.from({ length: 5 }).map((_, i) => (
  <tr key={i}><td><Skeleton variant="text" /></td><td><Skeleton variant="text" width="80px" /></td></tr>
))}

// Loading a body paragraph
<Skeleton variant="text" lines={4} />
```

### Rules
- Use skeletons for content areas, not for buttons or navigation (those should be present immediately).
- Match the skeleton shape to the real content as closely as possible.
- Don't show a skeleton for less than 200ms — if data loads that fast, skip it and render directly.
- Use `lines` prop to render multi-line text skeletons (last line automatically renders at 60% width).
- Always respect `prefers-reduced-motion` — the shimmer animation is disabled automatically.
