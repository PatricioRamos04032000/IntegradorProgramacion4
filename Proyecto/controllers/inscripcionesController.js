const inscripcionModel = require('../models/inscripcionModel');
// Importamos los otros modelos para llenar los <select> del formulario
const cursoModel = require('../models/cursoModel');
const estudianteModel = require('../models/estudianteModel');

const inscripcionesController = {
    // BROWSE: Mostrar listado de inscripciones activas
    browse: async (req, res, next) => {
        try {
            const searchQuery = req.query.q || '';
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const offset = (page - 1) * pageSize;

            const inscripciones = await inscripcionModel.getAll(searchQuery, pageSize, offset);
            
            res.render('inscripciones/browse', { 
                title: 'Listado de Inscripciones', 
                inscripciones,
                searchQuery,
                page,
                pageSize
            });
        } catch (error) {
            next(error);
        }
    },

    // ADD: Mostrar formulario de alta
    showAddForm: async (req, res, next) => {
        try {
            // Llamamos a tu función 'listar' pasándole un pageSize alto para traer todos
            const cursosData = await cursoModel.listar({ pageSize: 1000 });
            // Extraemos el arreglo real de cursos que viene dentro de 'items'
            const cursos = cursosData.items;

            const estudiantes = await estudianteModel.getAll('', 1000, 0);

            res.render('inscripciones/add', { 
                title: 'Nueva Inscripción',
                cursos,
                estudiantes,
                error: null // Pasamos null por defecto
            });
        } catch (error) {
            next(error);
        }
    },

    // ADD: Procesar la creación interceptando las reglas de negocio
    create: async (req, res, next) => {
        try {
            const idUsuarioModificacion = process.env.DEFAULT_USER_ID; 
            
            // Intentamos hacer el INSERT (acá saltan las validaciones del modelo)
            await inscripcionModel.create(req.body, idUsuarioModificacion);
            
            res.redirect('/inscripciones');
        } catch (error) {
            // Si entra al catch, falló el cupo máximo o está duplicado
            try {
                // Llamamos a tu función 'listar' pasándole un pageSize alto para traer todos
                const cursosData = await cursoModel.listar({ pageSize: 1000 });
                // Extraemos el arreglo real de cursos que viene dentro de 'items'
                const cursos = cursosData.items;
                const estudiantes = await estudianteModel.getAll('', 1000, 0);
                
                // Renderizamos la vista enviando el error.message para mostrar la alerta en rojo
                res.render('inscripciones/add', { 
                    title: 'Nueva Inscripción',
                    cursos,
                    estudiantes,
                    error: error.message 
                });
            } catch (innerError) {
                next(innerError);
            }
        }
    },

    // READ: Mostrar el detalle de una inscripción (para el diploma, por ejemplo)
    showDetail: async (req, res, next) => {
        try {
            // Suponiendo que armás un getById en inscripcionModel
            const inscripcion = await inscripcionModel.getById(req.params.id);
            if (!inscripcion) {
                return res.status(404).render('error', { message: 'Inscripción no encontrada.' });
            }
            res.render('inscripciones/read', { title: 'Detalle de Inscripción', inscripcion });
        } catch (error) {
            next(error);
        }
    },

    // DELETE: Procesar el borrado lógico (Soft Delete)
    delete: async (req, res, next) => {
        try {
            const idUsuarioModificacion = process.env.DEFAULT_USER_ID; 
            await inscripcionModel.delete(req.params.id, idUsuarioModificacion); 
            res.redirect('/inscripciones');
        } catch (error) {
            next(error);
        }
    }
};

module.exports = inscripcionesController;