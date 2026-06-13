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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const frontOrigin = process.env.FRONT_ORIGIN || 'http://127.0.0.1:5500';
app.use(
  cors({
    origin: frontOrigin,
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
app.use('/api/v2/cursos', jwtAuth, cursosRouter);
app.use('/api/v2/estudiantes', jwtAuth, estudiantesRouter);
app.use('/api/v2/inscripciones', jwtAuth, inscripcionesRouter);
app.use('/api/v2/dashboard', jwtAuth, dashboardRouter);

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
    },
  },
  apis: [path.join(__dirname, 'routes', '*.routes.js')],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
