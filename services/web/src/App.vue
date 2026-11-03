<template>
  <div class="app d-flex flex-column min-vh-100 bg-dark text-light">
    <header class="app-header bg-dark border-bottom border-secondary">
      <div class="container-xxl px-4 py-3">
        <div class="d-flex align-items-center justify-content-between">
          <h1 class="h4 mb-0 text-white">SmartRoom</h1>
          <div class="d-flex align-items-center gap-3">
            <span
              class="badge bg-success"
              :class="{ 'bg-success': isAwake, 'bg-secondary': !isAwake }"
            >
              {{ isAwake ? 'Servicios listos' : 'Despertando…' }}
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-fill container-xxl py-4 px-4">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="bg-dark border-top border-secondary py-3 text-center">
      <div class="container-xxl px-4">
        <p class="mb-0 text-secondary small">
          Demo con datos simulados · servicios gratuitos pueden tardar ~1 min en despertar
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useZonesStore } from './stores/zones';

const store = useZonesStore();
const isAwake = ref(false);

onMounted(async () => {
  try {
    await store.fetchHealth();
    isAwake.value = true;
    await store.loadZones();
    store.openWebSocket();
  } catch (e) {
    // Error silencioso, la UI mostrará el estado por defecto
  }
});
</script>

<style>
.app-header {
  background: #0a0a0a;
  border-bottom-color: #334155 !important;
}
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
