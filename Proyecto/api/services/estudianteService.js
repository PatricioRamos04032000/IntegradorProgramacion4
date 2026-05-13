const estudianteRepository = require('../repositories/estudianteRepository');

async function listarPaginado(searchQuery, page, pageSize) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.max(1, parseInt(pageSize, 10) || 10);
  const offset = (pageNum - 1) * size;
  return estudianteRepository.listar(searchQuery || '', size, offset);
}

async function obtenerPorId(id) {
  return estudianteRepository.obtener(id);
}

async function crear(data, idUsuario) {
  return estudianteRepository.crear(data, idUsuario);
}

async function actualizar(id, data, idUsuario) {
  return estudianteRepository.actualizar(id, data, idUsuario);
}

async function eliminar(id, idUsuario) {
  return estudianteRepository.eliminar(id, idUsuario);
}

module.exports = {
  listarPaginado,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
