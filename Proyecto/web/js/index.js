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
  if (err?.status === 401) return null;
  if (err?.status === 403) return 'No tiene permisos para ver el panel.';
  if (err?.status >= 500) return 'Error del servidor. Intente nuevamente más tarde.';
  if (!err?.status) return 'No se pudo conectar con el servidor.';
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
  const container = document.getElementById('lista-cursos');
  container.innerHTML = '';

  if (!cursos.length) {
    container.innerHTML = '<div class="col-12 text-muted">No hay cursos activos.</div>';
    return;
  }

  cursos.forEach((c) => {
    const actuales = Number.isFinite(c.inscriptosActuales) ? c.inscriptosActuales : 0;
    const max = Number.isFinite(c.inscriptosMax) ? c.inscriptosMax : 0;
    const lleno = max > 0 && actuales >= max;
    
    const badge = lleno
      ? '<span class="card-badge bg-warning text-dark">Completo</span>'
      : `<span class="card-badge">${actuales} / ${max}</span>`;
    
    const cupoClass = lleno ? 'text-danger' : 'text-muted';

    const div = document.createElement('div');
    div.className = 'col-md-6 col-lg-4';
    div.innerHTML = `
      <div class="card h-100 border-0 shadow-sm modern-course-card">
        <div class="card-body p-4">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div class="course-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            ${badge}
          </div>
          <h5 class="card-title fw-bold text-dark mb-2">${c.nombre}</h5>
          <p class="card-text ${cupoClass} small mb-0">Cupo: ${actuales} de ${max}</p>
        </div>
        <div class="card-footer bg-transparent border-0 pt-0 pb-4 px-4">
          <a href="cursos-detalle.html?id=${c.idCurso}" class="btn btn-sm btn-modern-outline w-100">Ver detalle</a>
        </div>
      </div>
    `;
    container.appendChild(div);
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
    if (msg) showError(msg);
    
    document.getElementById('total-cursos').textContent = '—';
    document.getElementById('total-estudiantes').textContent = '—';
    document.getElementById('total-inscripciones').textContent = '—';
    
    document.getElementById('lista-cursos').innerHTML =
      '<div class="col-12 text-muted">No se pudo cargar la lista.</div>';
      
    updatePaginationBar({ ...pagElements(), offset: 0, total: 0, clear: true });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();
  
  const name = sessionStorage.getItem('nombreUsuario') || 'Usuario';
  const usernameEl = document.getElementById('username');
  if (usernameEl) usernameEl.textContent = name;
  
  bindPaginationControls({
    ...pagElements(),
    getOffset: () => offset,
    setOffset: (n) => { offset = n; },
    onChange: cargar,
  });
  
  await cargar();
});