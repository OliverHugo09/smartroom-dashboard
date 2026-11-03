<template>
  <div class="zone-detail container-xxl py-4">
    <!-- Header -->
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <router-link to="/" class="btn btn-outline-secondary btn-sm">
          <svg class="bi bi-arrow-left" width="16" height="16" fill="currentColor">
            <path d="M11.854 3.646a.5.5 0 0 0 0 .708L13.207 5h-1.5a.5.5 0 0 1 0-1h1.5a.5.5 0 0 1 .5.5v2.5a.5.5 0 0 1-1 0V4.207l-3 3a.5.5 0 0 1-.708-.708l3-3a.5.5 0 0 1 .708 0z"/>
          </svg>
          Volver a zonas
        </router-link>
      </div>
      <div class="d-flex align-items-center gap-2">
        <h1 class="h3 mb-0 text-white">{{ zone?.name || 'Cargando…' }}</h1>
        <span class="badge bg-dark text-white border">{{ zone?.zone_id }}</span>
      </div>
    </div>

    <div v-if="!zone" class="text-center py-5 text-secondary">Cargando zona…</div>

    <div v-else class="row g-4">
      <!-- Iluminación -->
      <div class="col-12 col-lg-4">
        <div class="card bg-dark text-light border-secondary h-100">
          <div class="card-header bg-transparent border-bottom border-secondary">
            <h5 class="mb-0 text-white">Iluminaci&oacute;n</h5>
          </div>
          <div class="card-body p-3">
            <div class="mb-3">
              <label class="form-label text-secondary small">Escena</label>
              <select
                v-model="selectedScene"
                @change="applyScene"
                class="form-select bg-dark text-light border-secondary"
              >
                <option v-for="s in sceneOptions" :key="s" :value="s">{{ sceneLabel(s) }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label text-secondary small d-flex justify-content-between">
                <span>Atenuaci&oacute;n</span>
                <span class="text-white">{{ zone.dimmer_level }}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                :value="zone.dimmer_level"
                @input="onDimmerInput"
                class="form-range"
              />
            </div>
            <div class="light-preview mt-3">
              <div class="light-glow" :style="{ opacity: glowOpacity }"></div>
              <span class="position-absolute top-50% left-50% translate-middle text-secondary small">
                {{ zone.dimmer_level === 0 ? 'Apagado' : zone.dimmer_level + '% brillo' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Clima -->
      <div class="col-12 col-lg-4">
        <div class="card bg-dark text-light border-secondary h-100">
          <div class="card-header bg-transparent border-bottom border-secondary">
            <h5 class="mb-0 text-white">Clima (HVAC)</h5>
          </div>
          <div class="card-body p-3">
            <div class="mb-3">
              <label class="form-label text-secondary small d-flex justify-content-between">
                <span>Modo HVAC</span>
                <span class="text-white">{{ zone.hvac_mode }}</span>
              </label>
              <select
                v-model="zone.hvac_mode"
                @change="sendCommand('set_hvac_mode', zone.hvac_mode)"
                class="form-select bg-dark text-light border-secondary"
              >
                <option value="auto">Auto</option>
                <option value="cool">Fr&iacute;o</option>
                <option value="heat">Calor</option>
                <option value="off">Apagado</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label text-secondary small d-flex justify-content-between">
                <span>Setpoint y temperatura</span>
                <span class="text-white">{{ roundTemp(zone.thermostat_setpoint) }}°C</span>
              </label>
              <input
                type="range"
                min="16"
                max="30"
                step="0.5"
                :value="zone.thermostat_setpoint"
                @input="onSetpointInput"
                class="form-range"
              />
              <div class="temp-bar-container mt-3">
                <div class="temp-bar-bg"></div>
                <div class="temp-bar-fill" :style="{ width: tempSetpointFill + '%', backgroundColor: tempSetpointColor }"></div>
                <div class="setpoint-marker" :style="{ left: tempSetpointFill + '%' }"></div>
                <div class="d-flex justify-content-between text-secondary small mt-1">
                  <span>16°C</span>
                  <span class="text-white fw-bold">{{ roundTemp(zone.thermostat_temp) }}°C actual</span>
                  <span>30°C</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cortinas -->
      <div class="col-12 col-lg-4">
        <div class="card bg-dark text-light border-secondary h-100">
          <div class="card-header bg-transparent border-bottom border-secondary">
            <h5 class="mb-0 text-white">Cortinas</h5>
          </div>
          <div class="card-body p-3">
            <div class="mb-3">
              <label class="form-label text-secondary small d-flex justify-content-between">
                <span>Posici&oacute;n</span>
                <span class="text-white">{{ zone.curtains_position }}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                :value="zone.curtains_position"
                @input="onCurtainsInput"
                class="form-range"
              />
            </div>
            <div class="curtain-preview h-100 d-flex align-items-center justify-content-center position-relative border rounded bg-dark">
              <div class="position-absolute top-0 bottom-0 left-0 right-0 bg-secondary-opacity-50"></div>
              <div class="curtain-frame h-75 w-100 d-flex align-items-end position-relative z-2">
                <div class="curtain-panel left bg-secondary" :style="{ width: curtainLeftWidth + '%' }"></div>
                <div class="curtain-panel right bg-secondary" :style="{ width: curtainRightWidth + '%' }"></div>
              </div>
              <span class="position-absolute bottom-2 text-white fw-bold">
                {{ zone.curtains_position === 0 ? 'Abiertas' : zone.curtains_position === 100 ? 'Cerradas' : 'Parciales' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ocupaci&oacute;n y eventos -->
      <div class="col-12 col-lg-4">
        <div class="card bg-dark text-light border-secondary h-100">
          <div class="card-header bg-transparent border-bottom border-secondary">
            <h5 class="mb-0 text-white">Ocupaci&oacute;n y eventos</h5>
          </div>
          <div class="card-body p-3">
            <div class="mb-3">
              <div class="d-flex align-items-center gap-2">
                <span class="badge" :class="{ 'bg-success': zone.occupancy_status, 'bg-secondary': !zone.occupancy_status }">
                  {{ zone.occupancy_status ? 'Ocupada' : 'Vac&iacute;a' }}
                </span>
              </div>
            </div>
            <div class="card bg-secondary-opacity-25 border border-secondary">
              <div class="card-body p-3">
                <h6 class="mb-3 text-secondary small text-uppercase">Eventos recientes</h6>
                <ul class="list-unstyled">
                  <li v-for="(e, i) in recentEvents" :key="i" class="d-flex justify-content-between py-2 border-bottom border-secondary">
                    <span class="text-secondary small">{{ e.ts.substring(11, 19) }}</span>
                    <span class="text-white small">{{ e.message }}</span>
                  </li>
                  <li v-if="recentEvents.length === 0" class="text-secondary small text-center py-2">Sin eventos recientes.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
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
const sceneLabels = {
  welcome: 'Bienvenida',
  relax_sunset: 'Relax Atardecer',
  work: 'Trabajo',
  cinema: 'Cine',
  night: 'Noche',
  eco: 'Ahorro',
};

const sceneOptions = computed(() => scenes.filter(s => s !== zone.value?.lighting_scene));

const sceneLabel = (s = selectedScene.value) => sceneLabels[s] || s;

const glowOpacity = computed(() => (zone.value?.dimmer_level || 0) / 100);
const tempSetpointFill = computed(() => {
  const sp = zone.value?.thermostat_setpoint || 20;
  return Math.min(Math.max(((sp - 16) / 14) * 100, 0), 100);
});
const tempSetpointColor = computed(() => {
  const sp = zone.value?.thermostat_setpoint || 20;
  if (sp < 21) return '#3b82f6';
  if (sp <= 27) return '#f59e0b';
  return '#ef4444';
});
const curtainLeftWidth = computed(() => (zone.value?.curtains_position || 0) / 2);
const curtainRightWidth = computed(() => (zone.value?.curtains_position || 0) / 2);
const curtainLightOpacity = computed(() => {
  const p = zone.value?.curtains_position || 0;
  return 1 - p / 100;
});

const recentEvents = computed(() => {
  return [];
});

const roundTemp = (t) => t != null ? Math.round(t * 10) / 10 : '—';

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
.zone-detail {
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  background: #0a0a0a;
  min-height: 100vh;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

.detail-header {
  margin-bottom: 2rem;
}

.card {
  background: #1e293b !important;
  border: 1px solid #334155 !important;
  border-radius: 12px !important;
  transition: transform 0.3s ease;
}
.card:hover {
  transform: translateY(-2px);
  border-color: #475569;
}
.card-header {
  background: transparent !important;
  border-bottom: 1px solid #334155 !important;
  padding: 1rem 1.25rem !important;
}
.card-header h5 {
  color: #f1f5f9;
  font-size: 1rem;
  font-weight: 600;
}

.card-body {
  background: #1e293b;
  padding: 1.25rem !important;
  border-radius: 0 0 12px 12px;
}

.form-select, .form-control {
  background: #0f172a;
  border: 1px solid #334155;
  color: #f1f5f9;
}
.form-select:focus, .form-control:focus {
  background: #0f172a;
  color: #f1f5f9;
  border-color: #3b82f6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.form-range {
  height: 6px;
}

.light-preview {
  position: relative;
  height: 80px;
  border-radius: 12px;
  background: #0f172a;
  border: 1px solid #334155;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.light-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.temp-bar-container {
  position: relative;
  margin-top: 8px;
}
.temp-bar-bg {
  height: 8px;
  background: #334155;
  border-radius: 4px;
  overflow: hidden;
}
.temp-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.7s ease, background-color 0.4s ease;
}
.setpoint-marker {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 3px;
  background: #ffffff;
  border-radius: 2px;
  box-shadow: 0 0 6px #ffffff;
  transition: left 0.7s ease;
}

.temp-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #64748b;
}

.curtain-preview {
  height: 140px;
  border-radius: 8px;
  background: #0f172a;
  border: 1px solid #334155;
  position: relative;
  overflow: hidden;
}
.curtain-frame {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: flex-end;
}
.curtain-panel {
  height: 100%;
  background: #475569;
  transition: width 1s ease;
}
.curtain-panel.left { border-radius: 0 8px 8px 0; }
.curtain-panel.right { border-radius: 8px 0 0 8px; }

.list-unstyled li {
  color: #cbd5e1;
}
.list-unstyled li.border-bottom {
  border-bottom-color: #334155 !important;
}

/* Responsive - 2x2 en desktop, 1 columna en móvil/tablet */
@media (min-width: 992px) {
  .col-lg-4 {
    flex: 0 0 auto;
    width: 33.333333%;
    max-width: 33.333333%;
  }
}
@media (max-width: 991.98px) {
  .col-12 {
    width: 100%;
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>
