import { normalizeLimit, normalizeOffset } from '../utils/pagination.js';

const cursosFindAllTransform = (req, res, next) => {
  req.limit = normalizeLimit(req.query.limit);
  req.offset = normalizeOffset(req.query.offset);

  const filterObj = {};
  const orderObj = { idCurso: 'ASC' };

  const { nombre, idCursoEstado, order } = req.query;

  if (nombre) filterObj.nombre = nombre;
  if (idCursoEstado) filterObj.idCursoEstado = Number(idCursoEstado);
  if (order) orderObj[order] = req.query.asc === 'true' ? 'ASC' : 'DESC';

  req.filter = filterObj;
  req.order = orderObj;

  next();
};

export default cursosFindAllTransform;
