export default class DashboardCursoRapidoResponseDTO {
  constructor(curso) {
    this.idCurso = curso.id_curso;
    this.nombre = curso.nombre;
    this.inscriptosMax = curso.inscriptos_max;
    this.inscriptosActuales = curso.inscriptos_actuales;
  }
}
