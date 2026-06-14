-- Ejemplo: curso con cupo 5/5 para pruebas del panel de inicio.
-- Ejecutar: psql -h localhost -U postgres -d fcad_cursos -f migrations/002_ejemplo_cupo_completo.sql

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
VALUES (
  'Introducción a DevOps (demo cupo 5)',
  'Curso de ejemplo con cupo máximo de 5 inscriptos. Creado para probar el panel de inicio.',
  '2026-06-15',
  24,
  5,
  2,
  1,
  NOW()
);

INSERT INTO estudiantes (
  documento, apellido, nombres, email, fecha_nacimiento, activo,
  id_usuario_modificacion, fecha_hora_modificacion
)
VALUES
  ('40100001', 'PÉREZ', 'ANA BELÉN', 'ana.perez.demo@fcad.uner.edu.ar', '2001-03-12', 1, 1, NOW()),
  ('40100002', 'LÓPEZ', 'BRUNO MATÍAS', 'bruno.lopez.demo@fcad.uner.edu.ar', '1999-07-22', 1, 1, NOW()),
  ('40100003', 'FERNÁNDEZ', 'CARLA SOFÍA', 'carla.fernandez.demo@fcad.uner.edu.ar', '2002-11-05', 1, 1, NOW()),
  ('40100004', 'SÁNCHEZ', 'DIEGO EMANUEL', 'diego.sanchez.demo@fcad.uner.edu.ar', '1998-01-18', 1, 1, NOW()),
  ('40100005', 'ROMERO', 'ELENA VICTORIA', 'elena.romero.demo@fcad.uner.edu.ar', '2000-09-30', 1, 1, NOW());

INSERT INTO inscripciones (
  id_curso,
  id_estudiante,
  fecha_hora_inscripcion,
  id_inscripcion_estado,
  id_usuario_modificacion,
  fecha_hora_modificacion
)
SELECT
  c.id_curso,
  e.id_estudiante,
  NOW(),
  1,
  1,
  NOW()
FROM cursos c
CROSS JOIN estudiantes e
WHERE c.nombre = 'Introducción a DevOps (demo cupo 5)'
  AND e.documento IN ('40100001', '40100002', '40100003', '40100004', '40100005');

COMMIT;

-- Verificación
SELECT c.id_curso, c.nombre, c.inscriptos_max, c.id_curso_estado,
       COUNT(i.id_inscripcion) FILTER (WHERE i.id_inscripcion_estado = 1) AS inscriptos_actuales
  FROM cursos c
  LEFT JOIN inscripciones i ON i.id_curso = c.id_curso
 WHERE c.nombre = 'Introducción a DevOps (demo cupo 5)'
 GROUP BY c.id_curso, c.nombre, c.inscriptos_max, c.id_curso_estado;

SELECT e.id_estudiante, e.documento, e.apellido, e.nombres
  FROM estudiantes e
 WHERE e.documento IN ('40100001', '40100002', '40100003', '40100004', '40100005')
 ORDER BY e.documento;

SELECT i.id_inscripcion, i.id_curso, i.id_estudiante, e.apellido, e.nombres
  FROM inscripciones i
  JOIN estudiantes e ON e.id_estudiante = i.id_estudiante
  JOIN cursos c ON c.id_curso = i.id_curso
 WHERE c.nombre = 'Introducción a DevOps (demo cupo 5)'
   AND i.id_inscripcion_estado = 1
 ORDER BY i.id_inscripcion;
