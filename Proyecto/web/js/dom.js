/**
 * Escapa caracteres con significado en HTML para evitar XSS almacenado
 * al interpolar datos del usuario dentro de innerHTML.
 * @param {unknown} value
 * @returns {string}
 */
export function escapeHtml(value) {
  if (value == null) {
    return '';
  }
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
