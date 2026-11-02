<template>
  <div class="zone-detail">
    <div class="detail-header">
      <router-link to="/" class="back">&larr; Volver a zonas</router-link>
      <div class="title-group">
        <h1>{{ zone?.name || 'Cargando…' }}</h1>
        <div class="scene-chip" @click="openScenePicker">
          {{ sceneLabel }}
          <span class="scene-dot" :class="{ active: zone?.lighting_scene }"></span>
        </div>
      </div>
    </div>

    <div v-if="!zone" class="empty">Zona no encontrada</div>

    <div v-else class="controls-grid">
      <div class="card">
        <h3>Iluminación</h3>
        <div class="control-row">
          <label>Escena</label>
          <select v-model="selectedScene" @change="applyScene" class="scene-select">
            <option v-for="s in scenes" :key="s" :value="s">{{ sceneLabel(s) }}</option>
          </select>
        </div>
        <div class="control-row">
          <label>Atenuación</label>
          <div class="slider-with-value">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              :value="zone.dimmer_level"
              @input="onDimmerInput"
              class="brightness-slider"
            />
            <span class="slider-value">{{ zone.dimmer_level }}%</span>
          </div>
          <div class="light-preview">
            <div class="light-glow" :style="{ opacity: glowOpacity }"></div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Clima (HVAC)</h3>
        <div class="control-row">
          <label>Modo</label>
          <select v-model="zone.hvac_mode" @change="sendCommand('set_hvac_mode', zone.hvac_mode)" class="mode-select">
            <option value="auto">Auto</option>
            <option value="cool">Frío</option>
            <option value="heat">Calor</option>
            <option value="off">Apagado</option>
          </select>
        </div>
        <div class="control-row">
          <label>Setpoint</label>
          <div class="slider-with-value">
            <input
              type="range"
              min="16"
              max="30"
              step="0.5"
              :value="zone.thermostat_setpoint"
              @input="onSetpointInput"
              class="temp-slider"
            />
            <span class="slider-value">{{ zone.thermostat_setpoint }}°C</span>
          </div>
          <div class="temp-preview">
            <div class="temp-bar">
              <div class="temp-fill" :style="{ width: tempSetpointFill + '%', background: tempSetpointColor }"></div>
            </div>
            <span class="temp-label">{{ zone.thermostat_temp }}°C actual</span>
          </div>
        </div>
      </div>

      <div class="card">
        <h3>Cortinas</h3>
        <div class="control-row">
          <label>Posición</label>
          <div class="slider-with-value">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              :value="zone.curtains_position"
              @input="onCurtainsInput"
              class="curtain-slider"
            />
            <span class="slider-value">{{ zone.curtains_position }}%</span>
          </div>
          <div class="curtain-preview">
            <div class="curtain-frame">
              <div class="curtain-panel left" :style="{ width: curtainLeftWidth + '%' }"></div>
              <div class="curtain-panel right" :style="{ width: curtainRightWidth + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="card events">
        <h3>Eventos recientes</h3>
        <ul class="event-list">
          <li v-for="(e, i) in recentEvents" :key="i" class="event-item">
            <span class="event-time">{{ e.ts.substring(11, 19) }}</span>
            <span class="event-text">{{ e.message }}</span>
          </li>
        </ul>
        <p v-if="recentEvents.length === 0" class="empty">Sin eventos recientes.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useZonesStore } from '../stores/zones';
import { fetchZone } from '../api/api';
import { gsap } from 'gsap';

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

const recentEvents = computed(() => {
  const z = store.zones.find((z) => z.zone_id === zoneId);
  return z ? [] : []; // Events are global, not per-zone in current API
});

const glowOpacity = computed(() => (zone.value?.dimmer_level || 0) / 100);
const tempSetpointFill = computed(() => {
  const sp = zone.value?.thermostat_setpoint || 20;
  return Math.min(Math.max(((sp - 16) / 14) * 100, 0), 100);
});
const tempSetpointColor = computed(() => {
  const sp = zone.value?.thermostat_setpoint || 20;
  if (sp < 21) return '#3b82f6';
  if (sp < 24) return '#10b981';
  if (sp < 27) return '#f59e0b';
  return '#ef4444';
});
const curtainLeftWidth = computed(() => {
  const p = zone.value?.curtains_position || 0;
  return p / 2;
});
const curtainRightWidth = computed(() => {
  const p = zone.value?.curtains_position || 0;
  return p / 2;
});

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
  // Animate the whole card
  gsap.fromTo('.zone-detail', { opacity: 0.8 }, { opacity: 1, duration: 0.4 });
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

const openScenePicker = () => {
  gsap.to('.scene-select', { duration: 0.3, scale: 1.05, yoyo: true, repeat: 1 });
};
</script>

<style scoped>
.zone-detail {
  max-width: 900px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.back {
  text-decoration: none;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 500;
}

.back:hover {
  color: #111;
}

.title-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title-group h1 {
  font-size: 1.75rem;
  color: #111;
  margin: 0;
}

.scene-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #e0e7ff, #f3e8ff);
  color: #4c1d95;
  padding: 8px 16px;
  border-radius: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.scene-chip:hover {
  background: #dbeafe;
  border-color: #8b5cf6;
  transform: scale(1.02);
}

.scene-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #8b5cf6;
  box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
}

.scene-dot.active {
  animation: pulse 2s infinite;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

.card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.card h3 {
  font-size: 1.1rem;
  margin: 0 0 16px;
  color: #334155;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.control-row label {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 500;
}

.control-row select,
.scene-select,
.mode-select {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-row select:focus,
.scene-select:focus,
.mode-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.slider-with-value {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-with-value input[type=range] {
  flex: 1;
  accent-color: #2563eb;
  cursor: pointer;
}

.slider-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: #111;
  min-width: 40px;
  text-align: right;
}

.brightness-slider {
  accent-color: #fbbf24;
}

.temp-slider {
  accent-color: #ef4444;
}

.curtain-slider {
  accent-color: #8b5cf6;
}

.light-preview {
  height: 60px;
  border-radius: 8px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.light-glow {
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.temp-preview {
  margin-top: 8px;
}

.temp-bar {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.temp-fill {
  height: 100%;
  transition: width 0.6s ease, background 0.4s ease;
}

.temp-label {
  font-size: 0.8rem;
  color: #64748b;
}

.curtain-preview {
  height: 120px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.curtain-frame {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.curtain-panel {
  height: 100%;
  background: #94a3b8;
  transition: width 1s ease;
}

.curtain-panel.left {
  border-radius: 0 8px 8px 0;
}

.curtain-panel.right {
  border-radius: 8px 0 0 8px;
}

.events {
  grid-column: 1 / -1;
}

.event-list {
  list-style: none;
  padding: 0;
  margin: 12px 0 0;
  max-height: 200px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.85rem;
  color: #475569;
  animation: slideIn 0.4s ease;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}

.event-time {
  font-weight: 600;
  color: #64748b;
  font-family: monospace;
}

.event-text {
  color: #334155;
}

.empty {
  color: #64748b;
  padding: 12px 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
