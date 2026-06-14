import { query } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';

const certificadoQueryValidation = [
  query('disposition')
    .optional()
    .isIn(['attachment', 'inline'])
    .withMessage('El parámetro disposition debe ser attachment o inline.'),
  handleValidationErrors,
];

export default certificadoQueryValidation;
