const { getStore } = require('@netlify/blobs');
const defaultGames = require('../../../data/default-games.json');

const STORE_NAME = 'vr-game-finder';
const KEY = 'catalog';

function cloneDefaults() {
  return defaultGames.map((game) => ({ ...game, t: Array.isArray(game.t) ? [...game.t] : [] }));
}

function getCatalogStore() {
  return getStore(STORE_NAME);
}

async function loadCatalog() {
  const store = getCatalogStore();
  const stored = await store.get(KEY, { type: 'json' });
  if (!stored) {
    const payload = { games: cloneDefaults(), updatedAt: new Date().toISOString() };
    await store.setJSON(KEY, payload);
    return payload;
  }
  if (Array.isArray(stored)) {
    return { games: stored, updatedAt: null };
  }
  if (!Array.isArray(stored.games)) {
    return { games: cloneDefaults(), updatedAt: null };
  }
  return stored;
}

async function saveCatalog(games) {
  const payload = { games, updatedAt: new Date().toISOString() };
  const store = getCatalogStore();
  await store.setJSON(KEY, payload);
  return payload;
}

async function resetCatalog() {
  return saveCatalog(cloneDefaults());
}

module.exports = { loadCatalog, saveCatalog, resetCatalog, cloneDefaults };
