const pool = require('../db/pool');

const dashboardController = {
  getDashboard: async (req, res, next) => {
    try {
      const [cursosResult, estudiantesResult, linksRapidosResult] = await Promise.all([
        pool.query('SELECT COUNT(*)::int AS total FROM cursos WHERE id_curso_estado = 1'),
        pool.query('SELECT COUNT(*)::int AS total FROM estudiantes WHERE activo = 1'),
        pool.query(`
                    SELECT id_curso, nombre, inscriptos_max 
                    FROM cursos 
                    WHERE id_curso_estado = 1 
                    ORDER BY fecha_inicio DESC 
                    LIMIT 5
                `),
      ]);

      res.json({
        totalCursos: cursosResult.rows[0].total,
        totalEstudiantes: estudiantesResult.rows[0].total,
        cursosRapidos: linksRapidosResult.rows,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = dashboardController;
