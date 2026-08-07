<script setup lang="ts">
import { getVersion } from "@tauri-apps/api/app";
import { isTauri } from "@tauri-apps/api/core";
import { onMounted, ref } from "vue";
import LcSnackbarQueue from "./components/shared/vuetify/LcSnackbarQueue.vue";
import { useUpdater } from "./composables/shared/useUpdater";
import ConfigEditorView from "./screens/editor/ConfigEditorView.vue";
import CreateOrLoadConfigView from "./screens/editor/CreateOrLoadConfigView.vue";
import { usePlayerStore } from "./stores/player/usePlayerStore";

const playerStore = usePlayerStore();

const appVersion = ref("");

const { checkForUpdates } = useUpdater();

onMounted(async () => {
	if (!isTauri()) {
		return;
	}

	appVersion.value = await getVersion();

	await checkForUpdates();
});
</script>

<template>
	<v-app>
		<create-or-load-config-view v-if="!playerStore.activeContext" />
		<config-editor-view v-else />
		<lc-snackbar-queue />
	</v-app>
	<div v-if="appVersion" class="app-version-label">v{{ appVersion }}</div>
</template>

<style>
.app-version-label {
	position: fixed;
	bottom: 8px;
	left: 12px;
	font-size: 11px;
	color: rgba(0, 0, 0, 0.4);
}
</style>
