var express = require('express');
var router = express.Router();
var cursosController = require('../controllers/cursosController');

router.get('/', cursosController.browse);
router.get('/nuevo', cursosController.addForm);
router.post('/', cursosController.add);
router.get('/:id(\\d+)', cursosController.read);
router.get('/:id(\\d+)/editar', cursosController.editForm);
router.put('/:id(\\d+)', cursosController.edit);
router.delete('/:id(\\d+)', cursosController.remove);

module.exports = router;
