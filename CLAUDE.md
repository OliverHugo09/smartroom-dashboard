# SmartRoom Hospitality Dashboard

**Nombre para el CV:** "SmartRoom Hospitality Dashboard: Integración IoT de sistemas Lutron vía Node-RED y Vue 3".

## Propósito
Portafolio para postular a **Desarrollador de Integraciones en Rowan Networks** (Playa del Carmen; clientes de hospitalidad, Node-RED, MQTT, APIs, frontend). Demuestra, en un proyecto pequeño y terminable, la cadena completa: dispositivos → MQTT → Node-RED (lógica, API, tiempo real) → SPA Vue 3.

Es un proyecto **independiente** (no depende de ningún otro repo). Todo es una **simulación**: no se usa ninguna API real de Lutron ni de otro fabricante, y no hay afiliación con ellos. Nombres como "Lutron HomeWorks" se usan solo como etiqueta descriptiva de un sistema simulado. En el CV y el README decir "simulación inspirada en el modelo de zonas y escenas de sistemas como Lutron", nunca "integración real con Lutron".

## Qué hace
Un sistema centralizado de control de habitaciones de hotel: iluminación con escenas y atenuación, termostatos HVAC, cortinas motorizadas y sensores de presencia. Los dispositivos simulados publican su estado por MQTT; Node-RED agrega, valida comandos, ejecuta reglas de automatización y expone una API REST y un WebSocket; el dashboard Vue 3 muestra el estado en tiempo real y permite controlar cada zona.

## Protocolo de trabajo del agente (léelo siempre)
1. Lee `docs/ESTADO.md` primero: qué está hecho, qué sigue, decisiones y bloqueos.
2. Lee `docs/01-arquitectura.md`: contratos (topics, payloads, REST, WebSocket, escenas, reglas). Es la fuente de verdad.
3. Lee solo el archivo de la fase en curso: `docs/fases/Fx-*.md`. Si tocas despliegue, lee `docs/03-despliegue.md`.
4. Trabaja **una fase a la vez**, en el orden de `docs/02-roadmap.md`. Antes de implementar, propón un plan breve y espera confirmación.
5. No cambies un contrato sin actualizar `docs/01-arquitectura.md` en el mismo commit.
6. Una fase termina cuando cumple sus criterios de aceptación, pasan las pruebas, se actualiza `docs/ESTADO.md` y hay commit ligado a un Issue (`Closes #n`).
7. Si falta información, pregunta. No inventes credenciales ni límites de planes gratuitos: verifícalos en la página oficial del proveedor y anota la fecha en `docs/03-despliegue.md`.
8. Si hay retraso, recorta según el "Orden de recorte" del roadmap; el flujo de punta a punta (comando → dispositivo → estado → pantalla) nunca se recorta.

## Stack
- Dispositivos simulados: Node.js (cliente MQTT)
- Broker MQTT: Mosquitto (local) / HiveMQ Cloud Serverless (nube)
- Orquestación y API: Node-RED (HTTP in/out + WebSocket) · Render (nube, Docker)
- Frontend: Vue 3 + Vite + Vue Router + Pinia + Axios · Vercel (nube, plan Hobby: uso personal no comercial)
- Infra local: Docker Compose (Windows con Docker Desktop) · CI: GitHub Actions
- Sin base de datos: el estado vive en mensajes MQTT *retained* y en la memoria de Node-RED.

## Reglas no negociables
- Secretos solo en variables de entorno (`.env` local; paneles de Render/Vercel/GitHub). Nunca en git. Mantener `.env.local.example` y `.env.cloud.example`.
- Datos 100 % simulados; nada real de clientes.
- En la nube el editor de Node-RED va **deshabilitado** (o con `adminAuth`). Nunca público sin autenticación.
- El frontend es público: `VITE_DEMO_KEY` no es un secreto. Los comandos se validan en el servidor, con límite de tasa y CORS restringido; solo afectan datos simulados.
- Servicios en la nube **sin estado en disco** (disco efímero): flujos y configuración dentro de la imagen.
- Código e identificadores en inglés; documentación en español; commits en inglés (Conventional Commits).
- Cada servicio con endpoint de salud, README breve y pruebas mínimas.

## Mapa de documentación
| Archivo | Para qué |
|---|---|
| `docs/ESTADO.md` | Estado vivo (el agente lo actualiza siempre) |
| `docs/00-contexto.md` | Vacante, qué demuestra, honestidad sobre lo simulado |
| `docs/01-arquitectura.md` | Contratos y arquitectura |
| `docs/02-roadmap.md` | Fases, orden, tiempos, recorte de alcance |
| `docs/03-despliegue.md` | Render + HiveMQ + Vercel, estrategia de despertar, seguridad, checklist |
| `docs/04-claude-code-setup.md` | Skills, subagentes, hooks, convenciones de Git |
| `docs/fases/F0..F5` | Especificación de cada fase |

## Estructura del repo
```
smartroom-dashboard/
├── CLAUDE.md
├── README.md                # para humanos, se escribe en F5
├── docker-compose.yml       # local: mosquitto + nodered(+simulador) + web
├── .env.local.example
├── .env.cloud.example
├── docs/
├── services/
│   ├── mosquitto/           # F0
│   ├── simulator/           # F1
│   ├── nodered/             # F2 (Dockerfile, settings.js, flows.json, start.js)
│   └── web/                 # F3 (Vue 3)
├── scripts/                 # smoke test de punta a punta
├── .claude/                 # skills, agents, hooks
└── .github/workflows/       # CI
```
