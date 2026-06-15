/** Tamaño de página por defecto cuando no se envía limit. */
export const DEFAULT_LIMIT = 10;

/** Tope máximo de filas por página para evitar dumps / DoS. */
export const MAX_LIMIT = 100;

/** Offset por defecto. */
export const DEFAULT_OFFSET = 0;

/**
 * Normaliza el limit: aplica default si no viene y lo recorta al tope máximo.
 * @param {unknown} value
 * @returns {number}
 */
export function normalizeLimit(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.trunc(n), MAX_LIMIT);
}

/**
 * Normaliza el offset: no negativo.
 * @param {unknown} value
 * @returns {number}
 */
export function normalizeOffset(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    return DEFAULT_OFFSET;
  }
  return Math.trunc(n);
}
