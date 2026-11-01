# SmartRoom Hospitality Dashboard — instrucciones para el agente (OpenCode)

Simulación de control de habitaciones de hotel: dispositivos → MQTT → Node-RED (API REST + WebSocket) → SPA Vue 3. Todo es **simulado** (sin API real de Lutron ni hardware).

## Antes de tocar código (léelo siempre en este orden)
1. `docs/ESTADO.md` — fase en curso, avance, bloqueos, siguiente paso.
2. `docs/01-arquitectura.md` — **fuente de verdad**: topics MQTT, payloads, escenas, reglas, REST (`/api`), WebSocket (`/ws/zones`), validación de comandos.
3. Solo el archivo de la fase en curso: `docs/fases/Fx-*.md`. Si tocas despliegue: `docs/03-despliegue.md`.

## Protocolo de trabajo
- Trabaja **una fase a la vez**, en el orden de `docs/02-roadmap.md`. Antes de implementar, propón un plan breve y espera confirmación.
- No cambies un topic, payload, endpoint, escena o regla sin actualizar `docs/01-arquitectura.md` en el **mismo commit**.
- Una fase termina cuando: cumple sus criterios de aceptación, pasan las pruebas, `docs/ESTADO.md` está actualizado y hay commit ligado a un Issue (`Closes #n`).
- Si falta información, pregunta. No inventes credenciales ni límites de planes gratuitos: verifícalos en la página oficial del proveedor y anota la fecha en `docs/03-despliegue.md`.
- Si hay retraso, recorta según el "Orden de recorte" del roadmap; el flujo comando → dispositivo → estado → pantalla nunca se recorta.

## Estado actual del repo
- **F0 pendiente (setup).** No hay código aún: solo `docs/` y `AGENTS.md`. Aún no es un repositorio Git.
- Primera entrega de F0: crear repo, estructura de carpetas, `docker-compose.yml` con Mosquitto, `.env.*.example`, `.gitignore`, `.gitattributes`, Issues F0–F5, CI mínimo.

## Stack y puntos de entrada
- Dispositivos simulados: `services/simulator/` (Node.js, cliente MQTT).
- Broker local: Mosquitto (Docker Compose, puerto 1883, auth usuario/clave).
- Orquestación y API: `services/nodered/` (Node-RED; `Dockerfile`, `settings.js`, `flows.json`, `start.js`).
- Frontend: `services/web/` (Vue 3 + Vite + Vue Router + Pinia + Axios).
- Nube: Node-RED + simulador en Render (Docker), broker HiveMQ Cloud, frontend en Vercel.
- Sin base de datos: el estado vive en mensajes MQTT *retained* y en memoria de Node-RED.

## Contratos clave (ver `docs/01-arquitectura.md` para el detalle completo)
- `PROPERTY_ID = demo-hotel`. Zonas: `SUITE_PRESIDENCIAL_402`, `HAB_DELUXE_201`, `HAB_DELUXE_202`, `LOBBY_PB`. Dispositivos por zona: `lighting`, `climate`, `curtains`, `occupancy`.
- Topic: `smartroom/<property>/<zone>/<device>/<kind>` (`kind`: `state` retenido QoS 1, `cmd` no retenido, `status` LWT retenido). Ejemplo: `smartroom/demo-hotel/SUITE_PRESIDENCIAL_402/lighting/state`.
- Comandos (Node-RED → dispositivo): `{ cmd_id, type, value, origin, ts }`. Tipos válidos: `set_scene`, `set_dimmer` (0–100), `set_setpoint` (16–30, paso 0.5), `set_hvac_mode` (auto|cool|heat|off), `set_curtains` (0–100), `sim_occupancy` (booleano).
- REST: `GET /health`, `GET /zones`, `GET /zones/:id`, `POST /zones/:id/commands` (header `x-demo-key`, 202 `{cmd_id}`), `GET /events?limit=50`. CORS limitado a `CORS_ORIGIN`.
- WebSocket `/ws/zones`: cliente envía `{"type":"ping"}` cada ~60 s con pestaña visible (mantiene despierto el servicio en Render).

## Reglas no negociables
- Datos 100 % simulados; nada real de clientes. En CV/README decir "simulación inspirada en sistemas como Lutron", nunca "integración real con Lutron".
- Secretos solo en variables de entorno (`.env` local; paneles Render/Vercel/GitHub). **Nunca en git.** Mantener `.env.local.example` y `.env.cloud.example`.
- En la nube el editor de Node-RED va deshabilitado (o con `adminAuth`). Nunca público sin autenticación.
- Servicios en la nube sin estado en disco (disco efímero): flujos y configuración dentro de la imagen.
- Los servicios gratuitos se duermen (~1 min para despertar). No uses pings externos permanentes.
- Código e identificadores en inglés; documentación en español; commits en inglés (Conventional Commits).
- Rama `feat/fx-descripcion`; un Issue por fase; commits/PRs con `Closes #n`.

## Comandos y verificación
- Levantar broker local: `docker compose up mosquitto`; probar con `mosquitto_pub` / `mosquitto_sub` desde el contenedor (anónimo debe ser rechazado).
- Pruebas por servicio: `npm test` (o el script indicado en cada `services/*`). Orden sugerido: lint → typecheck → test.
- Cada servicio con endpoint de salud (`GET /health`), README breve y pruebas mínimas.
- Al cerrar sesión: recordar actualizar `docs/ESTADO.md`.
