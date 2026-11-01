<template>
  <div class="zones-list">
    <h2>Zonas del hotel</h2>
    <div class="status-summary">
      <span :class="{ ok: allOnline }">{{ onlineCount }}/{{ zones.length }} dispositivos online</span>
      <button @click="refresh" class="btn-refresh">Actualizar</button>
    </div>
    <div class="grid">
      <ZoneCard
        v-for="zone in zones"
        :key="zone.zone_id"
        :zone="zone"
        @command="sendCommand"
      />
    </div>
    <p v-if="store.error" class="empty">{{ store.error }}</p>
    <p v-else-if="!zones.length" class="empty">Cargando zonas…</p>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useZonesStore } from '../stores/zones';
import ZoneCard from '../components/ZoneCard.vue';

const store = useZonesStore();

// Reactivo: se actualiza cuando store.zones cambia
const zones = computed(() => store.zones);

const onlineCount = computed(() => zones.value.reduce((sum, z) => {
  const devs = z.devices_online || {};
  return sum + Object.values(devs).filter(Boolean).length;
}, 0));

const totalDevices = computed(() => zones.value.length * 4);
const allOnline = computed(() => onlineCount.value === totalDevices.value && zones.value.length > 0);

onMounted(() => {
  store.loadZones();
});

const refresh = async () => {
  await store.loadZones();
};

const sendCommand = async (zoneId, type, value) => {
  await store.sendCommand(zoneId, type, value);
  await store.loadZones();
};
</script>

<style>
.zones-list h2 { font-size: 1.25rem; margin-bottom: 16px; }
.status-summary { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; font-size: 0.9rem; color: #475569; }
.btn-refresh { margin-left: auto; background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 12px; font-size: 0.85rem; cursor: pointer; }
.btn-refresh:hover { background: #f8fafc; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.empty { color: #64748b; padding: 24px; }
</style>
