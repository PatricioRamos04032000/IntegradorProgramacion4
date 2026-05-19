import { api } from './api.js';

function idFromQuery() {
  const id = new URLSearchParams(window.location.search).get('id');
  return id && /^\d+$/.test(id) ? id : null;
}

function showError(msg) {
  const el = document.getElementById('errorModal');
  document.getElementById('errorModalBody').textContent = msg;
  const modal = new bootstrap.Modal(el);
  el.addEventListener('hide.bs.modal', () => document.activeElement?.blur(), { once: true });
  modal.show();
}

function row(dt, dd) {
  return `<dt class="col-sm-3">${dt}</dt><dd class="col-sm-9">${dd}</dd>`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const id = idFromQuery();
  if (!id) {
    showError('Falta el parametro id en la URL.');
    return;
  }
  document.getElementById('btn-editar').href = `cursos-editar.html?id=${id}`;

  try {
    const c = await api.get(`/api/v2/cursos/${id}`);
    if (!c) return;
    const fi = c.fechaInicio ? new Date(c.fechaInicio).toLocaleDateString('es-AR') : '\u2014';
    document.getElementById('detalle').innerHTML =
      row('ID', c.idCurso) +
      row('Nombre', c.nombre) +
      row('Descripcion', c.descripcion || '\u2014') +
      row('Inicio', fi) +
      row('Horas', c.cantidadHoras) +
      row('Max. inscriptos', c.inscriptosMax) +
      row('Estado', c.estado || '\u2014');
  } catch (e) {
    showError(e.message || 'No se pudo cargar el curso.');
  }
});
