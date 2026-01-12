import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';

// mdi
import '@mdi/font/css/materialdesignicons.css';
import { mdi } from 'vuetify/iconsets/mdi';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';

const vuetify = createVuetify({
    theme: {
        defaultTheme: 'light',
    },
    icons: {
        defaultSet: 'mdi',
        sets: {
            mdi,
        },
    },
});

createApp(App).use(router).use(vuetify).mount('#app');
