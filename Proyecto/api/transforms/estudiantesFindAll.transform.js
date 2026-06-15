import { normalizeLimit, normalizeOffset } from '../utils/pagination.js';

const estudiantesFindAllTransform = (req, res, next) => {
  req.limit = normalizeLimit(req.query.limit);
  req.offset = normalizeOffset(req.query.offset);

  const filterObj = {};
  const direction = req.query.asc === 'true' ? 'ASC' : 'DESC';
  const orderObj = req.query.order
    ? { [req.query.order]: direction }
    : { idEstudiante: 'ASC' };

  if (req.query.q) filterObj.q = req.query.q;
  if (req.query.documento) filterObj.documento = req.query.documento;
  if (req.query.apellido) filterObj.apellido = req.query.apellido;
  if (req.query.nombres) filterObj.nombres = req.query.nombres;
  if (req.query.email) filterObj.email = req.query.email;

  req.filter = filterObj;
  req.order = orderObj;

  next();
};

export default estudiantesFindAllTransform;
