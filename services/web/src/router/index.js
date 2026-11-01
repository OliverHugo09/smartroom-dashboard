import { createRouter, createWebHistory } from 'vue-router';
import ZonesList from '../views/ZonesList.vue';
import ZoneDetail from '../views/ZoneDetail.vue';

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'ZonesList', component: ZonesList },
    { path: '/zones/:zoneId', name: 'ZoneDetail', component: ZoneDetail, props: true },
  ],
});
