/* =========================================================
   PromptForge — combobox.js
   Accessible searchable combobox with fuzzy match + groups.
   Usage:
     <div class="combobox" data-combobox="key" data-mode="single"></div>
     PF.ComboBox.create(el, {
       mode: "single",
       groups: { Gaming: [...], Marketing: [...] }  // OR
       options: [{value, phrase}, ...],
       placeholder: "...",
       allowCustom: true,        // allow free-text input as value
       onChange: (value, item) => {}
     });
   ========================================================= */
(function (global) {
  "use strict";

  /* ---------- Fuzzy match (subsequence + score) ---------- */
  // Returns 0 if no match; higher score = better. Case-insensitive.
  function fuzzyScore(query, target) {
    if (!query) return 1;
    query = query.toLowerCase();
    target = String(target).toLowerCase();

    // Exact substring = highest score
    const idx = target.indexOf(query);
    if (idx === 0) return 100 + (target.length === query.length ? 50 : 0);
    if (idx > 0) return 80 - idx;

    // Subsequence match
    let qi = 0, score = 0, streak = 0;
    for (let ti = 0; ti < target.length && qi < query.length; ti++) {
      if (target[ti] === query[qi]) {
        qi++;
        streak++;
        score += 10 + streak; // reward consecutive matches
        if (ti === 0) score += 15; // starting match bonus
      } else {
        streak = 0;
      }
    }
    if (qi < query.length) return 0; // not all query chars matched
    return score;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function highlight(text, query) {
    if (!query) return escapeHTML(text);
    const q = query.toLowerCase();
    const t = String(text);
    const idx = t.toLowerCase().indexOf(q);
    if (idx >= 0) {
      return escapeHTML(t.slice(0, idx)) +
        "<mark>" + escapeHTML(t.slice(idx, idx + q.length)) + "</mark>" +
        escapeHTML(t.slice(idx + q.length));
    }
    return escapeHTML(t);
  }

  function create(rootEl, config) {
    const state = {
      open: false,
      query: "",
      value: null,        // selected value (string) or null
      selectedItem: null, // original item object
      focusedIndex: -1,
      visibleItems: []    // flat list of {item, group?}
    };

    const cfg = Object.assign({
      mode: "single",
      placeholder: "Select an option…",
      allowCustom: false,
      groups: null,
      options: null,
      onChange: function () {}
    }, config || {});

    // Build flat options list
    let flatOptions = [];
    if (cfg.groups) {
      Object.keys(cfg.groups).forEach(function (group) {
        cfg.groups[group].forEach(function (item) {
          flatOptions.push({ item: item, group: group });
        });
      });
    } else if (cfg.options) {
      cfg.options.forEach(function (item) {
        flatOptions.push({ item: item, group: null });
      });
    }

    /* ---------- DOM ---------- */
    rootEl.classList.add("combobox");
    rootEl.innerHTML = "";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "combobox__trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    const valueEl = document.createElement("span");
    valueEl.className = "combobox__value is-placeholder";
    valueEl.textContent = cfg.placeholder;

    const clearBtn = document.createElement("span");
    clearBtn.className = "combobox__clear";
    clearBtn.setAttribute("role", "button");
    clearBtn.setAttribute("tabindex", "0");
    clearBtn.setAttribute("aria-label", "Clear selection");
    clearBtn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    clearBtn.style.display = "none";

    const caret = document.createElement("span");
    caret.className = "combobox__caret";
    caret.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';

    trigger.appendChild(valueEl);
    trigger.appendChild(clearBtn);
    trigger.appendChild(caret);

    const panel = document.createElement("div");
    panel.className = "combobox__panel";
    panel.setAttribute("role", "listbox");

    const searchWrap = document.createElement("div");
    searchWrap.className = "combobox__search-wrap";
    searchWrap.innerHTML = '<span class="combobox__search-icon"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></span>';
    const search = document.createElement("input");
    search.type = "text";
    search.className = "combobox__search";
    search.placeholder = "Search…";
    searchWrap.appendChild(search);

    const list = document.createElement("ul");
    list.className = "combobox__list";

    panel.appendChild(searchWrap);
    panel.appendChild(list);

    rootEl.appendChild(trigger);
    rootEl.appendChild(panel);

    /* ---------- Render list ---------- */
    function render() {
      list.innerHTML = "";
      state.visibleItems = [];

      const q = state.query.trim();
      // Score & filter
      const scored = flatOptions
        .map(function (entry) {
          return { entry: entry, score: Math.max(
            fuzzyScore(q, entry.item.value),
            fuzzyScore(q, entry.group || "")
          ) };
        })
        .filter(function (x) { return x.score > 0; })
        .sort(function (a, b) {
          // group by group-name first (stable), then by score desc
          const ga = a.entry.group || "~";
          const gb = b.entry.group || "~";
          if (ga !== gb) return ga < gb ? -1 : 1;
          return b.score - a.score;
        });

      // Custom add option
      if (cfg.allowCustom && q && !flatOptions.some(function (e) { return e.item.value.toLowerCase() === q.toLowerCase(); })) {
        const li = document.createElement("li");
        li.className = "combobox__option";
        li.innerHTML = '<span>Use "<strong>' + escapeHTML(q) + '</strong>"</span>' +
          '<span class="combobox__option-check"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>';
        li.addEventListener("click", function () {
          select({ value: q, phrase: q }, null);
        });
        list.appendChild(li);
        state.visibleItems.push({ item: { value: q, phrase: q }, group: "Custom" });
      }

      if (scored.length === 0 && !(cfg.allowCustom && q)) {
        const empty = document.createElement("li");
        empty.className = "combobox__empty";
        empty.textContent = "No matches found";
        list.appendChild(empty);
        state.focusedIndex = -1;
        return;
      }

      let lastGroup = null;
      scored.forEach(function (s, i) {
        const entry = s.entry;
        if (entry.group && entry.group !== lastGroup) {
          const gh = document.createElement("li");
          gh.className = "combobox__group";
          gh.textContent = entry.group;
          list.appendChild(gh);
          lastGroup = entry.group;
        }
        const li = document.createElement("li");
        li.className = "combobox__option";
        li.setAttribute("role", "option");
        li.dataset.index = state.visibleItems.length;
        const isSelected = state.value && entry.item.value === state.value;
        if (isSelected) li.classList.add("is-selected");
        li.innerHTML =
          '<span>' + highlight(entry.item.value, q) + '</span>' +
          '<span class="combobox__option-check"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></span>';
        li.addEventListener("mouseenter", function () {
          state.focusedIndex = parseInt(li.dataset.index, 10);
          updateFocus();
        });
        li.addEventListener("click", function () {
          select(entry.item, entry.group);
        });
        list.appendChild(li);
        state.visibleItems.push(entry);
      });

      state.focusedIndex = -1;
    }

    function updateFocus() {
      const opts = list.querySelectorAll(".combobox__option");
      opts.forEach(function (o) { o.classList.remove("is-focused"); });
      if (state.focusedIndex >= 0 && opts[state.focusedIndex]) {
        opts[state.focusedIndex].classList.add("is-focused");
        // Scroll into view
        const el = opts[state.focusedIndex];
        const elTop = el.offsetTop;
        const elBottom = elTop + el.offsetHeight;
        if (elBottom > list.scrollTop + list.clientHeight) {
          list.scrollTop = elBottom - list.clientHeight;
        } else if (elTop < list.scrollTop) {
          list.scrollTop = elTop;
        }
      }
    }

    /* ---------- Select / Open / Close ---------- */
    function select(item, group) {
      state.value = item.value;
      state.selectedItem = item;
      valueEl.textContent = item.value;
      valueEl.classList.remove("is-placeholder");
      clearBtn.style.display = "inline-flex";
      close();
      cfg.onChange(item.value, item, group);
    }

    function clearValue() {
      state.value = null;
      state.selectedItem = null;
      valueEl.textContent = cfg.placeholder;
      valueEl.classList.add("is-placeholder");
      clearBtn.style.display = "none";
      cfg.onChange(null, null, null);
    }

    function open() {
      if (state.open) return;
      state.open = true;
      rootEl.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      state.query = "";
      search.value = "";
      render();
      positionPanel();
      // Re-position after layout settles (offsetHeight accurate now)
      requestAnimationFrame(function () {
        positionPanel();
        search.focus();
      });
      // Reposition on scroll/resize; close if the trigger is no longer visible
      window.addEventListener("scroll", onWindowScroll, true);
      window.addEventListener("resize", onWindowResize);
    }

    function close() {
      if (!state.open) return;
      state.open = false;
      rootEl.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      window.removeEventListener("scroll", onWindowScroll, true);
      window.removeEventListener("resize", onWindowResize);
    }

    /* Position the panel below the trigger using position:fixed so it
       escapes any parent overflow:hidden / overflow:auto containers. */
    function positionPanel() {
      var rect = trigger.getBoundingClientRect();
      var panelHeight = panel.offsetHeight || 380;
      var panelWidth = rect.width;
      var spaceBelow = window.innerHeight - rect.bottom;
      var spaceAbove = rect.top;
      var top;
      // Flip above if not enough room below and more room above
      if (spaceBelow < panelHeight + 16 && spaceAbove > spaceBelow) {
        top = Math.max(8, rect.top - panelHeight - 4);
      } else {
        top = rect.bottom + 4;
      }
      var left = Math.max(8, Math.min(rect.left, window.innerWidth - panelWidth - 8));
      panel.style.top = top + "px";
      panel.style.left = left + "px";
      panel.style.width = panelWidth + "px";
    }

    function onWindowScroll() {
      if (!state.open) return;
      // Reposition while open; close if trigger scrolled out of view
      var rect = trigger.getBoundingClientRect();
      if (rect.bottom < -50 || rect.top > window.innerHeight + 50) {
        close();
      } else {
        positionPanel();
      }
    }
    function onWindowResize() {
      if (!state.open) return;
      positionPanel();
    }

    /* ---------- Events ---------- */
    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      if (state.open) close(); else open();
    });

    // Clear button
    clearBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      clearValue();
    });
    clearBtn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); clearValue(); }
    });

    search.addEventListener("input", function () {
      state.query = search.value;
      render();
    });

    search.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (state.focusedIndex < state.visibleItems.length - 1) {
          state.focusedIndex++;
          updateFocus();
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (state.focusedIndex > 0) {
          state.focusedIndex--;
          updateFocus();
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (state.focusedIndex >= 0 && state.visibleItems[state.focusedIndex]) {
          select(state.visibleItems[state.focusedIndex].item, state.visibleItems[state.focusedIndex].group);
        } else if (cfg.allowCustom && state.query.trim()) {
          select({ value: state.query.trim(), phrase: state.query.trim() }, null);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        close();
        trigger.focus();
      }
    });

    // Click outside closes
    document.addEventListener("click", function (e) {
      if (!rootEl.contains(e.target)) close();
    });

    /* ---------- Public API ---------- */
    return {
      getValue: function () { return state.value; },
      getItem: function () { return state.selectedItem; },
      setValue: function (val) {
        if (!val) { clearValue(); return; }
        const found = flatOptions.find(function (e) { return e.item.value === val; });
        if (found) select(found.item, found.group);
        else if (cfg.allowCustom) select({ value: val, phrase: val }, null);
        else { state.value = val; valueEl.textContent = val; valueEl.classList.remove("is-placeholder"); clearBtn.style.display = "inline-flex"; }
      },
      clear: clearValue,
      focus: function () { trigger.focus(); open(); }
    };
  }

  global.PF = global.PF || {};
  global.PF.ComboBox = { create: create, fuzzyScore: fuzzyScore };

})(typeof window !== "undefined" ? window : this);
