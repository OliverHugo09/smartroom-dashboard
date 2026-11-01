# F1 — Simulador de dispositivos

**Estimado:** 1.5 h · **Depende de:** F0 · **Carpeta:** `services/simulator/`

## Objetivo
Un proceso Node.js que se comporta como los dispositivos de las 4 zonas: publica estado, recibe comandos, aplica transiciones realistas y reporta su disponibilidad.

## Contratos
Topics, payloads, escenas y comportamiento: `docs/01-arquitectura.md`.

## Alcance
- Un solo cliente MQTT para todos los dispositivos; soporta `mqtt://` y `mqtts://`, usuario/clave y reconexión.
- Por cada zona y dispositivo: `state` retained, `status` retained con Last Will, suscripción a `cmd`.
- Estado inicial de ejemplo: suite `SUITE_PRESIDENCIAL_402` en `relax_sunset`, dimmer 45, temperatura 21.5, setpoint 22.0, ocupada.
- Procesamiento de comandos con validación defensiva; eco de `last_cmd_id` en el siguiente estado.
- Transiciones (dimmer, cortinas, temperatura) y latido de 30 s; presencia aleatoria en zonas distintas a la suite; `sim_occupancy` fuerza el cambio.
- Lógica pura separada del cliente MQTT para poder probarla (`lib/` con funciones de escenas, transiciones y validación).
- Dockerfile y servicio `simulator` en Compose (perfil local).
No incluye: persistencia, interfaz gráfica.

## Tareas
- [ ] Modelo de zonas y dispositivos, presets de escenas
- [ ] Publicación de estado retained y `status` con LWT
- [ ] Manejo de comandos y transiciones
- [ ] Presencia aleatoria y `sim_occupancy`
- [ ] Pruebas unitarias (escenas, límites de validación, transiciones)
- [ ] README del servicio

## Criterios de aceptación
- Con Mosquitto y el simulador arriba, `mosquitto_sub -t 'smartroom/#' -v` muestra estados de 4 zonas × 4 dispositivos.
- Publicar `{"cmd_id":"x","type":"set_dimmer","value":60}` en el topic `cmd` de iluminación produce una transición gradual hasta 60 y el estado incluye `last_cmd_id":"x"`.
- Detener el simulador deja los `status` en `offline` (Last Will).
- Comandos inválidos se ignoran sin romper el proceso.
