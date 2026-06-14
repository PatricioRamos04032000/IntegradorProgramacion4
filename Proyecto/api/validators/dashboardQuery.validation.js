import { query } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';

const dashboardQueryValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit debe ser un entero entre 1 y 100')
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('offset debe ser un entero no negativo')
    .toInt(),
  handleValidationErrors,
];

export default dashboardQueryValidation;
