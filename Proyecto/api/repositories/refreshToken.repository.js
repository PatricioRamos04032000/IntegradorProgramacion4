import pool from '../db/pool.js';

export default class RefreshTokenRepository {
  async crear(idUsuario, jti, expiresAt) {
    await pool.query(
      `
      INSERT INTO refresh_tokens (id_usuario, jti, expires_at)
      VALUES ($1, $2, $3)
      `,
      [idUsuario, jti, expiresAt],
    );
  }

  async obtenerPorJti(jti) {
    const result = await pool.query(
      `
      SELECT id_refresh_token, id_usuario, jti, expires_at, revoked_at
        FROM refresh_tokens
       WHERE jti = $1
      `,
      [jti],
    );
    return result.rows[0];
  }

  async revocar(jti) {
    await pool.query(
      `
      UPDATE refresh_tokens
         SET revoked_at = NOW()
       WHERE jti = $1
         AND revoked_at IS NULL
      `,
      [jti],
    );
  }

  async revocarTodosPorUsuario(idUsuario) {
    await pool.query(
      `
      UPDATE refresh_tokens
         SET revoked_at = NOW()
       WHERE id_usuario = $1
         AND revoked_at IS NULL
      `,
      [idUsuario],
    );
  }
}
