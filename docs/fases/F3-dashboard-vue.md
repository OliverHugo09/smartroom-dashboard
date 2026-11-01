# F3 — Dashboard Vue 3

**Estimado:** 3.5 h · **Depende de:** F2 · **Carpeta:** `services/web/`

## Objetivo
SPA moderna que muestra las zonas en tiempo real y permite controlarlas, con experiencia cuidada para el tiempo de despertar del servidor.

## Stack
Vue 3 (`<script setup>`), Vite, Vue Router, Pinia, Axios, WebSocket nativo en un composable. Estilos con CSS propio simple (sin framework pesado). Texto de la interfaz en español.

## Alcance
- **Vista general (`/`):** tarjetas por zona con ocupación, temperatura vs consigna, escena, dimmer y cortinas; indicador de dispositivos fuera de línea.
- **Detalle de zona (`/zone/:id`):** selector de escenas, deslizador de atenuación, control de termostato (consigna ±0.5 y modo HVAC), control de cortinas y botón de demo "Simular salida/entrada del huésped" (`sim_occupancy`).
- **Registro de eventos:** panel con los últimos eventos (comandos, automatizaciones, alertas).
- **Estado de conexión:** banner "Despertando servicios (hasta ~1 min)" con reintentos de `/api/health`; indicador de WebSocket conectado/reconectando; mensajes de error claros.
- **Tiempo real:** snapshot por REST y luego WebSocket; reconexión con espera creciente; `ping` cada ~60 s solo con la pestaña visible.
- **Comandos:** interfaz con estado "aplicando…" hasta ver `last_cmd_id` en la actualización; deshabilitar controles mientras el dispositivo está offline.
- Etiqueta visible "Demo con datos simulados" y pie con enlace al repositorio.
- Stores Pinia: `zones`, `events`, `connection`. Capa de API en un solo módulo; variables `VITE_API_URL`, `VITE_WS_URL`, `VITE_DEMO_KEY`.
- Servicio `web` en Compose (desarrollo) y `vercel.json` con rewrite a `index.html`.
No incluye: autenticación de usuarios, i18n completo, gráficos históricos.

## Tareas
- [ ] Proyecto Vite + Router + Pinia + estructura (`components/`, `views/`, `stores/`, `api/`, `composables/`)
- [ ] Capa de API y composable de WebSocket con reconexión
- [ ] Vista general y tarjeta de zona
- [ ] Vista de detalle con controles
- [ ] Panel de eventos
- [ ] Banner de despertar y estados de error/carga
- [ ] Diseño responsivo (celular) y accesibilidad básica (foco, contraste, etiquetas)
- [ ] Pruebas de componentes clave y de los stores
- [ ] Capturas para el README

## Criterios de aceptación
- Con el stack local, la vista general muestra 4 zonas con datos vivos que cambian sin recargar.
- Cambiar escena o atenuación en la UI se refleja en la tarjeta tras la confirmación del dispositivo.
- Detener el backend muestra estado de reconexión; al volver, el snapshot se recarga solo.
- Se usa bien en un celular.
- `npm run build` pasa sin advertencias relevantes.
