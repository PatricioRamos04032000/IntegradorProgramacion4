import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PassThrough } from 'node:stream';
import { pipeCertificadoInscripcionPdf } from '../services/certificadoInscripcionPdf.service.js';

describe('pipeCertificadoInscripcionPdf', () => {
  it('genera un PDF válido en el stream de salida', async () => {
    const inscripcion = {
      apellido: 'García',
      nombres: 'Ana',
      documento: '12345678',
      curso_nombre: 'Programación IV',
      fecha_hora_inscripcion: '2024-06-15T12:00:00.000Z',
    };

    const stream = new PassThrough();
    const chunks = [];

    stream.on('data', (chunk) => chunks.push(chunk));

    const done = pipeCertificadoInscripcionPdf(inscripcion, stream);
    await done;

    const pdf = Buffer.concat(chunks);
    assert.ok(pdf.length > 0);
    assert.equal(pdf.subarray(0, 4).toString(), '%PDF');
  });
});
