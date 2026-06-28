/* =========================================================
   PromptForge — app.js
   Main application wiring. Initializes all UI components,
   reads/writes state, drives the generator + history UI.
   ========================================================= */
(function (global) {
  "use strict";

  const D = global.PF_DATA;
  const { ComboBox, Accordion, Generator, History } = global.PF;

  /* ===========================================================
     Central app state
     =========================================================== */
  const state = {
    projectTypeCategory: "Gaming",
    projectTypePreset:   "Minecraft",
    projectTypeCustom:   "",
    subjectText:         "",
    subjectImages:       [], // dataURLs
    artStyle:            null,
    artStyleCustom:      "",
    cameraAngle:         null,
    cameraAngleCustom:   "",
    lighting:            null,
    lightingCustom:      "",
    colorMode:           "single", // single | dual | multi
    colors:              ["#3B82F6"],
    background:          null,
    backgroundCustom:    "",
    backgroundImages:    [],
    mood:                null,
    moodCustom:          "",
    typography:          null,
    typographyCustom:    "",
    effects:             [], // multi
    aspectRatio:         "16:9",
    composition:         null, // single
    renderingQuality:    "High", // default
    promptExpansion:     "Detailed",
    aiPreset:            "ChatGPT Images",
    // last generated
    lastResult:          null
  };

  /* ComboBox instances registry */
  const combos = {};

  /* ===========================================================
     Toast
     =========================================================== */
  const toastEl = document.getElementById("toast");
  let toastTimer = null;
  function toast(msg, kind) {
    toastEl.textContent = msg;
    toastEl.className = "toast is-visible" + (kind ? " toast--" + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.className = "toast" + (kind ? " toast--" + kind : "");
    }, 2400);
  }

  /* ===========================================================
     Helpers
     =========================================================== */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function copyToClipboard(text) {
    if (!text) return Promise.resolve(false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  /* ===========================================================
     Initialize Accordions
     =========================================================== */
  Accordion.init(document);

  /* ===========================================================
     Initialize ComboBoxes
     =========================================================== */
  function initComboboxes() {
    // Project Type — category
    const ptCatEl = $('[data-combobox="projectTypeCategory"]');
    const ptPresetEl = $('[data-combobox="projectTypePreset"]');
    const artStyleEl = $('[data-combobox="artStyle"]');
    const cameraAngleEl = $('[data-combobox="cameraAngle"]');
    const lightingEl = $('[data-combobox="lighting"]');
    const backgroundEl = $('[data-combobox="background"]');
    const moodEl = $('[data-combobox="mood"]');
    const typographyEl = $('[data-combobox="typography"]');

    // Category combobox — flat list of category names
    const catNames = Object.keys(D.PROJECT_TYPE);
    combos.projectTypeCategory = ComboBox.create(ptCatEl, {
      mode: "single",
      options: catNames.map(function (c) { return { value: c, phrase: c }; }),
      placeholder: "Select category…",
      onChange: function (val) {
        state.projectTypeCategory = val;
        // Rebuild preset combobox for the new category. If the current
        // preset value isn't in the new category's list, clear it.
        rebuildProjectTypePresets(val);
      }
    });
    combos.projectTypeCategory.setValue(state.projectTypeCategory);

    // Preset combobox (initial) — rebuilt by setValue above; ensure default applied
    setTimeout(function () {
      if (state.projectTypePreset && combos.projectTypePreset) {
        combos.projectTypePreset.setValue(state.projectTypePreset);
      }
    }, 0);

    // Art Style
    combos.artStyle = ComboBox.create(artStyleEl, {
      mode: "single",
      options: D.ART_STYLE,
      placeholder: "Search art styles…",
      allowCustom: true,
      onChange: function (val) { state.artStyle = val; }
    });

    // Camera Angle
    combos.cameraAngle = ComboBox.create(cameraAngleEl, {
      mode: "single",
      options: D.CAMERA_ANGLE,
      placeholder: "Search camera angles…",
      allowCustom: true,
      onChange: function (val) { state.cameraAngle = val; }
    });

    // Lighting
    combos.lighting = ComboBox.create(lightingEl, {
      mode: "single",
      options: D.LIGHTING,
      placeholder: "Search lighting…",
      allowCustom: true,
      onChange: function (val) { state.lighting = val; }
    });

    // Background
    combos.background = ComboBox.create(backgroundEl, {
      mode: "single",
      options: D.BACKGROUND,
      placeholder: "Search backgrounds…",
      allowCustom: true,
      onChange: function (val) { state.background = val; }
    });

    // Mood
    combos.mood = ComboBox.create(moodEl, {
      mode: "single",
      options: D.MOOD,
      placeholder: "Search moods…",
      allowCustom: true,
      onChange: function (val) { state.mood = val; }
    });

    // Typography
    combos.typography = ComboBox.create(typographyEl, {
      mode: "single",
      options: D.TYPOGRAPHY,
      placeholder: "Search typography styles…",
      allowCustom: true,
      onChange: function (val) { state.typography = val; }
    });
  }

  function rebuildProjectTypePresets(category) {
    const el = $('[data-combobox="projectTypePreset"]');
    if (!el) return;
    el.innerHTML = "";
    const presets = D.PROJECT_TYPE[category] || [];
    // If the currently-held preset value isn't valid for this category, clear it
    if (state.projectTypePreset && !presets.some(function (p) { return p.value === state.projectTypePreset; })) {
      state.projectTypePreset = null;
    }
    combos.projectTypePreset = ComboBox.create(el, {
      mode: "single",
      options: presets.map(function (p) { return { value: p.value, phrase: p.phrase }; }),
      placeholder: "Select preset…",
      allowCustom: true,
      onChange: function (val) { state.projectTypePreset = val; }
    });
  }

  /* ===========================================================
     Custom text inputs
     =========================================================== */
  function bindInputs() {
    const map = {
      "projectType-custom":   "projectTypeCustom",
      "subject-text":         "subjectText",
      "artStyle-custom":      "artStyleCustom",
      "cameraAngle-custom":   "cameraAngleCustom",
      "lighting-custom":      "lightingCustom",
      "background-custom":    "backgroundCustom",
      "mood-custom":          "moodCustom",
      "typography-custom":    "typographyCustom"
    };
    Object.keys(map).forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", function () { state[map[id]] = el.value; });
    });
  }

  /* ===========================================================
     Color palette
     =========================================================== */
  function initColorPalette() {
    const modeBar = $("#colorMode");
    const colorRow = $("#colorRow");
    const addBtn = $("#colorAddBtn");
    const preview = $("#palettePreview");

    function maxForMode(m) { return m === "single" ? 1 : m === "dual" ? 2 : 6; }

    function syncAddBtn() {
      const max = maxForMode(state.colorMode);
      addBtn.hidden = !(state.colorMode === "multi") || state.colors.length >= max;
    }

    function renderSlots() {
      const max = maxForMode(state.colorMode);
      // Trim if needed
      if (state.colors.length > max) state.colors.length = max;
      // Ensure at least one slot
      if (state.colors.length === 0) state.colors.push("#3B82F6");

      colorRow.innerHTML = "";
      state.colors.forEach(function (c, i) {
        const slot = document.createElement("div");
        slot.className = "color-slot";
        slot.dataset.slot = i;
        slot.innerHTML =
          '<input type="color" class="color-slot__picker" value="' + c + '" />' +
          '<input type="text" class="color-slot__hex" value="' + c.toUpperCase() + '" maxlength="7" />' +
          ((state.colors.length > 1) ?
            '<button class="color-slot__remove" type="button" aria-label="Remove color"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>'
            : "");

        const picker = slot.querySelector(".color-slot__picker");
        const hex = slot.querySelector(".color-slot__hex");
        const remove = slot.querySelector(".color-slot__remove");

        picker.addEventListener("input", function () {
          state.colors[i] = picker.value;
          hex.value = picker.value.toUpperCase();
          renderPreview();
        });
        hex.addEventListener("input", function () {
          let v = hex.value.trim();
          if (v && !v.startsWith("#")) v = "#" + v;
          if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
            state.colors[i] = v;
            picker.value = v;
            renderPreview();
          }
        });
        hex.addEventListener("blur", function () {
          hex.value = (state.colors[i] || "#3B82F6").toUpperCase();
        });
        if (remove) {
          remove.addEventListener("click", function () {
            state.colors.splice(i, 1);
            renderSlots();
            renderPreview();
            syncAddBtn();
          });
        }
        colorRow.appendChild(slot);
      });
    }

    function renderPreview() {
      preview.innerHTML = "";
      if (!state.colors.length) {
        preview.classList.add("is-empty");
        return;
      }
      preview.classList.remove("is-empty");
      state.colors.forEach(function (c) {
        const seg = document.createElement("div");
        seg.className = "palette-preview__seg";
        seg.style.background = c;
        seg.textContent = c.toUpperCase();
        preview.appendChild(seg);
      });
    }

    modeBar.addEventListener("click", function (e) {
      const btn = e.target.closest(".seg__btn");
      if (!btn) return;
      $all(".seg__btn", modeBar).forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      state.colorMode = btn.dataset.mode;
      renderSlots();
      renderPreview();
      syncAddBtn();
    });

    addBtn.addEventListener("click", function () {
      const max = maxForMode(state.colorMode);
      if (state.colors.length < max) {
        // Pick a different color than the last
        const palette = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];
        const next = palette.find(function (p) { return !state.colors.includes(p); }) || "#94A3B8";
        state.colors.push(next);
        renderSlots();
        renderPreview();
        syncAddBtn();
      }
    });

    renderSlots();
    renderPreview();
    syncAddBtn();
  }

  /* ===========================================================
     Effects multi-select chips
     =========================================================== */
  const CHIP_GRID_DATA_KEY = {
    effectsGrid: "EFFECTS",
    compositionGrid: "COMPOSITION",
    renderingGrid: "RENDERING_QUALITY",
    expansionGrid: "PROMPT_EXPANSION",
    aiPresetGrid: "AI_PRESETS"
  };

  function initChipGrid(elId, stateKey, single) {
    const el = document.getElementById(elId);
    if (!el) return null;
    const isSingle = el.dataset.single === "1" || single;
    el.innerHTML = "";
    const list = D[CHIP_GRID_DATA_KEY[elId]];
    if (!list) return null;
    list.forEach(function (item) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "chip";
      chip.textContent = item.value;
      chip.dataset.value = item.value;
      chip.addEventListener("click", function () {
        if (isSingle) {
          $all(".chip", el).forEach(function (c) {
            if (c !== chip) c.classList.remove("is-active");
          });
          chip.classList.toggle("is-active");
          if (chip.classList.contains("is-active")) {
            state[stateKey] = item.value;
          } else {
            state[stateKey] = null;
          }
        } else {
          chip.classList.toggle("is-active");
          if (chip.classList.contains("is-active")) {
            if (!state[stateKey].includes(item.value)) state[stateKey].push(item.value);
          } else {
            state[stateKey] = state[stateKey].filter(function (v) { return v !== item.value; });
          }
        }
      });
      el.appendChild(chip);
    });

    // Pre-activate defaults
    function activate(val) {
      if (!val) return;
      const chip = el.querySelector('.chip[data-value="' + val + '"]');
      if (chip) chip.classList.add("is-active");
    }
    return { activate: activate };
  }

  function initEffects() { return initChipGrid("effectsGrid", "effects"); }
  function initComposition() {
    const c = initChipGrid("compositionGrid", "composition");
    if (state.composition) c.activate(state.composition);
  }
  function initRendering() {
    const c = initChipGrid("renderingGrid", "renderingQuality");
    if (state.renderingQuality) c.activate(state.renderingQuality);
  }
  function initExpansion() {
    const c = initChipGrid("expansionGrid", "promptExpansion");
    if (state.promptExpansion) c.activate(state.promptExpansion);
  }
  function initAiPreset() {
    const c = initChipGrid("aiPresetGrid", "aiPreset");
    if (state.aiPreset) c.activate(state.aiPreset);
  }

  /* ===========================================================
     Aspect ratio grid
     =========================================================== */
  function initAspectRatios() {
    const grid = $("#ratioGrid");
    if (!grid) return;
    grid.innerHTML = "";
    D.ASPECT_RATIOS.forEach(function (r) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ratio";
      btn.dataset.value = r.value;
      if (r.value === state.aspectRatio) btn.classList.add("is-active");

      // Compute preview shape (max 24px on long edge)
      const maxEdge = 22;
      const long = Math.max(r.w, r.h);
      const w = Math.round((r.w / long) * maxEdge);
      const h = Math.round((r.h / long) * maxEdge);

      btn.innerHTML =
        '<span class="ratio__shape" style="width:' + w + 'px;height:' + h + 'px"></span>' +
        '<span class="ratio__label">' + r.value + '</span>';

      btn.addEventListener("click", function () {
        $all(".ratio", grid).forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        state.aspectRatio = r.value;
      });
      grid.appendChild(btn);
    });
  }

  /* ===========================================================
     Dropzone (image upload) — reusable
     =========================================================== */
  function initDropzone(rootId, inputId, previewsId, stateKey) {
    const dz = document.getElementById(rootId);
    const input = document.getElementById(inputId);
    const previews = document.getElementById(previewsId);
    if (!dz || !input || !previews) return;

    function handleFiles(files) {
      Array.from(files).forEach(function (file) {
        if (!file.type.startsWith("image/")) return;
        const reader = new FileReader();
        reader.onload = function (e) {
          const url = e.target.result;
          state[stateKey].push(url);
          const wrap = document.createElement("div");
          wrap.className = "preview";
          wrap.innerHTML =
            '<img src="' + url + '" alt="preview" />' +
            '<button class="preview__remove" type="button" aria-label="Remove"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>';
          wrap.querySelector(".preview__remove").addEventListener("click", function () {
            const idx = state[stateKey].indexOf(url);
            if (idx >= 0) state[stateKey].splice(idx, 1);
            wrap.remove();
          });
          previews.appendChild(wrap);
        };
        reader.readAsDataURL(file);
      });
    }

    // Click to browse (handled by input overlay)
    input.addEventListener("change", function () {
      handleFiles(input.files);
      input.value = "";
    });

    // Drag and drop
    ["dragenter", "dragover"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dz.classList.add("is-dragover");
      });
    });
    ["dragleave", "drop"].forEach(function (ev) {
      dz.addEventListener(ev, function (e) {
        e.preventDefault();
        e.stopPropagation();
        dz.classList.remove("is-dragover");
      });
    });
    dz.addEventListener("drop", function (e) {
      if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });

    // Keyboard accessibility on dropzone
    dz.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        input.click();
      }
    });
  }

  /* ===========================================================
     Generate / Clear / Copy / Save
     =========================================================== */
  const promptOutput = $("#promptOutput");
  const negativeOutput = $("#negativeOutput");
  const outputMeta = $("#outputMeta");
  const saveFavBtn = $("#saveFavoriteBtn");
  const saveHistBtn = $("#saveHistoryBtn");

  function renderOutput(result) {
    if (!result) {
      promptOutput.innerHTML = '<span class="output__placeholder">Configure options on the left, then press <strong>Generate</strong>.</span>';
      negativeOutput.innerHTML = '<span class="output__placeholder">Negative prompt will appear here.</span>';
      outputMeta.innerHTML = "";
      saveFavBtn.disabled = true;
      saveHistBtn.disabled = true;
      return;
    }

    promptOutput.textContent = result.prompt;
    negativeOutput.textContent = result.negative;

    outputMeta.innerHTML = "";
    result.meta.forEach(function (m) {
      const pill = document.createElement("span");
      pill.className = "meta-pill";
      pill.innerHTML = "<strong>" + m.label + ":</strong> " + m.value;
      outputMeta.appendChild(pill);
    });

    saveFavBtn.disabled = false;
    saveHistBtn.disabled = false;
  }

  function doGenerate() {
    const result = Generator.generate(state);
    if (!result || !result.prompt) {
      toast("Add at least one option first.", "error");
      return;
    }
    result.id = History.makeId();
    state.lastResult = result;
    renderOutput(result);
    // Auto-save to history
    History.addToHistory({
      id: result.id,
      prompt: result.prompt,
      negative: result.negative,
      state: state,
      timestamp: result.timestamp
    });
    renderHistory();
    renderFavorites();
    toast("Prompt generated & saved to history.", "success");
  }

  function doClear() {
    // Clear only the output panel
    state.lastResult = null;
    renderOutput(null);
    toast("Output cleared.");
  }

  function doResetAll() {
    // Reset everything to defaults
    state.subjectText = "";
    state.subjectImages = [];
    state.artStyle = null; state.artStyleCustom = "";
    state.cameraAngle = null; state.cameraAngleCustom = "";
    state.lighting = null; state.lightingCustom = "";
    state.background = null; state.backgroundCustom = "";
    state.backgroundImages = [];
    state.mood = null; state.moodCustom = "";
    state.typography = null; state.typographyCustom = "";
    state.effects = [];
    state.composition = null;
    state.colors = ["#3B82F6"];
    state.colorMode = "single";
    state.projectTypeCategory = "Gaming";
    state.projectTypePreset = "Minecraft";
    state.projectTypeCustom = "";
    state.aspectRatio = "16:9";
    state.renderingQuality = "High";
    state.promptExpansion = "Detailed";
    state.aiPreset = "ChatGPT Images";
    state.lastResult = null;

    // Reset UI
    Object.keys(combos).forEach(function (k) {
      if (combos[k] && combos[k].clear) combos[k].clear();
    });
    $all("input[type=text], textarea").forEach(function (el) {
      if (!el.closest(".combobox")) el.value = "";
    });
    $all(".chip").forEach(function (c) { c.classList.remove("is-active"); });
    $all(".preview").forEach(function (p) { p.remove(); });

    // Re-apply defaults to UI
    if (combos.projectTypeCategory) combos.projectTypeCategory.setValue("Gaming");
    setTimeout(function () {
      if (combos.projectTypePreset) combos.projectTypePreset.setValue("Minecraft");
    }, 50);
    initAspectRatios();
    // Re-activate default chips
    $all("#renderingGrid .chip[data-value='High']").forEach(function (c) { c.classList.add("is-active"); });
    state.renderingQuality = "High";
    $all("#expansionGrid .chip[data-value='Detailed']").forEach(function (c) { c.classList.add("is-active"); });
    state.promptExpansion = "Detailed";
    $all("#aiPresetGrid .chip[data-value='ChatGPT Images']").forEach(function (c) { c.classList.add("is-active"); });
    state.aiPreset = "ChatGPT Images";
    initColorPalette();

    renderOutput(null);
    toast("All fields reset to defaults.");
  }

  /* ===========================================================
     History / Favorites UI
     =========================================================== */
  function renderEntry(entry, isFav) {
    const card = document.createElement("div");
    card.className = "entry";
    card.dataset.id = entry.id;

    const title = entry.state && entry.state.aiPreset ? entry.state.aiPreset + " · " + (entry.state.aspectRatio || "") : "Prompt";

    const head = document.createElement("div");
    head.className = "entry__head";
    head.innerHTML =
      '<span class="entry__title">' + (title || "Prompt").trim() + '</span>' +
      '<span class="entry__time">' + History.timeAgo(entry.timestamp) + '</span>';

    const body = document.createElement("div");
    body.className = "entry__prompt";
    body.textContent = entry.prompt;

    const actions = document.createElement("div");
    actions.className = "entry__actions";

    // Restore
    const restoreBtn = document.createElement("button");
    restoreBtn.className = "entry__btn";
    restoreBtn.type = "button";
    restoreBtn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg> Restore';
    restoreBtn.addEventListener("click", function () { restoreEntry(entry); });

    // Copy
    const copyBtn = document.createElement("button");
    copyBtn.className = "entry__btn";
    copyBtn.type = "button";
    copyBtn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg> Copy';
    copyBtn.addEventListener("click", function () {
      copyToClipboard(entry.prompt).then(function (ok) {
        toast(ok ? "Prompt copied." : "Copy failed.", ok ? "success" : "error");
      });
    });

    // Star (toggle favorite)
    const starBtn = document.createElement("button");
    starBtn.className = "entry__btn entry__btn--star" + (isFav ? " is-active" : "");
    starBtn.type = "button";
    starBtn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z"/></svg> ' + (isFav ? "Favorited" : "Favorite");
    starBtn.addEventListener("click", function () {
      if (History.isFavorite(entry.id)) {
        History.removeFromFavorites(entry.id);
        toast("Removed from favorites.");
      } else {
        History.addToFavorites(entry);
        toast("Saved to favorites.", "success");
      }
      renderFavorites();
      renderHistory();
    });

    // Delete
    const delBtn = document.createElement("button");
    delBtn.className = "entry__btn entry__btn--danger";
    delBtn.type = "button";
    delBtn.innerHTML = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg> Delete';
    delBtn.addEventListener("click", function () {
      if (isFav) {
        History.removeFromFavorites(entry.id);
        renderFavorites();
      } else {
        History.removeFromHistory(entry.id);
        renderHistory();
      }
      toast("Deleted.");
    });

    actions.appendChild(restoreBtn);
    actions.appendChild(copyBtn);
    actions.appendChild(starBtn);
    actions.appendChild(delBtn);

    card.appendChild(head);
    card.appendChild(body);
    card.appendChild(actions);
    return card;
  }

  function renderHistory() {
    const list = $("#historyList");
    if (!list) return;
    list.innerHTML = "";
    const items = History.getHistory();
    if (items.length === 0) {
      list.innerHTML = '<div class="history__empty">No history yet. Generate a prompt to see it here.</div>';
      return;
    }
    items.forEach(function (e) { list.appendChild(renderEntry(e, History.isFavorite(e.id))); });
  }

  function renderFavorites() {
    const list = $("#favoritesList");
    if (!list) return;
    list.innerHTML = "";
    const items = History.getFavorites();
    if (items.length === 0) {
      list.innerHTML = '<div class="history__empty">No favorites yet. Star a prompt to save it here.</div>';
      return;
    }
    items.forEach(function (e) { list.appendChild(renderEntry(e, true)); });
  }

  function restoreEntry(entry) {
    // Restore state from entry
    if (entry.state) {
      Object.keys(entry.state).forEach(function (k) {
        if (k === "lastResult") return;
        if (k === "subjectImages" || k === "backgroundImages") {
          state[k] = (entry.state[k] || []).slice();
        } else {
          state[k] = entry.state[k];
        }
      });
    }
    // Re-sync UI
    syncUIFromState();
    renderOutput({
      prompt: entry.prompt,
      negative: entry.negative,
      meta: [],
      state: entry.state,
      timestamp: entry.timestamp,
      id: entry.id
    });
    state.lastResult = { prompt: entry.prompt, negative: entry.negative, id: entry.id, timestamp: entry.timestamp };
    saveFavBtn.disabled = false;
    saveHistBtn.disabled = false;
    toast("Restored. Press Generate to regenerate.");
  }

  function syncUIFromState() {
    if (state.projectTypeCategory && combos.projectTypeCategory) combos.projectTypeCategory.setValue(state.projectTypeCategory);
    setTimeout(function () {
      if (state.projectTypePreset && combos.projectTypePreset) combos.projectTypePreset.setValue(state.projectTypePreset);
    }, 50);
    if (state.artStyle && combos.artStyle) combos.artStyle.setValue(state.artStyle);
    if (state.cameraAngle && combos.cameraAngle) combos.cameraAngle.setValue(state.cameraAngle);
    if (state.lighting && combos.lighting) combos.lighting.setValue(state.lighting);
    if (state.background && combos.background) combos.background.setValue(state.background);
    if (state.mood && combos.mood) combos.mood.setValue(state.mood);
    if (state.typography && combos.typography) combos.typography.setValue(state.typography);

    const textMap = {
      "projectType-custom": "projectTypeCustom",
      "subject-text": "subjectText",
      "artStyle-custom": "artStyleCustom",
      "cameraAngle-custom": "cameraAngleCustom",
      "lighting-custom": "lightingCustom",
      "background-custom": "backgroundCustom",
      "mood-custom": "moodCustom",
      "typography-custom": "typographyCustom"
    };
    Object.keys(textMap).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.value = state[textMap[id]] || "";
    });

    // Chips
    $all(".chip-grid").forEach(function (grid) {
      $all(".chip", grid).forEach(function (chip) { chip.classList.remove("is-active"); });
    });
    const activeChips = [
      { grid: "effectsGrid", values: state.effects },
      { grid: "compositionGrid", values: state.composition ? [state.composition] : [] },
      { grid: "renderingGrid", values: state.renderingQuality ? [state.renderingQuality] : [] },
      { grid: "expansionGrid", values: state.promptExpansion ? [state.promptExpansion] : [] },
      { grid: "aiPresetGrid", values: state.aiPreset ? [state.aiPreset] : [] }
    ];
    activeChips.forEach(function (g) {
      const grid = document.getElementById(g.grid);
      if (!grid) return;
      g.values.forEach(function (v) {
        const chip = grid.querySelector('.chip[data-value="' + v + '"]');
        if (chip) chip.classList.add("is-active");
      });
    });

    // Aspect ratio
    $all("#ratioGrid .ratio").forEach(function (r) {
      r.classList.toggle("is-active", r.dataset.value === state.aspectRatio);
    });

    // Color palette: rebuild via re-init
    initColorPalette();
  }

  /* ===========================================================
     Navbar: smooth scroll + scroll-spy
     =========================================================== */
  function initNav() {
    const links = $all(".nav__link");
    links.forEach(function (link) {
      link.addEventListener("click", function (e) {
        const target = link.getAttribute("href");
        if (target && target.startsWith("#")) {
          e.preventDefault();
          const el = document.querySelector(target);
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      });
    });

    // Scroll spy: highlight active nav link
    const sections = ["generator", "history", "favorites"]
      .map(function (id) { return { id: id, el: document.getElementById(id) }; })
      .filter(function (s) { return s.el; });

    function onScroll() {
      const scrollY = window.scrollY + 120;
      let activeId = sections[0] && sections[0].id;
      sections.forEach(function (s) {
        if (s.el.offsetTop <= scrollY) activeId = s.id;
      });
      links.forEach(function (l) {
        l.classList.toggle("is-active", l.getAttribute("href") === "#" + activeId);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ===========================================================
     Wire buttons
     =========================================================== */
  function wireButtons() {
    $("#generateBtn").addEventListener("click", doGenerate);
    $("#clearBtn").addEventListener("click", doClear);
    $("#resetAllBtn").addEventListener("click", doResetAll);

    $("#copyPromptBtn").addEventListener("click", function () {
      if (!state.lastResult || !state.lastResult.prompt) {
        toast("Nothing to copy yet.", "error"); return;
      }
      copyToClipboard(state.lastResult.prompt).then(function (ok) {
        toast(ok ? "Prompt copied." : "Copy failed.", ok ? "success" : "error");
      });
    });
    $("#copyNegativeBtn").addEventListener("click", function () {
      if (!state.lastResult || !state.lastResult.negative) {
        toast("Nothing to copy yet.", "error"); return;
      }
      copyToClipboard(state.lastResult.negative).then(function (ok) {
        toast(ok ? "Negative prompt copied." : "Copy failed.", ok ? "success" : "error");
      });
    });

    $("#saveFavoriteBtn").addEventListener("click", function () {
      if (!state.lastResult) return;
      if (History.isFavorite(state.lastResult.id)) {
        History.removeFromFavorites(state.lastResult.id);
        toast("Removed from favorites.");
      } else {
        History.addToFavorites({
          id: state.lastResult.id,
          prompt: state.lastResult.prompt,
          negative: state.lastResult.negative,
          state: state,
          timestamp: state.lastResult.timestamp || Date.now()
        });
        toast("Saved to favorites.", "success");
      }
      renderFavorites();
      renderHistory();
    });

    $("#saveHistoryBtn").addEventListener("click", function () {
      if (!state.lastResult) return;
      History.addToHistory({
        id: state.lastResult.id,
        prompt: state.lastResult.prompt,
        negative: state.lastResult.negative,
        state: state,
        timestamp: state.lastResult.timestamp || Date.now()
      });
      renderHistory();
      toast("Saved to history.", "success");
    });

    $("#clearHistoryBtn").addEventListener("click", function () {
      if (confirm("Clear all history? This cannot be undone.")) {
        History.clearHistory();
        renderHistory();
        toast("History cleared.");
      }
    });
    $("#clearFavoritesBtn").addEventListener("click", function () {
      if (confirm("Clear all favorites? This cannot be undone.")) {
        History.clearFavorites();
        renderFavorites();
        toast("Favorites cleared.");
      }
    });
  }

  /* ===========================================================
     Footer year
     =========================================================== */
  function setYear() {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
  }

  /* ===========================================================
     Boot
     =========================================================== */
  function boot() {
    initComboboxes();
    bindInputs();
    initColorPalette();
    initEffects();
    initComposition();
    initRendering();
    initExpansion();
    initAiPreset();
    initAspectRatios();
    initDropzone("subject-dropzone", "subject-file", "subject-previews", "subjectImages");
    initDropzone("background-dropzone", "background-file", "background-previews", "backgroundImages");
    wireButtons();
    initNav();
    setYear();
    renderHistory();
    renderFavorites();

    // Keyboard: Ctrl/Cmd+Enter generates
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        doGenerate();
      }
    });

    // Welcome toast
    setTimeout(function () { toast("Welcome to PromptForge. Configure & press Generate."); }, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  // Expose for debugging
  global.PF.app = { state: state, generate: doGenerate };

})(typeof window !== "undefined" ? window : this);
