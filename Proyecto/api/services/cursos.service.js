import CursosRepository from '../repositories/cursos.repository.js';
import InscripcionRepository from '../repositories/inscripcion.repository.js';
import CursoResponseDTO from '../dtos/curso.response.dto.js';
import CursoEstadoResponseDTO from '../dtos/cursoEstado.response.dto.js';
import InscripcionCursoResponseDTO from '../dtos/inscripcionCurso.response.dto.js';
import BaseService from './base.service.js';
import createError from 'http-errors';
import {
  CURSO_ESTADO_INVALIDO,
  CURSO_NO_ENCONTRADO,
  cursoCupoReducido,
  cursoTieneInscriptosActivos,
} from '../constants/apiMessages.js';

export default class CursosService extends BaseService {
  static KEYS_MAP = {
    idCurso: 'id_curso',
    nombre: 'nombre',
    descripcion: 'descripcion',
    fechaInicio: 'fecha_inicio',
    cantidadHoras: 'cantidad_horas',
    inscriptosMax: 'inscriptos_max',
    idCursoEstado: 'id_curso_estado',
    estado: 'estado',
    idUsuarioModificacion: 'id_usuario_modificacion',
  };

  constructor() {
    super();
    this.repository = new CursosRepository();
    this.inscripcionRepository = new InscripcionRepository();
  }

  async getAll(filter, limit, offset, order) {
    const sqlFilter = this.mapKeysToColumns(filter, CursosService.KEYS_MAP);
    const sqlOrder = this.mapKeysToColumns(order, CursosService.KEYS_MAP);

    const { rows, total } = await this.repository.getAll(sqlFilter, limit, offset, sqlOrder);
    const items = rows.map((curso) => new CursoResponseDTO(curso));
    return { items, total, limit, offset };
  }

  async getById(id) {
    const curso = await this.repository.getById(id);
    if (!curso) {
      throw createError(404, CURSO_NO_ENCONTRADO);
    }
    return new CursoResponseDTO(curso);
  }

  async getInscriptos(id) {
    const curso = await this.repository.getById(id);
    if (!curso) {
      throw createError(404, CURSO_NO_ENCONTRADO);
    }
    const rows = await this.inscripcionRepository.getActivasByCurso(id);
    return rows.map((row) => new InscripcionCursoResponseDTO(row));
  }

  async getEstados() {
    const estados = await this.repository.getEstadosActivos();
    return estados.map((e) => new CursoEstadoResponseDTO(e));
  }

  async assertEstadoValido(idCursoEstado) {
    const existe = await this.repository.existeEstadoActivo(idCursoEstado);
    if (!existe) {
      throw createError(422, CURSO_ESTADO_INVALIDO);
    }
  }

  async create(data, idUsuario) {
    await this.assertEstadoValido(data.idCursoEstado);

    const dbData = {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      fecha_inicio: data.fechaInicio,
      cantidad_horas: data.cantidadHoras,
      inscriptos_max: data.inscriptosMax,
      id_curso_estado: data.idCursoEstado,
    };
    const nuevoId = await this.repository.create(dbData, idUsuario);
    return this.getById(nuevoId);
  }

  async update(id, data, idUsuario) {
    await this.getById(id);
    await this.assertEstadoValido(data.idCursoEstado);

    const inscriptosActuales = await this.repository.contarInscriptosActivos(id);
    if (data.inscriptosMax < inscriptosActuales) {
      throw createError(409, cursoCupoReducido(inscriptosActuales));
    }

    const dbData = {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      fecha_inicio: data.fechaInicio,
      cantidad_horas: data.cantidadHoras,
      inscriptos_max: data.inscriptosMax,
      id_curso_estado: data.idCursoEstado,
    };
    const rowCount = await this.repository.update(id, dbData, idUsuario);
    if (rowCount === 0) {
      throw createError(404, CURSO_NO_ENCONTRADO);
    }
    return this.getById(id);
  }

  async remove(id, idUsuario) {
    await this.getById(id);

    const inscriptosActuales = await this.repository.contarInscriptosActivos(id);
    if (inscriptosActuales > 0) {
      throw createError(409, cursoTieneInscriptosActivos(inscriptosActuales));
    }

    const rowCount = await this.repository.delete(id, idUsuario);
    if (rowCount === 0) {
      throw createError(404, CURSO_NO_ENCONTRADO);
    }
    return rowCount;
  }
}
