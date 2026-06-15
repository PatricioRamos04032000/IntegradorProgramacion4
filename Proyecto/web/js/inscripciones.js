import { requireAuth } from './requireAuth.js';
import { api } from './api.js';
import { escapeHtml } from './dom.js';
import {
  appendPageParams,
  bindPaginationControls,
  updatePaginationBar,
} from './pagination.js';

let offset = 0;

function qs() {
  const q = document.getElementById('q').value.trim();
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  appendPageParams(p, offset);
  return p.toString();
}

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

function pagElements() {
  return {
    pagInfoEl: document.getElementById('pag-info'),
    btnPrevEl: document.getElementById('btn-prev'),
    btnNextEl: document.getElementById('btn-next'),
  };
}

async function cargar() {
  document.getElementById('error').style.display = 'none';
  try {
    const data = await api.get(`/api/v2/inscripciones?${qs()}`);
    if (!data) return;

    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';
    (data.items || []).forEach((ins) => {
      const tr = document.createElement('tr');
      const fecha = ins.fechaHoraInscripcion
        ? new Date(ins.fechaHoraInscripcion).toLocaleDateString('es-AR')
        : '—';
      tr.innerHTML = `
        <td>${escapeHtml(fecha)}</td>
        <td>${escapeHtml(ins.cursoNombre)}</td>
        <td>${escapeHtml(ins.apellido)}, ${escapeHtml(ins.nombres)}</td>
        <td>${escapeHtml(ins.documento)}</td>
        <td class="fcad-tabla-acciones">
          <a class="btn btn-sm btn-outline-primary" href="inscripciones-detalle.html?id=${encodeURIComponent(ins.idInscripcion)}">Ver</a>
          <button type="button" class="btn btn-sm btn-outline-danger btn-del" data-id="${escapeHtml(ins.idInscripcion)}">Dar de baja</button>
        </td>`;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-del').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!window.confirm('¿Dar de baja esta inscripción?')) return;
        const id = btn.getAttribute('data-id');
        try {
          await api.del(`/api/v2/inscripciones/${id}`);
          await cargar();
        } catch (e) {
          showError(e.message || 'No se pudo dar de baja.');
        }
      });
    });

    updatePaginationBar({
      ...pagElements(),
      offset,
      total: data.total || 0,
      entityLabel: 'inscripciones',
    });
  } catch (e) {
    showError(e.message || 'Error al cargar inscripciones.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();
  document.getElementById('buscar').addEventListener('submit', (e) => {
    e.preventDefault();
    offset = 0;
    cargar();
  });
  bindPaginationControls({
    ...pagElements(),
    getOffset: () => offset,
    setOffset: (n) => { offset = n; },
    onChange: cargar,
  });
  cargar();
});
