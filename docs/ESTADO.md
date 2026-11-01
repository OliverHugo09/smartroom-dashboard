# Estado del proyecto (documento vivo — el agente lo actualiza)

Última actualización: 2026-10-31 — F0–F3 implementados, verificación local pendiente.
Fase en curso: F3 (verificación local con Docker; F4 en espera por decisión del usuario).

## Avance
| Fase | Contenido | Estado | Issue | Notas |
|---|---|---|---|---|
| F0 | Setup y Compose local | hecho | #1 | Repo creado, `docker-compose.yml` con Mosquitto, `.env.*.example`, `.gitignore`, `.gitattributes`, CI workflow. Mosquitto verificado en Docker: levanta, auth funciona, anónimo rechazado. |
| F1 | Simulador de dispositivos | hecho (código) | #2 | `services/simulator/`: cliente MQTT único, estado retained, LWT, comandos, transiciones, Dockerfile. 25 pruebas unitarias pasan. |
| F2 | Node-RED (agregación, comandos, reglas, REST, WebSocket) | hecho (código) | #3 | `services/nodered/`: settings.js, flows.json, start.js, Dockerfile. 10 pruebas de estructura pasan. Endpoints /api/health, /api/zones, /api/zones/:id/commands, /api/events, WS /api/ws/zones. |
| F3 | Dashboard Vue 3 | hecho (código) | #4 | `services/web/`: Vue 3 + Vite + Router + Pinia + Axios. Build compila. Vistas ZonesList/ZoneDetail, WebSocket tiempo real, comandos POST con x-demo-key. |
| F4 | Despliegue (HiveMQ, Render, Vercel) | pendiente | | En espera: no desplegar en nube aún, verificar todo en local primero. |
| F5 | README, video y checklist | pendiente | | |
Estados: pendiente · en curso · bloqueado · hecho.

## Siguiente paso
En tu máquina con Docker (este entorno no tiene Docker):
1. `docker run --rm -v ${PWD}/services/mosquitto:/mosquitto/config eclipse-mosquitto:2 mosquitto_passwd -c /mosquitto/config/pwfile smartroom` (generar credenciales)
2. `docker compose up mosquitto` — verificar broker (auth OK, anónimo rechazado)
3. `docker compose up simulator` — verificar con `mosquitto_sub -t 'smartroom/#' -v` (4 zonas × 4 dispositivos), probar `set_dimmer`, verificar `status=offline` al detener
4. `docker compose up nodered` — probar `GET /api/health`, `GET /api/zones`, `POST /api/zones/:id/commands` con header `x-demo-key`
5. `cd services/web && npm install && npm run dev` — abrir http://localhost:5173, verificar 4 tarjetas, WebSocket en tiempo real, cambiar escena desde UI
6. Cuando todo funcione en local, avisar para considerar F4.

## Decisiones (fecha — decisión — motivo)
- 2026-10-31 — Proyecto simple e independiente: dispositivos simulados → MQTT → Node-RED → Vue 3 — decisión del usuario.
- 2026-10-31 — Nube: Node-RED en Render, broker HiveMQ Cloud, frontend en Vercel — decisión del usuario.
- 2026-10-31 — Sin base de datos; estado en mensajes MQTT retained y memoria de Node-RED — simplicidad.
- 2026-10-31 — Simulador y Node-RED en un mismo contenedor (dos procesos) en la nube — límite de servicios gratuitos.
- 2026-10-31 — Lutron solo como etiqueta de un sistema simulado — no hay integración real.

## Bloqueos y dudas abiertas
- (vacío)

## Cosas que quedaron fuera (para "Próximos pasos")
- (vacío)
