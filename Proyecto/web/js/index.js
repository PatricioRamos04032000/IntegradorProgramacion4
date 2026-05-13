import { api } from './api.js';

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const data = await api.get('/dashboard');
    if (!data) return;
    document.getElementById('total-cursos').textContent = data.totalCursos;
    document.getElementById('total-estudiantes').textContent = data.totalEstudiantes;
    const ul = document.getElementById('lista-cursos');
    ul.innerHTML = '';
    (data.cursosRapidos || []).forEach((c) => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between';
      li.innerHTML = `<span>${c.nombre}</span><span class="text-muted small">Máx. ${c.inscriptos_max}</span>`;
      ul.appendChild(li);
    });
  } catch (e) {
    showError(e.message || 'No se pudo cargar el panel.');
  }
});
