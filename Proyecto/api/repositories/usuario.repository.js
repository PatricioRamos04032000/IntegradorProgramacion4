import pool from '../db/pool.js';

export default class UsuarioRepository {
  async obtenerPorCredenciales(nombreUsuario, hashedPassword) {
    const result = await pool.query(
      `
      SELECT id_usuario, apellido, nombre, nombre_usuario
        FROM usuarios
       WHERE nombre_usuario = $1
         AND contrasenia = $2
         AND activo = 1
      `,
      [nombreUsuario, hashedPassword],
    );
    return result.rows[0];
  }

  async obtenerPorId(id) {
    const result = await pool.query(
      `
      SELECT id_usuario, apellido, nombre, nombre_usuario
        FROM usuarios
       WHERE id_usuario = $1 AND activo = 1
      `,
      [id],
    );
    return result.rows[0];
  }
}
