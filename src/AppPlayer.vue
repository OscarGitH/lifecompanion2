<script setup lang="ts">
import { testCommuniquer } from "@lifecompanion/model";
import LcGrid from "./components/grid/LcGrid.vue";
import LcLocalesBtnToggle from "./components/ui/LcLocalesBtnToggle.vue";
import { usePlayerI18n } from "./i18n/player";
import { usePlayerStore } from "./stores/player/usePlayerStore";

const { t } = usePlayerI18n();
const playerStore = usePlayerStore();

playerStore.init(testCommuniquer);
</script>

<template>
	<v-app>
		<v-app-bar>
			<v-app-bar-title>{{ t('player.app.title') }}</v-app-bar-title>

			<v-spacer />

			<div class="me-4"><lc-locales-btn-toggle /></div>
		</v-app-bar>

		<v-main>
			<v-container fluid height="100%">
				<lc-grid
					v-if="playerStore.activeContext"
					:layout-stack="playerStore.activeContext.layoutStack"
				/>

				<v-alert v-else type="warning" class="mt-4">
					{{ $t('shared.config.pagesGroups.empty') }}
				</v-alert>
			</v-container>
		</v-main>
	</v-app>
</template>

<style scoped>
.v-main {
	background-color: #f5f5f5;
}
</style>
