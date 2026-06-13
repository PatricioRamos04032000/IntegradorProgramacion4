import InscripcionService from '../services/inscripcion.service.js';
import { pipeCertificadoInscripcionPdf } from '../services/certificadoInscripcionPdf.service.js';

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
    const inscripcion = await this.service.getRawById(req.params.id);
    const id = inscripcion.id_inscripcion || req.params.id;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificado-inscripcion-${id}.pdf"`,
    );
    pipeCertificadoInscripcionPdf(inscripcion, res);
  };

  remove = async (req, res) => {
    await this.service.remove(req.params.id, req.user.id_usuario);
    res.status(204).send();
  };
}
