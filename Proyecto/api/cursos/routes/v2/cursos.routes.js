import express from "express";
import CursosController from "../../controllers/cursos.controller.js";
import cursosFindAllValidation from "../../validators/cursosFindAll.validation.js";
import cursosFindAllTransform from "../../transforms/cursosFindAll.transform.js";
import cursosBodyValidation from "../../validators/cursosBody.validation.js";
import cursosIdParamValidation from "../../validators/cursosIdParam.validation.js";
import asyncHandler from "../../middleware/asyncHandler.js";

const router = express.Router();
const cursosController = new CursosController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Curso:
 *       type: object
 *       required:
 *         - idCurso
 *         - nombre
 *         - descripcion
 *         - fechaInicio
 *         - cantidadHoras
 *         - inscriptosMax
 *         - idCursoEstado
 *         - estado
 *         - idUsuarioModificacion
 *         - fechaHoraModificacion
 *       properties:
 *         idCurso:
 *           type: integer
 *           description: ID del curso
 *         nombre:
 *           type: string
 *           description: Nombre del curso
 *         descripcion:
 *           type: string
 *           description: Descripción del curso
 *         fechaInicio:
 *           type: string
 *           format: date
 *           description: Fecha de inicio del curso
 *         cantidadHoras:
 *           type: integer
 *           description: Cantidad de horas del curso
 *         inscriptosMax:
 *           type: integer
 *           description: Cupo máximo de inscriptos
 *         idCursoEstado:
 *           type: integer
 *           description: ID del estado del curso
 *         estado:
 *           type: string
 *           description: Descripción del estado
 *         idUsuarioModificacion:
 *           type: integer
 *           description: ID del usuario que realizó la última modificación
 *         fechaHoraModificacion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la última modificación
 *       example:
 *         idCurso: 1
 *         nombre: "Programación 4"
 *         descripcion: "Curso de programación avanzada"
 *         fechaInicio: "2026-03-01"
 *         cantidadHoras: 120
 *         inscriptosMax: 30
 *         idCursoEstado: 1
 *         estado: "Habilitado"
 *         idUsuarioModificacion: 1
 *         fechaHoraModificacion: "2026-01-15T10:30:00.000Z"
 *
 *     CursoEstado:
 *       type: object
 *       properties:
 *         idCursoEstado:
 *           type: integer
 *         descripcion:
 *           type: string
 *       example:
 *         idCursoEstado: 1
 *         descripcion: "Habilitado"
 *
 *     CursoInput:
 *       type: object
 *       required:
 *         - nombre
 *         - descripcion
 *         - fechaInicio
 *         - cantidadHoras
 *         - inscriptosMax
 *         - idCursoEstado
 *       properties:
 *         nombre:
 *           type: string
 *           maxLength: 45
 *         descripcion:
 *           type: string
 *         fechaInicio:
 *           type: string
 *           format: date
 *         cantidadHoras:
 *           type: integer
 *           minimum: 0
 *         inscriptosMax:
 *           type: integer
 *           minimum: 0
 *         idCursoEstado:
 *           type: integer
 *           minimum: 1
 *
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *       example:
 *         error: "Curso no encontrado"
 */

/**
 * @swagger
 * /api/v2/cursos:
 *   get:
 *     summary: Obtiene una lista de cursos con paginación, filtrado y ordenación
 *     tags: [Cursos]
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre (búsqueda parcial)
 *       - in: query
 *         name: idCursoEstado
 *         schema:
 *           type: integer
 *         description: Filtrar por estado del curso
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 10
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Desplazamiento para paginación
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [idCurso, nombre, fechaInicio, cantidadHoras, inscriptosMax]
 *           default: idCurso
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: asc
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Orden ascendente (true) o descendente (false)
 *     responses:
 *       200:
 *         description: Lista de cursos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Curso'
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *       400:
 *         description: Parámetros de consulta inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.get("/", [cursosFindAllValidation, cursosFindAllTransform], asyncHandler(cursosController.browse.bind(cursosController)));

/**
 * @swagger
 * /api/v2/cursos/estados:
 *   get:
 *     summary: Obtiene los estados activos de cursos
 *     tags: [Cursos]
 *     responses:
 *       200:
 *         description: Lista de estados obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CursoEstado'
 *       500:
 *         description: Error interno del servidor
 */
router.get("/estados", asyncHandler(cursosController.getEstados.bind(cursosController)));

/**
 * @swagger
 * /api/v2/cursos/{id}:
 *   get:
 *     summary: Obtiene un curso por su ID
 *     tags: [Cursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     responses:
 *       200:
 *         description: Curso obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Curso'
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/:id(\\d+)", cursosIdParamValidation, asyncHandler(cursosController.read.bind(cursosController)));

/**
 * @swagger
 * /api/v2/cursos:
 *   post:
 *     summary: Crea un nuevo curso
 *     tags: [Cursos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CursoInput'
 *     responses:
 *       201:
 *         description: Curso creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Curso'
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post("/", cursosBodyValidation, asyncHandler(cursosController.add.bind(cursosController)));

/**
 * @swagger
 * /api/v2/cursos/{id}:
 *   put:
 *     summary: Actualiza un curso existente
 *     tags: [Cursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CursoInput'
 *     responses:
 *       200:
 *         description: Curso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Curso'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put("/:id(\\d+)", [cursosIdParamValidation, cursosBodyValidation], asyncHandler(cursosController.edit.bind(cursosController)));

/**
 * @swagger
 * /api/v2/cursos/{id}:
 *   delete:
 *     summary: Elimina un curso (soft delete)
 *     tags: [Cursos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del curso
 *     responses:
 *       204:
 *         description: Curso eliminado exitosamente
 *       404:
 *         description: Curso no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete("/:id(\\d+)", cursosIdParamValidation, asyncHandler(cursosController.remove.bind(cursosController)));

export default router;
