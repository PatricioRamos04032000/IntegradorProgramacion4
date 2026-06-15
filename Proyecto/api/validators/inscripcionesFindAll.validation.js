import { query } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';
import { MAX_LIMIT } from '../utils/pagination.js';

const inscripcionesFindAllValidation = [
  query('q').optional().isString().withMessage('q debe ser una cadena de texto'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: MAX_LIMIT })
    .withMessage(`limit debe ser un entero entre 1 y ${MAX_LIMIT}`)
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('offset debe ser un entero no negativo')
    .toInt(),
  handleValidationErrors,
];

export default inscripcionesFindAllValidation;
