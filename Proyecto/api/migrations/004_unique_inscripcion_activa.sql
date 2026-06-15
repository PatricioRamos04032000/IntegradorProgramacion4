-- Índice único parcial: impide a nivel de base de datos que un mismo estudiante
-- tenga más de una inscripción ACTIVA (id_inscripcion_estado = 1) en el mismo curso.
-- Es la red de seguridad de "no inscripciones duplicadas" frente a concurrencia.
-- Ejecutar: psql -h localhost -U postgres -d fcad_cursos -f migrations/004_unique_inscripcion_activa.sql

-- IMPORTANTE: si ya existieran duplicados activos, la creación del índice fallará.
-- Verificar previamente con:
--   SELECT id_curso, id_estudiante, COUNT(*)
--     FROM inscripciones
--    WHERE id_inscripcion_estado = 1
--    GROUP BY id_curso, id_estudiante
--   HAVING COUNT(*) > 1;
-- y cancelar los sobrantes (id_inscripcion_estado = 2) antes de continuar.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS uq_inscripcion_activa
  ON inscripciones (id_curso, id_estudiante)
  WHERE id_inscripcion_estado = 1;

COMMIT;
