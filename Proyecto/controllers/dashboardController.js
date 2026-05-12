const pool = require('../db/pool');

const dashboardController = {
    getDashboard: async (req, res, next) => {
        try {
            // Usamos Promise.all para hacer las consultas a la vez (más rápido)
            const [cursosResult, estudiantesResult, linksRapidosResult] = await Promise.all([
                // Contamos cursos activos (asumiendo id_curso_estado = 1)
                pool.query('SELECT COUNT(*)::int AS total FROM cursos WHERE id_curso_estado = 1'),
                
                // Contamos estudiantes activos
                pool.query('SELECT COUNT(*)::int AS total FROM estudiantes WHERE activo = 1'),
                
                // Traemos los últimos 5 cursos activos para los links rápidos
                pool.query(`
                    SELECT id_curso, nombre, inscriptos_max 
                    FROM cursos 
                    WHERE id_curso_estado = 1 
                    ORDER BY fecha_inicio DESC 
                    LIMIT 5
                `)
            ]);

            res.render('index', {
                title: 'Panel de Control - FCAD',
                totalCursos: cursosResult.rows[0].total,
                totalEstudiantes: estudiantesResult.rows[0].total,
                cursosRapidos: linksRapidosResult.rows
            });

        } catch (error) {
            next(error);
        }
    }
};

module.exports = dashboardController;