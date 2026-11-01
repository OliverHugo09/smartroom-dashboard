// Cliente MQTT único para todos los dispositivos del simulador.
// Fuente: docs/01-arquitectura.md — sección Topics MQTT y Comportamiento del simulador.
const mqtt = require('mqtt');

const { PROPERTY_ID } = require('./lib/zones');

const KINDS = ['state', 'cmd', 'status'];

// Construye un topic: smartroom/<property>/<zone>/<device>/<kind>
function topic(zoneId, device, kind) {
  return `smartroom/${PROPERTY_ID}/${zoneId}/${device}/${kind}`;
}

// Topics de suscripción para el simulador (cmd por zona/dispositivo).
function cmdTopic(zoneId, device) {
  return topic(zoneId, device, 'cmd');
}

// Patrón de todos los cmd del property.
function allCmdPattern() {
  return `smartroom/${PROPERTY_ID}/+/+/cmd`;
}

class SimulatorMqtt {
  constructor({ url, user, password, onCommand }) {
    this.url = url;
    this.user = user;
    this.password = password;
    this.onCommand = onCommand; // callback(zoneId, device, cmd)
    this.client = null;
    this.connected = false;
  }

  connect() {
    const options = {
      clientId: `smartroom-simulator-${Math.random().toString(16).slice(2, 8)}`,
      clean: true,
    };
    if (this.user && this.password) {
      options.username = this.user;
      options.password = this.password;
    }

    this.client = mqtt.connect(this.url, options);

    this.client.on('connect', () => {
      this.connected = true;
      // Suscribirse a todos los cmd del property.
      this.client.subscribe(allCmdPattern(), { qos: 1 }, (err) => {
        if (err) console.error('[simulator] error suscribiendo a cmd:', err.message);
      });
    });

    this.client.on('message', (topicName, payload) => {
      try {
        const cmd = JSON.parse(payload.toString());
        const parts = topicName.split('/');
        // smartroom / property / zone / device / kind
        const zoneId = parts[2];
        const device = parts[3];
        if (zoneId && device && this.onCommand) {
          this.onCommand(zoneId, device, cmd);
        }
      } catch (e) {
        console.error('[simulator] mensaje cmd inválido:', e.message);
      }
    });

    this.client.on('error', (err) => {
      console.error('[simulator] error MQTT:', err.message);
    });

    this.client.on('close', () => {
      this.connected = false;
    });
  }

  // Publica estado de un dispositivo (retained, QoS 1).
  publishState(zoneId, device, state) {
    if (!this.client || !this.connected) return;
    const t = topic(zoneId, device, 'state');
    this.client.publish(t, JSON.stringify(state), { qos: 1, retain: true }, (err) => {
      if (err) console.error('[simulator] error publicando state:', err.message);
    });
  }

  // Publica disponibilidad (retained, QoS 1, Last Will).
  publishStatus(zoneId, device, status) {
    if (!this.client || !this.connected) return;
    const t = topic(zoneId, device, 'status');
    this.client.publish(t, status, { qos: 1, retain: true }, (err) => {
      if (err) console.error('[simulator] error publicando status:', err.message);
    });
  }

  end() {
    if (this.client) {
      this.client.end();
    }
  }
}

module.exports = { SimulatorMqtt, topic, cmdTopic, allCmdPattern };
