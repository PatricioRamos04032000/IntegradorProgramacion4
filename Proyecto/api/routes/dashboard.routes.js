import express from 'express';
import DashboardController from '../controllers/dashboard.controller.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();
const dashboardController = new DashboardController();

/**
 * @openapi
 * /api/v2/dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Totales y cursos rápidos del panel
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del dashboard
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalCursos: { type: integer }
 *                 totalEstudiantes: { type: integer }
 *                 cursosRapidos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       idCurso: { type: integer }
 *                       nombre: { type: string }
 *                       inscriptosMax: { type: integer }
 */

router.get('/', asyncHandler(dashboardController.getDashboard));

export default router;
