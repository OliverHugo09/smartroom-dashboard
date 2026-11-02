<template>
  <div class="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 tracking-tight">SmartRoom</h1>
        <p class="text-sm text-slate-500">Panel de control — habitaciones del hotel</p>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
          Servicios listos
        </span>
        <button
          @click="refresh"
          class="btn-refresh"
        >
          <span class="sr-only">Actualizar</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card-panel">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Zonas activas</p>
            <p class="text-2xl font-bold text-slate-900">{{ activeZones }}</p>
          </div>
          <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.047A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
          </div>
        </div>
      </div>
      <div class="card-panel">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dispositivos online</p>
            <p class="text-2xl font-bold text-slate-900">{{ onlineCount }}/{{ totalDevices }}</p>
          </div>
          <div class="p-2 bg-green-50 rounded-lg text-green-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
        </div>
      </div>
      <div class="card-panel">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escena activa</p>
            <p class="text-2xl font-bold text-slate-900">{{ dominantSceneLabel }}</p>
          </div>
          <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
          </div>
        </div>
      </div>
      <div class="card-panel">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Temperatura promedio</p>
            <p class="text-2xl font-bold text-slate-900">{{ avgTemp }}°C</p>
          </div>
          <div class="p-2 bg-amber-50 rounded-lg text-amber-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 7a2 2 0 114 0h1m-6 0a2 2 0 11-4 0h1m-1 10a2 2 0 104 0h1m-6 0a2 2 0 114 0h1m-7 4a2 2 0 114 0h1"></path></svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid de habitaciones (mobile-first: 1 col, sm: 2, lg: 3) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <ZoneCard
        v-for="zone in zones"
        :key="zone.zone_id"
        :zone="zone"
        @command="sendCommand"
      />
    </div>

    <p v-if="store.error && zones.length === 0" class="text-center text-slate-500 mt-8">
      {{ store.error }}
    </p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
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

<style scoped>
/* Estilos de btn-refresh definidos en src/index.css (@layer components) */
</style>
