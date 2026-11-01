// Escenas válidas y sus valores asociados.
// Fuente: docs/01-arquitectura.md — sección Escenas.
const scenes = {
  welcome: { dimmer: 80, curtains: 100, setpoint: 22.0 },
  relax_sunset: { dimmer: 45, curtains: 40, setpoint: 22.0 },
  work: { dimmer: 90, curtains: 100, setpoint: 22.0 },
  cinema: { dimmer: 10, curtains: 0, setpoint: 21.0 },
  night: { dimmer: 5, curtains: 0, setpoint: 21.0 },
  eco: { dimmer: 0, curtains: 0, setpoint: 25.0 },
};

function isValidScene(id) {
  return Object.prototype.hasOwnProperty.call(scenes, id);
}

function getScene(id) {
  return scenes[id];
}

function listScenes() {
  return Object.keys(scenes);
}

module.exports = { scenes, isValidScene, getScene, listScenes };
