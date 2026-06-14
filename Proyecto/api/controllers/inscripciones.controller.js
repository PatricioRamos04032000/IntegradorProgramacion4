import InscripcionService from '../services/inscripcion.service.js';

export default class InscripcionesController {
  constructor() {
    this.service = new InscripcionService();
  }

  browse = async (req, res) => {
    const { filter, limit, offset } = req;
    const resultado = await this.service.getAll(filter, limit, offset);
    res.json(resultado);
  };

  read = async (req, res) => {
    const inscripcion = await this.service.getById(req.params.id);
    res.json(inscripcion);
  };

  add = async (req, res) => {
    const inscripcion = await this.service.create(req.body, req.user.id_usuario);
    res.status(201).json(inscripcion);
  };

  certificadoPdf = async (req, res) => {
    await this.service.generarCertificadoPdf(req.params.id, res, {
      disposition: req.query.disposition,
    });
  };

  remove = async (req, res) => {
    await this.service.remove(req.params.id, req.user.id_usuario);
    res.status(204).send();
  };
}
