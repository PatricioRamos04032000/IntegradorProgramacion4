import express from 'express';
import EstudiantesController from '../controllers/estudiantes.controller.js';
import estudiantesFindAllValidation from '../validators/estudiantesFindAll.validation.js';
import estudiantesFindAllTransform from '../transforms/estudiantesFindAll.transform.js';
import estudiantesBodyValidation from '../validators/estudiantesBody.validation.js';
import estudiantesIdParamValidation from '../validators/estudiantesIdParam.validation.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();
const estudiantesController = new EstudiantesController();

/**
 * @openapi
 * /api/v2/estudiantes:
 *   get:
 *     tags: [Estudiantes]
 *     summary: Listado paginado de estudiantes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Atajo de búsqueda por apellido o documento
 *       - in: query
 *         name: documento
 *         schema: { type: string }
 *       - in: query
 *         name: apellido
 *         schema: { type: string }
 *       - in: query
 *         name: nombres
 *         schema: { type: string }
 *       - in: query
 *         name: email
 *         schema: { type: string }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0, default: 0 }
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [idEstudiante, documento, apellido, nombres, email]
 *       - in: query
 *         name: asc
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista paginada de estudiantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedEstudianteResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags: [Estudiantes]
 *     summary: Alta de estudiante
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [documento, apellido, nombres, email, fechaNacimiento]
 *             properties:
 *               documento: { type: string }
 *               apellido: { type: string }
 *               nombres: { type: string }
 *               email: { type: string, format: email }
 *               fechaNacimiento: { type: string, format: date }
 *     responses:
 *       201:
 *         description: Estudiante creado
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: Documento duplicado entre estudiantes activos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Ya existe un estudiante activo con ese documento.
 */

/**
 * @openapi
 * /api/v2/estudiantes/{id}:
 *   get:
 *     tags: [Estudiantes]
 *     summary: Detalle de estudiante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Estudiante encontrado
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Estudiante no encontrado o inactivo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Estudiante no encontrado o inactivo.
 *   put:
 *     tags: [Estudiantes]
 *     summary: Edición de estudiante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [documento, apellido, nombres, email, fechaNacimiento]
 *             properties:
 *               documento: { type: string }
 *               apellido: { type: string }
 *               nombres: { type: string }
 *               email: { type: string, format: email }
 *               fechaNacimiento: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Estudiante actualizado
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Estudiante no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Estudiante no encontrado.
 *       409:
 *         description: Documento duplicado entre estudiantes activos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Ya existe un estudiante activo con ese documento.
 *   delete:
 *     tags: [Estudiantes]
 *     summary: Baja lógica de estudiante
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       204:
 *         description: Estudiante eliminado (soft delete)
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Estudiante no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Estudiante no encontrado.
 *       409:
 *         description: Estudiante con inscripciones activas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "No se puede eliminar el estudiante: tiene 2 inscripción(es) activa(s)."
 */

router.get('/', [estudiantesFindAllValidation, estudiantesFindAllTransform], asyncHandler(estudiantesController.browse));
router.post('/', estudiantesBodyValidation, asyncHandler(estudiantesController.add));
router.get('/:id(\\d+)', estudiantesIdParamValidation, asyncHandler(estudiantesController.read));
router.put('/:id(\\d+)', [estudiantesIdParamValidation, estudiantesBodyValidation], asyncHandler(estudiantesController.edit));
router.delete('/:id(\\d+)', estudiantesIdParamValidation, asyncHandler(estudiantesController.remove));

export default router;
