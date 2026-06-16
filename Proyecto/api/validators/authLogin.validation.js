import { body } from 'express-validator';
import handleValidationErrors from '../middleware/handleValidationErrors.js';

const authLoginValidation = [
  body('nombreUsuario').notEmpty().withMessage('nombreUsuario es requerido.'),
  body('contrasenia').notEmpty().withMessage('contrasenia es requerida.'),
  handleValidationErrors,
];

export default authLoginValidation;
