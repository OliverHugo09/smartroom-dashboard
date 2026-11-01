# Node-RED (F2)

Orquestación de SmartRoom: agrega estado MQTT, valida comandos, ejecuta reglas de automatización y expone API REST + WebSocket.

## Contratos
Ver `docs/01-arquitectura.md` (topics, payloads, REST, WebSocket, escenas, reglas).

## Variables de entorno
| Variable | Default | Descripción |
|---|---|---|
| `PORT` | `1880` | Puerto del servidor Node-RED |
| `MQTT_URL` | `mqtt://localhost:1883` | Broker MQTT |
| `MQTT_USER` | (vacío) | Usuario MQTT |
| `MQTT_PASSWORD` | (vacío) | Contraseña MQTT |
| `PROPERTY_ID` | `demo-hotel` | ID de la propiedad |
| `SIMULATOR_ENABLED` | `false` | Si `true`, arranca el simulador como proceso hijo (nube) |
| `NODERED_EDITOR_ENABLED` | `false` | Si `true`, habilita el editor de Node-RED |
| `NODERED_CREDENTIAL_SECRET` | (requerido) | Secreto de credenciales de Node-RED |
| `DEMO_KEY` | (requerido) | Clave para comandos (header `x-demo-key`) |
| `CORS_ORIGIN` | `*` | Origen permitido para CORS |
| `VACANT_MINUTES` | `2` | Minutos de vacancia para regla R1 |
| `RATE_LIMIT_PER_MIN` | `60` | Límite de tasa por IP |

## Ejecutar localmente
```bash
cd services/nodered
npm install
npm start
```
Requiere Mosquitto arriba. En local el simulador se ejecuta por separado (`services/simulator/`).

## Pruebas
```bash
npm test
```

## Endpoints
- `GET /api/health` — estado, conexión MQTT, zonas, uptime
- `GET /api/zones` — lista de zonas (modelo agregado)
- `GET /api/zones/:zone_id` — una zona
- `POST /api/zones/:zone_id/commands` — comando (header `x-demo-key`)
- `GET /api/events?limit=50` — últimos eventos
- `WebSocket /api/ws/zones` — tiempo real (`zone_update`, `event`, `hello`)
