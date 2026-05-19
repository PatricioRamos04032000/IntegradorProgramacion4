import { API_BASE } from './config.js';
import { getToken, clearToken } from './auth.js';

async function request(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const hasBody = options.body !== undefined && options.body !== null;
  if (hasBody && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = 'login.html';
    return null;
  }

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
    const msg =
      data.error ||
      (Array.isArray(data.errors) && data.errors.length ? data.errors.map(e => e.msg || e).join(' ') : null) ||
      (Array.isArray(data.errores) && data.errores.length ? data.errores.join(' ') : null) ||
      `Error ${res.status}`;
    const err = new Error(msg);
    err.body = data;
    err.status = res.status;
    throw err;
  }

  return data;
}

export const api = {
  get: (p) => request(p),
  post: (p, body) => request(p, { method: 'POST', body: JSON.stringify(body) }),
  put: (p, body) => request(p, { method: 'PUT', body: JSON.stringify(body) }),
  del: (p) => request(p, { method: 'DELETE' }),
};
