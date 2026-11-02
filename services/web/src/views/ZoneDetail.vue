<template>
  <div class="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 max-w-3xl mx-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <button
        @click="router.push('/')"
        class="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
        aria-label="Volver"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">{{ zone?.name || 'Cargando…' }}</h1>
        <p class="text-sm text-slate-500">{{ zone?.zone_id }}</p>
      </div>
    </div>

    <div v-if="!zone" class="text-center py-20">
      <p class="text-slate-500">Cargando zona…</p>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Iluminación -->
      <div class="card-panel">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M5.555 6.445L4.455 5.346l-.707.707l1.414 1.414l.707-.707L5.555 6.445z"></path></svg>
            Iluminación
          </h3>
          <span class="text-xs font-bold" :class="tempTextColor">{{ roundTemp(zone.dimmer_level) }}%</span>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Escena</label>
            <select
              v-model="selectedScene"
              @change="applyScene"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-smartroom-500 focus:border-smartroom-500 outline-none transition-all"
            >
              <option v-for="s in sceneOptions" :key="s" :value="s">{{ sceneLabel(s) }}</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Atenuación</span>
              <span class="text-sm font-bold text-slate-700">{{ zone.dimmer_level }}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              :value="zone.dimmer_level"
              @input="onDimmerInput"
              class="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div class="light-preview h-16 rounded-lg border border-slate-100 bg-white flex items-center justify-center relative overflow-hidden mt-2">
              <div
                class="absolute inset-0 bg-amber-400/20 rounded-lg blur-xl"
                :style="{ opacity: glowOpacity, transition: 'opacity 0.5s ease' }"
              ></div>
              <div class="relative z-10 text-slate-500 text-xs">{{ zone.dimmer_level === 0 ? 'Apagado' : zone.dimmer_level + '% brillo' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Clima -->
      <div class="card-panel">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900 flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26 3.674 1.26 4.934 0l5-5A2 2 0 0022 9.172V5.636a2 2 0 00-.586-1.414l-5-5A2 2 0 0017.172 1H13v4a2 2 0 00-1.414.586l-2.5 2.5A2 2 0 018 9.172V5.172z"></path></svg>
            Clima
          </h3>
          <span class="text-xs font-bold" :class="tempTextColor">{{ roundTemp(zone.thermostat_temp) }}°C</span>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Modo HVAC</span>
              <span class="text-sm font-bold text-slate-700 capitalize">{{ zone.hvac_mode }}</span>
            </label>
            <select
              v-model="zone.hvac_mode"
              @change="sendCommand('set_hvac_mode', zone.hvac_mode)"
              class="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-smartroom-500 focus:border-smartroom-500 outline-none transition-all"
            >
              <option value="auto">Auto</option>
              <option value="cool">Frío</option>
              <option value="heat">Calor</option>
              <option value="off">Apagado</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Setpoint</span>
              <span class="text-sm font-bold text-slate-700">{{ roundTemp(zone.thermostat_setpoint) }}°C</span>
            </label>
            <input
              type="range"
              min="16"
              max="30"
              step="0.5"
              :value="zone.thermostat_setpoint"
              @input="onSetpointInput"
              class="w-full accent-red-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div class="temp-preview mt-2">
              <div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full"
                  :style="{ width: tempSetpointFill + '%', background: tempSetpointColor, boxShadow: '0 0 10px ' + tempSetpointColor + '40' }"
                  :class="tempSetpointColor.includes('blue') ? 'temp-bar-cold' : tempSetpointColor.includes('amber') ? 'temp-bar-warm' : 'temp-bar-hot'"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-slate-500 mt-1">
                <span>16°C</span>
                <span class="font-semibold">{{ roundTemp(zone.thermostat_temp) }}°C actual</span>
                <span>30°C</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cortinas -->
      <div class="card-panel lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            Cortinas
          </h3>
          <span class="text-xs font-bold text-slate-700">{{ zone.curtains_position }}%</span>
        </div>

        <div class="space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider flex justify-between">
              <span>Posición</span>
              <span class="text-sm font-bold text-slate-700">{{ zone.curtains_position }}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              :value="zone.curtains_position"
              @input="onCurtainsInput"
              class="w-full accent-purple-500 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
            />
            <div class="curtain-preview h-32 rounded-lg border border-slate-100 bg-white relative overflow-hidden flex items-center justify-center mt-2">
              <!-- Fondo ventana -->
              <div class="absolute inset-0 bg-blue-50/30"></div>
              <!-- Cortina izquierda -->
              <div
                class="curtain-panel absolute top-0 bottom-0 left-0 bg-slate-200/80 transition-all duration-1000 ease-out border-r border-slate-300/50"
                :style="{ width: curtainLeftWidth + '%', boxShadow: 'inset -1px 0 6px rgba(0,0,0,0.15)' }"
              ></div>
              <!-- Cortina derecha -->
              <div
                class="curtain-panel absolute top-0 bottom-0 right-0 bg-slate-200/80 transition-all duration-1000 ease-out border-l border-slate-300/50"
                :style="{ width: curtainRightWidth + '%', boxShadow: 'inset 1px 0 6px rgba(0,0,0,0.15)' }"
              ></div>
              <!-- Luz filtrada -->
              <div
                class="absolute top-0 bottom-0 left-1/2 w-1 bg-white/50 pointer-events-none z-10"
                :style="{ transform: 'translateX(-50%)', opacity: curtainLightOpacity }"
              ></div>
              <span class="relative z-10 text-xs font-medium text-slate-600">
                {{ zone.curtains_position === 0 ? 'Abiertas' : zone.curtains_position === 100 ? 'Cerradas' : 'Parciales' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ocupación y eventos -->
      <div class="card-panel lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a4 4 0 004 4h5a4 4 0 004-4v6m4-6v-6m-1 5H9m-1 0h.01M9 16h.01"></path></svg>
            Ocupación
          </h3>
          <span
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
            :class="{ 'bg-green-100 text-green-700': zone.occupancy_status, 'bg-slate-100 text-slate-500': !zone.occupancy_status }"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="{ 'bg-green-500': zone.occupancy_status, 'bg-slate-400': !zone.occupancy_status }"></span>
            {{ zone.occupancy_status ? 'Ocupada' : 'Vacía' }}
          </span>
        </div>

        <div class="bg-slate-900 rounded-lg p-4 overflow-hidden">
          <div class="flex justify-between mb-2">
            <span class="text-xs font-semibold text-slate-300">Eventos recientes</span>
            <span class="text-xs text-slate-500">Últimos 5</span>
          </div>
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            <div v-for="(e, i) in recentEvents" :key="i" class="flex justify-between items-start">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-smartroom-500/50"></span>
                <span class="text-xs text-slate-400 font-mono">{{ e.ts.substring(11, 19) }}</span>
              </div>
              <span class="text-xs text-slate-300">{{ e.message }}</span>
            </div>
            <div v-if="recentEvents.length === 0" class="text-xs text-slate-500 text-center py-4">
              Sin eventos recientes.
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
import { gsap } from 'gsap';

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
  if (sp < 21) return '#3b82f6'; // azul frío
  if (sp <= 27) return '#f59e0b'; // naranja óptimo/medio
  return '#ef4444'; // rojo caliente
});
const curtainLeftWidth = computed(() => {
  const p = zone.value?.curtains_position || 0;
  return p / 2;
});
const curtainRightWidth = computed(() => {
  const p = zone.value?.curtains_position || 0;
  return p / 2;
});
const curtainLightOpacity = computed(() => {
  const p = zone.value?.curtains_position || 0;
  return 1 - p / 100;
});

const tempTextColor = computed(() => {
  const t = zone.value?.thermostat_temp || 20;
  if (t < 21) return 'text-blue-600';
  if (t <= 27) return 'text-amber-600';
  return 'text-red-600';
});

const recentEvents = computed(() => {
  // Los eventos son globales, mostramos los últimos del store
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
  gsap.fromTo('.card-panel', { opacity: 0.8 }, { opacity: 1, duration: 0.4, stagger: 0.1 });
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

<style scoped>
.temp-bar-cold {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}
.temp-bar-warm {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.temp-bar-hot {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.light-preview {
  transition: all 0.5s ease;
}
.curtain-preview {
  transition: all 0.8s ease;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
