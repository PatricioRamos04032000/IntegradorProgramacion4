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
  const id = idFromQuery();
  if (!id) {
    showError('Falta el parámetro id en la URL.');
    return;
  }
  document.getElementById('btn-editar').href = `cursos-editar.html?id=${id}`;

  try {
    const data = await api.get(`/cursos/${id}`);
    if (!data) return;
    const c = data.curso;
    const fi = c.fecha_inicio ? new Date(c.fecha_inicio).toLocaleDateString('es-AR') : '—';
    document.getElementById('detalle').innerHTML =
      row('ID', c.id_curso) +
      row('Nombre', c.nombre) +
      row('Descripción', c.descripcion || '—') +
      row('Inicio', fi) +
      row('Horas', c.cantidad_horas) +
      row('Máx. inscriptos', c.inscriptos_max) +
      row('Estado', c.estado || '—');
  } catch (e) {
    showError(e.message || 'No se pudo cargar el curso.');
  }
});
