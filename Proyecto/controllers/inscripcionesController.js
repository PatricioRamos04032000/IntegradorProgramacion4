const inscripcionService = require('../services/inscripcionService');

const inscripcionesController = {
  browse: async (req, res, next) => {
    try {
      const searchQuery = req.query.q || '';
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;

      const inscripciones = await inscripcionService.listarPaginado(searchQuery, page, pageSize);

      res.render('inscripciones/browse', {
        title: 'Listado de Inscripciones',
        inscripciones,
        searchQuery,
        page,
        pageSize,
      });
    } catch (error) {
      next(error);
    }
  },

  showAddForm: async (req, res, next) => {
    try {
      const { cursos, estudiantes } = await inscripcionService.obtenerDatosFormularioAlta();

      res.render('inscripciones/add', {
        title: 'Nueva Inscripción',
        cursos,
        estudiantes,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      await inscripcionService.crear(req.body);
      res.redirect('/inscripciones');
    } catch (error) {
      try {
        const { cursos, estudiantes } = await inscripcionService.obtenerDatosFormularioAlta();
        res.render('inscripciones/add', {
          title: 'Nueva Inscripción',
          cursos,
          estudiantes,
          error: error.message,
        });
      } catch (innerError) {
        next(innerError);
      }
    }
  },

  showDetail: async (req, res, next) => {
    try {
      const inscripcion = await inscripcionService.obtenerPorId(req.params.id);
      if (!inscripcion) {
        return res.status(404).render('error', { message: 'Inscripción no encontrada.' });
      }
      res.render('inscripciones/read', { title: 'Detalle de Inscripción', inscripcion });
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await inscripcionService.eliminar(req.params.id);
      res.redirect('/inscripciones');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = inscripcionesController;
