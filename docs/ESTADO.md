# Estado del proyecto (documento vivo — el agente lo actualiza)

Última actualización: 2026-10-31 — F3 implementado (build compila).
Fase en curso: F3 (pendiente Issue F3 para `Closes #n`; siguiente F4).

## Avance
| Fase | Contenido | Estado | Issue | Notas |
|---|---|---|---|---|
| F0 | Setup y Compose local | hecho | #1 | Repo creado, `docker-compose.yml` con Mosquitto, `.env.*.example`, `.gitignore`, `.gitattributes`, CI workflow. Mosquitto verificado en Docker: levanta, auth funciona, anónimo rechazado. |
| F1 | Simulador de dispositivos | hecho (código) | pendiente | `services/simulator/`: cliente MQTT único, estado retained, LWT, comandos, transiciones, Dockerfile. 25 pruebas unitarias pasan. Integración con Mosquitto se verifica en tu máquina con Docker. |
| F2 | Node-RED (agregación, comandos, reglas, REST, WebSocket) | hecho (código) | pendiente | `services/nodered/`: settings.js, flows.json, start.js, Dockerfile. 10 pruebas de estructura pasan. Endpoints /api/health, /api/zones, /api/zones/:id/commands, /api/events, WS /api/ws/zones. |
| F3 | Dashboard Vue 3 | hecho (código) | pendiente | `services/web/`: Vue 3 + Vite + Router + Pinia + Axios. Build compila. Vistas ZonesList/ZoneDetail, WebSocket tiempo real, comandos POST con x-demo-key. |
| F4 | Despliegue (HiveMQ, Render, Vercel) | pendiente | | |
| F5 | README, video y checklist | pendiente | | |
Estados: pendiente · en curso · bloqueado · hecho.

## Siguiente paso
1. Crear Issues F1, F2, F3 en GitHub y pasarme los números para corregir `Closes #n` en los commits.
2. En tu máquina con Docker: verificar F1 (mosquitto_sub muestra 4 zonas × 4 dispositivos; set_dimmer transiciona; status offline al detener) y F2 (levantar nodered, probar /api/health, /api/zones, POST comando con x-demo-key).
3. Pasar a F4: Despliegue en Render (Node-RED + simulador), HiveMQ Cloud (broker), Vercel (frontend).

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
