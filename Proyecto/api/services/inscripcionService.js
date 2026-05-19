const pool = require('../db/pool');
const cursoRepository = require('../repositories/cursoRepository');
const estudianteRepository = require('../repositories/estudianteRepository');
const inscripcionRepository = require('../repositories/inscripcionRepository');

async function listarPaginado(searchQuery, page, pageSize) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.max(1, parseInt(pageSize, 10) || 10);
  const offset = (pageNum - 1) * size;
  return inscripcionRepository.listarActivas(searchQuery || '', size, offset);
}

async function obtenerPorId(id) {
  return inscripcionRepository.obtenerPorId(id);
}

async function obtenerDatosFormularioAlta() {
  const cursosData = await cursoRepository.listar({ pageSize: 1000 });
  const estudiantes = await estudianteRepository.listar('', 1000, 0);
  return {
    cursos: cursosData.items,
    estudiantes,
  };
}

async function crear(data, idUsuario) {
  const idCurso = Number(data.id_curso);
  const idEstudiante = Number(data.id_estudiante);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const duplicada = await inscripcionRepository.existeActivaPorCursoYEstudiante(
      client,
      idCurso,
      idEstudiante,
    );
    if (duplicada) {
      throw new Error('El estudiante ya se encuentra inscripto en este curso.');
    }

    const cursoRow = await inscripcionRepository.obtenerCursoParaCupo(client, idCurso);
    if (!cursoRow) {
      throw new Error('Curso no encontrado.');
    }
    if (cursoRow.id_curso_estado !== 1) {
      throw new Error('El curso no está habilitado para inscripciones.');
    }
    if (cursoRow.inscriptos_actuales >= cursoRow.inscriptos_max) {
      throw new Error('El curso ha alcanzado el cupo máximo de inscriptos.');
    }

    const row = await inscripcionRepository.insertarActiva(client, idCurso, idEstudiante, idUsuario);
    await client.query('COMMIT');
    return row;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function eliminar(id, idUsuario) {
  return inscripcionRepository.marcarCancelada(id, idUsuario);
}

module.exports = {
  listarPaginado,
  obtenerPorId,
  obtenerDatosFormularioAlta,
  crear,
  eliminar,
};
