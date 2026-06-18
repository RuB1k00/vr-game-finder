const { json, parseBody, methodNotAllowed } = require('./_utils/http');
const { createSessionCookie, verifyPassword, SESSION_TTL_SECONDS } = require('./_utils/auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed(['POST']);
  try {
    const body = parseBody(event);
    if (!body.password) return json(400, { error: 'Введите пароль.' });
    if (!verifyPassword(body.password)) return json(401, { error: 'Неверный пароль.' });
    return json(200, { ok: true, ttl: SESSION_TTL_SECONDS }, { 'Set-Cookie': createSessionCookie() });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Ошибка входа.' });
  }
};
