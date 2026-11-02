# Estado del proyecto (documento vivo — el agente lo actualiza)

Última actualización: 2026-11-02 — F0–F3 implementados, F3 UI dark mode completada con Tailwind CSS v4 + GSAP.
Fase en curso: F3 (verificación local pendiente; F4 en espera por decisión del usuario).

## Avance
| Fase | Contenido | Estado | Issue | Notas |
|---|---|---|---|---|
| F0 | Setup y Compose local | hecho | #1 | Repo creado, `docker-compose.yml` con Mosquitto, `.env.*.example`, `.gitignore`, `.gitattributes`, CI workflow. Mosquitto verificado en Docker: levanta, auth funciona, anónimo rechazado. |
| F1 | Simulador de dispositivos | hecho (código) | #2 | `services/simulator/`: cliente MQTT único, estado retained, LWT, comandos, transiciones, Dockerfile. 25 pruebas unitarias pasan. |
| F2 | Node-RED (agregación, comandos, reglas, REST, WebSocket) | hecho (código) | #3 | `services/nodered/`: api-server.js (servidor HTTP simple), start.js, Dockerfile. Endpoints /api/health, /api/zones, /api/zones/:id/commands, /api/events, WS /api/ws/zones. Reglas R1/R2 integradas. |
| F3 | Dashboard Vue 3 | hecho (código) | #4 | `services/web/`: Vue 3 + Vite + Router + Pinia + Axios + Tailwind CSS v4 + GSAP + Lucide icons. Panel de control dark mode (slate-950) mobile-first con resumen de estado, grid responsivo (1/2/3 col), tarjetas con animaciones GSAP (luz, temperatura, cortinas, ocupación), escenas rápidas, vista de detalle con sliders y preview, temperaturas redondeadas a 1 decimal, colores térmicos (azul frío <21°C / naranja óptimo 21-27°C / rojo caliente >27°C), WebSocket tiempo real. |
| F4 | Despliegue (HiveMQ, Render, Vercel) | pendiente | | En espera: verificar todo en local primero. |
| F5 | README, video y checklist | pendiente | | |
Estados: pendiente · en curso · bloqueado · hecho.

## Siguiente paso
En tu máquina con Docker (este entorno no tiene Docker):
1. `docker run --rm -v ${PWD}/services/mosquitto:/mosquitto/config eclipse-mosquitto:2 mosquitto_passwd -c -b /mosquitto/config/pwfile smartroom smartroom` (generar credenciales)
2. `git pull` + `docker compose up mosquitto simulator nodered` — verificar broker y API
3. `cd services/web && npm install && npm run dev` — abrir http://localhost:5173, verificar 4 tarjetas, WebSocket en tiempo real, cambiar escena desde UI
4. Cuando todo funcione en local, avisar para considerar F4.

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
