import { query } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';
import { MAX_LIMIT } from '../utils/pagination.js';

const estudiantesFindAllValidation = [
  query('q').optional().isString().withMessage('q debe ser una cadena de texto'),
  query('documento').optional().isString().withMessage('documento debe ser una cadena de texto'),
  query('apellido').optional().isString().withMessage('apellido debe ser una cadena de texto'),
  query('nombres').optional().isString().withMessage('nombres debe ser una cadena de texto'),
  query('email').optional().isString().withMessage('email debe ser una cadena de texto'),
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
  query('order')
    .optional()
    .isIn(['idEstudiante', 'documento', 'apellido', 'nombres', 'email'])
    .withMessage('order debe ser uno de: idEstudiante, documento, apellido, nombres, email'),
  query('asc').optional().isBoolean().withMessage('asc debe ser un valor booleano'),
  handleValidationErrors,
];

export default estudiantesFindAllValidation;
