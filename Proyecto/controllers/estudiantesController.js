const estudianteService = require('../services/estudianteService');

const estudiantesController = {
  browse: async (req, res, next) => {
    try {
      const searchQuery = req.query.q || '';
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;

      const estudiantes = await estudianteService.listarPaginado(searchQuery, page, pageSize);

      res.render('estudiantes/browse', {
        title: 'Listado de Estudiantes',
        estudiantes,
        searchQuery,
        page,
        pageSize,
      });
    } catch (error) {
      next(error);
    }
  },

  showAddForm: (req, res) => {
    res.render('estudiantes/add', { title: 'Nuevo Estudiante' });
  },

  create: async (req, res, next) => {
    try {
      await estudianteService.crear(req.body);
      res.redirect('/estudiantes');
    } catch (error) {
      next(error);
    }
  },

  showDetail: async (req, res, next) => {
    try {
      const estudiante = await estudianteService.obtenerPorId(req.params.id);
      if (!estudiante) {
        return res.status(404).render('error', { message: 'Estudiante no encontrado o inactivo.' });
      }
      res.render('estudiantes/read', { title: 'Detalle del Estudiante', estudiante });
    } catch (error) {
      next(error);
    }
  },

  showEditForm: async (req, res, next) => {
    try {
      const estudiante = await estudianteService.obtenerPorId(req.params.id);
      if (!estudiante) {
        return res.status(404).render('error', { message: 'Estudiante no encontrado.' });
      }
      res.render('estudiantes/edit', { title: 'Editar Estudiante', estudiante });
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      await estudianteService.actualizar(req.params.id, req.body);
      res.redirect('/estudiantes');
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      await estudianteService.eliminar(req.params.id);
      res.redirect('/estudiantes');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = estudiantesController;
