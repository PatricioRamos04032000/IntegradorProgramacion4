const pool = require('../db/pool');

const ESTADO_CANCELADO = 2; // Parametro de la tabla inscripcion_estados de la BDD para marcar una inscripción como cancelada/baja

const inscripcionModel = {
  // BROWSE: Obtener inscripciones con datos de cursos y estudiantes
  getAll: async (searchQuery, limit, offset) => {
    let query = `
      SELECT i.id_inscripcion, i.fecha_hora_inscripcion, 
             c.nombre AS curso_nombre, e.apellido, e.nombres, e.documento 
      FROM inscripciones i
      JOIN cursos c ON i.id_curso = c.id_curso
      JOIN estudiantes e ON i.id_estudiante = e.id_estudiante
      WHERE i.id_inscripcion_estado = 1
    `;
    // ... Aca falta la lógica de búsqueda y paginación similar a Cursos y Estudiantes ...
    
    // Simplificado para el ejemplo
    const result = await pool.query(query);
    return result.rows;
  },

  // ADD: Crear inscripción validando duplicados y cupo
  create: async (data, idUsuarioModificacion) => {
    // Pedimos un cliente dedicado del pool para manejar la transacción
    const client = await pool.connect(); 
    
    try {
      await client.query('BEGIN'); // Iniciamos la transacción

      // 1. Validar que la inscripción no esté duplicada
      const checkDupQuery = `
        SELECT id_inscripcion FROM inscripciones 
        WHERE id_curso = $1 AND id_estudiante = $2 AND id_inscripcion_estado = 1
      `;
      const checkDup = await client.query(checkDupQuery, [data.id_curso, data.id_estudiante]);
      if (checkDup.rows.length > 0) {
        throw new Error('El estudiante ya se encuentra inscripto en este curso.');
      }

      // 2. Validar cupos y estado del curso
      const checkCursoQuery = `
        SELECT inscriptos_max, id_curso_estado,
          (SELECT COUNT(*) FROM inscripciones WHERE id_curso = $1 AND id_inscripcion_estado = 1) as inscriptos_actuales
        FROM cursos WHERE id_curso = $1
      `;
      const checkCurso = await client.query(checkCursoQuery, [data.id_curso]);

      if (checkCurso.rows.length === 0) throw new Error('Curso no encontrado.');
      // Asumimos que id_curso_estado = 1 significa Activo
      if (checkCurso.rows[0].id_curso_estado !== 1) throw new Error('El curso no está habilitado para inscripciones.');
      if (checkCurso.rows[0].inscriptos_actuales >= checkCurso.rows[0].inscriptos_max) {
         throw new Error('El curso ha alcanzado el cupo máximo de inscriptos.');
      }

      // 3. Si todo está correcto, procedemos a insertar
      const insertQuery = `
        INSERT INTO inscripciones 
        (id_curso, id_estudiante, fecha_hora_inscripcion, id_inscripcion_estado, id_usuario_modificacion, fecha_hora_modificacion) 
        VALUES ($1, $2, NOW(), 1, $3, NOW()) 
        RETURNING id_inscripcion
      `;
      // Asumimos que id_inscripcion_estado = 1 es Activa
      const result = await client.query(insertQuery, [data.id_curso, data.id_estudiante, idUsuarioModificacion]);

      await client.query('COMMIT'); // Confirmamos los cambios
      return result.rows[0];

    } catch (error) {
      await client.query('ROLLBACK'); // Si algo falla, deshacemos todo
      throw error; // Relanzamos el error para que lo atrape el controlador
    } finally {
      client.release(); // Siempre debemos devolver el cliente al pool
    }
  },

  // DELETE: Borrado lógico cambiando el estado
  delete: async (id, idUsuarioModificacion) => {
    const query = `
      UPDATE inscripciones 
      SET id_inscripcion_estado = $1, id_usuario_modificacion = $2, fecha_hora_modificacion = NOW() 
      WHERE id_inscripcion = $3
    `;
    // Asumimos que id_inscripcion_estado = 2 significa Cancelado/Baja
    await pool.query(query, [ESTADO_CANCELADO, idUsuarioModificacion, id]);
  }
};

module.exports = inscripcionModel;