// Punto de entrada del simulador de dispositivos.
// Fuente: docs/fases/F1-simulador.md y docs/01-arquitectura.md.
require('dotenv').config();

const { PROPERTY_ID, zones, devices, initialState } = require('../lib/zones');
const { scenes, isValidScene, getScene } = require('../lib/scenes');
const { validateCommand } = require('../lib/validation');
const { tick, thermalDrift, TICK_MS } = require('../lib/transitions');
const { SimulatorMqtt } = require('../mqtt');

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const MQTT_USER = process.env.MQTT_USER || '';
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || '';
const SIMULATOR_ENABLED = process.env.SIMULATOR_ENABLED !== 'false';

if (!SIMULATOR_ENABLED) {
  console.log('[simulator] desactivado por SIMULATOR_ENABLED=false');
  process.exit(0);
}

// Estado en memoria: zoneId -> device -> state.
const deviceState = {};

// Último timestamp de transición por dispositivo (para limitar a 1 msg/s).
const lastPublish = {};

// Inicializar estados.
zones.forEach((zone) => {
  deviceState[zone.zone_id] = {};
  devices.forEach((device) => {
    deviceState[zone.zone_id][device] = initialState(zone.zone_id);
  });
});

// Presencia aleatoria en zonas distintas a la suite (cada 1–3 min).
function startRandomOccupancy(mqttClient) {
  setInterval(() => {
    zones.forEach((zone) => {
      if (zone.zone_id === 'SUITE_PRESIDENCIAL_402') return; // la suite solo cambia con sim_occupancy
      const st = deviceState[zone.zone_id].occupancy;
      const next = Math.random() < 0.5;
      if (next !== st.occupancy_status) {
        st.occupancy_status = next;
        st.ts = new Date().toISOString();
        mqttClient.publishState(zone.zone_id, 'occupancy', st);
        mqttClient.publishStatus(zone.zone_id, 'occupancy', 'online');
      }
    });
  }, 60000 + Math.random() * 120000);
}

// Latido cada 30 s: republica estado de todos los dispositivos.
function startHeartbeat(mqttClient) {
  setInterval(() => {
    zones.forEach((zone) => {
      devices.forEach((device) => {
        const st = deviceState[zone.zone_id][device];
        st.ts = new Date().toISOString();
        mqttClient.publishState(zone.zone_id, device, st);
        mqttClient.publishStatus(zone.zone_id, device, 'online');
      });
    });
  }, 30000);
}

// Aplica un comando recibido.
function handleCommand(zoneId, device, cmd) {
  const validation = validateCommand(cmd);
  if (!validation.ok) {
    console.warn(`[simulator] comando inválido ${zoneId}/${device}:`, validation.reason);
    return; // ignorar sin romper
  }

  const st = deviceState[zoneId][device];
  st.last_cmd_id = cmd.cmd_id || null;
  st.ts = new Date().toISOString();

  const { type, value } = cmd;

  switch (type) {
    case 'set_scene': {
      const scene = getScene(value);
      st.lighting_scene = value;
      // La escena se aplica progresivamente vía transiciones.
      // Aquí marcamos los targets; el tick los traslada gradualmente.
      st._target_dimmer = scene.dimmer;
      st._target_curtains = scene.curtains;
      st._target_setpoint = scene.setpoint;
      break;
    }
    case 'set_dimmer':
      st._target_dimmer = value;
      break;
    case 'set_setpoint':
      st._target_setpoint = value;
      break;
    case 'set_hvac_mode':
      st.hvac_mode = value;
      break;
    case 'set_curtains':
      st._target_curtains = value;
      break;
    case 'sim_occupancy':
      if (device === 'occupancy') {
        st.occupancy_status = value;
      }
      break;
  }

  // Publicar estado inmediato con eco de last_cmd_id.
  mqtt.publishState(zoneId, device, st);
  mqtt.publishStatus(zoneId, device, 'online');
}

// Loop de transiciones: cada TICK_MS avanza dimmer/cortinas/temperatura hacia targets.
function startTransitions(mqttClient) {
  setInterval(() => {
    zones.forEach((zone) => {
      devices.forEach((device) => {
        const st = deviceState[zone.zone_id][device];

        const updates = {};
        let changed = false;

        if (st._target_dimmer !== undefined && st.dimmer_level !== st._target_dimmer) {
          const s = tick(st, { dimmer_level: st._target_dimmer });
          st.dimmer_level = s.dimmer_level;
          if (s.reached || st.dimmer_level === st._target_dimmer) {
            delete st._target_dimmer;
          }
          changed = true;
        }

        if (st._target_curtains !== undefined && st.curtains_position !== st._target_curtains) {
          const s = tick(st, { curtains_position: st._target_curtains });
          st.curtains_position = s.curtains_position;
          if (s.reached || st.curtains_position === st._target_curtains) {
            delete st._target_curtains;
          }
          changed = true;
        }

        if (device === 'climate') {
          // temperatura se acerca al setpoint
          if (st.hvac_mode !== 'off') {
            const s = tick(st, { thermostat_temp: st.thermostat_setpoint });
            st.thermostat_temp = s.thermostat_temp;
            if (s.reached || Math.abs(st.thermostat_temp - st.thermostat_setpoint) < 0.05) {
              // reached aproximado
            }
            changed = true;
          } else {
            // deriva hacia 26 °C
            const drifted = thermalDrift(st);
            if (drifted.thermostat_setpoint !== st.thermostat_setpoint) {
              st.thermostat_setpoint = drifted.thermostat_setpoint;
              changed = true;
            }
          }
        }

        if (changed) {
          st.ts = new Date().toISOString();
          // Tope de 1 msg/s por topic.
          const now = Date.now();
          const key = `${zone.zone_id}/${device}`;
          if (!lastPublish[key] || now - lastPublish[key] >= 1000) {
            mqttClient.publishState(zone.zone_id, device, st);
            mqttClient.publishStatus(zone.zone_id, device, 'online');
            lastPublish[key] = now;
          }
        }
      });
    });
  }, TICK_MS);
}

const mqtt = new SimulatorMqtt({
  url: MQTT_URL,
  user: MQTT_USER,
  password: MQTT_PASSWORD,
  onCommand: handleCommand,
});

// Last Will: al desconectar, publicar status offline en todos los topics de status.
// (mqtt.js maneja el connect; aquí configuramos el will al conectar si fuera necesario.
 // La librería mqtt soporta will en las opciones de connect; lo dejamos a disposición.)

mqtt.connect();

// Esperar a que esté conectado para iniciar loops y publicar estados iniciales.
mqtt.client.on('connect', () => {
  console.log('[simulator] conectado al broker MQTT');

  // Publicar estado inicial y status online de todos los dispositivos (retained).
  zones.forEach((zone) => {
    devices.forEach((device) => {
      const st = deviceState[zone.zone_id][device];
      st.ts = new Date().toISOString();
      mqtt.publishState(zone.zone_id, device, st);
      mqtt.publishStatus(zone.zone_id, device, 'online');
    });
  });

  startRandomOccupancy(mqtt);
  startHeartbeat(mqtt);
  startTransitions(mqtt);

  console.log(`[simulator] ${zones.length} zonas × ${devices.length} dispositivos publicados`);
});

process.on('SIGINT', () => {
  console.log('[simulator] apagando...');
  zones.forEach((zone) => {
    devices.forEach((device) => {
      mqtt.publishStatus(zone.zone_id, device, 'offline');
    });
  });
  mqtt.end();
  process.exit(0);
});
