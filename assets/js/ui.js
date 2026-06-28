/* ==========================================================================
   PromptForge · ui.js
   UI helpers and reusable component behaviors:
   - Collapsible section accordions
   - Dropzone (drag & drop + click-to-browse) for image uploads
   - Color picker ↔ HEX input two-way binding
   - Chip grid (multi-select)
   - Ratio card grid
   - Slider value + progress fill
   - Toast notifications
   - Copy-to-clipboard
   ========================================================================== */

(function (global) {
  'use strict';

  /* ---------- Toast ---------- */
  let toastEl = null;
  let toastTimer = null;

  function toast(message, type) {
    if (!toastEl) toastEl = document.getElementById('toast');
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = 'toast show' + (type ? ' ' + type : '');
    toastEl.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
      setTimeout(() => { toastEl.hidden = true; }, 300);
    }, 2400);
  }

  /* ---------- Copy to clipboard ---------- */
  async function copyText(text) {
    if (!text) {
      toast('Nothing to copy', 'error');
      return false;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast('Copied to clipboard', 'success');
      return true;
    } catch (err) {
      console.error('Copy failed', err);
      toast('Copy failed', 'error');
      return false;
    }
  }

  /* ---------- Collapsible sections (accordion) ---------- */
  function initAccordions(root) {
    root = root || document;
    const headers = root.querySelectorAll('.section-header');
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const expanded = header.getAttribute('aria-expanded') === 'true';
        header.setAttribute('aria-expanded', !expanded);
      });
    });
  }

  /* On mobile, auto-collapse all sections except the first */
  function applyMobileAccordion() {
    if (window.matchMedia('(max-width: 640px)').matches) {
      const sections = document.querySelectorAll('.field-block[data-section]');
      sections.forEach((block, i) => {
        const header = block.querySelector('.section-header');
        if (!header) return;
        if (i === 0) {
          header.setAttribute('aria-expanded', 'true');
        } else {
          header.setAttribute('aria-expanded', 'false');
        }
      });
    }
  }

  /* ---------- Dropzone ---------- */
  function initDropzone(dropzoneEl, inputEl, previewEl, opts) {
    opts = opts || {};
    const multiple = opts.multiple !== false;
    const files = [];

    function openPicker() { inputEl.click(); }

    dropzoneEl.addEventListener('click', openPicker);
    dropzoneEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    });

    ['dragenter', 'dragover'].forEach(ev => {
      dropzoneEl.addEventListener(ev, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneEl.classList.add('drag-over');
      });
    });
    ['dragleave', 'drop'].forEach(ev => {
      dropzoneEl.addEventListener(ev, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzoneEl.classList.remove('drag-over');
      });
    });
    dropzoneEl.addEventListener('drop', (e) => {
      const dropped = Array.from(e.dataTransfer.files || []).filter(f => /^image\/(png|jpe?g|webp)$/.test(f.type));
      if (!dropped.length) return;
      if (!multiple) {
        files.length = 0;
        files.push(dropped[0]);
      } else {
        dropped.forEach(f => files.push(f));
      }
      renderPreviews();
      if (typeof opts.onChange === 'function') opts.onChange(files);
    });

    inputEl.addEventListener('change', () => {
      const picked = Array.from(inputEl.files || []);
      if (!picked.length) return;
      if (!multiple) {
        files.length = 0;
        files.push(picked[0]);
      } else {
        picked.forEach(f => files.push(f));
      }
      renderPreviews();
      if (typeof opts.onChange === 'function') opts.onChange(files);
      inputEl.value = '';
    });

    function renderPreviews() {
      if (!previewEl) return;
      previewEl.innerHTML = '';
      files.forEach((file, idx) => {
        const url = URL.createObjectURL(file);
        const tile = document.createElement('div');
        tile.className = 'preview-tile';
        tile.innerHTML =
          '<img src="' + url + '" alt="Reference preview" />' +
          '<button class="remove" type="button" aria-label="Remove image" data-idx="' + idx + '">×</button>';
        tile.querySelector('.remove').addEventListener('click', (e) => {
          e.stopPropagation();
          files.splice(idx, 1);
          renderPreviews();
          if (typeof opts.onChange === 'function') opts.onChange(files);
        });
        previewEl.appendChild(tile);
      });
    }

    return {
      getFiles() { return files.slice(); },
      clear() {
        files.length = 0;
        renderPreviews();
        if (typeof opts.onChange === 'function') opts.onChange(files);
      }
    };
  }

  /* ---------- Color picker ↔ HEX two-way binding ---------- */
  function bindColorPicker(colorEl, hexEl, onChange) {
    function syncFromColor() {
      hexEl.value = colorEl.value.toUpperCase();
      if (typeof onChange === 'function') onChange(colorEl.value);
    }
    function syncFromHex() {
      let v = hexEl.value.trim();
      if (!v.startsWith('#')) v = '#' + v;
      if (/^#[0-9A-Fa-f]{6}$/.test(v)) {
        colorEl.value = v.toLowerCase();
        if (typeof onChange === 'function') onChange(colorEl.value);
      }
    }
    colorEl.addEventListener('input', syncFromColor);
    hexEl.addEventListener('input', syncFromHex);
    hexEl.addEventListener('blur', syncFromHex);
    return { syncFromColor, syncFromHex };
  }

  /* ---------- Slider with progress fill + live value ---------- */
  function bindSlider(sliderEl, outputEl, onChange) {
    function update() {
      const min = parseFloat(sliderEl.min) || 0;
      const max = parseFloat(sliderEl.max) || 100;
      const val = parseFloat(sliderEl.value);
      const pct = ((val - min) / (max - min)) * 100;
      sliderEl.style.setProperty('--val', pct + '%');
      if (outputEl) outputEl.textContent = val;
      if (typeof onChange === 'function') onChange(val);
    }
    sliderEl.addEventListener('input', update);
    update(); // initialize
    return { update };
  }

  /* ---------- Chip grid (multi-select) ---------- */
  function renderChipGrid(container, items, selectedIds, onToggle) {
    container.innerHTML = '';
    items.forEach(item => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip' + (selectedIds.indexOf(item.id) >= 0 ? ' active' : '');
      chip.dataset.id = item.id;
      chip.innerHTML =
        '<svg class="check" viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M2 6l3 3 5-6"/>' +
        '</svg>' +
        '<span>' + escapeHtml(item.label) + '</span>';
      chip.addEventListener('click', () => {
        if (typeof onToggle === 'function') onToggle(item);
        chip.classList.toggle('active');
      });
      container.appendChild(chip);
    });
  }

  /* ---------- Ratio grid (single select) ---------- */
  function renderRatioGrid(container, items, selectedId, onSelect) {
    container.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'ratio-card' + (selectedId === item.id ? ' active' : '');
      card.dataset.id = item.id;
      // Visual representation
      const maxDim = 36;
      const ratio = item.w / item.h;
      let w, h;
      if (ratio >= 1) { w = maxDim; h = Math.round(maxDim / ratio); }
      else { h = maxDim; w = Math.round(maxDim * ratio); }
      const visual = '<div class="ratio-visual" style="width:' + w + 'px;height:' + h + 'px;"></div>';
      card.innerHTML = visual +
        '<div class="ratio-label">' + escapeHtml(item.id) + '</div>' +
        '<div class="ratio-sub">' + escapeHtml(item.label) + '</div>';
      card.addEventListener('click', () => {
        if (typeof onSelect === 'function') onSelect(item);
        container.querySelectorAll('.ratio-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
      container.appendChild(card);
    });
  }

  /* ---------- Palette grid ---------- */
  function renderPaletteGrid(container, palettes, selectedId, onSelect) {
    container.innerHTML = '';
    palettes.forEach(p => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'palette-card' + (selectedId === p.id ? ' active' : '');
      card.dataset.id = p.id;
      card.innerHTML =
        '<div class="palette-swatches">' +
          '<span style="background:' + p.primary + '"></span>' +
          '<span style="background:' + p.secondary + '"></span>' +
          '<span style="background:' + p.accent + '"></span>' +
        '</div>' +
        '<div class="palette-label">' + escapeHtml(p.label) + '</div>';
      card.addEventListener('click', () => {
        if (typeof onSelect === 'function') onSelect(p);
        container.querySelectorAll('.palette-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      });
      container.appendChild(card);
    });
  }

  /* ---------- Select populate ---------- */
  function populateSelect(selectEl, items, valueKey, labelKey) {
    valueKey = valueKey || 'id';
    labelKey = labelKey || 'label';
    // Preserve first option (usually "— None —")
    const firstOpt = selectEl.querySelector('option');
    selectEl.innerHTML = '';
    if (firstOpt) selectEl.appendChild(firstOpt);
    items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item[valueKey];
      opt.textContent = item[labelKey];
      selectEl.appendChild(opt);
    });
  }

  /* ---------- Helpers ---------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function debounce(fn, wait) {
    let t;
    return function () {
      const ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(ctx, args), wait || 150);
    };
  }

  /* ---------- Public API ---------- */
  global.PFUI = {
    toast: toast,
    copyText: copyText,
    initAccordions: initAccordions,
    applyMobileAccordion: applyMobileAccordion,
    initDropzone: initDropzone,
    bindColorPicker: bindColorPicker,
    bindSlider: bindSlider,
    renderChipGrid: renderChipGrid,
    renderRatioGrid: renderRatioGrid,
    renderPaletteGrid: renderPaletteGrid,
    populateSelect: populateSelect,
    escapeHtml: escapeHtml,
    debounce: debounce
  };
})(window);
