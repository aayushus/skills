---
name: performance-standards
description: The binding standards for performance — budgets and targets, measurement, frontend performance, Core Web Vitals, bundle strategy, rendering, mobile constraints, network strategy, API performance, database performance, caching, async work, AI performance, observability, review process, anti-patterns, and the pre-ship checklist. Performance is a feature; this doc is the contract.
---

# Performance Standards

**Version 2.0** · Last updated 1 July 2026

This is the binding performance standard. Slow software loses users, burns money on infrastructure, and invites scale problems that compound. Performance is a feature; treating it as an afterthought is how systems end up needing expensive rewrites. Deviations require an ADR (see [README.md](README.md) §3 and §19 below).

This doc is a **companion** to [Architecture.md](Architecture.md) (system shape), [Security.md](Security.md) (defences), and [Code-Quality.md](Code-Quality.md) (craft). Performance overlaps all three — when they conflict, treat each doc's specifics as canonical in its own domain.

**Core stance:** slow is a bug. Every team has a performance budget, explicit or implicit. Making it explicit lets you ship; leaving it implicit lets it erode until the product feels broken.

> **See also:** [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.4 — reviewer checklist for performance-affecting changes | [Architecture.md](Architecture.md) §6, §7 — database design and async patterns | [Security.md](Security.md) §5 — rate limiting as a security control | [Code-Quality.md](Code-Quality.md) §14 — code-craft-level performance (N+1, don't-guess) | [README.md](README.md) — pack stance and ADR process

---

## Changelog

**v2.0 (1 July 2026):**

* **Renamed to "Performance Standards"** for pack terminology consistency.
* **Added YAML frontmatter** for skill loading.
* **Added the pack-wide changelog + cross-link block + ADR clause (§19).**
* **Cross-references updated to Architecture.md v2.0 numbering.** Where the previous version referred to "architecture §10 Security defaults" or "§11 AI service integration", those are now §12 and §13 respectively (Architecture renumbered when Disaster Recovery and Scaling Timeline were promoted from orphan sections to numbered §10 and §11). Also updated "security §14.4" → "security §15.4" for the AI-specific section (Security.md was renumbered when Third-party vendor assessment and Penetration testing were promoted to numbered sections).
* **Stack-specific code examples moved to Appendix A.** The previous version included React-specific JSX with `memo`/`useMemo`/`useCallback`, Prisma `include`/`select` code, web-vitals JS library usage, Vite bundle analyser YAML, TypeScript+Redis cache-aside pattern, and Anthropic-SDK streaming code inside the normative body. These are now in Appendix A as illustrations; the body states the rules in stack-agnostic language. Postgres-specific SQL stays in the body because Postgres is the pack's canonical database (per Architecture.md); other DB engines translate to their equivalent.
* **§10 API performance deduplicated against Architecture.md.** N+1 avoidance and pagination cursor pattern were duplicated between here and Architecture §5.6 / §6. Now: Architecture owns the *strategy* (cursor pagination as a rule); this doc owns the *performance angle* on top (why offset pagination breaks under concurrent writes, wire-response shape discipline). Cross-referenced.
* **§13 Async work** now short — it references Architecture §7 as canonical, keeps only the performance-specific bits (batching, worker concurrency, priority).
* **§14 AI performance** rewritten to be model-tier-agnostic — the previous version named specific models (Haiku, Gemini Flash, Sonnet, GPT-4o, Opus, o1) in the tiering table. Now the table is by capability tier; specific model names are in Appendix A.
* **§19 (new) "Deviating from this standard"** — pack-wide ADR clause. Budget changes specifically require an ADR because they're a contract, not a preference.
* **Kept everything else substantively.** This doc was already strong; most edits are structural / cross-reference / packaging, not content.

---

## Table of contents

1. [Principles](#1-principles)
2. [Budgets and targets](#2-budgets-and-targets)
3. [Measurement](#3-measurement)
4. [Frontend performance](#4-frontend-performance)
5. [Core Web Vitals](#5-core-web-vitals)
6. [Bundle and asset strategy](#6-bundle-and-asset-strategy)
7. [Rendering performance](#7-rendering-performance)
8. [Mobile constraints](#8-mobile-constraints)
9. [Network strategy](#9-network-strategy)
10. [API performance](#10-api-performance)
11. [Database performance](#11-database-performance)
12. [Caching](#12-caching)
13. [Async and background work](#13-async-and-background-work)
14. [AI performance](#14-ai-performance)
15. [Observability for performance](#15-observability-for-performance)
16. [Performance review process](#16-performance-review-process)
17. [Anti-patterns](#17-anti-patterns)
18. [Pre-ship checklist](#18-pre-ship-checklist)
19. [Deviating from this standard](#19-deviating-from-this-standard)
20. [Appendix A — Stack-specific illustrations](#appendix-a--stack-specific-illustrations)

---

## 1. Principles

Seven principles, in priority order.

**1.1 Measure, then optimise — in that order.** Every performance intuition is wrong until proven. The bottleneck is almost never where you think. Profile, measure, find the real hot spot. The time spent on a well-targeted fix beats days of speculative optimisation.

**1.2 Speed is a feature, not a task.** Performance is not "we'll optimise before launch". It's a constraint that shapes every PR. A feature that ships 100ms slower than the budget permits is not a completed feature — it's a feature with a known bug.

**1.3 Budgets over targets.** A target is a dream; a budget is a contract. Set budgets, enforce them in CI, reject PRs that blow them. "Let's try to keep it fast" is how products become slow one compromise at a time.

**1.4 The cheapest work is no work.** The fastest query is the one you didn't run. The fastest render is the one that didn't happen. Before optimising how something executes, ask if it needs to execute at all. Caching, deduplication, and lazy loading beat micro-optimisation.

**1.5 Latency over throughput for user-facing work.** A user waiting for a button to respond doesn't care about your 10k RPS capacity. Optimise p99 response time for requests a human is blocking on. Optimise throughput only where humans aren't in the loop.

**1.6 Costs compound.** A 50ms slowdown in a commonly-called function adds up to minutes of human-wait-time per day across a user base. A 10KB bundle increase is thousands of extra MB of bandwidth per day. Small costs, at scale, aren't small.

**1.7 Premature optimisation is still bad.** Everything above doesn't justify optimising before you have a problem. Measure first. Optimise when the profile says to, not when you have a hunch. Code written clearly and boringly outperforms clever code that's harder to reason about, because clear code gets optimised correctly when the time comes.

---

## 2. Budgets and targets

Every product has performance budgets. These are the defaults — override per-project via ADR when there's a reason, but don't silently drift.

### 2.1 User-facing interaction budgets

| Interaction | Budget | Notes |
| --- | --- | --- |
| Perceived instant | < 100ms | Click feedback, hover, input response |
| UI transition | < 200ms | Page change, modal open, tab switch |
| Acceptable wait | < 1s | Most API calls the user is waiting on |
| Progress indicator required | > 1s | Show spinner / skeleton / progress bar |
| User disengages | > 10s | Anything this slow must be async with notification on completion |

These aren't targets — they're the thresholds at which users perceive the system differently. Past each line, the experience changes.

### 2.2 Core Web Vitals targets

The three Google CWV metrics, measured at the 75th percentile across real users (field data, not lab):

| Metric | Good | Needs improvement | Poor |
| --- | --- | --- | --- |
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5s–4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200ms–500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |

Ship target: **Good on all three**. Enforced in CI where possible (Lighthouse or equivalent) and monitored in production via real-user monitoring (RUM).

### 2.3 Bundle budgets

| Asset | Budget | Notes |
| --- | --- | --- |
| Initial JS (gzipped) | ≤ 170KB | Hard cap; anything larger blocks LCP on slow networks |
| Initial CSS (gzipped) | ≤ 30KB | Often underrated; big CSS files block render |
| Initial font payload | ≤ 100KB | Subset, preload critical, woff2 only |
| Initial HTML | ≤ 30KB | Server-rendered content only |
| Any single image (above fold) | ≤ 100KB | Next-gen format (AVIF / WebP), responsive sizing |
| Total weight for first meaningful paint | ≤ 500KB | On a ~1.6 Mbps connection this is ~2.5s |

If a route legitimately needs more, it's not the default route — load it async when the user navigates there.

### 2.4 API response time budgets

Measured at the server, not including network latency.

| Route type | p50 | p95 | p99 |
| --- | --- | --- | --- |
| Read (single resource, cache-eligible) | < 50ms | < 200ms | < 500ms |
| Read (list, paginated) | < 100ms | < 300ms | < 800ms |
| Write (single resource) | < 100ms | < 300ms | < 1s |
| Search / filter | < 200ms | < 500ms | < 1s |
| Complex aggregation | < 500ms | < 1.5s | < 3s |

p99 breaching for > 5 minutes is an alert. Slow queries hiding in the long tail are how systems degrade gracelessly under load.

### 2.5 Database query budgets

Any single query:

* < 10ms for indexed point lookups
* < 50ms for small list queries
* < 200ms for list queries with joins
* < 500ms for the slowest analytical queries

Anything > 500ms in the hot path is either an async job (§13) or a redesign candidate.

### 2.6 Enforcement

* **CI budgets** — bundle size, Lighthouse CI (or equivalent) fail the build on regression.
* **Production alerts** — p95 / p99 exceeded, CWV regression, DB query threshold.
* **PR review** — reviewers check the budgets are respected (see [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.4).

Budget changes are ADR-worthy (§19). "We're relaxing the JS bundle to 200KB because ..." is a decision, not a preference.

---

## 3. Measurement

### 3.1 Real user monitoring (RUM) over lab data

**Lab data** (Lighthouse local, synthetic tests) is useful for regression checks and CI, but it doesn't reflect real user experience. **Field data** (RUM) reflects actual devices, networks, and behaviour.

Use both:

* **Lab (CI)** — catches regressions before they ship. Fast, deterministic, controlled.
* **Field (production)** — tells you the truth about the p75 user. Sample real interactions; aggregate to percentiles.

If they diverge (lab is green, field is red), the lab environment is wrong — usually too fast a CPU or too fast a network. Recalibrate CI to a realistic mid-tier device profile.

### 3.2 What to measure

**Frontend:**

* CWV (LCP, INP, CLS) — always
* TTFB, FCP, TBT — for diagnosis
* Long tasks per session — regression flag
* JS error rate — perf failure often shows as errors first
* Route-level render time — where is the slow page?

**Backend:**

* Per-route p50/p95/p99 latency
* Per-query duration (slow query log)
* Cache hit rate per key pattern
* Queue depth, job duration, DLQ entry rate
* External API latency per dependency

**AI:**

* Latency per model, per operation
* Tokens per call (input, output, cached)
* Cost per tenant per day
* Fallback rate (primary → smaller model)

### 3.3 Percentiles, not averages

An average hides the tail; the tail is where users churn.

* **p50** — the median. Most users see this or better.
* **p95** — 5% of users see this or worse.
* **p99** — 1%. That's still thousands per day at 100k MAU.

Report percentiles. Alert on percentiles. Optimise on percentiles.

### 3.4 Profiling, not speculation

For a suspected hot spot, profile before optimising:

* **Node.js** — `clinic`, `0x`, the built-in `--inspect` profiler.
* **Python** — `py-spy`, `cProfile`.
* **Database** — `EXPLAIN ANALYZE`, slow query log.
* **Frontend** — Lighthouse, browser devtools performance tab.

The profile shows where the time is actually going. Fix that. Don't guess.

### 3.5 A/B testing performance changes

For non-trivial performance changes, run an A/B test if you can:

* Baseline vs improved variant, half the users each.
* Measure the metric that matters (CWV, task completion, conversion — not just latency).
* Run for a week minimum to average out day-of-week effects.
* If the improved variant isn't measurably better, revert. Complexity added for no gain is net loss.

---

## 4. Frontend performance

### 4.1 The critical rendering path

Everything that happens between "user typed URL" and "user sees content":

1. DNS lookup
2. TCP + TLS handshake
3. Initial HTML request (TTFB)
4. Parse HTML, discover assets (CSS, JS, fonts, images)
5. Fetch and parse blocking resources
6. First render
7. JavaScript hydration (if SSR)
8. Interactive

Every step is a chance to be slower than the budget. Every step is a chance to optimise. Diagnose one step at a time.

### 4.2 Render where it's fastest

Different rendering strategies suit different needs:

| Strategy | Latency | Freshness | Use for |
| --- | --- | --- | --- |
| Static (SSG) | Fastest | Build-time | Marketing, docs, long-form content |
| Server rendering (SSR) | Fast | Real-time | Authenticated app views |
| Client rendering (CSR) | Slowest to first paint | Real-time | Highly interactive tools after the initial load |
| Incremental static (ISR) | Fast + cached | Configurable | Semi-dynamic pages (product listings, dashboards) |

The default for a B2B app is SSR (or islands of interactive CSR on top of SSR). Pure CSR is a last resort — LCP suffers, SEO suffers, non-JS crawlers see nothing.

### 4.3 Rendering framework defaults

Whatever framework the project uses, the default should be:

* SSR for authenticated pages, SSG for marketing.
* Minimal client JS on marketing pages.
* Explicit hydration boundaries — don't hydrate what doesn't need interactivity.
* Streaming SSR where the framework supports it (start sending HTML before the whole page is ready).

### 4.4 JavaScript budget

The initial JS bundle is a hard budget (§2.3): **170KB gzipped**. Every KB over budget is a real user-experience cost.

Techniques to stay in budget:

* Route-based code splitting — each route loads only what it needs.
* Lazy-load heavy libraries (charts, rich text editors, code editors).
* Tree-shake aggressively — ESM libraries, `"sideEffects": false` where safe.
* Audit heavy dependencies quarterly (§6.4).
* Prefer native browser APIs when available (`fetch` over `axios`, `Intl.DateTimeFormat` over `moment.js`).

### 4.5 CSS performance

* **Critical CSS inline in the HTML head** — everything visible above the fold. Rest is loaded async.
* **CSS-in-JS runtime cost** — some libraries add serious runtime overhead. Prefer static extraction (Vanilla Extract, Panda) over runtime (styled-components) for perf-sensitive routes.
* **Avoid `@import`** in CSS — it serialises requests.
* **Utility CSS** (Tailwind and equivalents) is fine — the runtime cost is zero; the build produces plain CSS.

### 4.6 Fonts

Font loading is the most-overlooked perf lever.

* **`font-display: swap`** so text renders immediately with a fallback, then swaps to the custom font.
* **Preload critical fonts** with `<link rel="preload" as="font" crossorigin>`.
* **Subset fonts** to the languages actually used — a full CJK font is 5MB; the subset is 100KB.
* **`woff2` only**. Every browser supports it since 2020. No `ttf`, no `eot`, no `woff1`.
* **Local first** — use `local()` in `@font-face src` so the browser can use a user-installed version if available.

### 4.7 Images

* **Next-gen formats** — AVIF or WebP with fallback. 50-80% smaller than JPEG at the same quality.
* **Responsive sizing** — `srcset` for multiple resolutions. Never ship a 4K image to a mobile phone.
* **Explicit dimensions** on every `<img>` — prevents CLS. `width` and `height` attributes even for responsive images.
* **Lazy load below-the-fold** with native `loading="lazy"`. Eager-load above-the-fold.
* **Compress aggressively** — target visual quality, not file size. Modern encoders (`sharp`, `libvips`) do this well.

### 4.8 Preload, prefetch, preconnect

* **`preconnect`** — start DNS + TCP + TLS for critical origins before you need them. Use for the API origin and the CDN origin.
* **`preload`** — the browser fetches high-priority resources immediately. Use for critical fonts, above-the-fold images referenced from CSS.
* **`prefetch`** — low-priority; fetch when idle. Use for next likely navigation.
* **`modulepreload`** — for ES modules the browser will need soon.

Don't over-preload — it competes with other resources for bandwidth. Preload only the truly critical ones.

### 4.9 Third-party scripts

Third-party JS (analytics, chat widgets, tag managers) is the most common source of perf regressions.

**Rules:**

* Every third-party script has a documented reason. If nobody remembers why it's there, it goes.
* Load async or defer — never blocking. Analytics never blocks the render.
* Sandboxed in an iframe when possible — isolates their perf and security impact.
* Audited quarterly — some tags get slower over time (they add features you didn't ask for).

Marketing / product / analytics teams don't get to add tags without review. This is a common cause of "the app got slow but nobody changed the code."

### 4.10 Service workers and offline

For repeat visitors, a service worker can cache the shell and serve it instantly. For collaborative or offline-tolerant apps, they enable offline mode.

Rules:

* Every SW deployed has an update strategy (skip waiting on next load, or explicit user prompt).
* Cache versioning is mandatory — old caches are purged on new SW activation.
* Serve stale content only when explicitly acceptable — no financial data, no permission checks.
* Test the update path as much as the caching path.

---

## 5. Core Web Vitals

Fixed metrics, backed by user data, tied to search ranking. Ship "good" on all three.

### 5.1 LCP (Largest Contentful Paint)

Time until the largest above-the-fold element renders.

**Budget: ≤ 2.5s at p75.**

Common causes of poor LCP:

* Slow TTFB (fix backend / CDN first)
* Render-blocking JS / CSS in the head
* Late-discovered images (lazy-loaded above the fold, or loaded from CSS)
* Large image files
* Slow custom fonts blocking text

Fixes:

* Server-render the LCP element in the HTML
* Preload the LCP image
* Prioritise the LCP image with `fetchpriority="high"`
* Move render-blocking scripts to `defer` or `async`

### 5.2 INP (Interaction to Next Paint)

Longest interaction delay across the session — how responsive the app feels.

**Budget: ≤ 200ms at p75.**

Common causes:

* Long JS tasks blocking the main thread
* Expensive React (or equivalent) re-renders on state changes
* Synchronous work in event handlers
* Hydration cost right after page load

Fixes:

* Break up long tasks — `scheduler.postTask` or `setTimeout(0)` between chunks
* Memoise heavy components
* Move heavy work off the main thread (Web Workers)
* Debounce / throttle high-frequency events

### 5.3 CLS (Cumulative Layout Shift)

Sum of unexpected layout shifts. Text moving because a font loaded, ads pushing content down, images arriving without dimensions.

**Budget: ≤ 0.1 at p75.**

Fixes:

* Explicit `width` / `height` on every `<img>`, `<video>`, `<iframe>`
* Reserve space for lazy-loaded content (skeleton, placeholder)
* Avoid injecting content above existing content
* `font-display: swap` with a fallback font that's metrically similar

### 5.4 TTFB (Time to First Byte)

Not technically a CWV but gates LCP. **Budget: ≤ 800ms.**

Backed by: CDN, server-side rendering performance, database query speed. If TTFB is slow, every other frontend metric is capped. Fix TTFB first.

### 5.5 Other vitals worth tracking

* **FCP (First Contentful Paint)** — first render of anything. Budget: ≤ 1.8s.
* **TTI (Time to Interactive)** — page fully interactive. Budget: ≤ 3.8s on 4G.
* **Total Blocking Time (TBT)** — lab proxy for INP. Budget: ≤ 200ms.
* **Speed Index** — visual completeness over time. Lower is better.

### 5.6 Measuring in production

Use the `web-vitals` library (or equivalent) to instrument CWV in production. Ship metrics to your aggregator via `navigator.sendBeacon` or `keepalive: true` fetch so they survive page unload.

Aggregate to percentiles by route, device type, country. Alert on p75 regression.

Illustrative JS in Appendix A.

---

## 6. Bundle and asset strategy

### 6.1 Code splitting

Single-bundle architectures don't scale. Split by:

* **Route** — each route only loads what it needs. Framework-native in most modern frameworks.
* **Heavy component** — charts, rich text editors, code editors. Lazy load on mount with the framework's dynamic-import primitive.
* **Rare interaction** — export-to-PDF, bulk import, admin tools. Load on button click, not on initial page.

**Rules:**

* Every heavy library imported once and only once across the bundle. Dedupe at the bundler level.
* Shared chunk extraction — common code across routes goes in a shared chunk that's cached independently.
* Don't over-split — hundreds of tiny chunks have their own overhead (HTTP/2 multiplexing is not infinite; browser parallel-request limits still apply).

### 6.2 Bundle analysis

Every project has bundle analysis running as part of the build.

Run it locally when shipping anything non-trivial. Inspect the flame graph for surprises — a date library taking 80KB, a single icon library sending all its icons, an entire language pack for one locale.

Budget enforcement in CI: fail the build when the bundle exceeds the budget from §2.3.

### 6.3 Tree shaking

Bundlers eliminate dead code — but only if imports are written in a tree-shakeable way. Import only what you use; avoid libraries that have side effects on import (register global plugins, patch prototypes).

Mark `"sideEffects": false` in `package.json` for libraries that genuinely have no side-effectful imports.

### 6.4 Heavy dependency audit

Quarterly: run bundle analysis, identify the top 10 largest dependencies, ask for each:

1. Is it actually used?
2. Is it used heavily or for one function? (If one function, inline it.)
3. Is there a lighter alternative?

Common heavy offenders and their lighter alternatives:

| Heavy | Light |
| --- | --- |
| `moment.js` (~230KB) | `date-fns` (tree-shaken, ~20KB) or native `Intl.DateTimeFormat` |
| `lodash` (~70KB) | `lodash-es` tree-shaken to 2-5KB, or native |
| `axios` (~17KB) | Native `fetch` (0KB) |
| Full `react-icons` | Individual icon imports, or custom SVG set |
| `jquery` | Modern DOM APIs (0KB) |
| `immutable.js` | Native `structuredClone` or `immer` (smaller) |
| Full charting libraries | Modular imports from `chart.js`, or a lightweight like `recharts` submodules |

### 6.5 Compression

* **Brotli** on the server — 15-20% better than gzip for text. Every modern CDN supports it.
* **Pre-compress static assets** (build-time Brotli) so the server doesn't re-compress on every request.
* **Gzip as fallback** for very old clients.
* **No compression on images** (already compressed) or small assets under 1KB (overhead outweighs savings).

### 6.6 HTTP caching for static assets

* **Immutable assets** (hashed filenames): `Cache-Control: public, max-age=31536000, immutable` — cached forever.
* **Mutable assets** (non-hashed, e.g. `index.html`): `Cache-Control: public, max-age=0, must-revalidate` — always revalidated.
* **API responses**: case-by-case (see §12).

All modern bundlers produce hashed filenames by default. Use them. Never deploy with mutable asset URLs.

---

## 7. Rendering performance

### 7.1 The 16ms frame budget

60fps means a frame every 16.67ms. 120Hz means 8.33ms. The browser needs to run JS, calculate styles, lay out elements, paint, and composite — all within the frame budget. Anything longer drops frames. Users notice at 3+ dropped frames.

**Rules:**

* Long tasks > 50ms block the main thread — break them up.
* Synchronous work in event handlers must finish in < 100ms for responsive INP.
* Animations use `transform` and `opacity` (compositor-only, no layout).

### 7.2 UI framework render performance

The most common frontend performance bug: rendering way more than needed. This applies whether you're using React, Vue, Svelte, Solid, or anything else — the mechanics differ per framework, but the discipline is the same.

**Rules:**

* **Memoise pure, expensive components.** Don't memoise cheap ones — memoisation has its own cost.
* **Move state down.** State at the root re-renders the whole tree on change. Push state to the smallest component that needs it.
* **Derive, don't duplicate.** Compute derived values during render, don't sync them into state via effects.
* **Split heavy lists with virtualisation.** Lists over ~200 items use a virtualisation library.
* **Use the framework's non-urgent update mechanism** for lower-priority state changes so higher-priority updates can interrupt.

Illustrative React code (memo, useMemo) in Appendix A.

### 7.3 Avoid unnecessary state

Every piece of state triggers re-renders. Alternatives:

* **Refs** for values that don't drive the UI (timers, DOM references, mutable counters)
* **Derived values** computed during render, not stored
* **URL state** for things that should survive reload or be linkable (filters, search)
* **Context sparingly** — cross-tree values (theme, current user), but note context re-renders all consumers

### 7.4 List rendering

Every list item has a stable, unique key. Never use array index as key for lists that can reorder — it confuses the framework's reconciliation.

For long lists:

* **Virtualise** anything over ~200 items.
* **Paginate or infinite-scroll** anything over ~1000 backing items.
* **Don't render what the user can't see** — content inside a closed modal / drawer / accordion mounts only when opened.

### 7.5 Animations

Animations that stay on the compositor layer (not involving layout or paint) are free. Animations that trigger layout hurt.

**Cheap** (compositor-only): `transform: translate / scale / rotate`, `opacity`, `filter`.

**Expensive** (triggers layout or paint): `top` / `left` / `width` / `height` (use `transform` instead), `color` / `background-color` (triggers paint, unavoidable), box shadows animating on large elements.

**Rules:**

* Use CSS animations / transitions when possible; they can run on the compositor off-main-thread.
* For JS-driven animation, use `requestAnimationFrame`, not `setTimeout`.
* For complex animations, use a mature library (Framer Motion, GSAP) rather than hand-rolled — they handle edge cases and batching.

### 7.6 Forced reflows

The classic perf trap: reading a layout property forces the browser to flush pending layout calculations.

**Reads that trigger reflow:** `offsetWidth`, `offsetHeight`, `getBoundingClientRect`, `scrollTop`, computed styles.
**Writes:** anything setting dimensions or position.

Never mix reads and writes in a loop. Batch reads first, then batch writes.

### 7.7 Main-thread offloading

For genuinely heavy work (parsing large JSON, image processing, encryption, compression):

* **Web Workers** — move work off the main thread. Use Comlink for a simpler API.
* **OffscreenCanvas** — canvas rendering off the main thread.
* **WASM** — for hot loops, image codecs, crypto. Wins over JS when the work is measurably CPU-bound.

Don't reach for workers by default — the message-passing overhead kills the win for small tasks. Profile first.

---

## 8. Mobile constraints

Mobile is the default for most users. Design for it first; desktop is the "better" case.

### 8.1 The mobile baseline

Assumed device: mid-range Android, 2-3 years old:

* **CPU**: ~1/4 the performance of a high-end desktop
* **RAM**: 3-4GB, heavily shared with OS and other apps
* **Network**: intermittent 4G, variable latency
* **Battery**: every CPU cycle costs; screen-on time matters
* **Thermal throttling**: after a few seconds of heavy work, CPU clocks down

If your app works well here, it'll fly on everything else. If you only test on a high-end laptop, you've been designing for the top 10% of users.

### 8.2 JavaScript on mobile

JS is 2-5× slower on mobile than desktop. Every 100ms of desktop JS is 200-500ms of mobile JS, blocking the main thread the whole time.

**Rules:**

* Bundle sizes matter **more** on mobile (parse time is CPU-bound).
* Long tasks feel worse (animation dropped frames, unresponsive taps).
* Hydration cost is much higher — minimise client components.

### 8.3 Touch targets and interaction

* **Minimum 44×44 CSS pixels** for any tappable target (WCAG 2.5.8).
* **300ms tap delay** is gone on modern browsers with proper viewport meta, but test — some older hybrid apps still have it.
* **Avoid hover-only UI** — touch devices have no hover. Hover reveals must also appear on tap or be non-essential.

### 8.4 Network assumptions

* **High latency** — RTT on mobile is often 100-300ms vs 10-30ms on broadband.
* **Intermittent connectivity** — handle offline gracefully, queue writes, show connection state.
* **Data caps** — every MB matters. Compress everything. Defer what you can.
* **Connection type detection** — use `navigator.connection` to adapt. On 2G/3G/slow-4G, serve lower-res images, defer non-critical requests, skip auto-playing video.

### 8.5 Memory

Mobile browsers kill tabs aggressively when memory is tight. Once killed, your users start over from scratch.

* **Don't accumulate state** — offload large datasets to IndexedDB when not actively needed.
* **Clean up event listeners** in cleanup / unmount hooks.
* **Unmount heavy components** when not visible — don't just hide with CSS.
* **Watch for memory leaks** — devtools profilers have memory tabs; use them.

### 8.6 Battery

Battery-draining patterns:

* Polling loops with short intervals (use WebSockets / SSE instead).
* Geolocation in watch mode (use it sparingly).
* Constantly-running animations (pause when not visible: `IntersectionObserver`).
* Wake locks held longer than needed.

Use the **Page Visibility API** to pause work when the tab isn't visible.

### 8.7 Testing on real devices

Devtools mobile emulation is useful but lies about CPU throttling and network. For real testing:

* **WebPageTest** — free, runs on real mobile devices in various regions.
* **BrowserStack / Sauce Labs** — paid, broader device coverage.
* **Actual devices** — keep a cheap Android phone around for real testing. Not optional.

Lighthouse CI's mobile preset uses 4× CPU throttling and 150ms RTT — a reasonable mid-range baseline. Use it to catch regressions.

### 8.8 iOS Safari specifics

Safari has quirks worth knowing:

* **Autoplay restrictions** — video won't autoplay without `muted` attribute.
* **100vh bug** — full-height elements extend under the URL bar; use `100dvh` (dynamic viewport height) instead.
* **Focused input zoom** — any `<input>` with `font-size < 16px` triggers a zoom on focus; always 16px minimum.
* **Scroll behaviour** — `overflow: auto` has different inertia than other browsers; test on real devices.
* **Date / time inputs** — native picker is different from Chrome; don't assume UI consistency.

### 8.9 Mobile web vs native

Mobile web is the right default for B2B tools. Users hit your URL from email; they don't install apps. But:

* For power users who use it daily: consider a PWA with installability (adds home-screen icon, offline, push notifications).
* For consumer-grade frequency: native app is often worth the investment, but not before PMF.

---

## 9. Network strategy

### 9.1 HTTP/2 and HTTP/3

Both are table stakes. Multiplexing, header compression, server push (H/2 only; deprecated in H/3 for the `103 Early Hints` pattern). Your CDN handles this — verify it's enabled.

### 9.2 Connection reuse

Each new HTTPS connection is a DNS lookup + TCP handshake + TLS handshake — often 300-500ms on mobile. Reuse connections aggressively:

* **Same origin for API and assets** where possible — one connection serves everything.
* **preconnect** for origins you know you'll hit (§4.8).
* **Keep-alive** on backend HTTP clients — reuse sockets instead of reconnecting per request.

### 9.3 Request batching and deduplication

Multiple parallel requests for the same data are wasteful. Dedupe at the client layer.

A query cache (React Query, SWR, TanStack Query, or your framework's equivalent) handles this natively: two components asking for the same resource share one in-flight request.

For server-side batching (combining multiple backend calls into one), see GraphQL or BFF patterns — but those add complexity you usually don't need. Client-side dedup covers 80%.

### 9.4 Pagination on the wire

Always cursor-paginated (see [Architecture.md](Architecture.md) §5.6 and [API-Design.md](API-Design.md) §3.2). For UX:

* **Infinite scroll** for browse-style pages (feed, search results).
* **Explicit pagination** for analytical tables where the user wants to navigate.
* **Prefetch the next page** when the user is near the end — pre-warms the cache.

### 9.5 WebSockets and SSE

For real-time data:

* **Server-Sent Events (SSE)** — simpler, unidirectional. Great for push notifications, live activity feeds, streaming AI responses.
* **WebSockets** — bidirectional, lower overhead for frequent messages. Use for collaborative editing, live chat, real-time dashboards.
* **Polling as a last resort** — adaptive polling (back off when no changes) if you can't deploy WS/SSE.

**Rules:**

* Reconnect with exponential backoff + jitter.
* Heartbeat every 30s to detect dead connections.
* Handle offline gracefully (queue messages, sync on reconnect).
* Scope subscriptions tightly (not "all tenant events" — "this record's events").

### 9.6 GraphQL (if used)

Not a default — see [Architecture.md](Architecture.md) §5.1. If used:

* **Batching and dedup** at the client (Apollo, urql, Relay all support this).
* **Field selection discipline** — don't over-fetch because "the component might need it".
* **Persisted queries** — pre-register queries at build time; runtime sends only the ID (smaller requests, faster parsing, security gate).
* **Avoid N+1 with DataLoader** — always. Every GraphQL resolver touching DB uses DataLoader.

---
## 10. API performance

### 10.1 The N+1 query trap

The single most common backend perf bug. Loading a list, then making one DB call per item.

**Rules:**

* Use the ORM's include / select mechanism (or SQL `JOIN` when raw) to fetch related data in one query.
* For REST endpoints: use an `expand` (or similar) query-param pattern for embedded related resources; fetch them in one query on the backend.
* For GraphQL: DataLoader, always.

**Detection:**

* Watch DB query logs in development — if one HTTP request fires 50 queries, you have an N+1.
* Add a query-count assertion middleware in integration tests for critical routes.

Illustrative Prisma pattern in Appendix A.

### 10.2 Pagination

Covered as strategy in [Architecture.md](Architecture.md) §5.6 (cursor, never offset) and as wire format in [API-Design.md](API-Design.md) §3.2. The performance angle: offset pagination is O(N) on the database (the engine reads and discards rows before returning any), and breaks under concurrent writes (rows reorder mid-scroll). Cursor pagination is O(log N) on an indexed sort column and stable under concurrent writes.

### 10.3 Response shape discipline

Every byte in the response is a byte the client downloads, parses, and processes. Don't send data the client doesn't use.

* **Select only needed fields** — ORM `select`, SQL explicit columns. Never `SELECT *` in production paths.
* **Don't leak internal IDs** users don't care about (auto-increment bigints, legacy FKs).
* **Don't leak denormalised data** that blows up response size (embedded full-user objects on every row when all you need is `userId` and `userName`).
* **Compress at the HTTP layer** — every response > 1KB passes through gzip / brotli.

### 10.4 Connection pooling

Database connections are expensive to establish. Pool them.

* Single client per process with a pool (typical size 10-20).
* Don't create a new client per request — connection setup is 10-50ms.
* For serverless: connection pooling is harder (every cold start is a new pool). Use a transaction-mode pooler (PgBouncer or a hosted equivalent) as a shared pool.

See [Architecture.md](Architecture.md) §6.11 for Postgres specifics.

### 10.5 Query timeouts

Every database query has a timeout. No exceptions.

Rationale: a query that never returns holds the connection, which backs up the pool, which causes every other request to wait. One slow query at 3am takes down the whole service. Timeout and fail fast.

### 10.6 Batch endpoints for bulk operations

One endpoint that does 100 things beats 100 separate endpoint calls.

**Rules:**

* Cap at 100 items per batch (prevents abuse).
* Return per-item results (which succeeded, which failed, why).
* Transactional within the batch when possible.
* Idempotency keys per batch, not per item.

### 10.7 Write amplification

A single user action that writes to 10 tables means 10 queries, 10 transaction participants, 10 audit log entries. Common, often necessary, but expensive.

* **Batch writes** where possible — `createMany`-style bulk inserts.
* **Defer non-critical writes** to async jobs (audit enrichment, denormalisation).
* **Question every side effect** — does this write happen on every call, or only in specific cases?

### 10.8 Rate limiting

Covered in [Security.md](Security.md) §5 and [Architecture.md](Architecture.md) §5.10. Rate limits are both a security and a performance control — they protect the server from overload, not just from abuse.

---

## 11. Database performance

Postgres is the pack's canonical database (per [Architecture.md](Architecture.md) §6). Rules here use Postgres SQL as the worked example; other engines translate to equivalent primitives.

### 11.1 Every query hits an index

Non-negotiable. Any query that performs a sequential scan on a table with > 1,000 rows is a bug. Verify with `EXPLAIN`.

Look for:

* `Index Scan` or `Index Only Scan` — good.
* `Seq Scan` — bad (on large tables).
* `Rows Removed by Filter` — indicates the index isn't covering the filter.

### 11.2 Composite index column ordering

Covered in [Architecture.md](Architecture.md) §6.6. Summary: leading column is the most selective equality filter (usually `tenant_id`); range / sort columns last.

### 11.3 Covering indexes

When a query's SELECT list is small and stable, include those columns in the index so the index itself answers the query (no table lookup needed):

```sql
CREATE INDEX idx_records_cover
   ON records.records (tenant_id, status)
INCLUDE (id, name, created_at);
```

This is an **Index Only Scan** — the fastest thing Postgres can do.

### 11.4 Partial indexes

For filtered queries, partial indexes shrink the index size and improve hit rates:

```sql
CREATE INDEX idx_records_active
   ON records.records (tenant_id, status, created_at DESC)
WHERE deleted_at IS NULL;
```

Partial indexes are usually 5–20× smaller than full indexes, with the same hit rate for the filtered query.

### 11.5 Index hygiene

Indexes are not free:

* Every write (INSERT / UPDATE / DELETE) updates every affected index.
* Indexes consume disk space.
* Indexes sit in the buffer cache, competing with table pages.

**Rules:**

* Drop unused indexes quarterly. Check with `pg_stat_user_indexes` — indexes with `idx_scan = 0` aren't being used.
* Don't over-index — every index is a write-time cost. Aim for the minimum set that covers your queries.
* Create indexes `CONCURRENTLY` in production migrations ([Architecture.md](Architecture.md) §6.10).

### 11.6 Slow query log

Enable and monitor:

* **Dev:** log queries > 50ms.
* **Staging:** > 100ms.
* **Production:** > 500ms (any slower query is investigated).

`pg_stat_statements` tracks aggregate query performance. Enable it and query for the slowest queries by total time — the top of that list is where perf work should focus.

### 11.7 EXPLAIN ANALYZE every production query

Before a new query hits production:

1. Run `EXPLAIN (ANALYZE, BUFFERS)` against production-size data.
2. Check for Sequential Scans on large tables.
3. Check for sort operations on large result sets.
4. Check buffer hit ratio.
5. Check estimated vs actual row counts (bad estimates mean stale stats).

`EXPLAIN` on 100 rows lies. Always test against realistic data volumes. Keep an anonymised production snapshot for this purpose.

### 11.8 JSONB performance

JSONB columns are flexible but can be slow.

**Rules:**

* **Index paths you query often** — GIN indexes on the whole JSONB or expression indexes on specific paths.
* **Don't use JSONB for queryable structured data** — if you filter / sort on a field, make it a column.
* **Keep JSONB size reasonable** — < 100KB per row typically. Larger is a redesign hint.

### 11.9 Transactions

Keep them short. A transaction holds locks; the longer held, the more contention.

**Rules:**

* Don't make external HTTP calls inside a transaction — API latency blocks the lock.
* Don't do heavy computation inside a transaction — compute first, transact last.
* Don't hold transactions across user interaction — never "open transaction, show dialog, commit on submit".

Pattern: gather data + compute outside the transaction; do the writes and audit entries inside; commit; enqueue side effects to the outbox (see [Architecture.md](Architecture.md) §7.3) for the worker to pick up asynchronously.

### 11.10 Lock contention

Row-level locks contend when:

* Many concurrent updates to the same row (a hot counter).
* Long-held advisory locks.
* Serialisable isolation where queries conflict.

Fixes:

* **Don't increment counters synchronously** — use background aggregation or a cache counter, periodically synced.
* **Use `SELECT ... FOR UPDATE SKIP LOCKED`** for work-queue-style patterns in SQL (workers pulling work without blocking each other).
* **Set lock timeouts** to fail fast rather than wait forever.

### 11.11 Vacuum and bloat

Postgres MVCC means deleted / updated rows stay on disk as dead tuples until vacuumed. Heavy write workloads produce bloat — tables grow larger than their live data.

* **Autovacuum is on by default** — verify it's not disabled.
* **Tune `autovacuum_vacuum_scale_factor`** for high-write tables (default 0.2 = 20% bloat before vacuum; tune down for busy tables).
* **Monitor bloat** via `pg_stat_user_tables` or `pgstattuple` extension.
* **Run `VACUUM ANALYZE` manually after bulk operations** — migrations, backfills, large deletes.

### 11.12 Read replicas

When a single Postgres can't keep up with read traffic, add a replica.

* **Use for:** analytical queries, reporting, search, cross-tenant scans.
* **Don't use for:** reads that must be fresh (replication lag is typically 10-100ms, sometimes seconds).
* **Route queries explicitly** — don't let "auto-routing" ORMs decide; they get it wrong.

Before adding a replica, check: is the primary actually CPU-bound, or could you fix the hottest queries and buy another 6 months?

---

## 12. Caching

Caching is the most powerful perf tool and the most dangerous — stale caches are a bug factory.

### 12.1 Only cache what measurably matters

Don't cache because "caching is good". Cache because the profile shows a hot spot.

**Pre-caching checklist:**

1. Is this path measurably slow?
2. Is the data idempotent or safe to be stale?
3. What's the cache invalidation strategy?
4. What happens when the cache is cold?

If you can't answer all four, you're not ready to cache.

**Decision tree — should this be cached?**

```
Is this data read significantly more often than it changes?
  └─ No (write-heavy) → Don't cache. Invalidation cost outweighs benefit.
  └─ Yes → Continue ↓

Is the computation or query expensive (> 50ms)?
  └─ No (fast query, simple computation) → Don't cache unless traffic is very high.
  └─ Yes → Continue ↓

Can you tolerate stale data for some period?
  └─ No (balances, live inventory, permission checks) → Don't cache, or cache with TTL ≤ 5 seconds.
  └─ Yes → Continue ↓

Is the data scoped to a single user/tenant, or shared across many?
  └─ Single user/tenant → Cache per-tenant with tenant ID in the cache key.
  └─ Shared → Cache globally. High impact. Confirm invalidation strategy before proceeding.

→ ✓ Cache. Document: cache key structure, TTL, invalidation trigger.
```

**Cache key structure rules:** always scope to tenant + version to prevent cross-tenant data leaks. Example: `{tenantId}:{resource}:{id}:v{CACHE_VERSION}`.

**TTL guide:**

| Data type | Recommended TTL | Invalidation trigger |
| --- | --- | --- |
| Permission checks | 30–60 seconds | Role / permission change event |
| User profile | 5 minutes | Profile update event |
| Dashboard aggregates | 5–15 minutes | Underlying data write |
| Plan / billing limits | 1 hour | Billing event |
| Static reference data | 24 hours | Admin update |
| AI-generated content | Until explicitly invalidated | User requests refresh |

**Never cache:** authentication tokens, active session state (use a shared session store, not application cache), financial transaction records, raw PII without explicit review.

### 12.2 Caching layers

| Layer | Use | TTL |
| --- | --- | --- |
| Browser HTTP cache | Static assets (hashed) | Forever (`max-age=31536000, immutable`) |
| Browser HTTP cache | HTML, API responses | Short or revalidate (`max-age=0, must-revalidate`) |
| CDN | Static, semi-dynamic pages | Minutes to hours |
| Edge runtime (ISR) | Personalised-per-region | Minutes |
| Application memory (in-process LRU) | Per-process hot data | Seconds to minutes |
| Shared cache (Redis or equivalent) | Shared hot data | Seconds to hours |
| Database buffer cache | Auto | — |

Each layer has different invalidation characteristics. Pick the right one for the data.

### 12.3 Cache-aside pattern

The default pattern: look up in cache; on miss, fetch from source and populate the cache with a TTL.

**Rules:**

* Always have a TTL — infinite caches leak memory and serve stale data.
* Invalidate on write — belt and braces with TTL.
* Never cache PII or sensitive fields at a shared layer — tenant-scoped keys at minimum.
* Key includes tenant ID — catches tenant-leakage bugs.

Illustrative code in Appendix A.

### 12.4 Cache stampedes

When a hot cache key expires, thousands of concurrent requests all miss and hammer the database simultaneously. Defences:

* **Request coalescing** — if a miss is already in flight, other requests wait on it.
* **Probabilistic early expiry** — refresh cache before it expires, spread across time.
* **Soft TTL + hard TTL** — soft miss triggers background refresh while serving stale; hard miss requires fresh.

### 12.5 Invalidation strategies

> "There are only two hard things in computer science: cache invalidation and naming things."

Patterns:

1. **TTL only** — simplest; data can be stale up to TTL. Fine for read-heavy, write-rare data.
2. **Write-through** — update cache when the DB updates. Keeps in sync but adds latency to writes.
3. **Write-back** — writes go to cache, flushed to DB async. Risky; data can be lost.
4. **Event-driven invalidation** — DB write triggers an event, cache consumers delete their entries. Handles distributed cases.

For most cases: **TTL + explicit invalidation on write from the same service**. Cross-service invalidation via the outbox / event bus when needed.

### 12.6 HTTP caching for APIs

```
Cache-Control: private, max-age=60
ETag: "abc123"
Last-Modified: Tue, 01 Jul 2026 10:00:00 GMT
```

* `private` — browser caches, CDN doesn't (for authenticated responses).
* `public` — both cache (for truly public content).
* `max-age` — seconds to cache.
* `ETag` / `If-None-Match` — conditional request, server returns 304 if unchanged.
* `stale-while-revalidate` — serve stale while fetching fresh in background (great for non-critical freshness).

`Cache-Control: private, max-age=0, stale-while-revalidate=60` is a strong default for authenticated API reads.

### 12.7 CDN caching

Static assets: cache at CDN forever (hashed filenames prevent stale).

For dynamic content: use CDN with short TTL (e.g., 30s) and surrogate keys (or cache tags) for targeted invalidation:

```
Cache-Control: public, max-age=30
Surrogate-Key: record-01H... tenant-01H...
```

On record update, purge `record-01H...` at the CDN level. All cached responses tagged with that key get invalidated. Most modern CDNs support this pattern.

### 12.8 Client-side query caching

Client query caches (React Query, SWR, TanStack Query, or equivalent) cache API responses in memory by default. Configure for:

* **`staleTime`** — how long data is considered fresh (no refetch).
* **`gcTime`** — how long unused data stays in memory.
* **Refetch on window focus** — on by default; turn off for expensive queries.
* **Optimistic updates** — write to cache immediately, reconcile with server response.

### 12.9 Caching AI responses

AI calls are expensive and slow. Cache aggressively when the prompt is deterministic:

* **Cache by prompt hash + model + temperature** — if the inputs are identical, serve cached.
* **Scope per tenant** — cross-tenant cache hits leak data.
* **Short TTL** for context-dependent prompts (hours); longer for truly static (classification of fixed enums).
* **Don't cache** high-variance, time-sensitive, or per-user personalised outputs.

See §14 for more.

---

## 13. Async and background work

Async architecture is covered in [Architecture.md](Architecture.md) §7 — job design, outbox pattern, idempotency, retries, backoff. This section covers the performance-specific angle.

### 13.1 If it can be async, it should be

Any operation > 200ms that a user is blocking on should consider becoming async with a job record + polling / webhook pattern. The exception: operations where the response value is needed immediately (e.g., the ID of the thing just created). Those stay sync, but the *side effects* (emails, webhooks, notifications) go async.

### 13.2 Job batching

Instead of one job per item, batch when possible. Batches process faster per-item but retry behaviour changes (whole batch retries vs individual). Choose per case.

### 13.3 Worker concurrency

Queue workers have a concurrency setting — how many jobs process in parallel per worker.

**Rules:**

* Start with 10; tune based on downstream bottleneck (usually DB pool or external API).
* Separate worker pools per job type — a slow AI job shouldn't starve the email queue.
* Monitor queue depth — if it grows unboundedly, scale workers or rate-limit producers ([Architecture.md](Architecture.md) §8.5).

### 13.4 Job priority

Most queues support priorities. Use sparingly — too many priority levels is complexity without value. Two (high / normal) is usually enough.

* User-facing: higher priority.
* Background (daily reports, aggregations): lower priority.
* Retries: original priority, not "retry priority".

---

## 14. AI performance

AI has different performance characteristics from traditional code:

* Latency varies wildly (1s to 60s).
* Cost per call is non-trivial.
* Caching is partial (semantic similarity, not exact match).
* Output quality varies with model, prompt, temperature.

### 14.1 All AI work is async (reminder)

Already in [Architecture.md](Architecture.md) §13.2. Never block an HTTP handler on an AI call. Always queue.

### 14.2 Streaming

For user-facing AI output, stream tokens as they arrive — perceived latency is far better even if total time is identical. Use SSE (`Content-Type: text/event-stream`) or WebSockets. SSE is simpler.

Frontend renders tokens as they arrive. Use a ref-backed text buffer or the framework's streaming primitives to avoid re-rendering on every token.

Illustrative streaming code in Appendix A.

### 14.3 Model selection by latency / cost

Not every AI call needs the largest model. Tiered approach — the specific model in each tier is a project choice (see Appendix A for representative examples):

| Task | Model tier |
| --- | --- |
| Classification, simple extraction | Small / fast |
| Summary, rewriting, coding | Medium |
| Complex reasoning, long context | Largest |

Fallback pattern: on timeout or rate-limit from the largest model, retry with the medium; on medium fail, degrade to a cached response or a "come back later" flow.

### 14.4 Prompt caching

Modern LLM APIs support prompt caching — repeated prefixes (system prompts, few-shot examples, long context) are cached server-side at the provider, cutting latency and cost.

* **Structure prompts with cache-friendly prefixes** — static context first, dynamic user input last.
* **Use the provider's cache flag** where supported.
* Savings: often 50–90% cost reduction on the cached portion, 30–80% latency reduction.

### 14.5 Semantic caching

For queries that are similar-but-not-identical, a vector-similarity cache beats exact-match:

1. Hash query → embed → search cache for similar embeddings.
2. If similarity > threshold (e.g., 0.95), return cached response.
3. Otherwise, call LLM, cache result.

Non-trivial — maintain a cache DB, embed on every query. Use when cost savings justify the complexity (high-volume, common queries).

### 14.6 Batching

If multiple items need similar AI processing, batch them into one prompt: fewer calls, more total context, usually a net win on latency and cost.

### 14.7 Token budget per tenant

Covered in [Security.md](Security.md) §15.4. Performance angle: a runaway AI loop can burn a large amount of money in an hour. Per-tenant daily caps prevent this.

---

## 15. Observability for performance

Can't optimise what you don't see.

### 15.1 Real-time dashboards

Essential dashboards, available to the team always:

1. **Frontend RUM** — CWV percentiles by route, device, geography.
2. **API latency** — p50 / p95 / p99 per route.
3. **Database** — slow query list, connection pool saturation, cache hit ratios.
4. **Queues** — depth, processing time, DLQ entries.
5. **AI** — latency, cost, token usage per tenant.
6. **Errors** — 5xx rate, 4xx rate, unhandled exceptions.

Dashboards live in the org's chosen tool (Grafana, Datadog, etc.). Make them visible — a TV in the office, a chat channel posting daily snapshots, whatever works.

### 15.2 SLOs and error budgets

For each user-facing surface:

* **SLI** (Service Level Indicator): measurable signal (p95 latency, error rate, availability).
* **SLO** (Service Level Objective): target for the SLI (99.9% availability, p95 < 300ms).
* **Error budget**: the allowed deviation from SLO (0.1% = 43 minutes/month of downtime).

When error budget is exhausted for the quarter, stop shipping features and focus on reliability. This is how you prevent "we'll fix it later" from becoming "we never fix it".

Start simple: one SLO per surface. Add more as needed.

### 15.3 Alerts on performance regressions

Specific alert examples:

* p95 latency on any route > budget for 5 minutes.
* CWV regression > 10% on any route for 24h.
* Queue depth > threshold for 10 minutes.
* Error rate > 1% for 5 minutes.
* Slow query log entries > 100 / hour.

Alert fatigue is the enemy. Fewer, better alerts that are always actionable.

### 15.4 Weekly perf review

Dedicate 30 minutes per week to perf review:

1. What regressed this week? Why?
2. What's the slowest thing in production right now?
3. Are any SLOs approaching budget?
4. Any surprising entries in the slow-query log?
5. What's the biggest unresolved perf issue?

This is engineering hygiene, not a stakeholder meeting. 30 minutes prevents weeks of cleanup.

### 15.5 Flamegraphs in production

Continuous profiling tools (Pyroscope, Parca, monitoring vendors' equivalents) sample running processes and build flamegraphs from real traffic. Invaluable when "profile it locally" doesn't reproduce.

At larger scale this is worth the setup. At small scale, on-demand profiling is enough.

---

## 16. Performance review process

Performance isn't a one-off project — it's a discipline.

### 16.1 When to invest in performance

* **Before launch** — establish budgets, hit CWV targets.
* **When users complain** — listen. Perception of slowness is real even if metrics look fine.
* **When budgets are breached** — CI or production alerts.
* **Before scale milestones** — if you expect 10× traffic, prove the system can handle it before it arrives.
* **Quarterly** — bundle audit, slow query review, dependency audit.

### 16.2 Performance as part of PR review

See the pre-ship checklist (§18) and [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.4. Performance considerations in every review:

* Does this add to bundle size? By how much?
* Does this add new queries? Indexed?
* Does this add synchronous external calls to hot paths?
* Does this add unbounded loops, recursion, or collection growth?

### 16.3 Load testing

Before shipping something with traffic assumptions:

* Write a load test scenario (k6, Artillery, Locust, or equivalent).
* Run against staging at expected peak traffic + 50%.
* Observe: error rate, latency, resource saturation.
* Fix anything that breaks before going live.

Load tests aren't a one-off — make them repeatable and run regularly (weekly or per-release).

### 16.4 Performance regressions are bugs

When performance regresses, file a bug. Assign it. Track it to resolution. "It got 200ms slower but still works" is a bug with a countdown timer — left unfixed, it compounds.

---

## 17. Anti-patterns

Things that look fast and aren't.

### 17.1 Over-caching

Symptom: every DB call wrapped in a cache, cache invalidation scattered everywhere, hard to reason about staleness.

Reality: caching adds complexity. Only cache paths that are measurably slow AND safe to stale.

### 17.2 Micro-optimising in hot loops that aren't hot

Symptom: `++i` instead of `i++`, replacing `map` with for-loops in places that run 10 times.

Reality: profile first. The 10-iteration loop doesn't matter. The thousands-of-renders component does.

### 17.3 "It's fine in dev"

Symptom: everything's fast on localhost with 10 rows of test data.

Reality: performance problems scale with data. Test against production-size data, on production-representative hardware. Otherwise you're measuring your laptop, not your product.

### 17.4 Bundle.min.js "optimisation"

Symptom: shipping a 3MB bundle and blaming the network.

Reality: the problem is what's in the bundle, not how it's compressed. Analyse, split, remove.

### 17.5 "We'll add the index later"

Symptom: shipping a query that does a seq scan because "the table is small now".

Reality: tables grow. Add the index in the same migration as the query. Indexes are cheap; missing indexes at 10M rows are catastrophic.

### 17.6 Loops of network calls

Symptom: "for each item, call the API".

Reality: batch. If the API doesn't support batching, fix the API. N × RTT is the single cheapest thing to fix and the single most common perf bug.

### 17.7 The "we have a CDN" excuse

Symptom: the app is slow. "But we have a CDN, so it's fine."

Reality: CDN fixes static asset distribution, not your 800KB JS bundle or your 2s API call. CDNs help but don't absolve architecture choices.

### 17.8 Hot loops with async / await

Symptom: `for (const x of huge) { await doThing(x); }` sequentially.

Reality: this is sequential, not parallel. Use `Promise.all` (if no dependencies), a concurrency-limited variant like `p-map` (for controlled parallelism), or `for await` streams for ordered processing.

### 17.9 Forgotten cache keys with user data

Symptom: cache key is `/api/orders` — everyone's orders, one cache entry.

Reality: cache keys include tenant, user, query params. Shared cache keys are a data-leak bug.

### 17.10 Polling for real-time

Symptom: client polls every 5s "just in case something changed".

Reality: 99% of polls return nothing. Massive waste of client battery, server CPU, bandwidth. Use SSE or WebSockets for push.

### 17.11 Lazy-loading the first thing the user sees

Symptom: hero image, above-the-fold — `loading="lazy"`.

Reality: lazy-load delays the most important render. Eager-load above-the-fold, lazy-load below-the-fold.

### 17.12 Synchronous layout in animations

Symptom: animating `width` / `top` / `margin-left`, jerky on mobile.

Reality: use `transform` and `opacity` only. Anything else triggers layout / paint per frame.

---

## 18. Pre-ship checklist

Before merging any PR that could affect performance. This is the **author's** checklist. The reviewer's version with severity-ladder guidance is [Code-Review-Playbook.md](Code-Review-Playbook.md) §4.4.

### Frontend

* [ ] Bundle analyser run — no unexpected bloat
* [ ] Lighthouse CI (or equivalent) passes — CWV green on affected routes
* [ ] Images: next-gen format, lazy-loaded below fold, explicit dimensions
* [ ] No render-blocking third-party scripts added on critical path
* [ ] Heavy components lazy-loaded or behind interaction
* [ ] No new CSS-in-JS runtime added to critical render
* [ ] Animations use transform / opacity only
* [ ] New state is scoped to the smallest component that needs it
* [ ] Lists with > 200 items virtualised
* [ ] No `localStorage` / synchronous storage calls in event handlers

### API

* [ ] New endpoints have p95 budget met under load test
* [ ] No N+1 queries (verified in DB log)
* [ ] Response shape is lean — only necessary fields
* [ ] Pagination is cursor-based
* [ ] New DB queries `EXPLAIN`d against prod-sized data
* [ ] External calls have timeouts
* [ ] Slow operations (> 1s) moved to async jobs

### Database

* [ ] New queries hit an index — verified with EXPLAIN
* [ ] Composite index column order is correct
* [ ] Indexes created `CONCURRENTLY` in the migration
* [ ] No new unbounded-size JSONB fields
* [ ] Transactions kept short; no external calls inside
* [ ] Unused indexes removed

### Caching

* [ ] Caches have TTLs
* [ ] Cache keys scoped to tenant / user where appropriate
* [ ] Invalidation strategy documented
* [ ] Cold-start behaviour acceptable

### Mobile

* [ ] Tested on real mid-range Android device OR Lighthouse mobile profile
* [ ] Tap targets ≥ 44 × 44
* [ ] Inputs ≥ 16px font-size (no iOS zoom)
* [ ] Works on slow-4G emulation
* [ ] Visible on small screens (320px width)
* [ ] Safe-area insets respected

### AI (if applicable)

* [ ] AI calls are async (never blocking HTTP)
* [ ] Streaming used for user-facing AI output
* [ ] Model selection appropriate for the task's latency / cost budget
* [ ] Prompt structured for cache-friendly prefixes
* [ ] Per-tenant token budget enforced
* [ ] Fallback model / graceful degradation on failure

### Observability

* [ ] New routes emit latency metrics
* [ ] New queries emit query metrics
* [ ] New background jobs emit duration / error metrics
* [ ] Alerts configured for new critical paths

If every box is ticked: ship. If any are unticked: fix before merge.

---

## 19. Deviating from this standard

Standards in this pack are binding ([README.md](README.md) §3). Real projects find real reasons to deviate — a specific route with a legitimately-larger bundle, a legacy query that can't be optimised without a rewrite, a customer contract with a different SLO. When you deviate:

1. **Write an ADR** using [TEMPLATE-Decision.md](TEMPLATE-Decision.md). State which budget or rule you're deviating from, why, and what the trade-off is.
2. **Get review** from a principal engineer.
3. **Link the ADR** from the project's `docs/adr/` index and from the PR that introduces the deviation.
4. **Revisit** during the quarterly pack review.

**Budget changes specifically require an ADR.** Budgets are contracts, not preferences. "We're relaxing the JS bundle budget from 170KB to 220KB because ..." is a decision, not a note.

Deviations without an ADR are review blockers.

---

## Appendix A — Stack-specific illustrations

The main body of this doc uses stack-agnostic phrasing. This appendix contains concrete illustrations for common stacks (JavaScript / TypeScript / React / Prisma / Postgres). Illustrations are not normative.

### A.1 Web Vitals instrumentation (JS)

```js
import { onCLS, onINP, onLCP, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics({ name, value, id, rating }) {
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({ name, value, id, rating, url: location.pathname }),
    keepalive: true,  // sends on page unload
  });
}

onCLS(sendToAnalytics);
onINP(sendToAnalytics);
onLCP(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);
```

### A.2 Lazy-load in React with Suspense

```tsx
const PdfExporter = lazy(() => import('./PdfExporter'));

function Toolbar() {
  const [exporting, setExporting] = useState(false);
  return (
    <>
      <Button onClick={() => setExporting(true)}>Export PDF</Button>
      {exporting && (
        <Suspense fallback={<Spinner />}>
          <PdfExporter onDone={() => setExporting(false)} />
        </Suspense>
      )}
    </>
  );
}
```

### A.3 useMemo for expensive derivation

```tsx
function Dashboard({ orders }) {
  const total = useMemo(
    () => orders.reduce((sum, o) => sum + computeTotal(o), 0),
    [orders]
  );
  return <div>{total}</div>;
}
```

### A.4 Prisma include vs N+1

```ts
// ✗ N+1
const records = await db.record.findMany({ where: { tenantId } });
for (const r of records) {
  r.attachments = await db.attachment.findMany({ where: { recordId: r.id } });
}

// ✓ 2 queries total
const records = await db.record.findMany({
  where: { tenantId },
  include: { attachments: true },
});
```

### A.5 Cache-aside pattern (TypeScript + Redis)

```ts
async function getRecord(id: string, tenantId: string): Promise<Record | null> {
  const key = `${tenantId}:record:${id}:v3`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const record = await db.record.findUnique({ where: { id, tenantId } });
  if (record) {
    await redis.set(key, JSON.stringify(record), 'EX', 300);  // 5min TTL
  }
  return record;
}
```

### A.6 Streaming AI output (server side, SSE)

```ts
for await (const chunk of anthropic.messages.stream(request)) {
  res.write(`data: ${JSON.stringify(chunk)}\n\n`);
}
```

### A.7 Concurrency-limited parallelism

```ts
// ✗ sequential
for (const id of ids) {
  await process(id);
}

// ✓ parallel with concurrency limit
import pMap from 'p-map';
await pMap(ids, process, { concurrency: 10 });
```

### A.8 Adapt to slow networks

```js
const conn = navigator.connection;
if (conn?.saveData || conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g') {
  // Serve lower-fidelity experience
}
```

### A.9 Page Visibility API to pause work

```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pausePolling();
    pauseAnimations();
  } else {
    resumePolling();
    resumeAnimations();
  }
});
```

### A.10 Model tier examples (illustrative, current at July 2026)

| Task | Illustrative model |
| --- | --- |
| Classification, simple extraction | Claude Haiku 4.5, Gemini 2.5 Flash |
| Summary, rewriting, coding | Claude Sonnet 4.6, GPT-5 mini |
| Complex reasoning, long context | Claude Opus 4.7, GPT-5 |

Model landscape changes fast — check the current tier at Appendix review time. Never hardcode a model name in the normative body of this doc.

---

*Owner: Gaurav Bhatnagar · Next review: 1 October 2026*
