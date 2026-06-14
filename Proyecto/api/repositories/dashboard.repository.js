import pool from '../db/pool.js';

/** Inscripciones no canceladas (id_inscripcion_estado = 1). */
const INSCRIPCION_ESTADO_ACTIVA = 1;

const FROM_CURSOS_ACTIVOS = `
  FROM cursos c
  JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
 WHERE cs.es_activo = 1
`;

export default class DashboardRepository {
  /**
   * Cuenta cursos cuyo estado tiene es_activo = 1 (no eliminados).
   * @returns {Promise<number>}
   */
  async countCursosActivos() {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS total ${FROM_CURSOS_ACTIVOS}`,
    );
    return result.rows[0].total;
  }

  /**
   * Cuenta estudiantes activos (activo = 1).
   * @returns {Promise<number>}
   */
  async countEstudiantesActivos() {
    const result = await pool.query(
      'SELECT COUNT(*)::int AS total FROM estudiantes WHERE activo = 1',
    );
    return result.rows[0].total;
  }

  /**
   * Cuenta inscripciones no canceladas (id_inscripcion_estado = 1).
   * @returns {Promise<number>}
   */
  async countInscripcionesActivas() {
    const result = await pool.query(
      'SELECT COUNT(*)::int AS total FROM inscripciones WHERE id_inscripcion_estado = $1',
      [INSCRIPCION_ESTADO_ACTIVA],
    );
    return result.rows[0].total;
  }

  /**
   * Cursos activos paginados, ordenados por cantidad de inscriptos (desc).
   * @param {number} limit
   * @param {number} offset
   * @returns {Promise<{ rows: Array, total: number }>}
   */
  async getCursosRapidos(limit, offset) {
    const dataQuery = `
      SELECT c.id_curso,
             c.nombre,
             c.inscriptos_max,
             (SELECT COUNT(*)::int
                FROM inscripciones i
               WHERE i.id_curso = c.id_curso
                 AND i.id_inscripcion_estado = $1) AS inscriptos_actuales
      ${FROM_CURSOS_ACTIVOS}
      ORDER BY inscriptos_actuales DESC, c.nombre ASC, c.id_curso ASC
      LIMIT $2 OFFSET $3
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [INSCRIPCION_ESTADO_ACTIVA, limit, offset]),
      pool.query(`SELECT COUNT(*)::int AS total ${FROM_CURSOS_ACTIVOS}`),
    ]);

    return {
      rows: dataResult.rows,
      total: countResult.rows[0].total,
    };
  }
}
