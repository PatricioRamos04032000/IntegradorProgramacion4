export default class CursoResponseDTO {
  constructor(curso) {
    this.idCurso = curso.id_curso;
    this.nombre = curso.nombre;
    this.descripcion = curso.descripcion;
    this.fechaInicio = curso.fecha_inicio;
    this.cantidadHoras = curso.cantidad_horas;
    this.inscriptosMax = curso.inscriptos_max;
    this.idCursoEstado = curso.id_curso_estado;
    this.estado = curso.estado;
    this.idUsuarioModificacion = curso.id_usuario_modificacion;
    this.fechaHoraModificacion = curso.fecha_hora_modificacion;

    if (curso.inscriptos_actuales != null) {
      const inscriptosActuales = Number(curso.inscriptos_actuales);
      this.inscriptosActuales = inscriptosActuales;
      this.plazasDisponibles = Math.max(0, Number(curso.inscriptos_max) - inscriptosActuales);
    }
  }
}
