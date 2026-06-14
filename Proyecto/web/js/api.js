import { API_BASE } from './config.js';
import { getAccessToken, setAccessToken, clearSession } from './auth.js';
import { parseErrorResponse } from './httpError.js';

let refreshPromise = null;

async function refreshSession() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v2/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.accessToken) {
        return false;
      }
      setAccessToken(data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function buildHeaders(options, token) {
  const headers = { ...(options.headers || {}) };
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function redirectToLogin() {
  clearSession();
  window.location.href = 'login.html';
}

async function parseResponse(res) {
  if (res.status === 204) {
    return null;
  }

  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
  }

  if (!res.ok) {
    const msg = parseErrorResponse(res, text);
    const err = new Error(msg);
    err.body = data;
    err.status = res.status;
    throw err;
  }

  return data;
}

export async function authFetch(url, options = {}, retried = false) {
  const token = getAccessToken();
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: buildHeaders(options, token),
  });

  if (res.status === 401 && !retried) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return authFetch(url, options, true);
    }
    redirectToLogin();
    return null;
  }

  if (res.status === 401) {
    redirectToLogin();
    return null;
  }

  return res;
}

async function request(path, options = {}, retried = false) {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: buildHeaders(options, token),
  });

  if (res.status === 401 && !retried) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return request(path, options, true);
    }
    redirectToLogin();
    return null;
  }

  if (res.status === 401) {
    redirectToLogin();
    return null;
  }

  return parseResponse(res);
}

export { refreshSession };

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body) }),
  del: (p) => request(p, { method: 'DELETE' }),
};
