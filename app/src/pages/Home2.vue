<template>
  <v-container class="page-wrapper">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="main-title">
          <span class="subtitle-badge">Let's walk</span>
          <h1>Easy walk with<br /><span class="text-primary">Map and Bus</span></h1>
          <h3>Let's walkと気楽に散歩しましょう</h3>
        </div>
        <div class="hero-image-container">
          <v-img :src="logo" alt="Main Visual" class="hero-logo" />
        </div>
      </div>
    </div>

    <!-- Slideshow Section -->
    <div class="main-visual-container">
      <div class="visual-wrapper shadow-xl">
        <Transition name="fade-slide" mode="out-in">
          <v-img
            :key="currentImage"
            :src="currentImage"
            class="main-photo"
            alt="Main Photo"
            cover
            eager
          />
        </Transition>
      </div>
    </div>

    <!-- Notices -->
    <div class="section-container">
      <div class="section-header">
        <v-icon icon="mdi-bell-outline" class="mr-2" color="primary"></v-icon>
        <h2>サイトからお知らせ</h2>
      </div>

      <v-alert v-if="loading" type="info" variant="tonal" class="rounded-xl">
        読み込み中…
      </v-alert>

      <v-alert v-else-if="error" type="error" variant="tonal" class="rounded-xl">
        お知らせの取得に失敗しました
      </v-alert>

      <div v-else class="notice-list">
        <v-expansion-panels variant="accordion" class="custom-panels">
          <v-expansion-panel
            v-for="(item, index) in notices"
            :key="index"
            elevation="0"
            class="notice-panel"
          >
            <v-expansion-panel-title>
              <div class="notice-header-row">
                <span class="notice-date-chip">
                  {{ formatDate(item.info_date) }}
                </span>
                <span class="notice-title-text">
                  {{ item.title || item.information }}
                </span>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text class="notice-body">
              {{ item.information }}
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </div>

    <!-- Quick Links -->
    <v-row class="mt-8 px-2" gutter="16">
      <v-col cols="12" md="6">
        <v-btn
          block
          height="72"
          variant="outlined"
          rounded="xl"
          class="nav-card-btn"
          to="/manager"
        >
          <v-icon icon="mdi-book-open-variant" size="28" class="mr-4"></v-icon>
          <div class="text-left">
            <div class="text-caption">GUIDE</div>
            <div class="text-button font-weight-bold">サイトマニュアル</div>
          </div>
        </v-btn>
      </v-col>
      <v-col cols="12" md="6">
        <v-btn
          block
          height="72"
          variant="outlined"
          rounded="xl"
          class="nav-card-btn"
          to="/aboutsite"
        >
          <v-icon icon="mdi-shield-check-outline" size="28" class="mr-4"></v-icon>
          <div class="text-left">
            <div class="text-caption">TERMS</div>
            <div class="text-button font-weight-bold">サイト注意事項</div>
          </div>
        </v-btn>
      </v-col>
    </v-row>

    <!-- Call to Action -->
    <div class="cta-section mt-12">
      <div class="cta-card">
        <h2>さっそくつかう！</h2>
        <p class="cta-description">
          目的地まで最短経路で行くのはかんたんです。そこで、Let's Walkはユーザーにあった距離の運動をしたあと、路線網の発達したバスに乗って目的地に向かうことで手軽に運動できるツールです。
        </p>
        <v-btn
          size="x-large"
          rounded="pill"
          color="primary"
          class="start-button-modern shadow-lg"
          to="/start"
        >
          ウォーキングを始める
          <v-icon icon="mdi-arrow-right" class="ml-2"></v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Warning -->
    <div class="warning-section">
      <div class="warning-inner">
        <v-icon icon="mdi-information-outline" size="small" class="mr-2"></v-icon>
        <div>
          <p>※このページの表示内容について、公共交通事業者への直接の問合せは行わないでください。</p>
          <p>※このサイトは掲載されている交通機関の公式サイトではありません。</p>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import logo from "@/assets/icon/letswalk-icon.png";

type Notice = {
  title: string;
  information: string;
  info_date: string;
};

const notices = ref<Notice[]>([]);
const loading = ref(true);
const error = ref(false);

const images = ["/letswalk/main-photo.png", "/letswalk/main-photo2.png"];
const currentIndex = ref(0);
const currentImage = ref(images[0]);

let timer: ReturnType<typeof setInterval> | null = null;

onMounted(async () => {
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % images.length;
    currentImage.value = images[currentIndex.value];
  }, 5000);
  try {
    const res = await fetch("/letswalk/information/letswalk-info.json");
    if (!res.ok) throw new Error("fetch failed");
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
  const [y, m, d, hm] = dateStr.split("-");
  return `${y}.${m}.${d}`;
};
</script>

<style scoped>
/* Color Palette & Variables */
:deep(.text-primary) {
  color: #008080 !important;
}

.page-wrapper {
  max-width: 1000px;
  padding: 40px 20px !important;
  background-color: #fafafa;
}

/* Hero Modernization */
.hero-section {
  margin-bottom: 40px;
  position: relative;
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.subtitle-badge {
  display: inline-block;
  background: rgba(0, 128, 128, 0.1);
  color: #008080;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 12px;
}

.main-title h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.1;
  font-weight: 800;
  color: #2c3e50;
  margin-bottom: 16px;
}

.main-title h3 {
  font-size: 18px;
  color: #7f8c8d;
  font-weight: 500;
}

.hero-logo {
  width: 180px;
  height: 180px;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.1));
}

/* Slideshow - Removed Grayscale for a more vibrant feel */
.main-visual-container {
  margin: 40px 0;
}

.visual-wrapper {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.12);
}

.main-photo {
  transition: transform 0.8s ease;
}

/* Notices - Modern Card Style */
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 700;
}

.custom-panels {
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #eee;
}

.notice-panel {
  border-bottom: 1px solid #eee !important;
}

.notice-header-row {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
}

.notice-date-chip {
  background: #f0f4f4;
  color: #008080;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: monospace;
}

.notice-title-text {
  font-weight: 600;
  color: #333;
}

/* Buttons and Navigation */
.nav-card-btn {
  background: white !important;
  border: 1px solid #e0e0e0 !important;
  transition: all 0.3s ease;
  text-transform: none;
}

.nav-card-btn:hover {
  transform: translateY(-3px);
  border-color: #008080 !important;
  background: #f0fafa !important;
}

/* CTA Section */
.cta-card {
  background: white;
  padding: 40px;
  border-radius: 32px;
  text-align: center;
  border: 1px solid #e0e0e0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.cta-card h2 {
  font-size: 28px;
  font-weight: 800;
  margin-bottom: 16px;
}

.cta-description {
  font-size: 16px;
  color: #666;
  max-width: 600px;
  margin: 0 auto 30px;
  line-height: 1.6;
}

.start-button-modern {
  padding: 0 40px !important;
  font-weight: 700;
  letter-spacing: 0;
  height: 60px !important;
}

/* Warning Footer */
.warning-section {
  margin-top: 60px;
  padding: 20px;
  background: #fffbeb;
  border-radius: 16px;
  color: #92400e;
  font-size: 13px;
  line-height: 1.6;
}

.warning-inner {
  display: flex;
  align-items: flex-start;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.6s ease-in-out;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: scale(1.05);
}

.fade-slide-leave-to {
  opacity: 0;
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-logo {
    order: -1;
    width: 120px;
    height: 120px;
  }
  
  .notice-header-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>