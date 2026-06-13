import pool from '../db/pool.js';
import InscripcionRepository from '../repositories/inscripcion.repository.js';
import InscripcionResponseDTO from '../dtos/inscripcion.response.dto.js';
import createError from 'http-errors';

export default class InscripcionService {
  constructor() {
    this.repository = new InscripcionRepository();
  }

  async getAll(filter, limit, offset) {
    const { rows, total } = await this.repository.getAll(filter, limit, offset);
    const items = rows.map((row) => new InscripcionResponseDTO(row));
    return { items, total, limit, offset };
  }

  async getById(id) {
    const row = await this.repository.getById(id);
    if (!row) {
      throw createError(404, 'Inscripción no encontrada.');
    }
    return new InscripcionResponseDTO(row);
  }

  async create(data, idUsuario) {
    const idCurso = Number(data.idCurso);
    const idEstudiante = Number(data.idEstudiante);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const duplicada = await this.repository.existeActivaPorCursoYEstudiante(
        client,
        idCurso,
        idEstudiante,
      );
      if (duplicada) {
        throw createError(400, 'El estudiante ya se encuentra inscripto en este curso.');
      }

      const cursoRow = await this.repository.obtenerCursoParaCupo(client, idCurso);
      if (!cursoRow) {
        throw createError(400, 'Curso no encontrado.');
      }
      if (cursoRow.id_curso_estado !== 1) {
        throw createError(400, 'El curso no está habilitado para inscripciones.');
      }
      if (cursoRow.inscriptos_actuales >= cursoRow.inscriptos_max) {
        throw createError(400, 'El curso ha alcanzado el cupo máximo de inscriptos.');
      }

      const nuevoId = await this.repository.insertarActiva(
        client,
        idCurso,
        idEstudiante,
        idUsuario,
      );
      await client.query('COMMIT');
      return this.getById(nuevoId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async remove(id, idUsuario) {
    const existente = await this.repository.getById(id);
    if (!existente) {
      throw createError(404, 'Inscripción no encontrada.');
    }
    await this.repository.marcarCancelada(id, idUsuario);
    return true;
  }

  /** Para PDF: devuelve fila cruda con campos snake_case usados por el generador. */
  async getRawById(id) {
    const row = await this.repository.getById(id);
    if (!row) {
      throw createError(404, 'Inscripción no encontrada.');
    }
    return row;
  }
}
