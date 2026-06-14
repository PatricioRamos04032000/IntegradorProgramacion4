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

function row(dt, dd) {
  return `<dt class="col-sm-3">${dt}</dt><dd class="col-sm-9">${dd}</dd>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();
  const id = idFromQuery();
  if (!id) {
    showError('Falta id en la URL.');
    return;
  }
  document.getElementById('btn-editar').href = `estudiantes-editar.html?id=${id}`;
  try {
    const s = await api.get(`/api/v2/estudiantes/${id}`);
    if (!s) return;
    const fn =
      typeof s.fechaNacimiento === 'string'
        ? s.fechaNacimiento.slice(0, 10)
        : s.fechaNacimiento
          ? new Date(s.fechaNacimiento).toLocaleDateString('es-AR')
          : '—';
    document.getElementById('detalle').innerHTML =
      row('ID', s.idEstudiante) +
      row('Documento', s.documento) +
      row('Apellido', s.apellido) +
      row('Nombres', s.nombres) +
      row('Email', s.email) +
      row('Fecha nac.', fn);
  } catch (e) {
    showError(e.message || 'No se pudo cargar.');
  }
});
