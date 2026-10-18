---
name: ai-seo-geo
description: Technical SEO, AI Search Optimization (AEO), and Generative Engine Optimization (GEO) playbook. Use when auditing or implementing robots.txt for AI crawlers, llms.txt, Schema.org JSON-LD markup, XML sitemaps, IndexNow, semantic HTML, internal link architecture, Core Web Vitals, entity signals, or AI citation optimization.
---

# AI Search & Technical SEO Skill (SEO / AEO / GEO)

When this skill is active, apply this 20-point engineering and content playbook to ensure maximum discoverability, crawlability, and citation authority across both traditional search engines (Google, Bing) and AI answer engines (ChatGPT Search, Perplexity, Claude, Google AI Overviews).

---

## Phase 1: AI Crawler Access & Indexation (Points 1–4, 7, 15, 16)

### 1. Audit `robots.txt` for AI Crawler Access
Explicitly distinguish between **training scrapers** and **live search/citation bots**. Never accidentally block search/citation user-agents if you want visibility in AI answers.

```txt
# Allow AI Search & Citation Bots (Required for AEO/GEO visibility)
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# Optional: Control Foundation Model Training Scrapers separately
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

### 2. Verify AI Bots Access (WAF / CDN / Firewall)
- **Action**: Check Cloudflare, AWS WAF, Vercel Firewall, or reverse-proxy rules.
- **Standard**: Ensure "Bot Fight Mode" or "Block AI Bots" does not serve `403 Forbidden` or JS challenges to verified IPs of `OAI-SearchBot`, `PerplexityBot`, `ChatGPT-User`, or `Claude-Web`.
- **Verification**: Test using `curl -I -A "Mozilla/5.0 (compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot)" https://your-domain.com`. Expect `200 OK`.

### 3. Fix Crawlability and Indexation Issues
- **Status Codes**: Eliminate `5xx` server errors, unintended `4xx` responses on live routes, and redirect chains (>1 hop).
- **Meta Robots & Headers**: Verify indexable pages do not contain `<meta name="robots" content="noindex">` or `X-Robots-Tag: noindex` HTTP headers.
- **Crawl Budget**: Block faceted filter permutations, internal search results, and session-ID URLs from being crawled.

### 4. Validate XML Sitemap Coverage
- **Completeness**: Every canonical, `200 OK`, indexable page must appear in `sitemap.xml` (or a sitemap index).
- **Accuracy**: Exclude `301`/`302` redirects, `404`s, non-canonical URLs, and `noindex` pages.
- **Freshness**: Populate accurate `<lastmod>` ISO-8601 timestamps (`YYYY-MM-DDThh:mm:ss+00:00`) reflecting genuine content updates—never update timestamps on unchanged pages.

### 7. Fix Canonical Tags and Duplicate URLs
- **Self-Referencing Canonicals**: Every indexable page must include `<link rel="canonical" href="https://..." />` using an absolute URL.
- **URL Normalization**: Enforce a single canonical format across protocol (`https://`), subdomain (`www` vs non-`www`), trailing slashes, and lowercase paths via `301` permanent redirects.
- **Query Parameters**: Strip tracking parameters (`?utm_*`, `?gclid`, `?fbclid`) from canonical URLs.

### 15. Strengthen Crawl Signals with IndexNow
- **Real-Time Indexing**: Implement the **IndexNow** protocol to immediately notify Bing, Yandex, and participating AI search indexes (which rely heavily on Bing's index, such as ChatGPT Search) when URLs are created, updated, or deleted.
- **Implementation**:
  1. Host a verification key at `https://your-domain.com/{your-key}.txt`.
  2. Trigger a `POST https://api.indexnow.org/indexnow` webhook in CI/CD or CMS publish hooks with modified URLs.

### 16. Audit `llms.txt` (Experimental; Not a Ranking Guarantee)
- **Purpose**: Provide an inference-friendly Markdown index at `/llms.txt` (and optionally `/llms-full.txt`) so LLM agents and documentation crawlers can rapidly parse site structure without HTML noise.
- **Format Standard**:
  ```markdown
  # Project / Company Name

  > Concise 1-2 sentence summary of what the product/company does and who it serves.

  ## Core Documentation & Key Pages
  - [Getting Started](https://example.com/docs/getting-started): Quickstart guide and setup.
  - [Pricing & Plans](https://example.com/pricing): Tiered B2B pricing breakdown.
  - [API Reference](https://example.com/docs/api): REST endpoints, authentication, and webhooks.
  ```
- **Caveat**: Treat `llms.txt` as a supplementary developer/agent convenience—never as a replacement for clean semantic HTML, sitemaps, or Schema.org markup.

---

## Phase 2: Structured Data, Entities & Knowledge Graph (Points 5, 6, 8)

### 5. Implement Relevant Schema.org Markup (JSON-LD)
- **Format**: Always use `<script type="application/ld+json">` in the `<head>` or page body.
- **Page-Specific Types**: Match schema to page intent:
  - SaaS / Apps: `SoftwareApplication` or `WebApplication`
  - E-commerce / Pricing: `Product` with `Offer`
  - Guides / Docs: `Article`, `TechArticle`, or `HowTo`
  - Navigation hierarchy: `BreadcrumbList`
  - Q&A sections: `FAQPage`

### 6. Add `Organization`, `Article` & `Person` Schema
Connect your brand, content, and authors using `@id` node references in a unified JSON-LD `@graph`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Example Corp",
      "url": "https://example.com",
      "logo": "https://example.com/logo.png",
      "sameAs": [
        "https://www.linkedin.com/company/example",
        "https://github.com/example",
        "https://x.com/example"
      ]
    },
    {
      "@type": "Person",
      "@id": "https://example.com/authors/jane-doe#person",
      "name": "Jane Doe",
      "jobTitle": "Principal Security Architect",
      "url": "https://example.com/authors/jane-doe",
      "worksFor": { "@id": "https://example.com/#organization" },
      "sameAs": [
        "https://www.linkedin.com/in/janedoe",
        "https://github.com/janedoe"
      ]
    },
    {
      "@type": "Article",
      "@id": "https://example.com/blog/ai-seo#article",
      "headline": "Complete Guide to AI Search Optimization",
      "datePublished": "2026-01-15T08:00:00+00:00",
      "dateModified": "2026-08-20T10:30:00+00:00",
      "author": { "@id": "https://example.com/authors/jane-doe#person" },
      "publisher": { "@id": "https://example.com/#organization" },
      "mainEntityOfPage": "https://example.com/blog/ai-seo"
    }
  ]
}
```

### 8. Strengthen Entity Signals Across Your Site
- **Entity Consistency**: Use the exact same canonical naming for your brand, products, and core concepts across page titles, headings, Schema.org, and external profiles.
- **Disambiguation (`sameAs` & `about`)**: Link `Organization` and `Person` schemas to authoritative external registries (Wikipedia, Wikidata, Crunchbase, LinkedIn, GitHub) via `sameAs` arrays.
- **Subject Linking**: In `Article` schema, use `about` and `mentions` properties with Wikidata `@id` URIs to explicitly tell search engines which real-world entities your content covers.

---

## Phase 3: Rendering, Performance & Semantic HTML (Points 10, 11, 12)

### 10. Improve Core Web Vitals (CWV)
AI crawlers and search engines enforce strict fetch timeouts and reward fast-loading pages:
- **LCP (Largest Contentful Paint)**: `≤ 2.5s` — Preload hero images (`fetchpriority="high"`), inline critical CSS, and optimize server TTFB (`< 200ms`).
- **INP (Interaction to Next Paint)**: `≤ 200ms` — Break up long main-thread JS tasks, defer non-essential third-party scripts.
- **CLS (Cumulative Layout Shift)**: `≤ 0.1` — Explicitly set `width` and `height` (or `aspect-ratio`) on all images, videos, and embeds; reserve space for dynamic banners.

### 11. Remove Rendering Issues in JavaScript
- **Critical Rule**: Most AI crawlers (`OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`) **do not execute client-side JavaScript**. If your content requires React/Vue hydration in the browser before text appears in the DOM, AI bots see an empty `<div id="root"></div>`.
- **Solution**: Use Server-Side Rendering (SSR), Static Site Generation (SSG), or Incremental Static Regeneration (ISR) for all public content, documentation, marketing, and blog pages.
- **Verification**: Run `curl -s https://your-domain.com/page | grep "your target heading"`. Primary text, links (`<a href="...">`), and JSON-LD must exist in the raw initial HTML response.

### 12. Structure Content with Semantic HTML
LLMs chunk and extract web pages using DOM hierarchy. Replace `<div>` soup with semantic HTML5 elements:
- **Landmarks**: `<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<aside>`, `<footer>`.
- **Heading Hierarchy**: Exactly one `<h1>` per page. Nest `<h2`> $\rightarrow$ `<h3>` $\rightarrow$ `<h4>` strictly in order without skipping levels.
- **Extractable Data**: Use `<table>` (with `<thead>`, `<tbody>`, `<th>`) for comparisons and pricing; use `<dl>`/`<dt>`/`<dd>` for glossaries and specs; use `<ol>`/`<ul>` for steps and checklists.

---

## Phase 4: Site Architecture & Link Graph (Points 9, 17, 19)

### 9. Optimize Internal Link Architecture
- **Crawl Depth**: Every important page must be reachable within **$\le 3$ clicks** from the homepage.
- **Descriptive Anchor Text**: Use specific, entity-rich anchor text (e.g., `"read our PostgreSQL zero-downtime migration guide"`) — never use generic anchors like `"click here"`, `"read more"`, or `"link"`.
- **Crawlable Links**: Always use standard `<a href="/path">` tags. Never rely on `<span onClick={...}>` or `router.push()` without an underlying `href`.

### 17. Build Topical Authority with Content Clusters
- **Hub-and-Spoke Model**: Organize content into **Pillar Pages** (comprehensive overview of a core topic) and **Cluster Pages** (deep-dives into specific subtopics, edge cases, comparisons, and tutorials).
- **Bidirectional Linking**:
  - Every Pillar page links out to all of its child Cluster pages.
  - Every Cluster page links back up to its parent Pillar page and laterally to 2–3 related sibling Cluster pages.

### 19. Fix Orphan Pages and Broken Links
- **Orphan Pages**: Cross-reference `sitemap.xml` against an internal link crawl. Any indexable page with **0 incoming internal links** is an orphan and must be linked from relevant hubs, navigation, or category indexes.
- **Broken Links**: Audit all internal and external links regularly:
  - Replace internal links pointing to `301` redirects with the direct final destination URL.
  - Fix or remove any internal or outbound link returning `404` or `410`.

---

## Phase 5: Citation-Ready Content & E-E-A-T (Points 13, 14, 18, 20)

### 13. Add FAQ-Style Answers to Key Pages
- **Answer-First Formatting**: Phrase `<h2>`/`<h3>` headings as direct natural-language questions users ask LLMs (e.g., `"How does IndexNow improve ChatGPT Search indexing?"`).
- **Atomic Answer Block**: Immediately follow the heading with a concise, self-contained **40–60 word direct answer** before expanding into deeper technical detail. AI engines extract these self-contained blocks verbatim as citations.
- **Markup**: Wrap visible FAQ sections in semantic `<details><summary>` elements and pair with `FAQPage` JSON-LD schema where appropriate.

### 14. Include Original Data and Citations
- **Information Gain**: LLMs prioritize sources with high information gain over generic rewrites. Include original benchmarks, proprietary survey metrics, reproducible code snippets, or concrete numbers (e.g., `"reduced p95 latency from 420ms to 85ms"`).
- **External Citations**: Cite primary sources (RFCs, peer-reviewed papers, official documentation, standards bodies) using `<blockquote cite="...">` and direct outbound links.

### 18. Add Author Credentials and Source References
- **Byline & Bio**: Every article or guide must display a visible author byline, publication date, last-updated date, and a bio summarizing real-world credentials and domain expertise (E-E-A-T).
- **Reviewer Attribution**: For high-stakes technical, security, financial, or medical topics, add a `"Technically reviewed by [Name, Role]"` attribution and map it to `reviewedBy` in `Article` schema.

### 20. Monitor AI Citations and Referral Traffic
- **Referral Analytics**: Track incoming traffic and conversions in analytics by segmenting `referrer` domains matching AI answer engines:
  - `chatgpt.com` (and `utm_source=chatgpt.com`)
  - `perplexity.ai`
  - `claude.ai`
  - `copilot.microsoft.com`
  - `gemini.google.com`
- **Server Log Auditing**: Monitor access logs for user-agents (`OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-Web`, `Applebot-Extended`) to verify which pages AI engines are actively fetching and grounding answers on.

---

## Quick Audit Checklist (Pass / Fail)

When asked to run an AI SEO / GEO audit on a codebase or live site, evaluate all 20 items and report status:

- [ ] **1. `robots.txt`**: Allows `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Claude-Web`, `Googlebot`, `Bingbot`.
- [ ] **2. Bot Access**: WAF/CDN does not return `403` or CAPTCHA to AI search bots.
- [ ] **3. Indexation**: No unintended `noindex` tags/headers, `5xx`/`4xx` errors, or redirect chains.
- [ ] **4. XML Sitemap**: Valid `sitemap.xml` with only `200 OK` canonical URLs and accurate `<lastmod>`.
- [ ] **5. Schema.org**: Valid JSON-LD markup matching page type (`SoftwareApplication`, `Product`, `FAQPage`, `BreadcrumbList`).
- [ ] **6. Core Entities**: `Organization`, `Article`, and `Person` schemas linked via `@id`.
- [ ] **7. Canonicals**: Self-referencing `<link rel="canonical">` and strict URL normalization (`https`, trailing slash).
- [ ] **8. Entity Signals**: Consistent brand/product naming + `sameAs` links to authoritative external profiles.
- [ ] **9. Internal Links**: Important pages $\le 3$ clicks from home; descriptive anchor text in `<a href>`.
- [ ] **10. Core Web Vitals**: LCP $\le 2.5\text{s}$, INP $\le 200\text{ms}$, CLS $\le 0.1$.
- [ ] **11. JS Rendering**: Primary content, links, and metadata rendered in initial SSR/SSG HTML without requiring client JS.
- [ ] **12. Semantic HTML**: Proper `<main>`, `<article>`, `<section>`, single `<h1>`, sequential `<h2>`–`<h4>`, `<table>` for data.
- [ ] **13. FAQ Answers**: Question-based headings followed immediately by 40–60 word direct answer blocks.
- [ ] **14. Original Data**: Concrete metrics, benchmarks, original tables, and primary source citations included.
- [ ] **15. IndexNow**: Key hosted and ping webhook configured for instant Bing / AI search index updates.
- [ ] **16. `llms.txt`**: Clean Markdown index at `/llms.txt` pointing to core docs and canonical pages.
- [ ] **17. Content Clusters**: Hub-and-spoke pillar/cluster pages with bidirectional internal links.
- [ ] **18. Author E-E-A-T**: Visible author credentials, `datePublished`/`dateModified`, and source references.
- [ ] **19. Orphans & 404s**: Zero orphan pages in sitemap; zero broken internal/external links.
- [ ] **20. AI Telemetry**: Analytics segments configured for `chatgpt.com`, `perplexity.ai`, `claude.ai` referrals and bot log monitoring.
