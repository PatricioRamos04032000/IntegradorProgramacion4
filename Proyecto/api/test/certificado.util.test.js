import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizarNombreArchivo,
  formatearFechaInscripcion,
  buildContentDisposition,
  assertElegibleParaCertificado,
  esElegibleParaCertificado,
  CURSO_ESTADO_INSCRIPCION_CERRADA,
} from '../utils/certificado.util.js';
import { CURSO_INSCRIPCION_NO_CERRADA_CERTIFICADO } from '../constants/apiMessages.js';

describe('sanitizarNombreArchivo', () => {
  it('normaliza acentos y caracteres especiales', () => {
    assert.equal(sanitizarNombreArchivo('García/López'), 'garcia-lopez');
  });

  it('retorna fallback cuando el texto queda vacío', () => {
    assert.equal(sanitizarNombreArchivo('///'), 'inscripcion');
    assert.equal(sanitizarNombreArchivo(null), 'inscripcion');
  });
});

describe('formatearFechaInscripcion', () => {
  it('formatea fechas válidas', () => {
    const fecha = formatearFechaInscripcion('2024-06-15T12:00:00.000Z');
    assert.match(fecha, /\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('lanza 422 para fechas inválidas', () => {
    assert.throws(
      () => formatearFechaInscripcion('fecha-invalida'),
      (err) => err.status === 422,
    );
  });
});

describe('buildContentDisposition', () => {
  it('genera attachment por defecto con apellido sanitizado', () => {
    assert.equal(
      buildContentDisposition(5, 'García'),
      'attachment; filename="certificado-inscripcion-5-garcia.pdf"',
    );
  });

  it('soporta inline', () => {
    assert.equal(
      buildContentDisposition(5, 'García', 'inline'),
      'inline; filename="certificado-inscripcion-5-garcia.pdf"',
    );
  });
});

describe('esElegibleParaCertificado', () => {
  const baseRow = {
    id_inscripcion_estado: 1,
    activo: 1,
    id_curso_estado: CURSO_ESTADO_INSCRIPCION_CERRADA,
    curso_estado_activo: 1,
    apellido: 'García',
    nombres: 'Ana',
    documento: '12345678',
    curso_nombre: 'Programación IV',
    fecha_hora_inscripcion: '2024-06-15T12:00:00.000Z',
  };

  it('retorna ok para inscripción elegible con curso cerrado', () => {
    assert.deepEqual(esElegibleParaCertificado(baseRow), { ok: true });
  });

  it('rechaza curso en inscripción abierta (2)', () => {
    const resultado = esElegibleParaCertificado({ ...baseRow, id_curso_estado: 2 });
    assert.equal(resultado.ok, false);
    assert.equal(resultado.status, 422);
    assert.equal(resultado.message, CURSO_INSCRIPCION_NO_CERRADA_CERTIFICADO);
  });

  it('rechaza curso en borrador (1)', () => {
    const resultado = esElegibleParaCertificado({ ...baseRow, id_curso_estado: 1 });
    assert.equal(resultado.ok, false);
    assert.equal(resultado.message, CURSO_INSCRIPCION_NO_CERRADA_CERTIFICADO);
  });
});

describe('assertElegibleParaCertificado', () => {
  const baseRow = {
    id_inscripcion_estado: 1,
    activo: 1,
    id_curso_estado: CURSO_ESTADO_INSCRIPCION_CERRADA,
    curso_estado_activo: 1,
    apellido: 'García',
    nombres: 'Ana',
    documento: '12345678',
    curso_nombre: 'Programación IV',
    fecha_hora_inscripcion: '2024-06-15T12:00:00.000Z',
  };

  it('no lanza para inscripción elegible', () => {
    assert.doesNotThrow(() => assertElegibleParaCertificado(baseRow));
  });

  it('lanza 404 si no hay fila', () => {
    assert.throws(
      () => assertElegibleParaCertificado(null),
      (err) => err.status === 404,
    );
  });

  it('lanza 422 si la inscripción está cancelada', () => {
    assert.throws(
      () => assertElegibleParaCertificado({ ...baseRow, id_inscripcion_estado: 2 }),
      (err) => err.status === 422 && err.message.includes('cancelada'),
    );
  });

  it('lanza 422 si el estudiante está inactivo', () => {
    assert.throws(
      () => assertElegibleParaCertificado({ ...baseRow, activo: 0 }),
      (err) => err.status === 422 && err.message.includes('inactivo'),
    );
  });

  it('lanza 422 si el curso está eliminado', () => {
    assert.throws(
      () => assertElegibleParaCertificado({ ...baseRow, curso_estado_activo: 0 }),
      (err) => err.status === 422 && err.message.includes('curso'),
    );
  });

  it('lanza 422 si el curso no está en inscripción cerrada', () => {
    assert.throws(
      () => assertElegibleParaCertificado({ ...baseRow, id_curso_estado: 2 }),
      (err) => err.status === 422 && err.message === CURSO_INSCRIPCION_NO_CERRADA_CERTIFICADO,
    );
  });

  it('lanza 422 si faltan datos obligatorios', () => {
    assert.throws(
      () => assertElegibleParaCertificado({ ...baseRow, documento: '' }),
      (err) => err.status === 422 && err.message.includes('incompletos'),
    );
  });
});
