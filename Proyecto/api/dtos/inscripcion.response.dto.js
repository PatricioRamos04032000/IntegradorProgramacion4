export default class InscripcionResponseDTO {
  constructor(inscripcion) {
    this.idInscripcion = inscripcion.id_inscripcion;
    this.fechaHoraInscripcion = inscripcion.fecha_hora_inscripcion;
    this.cursoNombre = inscripcion.curso_nombre;
    this.apellido = inscripcion.apellido;
    this.nombres = inscripcion.nombres;
    this.documento = inscripcion.documento;
  }
}
