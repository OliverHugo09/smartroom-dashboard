<template>
  <div
    class="zone-card card-panel"
    :class="{ 'scene-active': activeScene, 'occupied': zone.occupancy_status }"
  >
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div>
        <h3 class="font-semibold text-slate-100 leading-tight">{{ zone.name }}</h3>
        <p class="text-xs text-slate-400 mt-0.5">{{ zone.zone_id }}</p>
      </div>
      <button
        @click="goDetail"
        class="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
        aria-label="Ver detalle"
      >
        <LucideChevronRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Escena activa -->
    <div class="flex items-center gap-2 mb-3">
      <span class="w-2 h-2 rounded-full" :class="sceneDotClass"></span>
      <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
        {{ sceneLabel }}
      </span>
    </div>

    <!-- Métricas -->
    <div class="grid grid-cols-2 gap-3 mb-3">
      <!-- Iluminación -->
      <div class="metric-card light-metric">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold text-slate-400">Iluminación</span>
          <span class="text-xs font-bold text-slate-100">{{ zone.dimmer_level }}%</span>
        </div>
        <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative">
          <div
            class="h-full bg-amber-500 rounded-full transition-all duration-700 ease-out"
            :style="{ width: dimmerLevel + '%', boxShadow: dimmerLevel > 0 ? '0 0 12px rgba(251, 191, 36, 0.4)' : 'none' }"
          ></div>
        </div>
        <div class="flex items-center justify-between text-xs text-slate-400 mt-1">
          <span>{{ zone.lighting_scene ? 'Escena activa' : 'Manual' }}</span>
        </div>
      </div>

      <!-- Temperatura y setpoint en la misma barra -->
      <div class="metric-card temp-metric">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold text-slate-400">Temperatura</span>
          <span class="text-xs font-bold" :class="tempTextColor">{{ roundTemp(zone.thermostat_temp) }}°C</span>
        </div>
        <div class="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative">
          <!-- Barra de temperatura actual -->
          <div
            class="h-full rounded-full transition-all duration-700 ease-out"
            :style="{
              width: tempFill + '%',
              background: tempColor,
              boxShadow: tempColor ? '0 0 10px ' + tempColor + '60' : 'none'
            }"
          ></div>
          <!-- Marcador de setpoint -->
          <div
            class="absolute top-[-2px] bottom-[-2px] w-1 bg-white rounded-full"
            :style="{ left: tempSetpointFill + '%', boxShadow: '0 0 6px white' }"
          ></div>
        </div>
        <div class="flex items-center justify-between text-xs text-slate-400 mt-1">
          <span>Setpoint {{ roundTemp(zone.thermostat_setpoint) }}°C</span>
        </div>
      </div>

      <!-- Cortinas -->
      <div class="metric-card curtain-metric col-span-2">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs font-semibold text-slate-400">Cortinas</span>
          <span class="text-xs font-bold text-slate-100">{{ zone.curtains_position }}%</span>
        </div>
        <div class="curtain-track h-10 w-full bg-slate-800 rounded-lg overflow-hidden border border-slate-700 relative">
          <!-- Cortina izquierda (desde izquierda) -->
          <div
            class="curtain-panel absolute top-0 bottom-0 left-0 bg-slate-600/80 transition-all duration-1000 ease-out"
            :style="{ width: curtainLeftWidth + '%', boxShadow: 'inset -2px 0 6px rgba(0,0,0,0.3)' }"
          ></div>
          <!-- Cortina derecha (desde derecha) -->
          <div
            class="curtain-panel absolute top-0 bottom-0 right-0 bg-slate-600/80 transition-all duration-1000 ease-out"
            :style="{ width: curtainRightWidth + '%', boxShadow: 'inset 2px 0 6px rgba(0,0,0,0.3)' }"
          ></div>
          <!-- Indicador de luz filtrada -->
          <div
            class="absolute top-0 bottom-0 left-[50%] w-0.5 bg-white/40 pointer-events-none z-10"
            :style="{ transform: 'translateX(-50%)', opacity: curtainLightOpacity }"
          ></div>
        </div>
        <div class="flex items-center justify-between text-xs text-slate-400 mt-1">
          <span>{{ zone.curtains_position === 0 ? 'Abiertas' : zone.curtains_position === 100 ? 'Cerradas' : 'Parciales' }}</span>
        </div>
      </div>

      <!-- Ocupación -->
      <div class="metric-card occupancy-metric col-span-2">
        <div class="flex items-center gap-2">
          <div
            class="w-2.5 h-2.5 rounded-full"
            :class="{ 'bg-green-400': zone.occupancy_status, 'bg-slate-600': !zone.occupancy_status }"
          ></div>
          <span class="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {{ zone.occupancy_status ? 'Ocupada' : 'Vacía' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Escenas rápidas -->
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
import { LucideChevronRight } from '@lucide/vue';
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
    welcome: 'bg-green-400',
    relax_sunset: 'bg-amber-500',
    work: 'bg-blue-500',
    cinema: 'bg-indigo-500',
    night: 'bg-indigo-900',
    eco: 'bg-emerald-500',
  };
  return map[s] || 'bg-slate-600';
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
  if (t < 21) return 'text-blue-400';
  if (t <= 27) return 'text-amber-400';
  return 'text-red-400';
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
  router.push('/zones/' + props.zone.zone_id);
};

// GSAP: animación de entrada de cada tarjeta
onMounted(() => {
  gsap.fromTo('.zone-card', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
});

// GSAP: pulso cuando cambia la escena
watch(
  () => props.zone.lighting_scene,
  () => {
    gsap.to('.zone-card', { duration: 0.3, scale: 1.03, yoyo: true, repeat: 1, ease: 'power2.out' });
  }
);

const sendCommand = async (type, value) => {
  await store.sendCommand(props.zone.zone_id, type, value);
};
</script>

<style scoped>
.zone-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  min-height: 340px;
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

.zone-card.occupied {
  border-color: #22c55e;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.metric {
  background: #1e293b;
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #334155;
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

.metric .metric-label {
  font-size: 0.65rem;
  color: #94a3b8;
  margin-bottom: 2px;
}

.metric .metric-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #f1f5f9;
}

.occupancy {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #94a3b8;
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
  background: #22c55e;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.6);
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
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 8px 6px;
  font-size: 0.75rem;
  cursor: pointer;
  color: #94a3b8;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 70px;
}

.btn-scene:hover {
  background: #0f172a;
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-2px);
}

.btn-scene.active {
  background: #1e3a8a;
  border-color: #3b82f6;
  color: #60a5fa;
  font-weight: 600;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
