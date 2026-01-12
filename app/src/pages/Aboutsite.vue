<template>
    <v-container>
        <div class="about-section">
            <h2 class="mb-3">サイトに関して</h2>

            <div class="site-container d-flex"></div>

            <v-list class="rounded-lg pa-3 mb-2 border-md">
                <v-list-item>
                    <v-list-item-content>
                        1.
                        取得しているAPIの都合上正確でないデータがある可能性があります
                    </v-list-item-content>
                </v-list-item>
                <v-list-item>
                    <v-list-item-content>
                        2.
                        このページが利用する公共交通データは、公共交通オープンデータセンターにおいて提供されるものです
                    </v-list-item-content>
                </v-list-item>
                <v-list-item>
                    <v-list-item-content>
                        3.
                        このページの表示内容について、公共交通事業者への直接の問合せは行わないでください。
                    </v-list-item-content>
                </v-list-item>
                <v-list-item>
                    <v-list-item-content>
                        4.
                        サイトに関するお問い合わせは右側のメニューバーのリンクからお願いいたします。
                    </v-list-item-content>
                </v-list-item>
            </v-list>
            <v-row
                class="px-4 gap-4 mb-12 mt-5"
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
                        to="/"
                    >
                        <v-icon
                            icon="mdi-home-outline"
                            class="mr-2"
                            size="large"
                        ></v-icon>
                        ホームに戻る
                    </v-btn></v-col
                >
            </v-row>
        </div>
    </v-container>
</template>

<style scoped>
.about-section {
    max-width: 1000px;
    margin: 60px auto;
    margin-bottom: 30px;
    padding: 0 16px;
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
</style>
