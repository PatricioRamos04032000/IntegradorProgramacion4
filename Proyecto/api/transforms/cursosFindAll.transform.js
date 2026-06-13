const cursosFindAllTransform = (req, res, next) => {
  req.limit = req.query.limit ? Number(req.query.limit) : 0;
  req.offset = req.query.offset ? Number(req.query.offset) : 0;

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
