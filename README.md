# Sistema de Inscripción a Cursos – Trabajo Final Integrador

Trabajo Final Integrador de **Programación IV (FCAD – UNER)**, 1er cuatrimestre 2026.

> **Primera entrega (06/05/2026):** se entrega el BREAD completo de **Cursos** sobre Express + Pug + PostgreSQL.
> El resto del enunciado (login JWT, dashboard, BREAD de estudiantes e inscripciones, generación de diplomas en PDF) se incorpora en las siguientes iteraciones hasta la entrega final del 17/06/2026.

## Stack

- **Runtime:** Node.js (≥ 18 recomendado)
- **Servidor web:** Express 4
- **Vistas:** Pug (server-side rendering)
- **UI:** Bootstrap 5 (vía CDN, diseño responsivo)
- **Base de datos:** PostgreSQL 17 (driver oficial `pg`)
- **Configuración:** `dotenv`
- **Method override:** `method-override` (para `PUT`/`DELETE` desde formularios HTML)

## Estructura del repositorio

```text
.
├── dump base programacion.sql       Dump de la BD (esquema + datos de prueba)
├── README.md
├── IntegradorProgramacion4.slnx     Solución de Visual Studio
└── Proyecto/
    ├── app.js                       Configuración de Express
    ├── bin/www                      Entrypoint (npm start)
    ├── db/pool.js                   Pool de conexiones a PostgreSQL
    ├── models/cursoModel.js         Queries SQL parametrizadas
    ├── controllers/cursosController.js
    ├── routes/                      index.js, users.js, cursos.js
    ├── views/                       layout.pug, error.pug, cursos/*.pug
    ├── public/                      Assets estáticos
    ├── .env                         Variables de entorno (no se commitea)
    └── .env.example                 Plantilla de variables de entorno
```

## Puesta en marcha

### 1. Restaurar la base de datos

Asegurate de tener PostgreSQL corriendo y creá la base que vas a usar (por defecto `programacion4`):

```sql
CREATE DATABASE programacion4;
```

Luego restaurá el dump (el archivo está en la raíz del repo, `dump base programacion.sql`):

```bash
psql -U postgres -d programacion4 -f "dump base programacion.sql"
```

### 2. Configurar variables de entorno

Desde la carpeta `Proyecto/`, copiá el archivo de ejemplo y ajustá según tu instalación:

```bash
cp .env.example .env
```

Variables disponibles:

| Variable          | Default       | Descripción                                              |
| ----------------- | ------------- | -------------------------------------------------------- |
| `PORT`            | `3000`        | Puerto donde escucha la app.                             |
| `DB_HOST`         | `localhost`   | Host de PostgreSQL.                                      |
| `DB_PORT`         | `5432`        | Puerto de PostgreSQL.                                    |
| `DB_USER`         | `postgres`    | Usuario de PostgreSQL.                                   |
| `DB_PASSWORD`     | `postgres`    | Contraseña de PostgreSQL.                                |
| `DB_NAME`         | `programacion4` | Nombre de la base.                                     |
| `DEFAULT_USER_ID` | `1`           | Usuario que se registra como autor de cada modificación mientras no exista login. |

> **Importante:** `.env` está en el `.gitignore` y no se sube al repo. `DEFAULT_USER_ID` debe existir en la tabla `usuarios`.

### 3. Instalar dependencias y ejecutar

Desde la carpeta `Proyecto/`:

```bash
npm install
npm start
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000) y redirige a `/cursos`.

## Funcionalidades del primer entregable

URL base: `/cursos`.

| Método HTTP | Ruta                     | Acción                                                  |
| ----------- | ------------------------ | ------------------------------------------------------- |
| `GET`       | `/cursos`                | Browse: lista paginada con búsqueda por nombre y filtro por estado. Querystring: `q`, `estado`, `page`, `pageSize`. |
| `GET`       | `/cursos/nuevo`          | Formulario de alta.                                     |
| `POST`      | `/cursos`                | Add: crea un curso.                                     |
| `GET`       | `/cursos/:id`            | Read: detalle de un curso.                              |
| `GET`       | `/cursos/:id/editar`     | Formulario de edición.                                  |
| `PUT`       | `/cursos/:id`            | Edit (vía `method-override` con `?_method=PUT`).        |
| `DELETE`    | `/cursos/:id`            | Soft delete (vía `method-override` con `?_method=DELETE`). |

### Soft delete

No se hace `DELETE` físico. El borrado actualiza `id_curso_estado = 4` (estado `ELIMINADO`, `es_activo = 0`).
El listado del browse esconde por defecto los cursos cuyo estado tiene `es_activo = 0`, así que un curso "eliminado" desaparece de la vista pero queda en la base.

### Auditoría

Cada `INSERT` / `UPDATE` setea:

- `id_usuario_modificacion = $DEFAULT_USER_ID` (mientras no exista login).
- `fecha_hora_modificacion = NOW()`.

## Lo que queda fuera de esta entrega

- Login + JWT y reemplazo de `DEFAULT_USER_ID` por el usuario autenticado.
- BREAD de estudiantes e inscripciones (con control de cupo `inscriptos_max` y de estado del curso).
- Dashboard con totales y links rápidos.
- Generación / impresión de diplomas en PDF.
- Tests automatizados.
