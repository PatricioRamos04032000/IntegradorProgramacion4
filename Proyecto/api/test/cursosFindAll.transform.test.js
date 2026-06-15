import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import cursosFindAllTransform from '../transforms/cursosFindAll.transform.js';

function runTransform(query) {
  const req = { query };
  cursosFindAllTransform(req, {}, () => {});
  return req.order;
}

describe('cursosFindAllTransform — order', () => {
  it('sin order usa solo idCurso ASC', () => {
    assert.deepEqual(runTransform({}), { idCurso: 'ASC' });
  });

  it('con order=nombre usa solo ese criterio', () => {
    assert.deepEqual(runTransform({ order: 'nombre', asc: 'false' }), { nombre: 'DESC' });
  });

  it('con order=nombre y asc=true ordena ASC', () => {
    assert.deepEqual(runTransform({ order: 'nombre', asc: 'true' }), { nombre: 'ASC' });
  });
});
