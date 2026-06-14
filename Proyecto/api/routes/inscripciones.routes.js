import express from 'express';
import InscripcionesController from '../controllers/inscripciones.controller.js';
import inscripcionesFindAllValidation from '../validators/inscripcionesFindAll.validation.js';
import inscripcionesFindAllTransform from '../transforms/inscripcionesFindAll.transform.js';
import inscripcionesBodyValidation from '../validators/inscripcionesBody.validation.js';
import inscripcionesIdParamValidation from '../validators/inscripcionesIdParam.validation.js';
import certificadoQueryValidation from '../validators/certificadoQuery.validation.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();
const inscripcionesController = new InscripcionesController();

/**
 * @openapi
 * /api/v2/inscripciones:
 *   get:
 *     tags: [Inscripciones]
 *     summary: Listado paginado de inscripciones activas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Búsqueda por documento, curso o apellido
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 0, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0, default: 0 }
 *     responses:
 *       200:
 *         description: Lista paginada de inscripciones
 *   post:
 *     tags: [Inscripciones]
 *     summary: Alta de inscripción
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idCurso, idEstudiante]
 *             properties:
 *               idCurso: { type: integer, minimum: 1 }
 *               idEstudiante: { type: integer, minimum: 1 }
 *     responses:
 *       201:
 *         description: Inscripción creada
 *       400:
 *         description: Cupo agotado o inscripción duplicada
 */

/**
 * @openapi
 * /api/v2/inscripciones/{id}/certificado:
 *   get:
 *     tags: [Inscripciones]
 *     summary: Descarga certificado PDF de inscripción
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: disposition
 *         required: false
 *         schema:
 *           type: string
 *           enum: [attachment, inline]
 *           default: attachment
 *         description: attachment fuerza descarga; inline permite previsualizar en el navegador
 *     responses:
 *       200:
 *         description: Archivo PDF
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parámetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg: { type: string }
 *       401:
 *         description: Token ausente, inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string }
 *       404:
 *         description: Inscripción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Inscripción no encontrada.
 *       422:
 *         description: Inscripción, estudiante o curso no elegible para certificado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: La inscripción está cancelada; no se puede emitir certificado.
 *       500:
 *         description: Error interno al generar el PDF
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string }
 */

/**
 * @openapi
 * /api/v2/inscripciones/{id}:
 *   get:
 *     tags: [Inscripciones]
 *     summary: Detalle de inscripción
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Inscripción encontrada
 *       404:
 *         description: Inscripción no encontrada
 *   delete:
 *     tags: [Inscripciones]
 *     summary: Cancelación lógica de inscripción
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       204:
 *         description: Inscripción cancelada
 *       404:
 *         description: Inscripción no encontrada
 */

router.get('/', [inscripcionesFindAllValidation, inscripcionesFindAllTransform], asyncHandler(inscripcionesController.browse));
router.post('/', inscripcionesBodyValidation, asyncHandler(inscripcionesController.add));
router.get(
  '/:id(\\d+)/certificado',
  [...inscripcionesIdParamValidation, ...certificadoQueryValidation],
  asyncHandler(inscripcionesController.certificadoPdf),
);
router.get('/:id(\\d+)', inscripcionesIdParamValidation, asyncHandler(inscripcionesController.read));
router.delete('/:id(\\d+)', inscripcionesIdParamValidation, asyncHandler(inscripcionesController.remove));

export default router;
