import { body, validationResult } from 'express-validator';

const cursosBodyValidation = [
    body('nombre')
        .notEmpty().withMessage('El nombre es obligatorio.')
        .isString().withMessage('El nombre debe ser una cadena de texto.')
        .isLength({ max: 45 }).withMessage('El nombre no puede superar 45 caracteres.'),
    body('descripcion')
        .notEmpty().withMessage('La descripción es obligatoria.')
        .isString().withMessage('La descripción debe ser una cadena de texto.'),
    body('fechaInicio')
        .notEmpty().withMessage('La fecha de inicio es obligatoria.')
        .isISO8601().withMessage('La fecha de inicio debe tener formato válido (YYYY-MM-DD).'),
    body('cantidadHoras')
        .notEmpty().withMessage('La cantidad de horas es obligatoria.')
        .isInt({ min: 0 }).withMessage('La cantidad de horas debe ser un entero mayor o igual a 0.')
        .toInt(),
    body('inscriptosMax')
        .notEmpty().withMessage('El cupo máximo es obligatorio.')
        .isInt({ min: 0 }).withMessage('El cupo máximo debe ser un entero mayor o igual a 0.')
        .toInt(),
    body('idCursoEstado')
        .notEmpty().withMessage('Debe seleccionarse un estado válido.')
        .isInt({ min: 1 }).withMessage('El estado debe ser un entero positivo.')
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export default cursosBodyValidation;
