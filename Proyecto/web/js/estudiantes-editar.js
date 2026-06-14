import { requireAuth } from './requireAuth.js';
import { api } from './api.js';

function idFromQuery() {
  const id = new URLSearchParams(window.location.search).get('id');
  return id && /^\d+$/.test(id) ? id : null;
}

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();
  const id = idFromQuery();
  if (!id) {
    showError('Falta id en la URL.');
    return;
  }
  try {
    const s = await api.get(`/api/v2/estudiantes/${id}`);
    if (!s) return;
    document.getElementById('documento').value = s.documento || '';
    document.getElementById('apellido').value = s.apellido || '';
    document.getElementById('nombres').value = s.nombres || '';
    document.getElementById('email').value = s.email || '';
    document.getElementById('fecha_nacimiento').value =
      typeof s.fechaNacimiento === 'string'
        ? s.fechaNacimiento.slice(0, 10)
        : s.fechaNacimiento
          ? new Date(s.fechaNacimiento).toISOString().slice(0, 10)
          : '';
  } catch (e) {
    showError(e.message || 'No se pudo cargar.');
    return;
  }

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
      await api.put(`/api/v2/estudiantes/${id}`, body);
      window.location.href = `estudiantes-detalle.html?id=${id}`;
    } catch (err) {
      showError(err.message || 'Error al guardar.');
    }
  });
});
