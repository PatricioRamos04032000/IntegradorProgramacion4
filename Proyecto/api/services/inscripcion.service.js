import pool from '../db/pool.js';
import InscripcionRepository from '../repositories/inscripcion.repository.js';
import InscripcionResponseDTO from '../dtos/inscripcion.response.dto.js';
import { pipeCertificadoInscripcionPdf } from './certificadoInscripcionPdf.service.js';
import {
  assertElegibleParaCertificado,
  buildContentDisposition,
} from '../utils/certificado.util.js';
import createError from 'http-errors';
import {
  CURSO_CUPO_MAXIMO,
  CURSO_INSCRIPCION_NO_ABIERTA,
  CURSO_NO_ENCONTRADO_INSCRIPCION,
  CURSO_NO_HABILITADO_INSCRIPCION,
  ESTUDIANTE_INACTIVO_INSCRIPCION,
  ESTUDIANTE_NO_ENCONTRADO_INSCRIPCION,
  INSCRIPCION_DUPLICADA,
  INSCRIPCION_NO_ENCONTRADA,
} from '../constants/apiMessages.js';

/** INSCRIPCIÓN ABIERTA (cursos_estados.id_curso_estado = 2). */
const CURSO_ESTADO_INSCRIPCION_ABIERTA = 2;

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
      throw createError(404, INSCRIPCION_NO_ENCONTRADA);
    }
    return new InscripcionResponseDTO(row);
  }

  async create(data, idUsuario) {
    const idCurso = Number(data.idCurso);
    const idEstudiante = Number(data.idEstudiante);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Lock pesimista sobre el curso: serializa las altas concurrentes del mismo
      // curso para que los chequeos de cupo y duplicado sean consistentes (evita TOCTOU).
      await this.repository.lockCurso(client, idCurso);

      const estudiante = await this.repository.obtenerEstudianteActivo(client, idEstudiante);
      if (!estudiante) {
        throw createError(422, ESTUDIANTE_NO_ENCONTRADO_INSCRIPCION);
      }
      if (estudiante.activo !== 1) {
        throw createError(422, ESTUDIANTE_INACTIVO_INSCRIPCION);
      }

      const duplicada = await this.repository.existeActivaPorCursoYEstudiante(
        client,
        idCurso,
        idEstudiante,
      );
      if (duplicada) {
        throw createError(409, INSCRIPCION_DUPLICADA);
      }

      const cursoRow = await this.repository.obtenerCursoParaCupo(client, idCurso);
      if (!cursoRow) {
        throw createError(422, CURSO_NO_ENCONTRADO_INSCRIPCION);
      }
      if (cursoRow.curso_estado_activo !== 1) {
        throw createError(422, CURSO_NO_HABILITADO_INSCRIPCION);
      }
      if (cursoRow.id_curso_estado !== CURSO_ESTADO_INSCRIPCION_ABIERTA) {
        throw createError(422, CURSO_INSCRIPCION_NO_ABIERTA);
      }
      if (cursoRow.inscriptos_actuales >= cursoRow.inscriptos_max) {
        throw createError(409, CURSO_CUPO_MAXIMO);
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
      // Red de seguridad: el índice único parcial (uq_inscripcion_activa) puede
      // disparar 23505 ante una carrera que escape al chequeo de aplicación.
      if (error && error.code === '23505') {
        throw createError(409, INSCRIPCION_DUPLICADA);
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async remove(id, idUsuario) {
    const existente = await this.repository.getById(id);
    if (!existente) {
      throw createError(404, INSCRIPCION_NO_ENCONTRADA);
    }
    await this.repository.marcarCancelada(id, idUsuario);
    return true;
  }

  async obtenerInscripcionParaCertificado(id) {
    const row = await this.repository.getByIdParaCertificado(id);
    assertElegibleParaCertificado(row);
    return row;
  }

  async generarCertificadoPdf(id, res, { disposition = 'attachment' } = {}) {
    const inscripcion = await this.obtenerInscripcionParaCertificado(id);
    const idInscripcion = inscripcion.id_inscripcion || id;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      buildContentDisposition(idInscripcion, inscripcion.apellido, disposition),
    );
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    await pipeCertificadoInscripcionPdf(inscripcion, res);
  }
}
