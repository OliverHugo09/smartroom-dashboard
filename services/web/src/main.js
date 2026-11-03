import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import './js/bootstrap';
import App from './App.vue';
import ZonesList from './views/ZonesList.vue';
import ZoneDetail from './views/ZoneDetail.vue';

const pinia = createPinia();

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'ZonesList', component: ZonesList },
    { path: '/zones/:zoneId', name: 'ZoneDetail', component: ZoneDetail, props: true },
  ],
});

const app = createApp(App);
app.use(pinia);
app.use(router);
app.mount('#app');
