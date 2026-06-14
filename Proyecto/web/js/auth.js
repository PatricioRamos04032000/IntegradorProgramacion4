const ACCESS_KEY = 'accessToken';
const LEGACY_KEY = 'token';

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_KEY) || sessionStorage.getItem(LEGACY_KEY);
}

export function setAccessToken(token) {
  sessionStorage.setItem(ACCESS_KEY, token);
  sessionStorage.removeItem(LEGACY_KEY);
}

export function clearSession() {
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(LEGACY_KEY);
}

export function getToken() {
  return getAccessToken();
}

export function setToken(token) {
  setAccessToken(token);
}

export function clearToken() {
  clearSession();
}

export function decodeJwtPayload(token) {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token, skewSeconds = 30) {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000;
}
