import { esElegibleParaCertificado } from '../utils/certificado.util.js';

export default class InscripcionCursoResponseDTO {
  constructor(inscripcion) {
    this.idInscripcion = inscripcion.id_inscripcion;
    this.idEstudiante = inscripcion.id_estudiante;
    this.apellido = inscripcion.apellido;
    this.nombres = inscripcion.nombres;
    this.documento = inscripcion.documento;
    this.fechaHoraInscripcion = inscripcion.fecha_hora_inscripcion;
    this.puedeEmitirCertificado = esElegibleParaCertificado(inscripcion).ok;
  }
}
