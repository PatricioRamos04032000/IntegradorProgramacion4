import { body } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';

const estudiantesBodyValidation = [
  body('documento').notEmpty().withMessage('El documento es obligatorio.').isString(),
  body('apellido').notEmpty().withMessage('El apellido es obligatorio.').isString(),
  body('nombres').notEmpty().withMessage('Los nombres son obligatorios.').isString(),
  body('email').notEmpty().withMessage('El email es obligatorio.').isEmail().withMessage('Email inválido.'),
  body('fechaNacimiento')
    .notEmpty()
    .withMessage('La fecha de nacimiento es obligatoria.')
    .isISO8601()
    .withMessage('fechaNacimiento debe tener formato YYYY-MM-DD.'),
  handleValidationErrors,
];

export default estudiantesBodyValidation;
