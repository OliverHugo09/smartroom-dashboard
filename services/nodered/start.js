// Punto de entrada de Node-RED para SmartRoom.
// Inicia el servidor HTTP de la API (api-server.js) que implementa los endpoints
// de docs/01-arquitectura.md. Opcionalmente arranca el simulador como proceso hijo
// si SIMULATOR_ENABLED=true (para la nube: un solo contenedor con dos procesos).
require('dotenv').config();

const { spawn } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 1880;
const SIMULATOR_ENABLED = process.env.SIMULATOR_ENABLED === 'true';
const SIMULATOR_DIR = path.join(__dirname, '..', 'simulator');

// Iniciar servidor HTTP de la API.
require('./api-server');

// Si está habilitado, lanzar el simulador como proceso hijo.
if (SIMULATOR_ENABLED) {
  console.log('[nodered] arrancando simulador como proceso hijo');
  const sim = spawn('node', ['src/index.js'], {
    cwd: SIMULATOR_DIR,
    env: {
      ...process.env,
      MQTT_URL: process.env.MQTT_URL,
      MQTT_USER: process.env.MQTT_USER,
      MQTT_PASSWORD: process.env.MQTT_PASSWORD,
      SIMULATOR_ENABLED: 'true',
    },
    stdio: 'inherit',
  });

  sim.on('error', (err) => {
    console.error('[nodered] error lanzando simulador:', err.message);
  });

  sim.on('exit', (code, signal) => {
    console.log(`[nodered] simulador salió con código ${code} y señal ${signal}`);
  });
}

process.on('SIGINT', () => {
  console.log('[nodered] apagando...');
  process.exit(0);
});
