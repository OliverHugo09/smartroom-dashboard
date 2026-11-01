# SmartRoom Hospitality Dashboard

Simulación de control de habitaciones de hotel: dispositivos → MQTT → Node-RED (API REST + WebSocket) → SPA Vue 3.

## Estado
Fase F0 (setup) pendiente. Véase `docs/ESTADO.md` y `docs/02-roadmap.md`.

## Documentación
- `docs/01-arquitectura.md` — contratos y arquitectura (fuente de verdad)
- `docs/02-roadmap.md` — fases y orden de trabajo
- `docs/03-despliegue.md` — despliegue en Render + HiveMQ + Vercel
- `docs/fases/Fx-*.md` — especificación de cada fase

## Stack
- Simulador: Node.js + MQTT
- Broker: Mosquitto (local) / HiveMQ Cloud (nube)
- API: Node-RED (Render)
- Frontend: Vue 3 + Vite (Vercel)

Todo es simulado. Sin integración real con Lutron ni hardware.
