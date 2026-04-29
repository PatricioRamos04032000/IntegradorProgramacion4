const pool = require('../db/pool');

const ESTADO_ELIMINADO = 4;

async function listar({ q, idEstado, page, pageSize }) {
  const limit = Math.max(1, Number(pageSize) || 10);
  const currentPage = Math.max(1, Number(page) || 1);
  const offset = (currentPage - 1) * limit;

  const filtroNombre = q && q.trim() !== '' ? q.trim() : null;
  const filtroEstado = idEstado ? Number(idEstado) : null;

  const dataSql = `
    SELECT c.id_curso,
           c.nombre,
           c.fecha_inicio,
           c.cantidad_horas,
           c.inscriptos_max,
           cs.id_curso_estado,
           cs.descripcion AS estado
      FROM cursos c
      JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
     WHERE cs.es_activo = 1
       AND ($1::text IS NULL OR c.nombre ILIKE '%' || $1 || '%')
       AND ($2::smallint IS NULL OR c.id_curso_estado = $2)
     ORDER BY c.fecha_inicio DESC, c.id_curso DESC
     LIMIT $3 OFFSET $4
  `;

  const countSql = `
    SELECT COUNT(*)::int AS total
      FROM cursos c
      JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
     WHERE cs.es_activo = 1
       AND ($1::text IS NULL OR c.nombre ILIKE '%' || $1 || '%')
       AND ($2::smallint IS NULL OR c.id_curso_estado = $2)
  `;

  const [dataResult, countResult] = await Promise.all([
    pool.query(dataSql, [filtroNombre, filtroEstado, limit, offset]),
    pool.query(countSql, [filtroNombre, filtroEstado]),
  ]);

  const total = countResult.rows[0].total;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    items: dataResult.rows,
    page: currentPage,
    pageSize: limit,
    total,
    totalPages,
  };
}

async function obtener(id) {
  const sql = `
    SELECT c.id_curso,
           c.nombre,
           c.descripcion,
           c.fecha_inicio,
           c.cantidad_horas,
           c.inscriptos_max,
           c.id_curso_estado,
           cs.descripcion AS estado,
           c.id_usuario_modificacion,
           c.fecha_hora_modificacion
      FROM cursos c
      JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
     WHERE c.id_curso = $1
  `;

  const result = await pool.query(sql, [Number(id)]);
  return result.rows[0] || null;
}

async function crear(data, usuarioId) {
  const sql = `
    INSERT INTO cursos (
      nombre, descripcion, fecha_inicio, cantidad_horas,
      inscriptos_max, id_curso_estado,
      id_usuario_modificacion, fecha_hora_modificacion
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING id_curso
  `;

  const params = [
    data.nombre,
    data.descripcion,
    data.fecha_inicio,
    Number(data.cantidad_horas),
    Number(data.inscriptos_max),
    Number(data.id_curso_estado),
    Number(usuarioId),
  ];

  const result = await pool.query(sql, params);
  return result.rows[0].id_curso;
}

async function actualizar(id, data, usuarioId) {
  const sql = `
    UPDATE cursos
       SET nombre = $1,
           descripcion = $2,
           fecha_inicio = $3,
           cantidad_horas = $4,
           inscriptos_max = $5,
           id_curso_estado = $6,
           id_usuario_modificacion = $7,
           fecha_hora_modificacion = NOW()
     WHERE id_curso = $8
  `;

  const params = [
    data.nombre,
    data.descripcion,
    data.fecha_inicio,
    Number(data.cantidad_horas),
    Number(data.inscriptos_max),
    Number(data.id_curso_estado),
    Number(usuarioId),
    Number(id),
  ];

  const result = await pool.query(sql, params);
  return result.rowCount;
}

async function eliminar(id, usuarioId) {
  const sql = `
    UPDATE cursos
       SET id_curso_estado = $1,
           id_usuario_modificacion = $2,
           fecha_hora_modificacion = NOW()
     WHERE id_curso = $3
  `;

  const result = await pool.query(sql, [ESTADO_ELIMINADO, Number(usuarioId), Number(id)]);
  return result.rowCount;
}

async function listarEstadosActivos() {
  const sql = `
    SELECT id_curso_estado, descripcion
      FROM cursos_estados
     WHERE es_activo = 1
     ORDER BY id_curso_estado
  `;

  const result = await pool.query(sql);
  return result.rows;
}

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar,
  listarEstadosActivos,
  ESTADO_ELIMINADO,
};
