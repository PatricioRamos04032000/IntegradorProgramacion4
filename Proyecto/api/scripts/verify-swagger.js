import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiRoot = path.join(__dirname, '..');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: { title: 'Test', version: '1.0.0' },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: { error: { type: 'string' } },
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
            inscriptosActuales: { type: 'integer' },
            plazasDisponibles: { type: 'integer' },
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
          description: 'Conflicto',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        UnprocessableEntity: {
          description: 'No elegible',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        TooManyRequests: {
          description: 'Rate limit',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        InternalError: {
          description: 'Error interno',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  apis: [path.join(apiRoot, 'routes', '*.routes.js')],
};

const doc = swaggerJsdoc(swaggerOptions);
const paths = Object.keys(doc.paths || {});
console.log(`Swagger OK: ${paths.length} paths`);
for (const p of paths.sort()) {
  for (const method of Object.keys(doc.paths[p])) {
    const codes = Object.keys(doc.paths[p][method].responses || {}).sort();
    console.log(`${method.toUpperCase()} ${p} -> ${codes.join(', ')}`);
  }
}
