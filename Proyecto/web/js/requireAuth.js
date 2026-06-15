import { getAccessToken, isAccessTokenExpired, performLogout } from './auth.js';
import { api, refreshSession } from './api.js';

export async function requireAuth() {
  const token = getAccessToken();
  if (!token || isAccessTokenExpired(token)) {
    const refreshed = await refreshSession();
    if (!refreshed) {
      await performLogout();
      return;
    }
  }

  try {
    await api.get('/api/v2/auth/me');
  } catch {
    await performLogout();
  }
}
