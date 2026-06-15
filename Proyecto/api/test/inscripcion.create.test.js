import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import InscripcionService from '../services/inscripcion.service.js';
import pool from '../db/pool.js';

function cursoAbierto(overrides = {}) {
  return {
    inscriptos_max: 30,
    id_curso_estado: 2,
    curso_estado_activo: 1,
    inscriptos_actuales: 0,
    ...overrides,
  };
}

describe('InscripcionService.create — estado del curso', () => {
  const originalConnect = pool.connect.bind(pool);

  it('rechaza curso en borrador (1)', async () => {
    const service = new InscripcionService();
    const client = { query: async () => {}, release: () => {} };
    pool.connect = async () => client;
    service.repository.lockCurso = async () => {};
    service.repository.obtenerEstudianteActivo = async () => ({ id_estudiante: 1, activo: 1 });
    service.repository.existeActivaPorCursoYEstudiante = async () => false;
    service.repository.obtenerCursoParaCupo = async () => cursoAbierto({ id_curso_estado: 1 });

    await assert.rejects(
      () => service.create({ idCurso: 1, idEstudiante: 1 }, 1),
      (err) => err.status === 422 && err.message.includes('inscripción abierta'),
    );

    pool.connect = originalConnect;
  });

  it('rechaza curso con inscripción cerrada (3)', async () => {
    const service = new InscripcionService();
    const client = { query: async () => {}, release: () => {} };
    pool.connect = async () => client;
    service.repository.lockCurso = async () => {};
    service.repository.obtenerEstudianteActivo = async () => ({ id_estudiante: 1, activo: 1 });
    service.repository.existeActivaPorCursoYEstudiante = async () => false;
    service.repository.obtenerCursoParaCupo = async () => cursoAbierto({ id_curso_estado: 3 });

    await assert.rejects(
      () => service.create({ idCurso: 1, idEstudiante: 1 }, 1),
      (err) => err.status === 422 && err.message.includes('inscripción abierta'),
    );

    pool.connect = originalConnect;
  });

  it('rechaza curso eliminado (es_activo = 0)', async () => {
    const service = new InscripcionService();
    const client = { query: async () => {}, release: () => {} };
    pool.connect = async () => client;
    service.repository.lockCurso = async () => {};
    service.repository.obtenerEstudianteActivo = async () => ({ id_estudiante: 1, activo: 1 });
    service.repository.existeActivaPorCursoYEstudiante = async () => false;
    service.repository.obtenerCursoParaCupo = async () => cursoAbierto({
      id_curso_estado: 2,
      curso_estado_activo: 0,
    });

    await assert.rejects(
      () => service.create({ idCurso: 1, idEstudiante: 1 }, 1),
      (err) => err.status === 422 && err.message.includes('habilitado'),
    );

    pool.connect = originalConnect;
  });
});
