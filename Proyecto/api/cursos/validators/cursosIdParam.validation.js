import { param, validationResult } from 'express-validator';

const cursosIdParamValidation = [
    param('id')
        .isInt({ min: 1 }).withMessage('El parámetro id debe ser un entero positivo.')
        .toInt(),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export default cursosIdParamValidation;
