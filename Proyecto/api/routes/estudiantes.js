const express = require('express');
const router = express.Router();
const estudiantesController = require('../controllers/estudiantesController');
const asyncHandler = require('../middleware/asyncHandler');
const validateIdParam = require('../middleware/validateIdParam');

router.get('/', asyncHandler(estudiantesController.browse));
router.post('/', asyncHandler(estudiantesController.create));
router.get('/:id(\\d+)', validateIdParam('id'), asyncHandler(estudiantesController.showDetail));
router.put('/:id(\\d+)', validateIdParam('id'), asyncHandler(estudiantesController.update));
router.delete('/:id(\\d+)', validateIdParam('id'), asyncHandler(estudiantesController.delete));

module.exports = router;
