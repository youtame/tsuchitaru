<template>
<v-app>
    <v-app-bar app>
        <v-app-bar-title>
            <div class="d-flex align-center">
                <v-img
                    :src="logo"
                    max-height="40"
                    max-width="40"
                    contain
                    alt="site logo"
                    class="icon-app-bar"
                />
                <span class="mr-2 pl-4 font-weight-bold">Let's walk</span>
            </div>
        </v-app-bar-title>
        <v-app-bar-nav-icon @click="drawer = !drawer" />
    </v-app-bar>

    <v-navigation-drawer
            v-model="drawer"
            location="right"
            app
            temporary
            width="111"
        >
        <v-list>
            <v-list-item>
                <v-list-item-title>
                    <v-btn elevation="0" size="large" width="auto" to="/">
                        <v-icon
                            icon="mdi-home-outline"
                            size="large"
                        ></v-icon>
                    </v-btn>
                </v-list-item-title>
            </v-list-item>

            <v-list-item>
                <v-list-item-title>
                    <v-btn
                        @click="toggleTheme"
                        elevation="0"
                        size="large"
                        width="auto"
                    >
                        <v-icon size="large">
                            {{
                                theme.global.current.value.dark
                                    ? 'mdi-white-balance-sunny'
                                    : 'mdi-weather-night'
                            }}
                        </v-icon>
                    </v-btn>
                </v-list-item-title>
            </v-list-item>
        </v-list>
    </v-navigation-drawer>
    <v-main class="main-view">
        <router-view />
    </v-main>
        <v-footer class="text-center d-flex flex-column ga-2 py-4">
            <v-divider class="my-2" thickness="2" width="50"></v-divider>

            <div class="text-caption font-weight-regular opacity-60">
                当サイトは、掲載されている会社が運営しているものではなく、それぞれの会社の個別の承認を受けたものではありません
            </div>

            <div class="text-caption font-weight-regular opacity-60">
                サイト利用前に、ライセンス及びアプリの使用に関するお願いをご覧ください
            </div>

            <v-divider></v-divider>

            <div>{{ new Date().getFullYear() }} — <strong>102℃</strong></div>
        </v-footer>
</v-app>
</template>

<script setup lang="ts">

import { ref, computed, onMounted, watch } from 'vue';
import { useTheme } from 'vuetify';
import { useRoute } from 'vue-router';

import logo from '@/assets/icon/letswalk-icon.png'

const drawer = ref(false);
const theme = useTheme();
const route = useRoute();

function toggleTheme() {
    theme.global.current.value.dark
        ? theme.change('light')
        : theme.change('dark');
}

onMounted(() => {
    const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
    ).matches;
    theme.change(prefersDark ? 'dark' : 'light');
});
</script>
<style lang="css" scoped>
.main-view {
    width: 90%;
    max-width: 1200px;
    margin: auto;
}

.icon-app-bar {
    width: 48px;
    height: 48px;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
}
</style>