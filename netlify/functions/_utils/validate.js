function toStr(value, max = 500) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

function cleanUrl(value) {
  const text = toStr(value, 600);
  if (!text) return '';
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.toString();
  } catch (_) {
    return '';
  }
}

function cleanTags(value) {
  const raw = Array.isArray(value) ? value : String(value ?? '').split(',');
  return [...new Set(raw
    .map((tag) => toStr(tag, 32).toLowerCase())
    .filter(Boolean))]
    .slice(0, 16);
}

function cleanSession(value) {
  const text = toStr(value, 40);
  return text || '20-40';
}

function normalizeGame(input, existingId = null) {
  const game = {
    id: existingId ?? Number(input.id),
    n: toStr(input.n || input.name, 120),
    g: toStr(input.g || input.genre, 60),
    d: Math.max(1, Math.min(3, Number.parseInt(input.d || input.diff || 1, 10) || 1)),
    b: input.b === true || input.b === 'true' || input.beginner === true || input.beginner === 'true',
    s: cleanSession(input.s || input.session),
    t: cleanTags(input.t || input.tags),
    img: cleanUrl(input.img),
    desc: toStr(input.desc, 700),
    yt: cleanUrl(input.yt),
    det: toStr(input.det, 1400)
  };
  if (!game.id || game.id < 1) game.id = Date.now();
  if (!game.n) throw new Error('Название игры обязательно.');
  if (!game.g) throw new Error('Жанр обязателен.');
  if (!game.desc) throw new Error('Описание обязательно.');
  return game;
}

function normalizeGameList(list) {
  if (!Array.isArray(list)) throw new Error('Ожидался массив игр.');
  const seen = new Set();
  return list.map((item, index) => {
    const game = normalizeGame(item, Number(item.id) || index + 1);
    if (seen.has(game.id)) game.id = Math.max(...seen, 0) + 1;
    seen.add(game.id);
    return game;
  });
}

module.exports = { normalizeGame, normalizeGameList };
