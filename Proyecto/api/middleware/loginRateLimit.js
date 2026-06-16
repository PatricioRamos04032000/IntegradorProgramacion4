import rateLimit from 'express-rate-limit';
import { LOGIN_RATE_LIMIT } from '../constants/apiMessages.js';

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: LOGIN_RATE_LIMIT },
});

export default loginRateLimit;
