# Estado del proyecto (documento vivo — el agente lo actualiza)

Última actualización: 2026-10-31 — F1 implementado (pruebas unitarias pasan).
Fase en curso: F1 (pendiente verificación de integración con Mosquitto en tu máquina; crear Issue F1 en GitHub para `Closes #n`).

## Avance
| Fase | Contenido | Estado | Issue | Notas |
|---|---|---|---|---|
| F0 | Setup y Compose local | hecho | #1 | Repo creado, `docker-compose.yml` con Mosquitto, `.env.*.example`, `.gitignore`, `.gitattributes`, CI workflow. Mosquitto verificado en Docker: levanta, auth funciona, anónimo rechazado. |
| F1 | Simulador de dispositivos | hecho (código) | pendiente | `services/simulator/`: cliente MQTT único, estado retained, LWT, comandos, transiciones, Dockerfile. 25 pruebas unitarias pasan (`npm test`). Integración con Mosquitto (`docker compose up`, `mosquitto_sub`) se verifica en tu máquina con Docker. |
| F2 | Node-RED (agregación, comandos, reglas, REST, WebSocket) | pendiente | | |
| F3 | Dashboard Vue 3 | pendiente | | |
| F4 | Despliegue (HiveMQ, Render, Vercel) | pendiente | | |
| F5 | README, video y checklist | pendiente | | |
Estados: pendiente · en curso · bloqueado · hecho.

## Siguiente paso
1. Crear Issue F1 en GitHub y pasarme el número para `Closes #n`.
2. En tu máquina con Docker: `docker compose up mosquitto simulator` y verificar con `mosquitto_sub -t 'smartroom/#' -v` que muestra 4 zonas × 4 dispositivos; probar comando `set_dimmer` y que al detener el simulador el status quede `offline`.
3. Pasar a F2 (Node-RED).

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
