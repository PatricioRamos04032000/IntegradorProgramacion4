-- 20 cursos y 20 estudiantes de prueba para paginación del panel.
-- Ejecutar: psql -h localhost -U postgres -d fcad_cursos -f migrations/003_demo_paginacion_20.sql

BEGIN;

INSERT INTO cursos (
  nombre,
  descripcion,
  fecha_inicio,
  cantidad_horas,
  inscriptos_max,
  id_curso_estado,
  id_usuario_modificacion,
  fecha_hora_modificacion
)
SELECT
  'Curso demo paginación ' || LPAD(g.n::text, 2, '0'),
  'Curso de prueba #' || g.n || ' para probar paginación en el panel de inicio.',
  DATE '2026-07-01' + (g.n - 1),
  20 + (g.n % 15),
  10 + (g.n % 20),
  2,
  1,
  NOW()
FROM generate_series(1, 20) AS g(n);

INSERT INTO estudiantes (
  documento,
  apellido,
  nombres,
  email,
  fecha_nacimiento,
  activo,
  id_usuario_modificacion,
  fecha_hora_modificacion
)
SELECT
  '4020' || LPAD(g.n::text, 4, '0'),
  'APELLIDO-DEMO-' || LPAD(g.n::text, 2, '0'),
  'Nombre Demo ' || LPAD(g.n::text, 2, '0'),
  'estudiante.demo.' || LPAD(g.n::text, 2, '0') || '@fcad.uner.edu.ar',
  DATE '2000-01-01' + (g.n * 17),
  1,
  1,
  NOW()
FROM generate_series(1, 20) AS g(n);

COMMIT;

SELECT COUNT(*) AS cursos_activos
  FROM cursos c
  JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
 WHERE cs.es_activo = 1;

SELECT COUNT(*) AS estudiantes_activos
  FROM estudiantes
 WHERE activo = 1;

SELECT COUNT(*) AS cursos_demo
  FROM cursos
 WHERE nombre LIKE 'Curso demo paginación %';

SELECT COUNT(*) AS estudiantes_demo
  FROM estudiantes
 WHERE documento LIKE '4020%';
