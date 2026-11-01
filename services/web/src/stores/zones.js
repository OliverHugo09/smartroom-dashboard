import { defineStore } from 'pinia';
import { fetchHealth, fetchZones, postCommand } from '../api/api';

export const useZonesStore = defineStore('zones', {
  state: () => ({
    zones: [],
    health: null,
    ws: null,
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:1880/api/ws/zones',
    isAwake: false,
    error: null,
  }),
  getters: {
    zoneById: (state) => (id) => state.zones.find((z) => z.zone_id === id),
  },
  actions: {
    async fetchHealth() {
      try {
        const res = await fetchHealth();
        this.health = res.data;
        this.isAwake = true;
        this.error = null;
      } catch (e) {
        this.isAwake = false;
        this.error = e.message;
        throw e;
      }
    },
    async loadZones() {
      const res = await fetchZones();
      this.zones = res.data;
      return res.data;
    },
    async sendCommand(zoneId, type, value) {
      const res = await postCommand(zoneId, { type, value });
      return res.data;
    },
    openWebSocket() {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      };
      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'zone_update' && msg.zone) {
            const idx = this.zones.findIndex((z) => z.zone_id === msg.zone.zone_id);
            if (idx >= 0) this.zones[idx] = msg.zone;
            else this.zones.push(msg.zone);
          }
        } catch (e) {
          // ignorar mensajes malformados
        }
      };
      this.ws.onclose = () => {
        // reconectar tras 3 s si la pestaña está visible
        if (document.visibilityState === 'visible') {
          setTimeout(() => this.openWebSocket(), 3000);
        }
      };
    },
    closeWebSocket() {
      if (this.ws) this.ws.close();
    },
  },
});
