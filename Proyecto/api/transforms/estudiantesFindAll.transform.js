import { normalizeLimit, normalizeOffset } from '../utils/pagination.js';

const estudiantesFindAllTransform = (req, res, next) => {
  req.limit = normalizeLimit(req.query.limit);
  req.offset = normalizeOffset(req.query.offset);

  const filterObj = {};
  const orderObj = { id_estudiante: 'ASC' };

  if (req.query.q) filterObj.q = req.query.q;
  if (req.query.documento) filterObj.documento = req.query.documento;
  if (req.query.apellido) filterObj.apellido = req.query.apellido;
  if (req.query.nombres) filterObj.nombres = req.query.nombres;
  if (req.query.email) filterObj.email = req.query.email;
  if (req.query.order) {
    const map = {
      idEstudiante: 'id_estudiante',
      documento: 'documento',
      apellido: 'apellido',
      nombres: 'nombres',
      email: 'email',
    };
    const col = map[req.query.order];
    if (col) orderObj[col] = req.query.asc === 'true' ? 'ASC' : 'DESC';
  }

  req.filter = filterObj;
  req.order = orderObj;

  next();
};

export default estudiantesFindAllTransform;
