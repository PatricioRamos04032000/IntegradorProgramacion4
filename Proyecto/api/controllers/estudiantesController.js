const estudianteService = require('../services/estudianteService');

function formatFechaNacimiento(row) {
  if (!row || !row.fecha_nacimiento) return row;
  const v = row.fecha_nacimiento;
  if (typeof v === 'string') return row;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return row;
  return { ...row, fecha_nacimiento: d.toISOString().slice(0, 10) };
}

const estudiantesController = {
  browse: async (req, res, next) => {
    try {
      const searchQuery = req.query.q || '';
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;

      const items = await estudianteService.listarPaginado(searchQuery, page, pageSize);

      res.json({
        items,
        page,
        pageSize,
        q: searchQuery,
        hasNext: items.length === pageSize,
      });
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const row = await estudianteService.crear(req.body, req.user.id_usuario);
      const estudiante = await estudianteService.obtenerPorId(row.id_estudiante);
      res.status(201).json(formatFechaNacimiento(estudiante));
    } catch (error) {
      next(error);
    }
  },

  showDetail: async (req, res, next) => {
    try {
      const estudiante = await estudianteService.obtenerPorId(req.params.id);
      if (!estudiante) {
        return res.status(404).json({ error: 'Estudiante no encontrado o inactivo.' });
      }
      res.json(formatFechaNacimiento(estudiante));
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const existente = await estudianteService.obtenerPorId(req.params.id);
      if (!existente) {
        return res.status(404).json({ error: 'Estudiante no encontrado.' });
      }
      await estudianteService.actualizar(req.params.id, req.body, req.user.id_usuario);
      const estudiante = await estudianteService.obtenerPorId(req.params.id);
      res.json(formatFechaNacimiento(estudiante));
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const existente = await estudianteService.obtenerPorId(req.params.id);
      if (!existente) {
        return res.status(404).json({ error: 'Estudiante no encontrado.' });
      }
      await estudianteService.eliminar(req.params.id, req.user.id_usuario);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = estudiantesController;
