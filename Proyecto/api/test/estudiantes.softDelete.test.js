import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import EstudianteService from '../services/estudiante.service.js';

const bodyUpdate = {
  documento: '12345678',
  apellido: 'Test',
  nombres: 'Nombre',
  email: 'test@example.com',
  fechaNacimiento: '2000-01-01',
};

describe('EstudianteService — estudiante eliminado o inexistente', () => {
  it('update rechaza estudiante no activo (404)', async () => {
    const service = new EstudianteService();
    service.repository.getById = async () => null;

    await assert.rejects(
      () => service.update(99, bodyUpdate, 1),
      (err) => err.status === 404,
    );
  });

  it('remove rechaza estudiante no activo (404)', async () => {
    const service = new EstudianteService();
    service.repository.getById = async () => null;

    await assert.rejects(
      () => service.remove(99, 1),
      (err) => err.status === 404,
    );
  });

  it('remove devuelve 404 si delete no afecta filas (estudiante ya eliminado)', async () => {
    const service = new EstudianteService();
    service.repository.getById = async () => ({
      id_estudiante: 1,
      documento: '12345678',
      apellido: 'Test',
      nombres: 'Nombre',
      email: 'test@example.com',
      fecha_nacimiento: '2000-01-01',
      id_usuario_modificacion: 1,
      fecha_hora_modificacion: '2026-01-01T00:00:00.000Z',
    });
    service.inscripcionRepository.contarActivasPorEstudiante = async () => 0;
    service.repository.delete = async () => 0;

    await assert.rejects(
      () => service.remove(1, 1),
      (err) => err.status === 404,
    );
  });
});
