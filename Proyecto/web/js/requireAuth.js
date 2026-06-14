import { getAccessToken, isAccessTokenExpired, clearSession } from './auth.js';
import { api, refreshSession } from './api.js';

export async function requireAuth() {
  const token = getAccessToken();
  if (!token || isAccessTokenExpired(token)) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      clearSession();
      window.location.href = 'login.html';
      return;
    }
  }

  try {
    await api.get('/api/v2/auth/me');
  } catch {
    clearSession();
    window.location.href = 'login.html';
  }
}
