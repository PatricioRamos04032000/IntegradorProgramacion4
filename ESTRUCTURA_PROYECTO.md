# Índice de estructura del proyecto

Documento orientado a desarrolladores que se incorporan al repositorio. Resume **dónde está cada cosa**, **cómo fluye la petición HTTP** y **convenciones** del código.

Para instalación, variables de entorno y restauración de la base de datos, ver el [README.md](./README.md).

---

## 1. Vista general del repositorio

| Ruta (raíz) | Rol |
|-------------|-----|
| [README.md](./README.md) | Stack, puesta en marcha, rutas API v2. |
| [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) | Este índice de arquitectura y carpetas. |
| `dump base programacion.sql` | Esquema y datos de prueba de PostgreSQL. |
| `IntegradorProgramacion4.slnx` | Solución de Visual Studio. |
| `.gitignore` | Excluye `node_modules/`, `.env`, artefactos de IDE. |

La aplicación tiene **dos partes bajo `Proyecto/`**: el backend Node en **`Proyecto/api/`** y el front estático en **`Proyecto/web/`**.

---

## 2. Backend (`Proyecto/api/`)

### 2.1 Árbol principal

```text
Proyecto/api/
├── app.js                    # Express ESM: CORS, helmet, /api/v2/*, static web, Swagger /docs
├── bin/www                   # Punto de entrada (npm start)
├── package.json              # "type": "module"
├── db/pool.js                # Pool PostgreSQL único
├── routes/                   # *.routes.js (auth, cursos, estudiantes, inscripciones, dashboard)
├── controllers/              # HTTP fino (req/res)
├── services/                 # Lógica de negocio + BaseService
├── repositories/             # SQL parametrizado (+ refreshToken.repository.js)
├── migrations/               # SQL incremental (001_refresh_tokens.sql)
├── utils/                    # authCookies.js
├── dtos/                     # snake_case (BD) → camelCase (API)
├── validators/               # express-validator
├── transforms/               # req.filter / order / limit / offset
├── middleware/               # jwtAuth, loginRateLimit, asyncHandler, errorHandlers, handleValidationErrors
└── CHANGELOG.md
```

### 2.2 Front (`Proyecto/web/`)

Sitio estático: HTML por pantalla, Bootstrap 5, módulos ES en `js/` (`config.js`, `api.js`, `auth.js`, `nav.js`, un script por página).

### 2.3 Arranque

1. **`npm start`** (en `Proyecto/api/`) ejecuta **`node ./bin/www`**.
2. **`bin/www`** lee `PORT` (default 3000) y llama a `app.listen`.
3. **`app.js`** exporta Express configurado; sirve el front desde `Proyecto/web/`.

---

## 3. Flujo de una petición (API v2)

```text
Request
  → Validator (express-validator)
  → Transform (filter, order, limit, offset)
  → Controller
  → Service
  → Repository
  → PostgreSQL (pool único)
  → DTO (camelCase) → JSON Response
```

Todas las rutas de negocio bajo `/api/v2/*` (excepto `POST /api/v2/auth/login`, `/refresh`, `/logout`) requieren **`Authorization: Bearer <accessToken>`**. El middleware `jwtAuth` revalida que el usuario siga activo en BD.

---

## 4. Archivos por capa

### 4.1 `routes/`

| Archivo | Montaje | Endpoints principales |
|---------|---------|----------------------|
| `auth.routes.js` | `/api/v2/auth` | `POST /login`, `/refresh`, `/logout`, `GET /me` |
| `cursos.routes.js` | `/api/v2/cursos` | CRUD, `GET /estados`, `GET /:id/inscriptos` |
| `estudiantes.routes.js` | `/api/v2/estudiantes` | CRUD + filtros múltiples en listado |
| `inscripciones.routes.js` | `/api/v2/inscripciones` | Browse/Add/Read/Delete + `GET /:id/certificado` (PDF) |
| `dashboard.routes.js` | `/api/v2/dashboard` | Totales y cursos rápidos |

Documentación OpenAPI en **`/docs`** (JSDoc `@openapi` en cada archivo de rutas).

### 4.2 `controllers/`

| Archivo | Dominio |
|---------|---------|
| `auth.controller.js` | Login, refresh, logout, me |
| `cursos.controller.js` | Cursos + inscriptos por curso |
| `estudiantes.controller.js` | Estudiantes |
| `inscripciones.controller.js` | Inscripciones + certificado PDF |
| `dashboard.controller.js` | Panel |

### 4.3 `services/` y `repositories/`

Un par service/repository por recurso. `cursos.service.js` delega inscriptos a `inscripcion.repository.getActivasByCurso`. `dashboard.repository.js` concentra los conteos del panel. Certificado PDF en `certificadoInscripcionPdf.service.js`; elegibilidad centralizada en `certificado.util.js` (`esElegibleParaCertificado`, `assertElegibleParaCertificado`).

### 4.4 `dtos/`

Incluye `inscripcionCurso.response.dto.js` para el listado de inscriptos activos de un curso y `dashboard*.response.dto.js` para el panel (`totales`, `cursosRapidos`). `InscripcionResponseDTO` e `InscripcionCursoResponseDTO` exponen `puedeEmitirCertificado` para el frontend.

### 4.5 `constants/`

| Archivo | Uso |
|---------|-----|
| `apiMessages.js` | Mensajes de error de negocio y auth (`{ error: "..." }`); fuente única para services y middlewares |

### 4.6 `middleware/`

| Archivo | Uso |
|---------|-----|
| `jwtAuth.js` | Valida Bearer + revalida usuario activo en BD |
| `loginRateLimit.js` | Rate limit en POST /login (5 / 15 min por IP) |
| `asyncHandler.js` | Propaga errores async al error handler |
| `handleValidationErrors.js` | Respuesta 400 con `{ errors: [...] }` |
| `errorHandlers.js` | 404 y errores → JSON `{ error: "..." }` |

**Swagger:** `app.js` define componentes OpenAPI reutilizables (`ErrorResponse`, `ValidationErrorResponse`, responses 400/401/404/409/422/429/500). Cada `routes/*.routes.js` referencia esos componentes en bloques `@openapi`.

---

## 5. Rutas HTTP (referencia rápida)

### Auth

- `POST /api/v2/auth/login` — `{ nombreUsuario, contrasenia }` → `{ accessToken, user }` + cookie refresh httpOnly
- `POST /api/v2/auth/refresh` — renueva access token (cookie)
- `POST /api/v2/auth/logout` — revoca sesion
- `GET /api/v2/auth/me` — usuario autenticado (Bearer)

### Cursos (`/api/v2/cursos`, JWT)

- `GET /` — listado (`nombre`, `idCursoEstado`, `limit`, `offset`, `order`, `asc`)
- `GET /estados` — estados activos
- `GET /:id/inscriptos` — inscriptos activos del curso (cada ítem con `puedeEmitirCertificado`)
- `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id` (soft delete)

### Estudiantes (`/api/v2/estudiantes`, JWT)

- `GET /` — listado con `q`, `documento`, `apellido`, `nombres`, `email`, paginación y orden
- `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`

### Inscripciones (`/api/v2/inscripciones`, JWT)

- `GET /`, `POST /`, `GET /:id` (detalle con `idCursoEstado` y `puedeEmitirCertificado`), `DELETE /:id`
- `GET /:id/certificado` — PDF; requiere curso en INSCRIPCIÓN CERRADA (`id_curso_estado = 3`)

### Dashboard

- `GET /api/v2/dashboard` — `{ totales, cursosRapidos: { items, total, limit, offset } }` (query: `limit`, `offset`)

Criterios de conteo:

| Campo | Criterio |
|-------|----------|
| `totales.cursos` | `cursos_estados.es_activo = 1` (no eliminados) |
| `totales.estudiantes` | `activo = 1` |
| `totales.inscripciones` | `id_inscripcion_estado = 1` (no canceladas) |
| `cursosRapidos` | Cursos activos paginados, ordenados por `inscriptosActuales` DESC |

**Dashboard:** conteos con `cursos_estados.es_activo = 1` (estados 1, 2 y 3; excluye ELIMINADO).

**Nueva inscripción:** `id_curso_estado = 2` (INSCRIPCIÓN ABIERTA), curso no eliminado y cupo disponible.

**Certificado PDF:** inscripción activa, estudiante activo, curso no eliminado y **`id_curso_estado = 3` (INSCRIPCIÓN CERRADA)**. El frontend deshabilita el botón según `puedeEmitirCertificado`.

---

## 6. Variables de entorno

Ver **`Proyecto/api/.env.example`**: `PORT`, `DB_*`, `JWT_*`, `FRONT_ORIGIN`, `DEFAULT_USER_ID`.

---

## 7. Convenciones al sumar código

1. Nueva entidad: `*Repository` → `*Service` → `*Controller` → `*.routes.js` → pantallas en `Proyecto/web/`.
2. Respuestas JSON en **camelCase** vía DTOs.
3. SQL siempre parametrizado; auditoría con `req.user.id_usuario`.
4. Rutas con `:id` numérico: regex `/:id(\\d+)` y validador de param.
5. Documentar endpoints nuevos con bloques `@openapi` en el archivo de rutas.

---

*Última revisión: API v2 unificada en `Proyecto/api/` (ESM, capas, Swagger) y front estático en `Proyecto/web/`.*
