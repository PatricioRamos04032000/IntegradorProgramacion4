const pool = require('../db/pool');

const EstudianteModel = {

    // BREAD: Obtener todos los estudiantes con paginación, búsqueda y excluyendo los eliminados 
    getAll: async (searchQuery, limit, offset) => {
        let query = `
            SELECT id_estudiante, documento, apellido, nombres, email, fecha_nacimiento
            FROM estudiantes
            WHERE activo = 1
        `;
        const params = [];
        let paramIndex = 1;

        // Criterio de búsqueda por apellido o documento
        if (searchQuery) {
            query += ` AND (apellido ILIKE $${paramIndex} OR documento ILIKE $${paramIndex})`;
            params.push(`%${searchQuery}%`);
            paramIndex++;
        }

        query += ` ORDER BY id_estudiante LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        return result.rows;
        // Consulta adicional para el total de registros (necesario para la paginación)
        // (Se implementaría el count con los mismos filtros)
    },

    // READ: Obtener un estudiante por ID
    getById: async (id) => {
        const query = `SELECT * FROM estudiantes WHERE id_estudiante = $1 AND activo = 1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    },

    // EDIT: Actualizar un estudiante existente
    update: async (id, data, idUsuarioModificacion) => {
        const query = `
            UPDATE estudiantes
            SET documento = $1, apellido = $2, nombres = $3, email = $4, fecha_nacimiento = $5,
                id_usuario_modificacion = $6, fecha_hora_modificacion = NOW()
            WHERE id_estudiante = $7 AND activo = 1
        `;
        const params = [
            data.documento, data.apellido, data.nombres, data.email, data.fecha_nacimiento, idUsuarioModificacion, id
        ];
        await pool.query(query, params);
    },

    // ADD: Agregar un nuevo estudiante
    create: async (data, idUsuarioModificacion) => {
        const query = `
            INSERT INTO estudiantes
            (documento, apellido, nombres, email, fecha_nacimiento, activo, id_usuario_modificacion, fecha_hora_modificacion)
            VALUES ($1, $2, $3, $4, $5, 1, $6, NOW())
            RETURNING id_estudiante
        `;
        const params = [
            data.documento, data.apellido, data.nombres, data.email, data.fecha_nacimiento, idUsuarioModificacion
        ];
        const result = await pool.query(query, params);
        return result.rows[0];
    },

    // DELETE: Eliminar un estudiante (marcar como inactivo)
    delete: async (id, idUsuarioModificacion) => {
        const query = `
            UPDATE estudiantes
            SET activo = 0, id_usuario_modificacion = $1, fecha_hora_modificacion = NOW()
            WHERE id_estudiante = $2
        `;
        await pool.query(query, [idUsuarioModificacion, id]);
    }   
};

module.exports = EstudianteModel;