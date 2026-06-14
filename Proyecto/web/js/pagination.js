export const PAGE_SIZE = 10;

/**
 * Texto estándar: "Página X de Y (N etiqueta)"
 * @param {number} offset
 * @param {number} pageSize
 * @param {number} total
 * @param {string} [entityLabel='resultados']
 */
export function formatPagInfo(offset, pageSize, total, entityLabel = 'resultados') {
  const currentPage = Math.floor(offset / pageSize) + 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return `Página ${currentPage} de ${totalPages} (${total} ${entityLabel})`;
}

export function isPrevDisabled(offset) {
  return offset <= 0;
}

export function isNextDisabled(offset, pageSize, total) {
  return offset + pageSize >= total;
}

/**
 * Actualiza barra de paginación (texto + botones).
 * @param {{ pagInfoEl?: HTMLElement|null, btnPrevEl?: HTMLElement|null, btnNextEl?: HTMLElement|null, offset: number, pageSize?: number, total: number, entityLabel?: string, clear?: boolean }} opts
 */
export function updatePaginationBar({
  pagInfoEl,
  btnPrevEl,
  btnNextEl,
  offset,
  pageSize = PAGE_SIZE,
  total,
  entityLabel = 'resultados',
  clear = false,
}) {
  if (clear) {
    if (pagInfoEl) pagInfoEl.textContent = '';
    if (btnPrevEl) btnPrevEl.disabled = true;
    if (btnNextEl) btnNextEl.disabled = true;
    return;
  }

  if (pagInfoEl) {
    pagInfoEl.textContent = formatPagInfo(offset, pageSize, total, entityLabel);
  }
  if (btnPrevEl) {
    btnPrevEl.disabled = isPrevDisabled(offset);
  }
  if (btnNextEl) {
    btnNextEl.disabled = isNextDisabled(offset, pageSize, total);
  }
}

/**
 * Enlaza botones Anterior/Siguiente con offset.
 * @param {{ btnPrevEl: HTMLElement, btnNextEl: HTMLElement, getOffset: () => number, setOffset: (n: number) => void, pageSize?: number, onChange: () => void }} opts
 */
export function bindPaginationControls({
  btnPrevEl,
  btnNextEl,
  getOffset,
  setOffset,
  pageSize = PAGE_SIZE,
  onChange,
}) {
  btnPrevEl.addEventListener('click', () => {
    const offset = getOffset();
    if (offset >= pageSize) {
      setOffset(offset - pageSize);
      onChange();
    }
  });

  btnNextEl.addEventListener('click', () => {
    setOffset(getOffset() + pageSize);
    onChange();
  });
}

export function appendPageParams(params, offset, pageSize = PAGE_SIZE) {
  params.set('limit', String(pageSize));
  params.set('offset', String(offset));
}
