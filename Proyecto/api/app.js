import 'dotenv/config';

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import authRouter from './routes/auth.routes.js';
import cursosRouter from './routes/cursos.routes.js';
import estudiantesRouter from './routes/estudiantes.routes.js';
import inscripcionesRouter from './routes/inscripciones.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandlers.js';
import jwtAuth from './middleware/jwtAuth.js';
import asyncHandler from './middleware/asyncHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const frontOrigin = process.env.FRONT_ORIGIN || 'http://127.0.0.1:5500';
app.use(
  cors({
    origin: frontOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const webRoot = path.join(__dirname, '..', 'web');

app.get('/', (req, res) => {
  res.redirect(302, '/login.html');
});

app.use('/api/v2/auth', authRouter);
app.use('/api/v2/cursos', asyncHandler(jwtAuth), cursosRouter);
app.use('/api/v2/estudiantes', asyncHandler(jwtAuth), estudiantesRouter);
app.use('/api/v2/inscripciones', asyncHandler(jwtAuth), inscripcionesRouter);
app.use('/api/v2/dashboard', asyncHandler(jwtAuth), dashboardRouter);

app.use(express.static(webRoot));

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Proyecto Integrador - API',
      version: '2.0.0',
      description: 'API REST v2 con capas: validators, DTOs, services, repositories',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
          },
          required: ['error'],
        },
        ValidationErrorItem: {
          type: 'object',
          properties: {
            msg: { type: 'string' },
            path: { type: 'string' },
            location: { type: 'string' },
            type: { type: 'string' },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            errors: {
              type: 'array',
              items: { $ref: '#/components/schemas/ValidationErrorItem' },
            },
          },
          required: ['errors'],
        },
        CursoListItem: {
          type: 'object',
          properties: {
            idCurso: { type: 'integer' },
            nombre: { type: 'string' },
            descripcion: { type: 'string' },
            fechaInicio: { type: 'string', format: 'date' },
            cantidadHoras: { type: 'integer' },
            inscriptosMax: { type: 'integer' },
            idCursoEstado: { type: 'integer' },
            estado: { type: 'string' },
            inscriptosActuales: { type: 'integer' },
            plazasDisponibles: { type: 'integer' },
            idUsuarioModificacion: { type: 'integer' },
            fechaHoraModificacion: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedCursoResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/CursoListItem' },
            },
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
          },
          required: ['items', 'total', 'limit', 'offset'],
        },
        InscripcionListItem: {
          type: 'object',
          properties: {
            idInscripcion: { type: 'integer' },
            fechaHoraInscripcion: { type: 'string', format: 'date-time' },
            cursoNombre: { type: 'string' },
            apellido: { type: 'string' },
            nombres: { type: 'string' },
            documento: { type: 'string' },
          },
        },
        PaginatedInscripcionResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/InscripcionListItem' },
            },
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
          },
          required: ['items', 'total', 'limit', 'offset'],
        },
        InscripcionDetail: {
          type: 'object',
          properties: {
            idInscripcion: { type: 'integer' },
            fechaHoraInscripcion: { type: 'string', format: 'date-time' },
            cursoNombre: { type: 'string' },
            apellido: { type: 'string' },
            nombres: { type: 'string' },
            documento: { type: 'string' },
            idCursoEstado: { type: 'integer' },
            puedeEmitirCertificado: {
              type: 'boolean',
              description:
                'Indica si la inscripción cumple todas las reglas para emitir certificado PDF',
            },
          },
        },
        InscripcionCursoItem: {
          type: 'object',
          properties: {
            idInscripcion: { type: 'integer' },
            idEstudiante: { type: 'integer' },
            apellido: { type: 'string' },
            nombres: { type: 'string' },
            documento: { type: 'string' },
            fechaHoraInscripcion: { type: 'string', format: 'date-time' },
            puedeEmitirCertificado: {
              type: 'boolean',
              description:
                'Indica si la inscripción cumple todas las reglas para emitir certificado PDF',
            },
          },
        },
        EstudianteListItem: {
          type: 'object',
          properties: {
            idEstudiante: { type: 'integer' },
            documento: { type: 'string' },
            apellido: { type: 'string' },
            nombres: { type: 'string' },
            email: { type: 'string' },
            fechaNacimiento: { type: 'string', format: 'date' },
            idUsuarioModificacion: { type: 'integer' },
            fechaHoraModificacion: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedEstudianteResponse: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: '#/components/schemas/EstudianteListItem' },
            },
            total: { type: 'integer' },
            limit: { type: 'integer' },
            offset: { type: 'integer' },
          },
          required: ['items', 'total', 'limit', 'offset'],
        },
      },
      responses: {
        BadRequestValidation: {
          description: 'Parámetros o body inválidos',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ValidationErrorResponse' },
            },
          },
        },
        Unauthorized: {
          description: 'Token ausente, inválido o expirado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { error: 'No autorizado: token ausente o mal formado.' },
            },
          },
        },
        NotFound: {
          description: 'Recurso no encontrado',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        Conflict: {
          description: 'Conflicto de estado (cupo, duplicado, dependencias)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        UnprocessableEntity: {
          description: 'Entidad no elegible para la operación',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        TooManyRequests: {
          description: 'Demasiados intentos',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { error: 'Demasiados intentos de login. Intente más tarde.' },
            },
          },
        },
        InternalError: {
          description: 'Error interno del servidor',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  apis: [path.join(__dirname, 'routes', '*.routes.js')],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
