<template>
  <div class="min-h-screen bg-slate-950 text-slate-100 antialiased">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useZonesStore } from './stores/zones';

const store = useZonesStore();

onMounted(async () => {
  try {
    await store.fetchHealth();
    await store.loadZones();
    store.openWebSocket();
  } catch (e) {
    console.error('Error inicializando:', e);
  }
});
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
