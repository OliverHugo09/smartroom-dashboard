# F2 — Node-RED: agregación, comandos, reglas, REST y WebSocket

**Estimado:** 3 h · **Depende de:** F1 · **Carpeta:** `services/nodered/`

## Objetivo
El cerebro del sistema: consume el estado de los dispositivos, mantiene el modelo agregado de zonas, valida y enruta comandos, aplica reglas y expone la API y el tiempo real. Debe correr igual en local y en Render.

## Contratos
Todo en `docs/01-arquitectura.md` (REST, WebSocket, comandos, reglas, eventos).

## Alcance
Tabs recomendados (uno por responsabilidad, con comentarios):
1. **Ingesta:** suscripción a `.../state` y `.../status`; validación; actualización del contexto (modelo agregado por zona); generación de eventos `state_change` y `device_status`.
2. **API REST:** `GET /api/health`, `/api/zones`, `/api/zones/:zone_id`, `/api/events`; `POST /api/zones/:zone_id/commands` con clave demo, validación, límite de tasa por IP y CORS.
3. **Comandos:** traducción de comandos a topics `cmd` (incluida la expansión de `set_scene` a tres comandos), `cmd_id`, evento `command`, `pending_cmd_ids`.
4. **Reglas:** R1–R4 de la arquitectura con temporizadores por zona.
5. **Tiempo real:** nodo WebSocket en `/ws/zones`: `hello`, `zone_update`, `event`; manejo de `ping` del cliente.
Además:
- `services/nodered/Dockerfile`, `settings.js` (puerto desde `PORT`, editor desactivable, `credentialSecret` desde entorno, CORS), `flows.json` versionado sin credenciales, y `start.js` que lanza Node-RED y, opcionalmente, el simulador.
- Servicio `nodered` en Compose (local, editor activo).
- Script `scripts/smoke-e2e.mjs`: envía un comando por REST y espera la actualización por WebSocket con `last_cmd_id` correspondiente.
No incluye: base de datos, autenticación de usuarios.

## Tareas
- [ ] Imagen y `settings.js` listos para producción
- [ ] Tab Ingesta y modelo agregado (reconstrucción desde retained al arrancar)
- [ ] Tab API REST con validación, clave demo, límite de tasa y CORS
- [ ] Tab Comandos (incluye expansión de escenas)
- [ ] Tab Reglas R1–R4
- [ ] Tab Tiempo real (WebSocket)
- [ ] `start.js` y variable `SIMULATOR_ENABLED`
- [ ] Smoke e2e y documentación de flujos (README con diagrama)
- [ ] Prueba temprana de nube (ver `docs/03-despliegue.md`)

## Criterios de aceptación
- `GET /api/zones` devuelve 4 zonas con el formato del modelo agregado.
- `POST .../commands` con clave válida responde 202; sin clave, 401; valor fuera de rango, 400; demasiadas peticiones, 429.
- El smoke e2e pasa: comando → cambio de estado → mensaje WebSocket con el mismo `cmd_id`.
- Dejar vacía la suite (`sim_occupancy: false`) activa la escena `eco` tras `VACANT_MINUTES` y genera evento `automation`; volver a ocuparla aplica `welcome`.
- Reiniciar el contenedor reconstruye el estado desde retained sin pasos manuales.
- Con `NODERED_EDITOR_ENABLED=false` el editor no responde.
