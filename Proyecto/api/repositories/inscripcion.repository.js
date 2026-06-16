import pool from '../db/pool.js';

const ESTADO_CANCELADO = 2;

export default class InscripcionRepository {
  async getAll(filter, limit, offset) {
    const params = [];
    let paramIndex = 1;
    let filtroBusqueda = '';

    if (filter?.q && filter.q.trim() !== '') {
      filtroBusqueda = ` AND (
        e.documento ILIKE $${paramIndex}
        OR c.nombre ILIKE $${paramIndex}
        OR e.apellido ILIKE $${paramIndex}
      )`;
      params.push(`%${filter.q.trim()}%`);
      paramIndex++;
    }

    let strLimit = '';
    let strOffset = '';

    if (limit) {
      strLimit = `LIMIT $${paramIndex}`;
      params.push(limit);
      paramIndex++;
    }

    if (offset) {
      strOffset = `OFFSET $${paramIndex}`;
      params.push(offset);
      paramIndex++;
    }

    const countParams = params.slice(0, paramIndex - 1 - (limit ? 1 : 0) - (offset ? 1 : 0));

    const dataQuery = `
      SELECT i.id_inscripcion, i.fecha_hora_inscripcion,
             c.nombre AS curso_nombre, e.apellido, e.nombres, e.documento
        FROM inscripciones i
        JOIN cursos c ON i.id_curso = c.id_curso
        JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
       WHERE i.id_inscripcion_estado = 1
       ${filtroBusqueda}
       ORDER BY i.fecha_hora_inscripcion DESC, i.id_inscripcion DESC
       ${strLimit}
       ${strOffset}
    `;

    const countQuery = `
      SELECT COUNT(*)::int AS total
        FROM inscripciones i
        JOIN cursos c ON i.id_curso = c.id_curso
        JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
       WHERE i.id_inscripcion_estado = 1
       ${filtroBusqueda}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, params),
      pool.query(countQuery, countParams),
    ]);

    return {
      rows: dataResult.rows,
      total: countResult.rows[0].total,
    };
  }

  async getActivasByCurso(idCurso) {
    const result = await pool.query(
      `
      SELECT i.id_inscripcion,
             i.id_estudiante,
             i.id_inscripcion_estado,
             i.fecha_hora_inscripcion,
             c.nombre AS curso_nombre,
             c.id_curso_estado,
             cs.es_activo AS curso_estado_activo,
             e.apellido,
             e.nombres,
             e.documento,
             e.activo
        FROM inscripciones i
        JOIN cursos c ON i.id_curso = c.id_curso
        JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
        JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
       WHERE i.id_curso = $1
         AND i.id_inscripcion_estado = 1
       ORDER BY e.apellido ASC, e.nombres ASC, i.id_inscripcion ASC
      `,
      [Number(idCurso)],
    );
    return result.rows;
  }

  async getById(id) {
    const result = await pool.query(
      `
      SELECT i.id_inscripcion,
             i.id_inscripcion_estado,
             i.fecha_hora_inscripcion,
             c.nombre AS curso_nombre,
             c.id_curso_estado,
             cs.es_activo AS curso_estado_activo,
             e.apellido,
             e.nombres,
             e.documento,
             e.activo
        FROM inscripciones i
        JOIN cursos c ON i.id_curso = c.id_curso
        JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
        JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
       WHERE i.id_inscripcion = $1
         AND i.id_inscripcion_estado = 1
      `,
      [Number(id)],
    );
    return result.rows[0] || null;
  }

  async getByIdParaCertificado(id) {
    const result = await pool.query(
      `
      SELECT i.id_inscripcion,
             i.id_inscripcion_estado,
             i.fecha_hora_inscripcion,
             c.nombre AS curso_nombre,
             c.id_curso_estado,
             cs.es_activo AS curso_estado_activo,
             e.apellido,
             e.nombres,
             e.documento,
             e.activo
        FROM inscripciones i
        JOIN cursos c ON i.id_curso = c.id_curso
        JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
        JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
       WHERE i.id_inscripcion = $1
      `,
      [Number(id)],
    );
    return result.rows[0] || null;
  }

  async lockCurso(client, idCurso) {
    await client.query(`SELECT 1 FROM cursos WHERE id_curso = $1 FOR UPDATE`, [idCurso]);
  }

  async obtenerEstudianteActivo(client, idEstudiante) {
    const result = await client.query(
      `SELECT id_estudiante, activo FROM estudiantes WHERE id_estudiante = $1`,
      [idEstudiante],
    );
    return result.rows[0] || null;
  }

  async contarActivasPorEstudiante(idEstudiante) {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS total
         FROM inscripciones
        WHERE id_estudiante = $1 AND id_inscripcion_estado = 1`,
      [Number(idEstudiante)],
    );
    return result.rows[0].total;
  }

  async existeActivaPorCursoYEstudiante(client, idCurso, idEstudiante) {
    const result = await client.query(
      `
      SELECT id_inscripcion FROM inscripciones
       WHERE id_curso = $1 AND id_estudiante = $2 AND id_inscripcion_estado = 1
      `,
      [idCurso, idEstudiante],
    );
    return result.rows.length > 0;
  }

  async obtenerCursoParaCupo(client, idCurso) {
    const result = await client.query(
      `
      SELECT c.inscriptos_max,
             c.id_curso_estado,
             cs.es_activo AS curso_estado_activo,
             (SELECT COUNT(*) FROM inscripciones WHERE id_curso = $1 AND id_inscripcion_estado = 1) AS inscriptos_actuales
        FROM cursos c
        JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
       WHERE c.id_curso = $1
      `,
      [idCurso],
    );
    return result.rows[0] || null;
  }

  async insertarActiva(client, idCurso, idEstudiante, idUsuario) {
    const result = await client.query(
      `
      INSERT INTO inscripciones
      (id_curso, id_estudiante, fecha_hora_inscripcion, id_inscripcion_estado, id_usuario_modificacion, fecha_hora_modificacion)
      VALUES ($1, $2, NOW(), 1, $3, NOW())
      RETURNING id_inscripcion
      `,
      [idCurso, idEstudiante, idUsuario],
    );
    return result.rows[0].id_inscripcion;
  }

  async marcarCancelada(id, idUsuario) {
    const result = await pool.query(
      `
      UPDATE inscripciones
         SET id_inscripcion_estado = $1,
             id_usuario_modificacion = $2,
             fecha_hora_modificacion = NOW()
       WHERE id_inscripcion = $3
      `,
      [ESTADO_CANCELADO, Number(idUsuario), Number(id)],
    );
    return result.rowCount;
  }
}

export { ESTADO_CANCELADO };
