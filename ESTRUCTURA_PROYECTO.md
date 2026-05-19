# Índice de estructura del proyecto

Documento orientado a desarrolladores que se incorporan al repositorio. Resume **dónde está cada cosa**, **cómo fluye la petición HTTP** y **convenciones** del código.

Para instalación, variables de entorno y restauración de la base de datos, ver el [README.md](./README.md).

---

## 1. Vista general del repositorio

| Ruta (raíz) | Rol |
|-------------|-----|
| [README.md](./README.md) | Enunciado, stack, puesta en marcha, rutas del primer entregable (cursos). |
| [ESTRUCTURA_PROYECTO.md](./ESTRUCTURA_PROYECTO.md) | Este índice de arquitectura y carpetas. |
| `dump base programacion.sql` | Esquema y datos de prueba de PostgreSQL. Restaurar antes de correr la app. |
| `IntegradorProgramacion4.slnx` | Solución de Visual Studio que agrupa el proyecto Node. |
| `bread_cursos_primer_entregable_*.plan.md` | Planificación histórica del primer entregable (referencia). |
| `.gitignore` | Excluye `node_modules/`, `.env`, artefactos de IDE, etc. |

La aplicación tiene **dos partes bajo `Proyecto/`**: el backend Node en **`Proyecto/api/`** y el front estático en **`Proyecto/web/`**.

---

## 2. Carpetas `Proyecto/api/` y `Proyecto/web/`

### 2.1 Backend (`Proyecto/api/`) — árbol principal

```text
Proyecto/api/
├── app.js                    # Express: middlewares, CORS, rutas, manejo de errores JSON
├── bin/
│   └── www                   # Punto de entrada (npm start)
├── package.json
├── package-lock.json
├── .env                      # Configuración local (no versionado)
├── .env.example
├── CHANGELOG.md
├── Proyecto.esproj
├── db/
│   └── pool.js
├── middleware/
│   ├── asyncHandler.js
│   ├── errorHandlers.js      # 404 y errores → JSON
│   └── validateIdParam.js
├── routes/
├── controllers/
├── services/
└── repositories/
```

### 2.2 Front (`Proyecto/web/`)

Sitio estático: HTML por pantalla, `css/estilo.css`, módulos ES en `js/` (`config.js`, `api.js`, `auth.js`, `nav.js`, un script por página).

> **Nota histórica:** el [CHANGELOG.md](./Proyecto/api/CHANGELOG.md) del primer entregable menciona `models/cursoModel.js`. El código actual centraliza el SQL en **`repositories/*Repository.js`** para cursos, estudiantes e inscripciones.

### 2.2 Punto de entrada y arranque

1. **`npm start`** (en `Proyecto/api/`) ejecuta **`node ./bin/www`**.
2. **`bin/www`** crea el servidor HTTP, lee el puerto (`process.env.PORT` o `3000`) y llama a `app.listen`.
3. **`app.js`** exporta la instancia de Express ya configurada (sin escuchar por sí sola).

### 2.3 Stack (resumen)

- **Express 4**, API **JSON** (sin motor de vistas), **PostgreSQL** vía **`pg`** (pool en `db/pool.js`).
- **`dotenv`** al inicio de `app.js` para cargar `.env`.
- **CORS** configurable con `FRONT_ORIGIN` hacia el sitio en `Proyecto/web/`.
- **`morgan`** para log de peticiones en desarrollo, **`cookie-parser`** heredado del generador.

---

## 3. Flujo de una petición (arquitectura en capas)

```text
Cliente (navegador)
    → routes/*.js          (URL + método HTTP)
    → controllers/*.js     (req/res, status, JSON)
    → services/*.js        (lógica de negocio, validaciones de dominio)
    → repositories/*.js    (consultas SQL, uso de pool)
    → db/pool.js           (Pool de PostgreSQL)
```

- **Rutas** deben permanecer delgadas: enlazan path + middleware + función del controlador.
- **Controladores** no deberían contener SQL largo; delegan en **servicios** y estos en **repositorios**.
- **Errores:** en **cursos** se usa `asyncHandler` para propagar rechazos de promesas al `errorHandler` global. En **estudiantes** e **inscripciones** conviene alinear el mismo patrón cuando se refinen esas áreas.

---

## 4. Archivos por capa

### 4.1 `routes/`

| Archivo | Montaje en `app.js` | Responsabilidad |
|---------|---------------------|-----------------|
| *(ver `app.js`)* | `/` | `GET /` redirige a `/login.html`. `GET /dashboard` + JWT devuelve JSON del panel. `express.static` sirve `Proyecto/web/`. |
| `users.js` | `/users` | Placeholder del generador Express (`respond with a resource`). |
| `cursos.js` | `/cursos` | BREAD de cursos con `asyncHandler` y `validateIdParam('id')` en rutas con `:id`. |
| `estudiantes.js` | `/estudiantes` | CRUD JSON; rutas con `/:id(\\d+)` y `validateIdParam`. |
| `inscripciones.js` | `/inscripciones` | Lista, alta, detalle, certificado PDF, borrado lógico. |

### 4.2 `controllers/`

| Archivo | Dominio | Comentario |
|---------|---------|------------|
| `cursosController.js` | Cursos | Listado JSON con `estados`, alta/edición/baja; respuestas `201`/`204` según corresponda. |
| `estudiantesController.js` | Estudiantes | Browse y CRUD JSON. |
| `inscripcionesController.js` | Inscripciones | Lista, alta, detalle JSON, PDF, delete. |
| `dashboardController.js` | Panel | Totales y últimos cursos en JSON. |

### 4.3 `services/`

| Archivo | Rol típico |
|---------|------------|
| `cursoService.js` | Reglas sobre cursos antes/después de persistir. |
| `estudianteService.js` | Idem para estudiantes. |
| `inscripcionService.js` | Idem para inscripciones (p. ej. cupos, estados en evolución del TP). |

### 4.4 `repositories/`

| Archivo | Contenido esperado |
|---------|-------------------|
| `cursoRepository.js` | Queries de listado, detalle, insert/update, soft delete, estados. |
| `estudianteRepository.js` | Acceso a tabla(s) de estudiantes. |
| `inscripcionRepository.js` | Acceso a inscripciones y joins necesarios para listados/detalles. |

### 4.5 `middleware/`

| Archivo | Uso |
|---------|-----|
| `asyncHandler.js` | `asyncHandler(ctrl.metodo)` — evita try/catch repetido en cada acción async. |
| `validateIdParam.js` | Middleware de factoría: `validateIdParam('id')` para IDs numéricos positivos. |
| `errorHandlers.js` | `notFoundHandler` y `errorHandler` registrados al final de `app.js`. |

### 4.6 Front estático (`Proyecto/web/`)

- Páginas HTML por recurso (listados, formularios, detalle).
- `js/config.js`: URL base de la API.
- `js/api.js`: `fetch` con JWT y manejo de `401`.

### 4.7 `db/pool.js`

- Instancia única de `Pool` de `pg` leyendo `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- Listener `pool.on('error', ...)` para errores en clientes inactivos.

---

## 5. Rutas HTTP resumidas (referencia rápida)

Todas las rutas de negocio (salvo `POST /login`, `GET /` y archivos estáticos) esperan cabecera `Authorization: Bearer <JWT>`. El panel en JSON es **`GET /dashboard`**.

### Raíz y panel

- `GET /` — redirección a `/login.html`.
- `GET /dashboard` — totales y últimos cursos (JSON, con JWT).

### Cursos (`/cursos`)

`GET /cursos` (listado + `estados` en el JSON), `POST /cursos`, `GET /cursos/:id`, `PUT /cursos/:id`, `DELETE /cursos/:id` (soft delete). Querystring en listado: `q`, `estado`, `page`, `pageSize`.

### Estudiantes (`/estudiantes`)

`GET /`, `POST /`, `GET /:id`, `PUT /:id`, `DELETE /:id`.

### Inscripciones (`/inscripciones`)

`GET /`, `POST /`, `GET /:id`, `GET /:id/certificado` (PDF), `DELETE /:id`.

---

## 6. Variables de entorno relevantes

Definidas en **`Proyecto/api/.env.example`** (y documentadas en el README):

- `PORT`, `DB_*`, `JWT_*`, `FRONT_ORIGIN`, `DEFAULT_USER_ID` (si aplica en scripts o rutas legacy).

No commitear `.env`; copiar desde `.env.example` y ajustar.

---

## 7. Herramientas de IDE

| Archivo | Propósito |
|---------|-----------|
| `IntegradorProgramacion4.slnx` | Abrir la solución en Visual Studio. |
| `Proyecto/api/Proyecto.esproj` | Nodo del proyecto Express dentro de la solución. |
| `Proyecto/api/.vscode/launch.json` | (Opcional) Depuración: `npm start` desde `Proyecto/api`. |

La carpeta **`.vs/`** en la raíz suele ser local del IDE; está pensada para no versionarse salvo que el equipo decida lo contrario.

---

## 8. Convenciones recomendadas al sumar código

1. **Nuevas entidades:** añadir `*Repository.js` → `*Service.js` → `*Controller.js` → `routes/*.js` → pantallas HTML/JS en `Proyecto/web/`.
2. **IDs en URL:** preferir el mismo criterio que en `cursos` (`validateIdParam` + regex en rutas) para evitar colisiones con segmentos literales.
3. **Mutaciones:** el front usa `fetch` con métodos `POST`/`PUT`/`DELETE` y cuerpo JSON.
4. **SQL:** siempre parametrizado (`$1`, `$2`, …); no concatenar input del usuario en strings SQL.
5. **Auditoría:** con JWT, `req.user.id_usuario` alimenta `id_usuario_modificacion` en los servicios/repositorios.

---

## 9. Próximas líneas del trabajo integrador (contexto)

Según el README, iteraciones futuras incluyen login JWT, dashboard, refinamiento de BREAD (cupo, estados de curso), diplomas PDF y tests. Este documento se puede actualizar cuando esas piezas entren en el repo.

---

*Última revisión: API JSON en `Proyecto/api/` y front estático en `Proyecto/web/`.*
