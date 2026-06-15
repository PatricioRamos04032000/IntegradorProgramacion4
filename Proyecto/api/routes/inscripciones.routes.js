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
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0, default: 0 }
 *     responses:
 *       200:
 *         description: Lista paginada de inscripciones activas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedInscripcionResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
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
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: Cupo agotado o inscripción duplicada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               cupoAgotado:
 *                 summary: Cupo máximo alcanzado
 *                 value:
 *                   error: El curso ha alcanzado el cupo máximo de inscriptos.
 *               duplicada:
 *                 summary: Inscripción duplicada
 *                 value:
 *                   error: El estudiante ya se encuentra inscripto en este curso.
 *       422:
 *         description: Estudiante o curso no elegible para inscribir
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               estudianteInactivo:
 *                 value:
 *                   error: El estudiante está inactivo; no se puede inscribir.
 *               cursoNoAbierto:
 *                 value:
 *                   error: Solo se puede inscribir en cursos con inscripción abierta.
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
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Inscripción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Inscripción no encontrada.
 *       422:
 *         description: Inscripción, estudiante o curso no elegible para certificado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: La inscripción está cancelada; no se puede emitir certificado.
 *       500:
 *         $ref: '#/components/responses/InternalError'
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
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Inscripción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Inscripción no encontrada.
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
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Inscripción no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Inscripción no encontrada.
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
