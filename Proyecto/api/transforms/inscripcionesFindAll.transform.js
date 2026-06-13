const inscripcionesFindAllTransform = (req, res, next) => {
  req.limit = req.query.limit ? Number(req.query.limit) : 10;
  req.offset = req.query.offset ? Number(req.query.offset) : 0;
  req.filter = req.query.q ? { q: req.query.q } : {};
  next();
};

export default inscripcionesFindAllTransform;
