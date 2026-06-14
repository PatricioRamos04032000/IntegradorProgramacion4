import DashboardRepository from '../repositories/dashboard.repository.js';
import DashboardResponseDTO from '../dtos/dashboard.response.dto.js';
import DashboardTotalesResponseDTO from '../dtos/dashboardTotales.response.dto.js';
import DashboardCursoRapidoResponseDTO from '../dtos/dashboardCursoRapido.response.dto.js';

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;

export default class DashboardService {
  constructor() {
    this.repository = new DashboardRepository();
  }

  async getDashboard({ limit = DEFAULT_LIMIT, offset = DEFAULT_OFFSET } = {}) {
    const [
      totalCursos,
      totalEstudiantes,
      totalInscripciones,
      cursosResult,
    ] = await Promise.all([
      this.repository.countCursosActivos(),
      this.repository.countEstudiantesActivos(),
      this.repository.countInscripcionesActivas(),
      this.repository.getCursosRapidos(limit, offset),
    ]);

    return new DashboardResponseDTO({
      totales: new DashboardTotalesResponseDTO({
        cursos: totalCursos,
        estudiantes: totalEstudiantes,
        inscripciones: totalInscripciones,
      }),
      cursosRapidos: {
        items: cursosResult.rows.map((c) => new DashboardCursoRapidoResponseDTO(c)),
        total: cursosResult.total,
        limit,
        offset,
      },
    });
  }
}
