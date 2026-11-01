import axios from 'axios';

const DEMO_KEY = import.meta.env.VITE_DEMO_KEY || 'demo-local-key';
const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'x-demo-key': DEMO_KEY,
    'Content-Type': 'application/json',
  },
});

export const fetchHealth = () => api.get('/health');
export const fetchZones = () => api.get('/zones');
export const fetchZone = (zoneId) => api.get(`/zones/${zoneId}`);
export const postCommand = (zoneId, body) => api.post(`/zones/${zoneId}/commands`, body);
export const fetchEvents = (params) => api.get('/events', { params });

export default api;
