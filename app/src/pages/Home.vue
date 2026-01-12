<template>
    <v-container>
        <div class="hero">
            <v-img
                :src="logo"
                alt="Main Visual"
                class="hero-image"
            />
            <div class="main-title">
                <h1>Let's walk</h1>
                <h2>Easy walk with<br />Map and Bus</h2>
                <h3>Let's walkと気楽に散歩しましょう</h3>
            </div>
        </div>

        <div class="main-visual">
            <div class="visual-wrapper">
                <Transition name="slide" mode="out-in">
                    <v-img
                        :key="currentImage"
                        :src="currentImage"
                        class="main-photo"
                        alt="Main Photo"
                        eager
                    />
                </Transition>
            </div>
        </div>

        <div class="notice-section">
            <h2 class="mb-3">サイトからお知らせ</h2>

            <v-alert v-if="loading" type="info" variant="tonal">
                読み込み中…
            </v-alert>

            <v-alert v-else-if="error" type="error" variant="tonal">
                お知らせの取得に失敗しました
            </v-alert>

            <v-list class="rounded-lg pa-3 mb-2 border-md" v-else>
                <v-expansion-panels variant="accordion">
                    <v-expansion-panel
                        v-for="(item, index) in notices"
                        :key="index"
                        elevation="0"
                    >
                        <v-expansion-panel-title>
                            <div class="notice-header">
                                <span class="notice-date font-weight-semibold">
                                    {{ formatDate(item.info_date) }}
                                </span>
                                <span class="notice-title">
                                    {{ item.title || item.information }}
                                </span>
                            </div>
                        </v-expansion-panel-title>

                        <v-expansion-panel-text>
                            {{ item.information }}
                        </v-expansion-panel-text>
                    </v-expansion-panel>
                </v-expansion-panels>
            </v-list>
        </div>

        <v-row
            class="px-4 gap-4 mb-6"
            justify="start"
            direction="column"
            :md-direction="'row'"
        >
            <v-col>
                <v-btn
                    variant="flat"
                    rounded="lg"
                    class="main-button d-flex align-center font-weight-bold border-md"
                    color="surface"
                    elevation="0"
                    rel="noopener"
                    to="/manager"
                >
                    <v-icon
                        icon="mdi-account-question-outline"
                        class="mr-2"
                        size="large"
                    ></v-icon>
                    サイトマニュアル
                </v-btn></v-col
            >
            <v-col>
                <v-btn
                    variant="flat"
                    rounded="lg"
                    class="main-button d-flex align-center font-weight-bold border-md"
                    color="surface"
                    elevation="0"
                    rel="noopener"
                    to="/aboutsite"
                >
                    <v-icon
                        icon="mdi-alert-outline"
                        class="mr-2"
                        size="large"
                    ></v-icon>
                    サイト注意事項
                </v-btn></v-col
            >
        </v-row>
        <div class="start-section">
            <h2 class="mb-3">さっそくつかう！</h2>
            <p class="start-intro">目的地まで最短経路で行くのはかんたんです。そこで、Let's Walkはユーザーにあった距離の運動をしたあと、路線網の発達したバスに乗って目的地に向かうことで手軽に運動できるwebアプリケーションです。</p>
            <v-btn
                variant="flat"
                rounded="lg"
                class="start-button d-flex align-center font-weight-bold border-md"
                color="surface"
                elevation="0"
                rel="noopener"
                to="/start"
            >
                <v-icon
                    icon="mdi-subdirectory-arrow-right"
                    class="mr-2"
                    size="large"
                ></v-icon>
                スタート
            </v-btn>
        </div>
        <div class="warning-section">
            <v-alert
                type="warning"
                variant="tonal"
                class="warning-card mt-12 rounded-lg"
            >
                ※このページの表示内容について、公共交通事業者への直接の問合せは行わないでください。<br />
                ※このサイトは掲載されている交通機関の公式サイトではありません。表示されるデータは間違っている可能性があります。
            </v-alert>
        </div>
    </v-container>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

import logo from '@/assets/icon/letswalk-icon.png'

type Notice = {
    title: string;
    information: string;
    info_date: string;
};

const notices = ref<Notice[]>([]);
const loading = ref(true);
const error = ref(false);

const images = ['/retration2/main-photo.png', '/retration2/main-photo2.png'];
const currentIndex = ref(0);
const currentImage = ref(images[0]);

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
    timer = setInterval(() => {
        currentIndex.value = (currentIndex.value + 1) % images.length;
        currentImage.value = images[currentIndex.value];
    }, 5000);
    try {
        const res = await fetch('/letswalk/information/letswalk-info.json');
        if (!res.ok) throw new Error('fetch failed');
        notices.value = await res.json();
    } catch (e) {
        error.value = true;
    } finally {
        loading.value = false;
    }
});

onUnmounted(() => {
    if (timer !== null) {
        clearInterval(timer);
    }
});

const formatDate = (dateStr: string) => {
    // "2025-03-12-10:35" to "2025/03/12 10:35"
    const [y, m, d, hm] = dateStr.split('-');
    return `${y}/${m}/${d} ${hm}`;
};

</script>
<style lang="css">

.v-container {
    padding: 16px 0px 16px 0px !important;
}

.hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
    max-width: 1100px;
    margin: 60px auto 0;
    padding: 0 16px;
    animation: fadeUp 0.6s ease-out;
}

.hero-image {
    flex: 1;
    flex-shrink: 0;
    order: 2;
    width: 200px;
    height: 200px;
}

.main-visual {
    max-width: 1000px;
    margin: 45px auto 0;
    padding: 0 16px;
}

.main-photo {
    border-radius: 12px;
    filter: grayscale(75%) brightness(0.9) contrast(0.95);
}

.visual-wrapper {
    width: 100%;
    aspect-ratio: 16 / 9;
}

.main-title {
    flex: 2;
    order: 1;
    font-size: 25px;
}

.main-title h1 {
    font-weight: bold;
    line-height: 1;
    margin-bottom: 12px;
    color: #008080;
}

.main-title h2 {
    font-weight: bold;
    line-height: 1.3;
    margin-bottom: 12px;
}

.main-title h3 {
    font-weight: bold;
    font-size: 24px;
    color: #999999;
}

.notice-section {
    max-width: 1000px;
    margin: 60px auto 30px;
    padding: 0 16px;
}

.notice-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding: 18px 0;
}

.notice-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 24px;

    .notice-title {
        font-weight: 600;
        font-size: 18px;
        line-height: 1.5;
        flex: 1 1 auto;
        min-width: 0;
        word-break: break-word;
    }

    .notice-date {
        padding: 4px 18px;
        border-radius: 5px;
        font-size: 16px;
        background-color: #008080;
        color: #FFF;
        flex-shrink: 0;
    }
}

.main-button {
    --v-btn-height: 50px;
    display: block;
    width: 100%;
    max-width: 1000px;
    min-width: 220px;
    height: 50px;
    gap: 12px;
    padding: 0 16px;

    font-size: 17px;
    font-weight: 600;
    text-align: center;
}

.start-section {
    max-width: 1000px;
    margin: 30px auto 30px;
    padding: 0 16px;
}

.start-intro {
    margin: 20px 0px 20px 0px;
    font-size: 20px;
}

.start-button {
    --v-btn-height: 80px;
    display: block;
    width: 100%;
    max-width: 1000px;
    min-width: 220px;
    height: 50px;
    gap: 12px;
    padding: 0 16px;

    font-size: 27px;
    font-weight: 600;
    text-align: center;
}

.warning-card {
    max-width: 1000px;
    margin: 10px auto 45px;
    font-size: 16px;
}

.warning-section {
    max-width: 1000px;
    padding: 0 16px;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 1s ease, opacity 1s ease;
}

.slide-enter-from {
    transform: translateX(20px);
    opacity: 0;
}

.slide-leave-to {
    transform: translateX(-20px);
    opacity: 0;
}

@media (max-width: 960px) {
    .hero {
        margin: 40px auto 0;
        flex-direction: column;
        text-align: center;
    }

    .hero-image {
        order: 1;
    }

    .main-title {
        order: 2;
    }

    .main-title h1,
    .main-title h2,
    .main-title h3 {
        text-align: center;
    }

    .main-title h3 {
        font-size: 20px;
    }
}

@media (max-width: 600px) {
    .hero-image {
        width: 140px;
        height: 140px;
    }
}

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 480px) {
    .notice-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;

        .notice-date {
            margin-top: 4px;
        }
    }
}
</style>