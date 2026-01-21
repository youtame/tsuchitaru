<template>
  <v-container class="start-section py-8">
    <h1 class="start-top text-h4 font-weight-bold mb-2">さっそくつかう</h1>
    <p class="start-intro text-body-1 mb-6">
      あなたの情報と目標を入力し、地図から出発地とゴールを選択してください。
    </p>

    <v-form @submit.prevent="submitForm">
      <v-row>
        <v-col cols="12" md="4">
          <v-select
            v-model="weight"
            :items="weightOptions"
            label="あなたの体重"
            suffix="kg"
            item-title="title"
            item-value="value"
            variant="outlined"
            required
          ></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="speed"
            :items="speedOptions"
            label="歩く速度"
            item-title="label"
            item-value="value"
            variant="outlined"
            required
          ></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select
            v-model="targetCalories"
            :items="calorieOptions"
            label="目標消費カロリー"
            item-title="label"
            item-value="value"
            variant="outlined"
            required
          ></v-select>
        </v-col>
      </v-row>

      <v-divider class="my-6"></v-divider>

      <div class="map-selection-ui mb-4">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-card
              :variant="startCoords ? 'flat' : 'outlined'"
              :color="startCoords ? 'orange-lighten-5' : 'grey-lighten-2'"
              class="pa-3 border-sm"
              :class="{ 'border-orange-darken-2': startCoords }"
            >
              <div class="d-flex align-center mb-1">
                <v-icon
                  icon="mdi-map-marker"
                  :color="startCoords ? 'orange-darken-2' : 'grey'"
                  class="mr-2"
                ></v-icon>
                <span class="text-subtitle-2 font-weight-bold"
                  >STEP 1. 出発地の設定</span
                >
              </div>
              <div
                v-if="startCoords"
                class="d-flex align-center justify-space-between"
              >
                <span class="text-caption text-grey-darken-2"
                  >座標: {{ startCoords.lng.toFixed(4) }},
                  {{ startCoords.lat.toFixed(4) }}</span
                >
                <v-btn
                  size="x-small"
                  color="orange-darken-2"
                  variant="text"
                  @click="resetStart"
                  >やり直す</v-btn
                >
              </div>
              <div v-else class="text-caption text-grey">
                地図の好きな場所をクリックしてください
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" sm="6">
            <v-card
              :variant="selectedGoal ? 'flat' : 'outlined'"
              :color="selectedGoal ? 'teal-lighten-5' : 'grey-lighten-2'"
              class="pa-3 border-sm"
              :class="{ 'border-teal-darken-2': selectedGoal }"
            >
              <div class="d-flex align-center mb-1">
                <v-icon
                  icon="mdi-bus"
                  :color="selectedGoal ? 'teal-darken-2' : 'grey'"
                  class="mr-2"
                ></v-icon>
                <span class="text-subtitle-2 font-weight-bold"
                  >STEP 2. ゴールのバス停</span
                >
              </div>
              <div
                v-if="selectedGoal"
                class="d-flex align-center justify-space-between"
              >
                <span class="text-body-2 font-weight-bold text-teal-darken-4">{{
                  selectedGoal.n
                }}</span>
                <v-btn
                  size="x-small"
                  color="teal-darken-2"
                  variant="text"
                  @click="selectedGoal = null"
                  >変更</v-btn
                >
              </div>
              <div v-else class="text-caption text-grey">
                地図上の緑色のアイコンを選択してください
              </div>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <div class="map-wrapper mb-6">
        <div
          id="map"
          class="map-container border-md shadow-sm"
          style="height: 450px"
        ></div>
        <transition name="fade">
          <div
            v-if="mapZoom < 12"
            class="zoom-overlay d-flex align-center justify-center"
          >
            <v-chip color="black" class="px-4"
              >もっとズームするとバス停が表示されます</v-chip
            >
          </div>
        </transition>
      </div>

      <v-btn
        type="submit"
        variant="flat"
        rounded="lg"
        class="submit-button d-flex align-center font-weight-bold border-md"
        color="surface"
        :disabled="!isReady"
        block
      >
        <v-icon icon="mdi-run-fast" class="mr-2"></v-icon>
        ルート計算を開始
      </v-btn>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import busStopsData from "@/assets/busstops_lightweight.json";

interface Coords {
  lng: number;
  lat: number;
}
interface BusStop {
  id: string | number;
  n: string;
  lat: number;
  lng: number;
}

export default defineComponent({
  data() {
    return {
      weight: null as number | null,
      speed: null as number | null,
      targetCalories: null as number | null,
      startCoords: null as Coords | null,
      selectedGoal: null as BusStop | null,
      map: null as mapboxgl.Map | null,
      startMarker: null as mapboxgl.Marker | null,
      mapZoom: 13,
      isStartSet: false, // STEP1（出発地）が設定されたかどうかのフラグ
      speedOptions: [
        { value: 3.0, label: "ゆっくり (3km/h)" },
        { value: 4.8, label: "ふつう (5km/h)" },
        { value: 6.4, label: "いそぎ足 (7km/h)" },
      ],
      calorieOptions: [
        { value: 50, label: "50 kcal" },
        { value: 100, label: "100 kcal" },
        { value: 300, label: "300 kcal" },
      ],
    };
  },
  computed: {
    weightOptions() {
      const options = [];
      for (let i = 40; i <= 120; i += 5) {
        options.push({ value: i, title: `${i} kg` });
      }
      return options;
    },
    isReady(): boolean {
      return !!(
        this.weight &&
        this.speed &&
        this.targetCalories &&
        this.startCoords &&
        this.selectedGoal
      );
    },
  },
  mounted() {
    this.initMap();
  },
  methods: {
    initMap() {
      mapboxgl.accessToken =
        "pk.eyJ1IjoieW91dGFtZSIsImEiOiJjbTB1ejViM3AxaW96MmxxMHozajQwamU0In0.DQaG0fvJzitS_xxXUL5B0g";
      this.map = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/youtame/cm0xhgnwh01w401pwdv2136yl",
        center: [139.6427, 35.6406],
        zoom: 13,
      });

      this.map.on("load", () => {
        this.addBusStopLayer();

        // STEP1の出発地設定が完了していなければ地図をクリックして出発地を設定
        this.map?.on("click", (e) => {
          if (this.isStartSet) return; // STEP1が設定済みならクリックを無視

          // バス停レイヤーをクリックしているかチェック
          const features = this.map?.queryRenderedFeatures(e.point, {
            layers: ["bus-stops-layer"],
          });

          // バス停をクリックした場合は出発地の更新をスキップ
          if (features && features.length > 0) {
            // バス停がクリックされた場合、ゴール地点として選択する
            const f = features[0];
            this.selectedGoal = {
              id: f.properties?.id,
              n: f.properties?.name,
              lng: (f.geometry as any).coordinates[0],
              lat: (f.geometry as any).coordinates[1],
            };
            return; // 出発地の更新処理をここで終了
          }

          // バス停以外なら出発地を更新
          this.startCoords = { lng: e.lngLat.lng, lat: e.lngLat.lat };
          this.updateStartMarker();
          this.isStartSet = true; // 出発地が設定されたことをフラグで記録
        });
      });
    },

    updateStartMarker() {
      if (!this.map || !this.startCoords) return;
      if (this.startMarker) {
        this.startMarker.setLngLat([
          this.startCoords.lng,
          this.startCoords.lat,
        ]);
      } else {
        this.startMarker = new mapboxgl.Marker({ color: "#FF5722" })
          .setLngLat([this.startCoords.lng, this.startCoords.lat])
          .addTo(this.map);
      }
    },

    addBusStopLayer() {
      if (!this.map) return;
      const geojson: any = {
        type: "FeatureCollection",
        features: (busStopsData as BusStop[]).map((stop) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [stop.lng, stop.lat] },
          properties: { id: stop.id, name: stop.n },
        })),
      };
      this.map.addSource("bus-stops", { type: "geojson", data: geojson });
      this.map.addLayer({
        id: "bus-stops-layer",
        type: "circle",
        source: "bus-stops",
        minzoom: 12,
        paint: { "circle-radius": 8, "circle-color": "#008080" },
      });

      // バス停をクリックしたとき
      this.map.on("click", "bus-stops-layer", (e) => {
        // クリックした場所から少しオフセットを加えて周囲のバス停を検出
        const clickPoint = e.point;
        const expandedPoint = [
          clickPoint.x + 0, // X方向に少しオフセット（例: 10px）
          clickPoint.y + 0, // Y方向に少しオフセット（例: 10px）
        ];

        const features = this.map?.queryRenderedFeatures(expandedPoint, {
          layers: ["bus-stops-layer"],
        });

        if (features && features.length > 0) {
          // バス停がクリックされた場合、ゴール地点として設定
          const f = features[0];
          this.selectedGoal = {
            id: f.properties?.id,
            n: f.properties?.name,
            lng: (f.geometry as any).coordinates[0],
            lat: (f.geometry as any).coordinates[1],
          };
        }
      });
    },

    submitForm() {
      if (!this.isReady) return;
      this.$router.push({
        name: "location",
        query: {
          weight: String(this.weight),
          speed: String(this.speed),
          calories: String(this.targetCalories),
          startLng: this.startCoords?.lng.toFixed(6),
          startLat: this.startCoords?.lat.toFixed(6),
          goalId: String(this.selectedGoal?.id),
        },
      });
    },

    resetStart() {
      // 出発地をリセットするメソッド
      this.startCoords = null;
      this.startMarker?.remove();
      this.startMarker = null;
      this.isStartSet = false; // 出発地設定フラグをリセット
    },
  },
});
</script>
<style lang="css">
/* --- 既存のスタイルを活かした調整 --- */
.start-section {
  margin: 45px auto;
  margin-bottom: 60px; /* 下に少し余裕を持たせました */
  padding: 0 16px;
}

.start-top {
  font-size: 35px;
  font-weight: bold;
}

.start-intro {
  margin-top: 20px;
  margin-bottom: 30px;
  font-size: 20px;
}

/* --- 新規UI（ステップ選択・地図周り）用のスタイル --- */

/* ステップ表示のカード */
.selection-card {
  border-width: 2px !important; /* 既存のborder-mdに合わせた太さ */
  transition: all 0.3s ease;
}

.step-title {
  font-size: 18px; /* start-introに近いサイズ感 */
  font-weight: bold;
}

/* 地図のラッパー */
.map-wrapper {
  position: relative;
  width: 100%;
  margin-top: 10px;
}

/* 既存のmap-containerを少し拡張 */
.map-container {
  width: 100%;
  height: 450px; /* 操作性を考え少し高く設定 */
  border-radius: 12px; /* 少し角丸を強調 */
  border: 2px solid #ddd;
}

/* ズーム警告オーバーレイ */
.zoom-hint-overlay {
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.zoom-hint-chip {
  background-color: rgba(0, 0, 0, 0.7) !important;
  color: white !important;
  font-weight: bold;
  backdrop-filter: blur(4px);
}

/* 送信ボタン（既存の.submit-buttonを拡張） */
.submit-button {
  --v-btn-height: 50px;
  height: 50px !important; /* より押しやすく大きく */
  font-size: 20px !important;
  border-width: 2px !important;
  margin-top: 20px;
}
</style>
