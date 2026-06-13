import { requireAuth } from './requireAuth.js';
import { api } from './api.js';

requireAuth();

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await api.get('/api/v2/dashboard');
    if (!data) return;
    document.getElementById('total-cursos').textContent = data.totalCursos;
    document.getElementById('total-estudiantes').textContent = data.totalEstudiantes;
    const ul = document.getElementById('lista-cursos');
    ul.innerHTML = '';
    (data.cursosRapidos || []).forEach((c) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center flex-wrap gap-2';
      li.innerHTML = `<a href="cursos-detalle.html?id=${c.idCurso}" class="text-decoration-none">${c.nombre}</a><span class="text-muted small">Máx. ${c.inscriptosMax}</span>`;
      ul.appendChild(li);
    });
  } catch (e) {
    showError(e.message || 'No se pudo cargar el panel.');
  }
});
