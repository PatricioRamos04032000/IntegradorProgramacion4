import { normalizeLimit, normalizeOffset } from '../utils/pagination.js';

const inscripcionesFindAllTransform = (req, res, next) => {
  req.limit = normalizeLimit(req.query.limit);
  req.offset = normalizeOffset(req.query.offset);
  req.filter = req.query.q ? { q: req.query.q } : {};
  next();
};

export default inscripcionesFindAllTransform;
