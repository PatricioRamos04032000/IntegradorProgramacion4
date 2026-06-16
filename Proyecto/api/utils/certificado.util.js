import createError from 'http-errors';
import {
  CERTIFICADO_DATOS_INCOMPLETOS,
  CURSO_NO_HABILITADO_CERTIFICADO,
  ESTUDIANTE_INACTIVO_CERTIFICADO,
  FECHA_INSCRIPCION_INVALIDA,
  INSCRIPCION_CANCELADA_CERTIFICADO,
  INSCRIPCION_NO_ENCONTRADA,
} from '../constants/apiMessages.js';

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
    throw createError(422, FECHA_INSCRIPCION_INVALIDA);
  }

  const parsed = fecha instanceof Date ? fecha : new Date(fecha);
  if (Number.isNaN(parsed.getTime())) {
    throw createError(422, FECHA_INSCRIPCION_INVALIDA);
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
    throw createError(404, INSCRIPCION_NO_ENCONTRADA);
  }

  if (row.id_inscripcion_estado !== ESTADO_INSCRIPCION_ACTIVA) {
    throw createError(422, INSCRIPCION_CANCELADA_CERTIFICADO);
  }

  if (row.activo !== 1) {
    throw createError(422, ESTUDIANTE_INACTIVO_CERTIFICADO);
  }

  if (row.curso_estado_activo !== 1) {
    throw createError(422, CURSO_NO_HABILITADO_CERTIFICADO);
  }

  const camposRequeridos = ['apellido', 'nombres', 'documento', 'curso_nombre'];
  const faltantes = camposRequeridos.filter((campo) => {
    const valor = row[campo];
    return valor == null || String(valor).trim() === '';
  });

  if (faltantes.length > 0) {
    throw createError(422, CERTIFICADO_DATOS_INCOMPLETOS);
  }

  formatearFechaInscripcion(row.fecha_hora_inscripcion);
}
