/**
 * Mensajes de error de la API v2.
 *
 * Convenciones:
 * - Español rioplatense, oraciones completas, siempre con punto final.
 * - Validación (express-validator) → 400 con { errors: [...] } (mensajes en validators/).
 * - Negocio / auth / not found → 4xx/5xx con { error: "..." } (constantes de este archivo).
 */

// --- Genéricos ---
export const RECURSO_NO_ENCONTRADO = 'Recurso no encontrado.';
export const ERROR_INTERNO = 'Error interno del servidor.';

// --- Auth / JWT ---
export const JWT_SECRET_NO_CONFIGURADO = 'JWT_SECRET no está configurado en el servidor.';
export const JWT_REFRESH_SECRET_NO_CONFIGURADO =
  'JWT_REFRESH_SECRET no está configurado en el servidor.';
export const CREDENCIALES_INVALIDAS = 'Credenciales inválidas.';
export const LOGIN_CAMPOS_REQUERIDOS = 'nombreUsuario y contrasenia son requeridos.';
export const REFRESH_TOKEN_AUSENTE = 'Refresh token ausente.';
export const REFRESH_TOKEN_INVALIDO_O_EXPIRADO = 'Refresh token inválido o expirado.';
export const REFRESH_TOKEN_INVALIDO = 'Refresh token inválido.';
export const REFRESH_TOKEN_REUTILIZADO = 'Refresh token reutilizado; sesión invalidada.';
export const REFRESH_TOKEN_EXPIRADO = 'Refresh token expirado.';
export const USUARIO_NO_ENCONTRADO_O_INACTIVO = 'Usuario no encontrado o inactivo.';
export const JWT_TOKEN_AUSENTE = 'No autorizado: token ausente o mal formado.';
export const JWT_USUARIO_NO_ENCONTRADO = 'No autorizado: usuario no encontrado o inactivo.';
export const JWT_TOKEN_EXPIRADO = 'No autorizado: token expirado.';
export const JWT_TOKEN_INVALIDO = 'No autorizado: token inválido.';
export const LOGIN_RATE_LIMIT = 'Demasiados intentos de login. Intente más tarde.';

// --- Cursos ---
export const CURSO_NO_ENCONTRADO = 'Curso no encontrado.';
export const CURSO_ESTADO_INVALIDO = 'El estado del curso no es válido.';

export function cursoCupoReducido(inscriptosActuales) {
  return `No se puede reducir el cupo por debajo de los inscriptos actuales (${inscriptosActuales}).`;
}

export function cursoTieneInscriptosActivos(inscriptosActuales) {
  return `No se puede eliminar el curso: tiene ${inscriptosActuales} inscripto(s) activo(s).`;
}

// --- Estudiantes ---
export const ESTUDIANTE_NO_ENCONTRADO = 'Estudiante no encontrado.';
export const ESTUDIANTE_NO_ENCONTRADO_O_INACTIVO = 'Estudiante no encontrado o inactivo.';
export const ESTUDIANTE_DOCUMENTO_DUPLICADO =
  'Ya existe un estudiante activo con ese documento.';

export function estudianteTieneInscripcionesActivas(inscripcionesActivas) {
  return `No se puede eliminar el estudiante: tiene ${inscripcionesActivas} inscripción(es) activa(s).`;
}

// --- Inscripciones ---
export const INSCRIPCION_NO_ENCONTRADA = 'Inscripción no encontrada.';
export const ESTUDIANTE_NO_ENCONTRADO_INSCRIPCION = 'Estudiante no encontrado.';
export const ESTUDIANTE_INACTIVO_INSCRIPCION =
  'El estudiante está inactivo; no se puede inscribir.';
export const INSCRIPCION_DUPLICADA =
  'El estudiante ya se encuentra inscripto en este curso.';
export const CURSO_NO_ENCONTRADO_INSCRIPCION = 'Curso no encontrado.';
export const CURSO_NO_HABILITADO_INSCRIPCION =
  'El curso no está habilitado para inscripciones.';
export const CURSO_INSCRIPCION_NO_ABIERTA =
  'Solo se puede inscribir en cursos con inscripción abierta.';
export const CURSO_CUPO_MAXIMO =
  'El curso ha alcanzado el cupo máximo de inscriptos.';

// --- Certificado PDF ---
export const FECHA_INSCRIPCION_INVALIDA = 'La fecha de inscripción no es válida.';
export const INSCRIPCION_CANCELADA_CERTIFICADO =
  'La inscripción está cancelada; no se puede emitir certificado.';
export const ESTUDIANTE_INACTIVO_CERTIFICADO =
  'El estudiante está inactivo; no se puede emitir certificado.';
export const CURSO_NO_HABILITADO_CERTIFICADO =
  'El curso no está habilitado para emitir certificados.';
export const CERTIFICADO_DATOS_INCOMPLETOS =
  'Datos incompletos para generar el certificado.';
export const CERTIFICADO_PDF_ERROR = 'No se pudo generar el certificado PDF.';
