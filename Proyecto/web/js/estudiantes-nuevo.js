import { requireAuth } from './requireAuth.js';
import { api } from './api.js';

requireAuth();

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('error').style.display = 'none';
    const body = {
      documento: document.getElementById('documento').value.trim(),
      apellido: document.getElementById('apellido').value.trim(),
      nombres: document.getElementById('nombres').value.trim(),
      email: document.getElementById('email').value.trim(),
      fechaNacimiento: document.getElementById('fecha_nacimiento').value,
    };
    try {
      const est = await api.post('/api/v2/estudiantes', body);
      window.location.href = `estudiantes-detalle.html?id=${est.idEstudiante}`;
    } catch (err) {
      showError(err.message || 'Error al crear.');
    }
  });
});
