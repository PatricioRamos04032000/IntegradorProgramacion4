import { api } from './api.js';

function idFromQuery() {
  const id = new URLSearchParams(window.location.search).get('id');
  return id && /^\d+$/.test(id) ? id : null;
}

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
  const id = idFromQuery();
  if (!id) {
    showError('Falta el parámetro id en la URL.');
    return;
  }

  try {
    const data = await api.get(`/cursos/${id}`);
    if (!data) return;
    const c = data.curso;
    document.getElementById('nombre').value = c.nombre || '';
    document.getElementById('descripcion').value = c.descripcion || '';
    document.getElementById('fecha_inicio').value = c.fecha_inicio || '';
    document.getElementById('cantidad_horas').value = c.cantidad_horas ?? '';
    document.getElementById('inscriptos_max').value = c.inscriptos_max ?? '';

    const sel = document.getElementById('id_curso_estado');
    sel.innerHTML = '';
    (data.estados || []).forEach((e) => {
      const opt = new Option(e.descripcion, String(e.id_curso_estado));
      if (String(e.id_curso_estado) === String(c.id_curso_estado)) opt.selected = true;
      sel.appendChild(opt);
    });
  } catch (e) {
    showError(e.message || 'No se pudo cargar el curso.');
    return;
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
      await api.put(`/cursos/${id}`, body);
      window.location.href = `cursos-detalle.html?id=${id}`;
    } catch (err) {
      const b = err.body || {};
      if (b.errores && b.errores.length) {
        showError(b.errores.join(' '));
      } else {
        showError(err.message || 'Error al guardar.');
      }
    }
  });
});
