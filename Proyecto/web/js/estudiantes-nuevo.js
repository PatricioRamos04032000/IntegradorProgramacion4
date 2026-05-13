import { api } from './api.js';

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
      fecha_nacimiento: document.getElementById('fecha_nacimiento').value,
    };
    try {
      const est = await api.post('/estudiantes', body);
      window.location.href = `estudiantes-detalle.html?id=${est.id_estudiante}`;
    } catch (err) {
      showError(err.message || 'Error al crear.');
    }
  });
});
