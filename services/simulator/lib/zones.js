// Modelo de zonas y dispositivos.
// Fuente: docs/01-arquitectura.md — sección Zonas y propiedad.
const PROPERTY_ID = 'demo-hotel';

const zones = [
  {
    zone_id: 'SUITE_PRESIDENCIAL_402',
    name: 'Suite Presidencial 402',
  },
  {
    zone_id: 'HAB_DELUXE_201',
    name: 'Habitación Deluxe 201',
  },
  {
    zone_id: 'HAB_DELUXE_202',
    name: 'Habitación Deluxe 202',
  },
  {
    zone_id: 'LOBBY_PB',
    name: 'Lobby Planta Baja',
  },
];

const devices = ['lighting', 'climate', 'curtains', 'occupancy'];

// Estado inicial por zona.
// Fuente: docs/01-arquitectura.md — sección Comportamiento del simulador.
function initialState(zoneId) {
  const suite = zoneId === 'SUITE_PRESIDENCIAL_402';
  const occupied = suite ? true : Math.random() < 0.5;

  return {
    zone_id: zoneId,
    lighting_scene: suite ? 'relax_sunset' : null,
    dimmer_level: suite ? 45 : Math.floor(Math.random() * 101),
    thermostat_temp: suite ? 21.5 : 20 + Math.random() * 4,
    thermostat_setpoint: suite ? 22.0 : 21 + Math.random() * 3,
    hvac_mode: suite ? 'auto' : ['auto', 'cool', 'heat', 'off'][Math.floor(Math.random() * 4)],
    curtains_position: suite ? 40 : Math.floor(Math.random() * 101),
    occupancy_status: occupied,
    last_cmd_id: null,
    ts: new Date().toISOString(),
  };
}

module.exports = { PROPERTY_ID, zones, devices, initialState };
