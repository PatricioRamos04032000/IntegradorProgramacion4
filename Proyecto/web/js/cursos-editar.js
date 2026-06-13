import { requireAuth } from './requireAuth.js';
import { api } from './api.js';

requireAuth();

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

document.addEventListener('DOMContentLoaded', async () => {
  const id = idFromQuery();
  if (!id) {
    showError('Falta el parametro id en la URL.');
    return;
  }

  try {
    const [curso, estados] = await Promise.all([
      api.get(`/api/v2/cursos/${id}`),
      api.get('/api/v2/cursos/estados'),
    ]);
    if (!curso || !estados) return;

    document.getElementById('nombre').value = curso.nombre || '';
    document.getElementById('descripcion').value = curso.descripcion || '';
    document.getElementById('fechaInicio').value = curso.fechaInicio
      ? new Date(curso.fechaInicio).toISOString().slice(0, 10)
      : '';
    document.getElementById('cantidadHoras').value = curso.cantidadHoras ?? '';
    document.getElementById('inscriptosMax').value = curso.inscriptosMax ?? '';

    const sel = document.getElementById('idCursoEstado');
    sel.innerHTML = '';
    estados.forEach((e) => {
      const opt = new Option(e.descripcion, String(e.idCursoEstado));
      if (String(e.idCursoEstado) === String(curso.idCursoEstado)) opt.selected = true;
      sel.appendChild(opt);
    });
  } catch (e) {
    showError(e.message || 'No se pudo cargar el curso.');
    return;
  }

  document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      nombre: document.getElementById('nombre').value.trim(),
      descripcion: document.getElementById('descripcion').value.trim(),
      fechaInicio: document.getElementById('fechaInicio').value,
      cantidadHoras: Number(document.getElementById('cantidadHoras').value),
      inscriptosMax: Number(document.getElementById('inscriptosMax').value),
      idCursoEstado: Number(document.getElementById('idCursoEstado').value),
    };
    try {
      await api.put(`/api/v2/cursos/${id}`, body);
      window.location.href = `cursos-detalle.html?id=${id}`;
    } catch (err) {
      const b = err.body || {};
      if (b.errors && b.errors.length) {
        showError(b.errors.map((e) => e.msg || e).join(' '));
      } else if (b.errores && b.errores.length) {
        showError(b.errores.join(' '));
      } else {
        showError(err.message || 'Error al guardar.');
      }
    }
  });
});
