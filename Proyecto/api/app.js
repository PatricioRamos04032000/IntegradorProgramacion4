require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const helmet = require('helmet');

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const errorHandlers = require('./middleware/errorHandlers');
const jwtAuth = require('./middleware/jwtAuth');
const asyncHandler = require('./middleware/asyncHandler');
const dashboardController = require('./controllers/dashboardController');

const estudiantesRouter = require('./routes/estudiantes');
const inscripcionesRouter = require('./routes/inscripciones');

module.exports = async function createApp() {
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

  app.use('/', authRouter);

  app.get('/', (req, res) => {
    res.redirect(302, '/login.html');
  });

  app.get('/dashboard', jwtAuth, asyncHandler(dashboardController.getDashboard));

  app.use(express.static(webRoot));

  app.use('/users', usersRouter);
  app.use('/estudiantes', jwtAuth, estudiantesRouter);
  app.use('/inscripciones', jwtAuth, inscripcionesRouter);

  const { default: cursosRouter } = await import('./cursos/index.js');
  app.use('/api/v2/cursos', jwtAuth, cursosRouter);

  const swaggerJsdoc = (await import('swagger-jsdoc')).default;
  const swaggerUi = await import('swagger-ui-express');

  const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Proyecto Integrador - API',
        version: '2.0.0',
        description: 'API REST con buenas prácticas: DTO, Paginación, Filtrado y Ordenación',
      },
      servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    },
    apis: ['./cursos/routes/v2/*.js'],
  };

  const swaggerDocs = swaggerJsdoc(swaggerOptions);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  app.use(errorHandlers.notFoundHandler);
  app.use(errorHandlers.errorHandler);

  return app;
};
