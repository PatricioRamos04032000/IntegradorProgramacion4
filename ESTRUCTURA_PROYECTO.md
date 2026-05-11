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

La aplicación ejecutable vive en la carpeta **`Proyecto/`** (no en la raíz del repo).

---

## 2. Carpeta `Proyecto/` — aplicación Express

### 2.1 Árbol de directorios (código propio)

```text
Proyecto/
├── app.js                    # Factory de Express: middlewares, rutas, manejo de errores
├── bin/
│   └── www                   # Punto de entrada del proceso Node (npm start)
├── package.json
├── package-lock.json
├── .env                      # Configuración local (no versionado; ver .env.example)
├── .env.example              # Plantilla de variables de entorno
├── CHANGELOG.md              # Notas de cómo se generó el proyecto y primer entregable
├── Proyecto.esproj           # Proyecto para Visual Studio
├── .vscode/
│   └── launch.json           # Depuración desde VS Code / Cursor
├── db/
│   └── pool.js               # Pool de conexiones `pg` hacia PostgreSQL
├── middleware/
│   ├── asyncHandler.js       # Envuelve handlers async y reenvía errores a `next`
│   ├── errorHandlers.js      # 404 + render de `views/error.pug` para errores HTTP
│   └── validateIdParam.js    # Valida que `:id` sea entero positivo (usado en cursos)
├── routes/                   # Definición de URLs y verbos HTTP
├── controllers/              # Orquestación HTTP: params, body, respuesta (render/redirect)
├── services/                 # Reglas de negocio y orquestación sobre repositorios
├── repositories/             # SQL parametrizado y acceso a filas (capa de datos)
├── views/                    # Plantillas Pug (SSR)
└── public/                   # Estáticos servidos por Express (CSS, imágenes, etc.)
```

> **Nota histórica:** el [CHANGELOG.md](./Proyecto/CHANGELOG.md) del primer entregable menciona `models/cursoModel.js`. El código actual centraliza el SQL en **`repositories/*Repository.js`** para cursos, estudiantes e inscripciones.

### 2.2 Punto de entrada y arranque

1. **`npm start`** (definido en `package.json`) ejecuta **`node ./bin/www`**.
2. **`bin/www`** crea el servidor HTTP, lee el puerto (`process.env.PORT` o `3000`) y llama a `app.listen`.
3. **`app.js`** exporta la instancia de Express ya configurada (sin escuchar por sí sola).

### 2.3 Stack (resumen)

- **Express 4**, vistas **Pug**, **PostgreSQL** vía **`pg`** (pool en `db/pool.js`).
- **`dotenv`** al inicio de `app.js` para cargar `.env`.
- **`method-override`** con query/body `_method` para simular **PUT** y **DELETE** desde formularios HTML.
- **`morgan`** para log de peticiones en desarrollo, **`cookie-parser`** heredado del generador.

---

## 3. Flujo de una petición (arquitectura en capas)

```text
Cliente (navegador)
    → routes/*.js          (URL + método HTTP)
    → controllers/*.js     (req/res, status, redirect, render)
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
| `index.js` | `/` | Redirección a `/cursos`. |
| `users.js` | `/users` | Placeholder del generador Express (`respond with a resource`). |
| `cursos.js` | `/cursos` | BREAD de cursos con `asyncHandler` y `validateIdParam('id')` en rutas con `:id`. |
| `estudiantes.js` | `/estudiantes` | BREAD de estudiantes (orden de rutas: `/` y `/nuevo` antes de `/:id`). |
| `inscripciones.js` | `/inscripciones` | Browse, alta, lectura y borrado lógico de inscripciones. |

### 4.2 `controllers/`

| Archivo | Dominio | Comentario |
|---------|---------|------------|
| `cursosController.js` | Cursos | Listado con búsqueda, filtro, paginación; alta/edición/baja lógica. |
| `estudiantesController.js` | Estudiantes | Browse, CRUD UI, detalle. |
| `inscripcionesController.js` | Inscripciones | Lista, alta, detalle, delete lógico. |

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

### 4.6 `views/` (Pug)

| Ruta | Contenido |
|------|-----------|
| `layout.pug` | Layout común (navbar Bootstrap 5 por CDN, bloques `content`). |
| `error.pug` | Página de error HTTP. |
| `index.pug` | Vista raíz del generador (la app redirige a cursos; puede quedar poco usada). |
| `cursos/index.pug`, `show.pug`, `form.pug` | Browse, detalle y formulario de cursos. |
| `estudiantes/*.pug` | `browse`, `add`, `edit`, `read`. |
| `inscripciones/*.pug` | `browse`, `add`, `read`. |

### 4.7 `public/`

- `public/stylesheets/style.css` — estilos globales o ajustes sobre Bootstrap.

### 4.8 `db/pool.js`

- Instancia única de `Pool` de `pg` leyendo `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- Listener `pool.on('error', ...)` para errores en clientes inactivos.

---

## 5. Rutas HTTP resumidas (referencia rápida)

### Cursos (`/cursos`)

Patrón BREAD alineado con el README: listado con querystring (`q`, `estado`, `page`, `pageSize`), formularios, `PUT`/`DELETE` vía `_method`.

### Estudiantes (`/estudiantes`)

`GET /`, `GET /nuevo`, `POST /`, `GET /:id`, `GET /:id/editar`, `PUT /:id`, `DELETE /:id` (confirmar en formularios el uso de `method-override` si aplica).

### Inscripciones (`/inscripciones`)

`GET /`, `GET /nuevo`, `POST /`, `GET /:id`, `DELETE /:id`.

---

## 6. Variables de entorno relevantes

Definidas en **`Proyecto/.env.example`** (y documentadas en el README):

- `PORT`, `DB_*`, `DEFAULT_USER_ID` (usuario de auditoría mientras no exista login JWT).

No commitear `.env`; copiar desde `.env.example` y ajustar.

---

## 7. Herramientas de IDE

| Archivo | Propósito |
|---------|-----------|
| `IntegradorProgramacion4.slnx` | Abrir la solución en Visual Studio. |
| `Proyecto/Proyecto.esproj` | Nodo del proyecto Express dentro de la solución. |
| `Proyecto/.vscode/launch.json` | Perfiles de depuración (p. ej. lanzar `npm start` con debugger). |

La carpeta **`.vs/`** en la raíz suele ser local del IDE; está pensada para no versionarse salvo que el equipo decida lo contrario.

---

## 8. Convenciones recomendadas al sumar código

1. **Nuevas entidades:** añadir `*Repository.js` → `*Service.js` → `*Controller.js` → `routes/*.js` → vistas en `views/<entidad>/`.
2. **IDs en URL:** preferir el mismo criterio que en `cursos` (`validateIdParam` + regex en rutas) para evitar colisiones con segmentos como `nuevo`.
3. **Formularios que modifican:** usar `_method=PUT` / `_method=DELETE` donde corresponda, coherente con `method-override` en `app.js`.
4. **SQL:** siempre parametrizado (`$1`, `$2`, …); no concatenar input del usuario en strings SQL.
5. **Auditoría:** respetar `DEFAULT_USER_ID` y campos de modificación según el esquema del dump hasta que exista autenticación real.

---

## 9. Próximas líneas del trabajo integrador (contexto)

Según el README, iteraciones futuras incluyen login JWT, dashboard, refinamiento de BREAD (cupo, estados de curso), diplomas PDF y tests. Este documento se puede actualizar cuando esas piezas entren en el repo.

---

*Última revisión alineada con el árbol de código en el repositorio (Express + capas routes/controllers/services/repositories + Pug).*
