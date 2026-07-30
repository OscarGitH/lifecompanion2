<script setup lang="ts">
import LcSnackbarQueue from "./components/shared/vuetify/LcSnackbarQueue.vue";
import ConfigEditorView from "./screens/editor/ConfigEditorView.vue";
import CreateOrLoadConfigView from "./screens/editor/CreateOrLoadConfigView.vue";
import { usePlayerStore } from "./stores/player/usePlayerStore";

const playerStore = usePlayerStore();
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
