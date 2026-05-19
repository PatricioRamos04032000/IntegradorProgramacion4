import CursosRepository from "../repositories/cursos.repository.js";
import CursoResponseDTO from "../dtos/curso.response.dto.js";
import CursoEstadoResponseDTO from "../dtos/cursoEstado.response.dto.js";
import BaseService from './base.service.js';

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
    }

    async getAll(filter, limit, offset, order) {
        const sqlFilter = this.mapKeysToColumns(filter, CursosService.KEYS_MAP);
        const sqlOrder = this.mapKeysToColumns(order, CursosService.KEYS_MAP);

        const { rows, total } = await this.repository.getAll(sqlFilter, limit, offset, sqlOrder);
        const items = rows.map(curso => new CursoResponseDTO(curso));
        return { items, total, limit, offset };
    }

    async getById(id) {
        const curso = await this.repository.getById(id);
        if (!curso) return null;
        return new CursoResponseDTO(curso);
    }

    async getEstados() {
        const estados = await this.repository.getEstadosActivos();
        return estados.map(e => new CursoEstadoResponseDTO(e));
    }

    async create(data, idUsuario) {
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
        const dbData = {
            nombre: data.nombre.trim(),
            descripcion: data.descripcion.trim(),
            fecha_inicio: data.fechaInicio,
            cantidad_horas: data.cantidadHoras,
            inscriptos_max: data.inscriptosMax,
            id_curso_estado: data.idCursoEstado,
        };
        const rowCount = await this.repository.update(id, dbData, idUsuario);
        if (rowCount === 0) return null;
        return this.getById(id);
    }

    async remove(id, idUsuario) {
        const rowCount = await this.repository.delete(id, idUsuario);
        return rowCount;
    }
}
