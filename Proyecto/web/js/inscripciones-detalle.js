import { requireAuth } from './requireAuth.js';
import { api } from './api.js';
import { escapeHtml } from './dom.js';
import { descargarCertificado, aplicarEstadoBotonCertificado, MSG_CERTIFICADO_NO_DISPONIBLE } from './certificado.js';

function idFromQuery() {
  const id = new URLSearchParams(window.location.search).get('id');
  return id && /^\d+$/.test(id) ? id : null;
}

function showPageError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg;
  el.style.display = 'block';
}

function showModalError(msg) {
  const el = document.getElementById('errorModal');
  document.getElementById('errorModalBody').textContent = msg;
  const modal = new bootstrap.Modal(el);
  el.addEventListener('hide.bs.modal', () => document.activeElement?.blur(), { once: true });
  modal.show();
}

document.addEventListener('DOMContentLoaded', async () => {
  await requireAuth();
  const id = idFromQuery();
  if (!id) {
    showPageError('Falta id en la URL.');
    return;
  }

  let puedeEmitirCertificado = false;

  try {
    const ins = await api.get(`/api/v2/inscripciones/${id}`);
    if (!ins) return;
    puedeEmitirCertificado = Boolean(ins.puedeEmitirCertificado);
    const fecha = ins.fechaHoraInscripcion
      ? new Date(ins.fechaHoraInscripcion).toLocaleDateString('es-AR')
      : '—';
    document.getElementById('contenido').innerHTML = `
      <p class="text-center text-muted small mb-2">Universidad Nacional de Entre Ríos — FCAD</p>
      <p class="mb-2">Se certifica que el/la estudiante <strong>${escapeHtml(ins.apellido)}, ${escapeHtml(ins.nombres)}</strong>
      (documento <strong>${escapeHtml(ins.documento)}</strong>) se encuentra inscripto/a en el curso:</p>
      <p class="fs-5 text-primary text-center">${escapeHtml(ins.cursoNombre)}</p>
      <p class="text-end small text-muted mb-0">Fecha de inscripción: ${escapeHtml(fecha)}</p>`;

    const btnPdf = document.getElementById('btn-pdf');
    const ayuda = document.getElementById('certificado-ayuda');
    aplicarEstadoBotonCertificado(btnPdf, puedeEmitirCertificado);
    if (ayuda) {
      ayuda.textContent = MSG_CERTIFICADO_NO_DISPONIBLE;
      ayuda.style.display = puedeEmitirCertificado ? 'none' : 'block';
    }
  } catch (e) {
    showPageError(e.message || 'No se pudo cargar la inscripción.');
    return;
  }

  document.getElementById('btn-pdf').addEventListener('click', async () => {
    if (!puedeEmitirCertificado) return;
    try {
      await descargarCertificado(id);
    } catch (e) {
      showModalError(e.message || 'No se pudo descargar el certificado.');
    }
  });
});
