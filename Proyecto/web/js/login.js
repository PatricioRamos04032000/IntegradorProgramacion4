import { API_BASE } from './config.js';
import { setToken } from './auth.js';

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('logout') === '1') {
    sessionStorage.removeItem('token');
  }

  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre_usuario = document.getElementById('nombre_usuario').value.trim();
    const contrasenia = document.getElementById('contrasenia').value;
    document.getElementById('error').style.display = 'none';

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_usuario, contrasenia }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data.error || 'Credenciales inválidas.');
        return;
      }
      if (data.token) {
        setToken(data.token);
        window.location.href = 'index.html';
      } else {
        showError('Respuesta del servidor sin token.');
      }
    } catch {
      showError('No se pudo conectar con la API. ¿Está corriendo en ' + API_BASE + '?');
    }
  });
});
