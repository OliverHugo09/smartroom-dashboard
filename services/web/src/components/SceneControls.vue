<template>
  <div class="scene-controls">
    <h3>Escenas rápidas</h3>
    <div class="buttons">
      <button
        v-for="s in scenes"
        :key="s"
        :class="{ active: activeScene === s }"
        @click="applyScene(s)"
        @mouseenter="onHover(s)"
      >
        <span class="scene-icon">{{ iconFor(s) }}</span>
        <span class="scene-text">{{ labels[s] }}</span>
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
  relax_sunset: 'Relax / Atardecer',
  work: 'Trabajo',
  cinema: 'Cine',
  night: 'Noche',
  eco: 'Ahorro',
};

const icons = {
  welcome: '☀️',
  relax_sunset: '🌅',
  work: '💼',
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
  // Animate the clicked button
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
.scene-controls h3 {
  font-size: 0.9rem;
  color: #475569;
  margin-bottom: 12px;
  font-weight: 600;
}

.buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.buttons button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 10px 8px;
  font-size: 0.75rem;
  cursor: pointer;
  color: #334155;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 70px;
}

.buttons button:hover {
  background: #f8fafc;
  border-color: #2563eb;
  color: #2563eb;
  transform: translateY(-2px);
}

.buttons button.active {
  background: #dbeafe;
  border-color: #2563eb;
  color: #1e40af;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
}

.buttons button .scene-icon {
  font-size: 1.2rem;
}

.buttons button .scene-text {
  font-size: 0.7rem;
}
</style>
