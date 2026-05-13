import { api } from './api.js';

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const [cRes, eRes] = await Promise.all([
      api.get('/cursos?page=1&pageSize=500'),
      api.get('/estudiantes?page=1&pageSize=500'),
    ]);
    if (!cRes || !eRes) return;
    const selC = document.getElementById('id_curso');
    selC.innerHTML = '';
    (cRes.items || []).forEach((c) => {
      selC.appendChild(new Option(`${c.nombre} (#${c.id_curso})`, String(c.id_curso)));
    });
    const selE = document.getElementById('id_estudiante');
    selE.innerHTML = '';
    (eRes.items || []).forEach((s) => {
      selE.appendChild(
        new Option(`${s.apellido}, ${s.nombres} — ${s.documento}`, String(s.id_estudiante)),
      );
    });
  } catch (e) {
    showError(e.message || 'No se pudieron cargar cursos o estudiantes.');
  }

  document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('error').style.display = 'none';
    const body = {
      id_curso: Number(document.getElementById('id_curso').value),
      id_estudiante: Number(document.getElementById('id_estudiante').value),
    };
    try {
      const ins = await api.post('/inscripciones', body);
      window.location.href = `inscripciones-detalle.html?id=${ins.id_inscripcion}`;
    } catch (err) {
      const msg = (err.body && err.body.error) || err.message || 'Error al inscribir.';
      showError(msg);
    }
  });
});
