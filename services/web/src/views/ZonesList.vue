<template>
  <div class="min-h-screen bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-100 tracking-tight">SmartRoom</h1>
        <p class="text-sm text-slate-400">Panel de control — habitaciones del hotel</p>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-900/50"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
          Servicios listos
        </span>
        <button
          @click="refresh"
          class="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all active:scale-95"
          aria-label="Actualizar"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
        </button>
      </div>
    </div>

    <!-- Resumen -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="card-panel">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Zonas activas</p>
            <p class="text-2xl font-bold text-slate-100">{{ activeZones }}</p>
          </div>
          <div class="p-2 bg-blue-900/30 rounded-lg text-blue-400 border border-blue-900/50">
            <LucideZap class="w-5 h-5" />
          </div>
        </div>
      </div>
      <div class="card-panel">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dispositivos online</p>
            <p class="text-2xl font-bold text-slate-100">{{ onlineCount }}/{{ totalDevices }}</p>
          </div>
          <div class="p-2 bg-green-900/30 rounded-lg text-green-400 border border-green-900/50">
            <LucideCircle class="w-5 h-5" />
          </div>
        </div>
      </div>
      <div class="card-panel">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Escena activa</p>
            <p class="text-2xl font-bold text-slate-100">{{ dominantSceneLabel }}</p>
          </div>
          <div class="p-2 bg-purple-900/30 rounded-lg text-purple-400 border border-purple-900/50">
            <LucideLayoutGrid class="w-5 h-5" />
          </div>
        </div>
      </div>
      <div class="card-panel">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Temperatura promedio</p>
            <p class="text-2xl font-bold text-slate-100">{{ avgTemp }}°C</p>
          </div>
          <div class="p-2 bg-amber-900/30 rounded-lg text-amber-400 border border-amber-900/50">
            <LucideThermometer class="w-5 h-5" />
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

    <p v-if="store.error && zones.length === 0" class="text-center text-slate-400 mt-8">
      {{ store.error }}
    </p>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useZonesStore } from '../stores/zones';
import ZoneCard from '../components/ZoneCard.vue';
import { LucideZap, LucideCircle, LucideLayoutGrid, LucideThermometer } from '@lucide/vue';

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
/* Estilos de card-panel definidos en src/index.css (@layer components) */
</style>
