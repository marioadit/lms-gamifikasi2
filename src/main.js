import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './assets/style/main.css'
import router from './router/index.js';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons' // semua ikon solid
import { far } from '@fortawesome/free-regular-svg-icons' // optional
import { fab } from '@fortawesome/free-brands-svg-icons' // optional
import { formatDate } from './helper/helper.js';
import vue3lottie from 'vue3-lottie';

const app = createApp(App);
const pinia = createPinia();

library.add(fas, far, fab)

const base_url = import.meta.env.VITE_API_URL;

app.config.globalProperties.$base_url = base_url;
app.config.globalProperties.$formatDate = formatDate;
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(vue3lottie);
app.use(pinia);
app.use(router);

app.mount("#app");
