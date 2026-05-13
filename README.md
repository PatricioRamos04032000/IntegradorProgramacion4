# Sistema de Inscripción a Cursos – Trabajo Final Integrador

Trabajo Final Integrador de **Programación IV (FCAD – UNER)**, 1er cuatrimestre 2026.

> **Primera entrega (06/05/2026):** se entrega el BREAD completo de **Cursos** sobre Express + Pug + PostgreSQL.
> El resto del enunciado (login JWT, dashboard, BREAD de estudiantes e inscripciones, generación de diplomas en PDF) se incorpora en las siguientes iteraciones hasta la entrega final del 17/06/2026.

## Stack

- **Runtime:** Node.js (≥ 18 recomendado)
- **API:** Express 4 (JSON REST; sin vistas en servidor)
- **Front:** HTML + CSS + JavaScript estático en `Proyecto/web/` (consumo de la API con `fetch`)
- **UI:** Bootstrap 5 (CDN en las páginas HTML)
- **Base de datos:** PostgreSQL (driver oficial `pg`)
- **Autenticación:** JWT (`Authorization: Bearer …`)
- **Configuración:** `dotenv`
- **CORS:** paquete `cors` en `Proyecto/api/app.js`, origen desde `FRONT_ORIGIN`

## Estructura del repositorio

```text
.
├── dump base programacion.sql       Dump de la BD (esquema + datos de prueba)
├── README.md
├── comousarellogin.txt              Ejemplos de login y fetch con JWT
├── IntegradorProgramacion4.slnx     Solución de Visual Studio
└── Proyecto/
    ├── api/                         Backend Node (Express + capas)
    │   ├── app.js
    │   ├── bin/www
    │   ├── controllers/
    │   ├── services/
    │   ├── repositories/
    │   ├── routes/
    │   ├── middleware/
    │   ├── db/
    │   ├── package.json
    │   ├── .env                     (no se commitea)
    │   └── .env.example
    └── web/                         Front estático (HTML, css/, js/)
        ├── index.html
        ├── login.html
        └── …
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

Desde la carpeta `Proyecto/api/`, copiá el archivo de ejemplo y ajustá según tu instalación:

```bash
cd Proyecto/api
cp .env.example .env
```

Variables relevantes:

| Variable          | Default       | Descripción                                              |
| ----------------- | ------------- | -------------------------------------------------------- |
| `PORT`            | `3000`        | Puerto donde escucha la API.                           |
| `FRONT_ORIGIN`    | `http://127.0.0.1:5500` | Origen permitido por CORS (debe coincidir con Live Server u otro host del front). |
| `DB_*`            | …             | Conexión a PostgreSQL.                                  |
| `JWT_SECRET`      | …             | Firma de tokens JWT.                                    |
| `DEFAULT_USER_ID` | `1`           | Reservado para auditoría si alguna ruta no usa JWT.     |

> **Importante:** `.env` está en el `.gitignore` y no se sube al repo.

### 3. Instalar dependencias y levantar la API

```bash
cd Proyecto/api
npm install
npm start
```

La API queda en [http://localhost:3000](http://localhost:3000) (ajustá el puerto con `PORT`).

### 4. Levantar el front estático

Abrí la carpeta `Proyecto/web` con **Live Server** (VS Code / Cursor) o serví los archivos con:

```bash
npx serve Proyecto/web
```

Editá `Proyecto/web/js/config.js` si la API no corre en `http://localhost:3000`. El valor de `FRONT_ORIGIN` en `.env` de la API debe coincidir con la URL desde la que abrís el HTML (incluido `http://127.0.0.1` vs `http://localhost`).

## Rutas API (resumen)

Autenticación: `POST /login` con JSON `{ nombre_usuario, contrasenia }` → `{ token, user }`.

El resto de rutas de negocio requieren cabecera `Authorization: Bearer <token>`.

| Recurso        | Métodos principales |
| -------------- | -------------------- |
| `/`            | `GET` — dashboard (totales y últimos cursos) |
| `/cursos`      | `GET` (lista + `estados`), `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/estudiantes` | `GET`, `POST`, `GET /:id`, `PUT /:id`, `DELETE /:id` |
| `/inscripciones` | `GET`, `POST`, `GET /:id`, `GET /:id/certificado` (PDF), `DELETE /:id` |

Los cuerpos de `POST`/`PUT` son JSON (mismos nombres de campos que antes en los formularios: p. ej. `fecha_inicio`, `id_curso_estado` en cursos).

### Soft delete (cursos)

No se hace `DELETE` físico. El borrado actualiza `id_curso_estado = 4` (estado eliminado, `es_activo = 0`).
El listado oculta cursos cuyo estado tiene `es_activo = 0`.

### Auditoría

Cada `INSERT` / `UPDATE` setea `id_usuario_modificacion` con el usuario del JWT (`req.user.id_usuario`).
