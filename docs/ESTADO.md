# Estado del proyecto (documento vivo — el agente lo actualiza)

Última actualización: 2026-10-31 — estructura F0 creada localmente (sin commit remoto aún).
Fase en curso: F0 (estructura creada; verificación con Docker pendiente en tu máquina).

## Avance
| Fase | Contenido | Estado | Issue | Notas |
|---|---|---|---|---|
| F0 | Setup y Compose local | en curso | | `docker-compose.yml`, Mosquitto conf/pwfile, `.env.*.example`, `.gitignore`, `.gitattributes`, CI workflow creados localmente. Falta: crear repo en GitHub, subir, verificar Mosquitto con Docker, Issues F0–F5. |
| F1 | Simulador de dispositivos | pendiente | | |
| F2 | Node-RED (agregación, comandos, reglas, REST, WS) | pendiente | | |
| F3 | Dashboard Vue 3 | pendiente | | |
| F4 | Despliegue (HiveMQ, Render, Vercel) | pendiente | | |
| F5 | README, video y checklist | pendiente | | |
Estados: pendiente · en curso · bloqueado · hecho.

## Siguiente paso
1. Crear repo en GitHub y agregar remote `origin`.
2. Subir rama `main` y crear Issues F0–F5 con checklist de criterios de aceptación + tablero GitHub Projects.
3. En tu máquina con Docker: `docker compose up mosquitto`, generar `pwfile`, verificar que publicado autenticado llega y anónimo es rechazado.
4. Actualizar ESTADO.md y hacer commit `Closes #<issue-F0>`.
5. Pasar a F1.

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
