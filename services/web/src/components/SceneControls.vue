<template>
  <div class="scene-controls mb-3">
    <label class="form-label text-secondary small text-uppercase fw-bold">Escena r&aacute;pida</label>
    <div class="d-inline-block">
      <button
        class="btn btn-outline-secondary dropdown-toggle"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span class="me-2">{{ sceneIcon(activeScene || 'welcome') }}</span>
        {{ sceneLabel(activeScene || 'welcome') }}
      </button>
      <ul class="dropdown-menu dropdown-menu-dark">
        <li v-for="s in scenes" :key="s">
          <button
            class="dropdown-item"
            :class="{ active: activeScene === s }"
            @click="applyScene(s)"
          >
            <span class="me-2">{{ sceneIcon(s) }}</span>{{ sceneLabel(s) }}
          </button>
        </li>
      </ul>
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

const sceneIcon = (s) => icons[s] || '•';
const sceneLabel = (s) => labels[s] || s;

const applyScene = async (s) => {
  await store.sendCommand(props.zoneId, 'set_scene', s);
};
</script>

<style>
.scene-controls .dropdown-menu-dark {
  background: #1e293b;
  border: 1px solid #334155;
}
.scene-controls .dropdown-item {
  color: #cbd5e1;
  padding: 0.5rem 1rem;
}
.scene-controls .dropdown-item:hover {
  background: #334155;
  color: #f1f5f9;
}
.scene-controls .dropdown-item.active {
  background: #3b82f6;
  color: #ffffff;
}
.scene-controls .btn-outline-secondary {
  border-color: #334155;
  color: #94a3b8;
  background: #0f172a;
}
.scene-controls .btn-outline-secondary:hover {
  border-color: #475569;
  color: #f1f5f9;
}
</style>
