import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import estudiantesFindAllTransform from '../transforms/estudiantesFindAll.transform.js';

function runTransform(query) {
  const req = { query };
  estudiantesFindAllTransform(req, {}, () => {});
  return req.order;
}

describe('estudiantesFindAllTransform — order', () => {
  it('sin order usa solo idEstudiante ASC', () => {
    assert.deepEqual(runTransform({}), { idEstudiante: 'ASC' });
  });

  it('con order=apellido usa solo ese criterio', () => {
    assert.deepEqual(runTransform({ order: 'apellido', asc: 'false' }), { apellido: 'DESC' });
  });

  it('con order=apellido y asc=true ordena ASC', () => {
    assert.deepEqual(runTransform({ order: 'apellido', asc: 'true' }), { apellido: 'ASC' });
  });
});
