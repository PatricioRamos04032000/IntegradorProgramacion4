import jwt from 'jsonwebtoken';
import UsuarioRepository from '../repositories/usuario.repository.js';
import {
  JWT_SECRET_NO_CONFIGURADO,
  JWT_TOKEN_AUSENTE,
  JWT_TOKEN_EXPIRADO,
  JWT_TOKEN_INVALIDO,
  JWT_USUARIO_NO_ENCONTRADO,
} from '../constants/apiMessages.js';

const usuarioRepo = new UsuarioRepository();

export default async function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: JWT_TOKEN_AUSENTE });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: JWT_SECRET_NO_CONFIGURADO });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const usuario = await usuarioRepo.obtenerPorId(decoded.id_usuario);

    if (!usuario) {
      return res.status(401).json({ error: JWT_USUARIO_NO_ENCONTRADO });
    }

    req.user = {
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
    };
    return next();
  } catch (err) {
    const mensaje = err.name === 'TokenExpiredError' ? JWT_TOKEN_EXPIRADO : JWT_TOKEN_INVALIDO;
    return res.status(401).json({ error: mensaje });
  }
}
