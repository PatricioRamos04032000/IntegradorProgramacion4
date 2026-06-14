import { requireAuth } from './requireAuth.js';
import { api } from './api.js';
import { descargarCertificado } from './certificado.js';

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

async function cargarInscriptos(id) {
  const tbody = document.getElementById('tbody-inscriptos');
  if (!tbody) return;

  try {
    const inscriptos = await api.get(`/api/v2/cursos/${id}/inscriptos`);
    tbody.innerHTML = '';

    if (!inscriptos || inscriptos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-muted">No hay inscriptos activos.</td></tr>';
      return;
    }

    inscriptos.forEach((i) => {
      const fecha = i.fechaHoraInscripcion
        ? new Date(i.fechaHoraInscripcion).toLocaleDateString('es-AR')
        : '\u2014';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i.apellido}</td>
        <td>${i.nombres}</td>
        <td>${i.documento}</td>
        <td>${fecha}</td>
        <td class="fcad-tabla-acciones">
          <button type="button" class="btn btn-sm btn-success btn-certificado" data-id="${i.idInscripcion}">Descargar diploma</button>
        </td>`;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.btn-certificado').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          await descargarCertificado(btn.getAttribute('data-id'));
        } catch (e) {
          showError(e.message || 'No se pudo descargar el certificado.');
        }
      });
    });
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-danger">No se pudo cargar el listado de inscriptos.</td></tr>';
    showError(e.message || 'No se pudo cargar inscriptos.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();
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
    await cargarInscriptos(id);
  } catch (e) {
    showError(e.message || 'No se pudo cargar el curso.');
  }
});
