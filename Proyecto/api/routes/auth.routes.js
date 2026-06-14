import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import authLoginValidation from '../validators/authLogin.validation.js';
import asyncHandler from '../middleware/asyncHandler.js';
import loginRateLimit from '../middleware/loginRateLimit.js';
import jwtAuth from '../middleware/jwtAuth.js';

const router = express.Router();
const authController = new AuthController();

/**
 * @openapi
 * /api/v2/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesion y obtener access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombreUsuario, contrasenia]
 *             properties:
 *               nombreUsuario: { type: string }
 *               contrasenia: { type: string, format: password }
 *     responses:
 *       200:
 *         description: Access token y datos del usuario (refresh token en cookie httpOnly)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_usuario: { type: integer }
 *                     nombre_usuario: { type: string }
 *                     nombre: { type: string }
 *                     apellido: { type: string }
 *       401:
 *         description: Credenciales invalidas
 *       429:
 *         description: Demasiados intentos de login
 */

/**
 * @openapi
 * /api/v2/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar access token usando cookie refresh
 *     responses:
 *       200:
 *         description: Nuevo access token y cookie refresh rotada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_usuario: { type: integer }
 *                     nombre_usuario: { type: string }
 *                     nombre: { type: string }
 *                     apellido: { type: string }
 *       401:
 *         description: Refresh token invalido o ausente
 */

/**
 * @openapi
 * /api/v2/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesion y revocar refresh token
 *     responses:
 *       204:
 *         description: Sesion cerrada
 */

/**
 * @openapi
 * /api/v2/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id_usuario: { type: integer }
 *                 nombre_usuario: { type: string }
 *                 nombre: { type: string }
 *                 apellido: { type: string }
 *       401:
 *         description: No autorizado
 */

router.post('/login', loginRateLimit, authLoginValidation, asyncHandler(authController.login));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', asyncHandler(jwtAuth), asyncHandler(authController.me));

export default router;
