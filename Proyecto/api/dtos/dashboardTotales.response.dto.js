export default class DashboardTotalesResponseDTO {
  constructor({ cursos, estudiantes, inscripciones }) {
    this.cursos = cursos;
    this.estudiantes = estudiantes;
    this.inscripciones = inscripciones;
  }
}
