import jwt from 'jsonwebtoken';

export default function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autorizado: token ausente o mal formado' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT_SECRET no esta configurado en el servidor' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = {
      id_usuario: decoded.id_usuario,
      nombre_usuario: decoded.nombre_usuario,
      nombre: decoded.nombre,
      apellido: decoded.apellido,
    };
    return next();
  } catch (err) {
    const motivo = err.name === 'TokenExpiredError' ? 'token expirado' : 'token invalido';
    return res.status(401).json({ error: `No autorizado: ${motivo}` });
  }
}
