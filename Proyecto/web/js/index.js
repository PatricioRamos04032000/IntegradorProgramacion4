import { requireAuth } from './requireAuth.js';
import { api } from './api.js';
import {
  appendPageParams,
  bindPaginationControls,
  updatePaginationBar,
} from './pagination.js';

let offset = 0;

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

function hideError() {
  const el = document.getElementById('error');
  el.textContent = '';
  el.style.display = 'none';
}

function formatTotal(n) {
  return Number.isFinite(n) ? n : '—';
}

function dashboardErrorMessage(err) {
  if (err?.status === 401) {
    return null;
  }
  if (err?.status === 403) {
    return 'No tiene permisos para ver el panel.';
  }
  if (err?.status >= 500) {
    return 'Error del servidor. Intente nuevamente más tarde.';
  }
  if (!err?.status) {
    return 'No se pudo conectar con el servidor.';
  }
  return err.message || 'No se pudo cargar el panel.';
}

function qs() {
  const p = new URLSearchParams();
  appendPageParams(p, offset);
  return p.toString();
}

function pagElements() {
  return {
    pagInfoEl: document.getElementById('pag-info'),
    btnPrevEl: document.getElementById('btn-prev'),
    btnNextEl: document.getElementById('btn-next'),
  };
}

function renderCursosRapidos(cursos) {
  const ul = document.getElementById('lista-cursos');
  ul.innerHTML = '';

  if (!cursos.length) {
    ul.innerHTML = '<li class="list-group-item text-muted">No hay cursos activos.</li>';
    return;
  }

  cursos.forEach((c) => {
    const actuales = Number.isFinite(c.inscriptosActuales) ? c.inscriptosActuales : 0;
    const max = Number.isFinite(c.inscriptosMax) ? c.inscriptosMax : 0;
    const lleno = max > 0 && actuales >= max;
    const badge = lleno
      ? '<span class="badge bg-warning text-dark ms-2">Completo</span>'
      : '';
    const cupoClass = lleno ? 'text-danger fw-semibold' : 'text-muted';

    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2';
    li.innerHTML = `
      <a href="cursos-detalle.html?id=${c.idCurso}" class="text-decoration-none">${c.nombre}</a>
      <span class="${cupoClass} small">${actuales} / ${max}${badge}</span>
    `;
    ul.appendChild(li);
  });
}

async function cargar() {
  hideError();
  try {
    const data = await api.get(`/api/v2/dashboard?${qs()}`);
    if (!data) return;

    const totales = data.totales ?? {};
    document.getElementById('total-cursos').textContent = formatTotal(totales.cursos);
    document.getElementById('total-estudiantes').textContent = formatTotal(totales.estudiantes);
    document.getElementById('total-inscripciones').textContent = formatTotal(totales.inscripciones);

    const cursosBlock = data.cursosRapidos ?? {};
    const items = cursosBlock.items ?? [];
    const total = cursosBlock.total ?? items.length;
    renderCursosRapidos(items);
    updatePaginationBar({
      ...pagElements(),
      offset,
      total,
      entityLabel: 'cursos',
    });
  } catch (e) {
    const msg = dashboardErrorMessage(e);
    if (msg) {
      showError(msg);
    }
    document.getElementById('total-cursos').textContent = '—';
    document.getElementById('total-estudiantes').textContent = '—';
    document.getElementById('total-inscripciones').textContent = '—';
    document.getElementById('lista-cursos').innerHTML =
      '<li class="list-group-item text-muted">No se pudo cargar la lista.</li>';
    updatePaginationBar({ ...pagElements(), offset: 0, total: 0, clear: true });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();
  bindPaginationControls({
    ...pagElements(),
    getOffset: () => offset,
    setOffset: (n) => { offset = n; },
    onChange: cargar,
  });
  await cargar();
});
