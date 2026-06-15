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
  const p = new URLSearchParams();
  ['documento', 'apellido', 'nombres', 'email'].forEach((field) => {
    const val = document.getElementById(field)?.value.trim();
    if (val) p.set(field, val);
  });
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

function limpiarFiltros() {
  ['documento', 'apellido', 'nombres', 'email'].forEach((field) => {
    const el = document.getElementById(field);
    if (el) el.value = '';
  });
}

async function cargar() {
  document.getElementById('error').style.display = 'none';
  try {
    const data = await api.get(`/api/v2/estudiantes?${qs()}`);
    if (!data) return;

    const tbody = document.getElementById('tbody');
    tbody.innerHTML = '';
    (data.items || []).forEach((s) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(s.documento)}</td>
        <td>${escapeHtml(s.apellido)}</td>
        <td>${escapeHtml(s.nombres)}</td>
        <td>${escapeHtml(s.email)}</td>
        <td class="fcad-tabla-acciones">
          <a class="btn btn-sm btn-outline-primary" href="estudiantes-detalle.html?id=${encodeURIComponent(s.idEstudiante)}">Ver</a>
          <a class="btn btn-sm btn-outline-secondary" href="estudiantes-editar.html?id=${encodeURIComponent(s.idEstudiante)}">Editar</a>
          <button type="button" class="btn btn-sm btn-outline-danger btn-del" data-id="${escapeHtml(s.idEstudiante)}">Borrar</button>
        </td>`;
      tbody.appendChild(tr);
    });

    document.querySelectorAll('.btn-del').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!window.confirm('¿Eliminar este estudiante?')) return;
        const id = btn.getAttribute('data-id');
        try {
          await api.del(`/api/v2/estudiantes/${id}`);
          await cargar();
        } catch (e) {
          showError(e.message || 'No se pudo eliminar.');
        }
      });
    });

    updatePaginationBar({
      ...pagElements(),
      offset,
      total: data.total || 0,
      entityLabel: 'estudiantes',
    });
  } catch (e) {
    showError(e.message || 'Error al cargar estudiantes.');
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();
  document.getElementById('buscar').addEventListener('submit', (e) => {
    e.preventDefault();
    offset = 0;
    cargar();
  });
  document.getElementById('btn-limpiar').addEventListener('click', () => {
    limpiarFiltros();
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
