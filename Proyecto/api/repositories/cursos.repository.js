import pool from '../db/pool.js';

const ESTADO_ELIMINADO = 4;

export default class CursosRepository {
  async getAll(filter, limit, offset, order) {
    const params = [];
    let paramIndex = 1;
    let strWhere = '';
    let strOrder = '';
    let strLimit = '';
    let strOffset = '';

    if (filter && Object.keys(filter).length > 0) {
      Object.entries(filter).forEach(([key, value]) => {
        if (typeof value === 'string') {
          strWhere += ` AND c.${key} ILIKE '%' || $${paramIndex} || '%'`;
          params.push(value);
          paramIndex++;
        } else {
          strWhere += ` AND c.${key} = $${paramIndex}`;
          params.push(value);
          paramIndex++;
        }
      });
    }

    if (order && Object.keys(order).length > 0) {
      const parts = [];
      Object.entries(order).forEach(([key, value]) => {
        const dir = value === 'DESC' ? 'DESC' : 'ASC';
        parts.push(`c.${key} ${dir}`);
      });
      strOrder = `ORDER BY ${parts.join(', ')}`;
    }

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
      SELECT c.id_curso,
             c.nombre,
             c.descripcion,
             c.fecha_inicio,
             c.cantidad_horas,
             c.inscriptos_max,
             c.id_curso_estado,
             cs.descripcion AS estado,
             c.id_usuario_modificacion,
             c.fecha_hora_modificacion,
             (SELECT COUNT(*)::int
                FROM inscripciones i
               WHERE i.id_curso = c.id_curso
                 AND i.id_inscripcion_estado = 1) AS inscriptos_actuales
        FROM cursos c
        JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
       WHERE cs.es_activo = 1
       ${strWhere}
       ${strOrder}
       ${strLimit}
       ${strOffset}
    `;

    const countQuery = `
      SELECT COUNT(*)::int AS total
        FROM cursos c
        JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
       WHERE cs.es_activo = 1
       ${strWhere}
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

  async getById(id) {
    const { rows } = await pool.query(
      `
      SELECT c.id_curso,
             c.nombre,
             c.descripcion,
             c.fecha_inicio,
             c.cantidad_horas,
             c.inscriptos_max,
             c.id_curso_estado,
             cs.descripcion AS estado,
             c.id_usuario_modificacion,
             c.fecha_hora_modificacion,
             (SELECT COUNT(*)::int
                FROM inscripciones i
               WHERE i.id_curso = c.id_curso
                 AND i.id_inscripcion_estado = 1) AS inscriptos_actuales
        FROM cursos c
        JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
       WHERE c.id_curso = $1
         AND cs.es_activo = 1
      `,
      [Number(id)],
    );
    return rows[0] || null;
  }

  async create(data, usuarioId) {
    const result = await pool.query(
      `
      INSERT INTO cursos (
        nombre, descripcion, fecha_inicio, cantidad_horas,
        inscriptos_max, id_curso_estado,
        id_usuario_modificacion, fecha_hora_modificacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING id_curso
      `,
      [
        data.nombre,
        data.descripcion,
        data.fecha_inicio,
        Number(data.cantidad_horas),
        Number(data.inscriptos_max),
        Number(data.id_curso_estado),
        Number(usuarioId),
      ],
    );
    return result.rows[0].id_curso;
  }

  async update(id, data, usuarioId) {
    const result = await pool.query(
      `
      UPDATE cursos
         SET nombre = $1,
             descripcion = $2,
             fecha_inicio = $3,
             cantidad_horas = $4,
             inscriptos_max = $5,
             id_curso_estado = $6,
             id_usuario_modificacion = $7,
             fecha_hora_modificacion = NOW()
       WHERE id_curso = $8
      `,
      [
        data.nombre,
        data.descripcion,
        data.fecha_inicio,
        Number(data.cantidad_horas),
        Number(data.inscriptos_max),
        Number(data.id_curso_estado),
        Number(usuarioId),
        Number(id),
      ],
    );
    return result.rowCount;
  }

  async delete(id, usuarioId) {
    const result = await pool.query(
      `
      UPDATE cursos
         SET id_curso_estado = $1,
             id_usuario_modificacion = $2,
             fecha_hora_modificacion = NOW()
       WHERE id_curso = $3
      `,
      [ESTADO_ELIMINADO, Number(usuarioId), Number(id)],
    );
    return result.rowCount;
  }

  async contarInscriptosActivos(idCurso) {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS total
         FROM inscripciones
        WHERE id_curso = $1 AND id_inscripcion_estado = 1`,
      [Number(idCurso)],
    );
    return result.rows[0].total;
  }

  async getEstadosActivos() {
    const result = await pool.query(`
      SELECT id_curso_estado, descripcion
        FROM cursos_estados
       WHERE es_activo = 1
       ORDER BY id_curso_estado
    `);
    return result.rows;
  }

  async existeEstadoActivo(idCursoEstado) {
    const result = await pool.query(
      `SELECT 1 FROM cursos_estados WHERE id_curso_estado = $1 AND es_activo = 1`,
      [Number(idCursoEstado)],
    );
    return result.rows.length > 0;
  }
}

export { ESTADO_ELIMINADO };
