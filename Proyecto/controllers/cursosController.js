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

  res.render('cursos/index', {
    title: 'Cursos',
    resultado,
    estados,
    filtros,
  });
}

async function read(req, res) {
  const curso = await cursoService.obtenerCurso(req.params.id);
  res.render('cursos/show', { title: `Curso: ${curso.nombre}`, curso });
}

async function addForm(req, res) {
  const estados = await cursoService.obtenerEstadosActivos();
  res.render('cursos/form', {
    title: 'Nuevo curso',
    modo: 'crear',
    curso: cursoService.getCursoVacio(),
    estados,
    errores: [],
  });
}

async function add(req, res) {
  const { errores, datos, nuevoId } = await cursoService.crearCurso(req.body);
  if (errores.length > 0) {
    const estados = await cursoService.obtenerEstadosActivos();
    return res.status(400).render('cursos/form', {
      title: 'Nuevo curso',
      modo: 'crear',
      curso: datos,
      estados,
      errores,
    });
  }

  res.redirect(`/cursos/${nuevoId}`);
}

async function editForm(req, res) {
  const [curso, estados] = await Promise.all([
    cursoService.obtenerCurso(req.params.id),
    cursoService.obtenerEstadosActivos(),
  ]);

  res.render('cursos/form', {
    title: `Editar curso: ${curso.nombre}`,
    modo: 'editar',
    curso: cursoService.normalizarCursoParaForm(curso),
    estados,
    errores: [],
  });
}

async function edit(req, res) {
  const id = req.params.id;
  const { errores, datos } = await cursoService.actualizarCurso(id, req.body);

  if (errores.length > 0) {
    const estados = await cursoService.obtenerEstadosActivos();
    return res.status(400).render('cursos/form', {
      title: 'Editar curso',
      modo: 'editar',
      curso: { ...datos, id_curso: id },
      estados,
      errores,
    });
  }

  res.redirect(`/cursos/${id}`);
}

async function remove(req, res) {
  await cursoService.eliminarCurso(req.params.id);
  res.redirect('/cursos');
}

module.exports = {
  browse,
  read,
  addForm,
  add,
  editForm,
  edit,
  remove,
};
