const estudianteRepository = require('../repositories/estudianteRepository');

function getUsuarioActual() {
  return Number(process.env.DEFAULT_USER_ID) || 1;
}

async function listarPaginado(searchQuery, page, pageSize) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const size = Math.max(1, parseInt(pageSize, 10) || 10);
  const offset = (pageNum - 1) * size;
  return estudianteRepository.listar(searchQuery || '', size, offset);
}

async function obtenerPorId(id) {
  return estudianteRepository.obtener(id);
}

async function crear(data) {
  return estudianteRepository.crear(data, getUsuarioActual());
}

async function actualizar(id, data) {
  return estudianteRepository.actualizar(id, data, getUsuarioActual());
}

async function eliminar(id) {
  return estudianteRepository.eliminar(id, getUsuarioActual());
}

module.exports = {
  listarPaginado,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};
