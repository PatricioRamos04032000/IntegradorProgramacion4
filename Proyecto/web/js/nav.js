import { clearToken } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('logout-link');
  if (!el) return;
  el.addEventListener('click', (e) => {
    e.preventDefault();
    clearToken();
    window.location.href = 'login.html';
  });
});
