# Roadmap

## Orden y dependencias
```
F0 Setup ─► F1 Simulador ─► F2 Node-RED (núcleo) ─► F3 Dashboard Vue ─► F4 Despliegue ─► F5 README/video
```
Estimado total: **~11 h** (cabe en un fin de semana). Desplegar en F4 es obligatorio, pero conviene hacer una prueba temprana de Render + HiveMQ al terminar F2 (30 min) para no descubrir problemas el domingo por la noche.

| Fase | Contenido | Estimado |
|---|---|---|
| F0 | Repo, estructura, Compose con Mosquitto, Issues | 1 h |
| F1 | Simulador de dispositivos MQTT | 1.5 h |
| F2 | Node-RED: agregación, comandos, reglas, REST, WebSocket | 3 h |
| F3 | Dashboard Vue 3 | 3.5 h |
| F4 | HiveMQ + Render + Vercel + prueba en nube | 1.5 h |
| F5 | README, GIF/video, limitaciones, checklist | 1 h |

## Plan sugerido
- **Sábado:** F0 → F1 → F2 → prueba temprana de nube.
- **Domingo:** F3 → F4 → F5.

## Orden de recorte (si hay retraso)
1. Regla R3 y evento `device_status` (R4). 2. Vista de detalle de zona (dejar solo controles en la tarjeta). 3. Cortinas en la UI. 4. Registro de eventos en la UI (dejar solo la API). 5. Pruebas de componentes (mantener humo e2e).
Nunca recortar: ciclo comando → dispositivo → estado → UI, la regla R1/R2 (es la que muestra "inteligencia"), despliegue en la nube ni la sección de limitaciones del README.

## Definición de terminado (cada fase)
- Cumple sus criterios de aceptación.
- Pruebas pasan (`npm test` o el script indicado).
- Contratos actualizados en `docs/01-arquitectura.md`.
- `docs/ESTADO.md` actualizado y commit ligado a un Issue.
- Sin secretos en el repo.
