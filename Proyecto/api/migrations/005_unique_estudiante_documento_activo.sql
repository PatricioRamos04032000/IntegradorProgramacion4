-- Índice único parcial: impide a nivel de base de datos que existan dos estudiantes
-- ACTIVOS (activo = 1) con el mismo documento.
-- Es la red de seguridad de "documento único entre activos" frente a concurrencia.
-- Ejecutar: psql -h localhost -U postgres -d fcad_cursos -f migrations/005_unique_estudiante_documento_activo.sql

-- IMPORTANTE: si ya existieran documentos duplicados entre activos, la creación del índice fallará.
-- Verificar previamente con:
--   SELECT documento, COUNT(*)
--     FROM estudiantes
--    WHERE activo = 1
--    GROUP BY documento
--   HAVING COUNT(*) > 1;
-- y resolver los duplicados (baja lógica o corrección de datos) antes de continuar.

BEGIN;

CREATE UNIQUE INDEX IF NOT EXISTS uq_estudiante_documento_activo
  ON estudiantes (documento)
  WHERE activo = 1;

COMMIT;
