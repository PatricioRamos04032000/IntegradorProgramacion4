const cursoRepository = require('../repositories/cursoRepository');
const createError = require('http-errors');

function getUsuarioActual() {
  return Number(process.env.DEFAULT_USER_ID) || 1;
}

function validarDatosCurso(body) {
  const errores = [];
  const nombre = (body.nombre || '').trim();
  const descripcion = (body.descripcion || '').trim();
  const fecha_inicio = (body.fecha_inicio || '').trim();
  const cantidad_horas = Number(body.cantidad_horas);
  const inscriptos_max = Number(body.inscriptos_max);
  const id_curso_estado = Number(body.id_curso_estado);

  if (!nombre) errores.push('El nombre es obligatorio.');
  if (nombre.length > 45) errores.push('El nombre no puede superar 45 caracteres.');
  if (!descripcion) errores.push('La descripción es obligatoria.');
  if (!fecha_inicio) errores.push('La fecha de inicio es obligatoria.');
  if (!Number.isInteger(cantidad_horas) || cantidad_horas < 0) {
    errores.push('La cantidad de horas debe ser un entero mayor o igual a 0.');
  }
  if (!Number.isInteger(inscriptos_max) || inscriptos_max < 0) {
    errores.push('El cupo máximo debe ser un entero mayor o igual a 0.');
  }
  if (!Number.isInteger(id_curso_estado) || id_curso_estado <= 0) {
    errores.push('Debe seleccionarse un estado válido.');
  }

  const datos = {
    nombre,
    descripcion,
    fecha_inicio,
    cantidad_horas,
    inscriptos_max,
    id_curso_estado,
  };

  return { errores, datos };
}

async function obtenerListado({ q, idEstado, page, pageSize }) {
  const [resultado, estados] = await Promise.all([
    cursoRepository.listar({ q, idEstado, page, pageSize }),
    cursoRepository.listarEstadosActivos(),
  ]);

  return {
    resultado,
    estados,
    filtros: { q, estado: idEstado, pageSize },
  };
}

async function obtenerCurso(id) {
  const curso = await cursoRepository.obtener(id);
  if (!curso) {
    throw createError(404, 'Curso no encontrado');
  }
  return curso;
}

async function obtenerEstadosActivos() {
  return cursoRepository.listarEstadosActivos();
}

function getCursoVacio() {
  return {
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    cantidad_horas: '',
    inscriptos_max: '',
    id_curso_estado: '',
  };
}

async function crearCurso(body) {
  const { errores, datos } = validarDatosCurso(body);
  if (errores.length > 0) {
    return { errores, datos, nuevoId: null };
  }

  const nuevoId = await cursoRepository.crear(datos, getUsuarioActual());
  return { errores: [], datos, nuevoId };
}

function normalizarCursoParaForm(curso) {
  return {
    ...curso,
    fecha_inicio: curso.fecha_inicio
      ? new Date(curso.fecha_inicio).toISOString().slice(0, 10)
      : '',
  };
}

async function actualizarCurso(id, body) {
  const { errores, datos } = validarDatosCurso(body);
  if (errores.length > 0) {
    return { errores, datos, filas: null };
  }

  const filas = await cursoRepository.actualizar(id, datos, getUsuarioActual());
  if (filas === 0) {
    throw createError(404, 'Curso no encontrado');
  }
  return { errores: [], datos, filas };
}

async function eliminarCurso(id) {
  const filas = await cursoRepository.eliminar(id, getUsuarioActual());
  if (filas === 0) {
    throw createError(404, 'Curso no encontrado');
  }
  return filas;
}

module.exports = {
  obtenerListado,
  obtenerCurso,
  obtenerEstadosActivos,
  getCursoVacio,
  crearCurso,
  normalizarCursoParaForm,
  actualizarCurso,
  eliminarCurso,
};
