import CursosService from "../services/cursos.service.js";

export default class CursosController {
    constructor() {
        this.service = new CursosService();
    }

    async browse(req, res) {
        try {
            const { filter, limit, offset, order } = req;
            const resultado = await this.service.getAll(filter, limit, offset, order);
            res.json(resultado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener los cursos' });
        }
    }

    async read(req, res) {
        try {
            const curso = await this.service.getById(req.params.id);
            if (!curso) {
                return res.status(404).json({ error: 'Curso no encontrado' });
            }
            res.json(curso);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener el curso' });
        }
    }

    async getEstados(req, res) {
        try {
            const estados = await this.service.getEstados();
            res.json(estados);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al obtener los estados' });
        }
    }

    async add(req, res) {
        try {
            const curso = await this.service.create(req.body, req.user.id_usuario);
            res.status(201).json(curso);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al crear el curso' });
        }
    }

    async edit(req, res) {
        try {
            const curso = await this.service.update(req.params.id, req.body, req.user.id_usuario);
            if (!curso) {
                return res.status(404).json({ error: 'Curso no encontrado' });
            }
            res.json(curso);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al actualizar el curso' });
        }
    }

    async remove(req, res) {
        try {
            const rowCount = await this.service.remove(req.params.id, req.user.id_usuario);
            if (rowCount === 0) {
                return res.status(404).json({ error: 'Curso no encontrado' });
            }
            res.status(204).send();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error al eliminar el curso' });
        }
    }
}
