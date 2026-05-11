const estudianteModel = require('../models/estudianteModel');

const estudiantesController = {
    // BROWSE: Mostrar todos los estudiantes
    browse: async (req, res, next) => {
        try {
            // Extraer parámetros de búsqueda y paginación del querystring
            const searchQuery = req.query.q || '';
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const offset = (page - 1) * pageSize;

            // Llamar al modelo
            const estudiantes = await estudianteModel.getAll(searchQuery, pageSize, offset);
            
            // Renderizar la vista Pug (Server-Side Rendering)
            res.render('estudiantes/browse', { 
                title: 'Listado de Estudiantes', 
                estudiantes,
                searchQuery,
                page,
                pageSize
            });
        } catch (error) {
            next(error);
        }
    },

    // ADD: Renderizar el formulario de alta
    showAddForm: (req, res) => {
        res.render('estudiantes/add', { title: 'Nuevo Estudiante' });
    },

    // ADD: Procesar la creación del estudiante
    create: async (req, res, next) => {
        try {
            // Mientras no integremos el login con JWT, usamos la variable de entorno
            const idUsuarioModificacion = process.env.DEFAULT_USER_ID; 
            
            await estudianteModel.create(req.body, idUsuarioModificacion);
            
            // Redirigimos al listado tras la inserción exitosa
            res.redirect('/estudiantes');
        } catch (error) {
            next(error);
        }
    },
    
    // READ: Mostrar el detalle de un estudiante específico
    showDetail: async (req, res, next) => {
        try {
            const estudiante = await estudianteModel.getById(req.params.id);
            if (!estudiante) {
                return res.status(404).render('error', { message: 'Estudiante no encontrado o inactivo.' });
            }
            res.render('estudiantes/read', { title: 'Detalle del Estudiante', estudiante });
        } catch (error) {
            next(error);
        }
    },

    // EDIT: Renderizar el formulario de edición
    showEditForm: async (req, res, next) => {
         try {
            const estudiante = await estudianteModel.getById(req.params.id);
            if (!estudiante) {
                return res.status(404).render('error', { message: 'Estudiante no encontrado.' });
            }
            res.render('estudiantes/edit', { title: 'Editar Estudiante', estudiante });
        } catch (error) {
            next(error);
        }
    },

    // EDIT: Procesar la actualización en la base de datos
    update: async (req, res, next) => {
        try {
            const idUsuarioModificacion = process.env.DEFAULT_USER_ID; 
            await estudianteModel.update(req.params.id, req.body, idUsuarioModificacion);
            res.redirect('/estudiantes');
        } catch (error) {
            next(error);
        }
    },

    // DELETE: Procesar el borrado lógico (Soft Delete)
    delete: async (req, res, next) => {
        try {
            const idUsuarioModificacion = process.env.DEFAULT_USER_ID; 
            // El modelo se encarga de hacer el UPDATE activo = 0
            await estudianteModel.delete(req.params.id, idUsuarioModificacion); 
            res.redirect('/estudiantes');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = estudiantesController;