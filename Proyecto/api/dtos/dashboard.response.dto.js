import DashboardTotalesResponseDTO from './dashboardTotales.response.dto.js';
import DashboardCursoRapidoResponseDTO from './dashboardCursoRapido.response.dto.js';

export default class DashboardResponseDTO {
  constructor({ totales, cursosRapidos }) {
    this.totales = totales instanceof DashboardTotalesResponseDTO
      ? totales
      : new DashboardTotalesResponseDTO(totales);

    const items = cursosRapidos.items ?? cursosRapidos;
    this.cursosRapidos = {
      items: items.map(
        (c) => (c instanceof DashboardCursoRapidoResponseDTO ? c : new DashboardCursoRapidoResponseDTO(c)),
      ),
      total: cursosRapidos.total ?? items.length,
      limit: cursosRapidos.limit ?? items.length,
      offset: cursosRapidos.offset ?? 0,
    };
  }
}
