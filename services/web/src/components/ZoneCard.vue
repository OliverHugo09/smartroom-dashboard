<template>
  <div class="zone-card card bg-dark text-light border-secondary h-100" :class="{ 'scene-active': activeScene }">
    <!-- Header -->
    <div class="card-header bg-transparent border-bottom border-secondary">
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <h5 class="card-title mb-0 text-white">{{ zone.name }}</h5>
          <small class="text-secondary">{{ zone.zone_id }}</small>
        </div>
        <button @click="goDetail" class="btn btn-sm btn-outline-secondary">
          <svg class="bi bi-chevron-right" width="16" height="16" fill="currentColor">
            <path d="M12.5 6a.5.5 0 0 1 0 1l-1.5 1.5a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 0 1 .708-.708L11 7.293l1.146-1.147a.5.5 0 0 1 .708 0z"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="card-body p-3">
      <!-- Escena activa -->
      <div class="mb-3">
        <span class="badge" :class="sceneBadgeClass">{{ sceneLabel }}</span>
      </div>

      <!-- Métricas con barras de progreso de Bootstrap -->
      <div class="row g-3">
        <!-- Iluminación -->
        <div class="col-6">
          <div class="metric-card">
            <div class="d-flex justify-content-between mb-1">
              <small class="text-secondary">Iluminaci&oacute;n</small>
              <span class="text-white fw-bold">{{ zone.dimmer_level }}%</span>
            </div>
            <div class="progress bg-secondary" style="height: 8px;">
              <div
                class="progress-bar bg-warning"
                role="progressbar"
                :aria-valuenow="zone.dimmer_level"
                aria-valuemin="0"
                aria-valuemax="100"
                :style="{ width: dimmerLevel + '%', boxShadow: dimmerLevel > 0 ? '0 0 10px rgba(251, 191, 36, 0.5)' : 'none' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Temperatura y setpoint en la misma barra -->
        <div class="col-6">
          <div class="metric-card">
            <div class="d-flex justify-content-between mb-1">
              <small class="text-secondary">Temperatura</small>
              <span class="text-white fw-bold" :class="tempTextClass">{{ roundTemp(zone.thermostat_temp) }}°C</span>
            </div>
            <div class="progress bg-secondary" style="height: 8px;">
              <div
                class="progress-bar"
                role="progressbar"
                :aria-valuenow="tempFill"
                aria-valuemin="0"
                aria-valuemax="100"
                :style="{ width: tempFill + '%', backgroundColor: tempColor }"
              ></div>
              <!-- Marcador de setpoint -->
              <div
                class="setpoint-marker"
                :style="{ left: tempSetpointFill + '%' }"
              ></div>
            </div>
            <div class="d-flex justify-content-between mt-1">
              <small class="text-secondary">Setpoint {{ roundTemp(zone.thermostat_setpoint) }}°C</small>
            </div>
          </div>
        </div>

        <!-- Cortinas -->
        <div class="col-6">
          <div class="metric-card">
            <div class="d-flex justify-content-between mb-1">
              <small class="text-secondary">Cortinas</small>
              <span class="text-white fw-bold">{{ zone.curtains_position }}%</span>
            </div>
            <div class="curtain-track bg-secondary" style="height: 8px; border-radius: 4px; overflow: hidden;">
              <div
                class="curtain-panel left bg-dark"
                :style="{ width: curtainLeftWidth + '%', boxShadow: 'inset -2px 0 6px rgba(0,0,0,0.3)' }"
              ></div>
              <div
                class="curtain-panel right bg-dark"
                :style="{ width: curtainRightWidth + '%', boxShadow: 'inset 2px 0 6px rgba(0,0,0,0.3)' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Ocupaci&oacute;n -->
        <div class="col-6">
          <div class="metric-card d-flex align-items-center justify-content-between">
            <div>
              <small class="text-secondary">Ocupaci&oacute;n</small>
              <div class="text-white fw-bold">{{ zone.occupancy_status ? 'Ocupada' : 'Vac&iacute;a' }}</div>
            </div>
            <span
              class="badge" :class="{ 'bg-success': zone.occupancy_status, 'bg-secondary': !zone.occupancy_status }"
            >
              {{ zone.occupancy_status ? 'Ocupada' : 'Vac&iacute;a' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Escenas r&p;pidas (dropdown de Bootstrap) -->
      <div class="mt-3">
        <label class="form-label text-secondary small">Escena r&aacute;pida</label>
        <div class="d-inline-block">
          <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            {{ sceneShortLabel(activeScene || 'welcome') }}
          </button>
          <ul class="dropdown-menu dropdown-menu-dark">
            <li v-for="s in scenes" :key="s">
              <button class="dropdown-item" :class="{ active: activeScene === s }" @click="sendCommand('set_scene', s)">
                <span class="me-2">{{ sceneIcon(s) }}</span>{{ sceneLabels[s] }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useZonesStore } from '../stores/zones';

const props = defineProps(['zone']);
const emit = defineEmits(['command']);
const router = useRouter();
const store = useZonesStore();

const scenes = ['welcome', 'relax_sunset', 'work', 'cinema', 'night', 'eco'];
const sceneLabels = {
  welcome: 'Bienvenida',
  relax_sunset: 'Relax Atardecer',
  work: 'Trabajo',
  cinema: 'Cine',
  night: 'Noche',
  eco: 'Ahorro',
};
const sceneIcons = {
  welcome: '☀️',
  relax_sunset: '🌅',
  work: '💡',
  cinema: '🎬',
  night: '🌙',
  eco: '🍃',
};

const activeScene = computed(() => props.zone.lighting_scene);

const sceneLabel = computed(() => sceneLabels[props.zone.lighting_scene] || '—');
const sceneBadgeClass = computed(() => {
  const map = {
    welcome: 'bg-success',
    relax_sunset: 'bg-warning',
    work: 'bg-info',
    cinema: 'bg-dark',
    night: 'bg-primary',
    eco: 'bg-success',
  };
  return `badge ${map[props.zone.lighting_scene] || 'bg-secondary'}`;
});
const quickScenes = computed(() => Object.keys(scenes).filter(s => s !== props.zone.lighting_scene));

const dimmerLevel = computed(() => props.zone.dimmer_level || 0);
const tempFill = computed(() => {
  const t = props.zone.thermostat_temp || 20;
  return Math.min(Math.max(((t - 16) / 14) * 100, 0), 100);
});
const tempColor = computed(() => {
  const t = props.zone.thermostat_temp || 20;
  if (t < 21) return '#3b82f6';
  if (t <= 27) return '#f59e0b';
  return '#ef4444';
});
const tempTextClass = computed(() => {
  const t = props.zone.thermostat_temp || 20;
  if (t < 21) return 'text-info';
  if (t <= 27) return 'text-warning';
  return 'text-danger';
});
const curtainLeftWidth = computed(() => (props.zone.curtains_position || 0) / 2);
const curtainRightWidth = computed(() => (props.zone.curtains_position || 0) / 2);
const tempSetpointFill = computed(() => {
  const sp = props.zone.thermostat_setpoint || 20;
  return Math.min(Math.max(((sp - 16) / 14) * 100, 0), 100);
});

const roundTemp = (t) => t != null ? Math.round(t * 10) / 10 : '—';

const sceneIcon = (s) => sceneIcons[s] || '•';
const sceneShortLabel = (s) => {
  const short = { welcome: 'Bienv.', relax_sunset: 'Relax', work: 'Trabajo', cinema: 'Cine', night: 'Noche', eco: 'Eco' };
  return short[s] || s;
};

const goDetail = () => {
  router.push('/zones/' + props.zone.zone_id);
};

const sendCommand = async (type, value) => {
  await store.sendCommand(props.zone.zone_id, type, value);
};
</script>

<style>
/* Tarjeta individual - sin líneas blancas entre cards */
.zone-card {
  background: #1e293b;
  border: 1px solid #1e293b !important;
  border-radius: 12px;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}
.zone-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: #3b82f6;
}
.zone-card.scene-active {
  border-color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
}
.zone-card.scene-active .card-header {
  border-bottom-color: #3b82f6;
}

.card-header {
  background: transparent !important;
  border-bottom: 1px solid #334155 !important;
  padding: 1rem 1.25rem !important;
}

.card-header h5 {
  color: #f1f5f9;
  font-size: 1.1rem;
  font-weight: 600;
}

.card-header .text-secondary {
  color: #64748b !important;
  font-size: 0.75rem;
}

.card-body {
  background: #1e293b;
  padding: 1.25rem !important;
  border-radius: 0 0 12px 12px;
}

.metric-card {
  background: #0f172a;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #334155;
  margin-bottom: 0;
}

.progress {
  height: 8px !important;
  border-radius: 4px;
  background: #334155 !important;
}
.progress-bar {
  transition: width 0.7s ease, box-shadow 0.3s ease;
}

.curtain-track {
  height: 40px;
  border-radius: 4px;
  position: relative;
}
.curtain-panel {
  position: absolute;
  top: 0;
  bottom: 0;
  background: #475569;
  transition: width 1s ease;
}
.curtain-panel.left { left: 0; }
.curtain-panel.right { right: 0; }

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

.temp-cold { color: #60a5fa; }
.temp-optimal { color: #fbbf24; }
.temp-hot { color: #f87171; }

.btn-outline-secondary {
  border-color: #334155;
  color: #94a3b8;
}
.btn-outline-secondary:hover {
  border-color: #475569;
  color: #f1f5f9;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

/* Quitar puntos de lista del dropdown */
.dropdown-menu {
  list-style: none !important;
  padding: 0 !important;
  margin: 0 !important;
  background: #1e293b !important;
  border: 1px solid #334155 !important;
}
.dropdown-menu li {
  list-style: none !important;
  margin: 0 !important;
  padding: 0 !important;
}
.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  color: #cbd5e1;
  text-decoration: none;
}
.dropdown-item:hover {
  background: #334155;
  color: #f1f5f9;
}
.dropdown-item.active {
  background: #3b82f6;
  color: #ffffff;
}

.go-detail .bi {
  transition: transform 0.2s ease;
}
.go-detail:hover .bi {
  transform: translateX(2px);
}

.scene {
  margin-bottom: 1rem;
}

.scene-badge {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metric-card .text-secondary {
  color: #94a3b8 !important;
}
.metric-card .text-white {
  color: #f1f5f9 !important;
}
</style>
