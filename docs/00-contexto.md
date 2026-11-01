# Contexto

## Vacante
Desarrollador de Integraciones, Rowan Networks, Playa del Carmen (presencial). Piden: Frontend y Backend (React y backend), APIs, webhooks, servicios web, Git/GitHub, Docker, Node-RED, MQTT, scripts y automatización. Plus: integración de sistemas de terceros, bases de datos, automatización, IoT y monitoreo.

## Pistas sobre el trabajo real (inferidas de un perfil público, no confirmadas)
Una persona en prácticas en la empresa menciona: migración de un sistema web legado a Vue 3 + Vite + Vue Router + Pinia con Axios sobre una API REST en Node.js; Scrum con GitHub Projects e Issues ligados a commits; y monitoreo/automatización de redes para clientes de hospitalidad con PRTG, SNMP y Node-RED sobre REST y MQTT. Usar como pista para preguntar en entrevista, no para afirmar que se conoce su sistema.

## Qué demuestra este proyecto
| Requisito | Dónde |
|---|---|
| MQTT | Tópicos, retained, LWT, QoS; broker local y en la nube |
| Node-RED | Agregación, validación de comandos, reglas, API REST y WebSocket |
| APIs y servicios web | REST de lectura y comandos, contrato documentado |
| Frontend moderno | Vue 3 + Vite + Pinia + Router + Axios, tiempo real |
| Docker | Compose local; imagen propia de Node-RED en Render |
| Git/GitHub | Issues por fase, commits ligados, CI |
| IoT / hospitalidad | Zonas de hotel, escenas, ocupación, automatización de ahorro |
| Integración de terceros | Modelo de adaptador: dispositivos simulados ↔ MQTT ↔ API |
| Aprendizaje y adaptación | Stack parecido al del equipo (Vue/Pinia/Node-RED) y despliegue en la nube |

## Honestidad (obligatoria en README y entrevista)
- Todo es simulado; no hay integración real con Lutron ni con hardware.
- Los servicios gratuitos se duermen: la primera carga puede tardar hasta ~1 min.
- Una integración real implicaría usar las interfaces de integración que el fabricante documente oficialmente (a investigar), con adaptadores que traduzcan a este mismo contrato MQTT. Está en "Próximos pasos".

## Historia de 2 minutos
"Simulé el control de habitaciones de un hotel. Dispositivos de iluminación, clima, cortinas y presencia publican su estado por MQTT; Node-RED los agrega, valida los comandos del recepcionista, aplica reglas de ahorro cuando la habitación queda vacía y expone una API y un WebSocket. Un dashboard en Vue 3 muestra todo en tiempo real y permite cambiar escenas, atenuación y temperatura, con la ida y vuelta completa hasta el dispositivo. Está desplegado en Render, HiveMQ Cloud y Vercel."

## Criterios de éxito
1. El link abre un dashboard que, tras despertar, muestra 4 zonas con datos en vivo.
2. Cambiar una escena desde la UI recorre: REST → Node-RED → MQTT → dispositivo simulado → estado → WebSocket → UI.
3. Dejar vacía una habitación activa la regla de ahorro y se ve en la UI y en el registro de eventos.
4. README claro con diagrama, GIF/video, limitaciones y enlace a la demo.
5. El autor puede explicar cada decisión.
