import createError from 'http-errors';

export function notFoundHandler(req, res, next) {
  next(createError(404, 'Recurso no encontrado'));
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Error interno del servidor';
  res.status(status).json({ error: message });
}
