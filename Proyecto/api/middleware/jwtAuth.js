import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/usuario.repository.js';

const usuarioRepo = new UsuarioRepository();

export default async function jwtAuth(req, res, next) {
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
    const usuario = await usuarioRepo.obtenerPorId(decoded.id_usuario);

    if (!usuario) {
      return res.status(401).json({ error: 'No autorizado: usuario no encontrado o inactivo' });
    }

    req.user = {
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
    };
    return next();
  } catch (err) {
    const motivo = err.name === 'TokenExpiredError' ? 'token expirado' : 'token invalido';
    return res.status(401).json({ error: `No autorizado: ${motivo}` });
  }
}
