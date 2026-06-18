const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: { ...JSON_HEADERS, ...extraHeaders },
    body: JSON.stringify(body)
  };
}

function parseBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch (_) {
    const error = new Error('Некорректный JSON в теле запроса.');
    error.statusCode = 400;
    throw error;
  }
}

function methodNotAllowed(allowed) {
  return {
    statusCode: 405,
    headers: { ...JSON_HEADERS, Allow: allowed.join(', ') },
    body: JSON.stringify({ error: 'Метод не разрешён.' })
  };
}

function getHeader(event, name) {
  const key = Object.keys(event.headers || {}).find((h) => h.toLowerCase() === name.toLowerCase());
  return key ? event.headers[key] : '';
}

function verifySameOrigin(event) {
  const method = (event.httpMethod || 'GET').toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return true;
  const origin = getHeader(event, 'origin');
  if (!origin) return true;
  const host = getHeader(event, 'host');
  if (!host) return false;
  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch (_) {
    return false;
  }
}

module.exports = { json, parseBody, methodNotAllowed, getHeader, verifySameOrigin };
