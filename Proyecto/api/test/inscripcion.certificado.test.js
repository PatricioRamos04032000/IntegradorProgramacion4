import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import InscripcionService from '../services/inscripcion.service.js';
import { assertElegibleParaCertificado } from '../utils/certificado.util.js';
import { CURSO_INSCRIPCION_NO_CERRADA_CERTIFICADO } from '../constants/apiMessages.js';

describe('InscripcionService.obtenerInscripcionParaCertificado', () => {
  const baseRow = {
    id_inscripcion: 1,
    id_inscripcion_estado: 1,
    activo: 1,
    id_curso_estado: 3,
    curso_estado_activo: 1,
    apellido: 'García',
    nombres: 'Ana',
    documento: '12345678',
    curso_nombre: 'Programación IV',
    fecha_hora_inscripcion: '2024-06-15T12:00:00.000Z',
  };

  it('delega la elegibilidad al util y retorna la fila', async () => {
    const service = new InscripcionService();
    service.repository.getByIdParaCertificado = async () => baseRow;

    const row = await service.obtenerInscripcionParaCertificado(1);
    assert.deepEqual(row, baseRow);
  });

  it('propaga errores de elegibilidad desde el repository', async () => {
    const service = new InscripcionService();
    service.repository.getByIdParaCertificado = async () => null;

    await assert.rejects(
      () => service.obtenerInscripcionParaCertificado(999),
      (err) => err.status === 404,
    );
  });
});

describe('assertElegibleParaCertificado reglas de curso', () => {
  const baseRow = {
    id_inscripcion_estado: 1,
    activo: 1,
    id_curso_estado: 3,
    curso_estado_activo: 1,
    apellido: 'García',
    nombres: 'Ana',
    documento: '12345678',
    curso_nombre: 'Programación IV',
    fecha_hora_inscripcion: '2024-06-15T12:00:00.000Z',
  };

  it('acepta curso en inscripción cerrada (3)', () => {
    assert.doesNotThrow(() => assertElegibleParaCertificado(baseRow));
  });

  it('rechaza curso en inscripción abierta (2)', () => {
    assert.throws(
      () => assertElegibleParaCertificado({ ...baseRow, id_curso_estado: 2 }),
      (err) => err.status === 422 && err.message === CURSO_INSCRIPCION_NO_CERRADA_CERTIFICADO,
    );
  });

  it('rechaza curso en borrador (1)', () => {
    assert.throws(
      () => assertElegibleParaCertificado({ ...baseRow, id_curso_estado: 1 }),
      (err) => err.status === 422 && err.message === CURSO_INSCRIPCION_NO_CERRADA_CERTIFICADO,
    );
  });

  it('rechaza curso eliminado (es_activo = 0)', () => {
    assert.throws(
      () => assertElegibleParaCertificado({ ...baseRow, curso_estado_activo: 0 }),
      (err) => err.status === 422,
    );
  });
});
