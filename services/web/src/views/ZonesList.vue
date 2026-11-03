<template>
  <div class="zones-list container-xxl py-4">
    <div class="d-flex flex-wrap align-items-center justify-content-between mb-4">
      <div>
        <h2 class="h3 text-white mb-1">Zonas del hotel</h2>
        <p class="text-secondary mb-0">Panel de control de habitaciones</p>
      </div>
      <button
        @click="refresh"
        class="btn btn-outline-secondary btn-sm"
      >
        <svg class="bi bi-arrow-clockwise" width="16" height="16" fill="currentColor">
          <path d="M8 3a5 5 0 1 1 4.5 6.254V3h1a4 4 0 1 1 0 8h-1V4.75A4.25 4.25 0 1 0 8 3zM3.75 2.5A.75.75 0 1 1 4.5 2.5v2h1V1a2 2 0 1 0 0 4h1v1.5a2.75 2.75 0 1 1-2.25 2V8h-1z"/>
        </svg>
        Actualizar
      </button>
    </div>

    <!-- Resumen rápido -->
    <div class="row g-3 mb-4">
      <div class="col-6 col-sm-6 col-md-3">
        <div class="card bg-dark text-light border-secondary h-100">
          <div class="card-body d-flex flex-column justify-content-center">
            <div class="fw-bold text-white fs-5">{{ activeZones }}</div>
            <div class="text-secondary small">Zonas activas</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-sm-6 col-md-3">
        <div class="card bg-dark text-light border-secondary h-100">
          <div class="card-body d-flex flex-column justify-content-center">
            <div class="fw-bold text-white fs-5">{{ onlineCount }}/{{ totalDevices }}</div>
            <div class="text-secondary small">Dispositivos online</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-sm-6 col-md-3">
        <div class="card bg-dark text-light border-secondary h-100">
          <div class="card-body d-flex flex-column justify-content-center">
            <div class="fw-bold text-white fs-5">{{ dominantSceneLabel }}</div>
            <div class="text-secondary small">Escena activa</div>
          </div>
        </div>
      </div>
      <div class="col-6 col-sm-6 col-md-3">
        <div class="card bg-dark text-light border-secondary h-100">
          <div class="card-body d-flex flex-column justify-content-center">
            <div class="fw-bold text-white fs-5">{{ avgTemp }}°C</div>
            <div class="text-secondary small">Temperatura promedio</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de habitaciones -->
    <div class="row g-4">
      <div class="col-12 col-sm-6 col-lg-4" v-for="zone in zones" :key="zone.zone_id">
        <ZoneCard :zone="zone" @command="sendCommand" />
      </div>
    </div>

    <p v-if="store.error" class="text-center text-danger mt-5">{{ store.error }}</p>
    <p v-else-if="!zones.length" class="text-center text-secondary mt-5">Cargando zonas…</p>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useZonesStore } from '../stores/zones';
import ZoneCard from '../components/ZoneCard.vue';

const store = useZonesStore();
const zones = computed(() => store.zones);

const activeZones = computed(() => zones.value.filter(z => z.devices_online && Object.values(z.devices_online).some(Boolean)).length);
const onlineCount = computed(() => zones.value.reduce((sum, z) => {
  const devs = z.devices_online || {};
  return sum + Object.values(devs).filter(Boolean).length;
}, 0));
const totalDevices = computed(() => zones.value.length * 4);

const dominantScene = computed(() => {
  const scenes = zones.value.map(z => z.lighting_scene).filter(Boolean);
  if (!scenes.length) return null;
  const counts = {};
  scenes.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
});

const sceneLabels = {
  welcome: 'Bienvenida',
  relax_sunset: 'Relax Atardecer',
  work: 'Trabajo',
  cinema: 'Cine',
  night: 'Noche',
  eco: 'Ahorro',
};

const dominantSceneLabel = computed(() => {
  if (!dominantScene.value) return '—';
  return sceneLabels[dominantScene.value] || dominantScene.value;
});

const avgTemp = computed(() => {
  const temps = zones.value.map(z => z.thermostat_temp).filter(t => t != null);
  if (!temps.length) return '—';
  return Math.round(temps.reduce((a, b) => a + b, 0) / temps.length);
});

onMounted(() => {
  store.loadZones();
});

const refresh = async () => {
  await store.loadZones();
};

const sendCommand = async (zoneId, type, value) => {
  await store.sendCommand(zoneId, type, value);
  await store.loadZones();
};
</script>


