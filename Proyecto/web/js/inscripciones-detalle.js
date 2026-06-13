import { requireAuth } from './requireAuth.js';
import { api } from './api.js';
import { descargarCertificado } from './certificado.js';

requireAuth();

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
    showError('Falta id en la URL.');
    return;
  }

  try {
    const ins = await api.get(`/api/v2/inscripciones/${id}`);
    if (!ins) return;
    const fecha = ins.fechaHoraInscripcion
      ? new Date(ins.fechaHoraInscripcion).toLocaleDateString('es-AR')
      : '—';
    document.getElementById('contenido').innerHTML = `
      <p class="text-center text-muted small mb-2">Universidad Nacional de Entre Ríos — FCAD</p>
      <p class="mb-2">Se certifica que el/la estudiante <strong>${ins.apellido}, ${ins.nombres}</strong>
      (documento <strong>${ins.documento}</strong>) se encuentra inscripto/a en el curso:</p>
      <p class="fs-5 text-primary text-center">${ins.cursoNombre}</p>
      <p class="text-end small text-muted mb-0">Fecha de inscripción: ${fecha}</p>`;
  } catch (e) {
    showError(e.message || 'No se pudo cargar la inscripción.');
    return;
  }

  document.getElementById('btn-pdf').addEventListener('click', async () => {
    try {
      await descargarCertificado(id);
    } catch (e) {
      window.alert(e.message || 'Error de red al descargar el certificado.');
    }
  });
});
