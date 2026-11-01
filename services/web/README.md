# Dashboard Web (F3)

SPA de Vue 3 que muestra el estado en tiempo real de las zonas del hotel y permite controlar iluminación, clima y cortinas.

## Stack
Vue 3 + Vite + Vue Router + Pinia + Axios. Despliegue en Vercel.

## Variables de entorno (build)
| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `/api` | URL de la API de Node-RED |
| `VITE_WS_URL` | `ws://localhost:1880/api/ws/zones` | URL del WebSocket |
| `VITE_DEMO_KEY` | `demo-local-key` | Clave de demo (pública, envía en header `x-demo-key`) |

## Ejecutar localmente
```bash
cd services/web
npm install
npm run dev   # http://localhost:5173
```
Requiere Node-RED y Mosquitto arriba (`docker compose up mosquitto nodered`).

## Build
```bash
npm run build   # genera dist/
```

## Despliegue en Vercel
- Importar repo, **Root Directory** = `services/web`, preset Vite.
- Variables: `VITE_API_URL`, `VITE_WS_URL`, `VITE_DEMO_KEY`.
- `vercel.json` reescribe todas las rutas a `index.html` (SPA con historial).

## Criterios de aceptación F3
- `npm run dev` levanta en `http://localhost:5173`.
- Carga zonas desde `GET /api/zones` y muestra 4 tarjetas.
- WebSocket recibe `zone_update` en tiempo real.
- Cambiar escena desde la UI → `POST /api/zones/:id/commands` → confirma en la tarjeta.
- Banner "Despertando servicios" mientras consulta `/api/health`.
