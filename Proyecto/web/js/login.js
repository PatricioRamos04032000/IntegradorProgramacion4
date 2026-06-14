import { API_BASE } from './config.js';
import { getAccessToken, setAccessToken, clearSession } from './auth.js';

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('logout') === '1') {
    clearSession();
  }

  if (getAccessToken()) {
    window.location.replace('index.html');
    return;
  }

  document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombreUsuario = document.getElementById('nombre_usuario').value.trim();
    const contrasenia = document.getElementById('contrasenia').value;
    document.getElementById('error').style.display = 'none';

    try {
      const res = await fetch(`${API_BASE}/api/v2/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreUsuario, contrasenia }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showError(data.error || 'Credenciales inválidas.');
        return;
      }
      if (data.accessToken) {
        setAccessToken(data.accessToken);
        window.location.href = 'index.html';
      } else {
        showError('Respuesta del servidor sin access token.');
      }
    } catch {
      showError('No se pudo conectar con la API. ¿Está corriendo en ' + API_BASE + '?');
    }
  });
});
