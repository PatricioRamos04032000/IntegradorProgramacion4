const cursoModel = require('../models/cursoModel');

function getUsuarioActual() {
  return Number(process.env.DEFAULT_USER_ID) || 1;
}

function validarDatosCurso(body) {
  const errores = [];
  const nombre = (body.nombre || '').trim();
  const descripcion = (body.descripcion || '').trim();
  const fecha_inicio = (body.fecha_inicio || '').trim();
  const cantidad_horas = Number(body.cantidad_horas);
  const inscriptos_max = Number(body.inscriptos_max);
  const id_curso_estado = Number(body.id_curso_estado);

  if (!nombre) errores.push('El nombre es obligatorio.');
  if (nombre.length > 45) errores.push('El nombre no puede superar 45 caracteres.');
  if (!descripcion) errores.push('La descripción es obligatoria.');
  if (!fecha_inicio) errores.push('La fecha de inicio es obligatoria.');
  if (!Number.isInteger(cantidad_horas) || cantidad_horas < 0) {
    errores.push('La cantidad de horas debe ser un entero mayor o igual a 0.');
  }
  if (!Number.isInteger(inscriptos_max) || inscriptos_max < 0) {
    errores.push('El cupo máximo debe ser un entero mayor o igual a 0.');
  }
  if (!Number.isInteger(id_curso_estado) || id_curso_estado <= 0) {
    errores.push('Debe seleccionarse un estado válido.');
  }

  const datos = {
    nombre,
    descripcion,
    fecha_inicio,
    cantidad_horas,
    inscriptos_max,
    id_curso_estado,
  };

  return { errores, datos };
}

async function browse(req, res, next) {
  try {
    const q = req.query.q || '';
    const idEstado = req.query.estado || '';
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const [resultado, estados] = await Promise.all([
      cursoModel.listar({ q, idEstado, page, pageSize }),
      cursoModel.listarEstadosActivos(),
    ]);

    res.render('cursos/index', {
      title: 'Cursos',
      resultado,
      estados,
      filtros: { q, estado: idEstado, pageSize },
    });
  } catch (err) {
    next(err);
  }
}

async function read(req, res, next) {
  try {
    const curso = await cursoModel.obtener(req.params.id);
    if (!curso) {
      return res.status(404).render('error', {
        message: 'Curso no encontrado',
        error: { status: 404 },
      });
    }
    res.render('cursos/show', { title: `Curso: ${curso.nombre}`, curso });
  } catch (err) {
    next(err);
  }
}

async function addForm(req, res, next) {
  try {
    const estados = await cursoModel.listarEstadosActivos();
    res.render('cursos/form', {
      title: 'Nuevo curso',
      modo: 'crear',
      curso: {
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        cantidad_horas: '',
        inscriptos_max: '',
        id_curso_estado: '',
      },
      estados,
      errores: [],
    });
  } catch (err) {
    next(err);
  }
}

async function add(req, res, next) {
  try {
    const { errores, datos } = validarDatosCurso(req.body);
    if (errores.length > 0) {
      const estados = await cursoModel.listarEstadosActivos();
      return res.status(400).render('cursos/form', {
        title: 'Nuevo curso',
        modo: 'crear',
        curso: datos,
        estados,
        errores,
      });
    }

    const nuevoId = await cursoModel.crear(datos, getUsuarioActual());
    res.redirect(`/cursos/${nuevoId}`);
  } catch (err) {
    next(err);
  }
}

async function editForm(req, res, next) {
  try {
    const [curso, estados] = await Promise.all([
      cursoModel.obtener(req.params.id),
      cursoModel.listarEstadosActivos(),
    ]);

    if (!curso) {
      return res.status(404).render('error', {
        message: 'Curso no encontrado',
        error: { status: 404 },
      });
    }

    res.render('cursos/form', {
      title: `Editar curso: ${curso.nombre}`,
      modo: 'editar',
      curso: {
        ...curso,
        fecha_inicio: curso.fecha_inicio
          ? new Date(curso.fecha_inicio).toISOString().slice(0, 10)
          : '',
      },
      estados,
      errores: [],
    });
  } catch (err) {
    next(err);
  }
}

async function edit(req, res, next) {
  try {
    const id = req.params.id;
    const { errores, datos } = validarDatosCurso(req.body);

    if (errores.length > 0) {
      const estados = await cursoModel.listarEstadosActivos();
      return res.status(400).render('cursos/form', {
        title: 'Editar curso',
        modo: 'editar',
        curso: { ...datos, id_curso: id },
        estados,
        errores,
      });
    }

    const filas = await cursoModel.actualizar(id, datos, getUsuarioActual());
    if (filas === 0) {
      return res.status(404).render('error', {
        message: 'Curso no encontrado',
        error: { status: 404 },
      });
    }

    res.redirect(`/cursos/${id}`);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const filas = await cursoModel.eliminar(req.params.id, getUsuarioActual());
    if (filas === 0) {
      return res.status(404).render('error', {
        message: 'Curso no encontrado',
        error: { status: 404 },
      });
    }
    res.redirect('/cursos');
  } catch (err) {
    next(err);
  }
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
