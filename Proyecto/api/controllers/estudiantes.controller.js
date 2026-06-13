import EstudianteService from '../services/estudiante.service.js';

export default class EstudiantesController {
  constructor() {
    this.service = new EstudianteService();
  }

  browse = async (req, res) => {
    const { filter, limit, offset, order } = req;
    const resultado = await this.service.getAll(filter, limit, offset, order);
    res.json(resultado);
  };

  read = async (req, res) => {
    const estudiante = await this.service.getById(req.params.id);
    res.json(estudiante);
  };

  add = async (req, res) => {
    const estudiante = await this.service.create(req.body, req.user.id_usuario);
    res.status(201).json(estudiante);
  };

  edit = async (req, res) => {
    const estudiante = await this.service.update(req.params.id, req.body, req.user.id_usuario);
    res.json(estudiante);
  };

  remove = async (req, res) => {
    await this.service.remove(req.params.id, req.user.id_usuario);
    res.status(204).send();
  };
}
