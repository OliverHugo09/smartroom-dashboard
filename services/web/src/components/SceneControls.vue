<template>
  <div class="scene-controls">
    <h3>Escenas rápidas</h3>
    <div class="buttons">
      <button
        v-for="s in scenes"
        :key="s"
        :class="{ active: activeScene === s }"
        @click="applyScene(s)"
      >
        {{ labels[s] }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useZonesStore } from '../stores/zones';

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

const activeScene = computed(() => {
  const z = store.zones.find((z) => z.zone_id === props.zoneId);
  return z ? z.lighting_scene : '';
});

const applyScene = async (s) => {
  await store.sendCommand(props.zoneId, 'set_scene', s);
};
</script>

<style>
.scene-controls h3 { font-size: 0.9rem; color: #475569; margin-bottom: 8px; }
.buttons { display: flex; gap: 6px; flex-wrap: wrap; }
.buttons button { background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 0.8rem; cursor: pointer; color: #334155; }
.buttons button:hover { background: #f8fafc; }
.buttons button.active { background: #dbeafe; border-color: #2563eb; color: #1e40af; font-weight: 600; }
</style>
