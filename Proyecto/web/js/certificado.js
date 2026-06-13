import { API_BASE } from './config.js';
import { getToken, clearToken } from './auth.js';

export async function descargarCertificado(idInscripcion) {
  const token = getToken();
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  const res = await fetch(`${API_BASE}/api/v2/inscripciones/${idInscripcion}/certificado`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = 'login.html';
    return;
  }

  if (res.status === 404) {
    throw new Error('Inscripción no encontrada o inactiva.');
  }

  if (!res.ok) {
    throw new Error(`Error al generar el PDF (${res.status}).`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `certificado-inscripcion-${idInscripcion}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
