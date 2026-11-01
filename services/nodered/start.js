// Punto de entrada de Node-RED para SmartRoom.
// En la nube (Render) arranca Node-RED y, si SIMULATOR_ENABLED=true,
// también el simulador como proceso hijo (dos procesos en un contenedor).
// Fuente: docs/03-despliegue.md — sección "Decisión: un solo contenedor con dos procesos".
require('dotenv').config();

const { spawn } = require('child_process');
const path = require('path');
const RED = require('node-red');

const SIMULATOR_ENABLED = process.env.SIMULATOR_ENABLED === 'true';
const SIMULATOR_DIR = path.join(__dirname, '..', 'simulator');

const settings = require('./settings');

// Inicializar Node-RED.
RED.init(settings.server || {}, settings);

// Servidor HTTP de Node-RED (expone /api y /ui si editor habilitado).
const server = require('http').createServer();
RED.start();
RED.api(server, settings);

server.listen(settings.uiPort, () => {
  console.log(`[nodered] escuchando en puerto ${settings.uiPort}`);
  console.log(`[nodered] editor habilitado: ${process.env.NODERED_EDITOR_ENABLED === 'true'}`);

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
});

process.on('SIGINT', () => {
  console.log('[nodered] apagando...');
  RED.stop();
  server.close();
  process.exit(0);
});
