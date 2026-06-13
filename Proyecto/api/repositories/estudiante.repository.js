import pool from '../db/pool.js';

export default class EstudianteRepository {
  async getAll(filter, limit, offset, order) {
    const params = [];
    let paramIndex = 1;
    let strWhere = 'WHERE activo = 1';
    let strOrder = 'ORDER BY id_estudiante ASC';
    let strLimit = '';
    let strOffset = '';

    if (filter?.q) {
      strWhere += ` AND (apellido ILIKE $${paramIndex} OR documento ILIKE $${paramIndex})`;
      params.push(`%${filter.q.trim()}%`);
      paramIndex++;
    }

    if (filter?.documento) {
      strWhere += ` AND documento ILIKE $${paramIndex}`;
      params.push(`%${filter.documento.trim()}%`);
      paramIndex++;
    }

    if (filter?.apellido) {
      strWhere += ` AND apellido ILIKE $${paramIndex}`;
      params.push(`%${filter.apellido.trim()}%`);
      paramIndex++;
    }

    if (filter?.nombres) {
      strWhere += ` AND nombres ILIKE $${paramIndex}`;
      params.push(`%${filter.nombres.trim()}%`);
      paramIndex++;
    }

    if (filter?.email) {
      strWhere += ` AND email ILIKE $${paramIndex}`;
      params.push(`%${filter.email.trim()}%`);
      paramIndex++;
    }

    if (order && Object.keys(order).length > 0) {
      const parts = [];
      Object.entries(order).forEach(([key, value]) => {
        const dir = value === 'DESC' ? 'DESC' : 'ASC';
        parts.push(`${key} ${dir}`);
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
      SELECT id_estudiante, documento, apellido, nombres, email, fecha_nacimiento,
             id_usuario_modificacion, fecha_hora_modificacion
        FROM estudiantes
       ${strWhere}
       ${strOrder}
       ${strLimit}
       ${strOffset}
    `;

    const countQuery = `
      SELECT COUNT(*)::int AS total
        FROM estudiantes
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
    const result = await pool.query(
      `SELECT * FROM estudiantes WHERE id_estudiante = $1 AND activo = 1`,
      [Number(id)],
    );
    return result.rows[0] || null;
  }

  async create(data, idUsuario) {
    const result = await pool.query(
      `
      INSERT INTO estudiantes
      (documento, apellido, nombres, email, fecha_nacimiento, activo, id_usuario_modificacion, fecha_hora_modificacion)
      VALUES ($1, $2, $3, $4, $5, 1, $6, NOW())
      RETURNING id_estudiante
      `,
      [
        data.documento,
        data.apellido,
        data.nombres,
        data.email,
        data.fecha_nacimiento,
        Number(idUsuario),
      ],
    );
    return result.rows[0].id_estudiante;
  }

  async update(id, data, idUsuario) {
    const result = await pool.query(
      `
      UPDATE estudiantes
         SET documento = $1,
             apellido = $2,
             nombres = $3,
             email = $4,
             fecha_nacimiento = $5,
             id_usuario_modificacion = $6,
             fecha_hora_modificacion = NOW()
       WHERE id_estudiante = $7 AND activo = 1
      `,
      [
        data.documento,
        data.apellido,
        data.nombres,
        data.email,
        data.fecha_nacimiento,
        Number(idUsuario),
        Number(id),
      ],
    );
    return result.rowCount;
  }

  async delete(id, idUsuario) {
    const result = await pool.query(
      `
      UPDATE estudiantes
         SET activo = 0,
             id_usuario_modificacion = $1,
             fecha_hora_modificacion = NOW()
       WHERE id_estudiante = $2
      `,
      [Number(idUsuario), Number(id)],
    );
    return result.rowCount;
  }
}
