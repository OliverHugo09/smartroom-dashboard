// Validación defensiva de comandos.
// Fuente: docs/01-arquitectura.md — sección Comandos aceptados y validación.
const { isValidScene } = require('./scenes');

const VALID_TYPES = [
  'set_scene',
  'set_dimmer',
  'set_setpoint',
  'set_hvac_mode',
  'set_curtains',
  'sim_occupancy',
];

const VALID_HVAC_MODES = ['auto', 'cool', 'heat', 'off'];

// Valida un comando y devuelve { ok: true, value } o { ok: false, reason }.
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
      if (!value || typeof value !== 'string') {
        return { ok: false, reason: 'set_scene requiere value con id de escena' };
      }
      if (!isValidScene(value)) {
        return { ok: false, reason: `escena '${value}' no existe` };
      }
      return { ok: true, value };

    case 'set_dimmer':
      if (!Number.isInteger(value) || value < 0 || value > 100) {
        return { ok: false, reason: 'set_dimmer value debe ser entero 0–100' };
      }
      return { ok: true, value };

    case 'set_setpoint':
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return { ok: false, reason: 'set_setpoint value debe ser número' };
      }
      if (value < 16 || value > 30) {
        return { ok: false, reason: 'set_setpoint value debe estar entre 16 y 30' };
      }
      // paso 0.5
      if ((value * 2) % 1 !== 0) {
        return { ok: false, reason: 'set_setpoint value debe tener paso 0.5' };
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

module.exports = { validateCommand, VALID_TYPES, VALID_HVAC_MODES };
