const cursoService = require('../services/cursoService');

async function browse(req, res) {
  const q = req.query.q || '';
  const idEstado = req.query.estado || '';
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;

  const { resultado, estados, filtros } = await cursoService.obtenerListado({
    q,
    idEstado,
    page,
    pageSize,
  });

  res.json({
    items: resultado.items,
    page: resultado.page,
    pageSize: resultado.pageSize,
    total: resultado.total,
    totalPages: resultado.totalPages,
    estados,
    filtros: { ...filtros, page: resultado.page },
  });
}

async function read(req, res) {
  const id = req.params.id;
  const [curso, estados] = await Promise.all([
    cursoService.obtenerCurso(id),
    cursoService.obtenerEstadosActivos(),
  ]);
  res.json({
    curso: cursoService.normalizarCursoParaForm(curso),
    estados,
  });
}

async function add(req, res) {
  const { errores, datos, nuevoId } = await cursoService.crearCurso(req.body, req.user.id_usuario);
  if (errores.length > 0) {
    return res.status(400).json({ errores, datos });
  }
  const curso = await cursoService.obtenerCurso(nuevoId);
  res.status(201).json({ id_curso: nuevoId, curso });
}

async function edit(req, res) {
  const id = req.params.id;
  const { errores, datos } = await cursoService.actualizarCurso(id, req.body, req.user.id_usuario);

  if (errores.length > 0) {
    return res.status(400).json({ errores, datos: { ...datos, id_curso: id } });
  }

  const curso = await cursoService.obtenerCurso(id);
  res.json({ curso });
}

async function remove(req, res) {
  await cursoService.eliminarCurso(req.params.id, req.user.id_usuario);
  res.status(204).send();
}

module.exports = {
  browse,
  read,
  add,
  edit,
  remove,
};
