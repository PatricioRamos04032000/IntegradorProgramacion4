import { API_BASE } from './config.js';
import { getAccessToken } from './auth.js';
import { authFetch } from './api.js';
import { parseErrorResponse, throwIfNotOk, extractFilename } from './httpError.js';

export async function descargarCertificado(idInscripcion, { disposition } = {}) {
  if (!getAccessToken()) {
    window.location.href = 'login.html';
    return;
  }

  const params = new URLSearchParams();
  if (disposition) {
    params.set('disposition', disposition);
  }
  const query = params.toString();
  const url = `${API_BASE}/api/v2/inscripciones/${idInscripcion}/certificado${query ? `?${query}` : ''}`;

  const res = await authFetch(url);
  if (!res) return;

  const contentType = res.headers.get('content-type') || '';
  const isPdf = contentType.includes('pdf');

  if (!res.ok || !isPdf) {
    const text = await res.text();
    throwIfNotOk(res, text);
    if (!isPdf) {
      throw new Error(parseErrorResponse(res, text));
    }
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;

  const filenameFromHeader = extractFilename(res.headers.get('content-disposition'));
  a.download = filenameFromHeader || `certificado-inscripcion-${idInscripcion}.pdf`;

  if (disposition === 'inline') {
    window.open(objectUrl, '_blank', 'noopener,noreferrer');
    URL.revokeObjectURL(objectUrl);
    return;
  }

  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
