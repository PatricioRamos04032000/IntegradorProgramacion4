import { api } from './api.js';

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const meta = await api.get('/cursos?page=1&pageSize=1');
    if (!meta) return;
    const sel = document.getElementById('id_curso_estado');
    sel.innerHTML = '';
    (meta.estados || []).forEach((e) => {
      sel.appendChild(new Option(e.descripcion, String(e.id_curso_estado)));
    });
  } catch (e) {
    showError(e.message || 'No se pudieron cargar los estados.');
  }

  document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('error').style.display = 'none';
    const body = {
      nombre: document.getElementById('nombre').value.trim(),
      descripcion: document.getElementById('descripcion').value.trim(),
      fecha_inicio: document.getElementById('fecha_inicio').value,
      cantidad_horas: Number(document.getElementById('cantidad_horas').value),
      inscriptos_max: Number(document.getElementById('inscriptos_max').value),
      id_curso_estado: Number(document.getElementById('id_curso_estado').value),
    };
    try {
      const res = await api.post('/cursos', body);
      window.location.href = `cursos-detalle.html?id=${res.id_curso}`;
    } catch (err) {
      const b = err.body || {};
      if (b.errores && b.errores.length) {
        showError(b.errores.join(' '));
      } else {
        showError(err.message || 'Error al crear.');
      }
    }
  });
});
