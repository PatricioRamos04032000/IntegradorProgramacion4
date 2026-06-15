# Documentación para estudio y presentación del TFI

Material de apoyo para **estudiar** el Trabajo Final Integrador y **explicarlo en viva voz** (defensa oral, presentación al profesor).

**Proyecto:** Sistema de Inscripción a Cursos — Programación IV (FCAD–UNER), 1er cuatrimestre 2026.

---

## Qué es este repositorio

El integrador es una aplicación **full-stack** con dos partes bajo `Proyecto/`:

| Parte | Ruta | Rol |
|-------|------|-----|
| Backend | `Proyecto/api/` | API REST en Node.js + Express, conectada a PostgreSQL |
| Frontend | `Proyecto/web/` | Sitio estático HTML + Bootstrap + JavaScript (sin React ni build) |

El backend **sirve también el frontend** en el mismo puerto (`http://localhost:3000`), lo que permite cookies httpOnly para la sesión.

---

## Guías de estudio

Leé los documentos en este orden:

| Orden | Documento | Contenido |
|-------|-----------|-----------|
| 1 | [01-guia-tecnologias.md](./01-guia-tecnologias.md) | Qué es cada tecnología, para qué se usa y dónde está en el código |
| 2 | [02-arquitectura-capas.md](./02-arquitectura-capas.md) | Patrón en capas, convenciones de nombres, middlewares, esquema de BD |
| 3 | [03-flujo-end-to-end.md](./03-flujo-end-to-end.md) | **Documento central:** desde `npm start` hasta editar un curso y el viaje ida/vuelta por cada capa |

---

## Prerrequisitos para probar el flujo completo

Antes de seguir el flujo end-to-end, necesitás:

1. **Node.js** ≥ 18 instalado
2. **PostgreSQL** corriendo con la base `programacion4` restaurada desde el dump
3. **Variables de entorno** en `Proyecto/api/.env` (copiar desde `.env.example`)
4. **Migración de refresh tokens** (solo la primera vez):

```bash
psql -U postgres -d programacion4 -f Proyecto/api/migrations/001_refresh_tokens.sql
```

5. **Servidor levantado:**

```bash
cd Proyecto/api
npm install
npm start
```

6. **Navegador** en `http://localhost:3000/` (redirige a login)

> Instalación detallada, variables de entorno y restauración del dump: ver [README.md](../README.md) en la raíz del repositorio.

### Configuración recomendada para same-origin

Si servís front y API desde `http://localhost:3000`, configurá en `.env`:

```
FRONT_ORIGIN=http://localhost:3000
```

Así CORS y la cookie httpOnly del refresh token funcionan correctamente.

### Usuario de prueba

El dump incluye usuarios de ejemplo. Ver credenciales en `dump base programacion.sql` o la guía [comousarellogin.txt](../comousarellogin.txt) (usuario típico: `lbianchi`).

---

## Documentación técnica existente

| Recurso | Descripción |
|---------|-------------|
| [README.md](../README.md) | Stack, puesta en marcha, endpoints API v2 |
| [ESTRUCTURA_PROYECTO.md](../ESTRUCTURA_PROYECTO.md) | Índice de carpetas y convenciones para desarrolladores |
| [comousarellogin.txt](../comousarellogin.txt) | Ejemplos de login y fetch con JWT desde consola del navegador |
| Swagger UI | `http://localhost:3000/docs` — documentación interactiva de la API |

---

## Resumen para la presentación oral (30 segundos)

> Levantamos un servidor Node/Express que expone una API REST v2 y sirve un front estático. El usuario se autentica con JWT (access en sessionStorage, refresh en cookie httpOnly). Cada operación pasa por capas: validación → controller → service (reglas de negocio) → repository (SQL) → PostgreSQL. Las respuestas salen en camelCase vía DTOs. El ejemplo concreto que mostramos es editar un curso: el formulario en el navegador hace un PUT, el backend valida cupo y estado, persiste en la tabla `cursos` y devuelve el curso actualizado.

Para el desarrollo completo de esa idea, seguí con [03-flujo-end-to-end.md](./03-flujo-end-to-end.md).
