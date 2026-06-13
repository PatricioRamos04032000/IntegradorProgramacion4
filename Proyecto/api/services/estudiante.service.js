import EstudianteRepository from '../repositories/estudiante.repository.js';
import EstudianteResponseDTO from '../dtos/estudiante.response.dto.js';
import BaseService from './base.service.js';
import createError from 'http-errors';

export default class EstudianteService extends BaseService {
  static KEYS_MAP = {
    idEstudiante: 'id_estudiante',
    documento: 'documento',
    apellido: 'apellido',
    nombres: 'nombres',
    email: 'email',
    fechaNacimiento: 'fecha_nacimiento',
  };

  constructor() {
    super();
    this.repository = new EstudianteRepository();
  }

  async getAll(filter, limit, offset, order) {
    const sqlOrder = this.mapKeysToColumns(order, EstudianteService.KEYS_MAP);
    const { rows, total } = await this.repository.getAll(filter, limit, offset, sqlOrder);
    const items = rows.map((row) => new EstudianteResponseDTO(row));
    return { items, total, limit, offset };
  }

  async getById(id) {
    const estudiante = await this.repository.getById(id);
    if (!estudiante) {
      throw createError(404, 'Estudiante no encontrado o inactivo.');
    }
    return new EstudianteResponseDTO(estudiante);
  }

  async create(data, idUsuario) {
    const dbData = {
      documento: data.documento.trim(),
      apellido: data.apellido.trim(),
      nombres: data.nombres.trim(),
      email: data.email.trim(),
      fecha_nacimiento: data.fechaNacimiento,
    };
    const nuevoId = await this.repository.create(dbData, idUsuario);
    return this.getById(nuevoId);
  }

  async update(id, data, idUsuario) {
    const dbData = {
      documento: data.documento.trim(),
      apellido: data.apellido.trim(),
      nombres: data.nombres.trim(),
      email: data.email.trim(),
      fecha_nacimiento: data.fechaNacimiento,
    };
    const rowCount = await this.repository.update(id, dbData, idUsuario);
    if (rowCount === 0) {
      throw createError(404, 'Estudiante no encontrado.');
    }
    return this.getById(id);
  }

  async remove(id, idUsuario) {
    const rowCount = await this.repository.delete(id, idUsuario);
    if (rowCount === 0) {
      throw createError(404, 'Estudiante no encontrado.');
    }
    return rowCount;
  }
}
