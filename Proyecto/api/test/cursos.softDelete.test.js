import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import CursosService from '../services/cursos.service.js';

const bodyUpdate = {
  nombre: 'Test',
  descripcion: 'Desc',
  fechaInicio: '2026-06-15',
  cantidadHoras: 10,
  inscriptosMax: 20,
  idCursoEstado: 1,
};

describe('CursosService — curso eliminado o inexistente', () => {
  it('update rechaza curso no activo (404)', async () => {
    const service = new CursosService();
    service.repository.getById = async () => null;

    await assert.rejects(
      () => service.update(99, bodyUpdate, 1),
      (err) => err.status === 404,
    );
  });

  it('remove rechaza curso no activo (404)', async () => {
    const service = new CursosService();
    service.repository.getById = async () => null;

    await assert.rejects(
      () => service.remove(99, 1),
      (err) => err.status === 404,
    );
  });

  it('remove devuelve 404 si delete no afecta filas (curso ya eliminado)', async () => {
    const service = new CursosService();
    service.repository.getById = async () => ({
      id_curso: 1,
      nombre: 'X',
      descripcion: 'Y',
      fecha_inicio: '2026-01-01',
      cantidad_horas: 1,
      inscriptos_max: 10,
      id_curso_estado: 1,
      estado: 'BORRADOR',
      inscriptos_actuales: 0,
    });
    service.repository.contarInscriptosActivos = async () => 0;
    service.repository.delete = async () => 0;

    await assert.rejects(
      () => service.remove(1, 1),
      (err) => err.status === 404,
    );
  });
});
