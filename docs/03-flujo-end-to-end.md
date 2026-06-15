# Flujo end-to-end: desde `npm start` hasta editar un curso

Documento central para **estudiar y presentar** el integrador. Recorre el camino completo: arranque del servidor, navegador, login, pantalla de edición y el viaje **ida y vuelta** por cada capa hasta PostgreSQL.

---

## Mapa de los 5 actos

| Acto | Qué ocurre |
|------|------------|
| 1 | `npm start` levanta Node/Express y el pool de PostgreSQL |
| 2 | El navegador abre `http://localhost:3000` y carga el login |
| 3 | El usuario se autentica (JWT + cookie refresh) |
| 4 | Navega a editar un curso y carga el formulario |
| 5 | Guarda cambios: PUT atraviesa todas las capas hasta la BD y vuelve |

---

## Acto 1 — Arranque del servidor (`npm start`)

### Comando

```bash
cd Proyecto/api
npm start
```

### Qué ejecuta npm

El script `start` en `package.json` corre:

```text
node ./bin/www
```

### Paso a paso interno

1. **`bin/www`** (`Proyecto/api/bin/www`)
   - Lee `PORT` del entorno (default `3000`)
   - Importa la app Express desde `app.js`
   - Crea un servidor HTTP con `http.createServer(app)`
   - Escucha en el puerto → mensaje en consola vía `debug`

2. **`app.js`** (`Proyecto/api/app.js`)
   - Carga variables con `dotenv/config`
   - Configura middlewares: CORS, helmet, morgan, JSON, cookies
   - Redirige `GET /` → `/login.html`
   - Monta routers:
     - `/api/v2/auth` — login público
     - `/api/v2/cursos`, `/estudiantes`, `/inscripciones`, `/dashboard` — con `jwtAuth`
   - Sirve archivos estáticos desde `Proyecto/web/`
   - Expone Swagger en `/docs`

3. **`db/pool.js`**
   - Al importarse, crea un **pool** de conexiones a PostgreSQL
   - Usa `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - Los repositories reutilizan este pool (no abren conexiones sueltas)

### Resultado

El servidor queda escuchando en **`http://localhost:3000`**. API y front comparten el mismo origen.

```mermaid
flowchart TD
    npmStart[npm start] --> binWww[bin/www]
    binWww --> appJs[app.js]
    appJs --> routes[/api/v2 routers]
    appJs --> static[express.static web/]
    appJs --> pool[db/pool.js]
    pool --> PG[(PostgreSQL)]
```

---

## Acto 2 — Navegador abre `http://localhost:3000`

### Secuencia

1. El usuario escribe `http://localhost:3000` en el navegador
2. Express responde con **redirect 302** a `/login.html` (definido en `app.js`)
3. El navegador pide `login.html` + CSS Bootstrap + `login.js` (módulo ES)
4. `login.js` verifica si ya hay access token en `sessionStorage`:
   - Si existe → redirige a `index.html`
   - Si no → muestra el formulario de login

### Archivos involucrados

| Archivo | Rol |
|---------|-----|
| `Proyecto/web/login.html` | Formulario usuario/contraseña |
| `Proyecto/web/js/login.js` | Lógica del submit |
| `Proyecto/web/js/config.js` | `API_BASE = 'http://localhost:3000'` |
| `Proyecto/web/js/auth.js` | Lee/escribe `sessionStorage` |

En este punto **no hay comunicación con la BD** todavía: solo se sirven archivos estáticos.

---

## Acto 3 — Login

### Qué hace el usuario

Completa usuario y contraseña y pulsa "Ingresar".

### Flujo en el navegador

1. `login.js` intercepta el submit del formulario
2. Hace `POST /api/v2/auth/login` con:

```json
{
  "nombreUsuario": "lbianchi",
  "contrasenia": "tu_contraseña"
}
```

3. Opciones del fetch: `credentials: 'include'` (para recibir la cookie), `Content-Type: application/json`
4. Si la respuesta es OK:
   - Guarda `accessToken` en `sessionStorage` (`auth.js`)
   - Guarda nombre de usuario para la navbar
   - Redirige a `index.html`

### Flujo en el servidor

```text
POST /api/v2/auth/login
  → loginRateLimit (máx. 5 intentos / 15 min por IP)
  → authLoginValidation (express-validator)
  → AuthController.login
  → AuthService.login:
       1. Hash SHA-256 de la contraseña
       2. SELECT en usuarios (nombre_usuario + hash + activo=1)
       3. Si no coincide → 401 "Credenciales invalidas"
       4. Emite access JWT (~15 min) y refresh JWT (~7 días, jti UUID)
       5. INSERT en refresh_tokens (jti, id_usuario, expires_at)
  → setRefreshCookie(res, refreshToken)  // httpOnly, path=/api/v2/auth
  → Response 200: { accessToken, user }
```

### Diagrama de secuencia — login

```mermaid
sequenceDiagram
    participant Browser
    participant loginJs as login.js
    participant Express
    participant AuthCtrl as AuthController
    participant AuthSvc as AuthService
    participant PG as PostgreSQL

    Browser->>loginJs: submit formulario
    loginJs->>Express: POST /api/v2/auth/login
    Express->>AuthCtrl: login(req, res)
    AuthCtrl->>AuthSvc: login(nombreUsuario, contrasenia)
    AuthSvc->>AuthSvc: SHA-256 contraseña
    AuthSvc->>PG: SELECT usuarios
    PG-->>AuthSvc: fila usuario
    AuthSvc->>PG: INSERT refresh_tokens
    AuthSvc-->>AuthCtrl: accessToken + refreshToken + user
    AuthCtrl->>Browser: Set-Cookie refreshToken + JSON
    loginJs->>loginJs: sessionStorage accessToken
    loginJs->>Browser: redirect index.html
```

### Respuesta exitosa (ejemplo)

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id_usuario": 1,
    "nombre_usuario": "lbianchi",
    "nombre": "Laura",
    "apellido": "Bianchi"
  }
}
```

Además, el navegador guarda la cookie **`refreshToken`** (httpOnly, no visible desde JavaScript).

### Archivos clave

| Capa | Archivo |
|------|---------|
| Front | `Proyecto/web/js/login.js`, `auth.js` |
| Routes | `Proyecto/api/routes/auth.routes.js` |
| Controller | `Proyecto/api/controllers/auth.controller.js` |
| Service | `Proyecto/api/services/auth.service.js` |
| Repository | `usuario.repository.js`, `refreshToken.repository.js` |
| Cookies | `Proyecto/api/utils/authCookies.js` |

---

## Acto 4 — Navegar a editar un curso

### Navegación del usuario

1. Desde el menú o listado, va a **`cursos.html`**
2. Elige un curso y hace clic en **Editar**
3. El navegador abre **`cursos-editar.html?id=5`** (ejemplo con id 5)

### Al cargar la página

`cursos-editar.js` ejecuta en `DOMContentLoaded`:

**Paso A — Verificar sesión (`requireAuth.js`)**

```javascript
await requireAuth();
```

- Si no hay token o está expirado → intenta refresh con la cookie
- Si refresh falla → redirect a `login.html`
- Si hay token → llama `GET /api/v2/auth/me` para confirmar sesión

**Paso B — Cargar datos del formulario (en paralelo)**

```javascript
const [curso, estados] = await Promise.all([
  api.get(`/api/v2/cursos/${id}`),
  api.get('/api/v2/cursos/estados'),
]);
```

Cada llamada pasa por `api.js`:
- Añade `Authorization: Bearer <accessToken>`
- Envía `credentials: 'include'`
- Si recibe **401** → `POST /api/v2/auth/refresh` → reintenta con nuevo token

**Paso C — Rellenar el DOM**

- Campos de texto con datos del curso
- `<select>` de estados con opciones de `GET /estados`

### Viaje de `GET /api/v2/cursos/5` (carga inicial)

```text
api.get → fetch con Bearer
  → jwtAuth (verifica JWT + usuario activo en BD)
  → cursosIdParamValidation (:id numérico)
  → CursosController.read
  → CursosService.getById(5)
  → CursosRepository.getById → SELECT ... JOIN cursos_estados
  → CursoResponseDTO → JSON camelCase
  → cursos-editar.js rellena inputs
```

---

## Acto 5 — Guardar edición (viaje completo ida y vuelta)

Este es el **núcleo de la presentación**: el usuario modifica campos y pulsa Guardar.

### En el navegador (ida — request)

1. `cursos-editar.js` previene el submit default y arma el body:

```json
{
  "nombre": "Programación IV Avanzada",
  "descripcion": "Contenidos actualizados del cuatrimestre",
  "fechaInicio": "2026-03-15",
  "cantidadHoras": 64,
  "inscriptosMax": 30,
  "idCursoEstado": 2
}
```

2. Llama:

```javascript
await api.put(`/api/v2/cursos/${id}`, body);
```

3. `api.js` envía:

```http
PUT /api/v2/cursos/5 HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
Cookie: refreshToken=...

{ "nombre": "...", ... }
```

### En el servidor (ida — procesamiento)

```text
Express recibe PUT /api/v2/cursos/5
  │
  ├─ jwtAuth
  │    • Extrae Bearer token
  │    • jwt.verify(JWT_SECRET)
  │    • SELECT usuario activo → req.user.id_usuario
  │
  ├─ cursosIdParamValidation → req.params.id = 5
  │
  ├─ cursosBodyValidation → body válido (tipos, rangos, campos requeridos)
  │
  ├─ CursosController.edit
  │    • service.update(5, req.body, req.user.id_usuario)
  │
  ├─ CursosService.update
  │    • assertEstadoValido(idCursoEstado) → SELECT cursos_estados
  │    • contarInscriptosActivos(5) → si inscriptosMax < count → 409
  │    • Mapea camelCase → snake_case para BD
  │    • repository.update(...)
  │    • Si rowCount = 0 → 404
  │    • return getById(5) → CursoResponseDTO
  │
  └─ CursosRepository.update
       • UPDATE cursos SET ... id_usuario_modificacion, fecha_hora_modificacion = NOW()
       • WHERE id_curso = 5
       • PostgreSQL persiste la fila
```

### En el servidor (vuelta — response)

```text
PostgreSQL devuelve fila actualizada (via SELECT en getById)
  → Repository: fila snake_case
  → Service: new CursoResponseDTO(curso)
  → Controller: res.json(curso)  // HTTP 200
  → Express envía JSON
```

### Respuesta exitosa (ejemplo)

```json
{
  "idCurso": 5,
  "nombre": "Programación IV Avanzada",
  "descripcion": "Contenidos actualizados del cuatrimestre",
  "fechaInicio": "2026-03-15T03:00:00.000Z",
  "cantidadHoras": 64,
  "inscriptosMax": 30,
  "idCursoEstado": 2,
  "estado": "INSCRIPCIÓN ABIERTA",
  "idUsuarioModificacion": 1,
  "fechaHoraModificacion": "2026-06-15T14:30:00.000Z",
  "inscriptosActuales": 12,
  "plazasDisponibles": 18
}
```

### En el navegador (vuelta — UI)

1. `api.js` parsea JSON con `parseResponse`
2. `cursos-editar.js` recibe el curso actualizado
3. Redirige a **`cursos-detalle.html?id=5`**

Si hay error de validación o negocio, muestra un modal Bootstrap con el mensaje.

### Diagrama de secuencia — PUT editar curso

```mermaid
sequenceDiagram
    participant Browser
    participant cursosEditar as cursos-editar.js
    participant apiJs as api.js
    participant Express
    participant jwtAuth
    participant Controller as CursosController
    participant Service as CursosService
    participant Repo as CursosRepository
    participant PG as PostgreSQL

    Browser->>cursosEditar: submit formulario
    cursosEditar->>apiJs: put /api/v2/cursos/5
    apiJs->>Express: PUT + Bearer + cookie
    Express->>jwtAuth: verificar token
    jwtAuth->>PG: SELECT usuario activo
    jwtAuth->>Controller: req.user
    Controller->>Service: update(5, body, userId)
    Service->>Repo: contarInscriptosActivos + UPDATE
    Repo->>PG: SQL parametrizado
    PG-->>Repo: OK
    Service->>Repo: getById(5)
    Repo->>PG: SELECT
    PG-->>Repo: fila snake_case
    Repo-->>Service: fila
    Service-->>Controller: CursoResponseDTO
    Controller-->>apiJs: JSON 200 camelCase
    apiJs-->>cursosEditar: curso
    cursosEditar->>Browser: redirect cursos-detalle.html
```

---

## Tabla resumen: capa → archivo → función (PUT completo)

| # | Capa | Archivo | Qué hace en el PUT |
|---|------|---------|-------------------|
| 1 | UI | `Proyecto/web/cursos-editar.html` | Formulario HTML |
| 2 | Front | `Proyecto/web/js/cursos-editar.js` | Arma body, llama `api.put`, redirect |
| 3 | Cliente HTTP | `Proyecto/web/js/api.js` | fetch + Bearer + auto-refresh 401 |
| 4 | Config | `Proyecto/web/js/config.js` | `API_BASE` |
| 5 | Auth storage | `Proyecto/web/js/auth.js` | Lee access token |
| 6 | Montaje | `Proyecto/api/app.js` | `jwtAuth` + `/api/v2/cursos` |
| 7 | Routes | `Proyecto/api/routes/cursos.routes.js` | `router.put('/:id', ...)` |
| 8 | Validator | `cursosIdParam.validation.js` | Valida `:id` entero |
| 9 | Validator | `cursosBody.validation.js` | Valida campos del body |
| 10 | Controller | `cursos.controller.js` | `edit()` → `service.update` |
| 11 | Service | `cursos.service.js` | Reglas cupo/estado, mapeo nombres |
| 12 | Repository | `cursos.repository.js` | `UPDATE cursos ...` |
| 13 | Pool | `db/pool.js` | Conexión a PostgreSQL |
| 14 | DTO | `curso.response.dto.js` | snake_case → camelCase |
| 15 | BD | Tabla `cursos` | Persistencia + auditoría |

---

## Errores posibles (para la defensa oral)

| HTTP | Cuándo | Mensaje típico | Capa que lo genera |
|------|--------|----------------|-------------------|
| 401 | Sin token, token expirado o usuario inactivo | `No autorizado: token ausente...` | `jwtAuth` |
| 400 | Body inválido (campo faltante, tipo incorrecto) | `{ errors: [...] }` | Validators |
| 404 | Curso id inexistente o estado eliminado en listados | `Curso no encontrado` | Service |
| 409 | `inscriptosMax` menor que inscriptos activos | `No se puede reducir el cupo...` | Service |
| 422 | `idCursoEstado` no existe o no está activo | `El estado del curso no es válido` | Service |
| 429 | Demasiados intentos de login | Rate limit | `loginRateLimit` |

---

## Preguntas que puede hacer el profesor (y dónde está la respuesta)

| Pregunta | Respuesta corta |
|----------|-----------------|
| ¿Por qué same-origin (puerto 3000)? | Para que la cookie httpOnly del refresh funcione sin problemas de CORS |
| ¿Dónde está la lógica de negocio? | En `services/`, no en controllers ni repositories |
| ¿Cómo se protege contra SQL injection? | SQL parametrizado con `$1`, `$2` en repositories |
| ¿Cómo se renueva la sesión sin relogin? | `api.js` llama `/auth/refresh` con la cookie; rota el refresh en BD |
| ¿Por qué camelCase en JSON y snake_case en BD? | Convención API vs PostgreSQL; DTOs y Service traducen |
| ¿Qué pasa al "eliminar" un curso? | Soft delete: `id_curso_estado = 4` (ELIMINADO) |

---

## Cómo practicar la demo en vivo

1. Terminal: `cd Proyecto/api && npm start`
2. Navegador: `http://localhost:3000` → login
3. Ir a Cursos → Editar uno existente
4. Cambiar nombre o cupo → Guardar
5. (Opcional) Abrir DevTools → Network y mostrar el PUT con Bearer
6. (Opcional) Mostrar Swagger en `/docs` con el mismo endpoint
7. (Opcional) Mencionar que en PostgreSQL se actualizó `fecha_hora_modificacion`

---

## Documentos relacionados

- [01-guia-tecnologias.md](./01-guia-tecnologias.md) — qué es cada tecnología
- [02-arquitectura-capas.md](./02-arquitectura-capas.md) — detalle de capas y esquema BD
- [README.md](../README.md) — instalación y endpoints
- [comousarellogin.txt](../comousarellogin.txt) — probar auth desde consola del navegador
