const { json, parseBody, methodNotAllowed, verifySameOrigin } = require('./_utils/http');
const { requireAdmin } = require('./_utils/auth');
const { loadCatalog, saveCatalog, resetCatalog } = require('./_utils/store');
const { normalizeGame, normalizeGameList } = require('./_utils/validate');

function requireAccess(event) {
  const session = requireAdmin(event);
  if (!session) {
    const error = new Error('Требуется вход администратора.');
    error.statusCode = 401;
    throw error;
  }
  if (!verifySameOrigin(event)) {
    const error = new Error('Запрос отклонён: неверный Origin.');
    error.statusCode = 403;
    throw error;
  }
}

function getId(event, body = {}) {
  const params = event.queryStringParameters || {};
  return Number(params.id || body.id || 0);
}

exports.handler = async (event) => {
  const method = event.httpMethod;
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return methodNotAllowed(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
  }
  try {
    requireAccess(event);

    if (method === 'GET') {
      return json(200, await loadCatalog());
    }

    if (method === 'POST') {
      const body = parseBody(event);
      const params = event.queryStringParameters || {};
      if (params.action === 'reset' || body.action === 'reset') {
        return json(200, await resetCatalog());
      }
      const catalog = await loadCatalog();
      const maxId = catalog.games.reduce((max, game) => Math.max(max, Number(game.id) || 0), 0);
      const game = normalizeGame({ ...body, id: maxId + 1 }, maxId + 1);
      const next = [...catalog.games, game];
      return json(201, await saveCatalog(next));
    }

    if (method === 'PUT') {
      const body = parseBody(event);
      const id = getId(event, body);
      if (!id) return json(400, { error: 'Не указан id игры.' });
      const catalog = await loadCatalog();
      const index = catalog.games.findIndex((game) => Number(game.id) === id);
      if (index === -1) return json(404, { error: 'Игра не найдена.' });
      const updated = normalizeGame({ ...catalog.games[index], ...body, id }, id);
      const next = [...catalog.games];
      next[index] = updated;
      return json(200, await saveCatalog(next));
    }

    if (method === 'PATCH') {
      const body = parseBody(event);
      const games = normalizeGameList(body.games);
      return json(200, await saveCatalog(games));
    }

    if (method === 'DELETE') {
      const body = event.body ? parseBody(event) : {};
      const id = getId(event, body);
      if (!id) return json(400, { error: 'Не указан id игры.' });
      const catalog = await loadCatalog();
      const next = catalog.games.filter((game) => Number(game.id) !== id);
      if (next.length === catalog.games.length) return json(404, { error: 'Игра не найдена.' });
      return json(200, await saveCatalog(next));
    }

    return methodNotAllowed(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Ошибка админ-действия.' });
  }
};
