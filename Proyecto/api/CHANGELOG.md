En este archivo se explica cómo Visual Studio creado el proyecto.

Se usaron las siguientes herramientas para generar este proyecto:
- Express generator

Los pasos siguientes se usaron para generar este proyecto:
- Cree un proyecto rápido con express-generator: `npx express-generator --view=pug F:\workspace\IntegradorProgramacion4\Proyecto`.
- Crear archivo de proyecto (`Proyecto.esproj`).
- Crear `launch.json` para habilitar la depuración.
- Agregue el proyecto a la solución.
- Escriba este archivo.

## Primer entregable - BREAD de cursos

- Se eliminó el archivo `index.js` raíz del proyecto (Hello World duplicado de la base generada).
- Se agregaron las dependencias `pg`, `dotenv` y `method-override`.
- Se configuró soporte para variables de entorno en `app.js` (`require('dotenv').config()`) y se agregó el middleware `method-override` para soportar `PUT`/`DELETE` desde formularios.
- Se agregaron archivos `.env.example` y `.env` con la configuración del puerto, credenciales de PostgreSQL y `DEFAULT_USER_ID` (autor de las modificaciones mientras no exista login).
- Se sumó un `.gitignore` en la raíz del repositorio para excluir `node_modules/`, `.env` y archivos temporales.
- Se creó la capa de acceso a datos en `db/pool.js` (Pool de PostgreSQL leyendo de `process.env`).
- Se creó el modelo `models/cursoModel.js` con queries SQL parametrizadas para listar (con búsqueda, filtro por estado y paginación), obtener, crear, actualizar, soft delete (cambiando `id_curso_estado` a `4 = ELIMINADO`) y listar estados activos.
- Se creó el controlador `controllers/cursosController.js` con manejo de errores y validaciones server-side.
- Se creó `routes/cursos.js` y se montó en `app.js` bajo `/cursos`. `routes/index.js` redirige a `/cursos`.
- Se modernizó `views/layout.pug` con Bootstrap 5 (vía CDN) y navbar superior, y se agregaron las vistas `views/cursos/index.pug`, `show.pug` y `form.pug` con UI responsiva, buscador, filtro por estado, paginación y confirmación al eliminar.
- Se agregó un `README.md` en la raíz del repositorio con instrucciones para restaurar el dump SQL, configurar el entorno y correr la aplicación.
