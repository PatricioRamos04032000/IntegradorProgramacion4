const createError = require('http-errors');

function validateIdParam(paramName) {
  return function idParamValidator(req, res, next) {
    const rawValue = req.params[paramName];
    const numericValue = Number(rawValue);

    if (!Number.isInteger(numericValue) || numericValue <= 0) {
      return next(createError(400, `Parámetro "${paramName}" inválido.`));
    }

    req.params[paramName] = String(numericValue);
    next();
  };
}

module.exports = validateIdParam;
