import PDFDocument from 'pdfkit';

export function pipeCertificadoInscripcionPdf(inscripcion, res) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: 'Constancia de Inscripción',
      Author: 'FCAD - UNER',
    },
  });

  doc.pipe(res);

  doc.fontSize(16).font('Helvetica-Bold').text('Universidad Nacional de Entre Ríos', {
    align: 'center',
  });
  doc.moveDown(0.3);
  doc.fontSize(13).font('Helvetica-Bold').text('Facultad de Ciencias de la Administración', {
    align: 'center',
  });
  doc.moveDown(0.5);
  doc.moveTo(doc.page.margins.left, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(1);

  doc.fontSize(12).font('Helvetica-Oblique').fillColor('#555555').text('Constancia de Inscripción', {
    align: 'center',
  });
  doc.fillColor('#000000');
  doc.moveDown(1.5);

  doc.fontSize(11).font('Helvetica').text('Se certifica que el/la estudiante', {
    align: 'center',
  });
  doc.moveDown(0.8);

  const nombreCompleto = `${inscripcion.apellido}, ${inscripcion.nombres}`;
  doc.fontSize(14).font('Helvetica-Bold').text(nombreCompleto, { align: 'center' });
  doc.moveDown(0.6);

  doc.fontSize(11).font('Helvetica').text(`Documento: ${inscripcion.documento}`, { align: 'center' });
  doc.moveDown(0.6);
  doc.text('se encuentra inscripto/a en el curso:', { align: 'center' });
  doc.moveDown(0.8);

  doc.fontSize(13).font('Helvetica-Bold').fillColor('#0d6efd').text(inscripcion.curso_nombre, {
    align: 'center',
  });
  doc.fillColor('#000000');
  doc.moveDown(2);

  const fechaStr = new Date(inscripcion.fecha_hora_inscripcion).toLocaleDateString('es-AR');
  doc.fontSize(9).font('Helvetica').text(`Fecha de inscripción: ${fechaStr}`, {
    align: 'right',
  });

  doc.end();
}
