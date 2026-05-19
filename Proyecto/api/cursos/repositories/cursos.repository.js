import BdUtils from "./database.js";

const ESTADO_ELIMINADO = 4;

export default class CursosRepository {

    async getAll(filter, limit, offset, order) {
        const client = await BdUtils.createConnection();

        try {
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
                       c.fecha_hora_modificacion
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
                client.query(dataQuery, params),
                client.query(countQuery, countParams),
            ]);

            return {
                rows: dataResult.rows,
                total: countResult.rows[0].total,
            };
        } finally {
            client.release();
        }
    }

    async getById(id) {
        const client = await BdUtils.createConnection();
        try {
            const { rows } = await client.query(`
                SELECT c.id_curso,
                       c.nombre,
                       c.descripcion,
                       c.fecha_inicio,
                       c.cantidad_horas,
                       c.inscriptos_max,
                       c.id_curso_estado,
                       cs.descripcion AS estado,
                       c.id_usuario_modificacion,
                       c.fecha_hora_modificacion
                  FROM cursos c
                  JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
                 WHERE c.id_curso = $1
            `, [Number(id)]);
            return rows[0] || null;
        } finally {
            client.release();
        }
    }

    async create(data, usuarioId) {
        const client = await BdUtils.createConnection();
        try {
            const sql = `
                INSERT INTO cursos (
                    nombre, descripcion, fecha_inicio, cantidad_horas,
                    inscriptos_max, id_curso_estado,
                    id_usuario_modificacion, fecha_hora_modificacion
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                RETURNING id_curso
            `;
            const params = [
                data.nombre,
                data.descripcion,
                data.fecha_inicio,
                Number(data.cantidad_horas),
                Number(data.inscriptos_max),
                Number(data.id_curso_estado),
                Number(usuarioId),
            ];
            const result = await client.query(sql, params);
            return result.rows[0].id_curso;
        } finally {
            client.release();
        }
    }

    async update(id, data, usuarioId) {
        const client = await BdUtils.createConnection();
        try {
            const sql = `
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
            `;
            const params = [
                data.nombre,
                data.descripcion,
                data.fecha_inicio,
                Number(data.cantidad_horas),
                Number(data.inscriptos_max),
                Number(data.id_curso_estado),
                Number(usuarioId),
                Number(id),
            ];
            const result = await client.query(sql, params);
            return result.rowCount;
        } finally {
            client.release();
        }
    }

    async delete(id, usuarioId) {
        const client = await BdUtils.createConnection();
        try {
            const sql = `
                UPDATE cursos
                   SET id_curso_estado = $1,
                       id_usuario_modificacion = $2,
                       fecha_hora_modificacion = NOW()
                 WHERE id_curso = $3
            `;
            const result = await client.query(sql, [ESTADO_ELIMINADO, Number(usuarioId), Number(id)]);
            return result.rowCount;
        } finally {
            client.release();
        }
    }

    async getEstadosActivos() {
        const client = await BdUtils.createConnection();
        try {
            const sql = `
                SELECT id_curso_estado, descripcion
                  FROM cursos_estados
                 WHERE es_activo = 1
                 ORDER BY id_curso_estado
            `;
            const result = await client.query(sql);
            return result.rows;
        } finally {
            client.release();
        }
    }
}
