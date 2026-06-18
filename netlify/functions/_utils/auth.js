const crypto = require('crypto');
const { getHeader } = require('./http');

const COOKIE_NAME = 'vr_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function safeCompare(a, b) {
  const ab = Buffer.from(a || '', 'utf8');
  const bb = Buffer.from(b || '', 'utf8');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET не задан или слишком короткий.');
  }
  return secret;
}

function signPayload(payload) {
  const encoded = base64url(JSON.stringify(payload));
  const sig = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [encoded, sig] = token.split('.');
  if (!encoded || !sig) return null;
  const expected = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');
  if (!safeCompare(sig, expected)) return null;
  let payload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
  } catch (_) {
    return null;
  }
  if (!payload || payload.role !== 'admin' || !payload.exp) return null;
  if (Math.floor(Date.now() / 1000) > Number(payload.exp)) return null;
  return payload;
}

function createSessionCookie() {
  const now = Math.floor(Date.now() / 1000);
  const token = signPayload({ role: 'admin', iat: now, exp: now + SESSION_TTL_SECONDS });
  const secure = process.env.NETLIFY ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

function clearSessionCookie() {
  const secure = process.env.NETLIFY ? '; Secure' : '';
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

function getCookie(event, name) {
  const raw = getHeader(event, 'cookie');
  if (!raw) return '';
  const parts = raw.split(';').map((part) => part.trim());
  for (const part of parts) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx);
    const value = part.slice(idx + 1);
    if (key === name) return decodeURIComponent(value);
  }
  return '';
}

function requireAdmin(event) {
  const token = getCookie(event, COOKIE_NAME);
  return verifyToken(token);
}

function verifyPassword(password) {
  const stored = process.env.ADMIN_PASSWORD_HASH || '';
  if (!stored.startsWith('scrypt$')) {
    throw new Error('ADMIN_PASSWORD_HASH не задан. Сгенерируйте его командой npm run hash-password.');
  }
  const [, salt, expectedHash] = stored.split('$');
  if (!salt || !expectedHash) return false;
  const actualHash = crypto.scryptSync(String(password || ''), salt, 64).toString('hex');
  return safeCompare(actualHash, expectedHash);
}

module.exports = {
  createSessionCookie,
  clearSessionCookie,
  requireAdmin,
  verifyPassword,
  SESSION_TTL_SECONDS
};
