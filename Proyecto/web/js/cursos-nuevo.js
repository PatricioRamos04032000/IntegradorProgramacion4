import { requireAuth } from './requireAuth.js';
import { api } from './api.js';

function showError(msg) {
  const el = document.getElementById('errorModal');
  document.getElementById('errorModalBody').textContent = msg;
  const modal = new bootstrap.Modal(el);
  el.addEventListener('hide.bs.modal', () => document.activeElement?.blur(), { once: true });
  modal.show();
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();

  try {
    const estados = await api.get('/api/v2/cursos/estados');
    if (!estados) return;
    const sel = document.getElementById('idCursoEstado');
    sel.innerHTML = '';
    estados.forEach((e) => {
      sel.appendChild(new Option(e.descripcion, String(e.idCursoEstado)));
    });
  } catch (e) {
    showError(e.message || 'No se pudieron cargar los estados.');
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
      const res = await api.post('/api/v2/cursos', body);
      window.location.href = `cursos-detalle.html?id=${res.idCurso}`;
    } catch (err) {
      const b = err.body || {};
      if (b.errors && b.errors.length) {
        showError(b.errors.map((e) => e.msg || e).join(' '));
      } else if (b.errores && b.errores.length) {
        showError(b.errores.join(' '));
      } else {
        showError(err.message || 'Error al crear.');
      }
    }
  });
});
