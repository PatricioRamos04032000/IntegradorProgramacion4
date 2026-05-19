# Sistema de Inscripcion a Cursos -- Trabajo Final Integrador

Trabajo Final Integrador de **Programacion IV (FCAD -- UNER)**, 1er cuatrimestre 2026.

> **Segunda entrega (18/05/2026):** se migra el BREAD de **Cursos** a una arquitectura en capas con buenas practicas (ESM + clases, DTOs camelCase, validators con express-validator, transforms, Swagger, helmet). El resto del proyecto (estudiantes, inscripciones, auth, dashboard) mantiene la estructura original en CommonJS.

## Stack

- **Runtime:** Node.js (>= 18 recomendado)
- **API:** Express 4 (JSON REST; sin vistas en servidor)
- **Front:** HTML + CSS + JavaScript estatico en `Proyecto/web/` (consumo de la API con `fetch`)
- **UI:** Bootstrap 5 (archivos locales en `web/css/` y `web/js/`)
- **Base de datos:** PostgreSQL (driver oficial `pg`)
- **Autenticacion:** JWT (`Authorization: Bearer ...`)
- **Validacion:** `express-validator` (en el modulo de cursos)
- **Seguridad:** `helmet` (headers HTTP de seguridad)
- **Documentacion API:** Swagger UI (`swagger-jsdoc` + `swagger-ui-express`) en `/docs`
- **Configuracion:** `dotenv`
- **CORS:** paquete `cors` en `Proyecto/api/app.js`, origen desde `FRONT_ORIGIN`

## Estructura del repositorio

```text
.
├── dump base programacion.sql       Dump de la BD (esquema + datos de prueba)
├── README.md
├── comousarellogin.txt              Ejemplos de login y fetch con JWT
├── IntegradorProgramacion4.slnx     Solucion de Visual Studio
└── Proyecto/
    ├── api/                         Backend Node (Express + capas)
    │   ├── app.js                   Factory async createApp() -- monta todo
    │   ├── bin/www                  Entry point (invoca createApp)
    │   ├── package.json             CommonJS + dependencias
    │   │
    │   ├── cursos/                  *** Modulo ESM con buenas practicas ***
    │   │   ├── package.json         { "type": "module" }
    │   │   ├── index.js             Export del router
    │   │   ├── controllers/
    │   │   │   └── cursos.controller.js    Clase CursosController
    │   │   ├── services/
    │   │   │   ├── base.service.js         BaseService (mapKeysToColumns)
    │   │   │   └── cursos.service.js       CursosService (KEYS_MAP + logica)
    │   │   ├── repositories/
    │   │   │   ├── database.js             Pool pg (BdUtils)
    │   │   │   └── cursos.repository.js    SQL parametrizado
    │   │   ├── dtos/
    │   │   │   ├── curso.response.dto.js           snake_case -> camelCase
    │   │   │   └── cursoEstado.response.dto.js
    │   │   ├── validators/
    │   │   │   ├── cursosFindAll.validation.js     Query params (GET)
    │   │   │   ├── cursosBody.validation.js        Body (POST/PUT)
    │   │   │   └── cursosIdParam.validation.js     Param :id
    │   │   ├── transforms/
    │   │   │   └── cursosFindAll.transform.js      req.filter/order/limit/offset
    │   │   ├── middleware/
    │   │   │   └── asyncHandler.js                 Version ESM
    │   │   └── routes/v2/
    │   │       └── cursos.routes.js                Router + JSDoc Swagger
    │   │
    │   ├── controllers/             Controladores CJS (auth, dashboard, estudiantes, inscripciones)
    │   ├── services/                Servicios CJS
    │   ├── repositories/            Repositorios CJS (+ cursoRepository.js legacy)
    │   ├── routes/                  Rutas CJS (auth, estudiantes, inscripciones, users)
    │   ├── middleware/              Middlewares CJS (jwtAuth, errorHandlers, etc.)
    │   ├── db/                      pool.js (conexion PostgreSQL)
    │   ├── .env                     (no se commitea)
    │   └── .env.example
    │
    └── web/                         Front estatico
        ├── css/
        │   ├── bootstrap.min.css    Bootstrap 5.3.3 local
        │   └── estilo.css
        ├── js/
        │   ├── bootstrap.bundle.min.js  Bootstrap JS local
        │   ├── api.js               Helper fetch con JWT
        │   ├── auth.js              Token en sessionStorage
        │   ├── config.js            API_BASE
        │   ├── cursos.js            Listado (paginacion, filtros, modal errores)
        │   ├── cursos-nuevo.js      Crear curso
        │   ├── cursos-editar.js     Editar curso
        │   ├── cursos-detalle.js    Detalle curso
        │   └── ...                  (estudiantes, inscripciones, login, etc.)
        ├── cursos.html
        ├── cursos-nuevo.html
        ├── cursos-editar.html
        ├── cursos-detalle.html
        └── ...                      (index, login, estudiantes, inscripciones)
```

## Arquitectura de cursos (buenas practicas)

El modulo de cursos sigue una arquitectura en capas inspirada en las mejores practicas de la materia:

```
Request → Validator (express-validator) → Transform → Controller → Service → Repository → PostgreSQL
                                                         ↓
                                                   DTO (camelCase) → Response
```

### Capas

| Capa | Responsabilidad |
|------|----------------|
| **Validators** | Validan query params (GET), body (POST/PUT) y params (:id) con `express-validator`. Responden 400 con `{ errors: [...] }` si hay errores. |
| **Transforms** | Transforman los query params validados en `req.filter`, `req.order`, `req.limit`, `req.offset` para que el controller los consuma de forma uniforme. |
| **Controller** | Recibe la request, delega al service y devuelve la response. Maneja errores 404/500. |
| **Service** | Logica de negocio. Usa `BaseService.mapKeysToColumns` para traducir claves camelCase a snake_case de la BD. Convierte resultados a DTOs. |
| **Repository** | Acceso a datos con SQL parametrizado. Usa `BdUtils.createConnection()` para obtener un client del pool. |
| **DTOs** | `CursoResponseDTO` y `CursoEstadoResponseDTO` mapean campos de snake_case (BD) a camelCase (API). |

### Convivencia ESM / CJS

La subcarpeta `api/cursos/` tiene su propio `package.json` con `"type": "module"`, lo que permite usar `import/export` y clases ES6. El resto del backend sigue en CommonJS. El puente es `await import('./cursos/index.js')` en `app.js`.

## Puesta en marcha

### 1. Restaurar la base de datos

Asegurate de tener PostgreSQL corriendo y crea la base (por defecto `programacion4`):

```sql
CREATE DATABASE programacion4;
```

Restaura el dump:

```bash
psql -U postgres -d programacion4 -f "dump base programacion.sql"
```

### 2. Configurar variables de entorno

```bash
cd Proyecto/api
cp .env.example .env
```

| Variable | Default | Descripcion |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto de la API |
| `FRONT_ORIGIN` | `http://127.0.0.1:5500` | Origen permitido por CORS |
| `DB_*` | ... | Conexion a PostgreSQL |
| `JWT_SECRET` | ... | Firma de tokens JWT |
| `JWT_EXPIRES_IN` | `8h` | Duracion del token |
| `DEFAULT_USER_ID` | `1` | Reservado para auditoria sin JWT |

> `.env` esta en el `.gitignore` y no se sube al repo.

### 3. Instalar dependencias y levantar la API

```bash
cd Proyecto/api
npm install
npm start
```

La API queda en [http://localhost:3000](http://localhost:3000).

### 4. Levantar el front

La API sirve el front estatico desde `Proyecto/web/`. Al acceder a `http://localhost:3000/` te redirige a login.

Tambien podes abrir `Proyecto/web/` con Live Server, ajustando `FRONT_ORIGIN` en `.env` y `API_BASE` en `web/js/config.js`.

## Rutas API

### Autenticacion

`POST /login` con JSON `{ nombre_usuario, contrasenia }` -- devuelve `{ token, user }`.

El resto de rutas requieren `Authorization: Bearer <token>`.

### Cursos (v2 -- buenas practicas)

Todos los campos en **camelCase** via DTOs. Documentacion Swagger disponible en **[/docs](http://localhost:3000/docs)**.

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/v2/cursos` | Listado con paginacion (`limit`, `offset`), filtrado (`nombre`, `idCursoEstado`) y ordenacion (`order`, `asc`) |
| `GET` | `/api/v2/cursos/estados` | Estados activos para combos |
| `GET` | `/api/v2/cursos/:id` | Detalle de un curso |
| `POST` | `/api/v2/cursos` | Crear curso (body: `{ nombre, descripcion, fechaInicio, cantidadHoras, inscriptosMax, idCursoEstado }`) |
| `PUT` | `/api/v2/cursos/:id` | Actualizar curso (mismo body) |
| `DELETE` | `/api/v2/cursos/:id` | Soft delete (cambia estado a eliminado) |

### Estudiantes, Inscripciones y Dashboard (v1 -- estructura original)

| Recurso | Metodos |
|---------|---------|
| `/dashboard` | `GET` -- JSON del panel |
| `/estudiantes` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/inscripciones` | `GET`, `POST`, `GET /:id`, `GET /:id/certificado` (PDF), `DELETE /:id` |

### Soft delete (cursos)

No se hace `DELETE` fisico. El borrado actualiza `id_curso_estado = 4` (estado eliminado, `es_activo = 0`). El listado oculta cursos cuyo estado tiene `es_activo = 0`.

### Auditoria

Cada `INSERT` / `UPDATE` setea `id_usuario_modificacion` con el usuario del JWT (`req.user.id_usuario`).

## Manejo de errores (cursos)

Los errores se muestran en el frontend mediante un **modal de Bootstrap** (popup con header rojo).

| Origen del error | Formato de respuesta | Status |
|-----------------|---------------------|--------|
| Validator (`express-validator`) | `{ errors: [{ msg, path, ... }] }` | 400 |
| Controller (recurso no encontrado) | `{ error: "mensaje" }` | 404 |
| Controller (error interno) | `{ error: "mensaje" }` | 500 |
| Error handler global | `{ error: "mensaje" }` | 404/500 |

El helper `api.js` del front detecta los 3 formatos y extrae el mensaje para mostrarlo en el modal.
