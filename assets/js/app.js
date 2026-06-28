/* ==========================================================================
   PromptForge · app.js
   Main entry point. Wires data loading, search components, controls, and the
   generation engine into a cohesive app.
   ========================================================================== */

(function (global) {
  'use strict';

  // App state — single source of truth
  const state = {
    posterType: null,        // { id, label }
    customPosterType: '',
    subjectText: '',
    referenceImages: [],     // File[]
    artStyle: null,
    customArtStyle: '',
    cameraAngle: null,
    customCameraAngle: '',
    lighting: null,
    customLighting: '',
    palette: null,           // { id, label, primary, secondary, accent }
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#93C5FD',
    background: null,
    customBackground: '',
    bgImage: null,           // File
    mood: null,
    customMood: '',
    typography: null,
    customTypography: '',
    effects: [],             // [{ id, label }]
    negativePrompts: [],     // [{ id, label }]
    customNegative: '',
    aspectRatio: null,       // "16:9"
    strength: 60,
    // Advanced
    composition: null,
    renderingQuality: null,
    aiPreset: null,
    promptExpansion: null,
    subjectWeight: 80,
    environmentWeight: 60,
    styleWeight: 70,
    colorWeight: 50
  };

  // Tab state for history panel
  let activeTab = 'recent';
  let searchInstances = {};

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    // Update footer year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Load all data first
    try {
      await global.PFPresets.preloadAll();
    } catch (err) {
      console.error('Data load failed', err);
      global.PFUI.toast('Failed to load preset data', 'error');
    }

    // Initialize UI behaviors
    global.PFUI.initAccordions(document);
    global.PFUI.applyMobileAccordion();

    initSearchables();
    initSubjectSection();
    initColorSection();
    initBackgroundSection();
    initEffectsAndNegative();
    initRatioGrid();
    initStrengthSlider();
    initAdvancedPanel();
    initOutputActions();
    initHistoryTabs();
    initCopyButtons();

    // Restore draft if any
    restoreDraft();

    // Initial render
    regenerate();
    renderHistory();

    // Re-apply mobile accordion on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => global.PFUI.applyMobileAccordion(), 200);
    });

    console.log('%cPromptForge ready', 'color:#3B82F6;font-weight:bold');
  }

  /* ---------- Searchables ---------- */
  function initSearchables() {
    const nodes = document.querySelectorAll('.searchable');
    nodes.forEach(node => {
      const dataKey = node.dataset.searchable;
      const targetKey = node.dataset.target;
      global.PFPresets.load(dataKey).then(data => {
        const inst = global.PFSearch.init(node, {
          data: data,
          onSelect: (item) => {
            state[targetKey] = item;
            state['custom' + capitalize(targetKey)] = '';
            regenerate();
            saveDraft();
          },
          onClear: () => {
            state[targetKey] = null;
            regenerate();
            saveDraft();
          }
        });
        searchInstances[targetKey] = inst;
      });
    });
  }

  /* ---------- Subject section ---------- */
  function initSubjectSection() {
    const subjectInput = document.getElementById('subjectText');
    subjectInput.addEventListener('input', global.PFUI.debounce(() => {
      state.subjectText = subjectInput.value.trim();
      regenerate();
      saveDraft();
    }, 200));

    const dz = document.getElementById('referenceDropzone');
    const input = document.getElementById('referenceInput');
    const preview = document.getElementById('referencePreview');
    global.PFUI.initDropzone(dz, input, preview, {
      multiple: true,
      onChange: (files) => {
        state.referenceImages = files;
        // References don't go into the prompt text but inform composition
        if (files.length) {
          global.PFUI.toast(files.length + ' reference image' + (files.length > 1 ? 's' : '') + ' attached', 'success');
        }
      }
    });

    // Custom text inputs (poster type / style / etc.)
    bindCustomInput('customPosterType', 'customPosterType');
    bindCustomInput('customArtStyle', 'customArtStyle');
    bindCustomInput('customCameraAngle', 'customCameraAngle');
    bindCustomInput('customLighting', 'customLighting');
    bindCustomInput('customBackground', 'customBackground');
    bindCustomInput('customMood', 'customMood');
    bindCustomInput('customTypography', 'customTypography');
    bindCustomInput('customNegative', 'customNegative');
  }

  function bindCustomInput(elId, stateKey) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.addEventListener('input', global.PFUI.debounce(() => {
      state[stateKey] = el.value.trim();
      regenerate();
      saveDraft();
    }, 200));
  }

  /* ---------- Color section ---------- */
  function initColorSection() {
    // Palette grid
    global.PFPresets.palettes().then(palettes => {
      const grid = document.getElementById('paletteGrid');
      global.PFUI.renderPaletteGrid(grid, palettes, null, (p) => {
        state.palette = p;
        state.primaryColor = p.primary;
        state.secondaryColor = p.secondary;
        state.accentColor = p.accent;
        // Sync advanced picker inputs
        document.getElementById('primaryColor').value = p.primary;
        document.getElementById('primaryHex').value = p.primary.toUpperCase();
        document.getElementById('secondaryColor').value = p.secondary;
        document.getElementById('secondaryHex').value = p.secondary.toUpperCase();
        document.getElementById('accentColor').value = p.accent;
        document.getElementById('accentHex').value = p.accent.toUpperCase();
        updatePalettePreview();
        regenerate();
        saveDraft();
      });
    });

    // Color pickers
    const pairs = [
      ['primaryColor', 'primaryHex', 'primaryColor'],
      ['secondaryColor', 'secondaryHex', 'secondaryColor'],
      ['accentColor', 'accentHex', 'accentColor']
    ];
    pairs.forEach(([colorId, hexId, stateKey]) => {
      const colorEl = document.getElementById(colorId);
      const hexEl = document.getElementById(hexId);
      global.PFUI.bindColorPicker(colorEl, hexEl, (val) => {
        state[stateKey] = val;
        updatePalettePreview();
        regenerate();
        saveDraft();
      });
    });
    updatePalettePreview();
  }

  function updatePalettePreview() {
    const preview = document.getElementById('palettePreview');
    if (preview) {
      preview.style.setProperty('--c1', state.primaryColor);
      preview.style.setProperty('--c2', state.secondaryColor);
      preview.style.setProperty('--c3', state.accentColor);
    }
  }

  /* ---------- Background section ---------- */
  function initBackgroundSection() {
    const dz = document.getElementById('bgDropzone');
    const input = document.getElementById('bgInput');
    const preview = document.getElementById('bgPreview');
    global.PFUI.initDropzone(dz, input, preview, {
      multiple: false,
      onChange: (files) => {
        state.bgImage = files[0] || null;
        if (files.length) global.PFUI.toast('Background image attached', 'success');
      }
    });
  }

  /* ---------- Effects & Negative ---------- */
  function initEffectsAndNegative() {
    global.PFPresets.effects().then(items => {
      const grid = document.getElementById('effectsGrid');
      global.PFUI.renderChipGrid(grid, items, [], (item) => {
        const idx = state.effects.findIndex(e => e.id === item.id);
        if (idx >= 0) state.effects.splice(idx, 1);
        else state.effects.push(item);
        regenerate();
        saveDraft();
      });
    });

    global.PFPresets.negativePrompts().then(items => {
      const grid = document.getElementById('negativeGrid');
      global.PFUI.renderChipGrid(grid, items, [], (item) => {
        const idx = state.negativePrompts.findIndex(n => n.id === item.id);
        if (idx >= 0) state.negativePrompts.splice(idx, 1);
        else state.negativePrompts.push(item);
        regenerate();
        saveDraft();
      });
    });
  }

  /* ---------- Aspect ratio ---------- */
  function initRatioGrid() {
    global.PFPresets.aspectRatios().then(items => {
      const grid = document.getElementById('ratioGrid');
      global.PFUI.renderRatioGrid(grid, items, null, (item) => {
        state.aspectRatio = item.id;
        regenerate();
        saveDraft();
      });
    });
  }

  /* ---------- Strength slider ---------- */
  function initStrengthSlider() {
    const slider = document.getElementById('strengthSlider');
    const output = document.getElementById('strengthValue');
    const hint = document.getElementById('strengthHint');
    global.PFUI.bindSlider(slider, output, (val) => {
      state.strength = val;
      if (hint) hint.textContent = global.PFGenerator.strengthHint(val);
      regenerate();
      saveDraft();
    });
    if (hint) hint.textContent = global.PFGenerator.strengthHint(state.strength);
  }

  /* ---------- Advanced panel ---------- */
  function initAdvancedPanel() {
    const toggle = document.getElementById('advancedToggle');
    const panel = document.getElementById('advancedPanel');
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', !expanded);
      panel.hidden = expanded;
    });

    // Populate selects
    Promise.all([
      global.PFPresets.compositions(),
      global.PFPresets.renderingQuality(),
      global.PFPresets.aiPresets(),
      global.PFPresets.promptExpansions()
    ]).then(([comps, quals, ais, exps]) => {
      global.PFUI.populateSelect(document.getElementById('composition'), comps);
      global.PFUI.populateSelect(document.getElementById('renderingQuality'), quals);
      global.PFUI.populateSelect(document.getElementById('aiPreset'), ais);
      global.PFUI.populateSelect(document.getElementById('promptExpansion'), exps);
    });

    // Bind selects
    bindSelect('composition', 'composition');
    bindSelect('renderingQuality', 'renderingQuality');
    bindSelect('aiPreset', 'aiPreset');
    bindSelect('promptExpansion', 'promptExpansion');

    // Bind advanced sliders
    bindAdvSlider('subjectWeight', 'subjectWeightValue', 'subjectWeight');
    bindAdvSlider('environmentWeight', 'environmentWeightValue', 'environmentWeight');
    bindAdvSlider('styleWeight', 'styleWeightValue', 'styleWeight');
    bindAdvSlider('colorWeight', 'colorWeightValue', 'colorWeight');
  }

  function bindSelect(elId, stateKey) {
    const el = document.getElementById(elId);
    el.addEventListener('change', () => {
      state[stateKey] = el.value || null;
      regenerate();
      saveDraft();
    });
  }

  function bindAdvSlider(sliderId, outputId, stateKey) {
    const slider = document.getElementById(sliderId);
    const output = document.getElementById(outputId);
    global.PFUI.bindSlider(slider, output, (val) => {
      state[stateKey] = val;
      regenerate();
      saveDraft();
    });
  }

  /* ---------- Output actions ---------- */
  function initOutputActions() {
    document.getElementById('generateBtn').addEventListener('click', () => {
      regenerate(true); // force log to history
      global.PFUI.toast('New prompt generated & saved to history', 'success');
    });

    document.getElementById('saveFavoriteBtn').addEventListener('click', () => {
      const result = currentResult;
      if (!result || !result.prompt) {
        global.PFUI.toast('Generate a prompt first', 'error');
        return;
      }
      const added = global.PFStorage.addToFavorites({
        prompt: result.prompt,
        negative: result.negative,
        meta: result.meta
      });
      if (added) {
        global.PFUI.toast('Saved to favorites', 'success');
        renderHistory();
      } else {
        global.PFUI.toast('Already in favorites', 'error');
      }
    });

    document.getElementById('clearBtn').addEventListener('click', () => {
      if (!confirm('Clear all fields and reset the generator?')) return;
      clearAll();
    });
  }

  function clearAll() {
    // Reset state
    Object.keys(state).forEach(k => {
      if (Array.isArray(state[k])) state[k] = [];
      else if (typeof state[k] === 'object' && state[k] !== null) state[k] = null;
      else if (typeof state[k] === 'number') state[k] = k === 'strength' ? 60 : (k.endsWith('Weight') ? 70 : 0);
      else state[k] = '';
    });
    state.strength = 60;
    state.subjectWeight = 80;
    state.environmentWeight = 60;
    state.styleWeight = 70;
    state.colorWeight = 50;

    // Reset DOM
    document.querySelectorAll('.search-input').forEach(i => i.value = '');
    document.querySelectorAll('.search-selected').forEach(t => t.remove());
    document.querySelectorAll('.text-input').forEach(i => i.value = '');
    document.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
    document.querySelectorAll('.chip.active').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.ratio-card.active, .palette-card.active').forEach(c => c.classList.remove('active'));

    // Reset sliders
    const strengthSlider = document.getElementById('strengthSlider');
    strengthSlider.value = 60;
    global.PFUI.bindSlider(strengthSlider, document.getElementById('strengthValue'), () => {}).update();
    ['subjectWeight', 'environmentWeight', 'styleWeight', 'colorWeight'].forEach(id => {
      const slider = document.getElementById(id);
      slider.value = state[id];
      global.PFUI.bindSlider(slider, document.getElementById(id + 'Value'), () => {}).update();
    });

    // Reset colors
    document.getElementById('primaryColor').value = '#3B82F6';
    document.getElementById('primaryHex').value = '#3B82F6';
    document.getElementById('secondaryColor').value = '#1E40AF';
    document.getElementById('secondaryHex').value = '#1E40AF';
    document.getElementById('accentColor').value = '#93C5FD';
    document.getElementById('accentHex').value = '#93C5FD';
    state.primaryColor = '#3B82F6';
    state.secondaryColor = '#1E40AF';
    state.accentColor = '#93C5FD';
    updatePalettePreview();

    // Reset image previews
    document.querySelectorAll('.image-preview-grid').forEach(g => g.innerHTML = '');

    // Clear storage draft
    global.PFStorage.clearDraft();

    regenerate();
    global.PFUI.toast('All fields cleared', 'success');
  }

  /* ---------- Copy buttons ---------- */
  function initCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.copy;
        const text = type === 'prompt' ? currentResult.prompt : currentResult.negative;
        global.PFUI.copyText(text);
      });
    });
  }

  /* ---------- Regenerate (core) ---------- */
  let currentResult = { prompt: '', negative: '', meta: {} };

  function regenerate(logToHistory) {
    currentResult = global.PFGenerator.generate(state);
    const promptEl = document.getElementById('promptOutput');
    const negEl = document.getElementById('negativeOutput');
    promptEl.textContent = currentResult.prompt || '';
    negEl.textContent = currentResult.negative || '';

    if (logToHistory && currentResult.prompt) {
      global.PFStorage.addToHistory({
        prompt: currentResult.prompt,
        negative: currentResult.negative,
        meta: currentResult.meta
      });
      renderHistory();
    }
    saveDraft();
  }

  /* ---------- History panel ---------- */
  function initHistoryTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('tab-active'));
        btn.classList.add('tab-active');
        activeTab = btn.dataset.tab;
        renderHistory();
      });
    });
  }

  function renderHistory() {
    const list = document.getElementById('historyList');
    let items = [];
    if (activeTab === 'recent') items = global.PFStorage.getRecent();
    else if (activeTab === 'favorites') items = global.PFStorage.getFavorites();
    else items = global.PFStorage.getHistory();

    list.innerHTML = '';
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.innerHTML =
        '<div class="history-item-head">' +
          '<span class="history-item-title">' + escapeHtml((item.meta && item.meta.aiPreset) || 'Prompt') + '</span>' +
          '<span class="history-item-meta">' + global.PFStorageFormatTime(item.createdAt) + '</span>' +
        '</div>' +
        '<div class="history-item-text">' + escapeHtml(item.prompt) + '</div>' +
        '<div class="history-item-actions">' +
          '<button type="button" data-act="load">Load</button>' +
          '<button type="button" data-act="copy">Copy</button>' +
          (item.favorite ? '<button type="button" class="danger" data-act="remove">Remove</button>'
                         : '<button type="button" data-act="fav">★ Favorite</button>') +
        '</div>';

      el.querySelector('[data-act="load"]').addEventListener('click', (e) => {
        e.stopPropagation();
        loadFromHistory(item);
      });
      el.querySelector('[data-act="copy"]').addEventListener('click', (e) => {
        e.stopPropagation();
        global.PFUI.copyText(item.prompt);
      });
      const favBtn = el.querySelector('[data-act="fav"]');
      if (favBtn) favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const added = global.PFStorage.addToFavorites({ prompt: item.prompt, negative: item.negative, meta: item.meta });
        if (added) { global.PFUI.toast('Added to favorites', 'success'); renderHistory(); }
        else global.PFUI.toast('Already in favorites', 'error');
      });
      const rmBtn = el.querySelector('[data-act="remove"]');
      if (rmBtn) rmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        global.PFStorage.removeFromFavorites(item.id);
        renderHistory();
        global.PFUI.toast('Removed from favorites', 'success');
      });

      el.addEventListener('click', () => loadFromHistory(item));
      list.appendChild(el);
    });
  }

  function loadFromHistory(item) {
    // Load prompt text into output (read-only view)
    document.getElementById('promptOutput').textContent = item.prompt;
    document.getElementById('negativeOutput').textContent = item.negative || '';
    currentResult = { prompt: item.prompt, negative: item.negative || '', meta: item.meta || {} };
    global.PFUI.toast('Loaded from history — adjust controls to edit', 'success');
  }

  /* ---------- Draft auto-save / restore ---------- */
  let draftTimer = null;
  function saveDraft() {
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => {
      global.PFStorage.saveDraft(state);
    }, 500);
  }

  function restoreDraft() {
    const draft = global.PFStorage.getDraft();
    if (!draft) return;
    try {
      Object.assign(state, draft);
      // Restore simple inputs
      if (state.subjectText) document.getElementById('subjectText').value = state.subjectText;
      if (state.customPosterType) document.getElementById('customPosterType').value = state.customPosterType;
      if (state.customArtStyle) document.getElementById('customArtStyle').value = state.customArtStyle;
      if (state.customCameraAngle) document.getElementById('customCameraAngle').value = state.customCameraAngle;
      if (state.customLighting) document.getElementById('customLighting').value = state.customLighting;
      if (state.customBackground) document.getElementById('customBackground').value = state.customBackground;
      if (state.customMood) document.getElementById('customMood').value = state.customMood;
      if (state.customTypography) document.getElementById('customTypography').value = state.customTypography;
      if (state.customNegative) document.getElementById('customNegative').value = state.customNegative;
      // Sliders
      const ss = document.getElementById('strengthSlider');
      ss.value = state.strength;
      global.PFUI.bindSlider(ss, document.getElementById('strengthValue'), () => {}).update();
      ['subjectWeight', 'environmentWeight', 'styleWeight', 'colorWeight'].forEach(id => {
        const slider = document.getElementById(id);
        slider.value = state[id];
        global.PFUI.bindSlider(slider, document.getElementById(id + 'Value'), () => {}).update();
      });
      // Colors
      document.getElementById('primaryColor').value = state.primaryColor;
      document.getElementById('primaryHex').value = state.primaryColor.toUpperCase();
      document.getElementById('secondaryColor').value = state.secondaryColor;
      document.getElementById('secondaryHex').value = state.secondaryColor.toUpperCase();
      document.getElementById('accentColor').value = state.accentColor;
      document.getElementById('accentHex').value = state.accentColor.toUpperCase();
      updatePalettePreview();
      global.PFUI.toast('Draft restored', 'success');
    } catch (err) {
      console.warn('Draft restore failed', err);
    }
  }

  /* ---------- Helpers ---------- */
  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function escapeHtml(s) { return global.PFUI.escapeHtml(s); }

  // Expose for debugging
  global.PFApp = { state: state, regenerate: regenerate };
})(window);
