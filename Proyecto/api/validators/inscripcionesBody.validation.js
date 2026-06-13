import { body } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';

const inscripcionesBodyValidation = [
  body('idCurso')
    .notEmpty()
    .withMessage('idCurso es obligatorio.')
    .isInt({ min: 1 })
    .withMessage('idCurso debe ser un entero positivo.')
    .toInt(),
  body('idEstudiante')
    .notEmpty()
    .withMessage('idEstudiante es obligatorio.')
    .isInt({ min: 1 })
    .withMessage('idEstudiante debe ser un entero positivo.')
    .toInt(),
  handleValidationErrors,
];

export default inscripcionesBodyValidation;
