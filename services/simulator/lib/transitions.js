// Lógica pura de transiciones.
// Fuente: docs/01-arquitectura.md — sección Comportamiento del simulador.
// - dimmer y cortinas cambian ~10 puntos por tick
// - temperatura se acerca al setpoint ~0.1 °C por tick (hvac_mode off deriva hacia 26 °C)

const STEP_PER_TICK = 10;   // puntos por tick para dimmer y cortinas
const TEMP_STEP = 0.1;      // °C por tick para temperatura
const TICK_MS = 5000;       // 5 s entre ticks
const AMBIENT_TEMP = 26.0;  // temperatura ambiente cuando HVAC está apagado

// Avanza un valor hacia un target con un paso máximo.
// Devuelve { value, reached }.
function stepToward(current, target, maxStep) {
  const diff = target - current;
  if (Math.abs(diff) <= maxStep) {
    return { value: target, reached: true };
  }
  return { value: current + Math.sign(diff) * maxStep, reached: false };
}

// Aplica una transición de un tick a un dispositivo.
// state: objeto de estado del dispositivo.
// updates: campos a transicionar (dimmer_level, curtains_position, thermostat_setpoint).
// La temperatura siempre se acerca al setpoint (o a 26 °C si HVAC off) en cada tick.
// Devuelve nuevo estado parcial.
function tick(state, updates = {}) {
  const next = { ...state };

  if (updates.dimmer_level !== undefined) {
    const s = stepToward(state.dimmer_level, updates.dimmer_level, STEP_PER_TICK);
    next.dimmer_level = Math.round(s.value);
  }

  if (updates.curtains_position !== undefined) {
    const s = stepToward(state.curtains_position, updates.curtains_position, STEP_PER_TICK);
    next.curtains_position = Math.round(s.value);
  }

  // Temperatura real: se acerca al setpoint (o a temperatura ambiente si HVAC off).
  const tempTarget = state.hvac_mode === 'off' ? AMBIENT_TEMP : state.thermostat_setpoint;
  const sTemp = stepToward(state.thermostat_temp, tempTarget, TEMP_STEP);
  next.thermostat_temp = Math.round(sTemp.value * 10) / 10;

  if (updates.thermostat_setpoint !== undefined) {
    const s = stepToward(state.thermostat_setpoint, updates.thermostat_setpoint, TEMP_STEP);
    next.thermostat_setpoint = Math.round(s.value * 10) / 10;
  }

  return next;
}

// Deriva térmica cuando el HVAC está apagado: la consigna objetivo va a temperatura ambiente (26 °C).
function thermalDrift(state) {
  const next = { ...state };
  if (state.hvac_mode === 'off') {
    next.thermostat_setpoint = AMBIENT_TEMP;
  }
  return next;
}

module.exports = { tick, thermalDrift, TICK_MS, STEP_PER_TICK, TEMP_STEP, AMBIENT_TEMP };
