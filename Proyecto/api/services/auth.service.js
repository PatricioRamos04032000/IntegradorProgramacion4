import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import UsuarioRepository from '../repositories/usuario.repository.js';
import RefreshTokenRepository from '../repositories/refreshToken.repository.js';

function hashPassword(plain) {
  return crypto.createHash('sha256').update(plain, 'utf8').digest('hex');
}

function getAccessSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError(500, 'JWT_SECRET no esta configurado en el servidor');
  }
  return secret;
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw createError(500, 'JWT_REFRESH_SECRET no esta configurado en el servidor');
  }
  return secret;
}

function getAccessExpiresIn() {
  return process.env.JWT_ACCESS_EXPIRES_IN || process.env.JWT_EXPIRES_IN || '15m';
}

function getRefreshExpiresIn() {
  return process.env.JWT_REFRESH_EXPIRES_IN || '7d';
}

function userPayload(usuario) {
  return {
    id_usuario: usuario.id_usuario,
    nombre_usuario: usuario.nombre_usuario,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
  };
}

function signAccessToken(payload) {
  return jwt.sign(payload, getAccessSecret(), { expiresIn: getAccessExpiresIn() });
}

function signRefreshToken(idUsuario, jti) {
  return jwt.sign({ id_usuario: idUsuario, jti }, getRefreshSecret(), {
    expiresIn: getRefreshExpiresIn(),
  });
}

async function issueTokenPair(usuario, refreshTokenRepo) {
  const payload = userPayload(usuario);
  const accessToken = signAccessToken(payload);
  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken(usuario.id_usuario, jti);
  const decoded = jwt.decode(refreshToken);
  await refreshTokenRepo.crear(usuario.id_usuario, jti, new Date(decoded.exp * 1000));

  return { accessToken, refreshToken, user: payload };
}

export default class AuthService {
  constructor() {
    this.usuarioRepo = new UsuarioRepository();
    this.refreshTokenRepo = new RefreshTokenRepository();
  }

  async login(nombreUsuario, contrasenia) {
    if (!nombreUsuario || !contrasenia) {
      throw createError(400, 'nombreUsuario y contrasenia son requeridos');
    }

    const hashed = hashPassword(contrasenia);
    const usuario = await this.usuarioRepo.obtenerPorCredenciales(nombreUsuario, hashed);

    if (!usuario) {
      throw createError(401, 'Credenciales invalidas');
    }

    return issueTokenPair(usuario, this.refreshTokenRepo);
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw createError(401, 'Refresh token ausente');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, getRefreshSecret());
    } catch {
      throw createError(401, 'Refresh token invalido o expirado');
    }

    const stored = await this.refreshTokenRepo.obtenerPorJti(decoded.jti);
    if (!stored) {
      throw createError(401, 'Refresh token invalido');
    }

    if (stored.revoked_at) {
      await this.refreshTokenRepo.revocarTodosPorUsuario(stored.id_usuario);
      throw createError(401, 'Refresh token reutilizado; sesion invalidada');
    }

    if (new Date(stored.expires_at) < new Date()) {
      throw createError(401, 'Refresh token expirado');
    }

    const usuario = await this.usuarioRepo.obtenerPorId(decoded.id_usuario);
    if (!usuario) {
      throw createError(401, 'Usuario no encontrado o inactivo');
    }

    await this.refreshTokenRepo.revocar(decoded.jti);
    return issueTokenPair(usuario, this.refreshTokenRepo);
  }

  async logout(refreshToken) {
    if (!refreshToken) {
      return;
    }

    try {
      const decoded = jwt.verify(refreshToken, getRefreshSecret());
      await this.refreshTokenRepo.revocar(decoded.jti);
    } catch {
      // Ignorar tokens invalidos al cerrar sesion.
    }
  }
}
