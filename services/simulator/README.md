# Simulador de dispositivos (F1)

Proceso Node.js único que simula los dispositivos de las 4 zonas del hotel (iluminación, clima, cortinas, presencia) sobre MQTT.

## Contratos
Ver `docs/01-arquitectura.md` (topics, payloads, escenas, validación, comportamiento).

## Variables de entorno
| Variable | Default | Descripción |
|---|---|---|
| `MQTT_URL` | `mqtt://localhost:1883` | URL del broker MQTT |
| `MQTT_USER` | (vacío) | Usuario MQTT |
| `MQTT_PASSWORD` | (vacío) | Contraseña MQTT |
| `SIMULATOR_ENABLED` | `true` | Si `false`, el proceso sale sin hacer nada |

## Ejecutar localmente
```bash
cd services/simulator
npm install
npm start
```
Requiere Mosquitto arriba (`docker compose up mosquitto`) con usuario/clave en `.env.local.example`.

## Pruebas
```bash
npm test
```

## Criterios de aceptación F1
- Con Mosquitto y el simulador arriba, `mosquitto_sub -t 'smartroom/#' -v` muestra estados de 4 zonas × 4 dispositivos.
- Publicar `{"cmd_id":"x","type":"set_dimmer","value":60}` en el topic `cmd` de iluminación produce una transición gradual hasta 60 y el estado incluye `last_cmd_id":"x"`.
- Detener el simulador deja los `status` en `offline` (Last Will).
- Comandos inválidos se ignoran sin romper el proceso.

## Docker
Se incluye como servicio `simulator` en `docker-compose.yml` (perfil local).
