# PromptForge

> Professional Visual Prompt Generator — build production-ready prompts for posters, thumbnails, advertisements, covers, artworks, wallpapers, and renders.

[![License: MIT](https://img.shields.io/badge/License-MIT-3B82F6.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-3B82F6.svg)](#contributing)
[![No Frameworks](https://img.shields.io/badge/no-frameworks-vanilla%20JS-3B82F6.svg)](#tech-stack)

PromptForge is a fully static, open-source tool that helps designers, content creators, and AI-art users craft detailed, structured prompts through a clean visual interface. It uses a **rule-based assembly engine** — no AI APIs, no backend, no tracking — just pure HTML, CSS, and vanilla JavaScript.

---

## Table of Contents

- [Overview](#overview)
- [Branding](#branding)
- [Features](#features)
- [Screenshots](#screenshots)
- [Installation](#installation)
- [GitHub Pages Deployment](#github-pages-deployment)
- [File Structure](#file-structure)
- [Customization Guide](#customization-guide)
- [Tech Stack](#tech-stack)
- [Browser Support](#browser-support)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

---

## Overview

PromptForge turns prompt-writing into a visual, opinionated workflow. Instead of typing long comma-separated strings by hand, you pick from curated, searchable option lists across every dimension that matters for visual generation — project type, subject, art style, camera angle, lighting, color palette, background, mood, typography, effects, negative prompts, aspect ratio, and platform-specific presets. A built-in rule engine then composes those selections into a single coherent prompt, automatically adding atmospheric layers (e.g. *cinematic atmosphere*, *dramatic shadows*, *high detail environment*) based on the chosen combination.

Every field is optional — generate a usable prompt from a single selection, or fill every field for a fully detailed master prompt.

---

## Branding

PromptForge uses a **custom brand icon** as its official logo. The icon ships as a single PNG master (`assets/images/logo-512.png`, 512×512 RGBA) and is automatically resized into every variant the project needs:

| File | Size | Purpose |
|---|---|---|
| `assets/images/logo.png` | 256×256 | Navbar + footer logo (default display size) |
| `assets/images/logo-180.png` | 180×180 | Apple touch icon variant |
| `assets/images/logo-192.png` | 192×192 | PWA icon |
| `assets/images/logo-512.png` | 512×512 | Master source, OG image, maskable PWA icon |
| `assets/icons/icon-{16,32,48,64,96,128,192,512}.png` | various | Favicon + PWA icons at every required size |
| `assets/icons/apple-touch-icon.png` | 180×180 | iOS home-screen icon (composited on accent background) |
| `favicon.ico` | 16/32/48/64 multi-res | Browser tab favicon |
| `assets/images/og-cover.png` | 1200×630 | Open Graph + Twitter Card cover (logo composited on branded background) |

The icon is rendered crisply at every breakpoint using:

- `image-rendering: -webkit-optimize-contrast` and `image-rendering: crisp-edges` for high-DPI screens
- Explicit `width`/`height` attributes on every `<img>` to prevent layout shift
- `object-fit: contain` to preserve aspect ratio at any container size
- Responsive overrides in `responsive.css` (32px on tablet, 28px on small mobile, 88px hero on mobile)

The wordmark **PromptForge** is rendered as live editable text in the navbar, hero, and footer — never baked into the logo image — so it remains fully translatable, themeable, and screen-reader accessible.

### Replacing the brand icon

To swap the brand icon with a new one:

1. Drop a 1024×1024 (or larger) PNG master at `/home/z/my-project/upload/`.
2. Re-run `python3 scripts/gen_logo_variants.py` (after updating the `SRC` path).
3. All variants — including the favicon, PWA icons, and OG cover — regenerate automatically.

---

## Features

### Core
- **Smart search** across every option list with fuzzy, typo-tolerant matching and category grouping
- **Reference image uploads** — drag-and-drop multiple PNG/JPG/WEBP images with live previews
- **Advanced color picker** — preset palettes plus primary/secondary/accent HEX inputs with live preview
- **Background image upload** for visual reference
- **Multi-select effects** (particles, smoke, fire, rain, lightning, glitch, motion blur, dust, fog, magic energy, floating debris)
- **Negative prompt builder** with checkboxes plus a custom-text field
- **Aspect ratio picker** (1:1, 4:5, 16:9, 9:16, 2:3, A4, A3) with visual cards
- **Prompt strength slider** (0–100) controlling detail richness
- **Advanced options panel** — composition, rendering quality, AI platform presets (ChatGPT Images, Flux, SDXL, Midjourney, Gemini), prompt expansion, and four weight sliders (subject, environment, style, color)

### Smart prompt assembly
- **Rule-based engine** — selections automatically pull in atmospheric descriptors (e.g. Minecraft + Dark Fantasy + Volumetric Light + Epic yields *cinematic atmosphere, dramatic shadows, high detail environment, professional composition, epic fantasy mood*)
- **AI platform presets** transform the prompt into platform-specific syntax (Midjourney `--ar` and `--stylize` flags, SDXL parenthesized weights, Flux natural-language wrapping, etc.)
- **Prompt expansion levels** — Short / Medium / Detailed / Extreme — control how many rule extras are included
- **Strength-aware detail** — higher strength values add automatic quality boosters; lower values produce minimalist prompts

### History & favorites
- **LocalStorage-backed** prompt history (last 50 generated)
- **Favorites** — star any prompt for permanent access
- **Recently generated** — quick access to your latest 10 prompts
- **Auto-saved draft** — your current form state restores on next visit

### Design & UX
- **Dark premium theme** with the exact palette: `#0F172A` background, `#1E293B` surface, `#3B82F6` accent, `#F8FAFC` text
- **Smooth transitions**, elegant hover effects, modern cards and inputs
- **Mobile-first responsive** — two-column desktop, single-column tablet, accordion-style mobile
- **Accessible** — keyboard-navigable search, ARIA labels, focus-visible rings, reduced-motion support
- **No tracking, no cookies, no analytics** — 100% private

---

## Screenshots

> Screenshots live in `assets/images/` once you add them.

![Hero & Generator](assets/images/screenshot-hero.png)
*Hero section and the two-column generator layout.*

![Smart Search](assets/images/screenshot-search.png)
*Smart fuzzy search with category grouping.*

![Color Palette](assets/images/screenshot-color.png)
*Preset palettes plus advanced HEX color picker.*

![Mobile Accordion](assets/images/screenshot-mobile.png)
*Mobile accordion-style collapsible sections.*

To capture your own screenshots, open the deployed site in a browser and use your OS screenshot tool (e.g. macOS `Cmd+Shift+4`, Windows `Win+Shift+S`), then drop the PNGs into `assets/images/`.

---

## Installation

PromptForge is a fully static site — no build step, no dependencies.

### Option 1: Direct download
1. Download or clone this repository.
2. Open `index.html` in any modern browser.

### Option 2: Local server (recommended)
A local server avoids CORS issues when fetching the JSON data files.

```bash
# Python 3
python3 -m http.server 8000

# Or with Node.js
npx serve .

# Or with PHP
php -S localhost:8000
```

Then open <http://localhost:8000> in your browser.

---

## GitHub Pages Deployment

PromptForge is ready to deploy to GitHub Pages with zero configuration.

### Steps
1. Create a new repository on GitHub (e.g. `promptforge`).
2. Push the project files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial PromptForge release"
   git branch -M main
   git remote add origin https://github.com/<your-username>/promptforge.git
   git push -u origin main
   ```
3. In GitHub, go to **Settings → Pages**.
4. Under **Source**, select **Deploy from a branch**.
5. Choose **main** branch and **/ (root)** folder.
6. Click **Save**.
7. Wait 1–2 minutes. Your site will be live at:
   ```
   https://<your-username>.github.io/promptforge/
   ```

### Important notes for GitHub Pages
- All asset paths in this project are **relative** (`assets/...`, `data/...`), so the site works correctly whether deployed to a root domain or a sub-path like `/promptforge/`.
- If you rename the repository, no code changes are needed.
- The `manifest.json` and `sitemap.xml` use relative URLs and will work on any deployment path.

---

## File Structure

```
PromptForge/
├── index.html                  # Main HTML document
├── README.md                   # This file
├── LICENSE                     # MIT license
├── robots.txt                  # Crawler directives
├── sitemap.xml                 # Sitemap for search engines
├── manifest.json               # PWA manifest
├── favicon.ico                 # Multi-resolution favicon
│
├── assets/
│   ├── css/
│   │   ├── main.css            # Design tokens, base reset, layout primitives
│   │   ├── components.css      # Reusable UI components (inputs, chips, sliders, etc.)
│   │   └── responsive.css      # Mobile-first breakpoints
│   │
│   ├── js/
│   │   ├── app.js              # Main entry point — wires everything together
│   │   ├── generator.js        # Rule-based prompt assembly engine
│   │   ├── search.js           # Reusable smart fuzzy-search component
│   │   ├── presets.js          # JSON data loader with caching
│   │   ├── storage.js          # LocalStorage wrapper (history, favorites, draft)
│   │   └── ui.js               # UI helpers (accordions, dropzones, color pickers, toasts)
│   │
│   ├── icons/
│   │   ├── icon-16.png         # PWA icons in multiple sizes (generated from master logo)
│   │   ├── icon-32.png
│   │   ├── icon-48.png
│   │   ├── icon-64.png
│   │   ├── icon-96.png
│   │   ├── icon-128.png
│   │   ├── icon-192.png        # Maskable PWA icon
│   │   ├── icon-512.png        # Maskable PWA icon
│   │   └── apple-touch-icon.png # 180x180 iOS home-screen icon
│   │
│   └── images/
│       ├── logo.png            # 256x256 master brand logo (official icon)
│       ├── logo-180.png        # 180x180 variant
│       ├── logo-192.png        # 192x192 variant
│       ├── logo-512.png        # 512x512 variant
│       └── og-cover.png        # Open Graph / Twitter card cover image
│
└── data/
    ├── poster-types.json       # Project type categories & items
    ├── styles.json             # Art style categories & items
    ├── moods.json              # Moods + typography options
    └── presets.json            # Camera angles, lighting, backgrounds, effects,
                                # negative prompts, palettes, aspect ratios,
                                # compositions, rendering quality, AI presets,
                                # prompt expansion levels
```

---

## Customization Guide

### Adding a new project type
Edit `data/poster-types.json` and add an entry under the appropriate category:

```json
{
  "id": "valorant-thumbnail",
  "label": "Valorant Thumbnail",
  "aliases": ["val thumb"]
}
```

The `aliases` array powers fuzzy search — add common misspellings and abbreviations.

### Adding a new rule
Open `assets/js/generator.js` and add an entry to the `RULES` object:

```javascript
'posterType:valorant-thumbnail': [
  'tactical shooter composition',
  'high-contrast esports branding',
  'readable silhouette at small sizes'
],
```

The rule key follows the pattern `<fieldName>:<itemId>`. Supported fields: `posterType`, `artStyle`, `cameraAngle`, `lighting`, `mood`, `background`, `typography`, `composition`, `quality`, `effect`.

### Adding a new AI platform preset
In `assets/js/generator.js`, extend the `AI_PRESETS` object:

```javascript
'leonardo': {
  label: 'Leonardo',
  transform: (prompt, opts) => prompt + (opts.aspectRatio ? ' aspect:' + opts.aspectRatio : '')
}
```

Then add the matching entry to `data/presets.json` under `aiPresets`.

### Tweaking the color palette
Edit the CSS variables in `assets/css/main.css`:

```css
:root {
  --bg: #0F172A;
  --surface: #1E293B;
  --accent: #3B82F6;
  --text: #F8FAFC;
}
```

All components reference these tokens, so changing them updates the entire UI consistently.

### Adjusting history limits
In `assets/js/storage.js`, change the `MAX_HISTORY` and `MAX_RECENT` constants.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Markup | Semantic HTML5 | Accessibility, SEO |
| Styling | Hand-written CSS3 with custom properties | No framework lock-in, full design control |
| Logic | Vanilla JavaScript (ES6+) with IIFE modules | Zero build step, instant load, no dependencies |
| Storage | Browser LocalStorage | No backend, fully private |
| Search | Custom fuzzy scorer + Levenshtein fallback | Typo-tolerant, subsequence matching, no library |
| Fonts | Google Fonts (Inter) | Modern, professional, free |
| Icons | Custom brand PNG + multi-resolution favicon/PWA icons | Crisp at any DPR, official PromptForge logo |

**No frameworks used.** No React, Vue, Angular, Bootstrap, Tailwind, or jQuery. The entire app weighs under 80 KB (excluding fonts and images).

---

## Browser Support

PromptForge works in all modern browsers that support ES6+, CSS custom properties, and the File API:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

For older browsers, the UI gracefully degrades — search results remain functional, but some visual polish (backdrop-filter, modern color functions) may be reduced.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Make your changes. Keep code modular and well-commented.
4. Test locally with `python3 -m http.server 8000`.
5. Commit with a clear message: `git commit -m "Add: your feature"`.
6. Push: `git push origin feature/your-feature-name`.
7. Open a pull request describing what you changed and why.

### Contribution ideas
- New preset palettes (warm sunset, monochrome blue, pastel, retro 80s)
- Additional AI platform presets (Stable Diffusion 1.5, DALL·E 3, Ideogram, Krea)
- Localization (i18n) for non-English users
- Export prompts as JSON / CSV
- Light theme toggle
- Prompt templates (e.g. "Minecraft YouTube thumbnail starter pack")

---

## License

Released under the **MIT License**. See [LICENSE](LICENSE) for the full text.

You are free to use, modify, distribute, and commercialize this project. Attribution is appreciated but not required.

---

## Credits

- **Design & engineering** — PromptForge contributors
- **Brand icon** — Official custom PromptForge logo (PNG master, with multi-resolution variants generated via Pillow)
- **Font** — [Inter](https://rsms.me/inter/) by Rasmus Andersson (SIL Open Font License)
- **Inspiration** — The open-source AI art community, whose feedback shaped the rule library
- **Icons** — Multi-resolution PNG + multi-res ICO generated programmatically with [Pillow](https://python-pillow.org/) from the official brand icon

---

*If PromptForge saved you time, consider starring the repository on GitHub — it helps others discover the tool.*
