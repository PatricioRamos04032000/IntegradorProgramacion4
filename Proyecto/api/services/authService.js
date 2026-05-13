const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const usuarioRepository = require('../repositories/usuarioRepository');

function hashPassword(plain) {
  return crypto.createHash('sha256').update(plain, 'utf8').digest('hex');
}

async function login(nombreUsuario, contrasenia) {
  if (!nombreUsuario || !contrasenia) {
    throw createError(400, 'nombre_usuario y contrasenia son requeridos');
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw createError(500, 'JWT_SECRET no esta configurado en el servidor');
  }

  const hashed = hashPassword(contrasenia);
  const usuario = await usuarioRepository.obtenerPorCredenciales(nombreUsuario, hashed);

  if (!usuario) {
    throw createError(401, 'Credenciales invalidas');
  }

  const payload = {
    id_usuario: usuario.id_usuario,
    nombre_usuario: usuario.nombre_usuario,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
  };

  const token = jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  return {
    token,
    user: payload,
  };
}

module.exports = {
  login,
};
