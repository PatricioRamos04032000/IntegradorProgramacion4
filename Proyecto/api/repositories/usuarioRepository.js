const pool = require('../db/pool');

async function obtenerPorCredenciales(nombreUsuario, hashedPassword) {
  const query = `
    SELECT id_usuario, apellido, nombre, nombre_usuario
    FROM usuarios
    WHERE nombre_usuario = $1
      AND contrasenia = $2
      AND activo = 1
  `;
  const result = await pool.query(query, [nombreUsuario, hashedPassword]);
  return result.rows[0];
}

async function obtenerPorId(id) {
  const query = `
    SELECT id_usuario, apellido, nombre, nombre_usuario
    FROM usuarios
    WHERE id_usuario = $1 AND activo = 1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

module.exports = {
  obtenerPorCredenciales,
  obtenerPorId,
};
