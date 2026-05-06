var express = require('express');
var router = express.Router();
var cursosController = require('../controllers/cursosController');
var asyncHandler = require('../middleware/asyncHandler');
var validateIdParam = require('../middleware/validateIdParam');

router.get('/', asyncHandler(cursosController.browse));
router.get('/nuevo', asyncHandler(cursosController.addForm));
router.post('/', asyncHandler(cursosController.add));
router.get('/:id(\\d+)', validateIdParam('id'), asyncHandler(cursosController.read));
router.get('/:id(\\d+)/editar', validateIdParam('id'), asyncHandler(cursosController.editForm));
router.put('/:id(\\d+)', validateIdParam('id'), asyncHandler(cursosController.edit));
router.delete('/:id(\\d+)', validateIdParam('id'), asyncHandler(cursosController.remove));

module.exports = router;
