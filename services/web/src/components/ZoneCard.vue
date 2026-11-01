<template>
  <div class="zone-card" :class="{ offline: !allOnline }">
    <div class="card-header">
      <h3>{{ zone.name }}</h3>
      <router-link :to="`/zones/${zone.zone_id}`" class="go-detail">Controlar &rarr;</router-link>
    </div>

    <div class="scene">
      <span class="label">Escena</span>
      <span class="value">{{ sceneLabel }}</span>
    </div>

    <div class="metrics">
      <div class="metric">
        <span class="label">Iluminación</span>
        <span class="value">{{ zone.dimmer_level }}%</span>
      </div>
      <div class="metric">
        <span class="label">Temperatura</span>
        <span class="value">{{ zone.thermostat_temp }}°C</span>
      </div>
      <div class="metric">
        <span class="label">Cortinas</span>
        <span class="value">{{ zone.curtains_position }}%</span>
      </div>
      <div class="metric">
        <span class="label">HVAC</span>
        <span class="value">{{ zone.hvac_mode }}</span>
      </div>
    </div>

    <div class="occupancy">
      <span class="dot" :class="{ on: zone.occupancy_status }"></span>
      <span>{{ zone.occupancy_status ? 'Ocupada' : 'Vacía' }}</span>
    </div>

    <div class="quick-actions">
      <button v-for="s in quickScenes" :key="s" @click="sendCommand('set_scene', s)" class="btn-scene">
        {{ shortLabel(s) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useZonesStore } from '../stores/zones';

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

const sendCommand = async (type, value) => {
  await store.sendCommand(props.zone.zone_id, type, value);
};
</script>

<style>
.zone-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.zone-card.offline { opacity: 0.6; filter: grayscale(0.4); }
.card-header { display: flex; justify-content: space-between; align-items: flex-start; }
.card-header h3 { font-size: 1.1rem; color: #111; }
.go-detail { font-size: 0.85rem; color: #2563eb; text-decoration: none; }
.go-detail:hover { text-decoration: underline; }
.scene { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; }
.scene .label { color: #64748b; }
.scene .value { font-weight: 600; color: #334155; }
.metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.metric { background: #f8fafc; border-radius: 8px; padding: 8px 6px; text-align: center; }
.metric .label { display: block; font-size: 0.7rem; color: #64748b; margin-bottom: 2px; }
.metric .value { display: block; font-size: 0.9rem; font-weight: 600; color: #111; }
.occupancy { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #475569; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; }
.dot.on { background: #16a34a; box-shadow: 0 0 6px #16a34a; }
.quick-actions { display: flex; gap: 6px; margin-top: 4px; }
.btn-scene { flex: 1; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 8px; font-size: 0.75rem; cursor: pointer; color: #334155; }
.btn-scene:hover { background: #e2e8f0; }
</style>
