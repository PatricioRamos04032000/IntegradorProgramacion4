const express = require('express');
const router = express.Router();
const inscripcionesController = require('../controllers/inscripcionesController');
const asyncHandler = require('../middleware/asyncHandler');
const validateIdParam = require('../middleware/validateIdParam');

router.get('/', asyncHandler(inscripcionesController.browse));
router.post('/', asyncHandler(inscripcionesController.create));

router.get(
  '/:id(\\d+)/certificado',
  validateIdParam('id'),
  asyncHandler(inscripcionesController.certificadoPdf),
);

router.get('/:id(\\d+)', validateIdParam('id'), asyncHandler(inscripcionesController.showDetail));
router.delete('/:id(\\d+)', validateIdParam('id'), asyncHandler(inscripcionesController.delete));

module.exports = router;
