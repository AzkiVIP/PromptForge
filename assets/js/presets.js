/* ==========================================================================
   PromptForge · presets.js
   Loads JSON data files and provides a unified access API.
   Caches loaded datasets in memory after first fetch.
   ========================================================================== */

(function (global) {
  'use strict';

  const DATA_DIR = 'data/';
  const cache = {};

  const FILES = {
    'poster-types': 'poster-types.json',
    'styles': 'styles.json',
    'moods': 'moods.json',
    'presets': 'presets.json'
  };

  /* ---------- Fetch a single JSON file ---------- */
  async function fetchJSON(name) {
    if (cache[name]) return cache[name];
    const file = FILES[name];
    if (!file) throw new Error('Unknown dataset: ' + name);
    try {
      const res = await fetch(DATA_DIR + file, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      cache[name] = json;
      return json;
    } catch (err) {
      console.error('[PromptForge] Failed to load', name, err);
      // Fallback empty shape to avoid runtime crashes
      cache[name] = { categories: [], items: [] };
      return cache[name];
    }
  }

  /* ---------- Resolve dotted path like "presets.cameraAngles" ---------- */
  function resolvePath(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((acc, key) => (acc && acc[key] != null ? acc[key] : null), obj);
  }

  /* ---------- Public API ---------- */
  const Presets = {

    async load(name) {
      // If path is dotted like "presets.cameraAngles", load the base file
      // but skip the base segment when resolving (the JSON file IS the base).
      if (name.includes('.')) {
        const parts = name.split('.');
        const base = parts[0];
        const subPath = parts.slice(1).join('.');
        const data = await fetchJSON(base);
        return resolvePath(data, subPath);
      }
      return fetchJSON(name);
    },

    /* Convenience loaders for each known dataset */
    async posterTypes() { return this.load('poster-types'); },
    async styles()      { return this.load('styles'); },
    async moods()       { return this.load('moods.moods'); },
    async typography()  { return this.load('moods.typography'); },
    async cameraAngles(){ return this.load('presets.cameraAngles'); },
    async lighting()    { return this.load('presets.lighting'); },
    async backgrounds() { return this.load('presets.backgrounds'); },
    async effects()     { return this.load('presets.effects'); },
    async negativePrompts() { return this.load('presets.negativePrompts'); },
    async palettes()    { return this.load('presets.palettes'); },
    async aspectRatios(){ return this.load('presets.aspectRatios'); },
    async compositions(){ return this.load('presets.compositions'); },
    async renderingQuality() { return this.load('presets.renderingQuality'); },
    async aiPresets()   { return this.load('presets.aiPresets'); },
    async promptExpansions() { return this.load('presets.promptExpansions'); },

    /* Preload all datasets at once (used at app boot) */
    async preloadAll() {
      await Promise.all(Object.keys(FILES).map(name => fetchJSON(name)));
      return cache;
    },

    /* Get raw cached data (sync) */
    getCached(name) {
      return cache[name] || null;
    }
  };

  global.PFPresets = Presets;
})(window);
