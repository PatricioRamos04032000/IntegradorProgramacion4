import { param } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';

const estudiantesIdParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El parámetro id debe ser un entero positivo.')
    .toInt(),
  handleValidationErrors,
];

export default estudiantesIdParamValidation;
