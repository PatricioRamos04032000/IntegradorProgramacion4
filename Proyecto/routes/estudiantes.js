const express = require('express');
const router = express.Router();
const estudiantesController = require('../controllers/estudiantesController');

// BROWSE: Mostrar todos los estudiantes (lista paginada y búsqueda)
router.get('/', estudiantesController.browse);

// ADD: Mostrar formulario de alta y procesar la creación
router.get('/nuevo', estudiantesController.showAddForm);
router.post('/', estudiantesController.create);

// READ: Mostrar el detalle de un estudiante específico
// Nota: Dejamos las rutas con /:id al final para que no hagan conflicto con /nuevo
router.get('/:id', estudiantesController.showDetail);

// EDIT: Mostrar formulario de edición y procesar la actualización
router.get('/:id/editar', estudiantesController.showEditForm);
router.put('/:id', estudiantesController.update); 

// DELETE: Procesar el borrado lógico
router.delete('/:id', estudiantesController.delete);

module.exports = router;