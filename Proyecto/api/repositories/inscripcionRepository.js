const pool = require('../db/pool');

const ESTADO_CANCELADO = 2;

async function listarActivas(searchQuery, limit, offset) {
  const params = [];
  let paramIndex = 1;
  let filtroBusqueda = '';

  if (searchQuery && searchQuery.trim() !== '') {
    filtroBusqueda = ` AND (
      e.documento ILIKE $${paramIndex}
      OR c.nombre ILIKE $${paramIndex}
      OR e.apellido ILIKE $${paramIndex}
    )`;
    params.push(`%${searchQuery.trim()}%`);
    paramIndex++;
  }

  const query = `
      SELECT i.id_inscripcion, i.fecha_hora_inscripcion,
             c.nombre AS curso_nombre, e.apellido, e.nombres, e.documento
      FROM inscripciones i
      JOIN cursos c ON i.id_curso = c.id_curso
      JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
      WHERE i.id_inscripcion_estado = 1
      ${filtroBusqueda}
      ORDER BY i.fecha_hora_inscripcion DESC, i.id_inscripcion DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
  params.push(limit, offset);

  const result = await pool.query(query, params);
  return result.rows;
}

async function obtenerPorId(id) {
  const sql = `
    SELECT i.id_inscripcion,
           i.fecha_hora_inscripcion,
           c.nombre AS curso_nombre,
           e.apellido,
           e.nombres,
           e.documento
      FROM inscripciones i
      JOIN cursos c ON i.id_curso = c.id_curso
      JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
     WHERE i.id_inscripcion = $1
       AND i.id_inscripcion_estado = 1
  `;
  const result = await pool.query(sql, [id]);
  return result.rows[0] || null;
}

async function existeActivaPorCursoYEstudiante(client, idCurso, idEstudiante) {
  const sql = `
        SELECT id_inscripcion FROM inscripciones
        WHERE id_curso = $1 AND id_estudiante = $2 AND id_inscripcion_estado = 1
      `;
  const checkDup = await client.query(sql, [idCurso, idEstudiante]);
  return checkDup.rows.length > 0;
}

async function obtenerCursoParaCupo(client, idCurso) {
  const sql = `
        SELECT inscriptos_max, id_curso_estado,
          (SELECT COUNT(*) FROM inscripciones WHERE id_curso = $1 AND id_inscripcion_estado = 1) as inscriptos_actuales
        FROM cursos WHERE id_curso = $1
      `;
  const result = await client.query(sql, [idCurso]);
  return result.rows[0] || null;
}

async function insertarActiva(client, idCurso, idEstudiante, idUsuarioModificacion) {
  const sql = `
        INSERT INTO inscripciones
        (id_curso, id_estudiante, fecha_hora_inscripcion, id_inscripcion_estado, id_usuario_modificacion, fecha_hora_modificacion)
        VALUES ($1, $2, NOW(), 1, $3, NOW())
        RETURNING id_inscripcion
      `;
  const result = await client.query(sql, [idCurso, idEstudiante, idUsuarioModificacion]);
  return result.rows[0];
}

async function marcarCancelada(id, idUsuarioModificacion) {
  const query = `
      UPDATE inscripciones
      SET id_inscripcion_estado = $1, id_usuario_modificacion = $2, fecha_hora_modificacion = NOW()
      WHERE id_inscripcion = $3
    `;
  await pool.query(query, [ESTADO_CANCELADO, idUsuarioModificacion, id]);
}

module.exports = {
  ESTADO_CANCELADO,
  listarActivas,
  obtenerPorId,
  existeActivaPorCursoYEstudiante,
  obtenerCursoParaCupo,
  insertarActiva,
  marcarCancelada,
};
