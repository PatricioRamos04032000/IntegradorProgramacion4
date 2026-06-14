const COOKIE_NAME = 'refreshToken';
const COOKIE_PATH = '/api/v2/auth';

function parseMaxAge(expiresIn) {
  const match = /^(\d+)([smhd])$/i.exec(expiresIn || '7d');
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const n = parseInt(match[1], 10);
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return n * (multipliers[match[2].toLowerCase()] || multipliers.d);
}

export function setRefreshCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: COOKIE_PATH,
    maxAge: parseMaxAge(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
    secure: process.env.NODE_ENV === 'production',
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    path: COOKIE_PATH,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}
