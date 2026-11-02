<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in" appear-class="appear" appear-active-class="appear-active appear-to">
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
    // Los errores se manejan en cada vista
  }
});
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
.appear {
  opacity: 0;
}
.appear-active {
  opacity: 1;
  transition: opacity 0.4s ease;
}
.appear-to {
  opacity: 1;
}
</style>
