import express from 'express';
import CursosController from '../controllers/cursos.controller.js';
import cursosFindAllValidation from '../validators/cursosFindAll.validation.js';
import cursosFindAllTransform from '../transforms/cursosFindAll.transform.js';
import cursosBodyValidation from '../validators/cursosBody.validation.js';
import cursosIdParamValidation from '../validators/cursosIdParam.validation.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();
const cursosController = new CursosController();

/**
 * @openapi
 * /api/v2/cursos:
 *   get:
 *     tags: [Cursos]
 *     summary: Listado paginado de cursos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema: { type: string }
 *       - in: query
 *         name: idCursoEstado
 *         schema: { type: integer, minimum: 1 }
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
 *           enum: [idCurso, nombre, fechaInicio, cantidadHoras, inscriptosMax]
 *       - in: query
 *         name: asc
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista paginada de cursos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedCursoResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags: [Cursos]
 *     summary: Alta de curso
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, descripcion, fechaInicio, cantidadHoras, inscriptosMax, idCursoEstado]
 *             properties:
 *               nombre: { type: string, maxLength: 45 }
 *               descripcion: { type: string }
 *               fechaInicio: { type: string, format: date }
 *               cantidadHoras: { type: integer, minimum: 0 }
 *               inscriptosMax: { type: integer, minimum: 0 }
 *               idCursoEstado: { type: integer, minimum: 1 }
 *     responses:
 *       201:
 *         description: Curso creado
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         description: Estado de curso inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El estado del curso no es válido.
 */

/**
 * @openapi
 * /api/v2/cursos/estados:
 *   get:
 *     tags: [Cursos]
 *     summary: Estados activos de curso
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de estados
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @openapi
 * /api/v2/cursos/{id}/inscriptos:
 *   get:
 *     tags: [Cursos]
 *     summary: Inscriptos activos de un curso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Lista de inscriptos activos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/InscripcionCursoItem'
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Curso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Curso no encontrado.
 */

/**
 * @openapi
 * /api/v2/cursos/{id}:
 *   get:
 *     tags: [Cursos]
 *     summary: Detalle de curso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Curso encontrado
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Curso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Curso no encontrado.
 *   put:
 *     tags: [Cursos]
 *     summary: Edición de curso
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
 *             required: [nombre, descripcion, fechaInicio, cantidadHoras, inscriptosMax, idCursoEstado]
 *             properties:
 *               nombre: { type: string, maxLength: 45 }
 *               descripcion: { type: string }
 *               fechaInicio: { type: string, format: date }
 *               cantidadHoras: { type: integer, minimum: 0 }
 *               inscriptosMax: { type: integer, minimum: 0 }
 *               idCursoEstado: { type: integer, minimum: 1 }
 *     responses:
 *       200:
 *         description: Curso actualizado
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Curso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Curso no encontrado.
 *       409:
 *         description: Cupo menor que inscriptos activos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "No se puede reducir el cupo por debajo de los inscriptos actuales (5)."
 *       422:
 *         description: Estado de curso inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: El estado del curso no es válido.
 *   delete:
 *     tags: [Cursos]
 *     summary: Baja lógica de curso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, minimum: 1 }
 *     responses:
 *       204:
 *         description: Curso eliminado (soft delete)
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Curso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: Curso no encontrado.
 *       409:
 *         description: Curso con inscriptos activos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "No se puede eliminar el curso: tiene 3 inscripto(s) activo(s)."
 */

router.get('/', [cursosFindAllValidation, cursosFindAllTransform], asyncHandler(cursosController.browse));
router.get('/estados', asyncHandler(cursosController.getEstados));
router.get('/:id(\\d+)/inscriptos', cursosIdParamValidation, asyncHandler(cursosController.getInscriptos));
router.get('/:id(\\d+)', cursosIdParamValidation, asyncHandler(cursosController.read));
router.post('/', cursosBodyValidation, asyncHandler(cursosController.add));
router.put('/:id(\\d+)', [cursosIdParamValidation, cursosBodyValidation], asyncHandler(cursosController.edit));
router.delete('/:id(\\d+)', cursosIdParamValidation, asyncHandler(cursosController.remove));

export default router;
