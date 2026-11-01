<template>
  <div class="zone-detail">
    <div class="detail-header">
      <router-link to="/" class="back">&larr; Volver a zonas</router-link>
      <h1>{{ zone?.name || 'Cargando…' }}</h1>
      <div class="scene-chip">{{ sceneLabel }}</div>
    </div>

    <div v-if="!zone" class="empty">Zona no encontrada</div>

    <div v-else class="controls-grid">
      <div class="card">
        <h3>Iluminación</h3>
        <div class="control-row">
          <label>Escena</label>
          <select v-model="selectedScene" @change="applyScene">
            <option v-for="s in scenes" :key="s" :value="s">{{ sceneLabel(s) }}</option>
          </select>
        </div>
        <div class="control-row">
          <label>Atenuación <span>{{ zone.dimmer_level }}%</span></label>
          <input type="range" min="0" max="100" step="1" :value="zone.dimmer_level" @input="onDimmerInput" />
        </div>
      </div>

      <div class="card">
        <h3>Clima (HVAC)</h3>
        <div class="control-row">
          <label>Modo</label>
          <select v-model="zone.hvac_mode" @change="sendCommand('set_hvac_mode', zone.hvac_mode)">
            <option value="auto">Auto</option>
            <option value="cool">Frío</option>
            <option value="heat">Calor</option>
            <option value="off">Apagado</option>
          </select>
        </div>
        <div class="control-row">
          <label>Setpoint <span>{{ zone.thermostat_setpoint }}°C</span></label>
          <input type="range" min="16" max="30" step="0.5" :value="zone.thermostat_setpoint" @input="onSetpointInput" />
        </div>
        <div class="control-row">
          <label>Temperatura actual</label>
          <span class="value">{{ zone.thermostat_temp }}°C</span>
        </div>
      </div>

      <div class="card">
        <h3>Cortinas</h3>
        <div class="control-row">
          <label>Posición <span>{{ zone.curtains_position }}%</span></label>
          <input type="range" min="0" max="100" step="1" :value="zone.curtains_position" @input="onCurtainsInput" />
        </div>
        <div class="control-row">
          <label>Ocupación</label>
          <span class="value" :class="{ occupied: zone.occupancy_status }">
            {{ zone.occupancy_status ? 'Ocupada' : 'Vacía' }}
          </span>
        </div>
      </div>

      <div class="card events">
        <h3>Eventos recientes</h3>
        <ul class="event-list">
          <li v-for="(e, i) in events.slice(0, 5)" :key="i">{{ e.ts.substring(11, 19) }} — {{ e.message }}</li>
        </ul>
        <p v-if="events.length === 0" class="empty">Sin eventos recientes.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useZonesStore } from '../stores/zones';
import { fetchZone } from '../api/api';

const route = useRoute();
const router = useRouter();
const store = useZonesStore();

const zoneId = route.params.zoneId;
const zone = ref(store.zoneById(zoneId) || null);
const selectedScene = ref(zone.value?.lighting_scene || '');

const scenes = ['welcome', 'relax_sunset', 'work', 'cinema', 'night', 'eco'];

const sceneLabel = (s = selectedScene.value) => {
  const labels = {
    welcome: 'Bienvenida',
    relax_sunset: 'Relax / Atardecer',
    work: 'Trabajo',
    cinema: 'Cine',
    night: 'Noche',
    eco: 'Ahorro',
  };
  return labels[s] || s;
};

const events = store.zones.length ? [] : [];

onMounted(() => {
  if (!zone.value) {
    fetchZone(zoneId).then((res) => {
      zone.value = res.data;
      selectedScene.value = res.data.lighting_scene || '';
    });
  } else {
    selectedScene.value = zone.value.lighting_scene || '';
  }
});

watch(() => zone.value, (z) => {
  if (z) selectedScene.value = z.lighting_scene || '';
});

const applyScene = async () => {
  await store.sendCommand(zoneId, 'set_scene', selectedScene.value);
  selectedScene.value = zone.value?.lighting_scene || selectedScene.value;
};

const sendCommand = async (type, value) => {
  await store.sendCommand(zoneId, type, value);
};

let dimmerTimer;
const onDimmerInput = (e) => {
  const val = parseInt(e.target.value, 10);
  clearTimeout(dimmerTimer);
  dimmerTimer = setTimeout(() => sendCommand('set_dimmer', val), 300);
};

let setpointTimer;
const onSetpointInput = (e) => {
  const val = parseFloat(e.target.value);
  clearTimeout(setpointTimer);
  setpointTimer = setTimeout(() => sendCommand('set_setpoint', val), 300);
};

let curtainsTimer;
const onCurtainsInput = (e) => {
  const val = parseInt(e.target.value, 10);
  clearTimeout(curtainsTimer);
  curtainsTimer = setTimeout(() => sendCommand('set_curtains', val), 300);
};
</script>

<style>
.zone-detail { max-width: 700px; }
.detail-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.back { text-decoration: none; color: #475569; font-size: 0.9rem; margin-right: 12px; }
.back:hover { color: #111; }
.scene-chip { display: inline-block; background: #e2e8f0; color: #334155; padding: 4px 10px; border-radius: 20px; font-size: 0.85rem; margin-left: auto; }
.controls-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.card { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; }
.card h3 { font-size: 1rem; margin-bottom: 12px; color: #334155; }
.control-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 0.9rem; }
.control-row label { flex: 1; color: #475569; }
.control-row select { flex: 1; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; }
.control-row input[type=range] { flex: 2; accent-color: #2563eb; }
.control-row .value { font-weight: 600; color: #111; }
.control-row .value.occupied { color: #166534; }
.events { grid-column: 1 / -1; }
.event-list { list-style: none; padding: 0; margin: 8px 0 0; color: #475569; font-size: 0.85rem; }
.event-list li { padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
.empty { color: #64748b; padding: 12px 0; }
</style>
