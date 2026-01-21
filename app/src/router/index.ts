// tsuchitaru/app/src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/pages/Home.vue';
import Home2 from '@/pages/Home2.vue';
import Aboutsite from '@/pages/Aboutsite.vue';
import Start from '@/pages/Start.vue';
import Locationstart from '@/pages/Location.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home,
        meta: { title: "Let's Walk｜散歩サポートサイト" },
    },
        {
        path: '/home2',
        name: 'home2',
        component: Home2,
        meta: { title: "Let's Walk｜散歩サポートサイト" },
    },
    {
        path: '/aboutsite',
        name: 'aboutsite',
        component: Aboutsite,
        meta: { title: "Let's Walk｜散歩サポートサイト" },
    },
    {
        path: '/start',
        name: 'start',
        component: Start,
        meta: { title: "Let's Walk｜散歩サポートサイト" },
    },
    {
        path: '/location',
        name: 'location',
        component: Locationstart,
        meta: { title: "Let's Walk｜散歩サポートサイト" },
    },
];

export const router = createRouter({
    history: createWebHistory('/letswalk/'),
    routes,
    scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
        return savedPosition;
        } else {
        return { top: 0 };
        }
    },
});