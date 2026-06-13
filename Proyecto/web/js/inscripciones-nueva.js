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
    const [cRes, eRes] = await Promise.all([
      api.get('/api/v2/cursos?limit=500&offset=0'),
      api.get('/api/v2/estudiantes?limit=500&offset=0'),
    ]);
    if (!cRes || !eRes) return;
    const selC = document.getElementById('id_curso');
    selC.innerHTML = '';
    (cRes.items || []).forEach((c) => {
      selC.appendChild(new Option(`${c.nombre} (#${c.idCurso})`, String(c.idCurso)));
    });
    const selE = document.getElementById('id_estudiante');
    selE.innerHTML = '';
    (eRes.items || []).forEach((s) => {
      selE.appendChild(
        new Option(`${s.apellido}, ${s.nombres} — ${s.documento}`, String(s.idEstudiante)),
      );
    });
  } catch (e) {
    showError(e.message || 'No se pudieron cargar cursos o estudiantes.');
  }

  document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    document.getElementById('error').style.display = 'none';
    const body = {
      idCurso: Number(document.getElementById('id_curso').value),
      idEstudiante: Number(document.getElementById('id_estudiante').value),
    };
    try {
      const ins = await api.post('/api/v2/inscripciones', body);
      window.location.href = `inscripciones-detalle.html?id=${ins.idInscripcion}`;
    } catch (err) {
      const msg = (err.body && err.body.error) || err.message || 'Error al inscribir.';
      showError(msg);
    }
  });
});
