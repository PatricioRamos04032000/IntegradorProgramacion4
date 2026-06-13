export default class CursoEstadoResponseDTO {
  constructor(estado) {
    this.idCursoEstado = estado.id_curso_estado;
    this.descripcion = estado.descripcion;
  }
}
