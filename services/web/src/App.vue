<template>
  <div class="app">
    <header class="app-header">
      <h1>SmartRoom</h1>
      <div class="status-badge" :class="{ awake: isAwake }">{{ statusText }}</div>
      <p class="subtitle">Demo con datos simulados · servicios gratuitos pueden tardar ~1 min en despertar</p>
    </header>

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useZonesStore } from './stores/zones';

const store = useZonesStore();
const isAwake = ref(false);
const statusText = ref('Despertando servicios…');

onMounted(async () => {
  try {
    await store.fetchHealth();
    isAwake.value = true;
    statusText.value = 'Servicios listos';
    store.openWebSocket();
  } catch (e) {
    statusText.value = 'Servicios no disponibles (intenta de nuevo en ~1 min)';
  }
});
</script>

<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, -apple-system, sans-serif; background: #f5f7fa; color: #111; line-height: 1.5; }
.app { max-width: 1000px; margin: 0 auto; padding: 24px; }
.app-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ddd; }
.app-header h1 { font-size: 1.5rem; letter-spacing: -0.5px; }
.status-badge { font-size: 0.85rem; padding: 4px 10px; border-radius: 20px; background: #e2e8f0; color: #475569; }
.status-badge.awake { background: #dcfce7; color: #166534; }
.subtitle { font-size: 0.85rem; color: #64748b; margin-top: 4px; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
