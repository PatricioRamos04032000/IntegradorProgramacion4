import { query } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';

const cursosFindAllValidation = [
  query('nombre').optional().isString().withMessage('nombre debe ser una cadena de texto'),
  query('idCursoEstado')
    .optional()
    .isInt({ min: 1 })
    .withMessage('idCursoEstado debe ser un entero positivo')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 0 })
    .withMessage('limit debe ser un entero no negativo')
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('offset debe ser un entero no negativo')
    .toInt(),
  query('order')
    .optional()
    .isIn(['idCurso', 'nombre', 'fechaInicio', 'cantidadHoras', 'inscriptosMax'])
    .withMessage('order debe ser uno de: idCurso, nombre, fechaInicio, cantidadHoras, inscriptosMax'),
  query('asc').optional().isBoolean().withMessage('asc debe ser un valor booleano'),
  handleValidationErrors,
];

export default cursosFindAllValidation;
