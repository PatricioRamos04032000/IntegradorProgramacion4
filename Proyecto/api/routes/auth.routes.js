import express from 'express';
import AuthController from '../controllers/auth.controller.js';
import authLoginValidation from '../validators/authLogin.validation.js';
import asyncHandler from '../middleware/asyncHandler.js';

const router = express.Router();
const authController = new AuthController();

/**
 * @openapi
 * /api/v2/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión y obtener JWT
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
 *         description: Token JWT y datos del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_usuario: { type: integer }
 *                     nombre_usuario: { type: string }
 *                     nombre: { type: string }
 *                     apellido: { type: string }
 *       401:
 *         description: Credenciales inválidas
 */

router.post('/login', authLoginValidation, asyncHandler(authController.login));

export default router;
