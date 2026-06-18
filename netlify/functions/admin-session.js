const { json, methodNotAllowed } = require('./_utils/http');
const { requireAdmin } = require('./_utils/auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return methodNotAllowed(['GET']);
  try {
    const session = requireAdmin(event);
    return json(200, { authenticated: Boolean(session), exp: session ? session.exp : null });
  } catch (_) {
    return json(200, { authenticated: false, exp: null });
  }
};
