<template>
  <div class="zone-card" :class="{ offline: !allOnline, 'scene-active': activeScene }">
    <div class="card-header">
      <h3>{{ zone.name }}</h3>
      <router-link :to="`/zones/${zone.zone_id}`" class="go-detail">Controlar &rarr;</router-link>
    </div>

    <div class="scene-badge">
      Escena: {{ sceneLabel }}
    </div>

    <div class="metrics">
      <div class="metric light">
        <div class="metric-label">Iluminación</div>
        <div class="light-visual">
          <div class="light-bulb" :style="{ brightness }"></div>
        </div>
        <div class="metric-value">{{ zone.dimmer_level }}%</div>
      </div>

      <div class="metric temp">
        <div class="metric-label">Temperatura</div>
        <div class="temp-visual">
          <div class="thermometer">
            <div class="thermometer-fill" :style="{ height: tempFill + '%', background: tempColor }"></div>
          </div>
        </div>
        <div class="metric-value">{{ zone.thermostat_temp }}°C</div>
      </div>

      <div class="metric curtains">
        <div class="metric-label">Cortinas</div>
        <div class="curtain-visual">
          <div class="curtain-left" :style="{ height: curtainHeight + '%' }"></div>
          <div class="curtain-right" :style="{ height: curtainHeight + '%' }"></div>
        </div>
        <div class="metric-value">{{ zone.curtains_position }}%</div>
      </div>

      <div class="metric hvac">
        <div class="metric-label">HVAC</div>
        <div class="hvac-visual">
          <div class="hvac-dot" :class="{ active: zone.hvac_mode !== 'off' }"></div>
        </div>
        <div class="metric-value">{{ zone.hvac_mode }}</div>
      </div>
    </div>

    <div class="occupancy">
      <div class="occupancy-dot" :class="{ on: zone.occupancy_status }"></div>
      <span>{{ zone.occupancy_status ? 'Ocupada' : 'Vacía' }}</span>
    </div>

    <div class="quick-actions">
      <button
        v-for="s in quickScenes"
        :key="s"
        @click="sendCommand('set_scene', s)"
        class="btn-scene"
        :class="{ active: activeScene === s }"
      >
        {{ shortLabel(s) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useZonesStore } from '../stores/zones';
import { gsap } from 'gsap';

const props = defineProps(['zone']);
const router = useRouter();
const store = useZonesStore();

const scenes = {
  welcome: 'Bienvenida',
  relax_sunset: 'Relax / Atardecer',
  work: 'Trabajo',
  cinema: 'Cine',
  night: 'Noche',
  eco: 'Ahorro',
};

const quickScenes = computed(() => {
  const cur = props.zone.lighting_scene;
  return Object.keys(scenes).filter((s) => s !== cur);
});

const sceneLabel = computed(() => scenes[props.zone.lighting_scene] || props.zone.lighting_scene);

const shortLabel = (s) => {
  const short = { welcome: 'Bienv.', relax_sunset: 'Relax', work: 'Trabajo', cinema: 'Cine', night: 'Noche', eco: 'Eco' };
  return short[s] || s;
};

const allOnline = computed(() => {
  const devs = props.zone.devices_online || {};
  return Object.values(devs).every(Boolean);
});

const activeScene = computed(() => props.zone.lighting_scene);

// Computed styles for animations
const brightness = computed(() => {
  const d = props.zone.dimmer_level || 0;
  // Map 0-100 to CSS brightness filter 0.1-1.5
  return `brightness(${0.2 + d / 100})`;
});

const tempFill = computed(() => {
  const t = props.zone.thermostat_temp || 20;
  // Map 16-30 to 0-100%
  return Math.min(Math.max(((t - 16) / 14) * 100, 0), 100);
});

const tempColor = computed(() => {
  const t = props.zone.thermostat_temp || 20;
  if (t < 21) return '#3b82f6'; // blue cold
  if (t < 24) return '#10b981'; // green comfortable
  if (t < 27) return '#f59e0b'; // amber warm
  return '#ef4444'; // red hot
});

const curtainHeight = computed(() => {
  // curtains_position: 0 = open (no curtain), 100 = closed (full curtain)
  const p = props.zone.curtains_position || 0;
  return p;
});

// GSAP animations when scene or values change
watch(
  () => props.zone.dimmer_level,
  (newVal, oldVal) => {
    if (newVal === oldVal) return;
    gsap.to('.light-bulb', {
      duration: 0.8,
      ease: 'power2.inOut',
      filter: `brightness(${0.2 + newVal / 100})`,
    });
  }
);

watch(
  () => props.zone.curtains_position,
  (newVal, oldVal) => {
    if (newVal === oldVal) return;
    gsap.to('.curtain-left, .curtain-right', {
      duration: 1,
      ease: 'power2.inOut',
      height: newVal + '%',
    });
  }
);

watch(
  () => props.zone.lighting_scene,
  (newVal) => {
    if (!newVal) return;
    // Pulse the scene badge
    gsap.to('.scene-badge', {
      duration: 0.3,
      scale: 1.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
    });
  }
);

const sendCommand = async (type, value) => {
  await store.sendCommand(props.zone.zone_id, type, value);
};
</script>

<style scoped>
.zone-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.zone-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.zone-card.scene-active::before {
  opacity: 1;
}

.zone-card.offline {
  opacity: 0.6;
  filter: grayscale(0.5);
  pointer-events: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-header h3 {
  font-size: 1.1rem;
  color: #111;
  margin: 0;
}

.go-detail {
  font-size: 0.85rem;
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.go-detail:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.scene-badge {
  display: inline-block;
  background: linear-gradient(135deg, #e0e7ff, #f3e8ff);
  color: #4c1d95;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  align-self: flex-start;
  margin-bottom: 4px;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.metric {
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.metric:hover {
  background: #f1f5f9;
  transform: translateY(-2px);
}

.metric.light .light-bulb {
  background: #fbbf24;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  margin: 0 auto 6px;
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.4);
  transition: filter 0.5s ease, box-shadow 0.5s ease;
}

.metric.temp .thermometer {
  width: 8px;
  height: 60px;
  background: #e2e8f0;
  border-radius: 4px;
  position: relative;
  margin: 0 auto 6px;
  overflow: hidden;
}

.metric.temp .thermometer-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 0%;
  transition: height 0.8s ease;
}

.metric.curtains .curtain-visual {
  width: 40px;
  height: 60px;
  background: #f1f5f9;
  border-radius: 8px;
  position: relative;
  margin: 0 auto 6px;
  overflow: hidden;
}

.metric.curtains .curtain-left,
.metric.curtains .curtain-right {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background: #cbd5e1;
  transition: height 1s ease;
}

.metric.curtains .curtain-left {
  left: 0;
  border-radius: 8px 0 0 8px;
}

.metric.curtains .curtain-right {
  right: 0;
  border-radius: 0 8px 8px 0;
}

.metric.hvac .hvac-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

.metric.hvac .hvac-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #94a3b8;
  transition: all 0.4s ease;
}

.metric.hvac .hvac-dot.active {
  background: #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
  transform: scale(1.2);
}

.metric .metric-label {
  font-size: 0.65rem;
  color: #64748b;
  margin-bottom: 2px;
}

.metric .metric-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111;
}

.occupancy {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #475569;
  margin-top: 4px;
}

.occupancy-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #94a3b8;
  transition: all 0.3s ease;
}

.occupancy-dot.on {
  background: #16a34a;
  box-shadow: 0 0 10px rgba(22, 163, 74, 0.6);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.quick-actions {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.btn-scene {
  flex: 1;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 8px 6px;
  font-size: 0.7rem;
  cursor: pointer;
  color: #334155;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-scene:hover {
  background: #f8fafc;
  border-color: #2563eb;
  color: #2563eb;
}

.btn-scene.active {
  background: #dbeafe;
  border-color: #2563eb;
  color: #1e40af;
  font-weight: 600;
  transform: scale(1.05);
}
</style>
