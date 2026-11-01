// Pruebas básicas de Node-RED (sin levantar el servidor).
// Fuente: docs/fases/F2-nodered.md.
const assert = require('assert');

let pass = 0;
let fail = 0;

function ok(name, fn) {
  try {
    fn();
    pass++;
    console.log(`✓ ${name}`);
  } catch (e) {
    fail++;
    console.error(`✗ ${name}: ${e.message}`);
  }
}

ok('flujos JSON es un array válido', () => {
  const flows = require('../flows.json');
  assert.ok(Array.isArray(flows));
  assert.ok(flows.length > 0);
});

ok('existe nodo broker MQTT', () => {
  const flows = require('../flows.json');
  const broker = flows.find((n) => n.type === 'mqtt-broker');
  assert.ok(broker);
  assert.equal(broker.port, '1883');
});

ok('existe nodo mqtt in state', () => {
  const flows = require('../flows.json');
  const n = flows.find((n) => n.name === 'Estado dispositivos (state)');
  assert.ok(n);
  assert.equal(n.topic, 'smartroom/demo-hotel/+/+/state');
});

ok('existe nodo mqtt in status', () => {
  const flows = require('../flows.json');
  const n = flows.find((n) => n.name === 'Disponibilidad (status)');
  assert.ok(n);
  assert.equal(n.topic, 'smartroom/demo-hotel/+/+/status');
});

ok('existe HTTP GET /api/health', () => {
  const flows = require('../flows.json');
  const n = flows.find((n) => n.type === 'http in' && n.url === '/api/health');
  assert.ok(n);
  assert.equal(n.method, 'get');
});

ok('existe HTTP GET /api/zones', () => {
  const flows = require('../flows.json');
  const n = flows.find((n) => n.type === 'http in' && n.url === '/api/zones');
  assert.ok(n);
  assert.equal(n.method, 'get');
});

ok('existe HTTP POST /api/zones/:id/commands', () => {
  const flows = require('../flows.json');
  const n = flows.find((n) => n.type === 'http in' && n.url === '/api/zones/:zone_id/commands');
  assert.ok(n);
  assert.equal(n.method, 'post');
});

ok('existe HTTP GET /api/events', () => {
  const flows = require('../flows.json');
  const n = flows.find((n) => n.type === 'http in' && n.url === '/api/events');
  assert.ok(n);
  assert.equal(n.method, 'get');
});

ok('existe WebSocket listener /api/ws/zones', () => {
  const flows = require('../flows.json');
  const n = flows.find((n) => n.type === 'websocket-listener' && n.path === '/api/ws/zones');
  assert.ok(n);
});

ok('existe nodo mqtt out para comandos', () => {
  const flows = require('../flows.json');
  const n = flows.find((n) => n.type === 'mqtt out');
  assert.ok(n);
});

console.log(`\n${pass} pruebas pasadas, ${fail} fallidas`);
process.exit(fail > 0 ? 1 : 0);
