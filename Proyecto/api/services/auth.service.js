import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import UsuarioRepository from '../repositories/usuario.repository.js';
import RefreshTokenRepository from '../repositories/refreshToken.repository.js';
import {
  CREDENCIALES_INVALIDAS,
  JWT_REFRESH_SECRET_NO_CONFIGURADO,
  JWT_SECRET_NO_CONFIGURADO,
  LOGIN_CAMPOS_REQUERIDOS,
  REFRESH_TOKEN_AUSENTE,
  REFRESH_TOKEN_EXPIRADO,
  REFRESH_TOKEN_INVALIDO,
  REFRESH_TOKEN_INVALIDO_O_EXPIRADO,
  REFRESH_TOKEN_REUTILIZADO,
  USUARIO_NO_ENCONTRADO_O_INACTIVO,
} from '../constants/apiMessages.js';

function hashPassword(plain) {
  return crypto.createHash('sha256').update(plain, 'utf8').digest('hex');
}

function getAccessSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError(500, JWT_SECRET_NO_CONFIGURADO);
  }
  return secret;
}

function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw createError(500, JWT_REFRESH_SECRET_NO_CONFIGURADO);
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
      throw createError(400, LOGIN_CAMPOS_REQUERIDOS);
    }

    const hashed = hashPassword(contrasenia);
    const usuario = await this.usuarioRepo.obtenerPorCredenciales(nombreUsuario, hashed);

    if (!usuario) {
      throw createError(401, CREDENCIALES_INVALIDAS);
    }

    return issueTokenPair(usuario, this.refreshTokenRepo);
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw createError(401, REFRESH_TOKEN_AUSENTE);
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, getRefreshSecret());
    } catch {
      throw createError(401, REFRESH_TOKEN_INVALIDO_O_EXPIRADO);
    }

    const stored = await this.refreshTokenRepo.obtenerPorJti(decoded.jti);
    if (!stored) {
      throw createError(401, REFRESH_TOKEN_INVALIDO);
    }

    if (stored.revoked_at) {
      await this.refreshTokenRepo.revocarTodosPorUsuario(stored.id_usuario);
      throw createError(401, REFRESH_TOKEN_REUTILIZADO);
    }

    if (new Date(stored.expires_at) < new Date()) {
      throw createError(401, REFRESH_TOKEN_EXPIRADO);
    }

    const usuario = await this.usuarioRepo.obtenerPorId(decoded.id_usuario);
    if (!usuario) {
      throw createError(401, USUARIO_NO_ENCONTRADO_O_INACTIVO);
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
