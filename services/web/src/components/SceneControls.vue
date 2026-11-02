<template>
  <div class="scene-controls">
    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
      Escenas rápidas
    </h3>
    <div class="buttons flex gap-2 flex-wrap">
      <button
        v-for="s in scenes"
        :key="s"
        @click="applyScene(s)"
        @mouseenter="onHover(s)"
        class="btn-scene flex flex-col items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 hover:border-smartroom-500 hover:text-smartroom-600 active:scale-95 min-w-[70px]"
        :class="{ 'active': activeScene === s }"
      >
        <span class="text-xs">{{ sceneIcon(s) }}</span>
        <span class="text-[10px] leading-none">{{ sceneShortLabel(s) }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useZonesStore } from '../stores/zones';
import { gsap } from 'gsap';

const props = defineProps(['zoneId']);
const store = useZonesStore();

const scenes = ['welcome', 'relax_sunset', 'work', 'cinema', 'night', 'eco'];
const labels = {
  welcome: 'Bienvenida',
  relax_sunset: 'Relax Atardecer',
  work: 'Trabajo',
  cinema: 'Cine',
  night: 'Noche',
  eco: 'Ahorro',
};
const icons = {
  welcome: '☀️',
  relax_sunset: '🌅',
  work: '💡',
  cinema: '🎬',
  night: '🌙',
  eco: '🍃',
};

const activeScene = computed(() => {
  const z = store.zones.find((z) => z.zone_id === props.zoneId);
  return z ? z.lighting_scene : '';
});

const iconFor = (s) => icons[s] || '•';

const applyScene = async (s) => {
  await store.sendCommand(props.zoneId, 'set_scene', s);
  gsap.fromTo(event.currentTarget, { scale: 1 }, { scale: 0.95, yoyo: true, repeat: 1, duration: 0.15 });
};

const onHover = (s) => {
  if (activeScene.value === s) return;
  gsap.to(`.scene-controls button:nth-child(${scenes.indexOf(s) + 1})`, {
    duration: 0.2,
    y: -4,
    ease: 'power2.out',
  });
};
</script>

<style scoped>
/* Clases aplicadas directamente en el template */
</style>
