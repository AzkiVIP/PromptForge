/* ==========================================================================
   PromptForge · search.js
   Reusable smart search component.
   - Fuzzy, typo-tolerant matching
   - Category-aware grouping
   - Keyboard navigation (Up/Down/Enter/Esc)
   - Click-to-select
   - Tag chip showing selected item with clear button

   Usage:
     <div class="searchable" data-searchable="poster-types" data-target="posterType">
       <input class="search-input" />
       <div class="search-results"></div>
     </div>

     PFSearch.init(rootEl, {
       data: [...flat items...] OR { categories: [...] },
       onSelect: (item) => {...},
       onClear:  () => {...}
     });
   ========================================================================== */

(function (global) {
  'use strict';

  /* ---------- Fuzzy scoring ----------
   * Returns 0 (no match) or a positive score (higher = better match).
   * Algorithm:
   *  - Exact label match: 1000
   *  - Label starts with query: 800
   *  - Label contains query (consecutive): 500
   *  - Subsequence match (fuzzy): 100 + (run length bonus) - (gap penalty)
   *  - Alias matches apply a small penalty vs label matches
   *  - Typo tolerance: if no subsequence match, try Levenshtein distance <= 2
   */
  function fuzzyScore(query, label, aliases) {
    if (!query) return 0;
    const q = query.toLowerCase().trim();
    const l = label.toLowerCase();

    if (l === q) return 1000;
    if (l.startsWith(q)) return 800 + (q.length / l.length) * 100;
    if (l.includes(q)) return 500 + (q.length / l.length) * 100;

    // Subsequence match
    const subseq = subsequenceMatch(q, l);
    if (subseq.matched) {
      // Reward consecutive runs, penalize gaps
      const gapPenalty = subseq.gaps * 5;
      const runBonus = subseq.runs * 8;
      const base = 200 + (q.length * 10);
      return Math.max(50, base - gapPenalty + runBonus);
    }

    // Alias matches
    if (aliases && aliases.length) {
      let bestAlias = 0;
      for (const a of aliases) {
        const al = a.toLowerCase();
        if (al === q) bestAlias = Math.max(bestAlias, 850);
        else if (al.startsWith(q)) bestAlias = Math.max(bestAlias, 700);
        else if (al.includes(q)) bestAlias = Math.max(bestAlias, 450);
        else {
          const sa = subsequenceMatch(q, al);
          if (sa.matched) bestAlias = Math.max(bestAlias, 150);
        }
      }
      if (bestAlias > 0) return bestAlias;
    }

    // Typo tolerance via Levenshtein (only for short queries to keep it fast)
    if (q.length <= 12) {
      const dist = levenshtein(q, l);
      if (dist <= 2 && dist < q.length) {
        return 80 - dist * 20;
      }
      if (aliases) {
        for (const a of aliases) {
          const d = levenshtein(q, a.toLowerCase());
          if (d <= 2 && d < q.length) return 60 - d * 15;
        }
      }
    }

    return 0;
  }

  function subsequenceMatch(query, text) {
    let qi = 0, gaps = 0, runs = 0, currentRun = 0;
    let lastMatch = -2;
    for (let ti = 0; ti < text.length && qi < query.length; ti++) {
      if (text[ti] === query[qi]) {
        if (ti === lastMatch + 1) currentRun++;
        else { if (currentRun > 0) runs += currentRun; currentRun = 1; }
        lastMatch = ti;
        qi++;
      } else {
        if (lastMatch === ti - 1 && currentRun > 0) {
          gaps++;
        } else if (lastMatch >= 0) {
          gaps++;
        }
      }
    }
    if (currentRun > 0) runs += currentRun;
    return { matched: qi === query.length, gaps, runs };
  }

  function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (Math.abs(m - n) > 3) return 99;
    const dp = [];
    for (let i = 0; i <= m; i++) {
      dp[i] = [i];
      for (let j = 1; j <= n; j++) {
        if (i === 0) { dp[i][j] = j; continue; }
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    return dp[m][n];
  }

  /* ---------- Flatten data source ----------
   * Accepts either:
   *  - Array of items [{id,label,aliases}]
   *  - { categories: [{name, items: [...]}] }
   *  - { items: [...] }
   * Returns { flat: [...], byCategory: [{name, items}] }
   */
  function normalizeData(data) {
    if (Array.isArray(data)) {
      return { flat: data, byCategory: [{ name: 'Results', items: data }] };
    }
    if (data && Array.isArray(data.categories)) {
      const flat = [];
      data.categories.forEach(cat => {
        (cat.items || []).forEach(item => {
          flat.push(Object.assign({ category: cat.name }, item));
        });
      });
      return { flat, byCategory: data.categories.map(c => ({ name: c.name, items: c.items || [] })) };
    }
    if (data && Array.isArray(data.items)) {
      return { flat: data.items, byCategory: [{ name: 'Results', items: data.items }] };
    }
    return { flat: [], byCategory: [] };
  }

  /* ---------- Component factory ---------- */
  function init(rootEl, options) {
    options = options || {};
    const data = options.data || [];
    const normalized = normalizeData(data);

    const input = rootEl.querySelector('.search-input');
    const results = rootEl.querySelector('.search-results');
    if (!input || !results) {
      console.warn('[PromptForge] Searchable missing .search-input or .search-results');
      return null;
    }

    let activeIndex = -1;
    let currentMatches = [];
    let selectedItem = null;

    /* ---------- Render results ---------- */
    function render(query) {
      results.innerHTML = '';

      if (!query) {
        // Show all categories when no query
        normalized.byCategory.forEach(cat => {
          if (!cat.items.length) return;
          const catEl = document.createElement('div');
          catEl.className = 'search-category';
          catEl.textContent = cat.name;
          results.appendChild(catEl);
          cat.items.forEach(item => {
            results.appendChild(buildItem(item, '', cat.name));
          });
        });
        currentMatches = normalized.flat.slice();
      } else {
        // Score & sort
        const scored = [];
        normalized.flat.forEach(item => {
          const score = fuzzyScore(query, item.label || '', item.aliases || []);
          if (score > 0) scored.push({ item, score });
        });
        scored.sort((a, b) => b.score - a.score);
        currentMatches = scored.map(s => s.item);

        if (!currentMatches.length) {
          const empty = document.createElement('div');
          empty.className = 'search-item';
          empty.style.cursor = 'default';
          empty.style.color = 'var(--text-dim)';
          empty.style.fontStyle = 'italic';
          empty.textContent = 'No matches — type your own custom value below.';
          results.appendChild(empty);
          rootEl.classList.add('empty');
          return;
        }
        rootEl.classList.remove('empty');

        // Group matches by original category
        const byCat = {};
        currentMatches.forEach(item => {
          const cat = item.category || 'Results';
          if (!byCat[cat]) byCat[cat] = [];
          byCat[cat].push(item);
        });
        Object.keys(byCat).forEach(cat => {
          const catEl = document.createElement('div');
          catEl.className = 'search-category';
          catEl.textContent = cat;
          results.appendChild(catEl);
          byCat[cat].forEach(item => {
            results.appendChild(buildItem(item, query, cat));
          });
        });
      }

      activeIndex = -1;
      results.scrollTop = 0;
    }

    function buildItem(item, query, category) {
      const el = document.createElement('div');
      el.className = 'search-item';
      el.setAttribute('role', 'option');
      el.dataset.id = item.id;
      el.innerHTML = '<span class="item-label">' + escapeHtml(item.label) + '</span>' +
                     (category ? '<span class="match-hint">' + escapeHtml(category) + '</span>' : '');
      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        select(item);
      });
      return el;
    }

    function highlight(text, query) {
      if (!query) return escapeHtml(text);
      const idx = text.toLowerCase().indexOf(query.toLowerCase());
      if (idx < 0) return escapeHtml(text);
      return escapeHtml(text.slice(0, idx)) +
             '<mark>' + escapeHtml(text.slice(idx, idx + query.length)) + '</mark>' +
             escapeHtml(text.slice(idx + query.length));
    }

    /* ---------- Selection ---------- */
    function select(item) {
      selectedItem = item;
      input.value = item.label;
      rootEl.classList.remove('open');
      renderSelectedTag(item);
      if (typeof options.onSelect === 'function') options.onSelect(item);
    }

    function clearSelection() {
      selectedItem = null;
      input.value = '';
      renderSelectedTag(null);
      if (typeof options.onClear === 'function') options.onClear();
      open();
      input.focus();
    }

    function renderSelectedTag(item) {
      let tag = rootEl.querySelector('.search-selected');
      if (!item) {
        if (tag) tag.remove();
        return;
      }
      if (!tag) {
        tag = document.createElement('div');
        tag.className = 'search-selected';
        rootEl.appendChild(tag);
      }
      tag.innerHTML = '<span>' + escapeHtml(item.label) + '</span>' +
        '<span class="clear" role="button" tabindex="0" aria-label="Clear selection">' +
          '<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M2 2l8 8M10 2l-8 8"/>' +
          '</svg>' +
        '</span>';
      const clearBtn = tag.querySelector('.clear');
      clearBtn.addEventListener('mousedown', (e) => { e.preventDefault(); clearSelection(); });
      clearBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clearSelection(); }
      });
    }

    /* ---------- Combobox chevron ---------- */
    let chevronBtn = null;
    function ensureChevron() {
      if (chevronBtn) return;
      const wrap = rootEl.querySelector('.search-input-wrap');
      if (!wrap) return;
      chevronBtn = document.createElement('button');
      chevronBtn.type = 'button';
      chevronBtn.className = 'search-chevron';
      chevronBtn.setAttribute('aria-label', 'Toggle dropdown');
      chevronBtn.innerHTML =
        '<svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M2 4l4 4 4-4"/>' +
        '</svg>';
      chevronBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        toggle();
      });
      wrap.appendChild(chevronBtn);
    }

    /* ---------- Open/close ---------- */
    function open() {
      rootEl.classList.add('open');
      render(input.value);
    }
    function close() {
      rootEl.classList.remove('open');
    }
    function toggle() {
      if (rootEl.classList.contains('open')) {
        close();
        input.blur();
      } else {
        input.focus();
        open();
      }
    }

    /* ---------- Keyboard navigation ---------- */
    function getVisibleItems() {
      return Array.from(results.querySelectorAll('.search-item:not([style*="cursor: default"])'));
    }

    function setActive(idx) {
      const items = getVisibleItems();
      if (!items.length) return;
      items.forEach(el => el.classList.remove('active'));
      if (idx < 0) idx = items.length - 1;
      if (idx >= items.length) idx = 0;
      items[idx].classList.add('active');
      activeIndex = idx;
      items[idx].scrollIntoView({ block: 'nearest' });
    }

    ensureChevron();

    input.addEventListener('focus', open);
    // Click anywhere in the input wrap toggles the dropdown (combobox feel)
    const wrap = rootEl.querySelector('.search-input-wrap');
    if (wrap) {
      wrap.addEventListener('mousedown', (e) => {
        // Ignore clicks on the chevron button (it has its own handler)
        if (e.target.closest('.search-chevron')) return;
        if (!rootEl.classList.contains('open')) {
          // Let focus happen naturally, then ensure open
          setTimeout(open, 0);
        } else {
          // Already open — clicking input text shouldn't close, but
          // clicking on the empty area of the wrap should toggle.
          if (e.target !== input) {
            e.preventDefault();
            toggle();
          }
        }
      });
    }
    input.addEventListener('input', () => {
      selectedItem = null;
      let tag = rootEl.querySelector('.search-selected');
      if (tag) tag.remove();
      if (typeof options.onClear === 'function') options.onClear();
      open();
    });

    input.addEventListener('keydown', (e) => {
      const items = getVisibleItems();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!rootEl.classList.contains('open')) open();
        setActive(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(activeIndex - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          const id = items[activeIndex].dataset.id;
          const item = currentMatches.find(m => m.id === id);
          if (item) select(item);
        } else if (currentMatches.length) {
          select(currentMatches[0]);
        }
      } else if (e.key === 'Escape') {
        close();
        input.blur();
      } else if (e.key === 'Tab') {
        close();
      }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!rootEl.contains(e.target)) close();
    });

    // Public handle for this instance
    const api = {
      root: rootEl,
      input: input,
      setValue(item) { if (item) select(item); else clearSelection(); },
      getValue() { return selectedItem; },
      open, close, toggle,
      refresh() { render(input.value); }
    };
    rootEl._pfSearch = api;
    return api;
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

  /* ---------- Public API ---------- */
  global.PFSearch = {
    init: init,
    fuzzyScore: fuzzyScore,
    normalizeData: normalizeData
  };
})(window);
