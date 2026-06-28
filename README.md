# PromptForge

> Premium open-source visual prompt generator. Craft cinematic, professional prompts for posters, thumbnails, ads, covers, wallpapers, concept art, character art, product renders, marketing assets, and AI image generation.

Built with **HTML5, CSS3, and Vanilla JavaScript** — no frameworks, no build step, no dependencies. Just open `index.html` or host the folder on GitHub Pages.

---

## Highlights

- **Pure vanilla** — no React, Vue, jQuery, Tailwind, or any framework/library.
- **Desktop-first app layout** — 40% generator / 60% output split, with **independent panel scrolling**. No long vertical form.
- **Collapsible accordion sections** — only one large section open at a time.
- **Smart searchable comboboxes** — fuzzy-search dropdowns with keyboard navigation, custom-input support, and option grouping.
- **Rule-based generation engine** — not string concatenation. Auto-enriches prompts based on selected combinations (e.g. *Minecraft + Dark Fantasy + Epic + Volumetric Lighting* automatically adds *cinematic atmosphere, dramatic shadows, high detail environment, professional composition, epic fantasy mood*).
- **AI presets** — ChatGPT Images, Flux, SDXL, Midjourney, Gemini. Each preset produces a prompt formatted for that model (natural-language vs tag-list vs `--ar` parameters).
- **Color palette builder** — single / dual / multi modes, color picker + HEX input, live preview.
- **Image uploads** — drag-and-drop reference images for Subject and Background.
- **History + Favorites** — LocalStorage-backed, with restore, copy, star, and delete.
- **SEO-ready** — `robots.txt`, `sitemap.xml`, `manifest.json`, Open Graph, Twitter Card, JSON-LD, SVG favicon.
- **Responsive** — adapts gracefully from large desktop down to mobile.
- **Accessible** — keyboard navigation, ARIA roles, reduced-motion support.

---

## File Structure

```
PromptForge/
├── index.html              # Main app shell (navbar, panels, footer, SEO meta)
├── manifest.json           # PWA manifest
├── robots.txt              # Crawler rules
├── sitemap.xml             # Sitemap
├── README.md
├── css/
│   ├── style.css           # Design tokens, base reset, navbar, layout, footer
│   ├── components.css      # Accordion, combobox, chips, color picker, output, history
│   └── responsive.css      # Tablet & mobile breakpoints
├── js/
│   ├── data.js             # All option libraries + rule-based enrichment KB
│   ├── combobox.js         # Searchable combobox with fuzzy match
│   ├── accordion.js        # Collapsible sections
│   ├── generator.js        # Rule-based prompt engine
│   ├── history.js          # LocalStorage history & favorites
│   └── app.js              # Main wiring & UI behavior
└── assets/
    ├── favicon.svg
    └── og-image.svg
```

---

## How to Use

1. **Open `index.html`** in any modern browser. No server, no build step required.
2. On the **left panel**, configure your prompt:
   - Pick a **Project Type** category & preset (or type a custom one).
   - Open each accordion section to set **Subject, Art Style, Camera Angle, Lighting, Color Palette, Background, Mood, Typography, Effects, Aspect Ratio**, and **Advanced** options.
   - Each searchable field is a combobox — click it, then type to fuzzy-search.
3. Click **Generate** (or press `Ctrl/Cmd + Enter`).
4. On the **right panel**:
   - Read the **Prompt** and **Negative Prompt**.
   - **Copy** either with one click.
   - **Save to Favorites** or **Save to History**.
5. **History** and **Favorites** sections below the output let you **restore**, **copy**, **star**, or **delete** any saved entry. All data is stored in your browser's LocalStorage — nothing leaves your machine.

---

## How the Rule-Based Engine Works

`js/generator.js` is the brain. It is **not** simple string concatenation.

1. **Structured state collection** — every selection is stored as typed state, not raw strings.
2. **Phrase resolution** — each option carries a `phrase` field that gets resolved into prompt-friendly language (e.g. `Minecraft` → `Minecraft-style game key art`).
3. **Rule-based enrichment** — `js/data.js` defines `ENRICHMENT_RULES`, each with trigger keywords and enrichment phrases. When any selected option matches a trigger, the matching enrichment phrases are appended (de-duplicated).
4. **Rendering-quality boost** — selected quality tier (Standard / High / Ultra / Masterpiece) adds escalating detail tags.
5. **Prompt expansion calibration** — Short / Medium / Detailed / Extreme controls how many enrichment layers are applied.
6. **AI-preset adaptation** — the final prompt is composed differently per preset:
   - **ChatGPT Images / Flux / Gemini** → natural-language paragraph.
   - **SDXL** → comma-separated tag list + heavy negative-prompt suffix.
   - **Midjourney** → natural language + `--ar`, `--v`, `--stylize`, `--q` parameters.
7. **Synchronized negative prompt** — built from a base library, refined by selected mood, and adapted by AI preset (SDXL gets the heaviest negative).

---

## Customization

- **Add new options** → edit the relevant array in `js/data.js`.
- **Add new enrichment rules** → push to `ENRICHMENT_RULES` in `js/data.js`.
- **Change colors / theme** → edit CSS custom properties at the top of `css/style.css`.
- **Add a new AI preset** → push to `AI_PRESETS` in `js/data.js` and adjust `generator.js` if needed.

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Enter` | Generate prompt |
| `Enter` / `Space` | Open/close accordion (when focused on header) |
| `Arrow Up/Down` | Navigate combobox options |
| `Enter` | Select highlighted option in combobox |
| `Escape` | Close combobox |
| `Enter` / `Space` | Open file dialog when focused on dropzone |

---

## Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge). Uses ES6+, CSS Grid, CSS Custom Properties, and `localStorage`. No polyfills needed.

---

## License

MIT License — see [LICENSE](https://github.com/AzkiVIP/PromptForge/blob/main/LICENSE).

---

## Repository

[https://github.com/AzkiVIP/PromptForge](https://github.com/AzkiVIP/PromptForge)

Built with HTML, CSS &amp; Vanilla JavaScript.
