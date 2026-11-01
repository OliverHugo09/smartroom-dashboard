# Estado del proyecto (documento vivo — el agente lo actualiza)

Última actualización: 2026-10-31 — F0 completado y verificado.
Fase en curso: F1 (siguiente).

## Avance
| Fase | Contenido | Estado | Issue | Notas |
|---|---|---|---|---|
| F0 | Setup y Compose local | hecho | #1 | Repo creado, `docker-compose.yml` con Mosquitto, `.env.*.example`, `.gitignore`, `.gitattributes`, CI workflow. Mosquitto verificado en Docker: levanta, auth funciona, anónimo rechazado. |
| F1 | Simulador de dispositivos | en curso | | Carpeta `services/simulator/`: cliente MQTT único, estado retained, LWT, comandos, transiciones, pruebas unitarias, Dockerfile. |
| F2 | Node-RED (agregación, comandos, reglas, REST, WebSocket) | pendiente | | |
| F3 | Dashboard Vue 3 | pendiente | | |
| F4 | Despliegue (HiveMQ, Render, Vercel) | pendiente | | |
| F5 | README, video y checklist | pendiente | | |
Estados: pendiente · en curso · bloqueado · hecho.

## Siguiente paso
Implementar F1: simulador de dispositivos MQTT en `services/simulator/`. Ver `docs/fases/F1-simulador.md` para criterios de aceptación.

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
