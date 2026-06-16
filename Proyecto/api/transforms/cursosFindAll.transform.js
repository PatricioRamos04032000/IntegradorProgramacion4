import { normalizeLimit, normalizeOffset } from '../utils/pagination.js';

const cursosFindAllTransform = (req, res, next) => {
  req.limit = normalizeLimit(req.query.limit);
  req.offset = normalizeOffset(req.query.offset);

  const filterObj = {};
  const { nombre, idCursoEstado, order } = req.query;

  const direction = req.query.asc === 'true' ? 'ASC' : 'DESC';
  const orderObj = order ? { [order]: direction } : { idCurso: 'ASC' };

  if (nombre) filterObj.nombre = nombre;
  if (idCursoEstado) filterObj.idCursoEstado = Number(idCursoEstado);

  req.filter = filterObj;
  req.order = orderObj;

  next();
};

export default cursosFindAllTransform;
