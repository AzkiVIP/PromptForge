/* ==========================================================================
   PromptForge · storage.js
   LocalStorage wrapper for prompt history, favorites, and recently generated.
   Namespaced under "promptforge:" to avoid collisions.
   ========================================================================== */

(function (global) {
  'use strict';

  const NS = 'promptforge:';
  const KEYS = {
    history: NS + 'history',
    favorites: NS + 'favorites',
    recent: NS + 'recent',
    draft: NS + 'draft'
  };

  const MAX_HISTORY = 50;
  const MAX_RECENT = 10;

  /* ---------- Low-level safe read/write ---------- */
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[PromptForge] storage read failed for', key, err);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn('[PromptForge] storage write failed for', key, err);
      return false;
    }
  }

  function remove(key) {
    try { localStorage.removeItem(key); } catch (err) { /* noop */ }
  }

  /* ---------- Public API ---------- */
  const Storage = {

    /* History: full log of generated prompts */
    getHistory() {
      return read(KEYS.history, []);
    },

    addToHistory(entry) {
      const list = this.getHistory();
      const stamped = Object.assign({ id: uid(), createdAt: Date.now() }, entry);
      list.unshift(stamped);
      // Cap history length
      if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
      write(KEYS.history, list);
      // Also push into recent
      this.addRecent(stamped);
      return stamped;
    },

    removeFromHistory(id) {
      const list = this.getHistory().filter(item => item.id !== id);
      write(KEYS.history, list);
    },

    clearHistory() {
      remove(KEYS.history);
    },

    /* Favorites: starred prompts */
    getFavorites() {
      return read(KEYS.favorites, []);
    },

    addToFavorites(entry) {
      const list = this.getFavorites();
      // De-dupe by prompt text
      const exists = list.some(item => item.prompt === entry.prompt);
      if (exists) return false;
      const stamped = Object.assign({ id: uid(), createdAt: Date.now(), favorite: true }, entry);
      list.unshift(stamped);
      write(KEYS.favorites, list);
      return stamped;
    },

    removeFromFavorites(id) {
      const list = this.getFavorites().filter(item => item.id !== id);
      write(KEYS.favorites, list);
    },

    isFavorite(promptText) {
      return this.getFavorites().some(item => item.prompt === promptText);
    },

    /* Recent: short list of last generated */
    getRecent() {
      return read(KEYS.recent, []);
    },

    addRecent(entry) {
      const list = this.getRecent();
      // Remove dupes by prompt text
      const filtered = list.filter(item => item.prompt !== entry.prompt);
      filtered.unshift(entry);
      if (filtered.length > MAX_RECENT) filtered.length = MAX_RECENT;
      write(KEYS.recent, filtered);
    },

    clearRecent() {
      remove(KEYS.recent);
    },

    /* Draft: auto-saved current form state */
    getDraft() {
      return read(KEYS.draft, null);
    },

    saveDraft(state) {
      write(KEYS.draft, state);
    },

    clearDraft() {
      remove(KEYS.draft);
    },

    /* Stats helper */
    stats() {
      return {
        history: this.getHistory().length,
        favorites: this.getFavorites().length,
        recent: this.getRecent().length
      };
    }
  };

  /* ---------- Utilities ---------- */
  function uid() {
    return 'pf_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return d.toLocaleDateString();
  }

  // Expose
  global.PFStorage = Storage;
  global.PFStorageFormatTime = formatTime;
})(window);
