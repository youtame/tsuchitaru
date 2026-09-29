<template>
    <div class="container">
        <div v-if="isLoading" class="message">検索中...</div>

        <div class="message-section" v-else-if="results.length > 0">
            <h1>おすすめの乗車バス停</h1>
            <v-card
                class="mt-4 mb-4 pa-4 border-md rounded-lg main-card"
                color="surface"
                elevation="0"
            >
                <p>
                    {{ results.length }}
                    件見つかりました。青い丸のバス停を選択してください。
                </p>
            </v-card>
            <div
                id="map"
                ref="mapContainer"
                style="width: 100%; height: 500px; border-radius: 8px"
            ></div>
            <div
                v-if="selectedStop"
                class="action-area border-md"
                color="surface"
            >
                <div class="stop-detail">
                    <h3>{{ selectedStop.properties.title }}</h3>
                    <div v-if="routeInfo" class="route-stats"></div>
                </div>
                <button class="primary-btn" @click="getRoute">
                    このバス停までのルートを表示
                </button>
            </div>
        </div>
        <div v-else class="message-section">
            <div class="message">条件に合うバス停が見つかりませんでした</div>
            <v-card
                class="px-4 border-md rounded-lg main-card"
                color="surface"
                elevation="0"
            >
                <p class="start-intro">
                    申し訳ございません。条件に合うバス停が見つかりませんでした。
                    前のページに戻っていただくと、条件を変更して再度検索することができます。
                </p>
                <v-btn
                    variant="flat"
                    size="x-large"
                    rounded="lg"
                    class="start-button d-flex align-center font-weight-bold border-md"
                    elevation="0"
                    rel="noopener"
                    to="/start"
                >
                    <v-icon
                        icon="mdi-arrow-left"
                        class="mr-2"
                        size="large"
                        rounded="pill"
                        to="/start"
                    ></v-icon>
                    もう一度試す
                </v-btn>
            </v-card>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken =
    "";
const API_KEY =
    "";

const route = useRoute();
const results = ref([]);
const goalStop = ref(null);
const isLoading = ref(true);
const mapContainer = ref(null);
const selectedStop = ref(null);
const calculatedMets = ref(0);
const targetRadius = ref(0);
const routeInfo = ref(null);
let map = null;

const getRoute = async () => {
    if (!selectedStop.value) return;

    const start = [route.query.startLng, route.query.startLat].join(",");
    const end = selectedStop.value.geometry.coordinates.join(",");

    try {
        const query = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/walking/${start};${end}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
        );
        const json = await query.json();
        const data = json.routes[0].geometry;

        routeInfo.value = {
            distance: Math.round(data.distance),
            duration: Math.ceil(data.duration / 60),
        };

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

    await nextTick();

    if (!mapContainer.value) {
        console.warn("Map container not found, retrying...");
        setTimeout(initMap, 100);
        return;
    }

    if (map) {
        map.remove();
    }

    map = new mapboxgl.Map({
        container: mapContainer.value,
        style: "mapbox://styles/youtame/cm0xhgnwh01w401pwdv2136yl",
        center: [
            parseFloat(route.query.startLng),
            parseFloat(route.query.startLat),
        ],
        zoom: 12,
    });

    const currentlocation = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserHeading: true,
    });

    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(currentlocation);

    map.on("load", () => {
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

        // currentlocation.trigger(); //

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
                    "circle-color": "#28a745",
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
                    "#fbb03b",
                    "#007cbf",
                ],
                "circle-stroke-width": 2,
                "circle-stroke-color": "#ffffff",
            },
        });

        map.on("click", "points-layer", (e) => {
            if (e.features.length > 0) {
                if (selectedStop.value) {
                    map.setFeatureState(
                        { source: "bus-stops", id: selectedStop.value.id },
                        { selected: false },
                    );
                }

                const feature = e.features[0];
                feature.id = e.features[0].id || 0;
                selectedStop.value = feature;

                map.setFeatureState(
                    { source: "bus-stops", id: feature.id },
                    { selected: true },
                );

                new mapboxgl.Popup()
                    .setLngLat(feature.geometry.coordinates)
                    .setHTML(`<strong>${feature.properties.title}</strong>`)
                    .addTo(map);
            }
        });

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
    const durationHr =
        parseFloat(calories) / (1.05 * mets * parseFloat(weight));
    const radiusA = Math.round(speedKmh * durationHr * 1000);
    const radiusB = Math.round(radiusA * 0.8);

    try {
        const [outerRes, innerRes, goalRes] = await Promise.all([
            fetch(
                `https://api.odpt.org/api/v4/places/odpt:BusstopPole?lon=${startLng}&lat=${startLat}&radius=${radiusA}&acl:consumerKey=${API_KEY}`,
            ),
            fetch(
                `https://api.odpt.org/api/v4/places/odpt:BusstopPole?lon=${startLng}&lat=${startLat}&radius=${radiusB}&acl:consumerKey=${API_KEY}`,
            ),
            fetch(
                `https://api.odpt.org/api/v4/odpt:BusstopPole?owl:sameAs=${goalId}&acl:consumerKey=${API_KEY}`,
            ),
        ]);

        const outerData = await outerRes.json();
        const innerData = await innerRes.json();
        const goalData = await goalRes.json();

        if (goalData && goalData.length > 0) goalStop.value = goalData[0];

        const innerIds = new Set(innerData.map((s) => s["owl:sameAs"]));
        const goalPatterns = new Set(
            goalStop.value?.["odpt:busroutePattern"] || [],
        );

        results.value = outerData.filter(
            (stop) =>
                !innerIds.has(stop["owl:sameAs"]) &&
                (stop["odpt:busroutePattern"] || []).some((p) =>
                    goalPatterns.has(p),
                ),
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
    font-size: 20px;
    color: #666;
    text-align: center;
    margin: 20px auto 30px;
}
.action-area {
    margin-top: 20px;
    padding: 15px;
    border-radius: 8px;
    text-align: center;
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

.mapboxgl-popup-content {
    width: 150px;
}

.message-section {
    margin: 30px auto 30px;
    padding: 0 16px;
}
</style>
