/* ==========================================================================
   PromptForge · generator.js
   Rule-based prompt assembly engine. Pure JavaScript, no AI APIs.

   Strategy:
     1. Collect every field's value from the form state.
     2. Apply rule-based enhancements (e.g. Minecraft + Dark Fantasy
        automatically adds "cinematic atmosphere", "dramatic shadows",
        "high detail environment", etc.).
     3. Apply weights (subject / environment / style / color) by repeating
        or weakening phrases.
     4. Apply prompt-expansion level (short / medium / detailed / extreme).
     5. Apply AI-platform preset quirks (Midjourney uses --ar, SDXL uses
        parentheses weights, Flux prefers natural sentences, etc.).
     6. Assemble final prompt string and negative prompt string.
   ========================================================================== */

(function (global) {
  'use strict';

  /* ---------- Rule library ----------
   * Each rule is keyed by a field+value combo and contributes extra
   * phrases to the assembled prompt.
   */
  const RULES = {
    // Project-type rules
    'posterType:minecraft': ['blocky voxel aesthetic', 'cube-based geometry', 'pixel-perfect textures'],
    'posterType:minecraft-thumbnail': ['youtube thumbnail composition', 'high-contrast subject', 'bold readable silhouette'],
    'posterType:minecraft-render': ['blender-style voxel render', 'soft global illumination', 'high detail environment'],
    'posterType:roblox': ['sturdy stylized characters', 'smooth plastic surfaces', 'playful proportions'],
    'posterType:valorant': ['tactical shooter aesthetic', 'stylized realism', 'esports brand identity'],
    'posterType:fortnite': ['vibrant cartoon realism', 'expressive character design', 'action-packed composition'],
    'posterType:thumbnail': ['youtube thumbnail composition', 'bold focal point', 'high contrast for small screens'],
    'posterType:youtube-banner': ['wide panoramic composition', 'channel banner safe zones', 'left-aligned focal subject'],
    'posterType:movie-poster': ['cinematic poster composition', 'dramatic title space', 'hero subject framed top-center'],
    'posterType:album-cover': ['square album art composition', 'centered focal element', 'mood-driven visual identity'],
    'posterType:wallpaper': ['desktop wallpaper composition', 'balanced negative space for icons', 'high resolution detail'],
    'posterType:book-cover': ['vertical book cover composition', 'space for title typography', 'mood evocative imagery'],
    'posterType:product': ['product hero shot', 'studio-grade presentation', 'crisp edge definition'],
    'posterType:advertisement': ['advertising composition', 'clear visual hierarchy', 'compelling call-to-action space'],
    'posterType:corporate': ['professional corporate composition', 'clean modern layout', 'trust-building visual cues'],

    // Art style rules
    'artStyle:photorealistic': ['photographic detail', '8k ultra-detailed textures', 'natural skin pores and imperfections'],
    'artStyle:hyperrealistic': ['hyperrealistic detail', 'microscopic texture fidelity', 'lifelike depth of field'],
    'artStyle:cinematic': ['cinematic color grading', 'filmic tonemapping', 'anamorphic lens characteristics'],
    'artStyle:blender-render': ['cycles render engine look', 'physically based materials', 'subsurface scattering'],
    'artStyle:octane-render': ['octane render quality', 'physically accurate light transport', 'glowing specular highlights'],
    'artStyle:pixar-style': ['pixar-style 3d animation', 'subsurface skin scattering', 'expressive stylized proportions'],
    'artStyle:anime': ['anime art style', 'cel-shaded rendering', 'vibrant flat colors with line art'],
    'artStyle:manga': ['manga illustration', 'high-contrast ink shading', 'dynamic line weight'],
    'artStyle:minecraft-style': ['blocky voxel style', 'cube-based modeling', 'pixelated texture mapping'],
    'artStyle:low-poly': ['low poly geometry', 'flat-shaded facets', 'minimalist 3d aesthetic'],
    'artStyle:dark-fantasy': ['dark fantasy aesthetic', 'cinematic atmosphere', 'dramatic shadows', 'high detail environment', 'epic fantasy mood'],
    'artStyle:medieval-fantasy': ['medieval fantasy aesthetic', 'weathered textures', 'torch-lit ambiance'],
    'artStyle:cyberpunk': ['cyberpunk aesthetic', 'neon-lit future dystopia', 'high-tech low-life contrast', 'holographic accents'],
    'artStyle:futuristic': ['futuristic design language', 'clean sci-fi surfaces', 'advanced material finishes'],
    'artStyle:space': ['cosmic environment', 'starfield backdrop', 'zero-gravity floatation'],

    // Camera angle rules
    'cameraAngle:low-angle': ['heroic low-angle perspective', 'imposing vertical presence'],
    'cameraAngle:high-angle': ['vulnerable high-angle perspective', 'diminished subject scale'],
    'cameraAngle:bird-eye-view': ['top-down aerial perspective', 'geometric pattern emphasis'],
    'cameraAngle:dutch-angle': ['tilted dutch angle', 'uneasy dynamic tension'],
    'cameraAngle:close-up': ['intimate close-up framing', 'shallow depth of field'],
    'cameraAngle:extreme-close-up': ['extreme macro close-up', 'microscopic detail visibility'],
    'cameraAngle:hero-shot': ['hero shot composition', 'three-quarter turn pose', 'confident upright stance'],
    'cameraAngle:cinematic-perspective': ['cinematic perspective', 'rule-of-thirds framing', 'shallow cinematic depth'],

    // Lighting rules
    'lighting:golden-hour': ['warm golden hour light', 'long soft shadows', 'honey-toned highlights'],
    'lighting:volumetric-light': ['volumetric god rays', 'atmospheric light scattering', 'dust-mote illumination'],
    'lighting:rim-light': ['rim lighting', 'edge-defined silhouette glow', 'subject separation from background'],
    'lighting:neon-light': ['saturated neon illumination', 'cyberpunk color spill', 'reflective wet surfaces'],
    'lighting:cyberpunk-light': ['cyberpunk light design', 'magenta-cyan dual-tone lighting', 'holographic glow accents'],
    'lighting:moonlight': ['cool moonlight wash', 'blue-shifted shadows', 'nocturnal ambiance'],
    'lighting:dark-shadows': ['deep dramatic shadows', 'chiaroscuro contrast', 'selective light pools'],
    'lighting:flashlight-horror': ['harsh flashlight beam', 'horror high-contrast lighting', 'claustrophobic darkness'],

    // Mood rules
    'mood:epic': ['epic fantasy mood', 'grandiose scale', 'sweeping cinematic drama'],
    'mood:luxury': ['luxury aesthetic', 'premium material finishes', 'refined elegant detailing'],
    'mood:mysterious': ['mysterious atmosphere', 'fog-draped secrecy', 'unclear narrative suggestion'],
    'mood:dark': ['dark moody atmosphere', 'desaturated palette', 'heavy shadow presence'],
    'mood:horror': ['horror atmosphere', 'unsettling dread', 'visceral fear-inducing details'],
    'mood:dramatic': ['dramatic visual storytelling', 'high emotional intensity', 'theatrical staging'],
    'mood:futuristic': ['futuristic mood', 'clean sci-fi optimism', 'advanced technological ambiance'],

    // Background rules
    'background:cyberpunk-city': ['neon-soaked cyberpunk cityscape', 'towering megastructures', 'rain-slicked streets'],
    'background:space': ['deep space backdrop', 'distant nebula glow', 'scattered star clusters'],
    'background:castle': ['ancient castle architecture', 'weathered stone walls', 'towering spires'],
    'background:forest': ['dense forest environment', 'dappled light through canopy', 'atmospheric depth'],
    'background:minecraft-world': ['blocky voxel landscape', 'cube-based terrain', 'pixelated sky'],

    // Typography rules
    'typography:esports': ['esports typography aesthetic', 'bold italic display lettering', 'high-impact title treatment'],
    'typography:minecraft-pixel': ['pixelated bitmap typography', '8-bit style lettering', 'blocky character forms'],
    'typography:luxury': ['luxury serif typography', 'elegant high-contrast letterforms', 'generous whitespace'],
    'typography:modern': ['modern sans-serif typography', 'geometric clean letterforms', 'minimalist type treatment'],

    // Effects rules (each effect adds atmospheric detail)
    'effect:particles': ['floating particle effects', 'sparkle dust suspended in air'],
    'effect:smoke': ['drifting smoke plumes', 'atmospheric haze layers'],
    'effect:fire': ['dynamic fire elements', 'glowing ember particles', 'heat distortion shimmer'],
    'effect:rain': ['falling rain streaks', 'wet reflective surfaces', 'water droplet detail'],
    'effect:lightning': ['electric lightning arcs', 'crackling energy bolts', 'split-second flash illumination'],
    'effect:glitch': ['digital glitch artifacts', 'RGB channel separation', 'pixel corruption distortion'],
    'effect:motion-blur': ['dynamic motion blur', 'speed lines and directional streaks'],
    'effect:fog': ['thick volumetric fog', 'atmospheric depth layering', 'soft distance falloff'],
    'effect:magic-energy': ['glowing magic energy effects', 'arcane particle trails', 'mystical glow auras'],

    // Composition rules
    'composition:center-focus': ['centered focal composition', 'strong central anchor'],
    'composition:rule-of-thirds': ['rule-of-thirds composition', 'intersecting focal points'],
    'composition:symmetrical': ['symmetrical composition', 'mirror-balanced framing'],
    'composition:dynamic-layout': ['dynamic asymmetric layout', 'leading lines and diagonal flow'],
    'composition:minimalist': ['minimalist composition', 'generous negative space'],

    // Rendering quality rules
    'quality:high': ['high quality render', 'sharp focus', 'detailed materials'],
    'quality:ultra': ['ultra-detailed render', '8k resolution', 'ray-traced reflections'],
    'quality:masterpiece': ['masterpiece quality render', 'award-winning composition', 'trending on artstation', '8k ultra-detailed']
  };

  /* ---------- AI platform presets ----------
   * Each preset wraps the assembled prompt in platform-specific syntax.
   */
  const AI_PRESETS = {
    'chatgpt-images': {
      label: 'ChatGPT Images',
      transform: (prompt, opts) => prompt + (opts.aspectRatio ? ' (aspect ratio ' + opts.aspectRatio + ')' : '')
    },
    'flux': {
      label: 'Flux',
      transform: (prompt, opts) => prompt + (opts.aspectRatio ? ' aspect_ratio=' + opts.aspectRatio : '')
    },
    'sdxl': {
      label: 'SDXL',
      transform: (prompt, opts) => {
        // SDXL uses parenthesized weights — repeat subject for emphasis
        const subject = opts.subjectText ? '(' + opts.subjectText + ':1.2), ' : '';
        return subject + prompt;
      }
    },
    'midjourney': {
      label: 'Midjourney',
      transform: (prompt, opts) => {
        let out = prompt;
        if (opts.aspectRatio) {
          const ar = opts.aspectRatio.replace(':', '');
          out += ' --ar ' + opts.aspectRatio;
        }
        if (opts.strength > 80) out += ' --stylize 750';
        else if (opts.strength > 50) out += ' --stylize 500';
        else out += ' --stylize 250';
        if (opts.renderingQuality === 'masterpiece' || opts.renderingQuality === 'ultra') out += ' --quality 2';
        return out;
      }
    },
    'gemini': {
      label: 'Gemini',
      transform: (prompt, opts) => 'Generate an image: ' + prompt + (opts.aspectRatio ? '. Aspect ratio ' + opts.aspectRatio + '.' : '')
    }
  };

  /* ---------- Expansion levels ----------
   * Controls how many rule-based extras get included.
   */
  const EXPANSION_LEVELS = {
    'short':     { ruleRatio: 0.25, maxExtras: 4,  includeWeights: false },
    'medium':    { ruleRatio: 0.55, maxExtras: 8,  includeWeights: false },
    'detailed':  { ruleRatio: 0.80, maxExtras: 14, includeWeights: true  },
    'extreme':   { ruleRatio: 1.00, maxExtras: 99, includeWeights: true  }
  };

  /* ---------- Strength guidance ---------- */
  function strengthHint(value) {
    if (value <= 25) return 'Simple prompts — minimalist, only core elements. Best for quick drafts.';
    if (value <= 55) return 'Balanced prompts — recommended for most use cases.';
    if (value <= 80) return 'Detailed prompts — rich descriptions, multiple atmospheric layers.';
    return 'Extreme prompts — maximum detail, every rule applied. Best for showcase renders.';
  }

  /* ---------- Weight helpers ---------- */
  function applyWeight(phrase, weight) {
    // 0-100 → repeat 1-3 times for emphasis (only when includeWeights is true)
    if (weight >= 80) return phrase + ', ' + phrase;
    if (weight <= 20) return null; // skip
    return phrase;
  }

  /* ---------- Collect rule extras from state ---------- */
  function collectExtras(state, expansionLevel) {
    const cfg = EXPANSION_LEVELS[expansionLevel] || EXPANSION_LEVELS['medium'];
    const extras = [];

    function pushRules(key) {
      const rules = RULES[key];
      if (!rules) return;
      const count = Math.max(1, Math.round(rules.length * cfg.ruleRatio));
      for (let i = 0; i < count && i < rules.length; i++) {
        extras.push(rules[i]);
      }
    }

    if (state.posterType && state.posterType.id) pushRules('posterType:' + state.posterType.id);
    if (state.artStyle && state.artStyle.id) pushRules('artStyle:' + state.artStyle.id);
    if (state.cameraAngle && state.cameraAngle.id) pushRules('cameraAngle:' + state.cameraAngle.id);
    if (state.lighting && state.lighting.id) pushRules('lighting:' + state.lighting.id);
    if (state.mood && state.mood.id) pushRules('mood:' + state.mood.id);
    if (state.background && state.background.id) pushRules('background:' + state.background.id);
    if (state.typography && state.typography.id) pushRules('typography:' + state.typography.id);
    if (state.composition && state.composition.id) pushRules('composition:' + state.composition.id);
    if (state.renderingQuality) pushRules('quality:' + state.renderingQuality);

    // Effects
    (state.effects || []).forEach(eff => pushRules('effect:' + eff.id));

    // Cap extras
    if (extras.length > cfg.maxExtras) extras.length = cfg.maxExtras;
    return extras;
  }

  /* ---------- Build color description ---------- */
  function buildColorPhrase(state) {
    const parts = [];
    if (state.primaryColor) parts.push('primary ' + state.primaryColor);
    if (state.secondaryColor) parts.push('secondary ' + state.secondaryColor);
    if (state.accentColor) parts.push('accent ' + state.accentColor);
    if (state.palette && state.palette.label) parts.unshift(state.palette.label.toLowerCase() + ' palette');
    return parts.length ? parts.join(', ') + ' color scheme' : '';
  }

  /* ---------- Build background phrase ---------- */
  function buildBackgroundPhrase(state) {
    const parts = [];
    if (state.background && state.background.label) parts.push(state.background.label.toLowerCase() + ' background');
    if (state.customBackground) parts.push(state.customBackground + ' background');
    return parts.join(' with ');
  }

  /* ---------- Main generate function ---------- */
  function generate(state) {
    if (!state) state = {};
    const expansionLevel = state.promptExpansion || 'medium';
    const cfg = EXPANSION_LEVELS[expansionLevel] || EXPANSION_LEVELS['medium'];

    // Core phrase pieces (in order of typical prompt importance)
    const pieces = [];

    // Subject (always first when present)
    if (state.subjectText) {
      const w = cfg.includeWeights ? applyWeight(state.subjectText, state.subjectWeight || 80) : state.subjectText;
      if (w) pieces.push(w);
    }

    // Project type
    if (state.posterType && state.posterType.label) {
      pieces.push(state.posterType.label.toLowerCase());
    } else if (state.customPosterType) {
      pieces.push(state.customPosterType.toLowerCase());
    }

    // Art style
    if (state.artStyle && state.artStyle.label) {
      const w = cfg.includeWeights ? applyWeight(state.artStyle.label.toLowerCase(), state.styleWeight || 70) : state.artStyle.label.toLowerCase();
      if (w) pieces.push(w);
    } else if (state.customArtStyle) {
      pieces.push(state.customArtStyle.toLowerCase());
    }

    // Camera angle
    if (state.cameraAngle && state.cameraAngle.label) {
      pieces.push(state.cameraAngle.label.toLowerCase());
    } else if (state.customCameraAngle) {
      pieces.push(state.customCameraAngle.toLowerCase());
    }

    // Lighting
    if (state.lighting && state.lighting.label) {
      pieces.push(state.lighting.label.toLowerCase());
    } else if (state.customLighting) {
      pieces.push(state.customLighting.toLowerCase());
    }

    // Mood
    if (state.mood && state.mood.label) {
      pieces.push(state.mood.label.toLowerCase() + ' mood');
    } else if (state.customMood) {
      pieces.push(state.customMood.toLowerCase() + ' mood');
    }

    // Typography
    if (state.typography && state.typography.label) {
      pieces.push(state.typography.label.toLowerCase() + ' typography');
    } else if (state.customTypography) {
      pieces.push(state.customTypography.toLowerCase() + ' typography');
    }

    // Background
    const bgPhrase = buildBackgroundPhrase(state);
    if (bgPhrase) pieces.push(bgPhrase);

    // Color
    const colorPhrase = buildColorPhrase(state);
    if (colorPhrase) pieces.push(colorPhrase);

    // Effects
    if (state.effects && state.effects.length) {
      const effLabels = state.effects.map(e => e.label.toLowerCase());
      pieces.push(effLabels.join(', ') + ' effects');
    }

    // Apply rule-based extras
    const extras = collectExtras(state, expansionLevel);
    if (extras.length) pieces.push(extras.join(', '));

    // Composition
    if (state.composition && state.composition.label) {
      pieces.push(state.composition.label.toLowerCase());
    }

    // Rendering quality
    if (state.renderingQuality && state.renderingQuality !== 'standard') {
      pieces.push(state.renderingQuality + ' quality');
    }

    // Subject weight (emphasis markers) for advanced weights
    // Detail level hint based on strength slider
    if (state.strength > 80) pieces.push('intricate ultra-fine details, every surface textured');
    else if (state.strength > 55) pieces.push('fine surface details, balanced texture richness');
    else if (state.strength <= 25) pieces.push('clean simplified forms');

    // Aspect ratio (informational, appended at end unless AI preset handles it)
    let aspectNote = '';
    if (state.aspectRatio) aspectNote = state.aspectRatio;

    // Join core prompt
    let prompt = pieces.filter(Boolean).join(', ');

    // Apply AI platform preset transformation
    const preset = AI_PRESETS[state.aiPreset];
    if (preset) {
      prompt = preset.transform(prompt, Object.assign({}, state, { aspectRatio: aspectNote }));
    } else if (aspectNote) {
      prompt += ' [' + aspectNote + ']';
    }

    /* ---------- Negative prompt ---------- */
    const negPieces = [];
    if (state.negativePrompts && state.negativePrompts.length) {
      state.negativePrompts.forEach(n => negPieces.push(n.label.toLowerCase()));
    }
    if (state.customNegative) negPieces.push(state.customNegative.toLowerCase());

    // Always add common safety negatives for higher strength
    if (state.strength > 55) {
      ['jpeg artifacts', 'compression artifacts', 'overexposed', 'underexposed'].forEach(n => {
        if (!negPieces.includes(n)) negPieces.push(n);
      });
    }
    const negative = negPieces.join(', ');

    return {
      prompt: prompt,
      negative: negative,
      meta: {
        pieces: pieces.length,
        extras: extras.length,
        expansion: expansionLevel,
        aiPreset: state.aiPreset || null,
        aspectRatio: aspectNote || null
      }
    };
  }

  /* ---------- Public API ---------- */
  global.PFGenerator = {
    generate: generate,
    strengthHint: strengthHint,
    RULES: RULES,
    AI_PRESETS: AI_PRESETS,
    EXPANSION_LEVELS: EXPANSION_LEVELS
  };
})(window);
