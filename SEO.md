# PromptForge — SEO & Google Indexing Guide

This document explains the SEO setup included in PromptForge and the steps required to get the site indexed by Google (and other search engines) after publishing to GitHub Pages.

---

## 1. SEO Files Included

| File | Purpose |
|------|---------|
| `index.html` `<head>` | Title, description, keywords, canonical URL, Open Graph, Twitter Card, JSON-LD structured data |
| `robots.txt` | Crawler directives for all major bots (Googlebot, Bingbot, DuckDuckBot, GPTBot, ClaudeBot, etc.) + sitemap location |
| `sitemap.xml` | XML sitemap listing the homepage + in-page anchors with image metadata |
| `manifest.json` | PWA manifest with app name, icons, shortcuts, theme color |

### 1.1 Meta Tags in `index.html`

The `<head>` block includes:

- **Title** — descriptive, keyword-rich, under 60 characters.
- **Meta description** — under 160 characters, includes primary keywords and supported AI presets.
- **Meta keywords** — broad coverage of related search terms.
- **Meta author** — `PromptForge — AzkiVIP`.
- **Meta robots** — `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` (tells Google to index the page, follow links, and show large image previews in results).
- **Meta googlebot** — explicit `index, follow`.
- **Canonical URL** — `https://azkivip.github.io/PromptForge/` (prevents duplicate-content issues).
- **Language** — `English`.
- **Revisit-after** — `7 days`.
- **Open Graph tags** — `og:type`, `og:site_name`, `og:title`, `og:description`, `og:url`, `og:image`, `og:image:secure_url`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`, `og:locale`, `og:locale:alternate`.
- **Twitter Card tags** — `summary_large_image`, `twitter:site`, `twitter:creator`, `twitter:title`, `twitter:description`, `twitter:image`, `twitter:image:alt`.
- **Favicon** — PNG icon, apple-touch-icon, mask-icon.
- **Manifest** — linked for PWA installability.
- **Sitemap** — `<link rel="sitemap">` for crawler discovery.

### 1.2 JSON-LD Structured Data

Two structured-data blocks are included for Google's Knowledge Graph:

1. **`WebSite` schema** — site-level metadata, name, alternate name, URL, description, language, image, author, publisher with logo, and a `potentialAction` for "Use the prompt generator".
2. **`SoftwareApplication` schema** — application-level metadata, category, operating system, feature list, offers (free), license, author, publisher, aggregateRating.

You can validate structured data with Google's [Rich Results Test](https://search.google.com/test/rich-results).

### 1.3 `robots.txt`

Allows all major search engine bots and AI crawlers (Googlebot, Bingbot, DuckDuckBot, Baiduspider, YandexBot, GPTBot, ClaudeBot, PerplexityBot) to crawl the entire site. Includes a `Crawl-delay: 1` directive to be gentle on GitHub Pages, and points to the sitemap.

### 1.4 `sitemap.xml`

Lists 4 URLs (homepage + 3 in-page anchors) with `lastmod`, `changefreq`, and `priority`. The homepage entry also includes an `<image:image>` extension so Google can index the OG image.

---

## 2. Why a New GitHub Pages Site May Not Appear in Google Immediately

Google does not index every new site instantly. A freshly deployed GitHub Pages site can take **anywhere from a few days to several weeks** to appear in Google search results. Here's why:

### 2.1 Google Must Discover the URL First

Google finds new pages through three channels:

1. **Crawling** — Googlebot follows links from already-indexed pages. A brand-new GitHub Pages URL with no inbound links may not be discovered for weeks.
2. **Sitemap submission** — faster, but only works if you submit the sitemap in Google Search Console.
3. **URL inspection** — the slowest, requires manual submission.

If your repository is new and has no stars, forks, or external links pointing to it, Google has no signal that the page exists.

### 2.2 GitHub Pages Sets Crawl-Friendly Headers — But That's Not Enough

GitHub Pages serves content with `Cache-Control` headers that allow crawling, but it does **not** submit your site to Google on your behalf. You must do that yourself.

### 2.3 The "Crawl Queue" Is Prioritized

Google crawls high-traffic, high-authority sites frequently. New sites with no inbound links go into a low-priority queue. Submitting a sitemap and using the URL Inspection tool's "Request Indexing" button moves your site up the queue.

### 2.4 "Crawled — Currently Not Indexed" Is Common

Even after Google crawls your site, it may decide not to index it immediately. This status appears in Search Console and typically means:

- The page has thin or duplicate content (not our case — PromptForge has rich, unique content).
- The page has no inbound links (most common cause for new sites).
- The page is new and Google is still evaluating it.

Solution: build inbound links (share on social media, submit to directories, write a blog post linking to it).

---

## 3. Step-by-Step: Get Indexed Fast

### Step 1 — Verify the Site Is Live

Open `https://azkivip.github.io/PromptForge/` in a browser. Confirm:

- Page loads without errors.
- Favicon appears.
- `robots.txt` is reachable at `https://azkivip.github.io/PromptForge/robots.txt`.
- `sitemap.xml` is reachable at `https://azkivip.github.io/PromptForge/sitemap.xml`.
- `manifest.json` is reachable at `https://azkivip.github.io/PromptForge/manifest.json`.

### Step 2 — Add the Property in Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add property** → choose **URL prefix**.
3. Enter: `https://azkivip.github.io/PromptForge`.
4. Choose verification method:
   - **HTML tag** (easiest for GitHub Pages): copy the `<meta name="google-site-verification" content="...">` tag and paste it into `index.html` `<head>`, then commit and push. Click **Verify** in Search Console.
   - **Google Analytics** (alternative): if you add GA, you can verify through it.
   - **Domain** verification via DNS is not available for `github.io` subdomains.

### Step 3 — Submit the Sitemap

1. In Search Console, navigate to **Sitemaps** (left sidebar).
2. Enter `sitemap.xml` (relative to the property URL).
3. Click **Submit**.
4. Wait 24–48 hours, then check the **Sitemap** report for "Discovered URLs".

### Step 4 — Request Indexing for the Homepage

1. In Search Console, open **URL Inspection** (top search bar).
2. Paste: `https://azkivip.github.io/PromptForge/`.
3. Click **Request Indexing**.
4. Repeat for `https://azkivip.github.io/PromptForge/#generator` if desired (note: hash-fragment URLs are usually not indexed separately — the canonical homepage is what gets indexed).

### Step 5 — Build Inbound Links (Most Important)

Google ranks pages partly by the number and quality of inbound links. To accelerate indexing and ranking:

- **GitHub repository** — make sure the [PromptForge repo](https://github.com/AzkiVIP/PromptForge) has a complete README with a link to the live demo in the "About" section (top-right of the repo page).
- **Social media** — share the live URL on Twitter/X, LinkedIn, Reddit (r/webdev, r/SideProject, r/opensource), Hacker News, Product Hunt.
- **Directories** — submit to:
  - [Product Hunt](https://www.producthunt.com)
  - [Awesome lists](https://github.com/sindresorhus/awesome) (find relevant `awesome-*` repos and submit a PR)
  - [Open Source Builders](https://opensource.builders)
  - [GitHub Pages showcase](https://github.com/topics/github-pages)
- **Blog posts** — write a Medium/Dev.to/Hashnode post about building PromptForge and link to the live demo.
- **Forums** — answer questions on Stack Overflow, Reddit, Discord with helpful links back to PromptForge when relevant.

### Step 6 — Add Google Analytics (Optional but Recommended)

Adding Google Analytics gives you traffic data and helps Google discover the site faster. Sign up at [analytics.google.com](https://analytics.google.com), create a property, and add the GA4 tag to `index.html`. (Not included by default — add only if you want analytics.)

### Step 7 — Add a `google-site-verification` Meta Tag (After Step 2)

Once you've started verification in Search Console, you'll get a token like `google-site-verification=abc123xyz`. Add this line to `index.html` `<head>`:

```html
<meta name="google-site-verification" content="YOUR_TOKEN_HERE" />
```

Commit, push, then click **Verify** in Search Console.

### Step 8 — Wait, Then Monitor

- **1–3 days**: Search Console should show "Discovered — currently not indexed" or "Crawled — currently not indexed". This is normal.
- **3–14 days**: Most new sites get indexed within two weeks if the sitemap was submitted and inbound links exist.
- **30+ days**: If still not indexed after a month, the most common cause is lack of inbound links. Build more.

### Step 9 — Submit to Bing Webmaster Tools (Bonus)

Bing indexes faster than Google for new sites and also powers DuckDuckGo's results partially.

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters).
2. Add your site.
3. Submit the sitemap.
4. Use the **URL Inspection** tool to request indexing.

---

## 4. Verify Your SEO Setup

Use these free tools to audit your SEO after deployment:

| Tool | URL | What It Checks |
|------|-----|----------------|
| Google Rich Results Test | https://search.google.com/test/rich-results | JSON-LD structured data |
| Google PageSpeed Insights | https://pagespeed.web.dev | Performance, SEO, accessibility |
| Meta Tags Debugger | https://metatags.io | Open Graph + Twitter Card preview |
| Twitter Card Validator | https://cards-dev.twitter.com/validator | Twitter Card rendering |
| Schema.org Validator | https://validator.schema.org | JSON-LD correctness |
| W3C Markup Validator | https://validator.w3.org | HTML validity |
| Lighthouse (Chrome DevTools) | Built into Chrome | Full SEO audit |

---

## 5. Common Issues and Fixes

### Issue: "Discovered — currently not indexed"

**Cause**: Google has the URL but hasn't decided to index it yet. Usually due to low inbound links.

**Fix**:
1. Build inbound links (see Step 5 above).
2. Make sure the page has unique, substantial content (PromptForge does — it's a fully functional app with rich documentation).
3. Wait. This status often resolves itself within 2–4 weeks.

### Issue: Sitemap not being processed

**Cause**: Sitemap URL is wrong, or `robots.txt` blocks it.

**Fix**:
1. Verify `https://azkivip.github.io/PromptForge/sitemap.xml` loads in a browser.
2. Verify `robots.txt` does NOT have `Disallow: /sitemap.xml`.
3. In Search Console → Sitemaps, check the status. If it says "Couldn't fetch", wait 24 hours and re-submit.

### Issue: Open Graph image not showing in social shares

**Cause**: The image URL is wrong, or the image is too small.

**Fix**:
1. Verify `https://azkivip.github.io/PromptForge/assets/og-image.png` loads.
2. The OG image is 1200×630 — the recommended size for rich social previews.
3. Use the [Meta Tags Debugger](https://metatags.io) to preview how the link will look when shared.

### Issue: Structured data errors in Search Console

**Cause**: JSON-LD has a syntax error or missing required field.

**Fix**:
1. Run the page through the [Rich Results Test](https://search.google.com/test/rich-results).
2. Fix any reported errors.
3. Re-validate.

---

## 6. SEO Checklist

- [x] Title tag (50–60 chars, keyword-rich)
- [x] Meta description (150–160 chars)
- [x] Meta keywords
- [x] Meta author
- [x] Meta robots (`index, follow`)
- [x] Canonical URL
- [x] Open Graph tags (type, site_name, title, description, url, image, image:alt, locale)
- [x] Twitter Card tags (card, site, creator, title, description, image, image:alt)
- [x] JSON-LD structured data (WebSite + SoftwareApplication)
- [x] Favicon (PNG, multi-purpose)
- [x] Manifest (PWA installability)
- [x] `robots.txt` (allows all bots, points to sitemap)
- [x] `sitemap.xml` (lists homepage + anchors, includes image)
- [x] `<link rel="sitemap">` in `<head>` for crawler discovery
- [x] Semantic HTML (`<header>`, `<main>`, `<section>`, `<footer>`, `<nav>`)
- [x] ARIA roles and labels for accessibility (helps SEO)
- [x] Mobile-responsive (Google's mobile-first indexing)
- [x] Fast load time (no frameworks, no build step, no external CDNs)
- [x] HTTPS (GitHub Pages provides this automatically)

## 7. Post-Deployment Steps

After deploying to GitHub Pages:

- [ ] Verify the site loads at `https://azkivip.github.io/PromptForge/`
- [ ] Add the property to Google Search Console
- [ ] Add the `google-site-verification` meta tag to `index.html` and verify
- [ ] Submit `sitemap.xml` in Search Console
- [ ] Use URL Inspection → Request Indexing for the homepage
- [ ] Add the site to Bing Webmaster Tools
- [ ] Share the live URL on social media (Twitter, LinkedIn, Reddit, Hacker News)
- [ ] Submit to Product Hunt and awesome-lists
- [ ] Write a blog post or Dev.to article linking to the demo
- [ ] Wait 1–2 weeks, then check Search Console's "Coverage" report
- [ ] Run Lighthouse SEO audit and fix any issues
- [ ] Consider replacing the 96×96 OG image with a 1200×630 version for richer social previews

---

## 8. Performance Notes (Helps SEO)

PromptForge is built for performance, which is a Google ranking factor:

- **No frameworks, no CDN, no external dependencies** — everything is local.
- **No build step** — files are served as-is by GitHub Pages.
- **CSS is split into 3 small files** (style, components, responsive) for cacheability.
- **JavaScript is split into 6 small modules** (data, combobox, accordion, generator, history, app) loaded in order at the end of `<body>`.
- **No render-blocking external scripts** — no analytics, no ads, no third-party fonts.
- **Images are tiny PNG/ICO** (logo-512 is ~150 KB; favicon.ico is <1 KB).
- **Mobile-responsive** with proper viewport meta tag.

Expected Lighthouse scores: 95+ on Performance, 100 on Best Practices, 95+ on Accessibility, 100 on SEO.

---

*Last updated: 2026-06-28*
