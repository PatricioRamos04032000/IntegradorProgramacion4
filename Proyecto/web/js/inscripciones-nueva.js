import { requireAuth } from './requireAuth.js';
import { api } from './api.js';

function showError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();
  try {
    const [cRes, eRes] = await Promise.all([
      api.get('/api/v2/cursos?limit=500&offset=0'),
      api.get('/api/v2/estudiantes?limit=500&offset=0'),
    ]);
    if (!cRes || !eRes) return;
    const cursos = cRes.items || [];
    const selC = document.getElementById('id_curso');
    selC.innerHTML = '<option value="">-- Seleccione un curso --</option>';
    cursos.forEach((c) => {
      selC.appendChild(new Option(`${c.nombre} (#${c.idCurso})`, String(c.idCurso)));
    });

    const estudiantes = eRes.items || [];
    const selE = document.getElementById('id_estudiante');
    selE.innerHTML = '<option value="">-- Seleccione un estudiante --</option>';
    estudiantes.forEach((s) => {
      selE.appendChild(
        new Option(`${s.apellido}, ${s.nombres} — ${s.documento}`, String(s.idEstudiante)),
      );
    });

    const infoCard = document.getElementById('curso-info');
    selC.addEventListener('change', () => {
      const selectedId = Number(selC.value);
      const c = cursos.find((item) => item.idCurso === selectedId);
      if (c) {
        document.getElementById('curso-info-nombre').textContent = c.nombre;
        const fi = c.fechaInicio ? new Date(c.fechaInicio).toLocaleDateString('es-AR') : '\u2014';
        document.getElementById('curso-info-inicio').textContent = fi;
        document.getElementById('curso-info-horas').textContent = `${c.cantidadHoras} hs`;
        document.getElementById('curso-info-cupo').textContent = c.inscriptosMax;

        const estadoEl = document.getElementById('curso-info-estado');
        estadoEl.textContent = c.estado || '\u2014';
        estadoEl.className = 'badge';
        if (c.idCursoEstado === 2) {
          estadoEl.classList.add('bg-success');
        } else if (c.idCursoEstado === 3) {
          estadoEl.classList.add('bg-danger');
        } else if (c.idCursoEstado === 1) {
          estadoEl.classList.add('bg-warning', 'text-dark');
        } else {
          estadoEl.classList.add('bg-secondary');
        }

        document.getElementById('curso-info-descripcion').textContent = c.descripcion || 'Sin descripción.';
        infoCard.classList.remove('d-none');
      } else {
        infoCard.classList.add('d-none');
      }
    });

    const estInfoCard = document.getElementById('estudiante-info');
    selE.addEventListener('change', () => {
      const selectedId = Number(selE.value);
      const s = estudiantes.find((item) => item.idEstudiante === selectedId);
      if (s) {
        document.getElementById('estudiante-info-nombre').textContent = `${s.apellido}, ${s.nombres}`;
        document.getElementById('estudiante-info-documento').textContent = s.documento;
        document.getElementById('estudiante-info-email').textContent = s.email || '—';
        const fn = s.fechaNacimiento
          ? new Date(s.fechaNacimiento).toLocaleDateString('es-AR')
          : '—';
        document.getElementById('estudiante-info-fecha-nac').textContent = fn;
        estInfoCard.classList.remove('d-none');
      } else {
        estInfoCard.classList.add('d-none');
      }
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
