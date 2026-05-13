const inscripcionService = require('../services/inscripcionService');
const certificadoInscripcionPdfService = require('../services/certificadoInscripcionPdfService');

const inscripcionesController = {
  browse: async (req, res, next) => {
    try {
      const searchQuery = req.query.q || '';
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;

      const items = await inscripcionService.listarPaginado(searchQuery, page, pageSize);

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
      const row = await inscripcionService.crear(req.body, req.user.id_usuario);
      const inscripcion = await inscripcionService.obtenerPorId(row.id_inscripcion);
      res.status(201).json(inscripcion);
    } catch (error) {
      const msg = error.message || '';
      if (
        /El estudiante ya|Curso no encontrado|no está habilitado|cupo máximo/i.test(msg)
      ) {
        return res.status(400).json({ error: msg });
      }
      next(error);
    }
  },

  showDetail: async (req, res, next) => {
    try {
      const inscripcion = await inscripcionService.obtenerPorId(req.params.id);
      if (!inscripcion) {
        return res.status(404).json({ error: 'Inscripción no encontrada.' });
      }
      res.json(inscripcion);
    } catch (error) {
      next(error);
    }
  },

  certificadoPdf: async (req, res, next) => {
    try {
      const inscripcion = await inscripcionService.obtenerPorId(req.params.id);
      if (!inscripcion) {
        return res.status(404).json({ error: 'Inscripción no encontrada.' });
      }
      const id = inscripcion.id_inscripcion || req.params.id;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="certificado-inscripcion-${id}.pdf"`,
      );
      certificadoInscripcionPdfService.pipeCertificadoInscripcionPdf(inscripcion, res);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const existente = await inscripcionService.obtenerPorId(req.params.id);
      if (!existente) {
        return res.status(404).json({ error: 'Inscripción no encontrada.' });
      }
      await inscripcionService.eliminar(req.params.id, req.user.id_usuario);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

module.exports = inscripcionesController;
