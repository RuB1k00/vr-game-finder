const { json, methodNotAllowed } = require('./_utils/http');
const { clearSessionCookie } = require('./_utils/auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return methodNotAllowed(['POST']);
  return json(200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
};
