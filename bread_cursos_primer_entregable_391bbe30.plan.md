---
name: BREAD cursos primer entregable
overview: Implementar el primer entregable del Sistema de Inscripción a Cursos (06/05/2026) con BREAD completo de cursos sobre Express + Pug + PostgreSQL, respetando el esquema real de la base (estados de curso, soft delete vía cambio de estado, auditoría de usuario/fecha), con búsqueda, paginación y diseño responsivo. Login JWT y el resto del dominio quedan para entregas posteriores.
todos:
  - id: cleanup
    content: "Limpieza inicial: borrar Proyecto/index.js (Hello World duplicado) y agregar/ampliar .gitignore con node_modules y .env"
    status: completed
  - id: deps
    content: "Instalar dependencias nuevas: pg, dotenv y method-override; actualizar package.json"
    status: completed
  - id: env
    content: Crear .env y .env.example con PORT, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME y DEFAULT_USER_ID; cargar dotenv al inicio de app.js
    status: completed
  - id: db
    content: Crear db/pool.js con Pool de pg leyendo de process.env
    status: completed
  - id: model
    content: Crear models/cursoModel.js con listar (busqueda + filtro por estado + paginacion), obtener, crear, actualizar, eliminar (soft delete a id_curso_estado=4) y listarEstadosActivos, todo con queries parametrizadas
    status: completed
  - id: controller
    content: Crear controllers/cursosController.js con browse, read, addForm, add, editForm, edit y delete; setear id_usuario_modificacion desde DEFAULT_USER_ID y fecha_hora_modificacion = NOW()
    status: completed
  - id: routes
    content: Crear routes/cursos.js con las rutas REST + form, montarlo en app.js, agregar method-override para PUT/DELETE y simplificar routes/index.js para redirigir a /cursos
    status: completed
  - id: views
    content: Modernizar views/layout.pug con Bootstrap 5 + navbar y crear views/cursos/index.pug, show.pug y form.pug (responsive, buscador, filtro por estado, paginacion, confirm de borrado, select de estados activos)
    status: completed
  - id: readme
    content: Actualizar README/CHANGELOG con instrucciones de instalacion, como restaurar el dump SQL en PostgreSQL, configuracion de .env y como correr el proyecto (npm install, npm start)
    status: completed
  - id: smoke-test
    content: "Probar manualmente el flujo BREAD completo contra tu PostgreSQL poblado: listar, buscar, paginar, alta, ver detalle, editar y soft delete"
    status: completed
isProject: false
---

## Alcance del primer entregable

Solo **BREAD de cursos** (Browse, Read, Edit, Add, Delete) sobre el proyecto Express ya generado, contra el PostgreSQL ya poblado con [dump base programacion.sql](dump%20base%20programacion.sql). El resto del enunciado (login JWT, dashboard, estudiantes, inscripciones, diplomas PDF) queda **fuera** para llegar al 06/05/2026.

Cumplimos los requisitos técnicos del PDF que aplican a cursos en esta etapa:

- Diseño responsivo (Bootstrap 5 vía CDN en `views/layout.pug`).
- Rutas ordenadas siguiendo buenas prácticas REST.
- Variables de entorno con `dotenv` para credenciales y configuración.
- **Soft delete** sobre cursos (cambiando `id_curso_estado` a `4 = ELIMINADO`, NUNCA `DELETE` físico).
- Búsqueda por varios criterios (nombre, estado) y paginación de resultados.

## Particularidades del esquema real ([dump base programacion.sql](dump%20base%20programacion.sql))

```sql
public.cursos (
  id_curso integer PRIMARY KEY,
  nombre varchar(45)   NOT NULL,
  descripcion text     NOT NULL,
  fecha_inicio date    NOT NULL,
  cantidad_horas integer NOT NULL,
  inscriptos_max smallint NOT NULL,
  id_curso_estado smallint NOT NULL,           -- FK -> cursos_estados
  id_usuario_modificacion integer NOT NULL,    -- FK -> usuarios
  fecha_hora_modificacion timestamp NOT NULL
)

public.cursos_estados:
  1 = BORRADOR             (es_activo=1)
  2 = INSCRIPCION ABIERTA  (es_activo=1)
  3 = INSCRIPCION CERRADA  (es_activo=1)
  4 = ELIMINADO            (es_activo=0)
```

Decisiones derivadas:

- **Soft delete** = `UPDATE cursos SET id_curso_estado = 4, ... WHERE id_curso = $1`.
- **Listado por defecto**: oculta los `id_curso_estado = 4` con `JOIN cursos_estados cs ON ... WHERE cs.es_activo = 1`. El filtro de estado se puede sobre-escribir desde la UI.
- **Auditoría**: en `INSERT`/`UPDATE` siempre seteamos `id_usuario_modificacion = $usuarioActual` y `fecha_hora_modificacion = NOW()`. Como aún no hay login, usamos un id por defecto leído de `process.env.DEFAULT_USER_ID` (ej. `1`).
- En el formulario de alta/edición sólo dejamos elegir entre estados con `es_activo = 1` y NO mostramos `ELIMINADO` (ese estado solo se asigna desde la acción de borrar).
- Validaciones de tipos del esquema: `nombre` máximo 45 chars, `cantidad_horas` entero >= 0, `inscriptos_max` entero >= 0, `fecha_inicio` requerida.

## Stack y dependencias a sumar

- `pg` driver oficial de PostgreSQL.
- `dotenv` carga `.env`.
- `method-override` habilita `PUT`/`DELETE` desde formularios Pug.
- (ya están) `express`, `pug`, `morgan`, `cookie-parser`, `http-errors`.

## Estructura propuesta de carpetas

```text
Proyecto/
├── bin/www                       (ya existe)
├── app.js                        (modificar: dotenv, method-override, montar /cursos)
├── .env                          (NUEVO, no commitear)
├── .env.example                  (NUEVO)
├── .gitignore                    (NUEVO/ampliar: node_modules, .env)
├── db/
│   └── pool.js                   (NUEVO: Pool de pg)
├── models/
│   └── cursoModel.js             (NUEVO)
├── controllers/
│   └── cursosController.js       (NUEVO)
├── routes/
│   ├── index.js                  (simplificar: redirigir a /cursos)
│   ├── users.js                  (se deja, lo usaremos despues)
│   └── cursos.js                 (NUEVO)
├── views/
│   ├── layout.pug                (modernizar con Bootstrap 5 + navbar)
│   ├── error.pug                 (se deja)
│   └── cursos/
│       ├── index.pug             (browse + buscador + paginacion)
│       ├── show.pug              (read)
│       └── form.pug              (add/edit compartido)
└── index.js                      (BORRAR: Hello World duplicado, no se usa)
```

## Modelo REST de cursos (rutas)

Mezcla pragmática de REST + formularios HTML (necesario porque renderizamos con Pug):

- `GET    /cursos`                 Browse (lista con `?q=`, `?estado=`, `?page=`, `?pageSize=`)
- `GET    /cursos/nuevo`           Form de alta
- `POST   /cursos`                 Add
- `GET    /cursos/:id`             Read (detalle)
- `GET    /cursos/:id/editar`      Form de edición
- `PUT    /cursos/:id`             Edit (vía `method-override`)
- `DELETE /cursos/:id`             Soft delete (vía `method-override`)

Montaje en [Proyecto/app.js](Proyecto/app.js):

```js
const cursosRouter = require('./routes/cursos');
app.use('/cursos', cursosRouter);
```

## Conexión a PostgreSQL

[Proyecto/db/pool.js](Proyecto/db/pool.js) (NUEVO):

```js
const { Pool } = require('pg');
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
module.exports = pool;
```

`.env.example`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=programacion4
DEFAULT_USER_ID=1
```

`.gitignore` debe incluir `node_modules/` y `.env`.

## Queries clave del modelo (`models/cursoModel.js`)

Todas las consultas son **parametrizadas** (`$1, $2, ...`), nunca concatenando strings.

- `listar({ q, idEstado, page, pageSize })`:

```sql
SELECT c.id_curso, c.nombre, c.fecha_inicio, c.cantidad_horas,
       c.inscriptos_max, cs.id_curso_estado, cs.descripcion AS estado
  FROM cursos c
  JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
 WHERE cs.es_activo = 1
   AND ($1::text IS NULL OR c.nombre ILIKE '%' || $1 || '%')
   AND ($2::smallint IS NULL OR c.id_curso_estado = $2)
 ORDER BY c.fecha_inicio DESC, c.id_curso DESC
 LIMIT $3 OFFSET $4
```

+ un `SELECT COUNT(*)` con los mismos filtros para calcular el total.

- `obtener(id)`:

```sql
SELECT c.*, cs.descripcion AS estado
  FROM cursos c
  JOIN cursos_estados cs ON cs.id_curso_estado = c.id_curso_estado
 WHERE c.id_curso = $1
```

- `crear(data, usuarioId)`:

```sql
INSERT INTO cursos (nombre, descripcion, fecha_inicio, cantidad_horas,
                    inscriptos_max, id_curso_estado,
                    id_usuario_modificacion, fecha_hora_modificacion)
VALUES ($1,$2,$3,$4,$5,$6,$7, NOW())
RETURNING id_curso
```

- `actualizar(id, data, usuarioId)`:

```sql
UPDATE cursos
   SET nombre = $1, descripcion = $2, fecha_inicio = $3,
       cantidad_horas = $4, inscriptos_max = $5, id_curso_estado = $6,
       id_usuario_modificacion = $7, fecha_hora_modificacion = NOW()
 WHERE id_curso = $8
```

- `eliminar(id, usuarioId)` (soft delete):

```sql
UPDATE cursos
   SET id_curso_estado = 4,
       id_usuario_modificacion = $1,
       fecha_hora_modificacion = NOW()
 WHERE id_curso = $2
```

- `listarEstadosActivos()`:

```sql
SELECT id_curso_estado, descripcion
  FROM cursos_estados
 WHERE es_activo = 1
 ORDER BY id_curso_estado
```

(alimenta el `<select>` de estado en el form y el filtro del listado).

## UI con Pug + Bootstrap 5

- `views/layout.pug`: doctype html + Bootstrap 5 CDN, navbar superior con link a "Cursos".
- `views/cursos/index.pug`: tabla responsive con columnas `Nombre | Estado | Fecha inicio | Horas | Cupo | Acciones`. Form `GET /cursos` con input `q` y `<select>` por estado. Controles de paginación (Anterior / Siguiente / total). Botón "Nuevo curso". Botones por fila: Ver, Editar, Eliminar (form `DELETE` con `confirm()`).
- `views/cursos/form.pug`: formulario compartido para alta y edición. Campos: nombre (maxlength 45), descripción (textarea), fecha_inicio (date), cantidad_horas (number), inscriptos_max (number), id_curso_estado (`<select>` con estados activos). En edición: `<input type="hidden" name="_method" value="PUT">`. Validación HTML5 + server-side.
- `views/cursos/show.pug`: detalle con todos los campos + botones Editar / Eliminar / Volver.

## Pasos de implementación (en orden)

1. Limpieza de la base del proyecto y dependencias.
2. Configuración de entorno (`.env`, `.env.example`, `.gitignore`, `dotenv` en `app.js`).
3. Capa de datos (`db/pool.js`).
4. Modelo `cursoModel.js`.
5. Controlador `cursosController.js` (incluye captura de errores y `DEFAULT_USER_ID`).
6. Rutas `routes/cursos.js` y montaje en `app.js`.
7. Vistas Pug (layout + cursos/*).
8. README con instrucciones de instalación, restauración del dump SQL y ejecución.
9. Prueba manual end-to-end del BREAD contra tu base poblada.

## Lo que queda fuera (próximas iteraciones)

- Login + JWT y reemplazo de `DEFAULT_USER_ID` por el usuario autenticado.
- BREAD de estudiantes e inscripciones (con control de cupo `inscriptos_max` y de estado del curso), dashboard, generación de diplomas PDF.
- Tests automatizados.
