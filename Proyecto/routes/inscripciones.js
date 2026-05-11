const express = require('express');
const router = express.Router();
const inscripcionesController = require('../controllers/inscripcionesController');

// BROWSE: Lista paginada de inscripciones
router.get('/', inscripcionesController.browse);

// ADD: Formulario de alta y procesamiento
router.get('/nuevo', inscripcionesController.showAddForm);
router.post('/', inscripcionesController.create);

// READ: Detalle de la inscripción (sin edición)
router.get('/:id', inscripcionesController.showDetail);

// DELETE: Borrado lógico mediante method-override
router.delete('/:id', inscripcionesController.delete);

module.exports = router;