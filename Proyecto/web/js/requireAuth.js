import { getToken } from './auth.js';

export function requireAuth() {
  if (!getToken()) {
    window.location.href = 'login.html';
  }
}
