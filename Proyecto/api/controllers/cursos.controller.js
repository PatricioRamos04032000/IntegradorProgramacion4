import CursosService from '../services/cursos.service.js';

export default class CursosController {
  constructor() {
    this.service = new CursosService();
  }

  browse = async (req, res) => {
    const { filter, limit, offset, order } = req;
    const resultado = await this.service.getAll(filter, limit, offset, order);
    res.json(resultado);
  };

  read = async (req, res) => {
    const curso = await this.service.getById(req.params.id);
    res.json(curso);
  };

  getInscriptos = async (req, res) => {
    const inscriptos = await this.service.getInscriptos(req.params.id);
    res.json(inscriptos);
  };

  getEstados = async (req, res) => {
    const estados = await this.service.getEstados();
    res.json(estados);
  };

  add = async (req, res) => {
    const curso = await this.service.create(req.body, req.user.id_usuario);
    res.status(201).json(curso);
  };

  edit = async (req, res) => {
    const curso = await this.service.update(req.params.id, req.body, req.user.id_usuario);
    res.json(curso);
  };

  remove = async (req, res) => {
    await this.service.remove(req.params.id, req.user.id_usuario);
    res.status(204).send();
  };
}
