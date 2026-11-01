// Servidor HTTP simple para la API de SmartRoom.
// Implementa los endpoints de docs/01-arquitectura.md sin depender de flujos
// de Node-RED (más confiable y fácil de depurar en modo headless).
const http = require('http');
const url = require('url');
const mqtt = require('mqtt');

const PORT = process.env.PORT || 1880;
const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const MQTT_USER = process.env.MQTT_USER || '';
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || '';
const PROPERTY_ID = process.env.PROPERTY_ID || 'demo-hotel';
const DEMO_KEY = process.env.DEMO_KEY || 'demo-local-key';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const VACANT_MINUTES = parseInt(process.env.VACANT_MINUTES || '2', 10);

// Validación defensiva de comandos (duplicada aquí para no depender del simulador).
const VALID_TYPES = ['set_scene', 'set_dimmer', 'set_setpoint', 'set_hvac_mode', 'set_curtains', 'sim_occupancy'];
const VALID_HVAC_MODES = ['auto', 'cool', 'heat', 'off'];
const VALID_SCENES = ['welcome', 'relax_sunset', 'work', 'cinema', 'night', 'eco'];

function validateCommand(cmd) {
  if (!cmd || typeof cmd !== 'object') {
    return { ok: false, reason: 'cuerpo debe ser un objeto JSON' };
  }
  const { type, value } = cmd;
  if (!type || typeof type !== 'string') {
    return { ok: false, reason: 'type es obligatorio y debe ser string' };
  }
  if (!VALID_TYPES.includes(type)) {
    return { ok: false, reason: `type '${type}' no es válido` };
  }
  switch (type) {
    case 'set_scene':
      if (!value || typeof value !== 'string' || !VALID_SCENES.includes(value)) {
        return { ok: false, reason: `escena '${value}' no existe` };
      }
      return { ok: true, value };
    case 'set_dimmer':
      if (!Number.isInteger(value) || value < 0 || value > 100) {
        return { ok: false, reason: 'set_dimmer value debe ser entero 0–100' };
      }
      return { ok: true, value };
    case 'set_setpoint':
      if (typeof value !== 'number' || !Number.isFinite(value) || value < 16 || value > 30 || (value * 2) % 1 !== 0) {
        return { ok: false, reason: 'set_setpoint value debe ser número 16–30, paso 0.5' };
      }
      return { ok: true, value };
    case 'set_hvac_mode':
      if (typeof value !== 'string' || !VALID_HVAC_MODES.includes(value)) {
        return { ok: false, reason: "set_hvac_mode value debe ser auto|cool|heat|off" };
      }
      return { ok: true, value };
    case 'set_curtains':
      if (!Number.isInteger(value) || value < 0 || value > 100) {
        return { ok: false, reason: 'set_curtains value debe ser entero 0–100' };
      }
      return { ok: true, value };
    case 'sim_occupancy':
      if (typeof value !== 'boolean') {
        return { ok: false, reason: 'sim_occupancy value debe ser booleano' };
      }
      return { ok: true, value };
    default:
      return { ok: false, reason: `type '${type}' no implementado` };
  }
}

// Estado en memoria: zoneId -> zona agregada.
const zones = {};
const events = [];
let mqttClient = null;
let startTime = Date.now();

// Inicializar zonas con estructura vacía.
const zoneIds = ['SUITE_PRESIDENCIAL_402', 'HAB_DELUXE_201', 'HAB_DELUXE_202', 'LOBBY_PB'];
zoneIds.forEach((zid) => {
  zones[zid] = {
    zone_id: zid,
    name: zid,
    lighting_scene: null,
    dimmer_level: null,
    thermostat_temp: null,
    thermostat_setpoint: null,
    hvac_mode: null,
    curtains_position: null,
    occupancy_status: null,
    devices_online: { lighting: false, climate: false, curtains: false, occupancy: false },
    pending_cmd_ids: [],
    updated_at: null,
  };
});

// Conectar a MQTT.
function connectMqtt() {
  const options = {};
  if (MQTT_USER && MQTT_PASSWORD) {
    options.username = MQTT_USER;
    options.password = MQTT_PASSWORD;
  }
  mqttClient = mqtt.connect(MQTT_URL, options);

  mqttClient.on('connect', () => {
    console.log('[api-server] conectado a MQTT');
    mqttClient.subscribe(`smartroom/${PROPERTY_ID}/+/+/state`, { qos: 1 }, (err) => {
      if (err) console.error('[api-server] error suscribiendo state:', err.message);
    });
    mqttClient.subscribe(`smartroom/${PROPERTY_ID}/+/+/status`, { qos: 1 }, (err) => {
      if (err) console.error('[api-server] error suscribiendo status:', err.message);
    });
  });

  mqttClient.on('message', (topic, payload) => {
    try {
      const parts = topic.split('/');
      // smartroom / property / zone / device / kind
      const zoneId = parts[2];
      const device = parts[3];
      const kind = parts[4];
      if (!zoneId || !device || !kind) return;

      const z = zones[zoneId];
      if (!z) return;

      if (kind === 'status') {
        z.devices_online = z.devices_online || {};
        z.devices_online[device] = (payload.toString() === 'online');
        z.updated_at = new Date().toISOString();
        return;
      }

      if (kind === 'state') {
        const state = JSON.parse(payload.toString());
        if (device === 'lighting') {
          z.lighting_scene = state.lighting_scene;
          z.dimmer_level = state.dimmer_level;
        } else if (device === 'climate') {
          z.thermostat_temp = state.thermostat_temp;
          z.thermostat_setpoint = state.thermostat_setpoint;
          z.hvac_mode = state.hvac_mode;
        } else if (device === 'curtains') {
          z.curtains_position = state.curtains_position;
        } else if (device === 'occupancy') {
          z.occupancy_status = state.occupancy_status;
        }
        z.last_cmd_id = state.last_cmd_id || null;
        z.updated_at = state.ts || new Date().toISOString();

        // Reglas de automatización R1 y R2.
        handleVacancyRules(zoneId, state.occupancy_status);
      }
    } catch (e) {
      console.error('[api-server] error procesando mensaje MQTT:', e.message);
    }
  });

  mqttClient.on('error', (err) => {
    console.error('[api-server] error MQTT:', err.message);
  });
}

// Publicar comando a un dispositivo específico por MQTT.
function publishCommand(zoneId, device, cmd) {
  if (!mqttClient || !mqttClient.connected) return false;
  const topic = `smartroom/${PROPERTY_ID}/${zoneId}/${device}/cmd`;
  mqttClient.publish(topic, JSON.stringify(cmd), { qos: 1 }, (err) => {
    if (err) console.error('[api-server] error publicando comando:', err.message);
  });
  return true;
}

// Emitir evento.
function emitEvent(zoneId, type, message, data = {}) {
  const event = {
    id: Math.random().toString(36).slice(2),
    ts: new Date().toISOString(),
    zone_id: zoneId,
    type,
    message,
    data,
  };
  events.unshift(event);
  if (events.length > 100) events.length = 100;
  console.log(`[api-server] evento: ${type} ${zoneId} - ${message}`);
}

// Reglas de automatización R1 (vacancia) y R2 (llegada).
function handleVacancyRules(zoneId, occupied) {
  const now = Date.now();
  const vacantKey = `vacant_${zoneId}`;
  const vacantStart = global[vacantKey];

  if (occupied) {
    const z = zones[zoneId];
    // R2: llegada y estaba en eco -> welcome
    if (z && z.lighting_scene === 'eco') {
      const cmd = { cmd_id: Math.random().toString(36).slice(2), type: 'set_scene', value: 'welcome', origin: 'automation', ts: new Date().toISOString() };
      publishCommand(zoneId, 'lighting', cmd);
      emitEvent(zoneId, 'automation', 'Regla R2 llegada: escena welcome');
    }
    global[vacantKey] = null;
    return;
  }

  // No ocupada: iniciar/contar vacancia
  if (!vacantStart) {
    global[vacantKey] = now;
    return;
  }
  const minutesIdle = (now - vacantStart) / 60000;
  const z = zones[zoneId];
  if (minutesIdle >= VACANT_MINUTES && z && z.lighting_scene !== 'eco') {
    // R1: vacancia >= umbral -> eco
    const cmdLight = { cmd_id: Math.random().toString(36).slice(2), type: 'set_scene', value: 'eco', origin: 'automation', ts: new Date().toISOString() };
    const cmdCurtains = { cmd_id: Math.random().toString(36).slice(2), type: 'set_curtains', value: 0, origin: 'automation', ts: new Date().toISOString() };
    const cmdClimate = { cmd_id: Math.random().toString(36).slice(2), type: 'set_setpoint', value: 25.0, origin: 'automation', ts: new Date().toISOString() };
    publishCommand(zoneId, 'lighting', cmdLight);
    publishCommand(zoneId, 'curtains', cmdCurtains);
    publishCommand(zoneId, 'climate', cmdClimate);
    emitEvent(zoneId, 'automation', 'Regla R1 vacancia: escena eco');
  }
}

// Enviar respuesta JSON.
function sendJson(res, statusCode, body) {
  const data = JSON.stringify(body || {});
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-demo-key',
  });
  res.end(data);
}

// Manejar preflight CORS.
function handleOptions(res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': CORS_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-demo-key',
    'Access-Control-Max-Age': '86400',
  });
  res.end();
}

// Verificar clave de demo.
function checkDemoKey(req) {
  const key = req.headers['x-demo-key'];
  return key && key === DEMO_KEY;
}

// Leer cuerpo de POST.
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  // CORS preflight.
  if (method === 'OPTIONS') {
    handleOptions(res);
    return;
  }

  // GET /api/health
  if (method === 'GET' && path === '/api/health') {
    const mqttConnected = mqttClient ? mqttClient.connected : false;
    sendJson(res, 200, {
      status: 'ok',
      mqtt: mqttConnected ? 'connected' : 'disconnected',
      zones: Object.keys(zones).length,
      uptime_s: Math.floor((Date.now() - startTime) / 1000),
    });
    return;
  }

  // GET /api/zones
  if (method === 'GET' && path === '/api/zones') {
    sendJson(res, 200, Object.values(zones));
    return;
  }

  // GET /api/zones/:zone_id
  const zoneMatch = path.match(/^\/api\/zones\/([^/]+)$/);
  if (method === 'GET' && zoneMatch) {
    const zid = zoneMatch[1];
    const z = zones[zid];
    if (!z) {
      sendJson(res, 404, { error: { code: 'not_found', message: 'zona no existe' } });
      return;
    }
    sendJson(res, 200, z);
    return;
  }

  // POST /api/zones/:zone_id/commands
  const cmdMatch = path.match(/^\/api\/zones\/([^/]+)\/commands$/);
  if (method === 'POST' && cmdMatch) {
    const zid = cmdMatch[1];
    const z = zones[zid];
    if (!z) {
      sendJson(res, 404, { error: { code: 'not_found', message: 'zona no existe' } });
      return;
    }

    if (!checkDemoKey(req)) {
      sendJson(res, 401, { error: { code: 'unauthorized', message: 'clave de demo inválida' } });
      return;
    }

    try {
      const body = await readBody(req);
      const { type, value } = body;
      const validation = validateCommand({ type, value });
      if (!validation.ok) {
        sendJson(res, 400, { error: { code: 'invalid_value', message: validation.reason } });
        return;
      }

      const cmd_id = Math.random().toString(36).slice(2);
      const cmd = { cmd_id, type, value, origin: 'dashboard', ts: new Date().toISOString() };

      // Publicar comando a todos los dispositivos de la zona (iluminación, clima, cortinas).
      ['lighting', 'climate', 'curtains'].forEach((device) => {
        publishCommand(zid, device, cmd);
      });

      zones[zid].pending_cmd_ids = zones[zid].pending_cmd_ids || [];
      zones[zid].pending_cmd_ids.push(cmd_id);

      emitEvent(zid, 'command', `Comando ${type} enviado`, cmd);

      sendJson(res, 202, { cmd_id });
      return;
    } catch (e) {
      sendJson(res, 400, { error: { code: 'invalid_body', message: 'cuerpo JSON inválido' } });
      return;
    }
  }

  // GET /api/events
  if (method === 'GET' && path === '/api/events') {
    const limit = Math.min(parseInt(parsedUrl.query.limit || '50', 10), 100);
    sendJson(res, 200, events.slice(0, limit));
    return;
  }

  // Ruta no encontrada.
  sendJson(res, 404, { error: { code: 'not_found', message: 'ruta no encontrada' } });
});

connectMqtt();

server.listen(PORT, () => {
  console.log(`[api-server] escuchando en puerto ${PORT}`);
});

process.on('SIGINT', () => {
  console.log('[api-server] apagando...');
  if (mqttClient) mqttClient.end();
  server.close();
  process.exit(0);
});
