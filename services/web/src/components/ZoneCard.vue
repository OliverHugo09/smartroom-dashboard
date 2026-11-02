<template>
  <div
    class="zone-card card-panel"
    :class="{ 'scene-active': activeScene }"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="font-semibold text-slate-900 leading-tight">{{ zone.name }}</h3>
        <p class="text-xs text-slate-500 mt-0.5">{{ zone.zone_id }}</p>
      </div>
      <button
        @click="goDetail"
        class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="Ver detalle"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
      </button>
    </div>

    <!-- Escena activa -->
    <div class="flex items-center gap-2 mb-3">
      <span class="w-2 h-2 rounded-full" :class="sceneDotClass"></span>
      <span class="text-xs font-semibold text-slate-600 uppercase tracking-wider">
        {{ sceneLabel }}
      </span>
    </div>

    <!-- Métricas -->
    <div class="grid grid-cols-2 gap-3 mb-3">
      <!-- Iluminación -->
      <div class="metric-card light-metric">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold text-slate-500">Iluminación</span>
          <span class="text-xs font-bold text-slate-700">{{ zone.dimmer_level }}%</span>
        </div>
        <div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative group/light">
          <div
            class="h-full bg-amber-400 rounded-full transition-all duration-700 ease-out group-hover/light:scale-x-105"
            :style="{ width: dimmerLevel + '%', boxShadow: dimmerLevel > 0 ? '0 0 12px rgba(251, 191, 36, 0.5)' : 'none' }"
          ></div>
        </div>
        <div class="flex items-center justify-between text-xs text-slate-500 mt-1">
          <span>{{ zone.lighting_scene ? 'Escena activa' : 'Manual' }}</span>
        </div>
      </div>

      <!-- Temperatura -->
      <div class="metric-card temp-metric">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold text-slate-500">Temperatura</span>
          <span class="text-xs font-bold" :class="tempTextColor">{{ roundTemp(zone.thermostat_temp) }}°C</span>
        </div>
        <div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative group/temp">
          <div
            class="h-full rounded-full transition-all duration-700 ease-out group-hover/temp:scale-x-105"
            :style="{
              width: tempFill + '%',
              background: tempColor,
              boxShadow: tempColor ? `0 0 10px ${tempColor}40` : 'none'
            }"
          ></div>
        </div>
        <div class="flex items-center justify-between text-xs text-slate-500 mt-1">
          <span>Setpoint {{ roundTemp(zone.thermostat_setpoint) }}°C</span>
        </div>
      </div>

      <!-- Cortinas -->
      <div class="metric-card curtain-metric col-span-2">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold text-slate-500">Cortinas</span>
          <span class="text-xs font-bold text-slate-700">{{ zone.curtains_position }}%</span>
        </div>
        <div class="curtain-track h-10 w-full bg-slate-200 rounded-lg overflow-hidden relative border border-slate-100 group/curtain">
          <!-- Cortina izquierda (desde izquierda) -->
          <div
            class="curtain-panel absolute top-0 bottom-0 left-0 bg-slate-300/70 transition-all duration-1000 ease-out group-hover/curtain:scale-y-95"
            :style="{ width: curtainLeftWidth + '%', boxShadow: 'inset -2px 0 6px rgba(0,0,0,0.25)' }"
          ></div>
          <!-- Cortina derecha (desde derecha) -->
          <div
            class="curtain-panel absolute top-0 bottom-0 right-0 bg-slate-300/70 transition-all duration-1000 ease-out group-hover/curtain:scale-y-95"
            :style="{ width: curtainRightWidth + '%', boxShadow: 'inset 2px 0 6px rgba(0,0,0,0.25)' }"
          ></div>
          <!-- Indicador de luz filtrada -->
          <div
            class="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white/60 pointer-events-none z-10"
            :style="{ transform: 'translateX(-50%)', opacity: curtainLightOpacity }"
          ></div>
        </div>
        <div class="flex items-center justify-between text-xs text-slate-500 mt-1">
          <span>{{ zone.curtains_position === 0 ? 'Abiertas' : zone.curtains_position === 100 ? 'Cerradas' : 'Parciales' }}</span>
        </div>
      </div>

      <!-- Ocupación -->
      <div class="metric-card occupancy-metric col-span-2">
        <div class="flex items-center gap-2">
          <div
            class="w-2.5 h-2.5 rounded-full"
            :class="{ 'bg-green-500': zone.occupancy_status, 'bg-slate-300': !zone.occupancy_status }"
          ></div>
          <span class="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            {{ zone.occupancy_status ? 'Ocupada' : 'Vacía' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Escenas rápidas (mobile-first, scroll horizontal) -->
    <div class="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
      <button
        v-for="s in quickScenes"
        :key="s"
        @click="sendCommand('set_scene', s)"
        class="btn-scene flex-shrink-0"
        :class="{ 'active': activeScene === s }"
      >
        <span class="text-xs">{{ sceneIcon(s) }}</span>
        <span class="text-[10px] leading-none">{{ sceneShortLabel(s) }}</span>
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
const emit = defineEmits(['command']);
const router = useRouter();
const store = useZonesStore();

const scenes = {
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

const sceneShort = {
  welcome: 'Bienv.',
  relax_sunset: 'Relax',
  work: 'Trabajo',
  cinema: 'Cine',
  night: 'Noche',
  eco: 'Eco',
};

const activeScene = computed(() => props.zone.lighting_scene);

const sceneLabel = computed(() => scenes[props.zone.lighting_scene] || '—');
const quickScenes = computed(() => Object.keys(scenes).filter(s => s !== props.zone.lighting_scene));

const sceneDotClass = computed(() => {
  const s = props.zone.lighting_scene;
  const map = {
    welcome: 'bg-green-500',
    relax_sunset: 'bg-amber-500',
    work: 'bg-blue-500',
    cinema: 'bg-indigo-500',
    night: 'bg-indigo-900',
    eco: 'bg-emerald-500',
  };
  return map[s] || 'bg-slate-300';
});

const dimmerLevel = computed(() => props.zone.dimmer_level || 0);
const tempFill = computed(() => {
  const t = props.zone.thermostat_temp || 20;
  return Math.min(Math.max(((t - 16) / 14) * 100, 0), 100);
});
const tempColor = computed(() => {
  const t = props.zone.thermostat_temp || 20;
  if (t < 21) return '#3b82f6'; // azul frío
  if (t <= 27) return '#f59e0b'; // naranja óptimo/medio
  return '#ef4444'; // rojo caliente
});
const tempTextColor = computed(() => {
  const t = props.zone.thermostat_temp || 20;
  if (t < 21) return 'text-blue-600';
  if (t <= 27) return 'text-amber-600';
  return 'text-red-600';
});
const curtainLeftWidth = computed(() => (props.zone.curtains_position || 0) / 2);
const curtainRightWidth = computed(() => (props.zone.curtains_position || 0) / 2);
const curtainLightOpacity = computed(() => {
  const p = props.zone.curtains_position || 0;
  return 1 - p / 100;
});

const roundTemp = (t) => t != null ? Math.round(t * 10) / 10 : '—';

const sceneIcon = (s) => sceneIcons[s] || '•';
const sceneShortLabel = (s) => sceneShort[s] || s;

const goDetail = () => {
  router.push(`/zones/${props.zone.zone_id}`);
});

// GSAP: animación de entrada de cada tarjeta
onMounted(() => {
  gsap.fromTo('.zone-card', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
});

// GSAP: pulso cuando cambia la escena
watch(
  () => props.zone.lighting_scene,
  () => {
    gsap.to('.zone-card', {
      duration: 0.3,
      scale: 1.02,
      yoyo: true,
      repeat: 1,
      ease: 'power2.out',
    });
  }
);

const sendCommand = async (type, value) => {
  await store.sendCommand(props.zone.zone_id, type, value);
};
</script>

<style scoped>
/* Estilos base definidos en src/index.css (@layer components).
   Aquí solo sobrescrituras específicas de este componente si fuera necesario. */
.zone-card {
  min-height: 340px;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
