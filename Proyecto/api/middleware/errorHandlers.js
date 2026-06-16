import createError from 'http-errors';
import { ERROR_INTERNO, RECURSO_NO_ENCONTRADO } from '../constants/apiMessages.js';

export function notFoundHandler(req, res, next) {
  next(createError(404, RECURSO_NO_ENCONTRADO));
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || ERROR_INTERNO;
  res.status(status).json({ error: message });
}
