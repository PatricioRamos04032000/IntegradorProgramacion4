import createError from 'http-errors';

const ESTADO_INSCRIPCION_ACTIVA = 1;

export function sanitizarNombreArchivo(texto) {
  if (!texto || typeof texto !== 'string') {
    return 'inscripcion';
  }

  const sanitizado = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return sanitizado || 'inscripcion';
}

export function formatearFechaInscripcion(fecha) {
  if (fecha == null || fecha === '') {
    throw createError(422, 'La fecha de inscripción no es válida.');
  }

  const parsed = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(parsed.getTime())) {
    throw createError(422, 'La fecha de inscripción no es válida.');
  }

  return parsed.toLocaleDateString('es-AR');
}

export function buildContentDisposition(id, apellido, disposition = 'attachment') {
  const tipo = disposition === 'inline' ? 'inline' : 'attachment';
  const apellidoSanitizado = sanitizarNombreArchivo(apellido);
  const filename = `certificado-inscripcion-${id}-${apellidoSanitizado}.pdf`;
  return `${tipo}; filename="${filename}"`;
}

export function assertElegibleParaCertificado(row) {
  if (!row) {
    throw createError(404, 'Inscripción no encontrada.');
  }

  if (row.id_inscripcion_estado !== ESTADO_INSCRIPCION_ACTIVA) {
    throw createError(422, 'La inscripción está cancelada; no se puede emitir certificado.');
  }

  if (row.activo !== 1) {
    throw createError(422, 'El estudiante está inactivo; no se puede emitir certificado.');
  }

  if (row.curso_estado_activo !== 1) {
    throw createError(422, 'El curso no está habilitado para emitir certificados.');
  }

  const camposRequeridos = ['apellido', 'nombres', 'documento', 'curso_nombre'];
  const faltantes = camposRequeridos.filter((campo) => {
    const valor = row[campo];
    return valor == null || String(valor).trim() === '';
  });

  if (faltantes.length > 0) {
    throw createError(422, 'Datos incompletos para generar el certificado.');
  }

  formatearFechaInscripcion(row.fecha_hora_inscripcion);
}
