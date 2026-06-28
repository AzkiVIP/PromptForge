/* =========================================================
   PromptForge — generator.js
   Rule-based prompt generation engine.

   NOT a simple string concat. It:
   1. Collects every selected field into a structured state.
   2. Resolves phrase-equivalents for each selected option.
   3. Applies rule-based enrichment triggers (keyword → phrases).
   4. Layers rendering-quality boosts.
   5. Calibrates verbosity by Prompt Expansion level.
   6. Adapts to the chosen AI Preset (natural-language for
      ChatGPT/Flux/Gemini; parameter-tagged for Midjourney;
      tag-list + negative-prompt for SDXL).
   7. Generates a synchronized negative prompt.
   ========================================================= */
(function (global) {
  "use strict";

  const D = global.PF_DATA;

  function uniq(arr) {
    const seen = new Set();
    const out = [];
    arr.forEach(function (x) {
      const k = String(x).toLowerCase().trim();
      if (k && !seen.has(k)) { seen.add(k); out.push(x); }
    });
    return out;
  }

  function findIn(list, value) {
    if (!value) return null;
    return list.find(function (x) { return x.value === value; }) || null;
  }

  /* Lookup phrase across all data lists */
  function phraseFor(kind, value) {
    if (!value) return null;
    let list;
    switch (kind) {
      case "artStyle":    list = D.ART_STYLE; break;
      case "cameraAngle": list = D.CAMERA_ANGLE; break;
      case "lighting":    list = D.LIGHTING; break;
      case "background":  list = D.BACKGROUND; break;
      case "mood":        list = D.MOOD; break;
      case "typography":  list = D.TYPOGRAPHY; break;
      case "effects":     list = D.EFFECTS; break;
      case "composition": list = D.COMPOSITION; break;
      default: return null;
    }
    const found = findIn(list, value);
    return found ? found.phrase : value;
  }

  function projectTypePhrase(category, preset, custom) {
    if (custom && custom.trim()) return custom.trim() + " artwork";
    if (preset) {
      const found = (D.PROJECT_TYPE[category] || []).find(function (p) { return p.value === preset; });
      if (found) return found.phrase;
      return preset.toLowerCase() + " artwork";
    }
    if (category) return category.toLowerCase() + " artwork";
    return null;
  }

  /* Apply rule-based enrichment */
  function applyRules(state) {
    const enrichment = [];
    // Build a haystack of all selected values + phrases
    const haystack = [
      state.projectTypeCustom,
      state.projectTypePreset,
      state.projectTypeCategory,
      state.artStyle,
      state.cameraAngle,
      state.lighting,
      state.background,
      state.mood,
      state.typography
    ].filter(Boolean).join(" ").toLowerCase();

    D.ENRICHMENT_RULES.forEach(function (rule) {
      const hit = rule.triggers.some(function (t) {
        return haystack.includes(t.toLowerCase());
      });
      if (hit) rule.add.forEach(function (p) { enrichment.push(p); });
    });

    return uniq(enrichment);
  }

  /* Build the structured prompt payload */
  function buildPayload(state) {
    const parts = {
      subject:   state.subjectText || null,
      project:   projectTypePhrase(state.projectTypeCategory, state.projectTypePreset, state.projectTypeCustom),
      style:     state.artStyle ? phraseFor("artStyle", state.artStyle) : (state.artStyleCustom || null),
      camera:    state.cameraAngle ? phraseFor("cameraAngle", state.cameraAngle) : (state.cameraAngleCustom || null),
      lighting:  state.lighting ? phraseFor("lighting", state.lighting) : (state.lightingCustom || null),
      bg:        state.background ? phraseFor("background", state.background) : (state.backgroundCustom || null),
      mood:      state.mood ? phraseFor("mood", state.mood) : (state.moodCustom || null),
      typo:      state.typography ? phraseFor("typography", state.typography) : (state.typographyCustom || null),
      effects:   (state.effects || []).map(function (v) { return phraseFor("effects", v); }),
      composition: state.composition ? phraseFor("composition", state.composition) : null,
      colors:    state.colors && state.colors.length ? state.colors.slice() : []
    };

    const enrich = applyRules(state);

    // Rendering quality boost
    const rq = findIn(D.RENDERING_QUALITY, state.renderingQuality);
    const rqBoost = rq ? rq.boost.slice() : [];

    // Expansion level
    const exp = (D.PROMPT_EXPANSION.find(function (e) { return e.value === state.promptExpansion; }) || {}).weight || 1;

    return { parts: parts, enrich: enrich, rqBoost: rqBoost, expansion: exp };
  }

  /* Compose natural-language prompt (ChatGPT / Flux / Gemini) */
  function composeNatural(p) {
    const segs = [];
    if (p.parts.project) segs.push(p.parts.project);
    if (p.parts.subject) segs.push("of " + p.parts.subject);
    if (p.parts.style) segs.push("rendered in " + p.parts.style);

    // Pick "a" or "an" based on the next word's first sound
    function article(word) {
      if (!word) return "a";
      const w = String(word).trim().toLowerCase();
      if (/^[aeiou]/.test(w) && !/^(uni|use|eu)/.test(w)) return "an";
      return "a";
    }

    const scene = [];
    if (p.parts.camera) scene.push("shot from " + article(p.parts.camera) + " " + p.parts.camera);
    if (p.parts.lighting) scene.push("lit by " + p.parts.lighting);
    if (p.parts.bg) scene.push("set against " + article(p.parts.bg) + " " + p.parts.bg);
    if (p.parts.mood) scene.push("evoking " + article(p.parts.mood) + " " + p.parts.mood);
    if (scene.length) segs.push(scene.join(", "));

    if (p.parts.effects && p.parts.effects.length) {
      segs.push("with " + p.parts.effects.join(", "));
    }
    if (p.parts.composition) segs.push(p.parts.composition);

    // Colors
    if (p.parts.colors.length) {
      const names = p.parts.colors.map(function (c) { return D.colorName(c); });
      segs.push("using a " + (names.length === 1 ? "single " : "") + "palette of " + names.join(", "));
    }

    if (p.parts.typo) segs.push("with " + p.parts.typo);

    // Enrichment + quality (scaled by expansion)
    const tail = [];
    if (p.expansion >= 1) tail.push.apply(tail, p.enrich);
    if (p.expansion >= 1) tail.push.apply(tail, p.rqBoost);
    if (p.expansion >= 2) tail.push("professional color grading", "tight art direction");
    if (p.expansion >= 3) tail.push("intricate surface detail", "layered depth", "cinematic lens characteristics", "studio-grade post-production");

    if (tail.length) segs.push(uniq(tail).join(", "));

    // Capitalize first letter, end with period
    let s = segs.filter(Boolean).join(", ").trim();
    if (s) {
      s = s.charAt(0).toUpperCase() + s.slice(1);
      if (!/[.!?]$/.test(s)) s += ".";
    }
    return s;
  }

  /* Compose tag-list prompt (SDXL / general) */
  function composeTagList(p) {
    const tags = [];
    if (p.parts.project) tags.push(p.parts.project);
    if (p.parts.subject) tags.push(p.parts.subject);
    if (p.parts.style) tags.push(p.parts.style);
    if (p.parts.camera) tags.push(p.parts.camera);
    if (p.parts.lighting) tags.push(p.parts.lighting);
    if (p.parts.bg) tags.push(p.parts.bg);
    if (p.parts.mood) tags.push(p.parts.mood);
    if (p.parts.effects && p.parts.effects.length) tags.push.apply(tags, p.parts.effects);
    if (p.parts.composition) tags.push(p.parts.composition);
    if (p.parts.colors.length) {
      const names = p.parts.colors.map(function (c) { return D.colorName(c) + " tones"; });
      tags.push.apply(tags, names);
    }
    if (p.parts.typo) tags.push(p.parts.typo);

    if (p.expansion >= 1) tags.push.apply(tags, p.enrich);
    if (p.expansion >= 1) tags.push.apply(tags, p.rqBoost);
    if (p.expansion >= 2) tags.push("professional color grading", "tight art direction");
    if (p.expansion >= 3) tags.push("intricate surface detail", "layered depth", "cinematic lens characteristics");

    return uniq(tags).join(", ");
  }

  /* Compose Midjourney-style: natural-ish + --params */
  function composeMidjourney(p, state) {
    let base = composeNatural(p);
    const preset = D.AI_PRESETS.find(function (a) { return a.value === "Midjourney"; });
    // Stylize / quality
    const qualityMap = { Standard: " --q 1", High: " --q 2", Ultra: " --q 2 --stylize 500", Masterpiece: " --q 2 --stylize 750" };
    base += (qualityMap[state.renderingQuality] || "");
    if (state.aspectRatio) {
      const ar = D.ASPECT_RATIOS.find(function (a) { return a.value === state.aspectRatio; });
      if (ar) {
        // MJ uses pure W:H
        const parts = ar.value.split(":");
        if (parts.length === 2) base += " --ar " + parts[0] + ":" + parts[1];
        else base += " --ar 3:4"; // A4/A3 fallback
      }
    }
    base += preset.suffix;
    return base;
  }

  /* Negative prompt builder */
  function buildNegative(state, aiPreset) {
    const neg = D.NEGATIVE_BASE.slice();
    if (state.mood && D.NEGATIVE_BY_MOOD[state.mood]) {
      neg.push.apply(neg, D.NEGATIVE_BY_MOOD[state.mood]);
    }
    if (state.effects && state.effects.length === 0) {
      neg.push("excessive particle effects", "cluttered foreground");
    }
    let out = uniq(neg).join(", ");

    const preset = D.AI_PRESETS.find(function (a) { return a.value === aiPreset; });
    if (preset && preset.negativeSuffix) out += preset.negativeSuffix;

    return out;
  }

  /* Main entry */
  function generate(state) {
    if (!state) return null;
    const payload = buildPayload(state);
    const preset = D.AI_PRESETS.find(function (a) { return a.value === state.aiPreset; }) || D.AI_PRESETS[0];

    let prompt;
    let aspectTag = "";
    if (state.aspectRatio) {
      const ar = D.ASPECT_RATIOS.find(function (a) { return a.value === state.aspectRatio; });
      if (ar) aspectTag = ar.param;
    }

    if (preset.value === "Midjourney") {
      prompt = composeMidjourney(payload, state);
      // Midjourney already includes --ar inline
    } else if (preset.value === "SDXL") {
      prompt = composeTagList(payload);
      if (aspectTag) prompt += "  (" + aspectTag + ")";
      prompt += preset.suffix;
    } else {
      // ChatGPT / Flux / Gemini — natural language
      prompt = composeNatural(payload);
      if (aspectTag && preset.preferNatural) {
        prompt += " Aspect ratio " + state.aspectRatio + ".";
      }
    }

    const negative = buildNegative(state, preset.value);

    // Build meta info
    const meta = [];
    if (state.aiPreset) meta.push({ label: "Preset", value: state.aiPreset });
    if (state.aspectRatio) meta.push({ label: "Ratio", value: state.aspectRatio });
    if (state.renderingQuality) meta.push({ label: "Quality", value: state.renderingQuality });
    if (state.promptExpansion) meta.push({ label: "Expansion", value: state.promptExpansion });
    if (payload.enrich.length) meta.push({ label: "Auto-enrichments", value: String(payload.enrich.length) });

    return {
      prompt: prompt,
      negative: negative,
      meta: meta,
      state: state,
      timestamp: Date.now()
    };
  }

  global.PF = global.PF || {};
  global.PF.Generator = { generate: generate };

})(typeof window !== "undefined" ? window : this);
