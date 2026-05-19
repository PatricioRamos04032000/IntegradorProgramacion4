import { API_BASE } from './config.js';
import { getToken, clearToken } from './auth.js';
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
    showError('Falta id en la URL.');
    return;
  }

  try {
    const ins = await api.get(`/inscripciones/${id}`);
    if (!ins) return;
    const fecha = ins.fecha_hora_inscripcion
      ? new Date(ins.fecha_hora_inscripcion).toLocaleDateString('es-AR')
      : '—';
    document.getElementById('contenido').innerHTML = `
      <p class="text-center text-muted small mb-2">Universidad Nacional de Entre Ríos — FCAD</p>
      <p class="mb-2">Se certifica que el/la estudiante <strong>${ins.apellido}, ${ins.nombres}</strong>
      (documento <strong>${ins.documento}</strong>) se encuentra inscripto/a en el curso:</p>
      <p class="fs-5 text-primary text-center">${ins.curso_nombre}</p>
      <p class="text-end small text-muted mb-0">Fecha de inscripción: ${fecha}</p>`;
  } catch (e) {
    showError(e.message || 'No se pudo cargar la inscripción.');
    return;
  }

  document.getElementById('btn-pdf').addEventListener('click', async () => {
    const token = getToken();
    if (!token) {
      window.alert('No hay sesión. Iniciá sesión de nuevo.');
      window.location.href = 'login.html';
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/inscripciones/${id}/certificado`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        clearToken();
        window.alert('Sesión expirada.');
        window.location.href = 'login.html';
        return;
      }
      if (res.status === 404) {
        window.alert('Inscripción no encontrada o inactiva.');
        return;
      }
      if (!res.ok) {
        window.alert('Error al generar el PDF (' + res.status + ').');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificado-inscripcion-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.alert('Error de red al descargar el certificado.');
    }
  });
});
