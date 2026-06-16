import createError from 'http-errors';
import {
  CERTIFICADO_DATOS_INCOMPLETOS,
  CURSO_INSCRIPCION_NO_CERRADA_CERTIFICADO,
  CURSO_NO_HABILITADO_CERTIFICADO,
  ESTUDIANTE_INACTIVO_CERTIFICADO,
  FECHA_INSCRIPCION_INVALIDA,
  INSCRIPCION_CANCELADA_CERTIFICADO,
  INSCRIPCION_NO_ENCONTRADA,
} from '../constants/apiMessages.js';

const ESTADO_INSCRIPCION_ACTIVA = 1;
export const CURSO_ESTADO_INSCRIPCION_CERRADA = 3;

const CAMPOS_REQUERIDOS = ['apellido', 'nombres', 'documento', 'curso_nombre'];

function fechaInscripcionValida(fecha) {
  if (fecha == null || fecha === '') {
    return false;
  }
  const parsed = fecha instanceof Date ? fecha : new Date(fecha);
  return !Number.isNaN(parsed.getTime());
}

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

export function esElegibleParaCertificado(row) {
  if (!row) {
    return { ok: false, status: 404, message: INSCRIPCION_NO_ENCONTRADA };
  }

  if (row.id_inscripcion_estado !== ESTADO_INSCRIPCION_ACTIVA) {
    return { ok: false, status: 422, message: INSCRIPCION_CANCELADA_CERTIFICADO };
  }

  if (row.activo !== 1) {
    return { ok: false, status: 422, message: ESTUDIANTE_INACTIVO_CERTIFICADO };
  }

  if (row.curso_estado_activo !== 1) {
    return { ok: false, status: 422, message: CURSO_NO_HABILITADO_CERTIFICADO };
  }

  if (row.id_curso_estado !== CURSO_ESTADO_INSCRIPCION_CERRADA) {
    return { ok: false, status: 422, message: CURSO_INSCRIPCION_NO_CERRADA_CERTIFICADO };
  }

  const faltantes = CAMPOS_REQUERIDOS.filter((campo) => {
    const valor = row[campo];
    return valor == null || String(valor).trim() === '';
  });

  if (faltantes.length > 0) {
    return { ok: false, status: 422, message: CERTIFICADO_DATOS_INCOMPLETOS };
  }

  if (!fechaInscripcionValida(row.fecha_hora_inscripcion)) {
    return { ok: false, status: 422, message: FECHA_INSCRIPCION_INVALIDA };
  }

  return { ok: true };
}

export function assertElegibleParaCertificado(row) {
  const resultado = esElegibleParaCertificado(row);
  if (!resultado.ok) {
    throw createError(resultado.status, resultado.message);
  }
}
