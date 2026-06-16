# Sistema de Inscripcion a Cursos -- Trabajo Final Integrador

Trabajo Final Integrador de **Programacion IV (FCAD -- UNER)**, 1er cuatrimestre 2026.

> **API v2 unificada:** todo el backend en `Proyecto/api/` usa **ESM**, capas por responsabilidad (routes, controllers, services, repositories, dtos, validators, transforms, middleware) y rutas bajo **`/api/v2/*`**. Respuestas JSON en **camelCase** vía DTOs.

Para estudiar el proyecto y preparar la presentación oral, ver la carpeta [`docs/`](docs/).

## Stack

- **Runtime:** Node.js (>= 18 recomendado)
- **API:** Express 4 (JSON REST; sin vistas en servidor)
- **Modulos:** ESM (`"type": "module"` en `Proyecto/api/package.json`)
- **Front:** HTML + CSS + JavaScript estatico en `Proyecto/web/` (consumo de la API con `fetch`)
- **UI:** Bootstrap 5 (archivos locales en `web/css/` y `web/js/`)
- **Base de datos:** PostgreSQL (driver oficial `pg`)
- **Autenticacion:** JWT (`Authorization: Bearer ...`)
- **Validacion:** `express-validator` en todos los recursos v2
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
    ├── api/                         Backend Node (Express + capas ESM)
    │   ├── app.js                   Configuracion Express + montaje /api/v2/*
    │   ├── bin/www                  Entry point
    │   ├── package.json             ESM + dependencias
    │   ├── routes/                  *.routes.js (auth, cursos, estudiantes, inscripciones, dashboard)
    │   ├── controllers/             Controllers finos (solo HTTP)
    │   ├── services/                Logica de negocio + BaseService
    │   ├── repositories/            SQL parametrizado (pool unico)
    │   ├── dtos/                    snake_case (BD) -> camelCase (API)
    │   ├── validators/              express-validator por recurso
    │   ├── transforms/              req.filter / order / limit / offset
    │   ├── middleware/              jwtAuth, asyncHandler, errorHandlers, handleValidationErrors
    │   ├── db/pool.js               Conexion PostgreSQL
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
        │   ├── auth.js              Access token en sessionStorage + helpers JWT
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

## Arquitectura API v2

Todos los recursos siguen el mismo flujo en capas:

```
Request → Validator → Transform → Controller → Service → Repository → PostgreSQL
                                         ↓
                                   DTO (camelCase) → Response
```

### Convenciones

- **Imports:** ESM (`import`/`export`) en todo `Proyecto/api/`.
- **Pool:** unico en `db/pool.js` (sin sub-modulos por recurso).
- **Errores:** validación `{ errors: [...] }` (400); negocio/auth `{ error: "..." }` (401, 404, 409, 422, 429, 500). Ver [`constants/apiMessages.js`](Proyecto/api/constants/apiMessages.js) y `/docs`.
- **Auditoria:** `req.user.id_usuario` del JWT en operaciones de escritura.

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
| `JWT_SECRET` | ... | Firma del access token JWT |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Duracion del access token |
| `JWT_EXPIRES_IN` | `8h` | Alias legacy de access token |
| `JWT_REFRESH_SECRET` | ... | Firma del refresh token (distinto al access) |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Duracion del refresh token (cookie httpOnly) |
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

La API sirve el front estatico desde `Proyecto/web/`. Al acceder a `http://localhost:3000/` te redirige a login. **Recomendado** para que funcione la cookie httpOnly del refresh token (same-origin).

Tambien podes abrir `Proyecto/web/` con Live Server, ajustando `FRONT_ORIGIN` en `.env` y `API_BASE` en `web/js/config.js` (la renovacion silenciosa de sesion puede no funcionar cross-origin sin HTTPS).

### Migracion de refresh tokens

Ejecutar una vez contra la base configurada en `.env`:

```bash
psql -h localhost -U postgres -d fcad_cursos -f Proyecto/api/migrations/001_refresh_tokens.sql
```

## Rutas API

### Autenticacion

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `POST` | `/api/v2/auth/login` | `{ nombreUsuario, contrasenia }` → `{ accessToken, user }` + cookie refresh |
| `POST` | `/api/v2/auth/refresh` | Renueva access token (cookie refresh) |
| `POST` | `/api/v2/auth/logout` | Revoca refresh y limpia cookie |
| `GET` | `/api/v2/auth/me` | Usuario autenticado (Bearer) |

El resto de rutas v2 requieren `Authorization: Bearer <accessToken>`.

### Recursos v2 (camelCase)

Documentacion Swagger en **[/docs](http://localhost:3000/docs)**.

| Recurso | Rutas base |
|---------|------------|
| Cursos | `/api/v2/cursos` (+ `/estados`) |
| Estudiantes | `/api/v2/estudiantes` |
| Inscripciones | `/api/v2/inscripciones` (+ `/:id/certificado` PDF; detalle con `puedeEmitirCertificado`) |
| Dashboard | `/api/v2/dashboard` — `{ totales, cursosRapidos: { items, total, limit, offset } }` |

#### Cursos

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| `GET` | `/api/v2/cursos` | Listado (`limit`, `offset`, `nombre`, `idCursoEstado`, `order`, `asc`) |
| `GET` | `/api/v2/cursos/estados` | Estados activos |
| `GET` | `/api/v2/cursos/:id` | Detalle |
| `GET` | `/api/v2/cursos/:id/inscriptos` | Inscriptos activos del curso (cada ítem incluye `puedeEmitirCertificado`) |
| `POST` | `/api/v2/cursos` | Alta |
| `PUT` | `/api/v2/cursos/:id` | Edicion |
| `DELETE` | `/api/v2/cursos/:id` | Soft delete |

#### Estudiantes / Inscripciones

Mismos verbos CRUD bajo `/api/v2/estudiantes` e `/api/v2/inscripciones`. Body de inscripcion: `{ idCurso, idEstudiante }`. El detalle `GET /api/v2/inscripciones/:id` incluye `idCursoEstado` y `puedeEmitirCertificado` para habilitar o deshabilitar el botón de certificado en el frontend.

#### Reglas del certificado PDF

`GET /api/v2/inscripciones/:id/certificado` exige:

- Inscripción activa (`id_inscripcion_estado = 1`)
- Estudiante activo
- Curso no eliminado (`cursos_estados.es_activo = 1`)
- Curso en **INSCRIPCIÓN CERRADA** (`id_curso_estado = 3`)

El frontend deshabilita el botón según `puedeEmitirCertificado` en el detalle de inscripción y en el listado de inscriptos del curso.

#### Dashboard

`GET /api/v2/dashboard` devuelve totales del panel y accesos rápidos a cursos:

```json
{
  "totales": { "cursos": 12, "estudiantes": 45, "inscripciones": 78 },
  "cursosRapidos": {
    "items": [{ "idCurso": 1, "nombre": "...", "inscriptosMax": 30, "inscriptosActuales": 15 }],
    "total": 12,
    "limit": 10,
    "offset": 0
  }
}
```

Query params opcionales: `limit` (default 10), `offset` (default 0). Los cursos se ordenan por cantidad de inscriptos activos (mayor a menor).

Los conteos del dashboard consideran solo registros activos. Para cursos, **activo** significa `cursos_estados.es_activo = 1` (BORRADOR, INSCRIPCIÓN ABIERTA o INSCRIPCIÓN CERRADA; excluye ELIMINADO). Ese criterio aplica al dashboard y a los conteos del panel.

**Nueva inscripción:** solo cursos con `id_curso_estado = 2` (INSCRIPCIÓN ABIERTA), curso no eliminado y cupo disponible.

**Certificado PDF:** además de inscripción activa, estudiante activo y curso no eliminado, exige `id_curso_estado = 3` (INSCRIPCIÓN CERRADA). Ver sección *Reglas del certificado PDF* arriba.

**Estudiantes — filtros de listado:** además del atajo `q` (apellido o documento), se pueden combinar `documento`, `apellido`, `nombres` y `email` como query params opcionales (búsqueda parcial con `ILIKE`).

### Soft delete (cursos)

No se hace `DELETE` fisico. El borrado actualiza `id_curso_estado = 4` (estado eliminado, `es_activo = 0`). El listado oculta cursos cuyo estado tiene `es_activo = 0`.

### Auditoria

Cada `INSERT` / `UPDATE` setea `id_usuario_modificacion` con el usuario del JWT (`req.user.id_usuario`).

## Manejo de errores (API v2)

Los errores se muestran en el frontend mediante un **modal de Bootstrap** (popup con header rojo) o mensajes inline según la pantalla.

| Origen del error | Formato de respuesta | Status |
|-----------------|---------------------|--------|
| Validator (`express-validator`) | `{ errors: [{ msg, path, ... }] }` | 400 |
| Auth / JWT (`jwtAuth`, `auth.service`) | `{ error: "..." }` | 401 |
| Recurso no encontrado (service) | `{ error: "..." }` | 404 |
| Conflicto de estado (cupo, duplicado, dependencias) | `{ error: "..." }` | 409 |
| Entidad no elegible para la operación | `{ error: "..." }` | 422 |

Ejemplo 422 del certificado (curso sin inscripción cerrada): `Solo se puede emitir certificado cuando el curso tiene inscripción cerrada.`

| Rate limit login | `{ error: "..." }` | 429 |
| Error interno | `{ error: "..." }` | 500 |
| Error handler global (ruta inexistente) | `{ error: "..." }` | 404 |

Los mensajes de negocio y auth están centralizados en [`Proyecto/api/constants/apiMessages.js`](Proyecto/api/constants/apiMessages.js). La documentación interactiva en `/docs` (Swagger) describe los códigos HTTP por endpoint.

### Errores por recurso (ejemplos)

| Recurso | Operación | Status | Mensaje típico |
|---------|-----------|--------|----------------|
| Inscripciones | POST | 409 | `El curso ha alcanzado el cupo máximo de inscriptos.` |
| Inscripciones | POST | 409 | `El estudiante ya se encuentra inscripto en este curso.` |
| Inscripciones | POST | 422 | `Solo se puede inscribir en cursos con inscripción abierta.` |
| Cursos | PUT | 409 | `No se puede reducir el cupo por debajo de los inscriptos actuales (N).` |
| Cursos | DELETE | 409 | `No se puede eliminar el curso: tiene N inscripto(s) activo(s).` |
| Estudiantes | DELETE | 409 | `No se puede eliminar el estudiante: tiene N inscripción(es) activa(s).` |
| Auth | POST login | 401 | `Credenciales inválidas.` |

El helper `api.js` / `httpError.js` del front detecta `{ error }` y `{ errors }` y extrae el mensaje para mostrarlo al usuario.
