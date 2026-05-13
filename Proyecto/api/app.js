require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const usersRouter = require('./routes/users');
const cursosRouter = require('./routes/cursos');
const authRouter = require('./routes/auth');
const errorHandlers = require('./middleware/errorHandlers');
const jwtAuth = require('./middleware/jwtAuth');
const asyncHandler = require('./middleware/asyncHandler');
const dashboardController = require('./controllers/dashboardController');

const estudiantesRouter = require('./routes/estudiantes');
const inscripcionesRouter = require('./routes/inscripciones');

const app = express();

const frontOrigin = process.env.FRONT_ORIGIN || 'http://127.0.0.1:5500';
app.use(
  cors({
    origin: frontOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const webRoot = path.join(__dirname, '..', 'web');

app.use('/', authRouter);

// Raíz: siempre login (el panel es /index.html; los datos del panel vienen de GET /dashboard en JSON).
app.get('/', (req, res) => {
  res.redirect(302, '/login.html');
});

app.get('/dashboard', jwtAuth, asyncHandler(dashboardController.getDashboard));

app.use(express.static(webRoot));

app.use('/users', usersRouter);
app.use('/cursos', jwtAuth, cursosRouter);
app.use('/estudiantes', jwtAuth, estudiantesRouter);
app.use('/inscripciones', jwtAuth, inscripcionesRouter);

app.use(errorHandlers.notFoundHandler);
app.use(errorHandlers.errorHandler);

module.exports = app;
