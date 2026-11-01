# F0 — Setup del repositorio y entorno local

**Estimado:** 1 h · **Depende de:** nada

## Objetivo
Dejar el repo listo para trabajar con trazabilidad y un broker MQTT local funcionando.

## Alcance
- Repo público en GitHub con la estructura de `CLAUDE.md`.
- `docker-compose.yml` local con Mosquitto (autenticación por usuario y clave, puerto 1883, healthcheck). Node-RED y web se agregan en F2 y F3.
- `.env.local.example` y `.env.cloud.example` con todas las variables de `docs/01-arquitectura.md` (sin valores reales); `.gitignore` que excluye `.env*` reales, `node_modules` y `flows_cred.json`.
- Archivo `.gitattributes` con `* text=auto` y `*.sh text eol=lf` (se trabaja en Windows).
- Issues F0–F5 con criterios de aceptación en checklist y tablero de GitHub Projects.
- CI mínimo (`.github/workflows/ci.yml`): instala dependencias y ejecuta lint/pruebas de los servicios que existan.
- Carpeta `.claude/` según `docs/04-claude-code-setup.md` (puede quedar en esqueleto).

## Tareas
- [ ] Crear repo y estructura
- [ ] Mosquitto en Compose con usuario/clave y prueba con `mosquitto_pub`/`mosquitto_sub` (desde el contenedor)
- [ ] `.env.*.example` y `.gitignore`/`.gitattributes`
- [ ] Issues y Project board
- [ ] Workflow de CI mínimo
- [ ] Actualizar `docs/ESTADO.md`

## Criterios de aceptación
- `docker compose up mosquitto` levanta el broker; una publicación autenticada llega a un suscriptor y una anónima es rechazada.
- Ningún archivo con secretos está versionado.
- Existen los 6 Issues y el tablero.
