import EstudianteRepository from '../repositories/estudiante.repository.js';
import InscripcionRepository from '../repositories/inscripcion.repository.js';
import EstudianteResponseDTO from '../dtos/estudiante.response.dto.js';
import BaseService from './base.service.js';
import createError from 'http-errors';
import {
  ESTUDIANTE_NO_ENCONTRADO,
  ESTUDIANTE_NO_ENCONTRADO_O_INACTIVO,
  ESTUDIANTE_DOCUMENTO_DUPLICADO,
  estudianteTieneInscripcionesActivas,
} from '../constants/apiMessages.js';

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
    this.inscripcionRepository = new InscripcionRepository();
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
      throw createError(404, ESTUDIANTE_NO_ENCONTRADO_O_INACTIVO);
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
    try {
      const nuevoId = await this.repository.create(dbData, idUsuario);
      return this.getById(nuevoId);
    } catch (error) {
      if (error?.code === '23505') {
        throw createError(409, ESTUDIANTE_DOCUMENTO_DUPLICADO);
      }
      throw error;
    }
  }

  async update(id, data, idUsuario) {
    await this.getById(id);
    const dbData = {
      documento: data.documento.trim(),
      apellido: data.apellido.trim(),
      nombres: data.nombres.trim(),
      email: data.email.trim(),
      fecha_nacimiento: data.fechaNacimiento,
    };
    try {
      const rowCount = await this.repository.update(id, dbData, idUsuario);
      if (rowCount === 0) {
        throw createError(404, ESTUDIANTE_NO_ENCONTRADO);
      }
      return this.getById(id);
    } catch (error) {
      if (error?.code === '23505') {
        throw createError(409, ESTUDIANTE_DOCUMENTO_DUPLICADO);
      }
      throw error;
    }
  }

  async remove(id, idUsuario) {
    await this.getById(id);
    const inscripcionesActivas = await this.inscripcionRepository.contarActivasPorEstudiante(id);
    if (inscripcionesActivas > 0) {
      throw createError(409, estudianteTieneInscripcionesActivas(inscripcionesActivas));
    }

    const rowCount = await this.repository.delete(id, idUsuario);
    if (rowCount === 0) {
      throw createError(404, ESTUDIANTE_NO_ENCONTRADO);
    }
    return rowCount;
  }
}
