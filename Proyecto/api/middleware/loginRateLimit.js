import rateLimit from 'express-rate-limit';

const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de login. Intente mas tarde.' },
});

export default loginRateLimit;
