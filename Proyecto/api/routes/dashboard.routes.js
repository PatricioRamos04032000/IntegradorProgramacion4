import express from 'express';
import DashboardController from '../controllers/dashboard.controller.js';
import dashboardQueryValidation from '../validators/dashboardQuery.validation.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();
const dashboardController = new DashboardController();

/**
 * @openapi
 * /api/v2/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Totales y cursos activos del panel
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, minimum: 0, default: 0 }
 *     responses:
 *       200:
 *         description: Datos del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totales:
 *                   type: object
 *                   properties:
 *                     cursos:
 *                       type: integer
 *                       description: Cursos cuyo estado tiene cursos_estados.es_activo = 1
 *                     estudiantes:
 *                       type: integer
 *                       description: Estudiantes con activo = 1
 *                     inscripciones:
 *                       type: integer
 *                       description: Inscripciones con id_inscripcion_estado = 1 (no canceladas)
 *                 cursosRapidos:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           idCurso: { type: integer }
 *                           nombre: { type: string }
 *                           inscriptosMax: { type: integer }
 *                           inscriptosActuales:
 *                             type: integer
 *                             description: Inscriptos activos del curso
 *                     total: { type: integer }
 *                     limit: { type: integer }
 *                     offset: { type: integer }
 *       400:
 *         $ref: '#/components/responses/BadRequestValidation'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

router.get('/', dashboardQueryValidation, asyncHandler(dashboardController.getDashboard));

export default router;
