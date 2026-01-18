<template>
  <div class="container">
    <div v-if="isLoading" class="message">検索中...</div>

    <div v-else-if="results.length > 0">
      <h1>おすすめの乗車バス停</h1>
      <p>
        {{
          results.length
        }}
        件見つかりました。青い丸のバス停を選択してください。
      </p>

      <div
        id="map"
        ref="mapContainer"
        style="width: 100%; height: 500px; border-radius: 8px"
      ></div>

      <div v-if="selectedStop" class="action-area">
        <div class="stop-detail">
          <h3>{{ selectedStop.properties.title }}</h3>
          <div v-if="routeInfo" class="route-stats"></div>
        </div>
        <button class="primary-btn" @click="getRoute">
          このバス停までのルートを表示
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
  "pk.eyJ1IjoieW91dGFtZSIsImEiOiJjbTB1ejViM3AxaW96MmxxMHozajQwamU0In0.DQaG0fvJzitS_xxXUL5B0g";
const API_KEY =
  "b70f7d9c215874f66461094458ea3f080fec87af36b3c31981aa35d3cb59afa4";

const route = useRoute();
const results = ref([]);
const goalStop = ref(null);
const isLoading = ref(true);
const mapContainer = ref(null);
const selectedStop = ref(null); // 現在選択されているバス停の情報
const calculatedMets = ref(0);
const targetRadius = ref(0);
const routeInfo = ref(null); // ルートの距離・時間保持用
let map = null;

/**
 * Directions APIを使用してルートを取得し、地図に表示する
 */
const getRoute = async () => {
  if (!selectedStop.value) return;

  const start = [route.query.startLng, route.query.startLat].join(",");
  const end = selectedStop.value.geometry.coordinates.join(",");

  try {
    // walking (徒歩) モードでルートを取得
    const query = await fetch(
      `https://api.mapbox.com/directions/v5/mapbox/walking/${start};${end}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
    );
    const json = await query.json();
    const data = json.routes[0].geometry;

    routeInfo.value = {
      distance: Math.round(data.distance),
      duration: Math.ceil(data.duration / 60),
    };

    // すでにルートが表示されている場合はデータを更新、なければ新規作成
    if (map.getSource("route")) {
      map.getSource("route").setData(data);
    } else {
      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: data,
        },
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#008080",
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });
    }

    // ルート全体が見えるように調整
    const bounds = new mapboxgl.LngLatBounds();
    data.coordinates.forEach((coord) => bounds.extend(coord));
    map.fitBounds(bounds, { padding: 100 });
  } catch (error) {
    console.error("Fetch route error:", error);
    alert("ルートの取得に失敗しました。");
  }
};

const initMap = async () => {
  if (results.value.length === 0) return;

  // 1. VueのDOM更新を待つ
  await nextTick();

  // 2. それでも要素がない場合は、少し待機して再試行（念のため）
  if (!mapContainer.value) {
    console.warn("Map container not found, retrying...");
    setTimeout(initMap, 100);
    return;
  }

  // 3. すでに地図が存在している場合は、二重に作成しないようにする
  if (map) {
    map.remove();
  }

  map = new mapboxgl.Map({
    container: mapContainer.value, // refを直接渡す
    style: "mapbox://styles/youtame/cm0xhgnwh01w401pwdv2136yl",
    center: [
      parseFloat(route.query.startLng),
      parseFloat(route.query.startLat),
    ],
    zoom: 12,
  });

  map.on("load", () => {
    // 1. 出発地 (赤)
    map.addSource("start-point", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [
            parseFloat(route.query.startLng),
            parseFloat(route.query.startLat),
          ],
        },
      },
    });

    map.addLayer({
      id: "start-layer",
      type: "circle",
      source: "start-point",
      paint: {
        "circle-radius": 10,
        "circle-color": "#ff4b00",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });
    if (goalStop.value) {
      map.addSource("goal-point", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [
              goalStop.value["geo:long"],
              goalStop.value["geo:lat"],
            ],
          },
          properties: { title: goalStop.value["dc:title"] },
        },
      });

      map.addLayer({
        id: "goal-layer",
        type: "circle",
        source: "goal-point",
        paint: {
          "circle-radius": 12,
          "circle-color": "#28a745", // 濃い緑
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        },
      });

      map.on("click", "goal-layer", (e) => {
        const coords = e.features[0].geometry.coordinates.slice();
        const props = e.features[0].properties;
        new mapboxgl.Popup()
          .setLngLat(coords)
          .setHTML(`<strong>目的地: ${props.title}</strong>`)
          .addTo(map);
      });
    }
    // 2. おすすめバス停 (青)
    const busStopFeatures = results.value.map((stop) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [stop["geo:long"], stop["geo:lat"]],
      },
      properties: { title: stop["dc:title"] || "名称不明" },
    }));

    map.addSource("bus-stops", {
      type: "geojson",
      data: { type: "FeatureCollection", features: busStopFeatures },
    });

    map.addLayer({
      id: "points-layer",
      type: "circle",
      source: "bus-stops",
      paint: {
        "circle-radius": 10,
        "circle-color": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          "#fbb03b", // 選択時はオレンジ
          "#007cbf", // 通常は青
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    });

    // バス停クリック時の挙動
    map.on("click", "points-layer", (e) => {
      if (e.features.length > 0) {
        // 以前の選択状態を解除
        if (selectedStop.value) {
          map.setFeatureState(
            { source: "bus-stops", id: selectedStop.value.id },
            { selected: false }
          );
        }

        // 選択されたバス停を保存（IDがない場合はindexを使用）
        const feature = e.features[0];
        feature.id = e.features[0].id || 0; // 必要に応じてID管理を
        selectedStop.value = feature;

        // 地図上の色を変えるための状態更新
        map.setFeatureState(
          { source: "bus-stops", id: feature.id },
          { selected: true }
        );

        new mapboxgl.Popup()
          .setLngLat(feature.geometry.coordinates)
          .setHTML(`<strong>${feature.properties.title}</strong>`)
          .addTo(map);
      }
    });

    // 範囲調整
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([
      parseFloat(route.query.startLng),
      parseFloat(route.query.startLat),
    ]);
    busStopFeatures.forEach((f) => bounds.extend(f.geometry.coordinates));
    map.fitBounds(bounds, { padding: 70 });
  });
};

const fetchData = async () => {
  isLoading.value = true;
  const { weight, speed, calories, startLng, startLat, goalId } = route.query;
  const speedKmh = parseFloat(speed) || 4.0;
  const mets = speedKmh <= 4.0 ? 3.0 : speedKmh <= 5.5 ? 3.5 : 4.5;
  const durationHr = parseFloat(calories) / (1.05 * mets * parseFloat(weight));
  const radiusA = Math.round(speedKmh * durationHr * 1000);
  const radiusB = Math.round(radiusA * 0.8);

  try {
    const [outerRes, innerRes, goalRes] = await Promise.all([
      fetch(
        `https://api.odpt.org/api/v4/places/odpt:BusstopPole?lon=${startLng}&lat=${startLat}&radius=${radiusA}&acl:consumerKey=${API_KEY}`
      ),
      fetch(
        `https://api.odpt.org/api/v4/places/odpt:BusstopPole?lon=${startLng}&lat=${startLat}&radius=${radiusB}&acl:consumerKey=${API_KEY}`
      ),
      fetch(
        `https://api.odpt.org/api/v4/odpt:BusstopPole?owl:sameAs=${goalId}&acl:consumerKey=${API_KEY}`
      ),
    ]);

    const outerData = await outerRes.json();
    const innerData = await innerRes.json();
    const goalData = await goalRes.json();

    if (goalData && goalData.length > 0) goalStop.value = goalData[0];

    const innerIds = new Set(innerData.map((s) => s["owl:sameAs"]));
    const goalPatterns = new Set(
      goalStop.value?.["odpt:busroutePattern"] || []
    );

    results.value = outerData.filter(
      (stop) =>
        !innerIds.has(stop["owl:sameAs"]) &&
        (stop["odpt:busroutePattern"] || []).some((p) => goalPatterns.has(p))
    );

    if (results.value.length > 0) initMap();
  } catch (e) {
    console.error(e);
    results.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: sans-serif;
  max-width: 1200px;
  margin: 0 auto;
}
.message {
  font-size: 1.2rem;
  color: #666;
  text-align: center;
  margin-top: 50px;
}
.action-area {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.primary-btn {
  background: #008080;
  color: white;
  font-weight: bold;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background 0.3s;
}
.primary-btn:hover {
  background: #008080;
}
button {
  margin-top: 15px;
  padding: 10px 20px;
  background: #333;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
