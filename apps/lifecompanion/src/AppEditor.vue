<script setup lang="ts">
import { check } from "@tauri-apps/plugin-updater";
import LcSnackbarQueue from "./components/shared/vuetify/LcSnackbarQueue.vue";
import ConfigEditorView from "./screens/editor/ConfigEditorView.vue";
import CreateOrLoadConfigView from "./screens/editor/CreateOrLoadConfigView.vue";
import { usePlayerStore } from "./stores/player/usePlayerStore";

const playerStore = usePlayerStore();

const update = await check();

console.log(update);
</script>

<template>
	<v-app>
		<create-or-load-config-view v-if="!playerStore.activeContext" />
		<config-editor-view v-else />
		<lc-snackbar-queue />
	</v-app>
</template>

<style>
</style>
