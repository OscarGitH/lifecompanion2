<script setup lang="ts">
import { getVersion } from "@tauri-apps/api/app";
import { relaunch } from "@tauri-apps/plugin-process";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { onMounted, ref } from "vue";
import LcSnackbarQueue from "./components/shared/vuetify/LcSnackbarQueue.vue";
import ConfigEditorView from "./screens/editor/ConfigEditorView.vue";
import CreateOrLoadConfigView from "./screens/editor/CreateOrLoadConfigView.vue";
import { usePlayerStore } from "./stores/player/usePlayerStore";

const playerStore = usePlayerStore();

const appVersion = ref<string>("");

const updateAvailable = ref<Update | null>(null);
const updateProgress = ref<number | null>(null);
const updateReady = ref(false);

onMounted(async () => {
	try {
		appVersion.value = await getVersion();

		const update = await check();
		if (update?.available) {
			updateAvailable.value = update;
			await downloadUpdate(update);
		}
	} catch (error) {
		console.error("update check error:", error);
	}
});

const downloadUpdate = async (update: Update) => {
	let downloaded = 0;
	let contentLength = 0;

	await update.downloadAndInstall((event) => {
		switch (event.event) {
			case "Started":
				contentLength = event.data.contentLength ?? 0;
				updateProgress.value = 0;
				break;
			case "Progress":
				downloaded += event.data.chunkLength;
				updateProgress.value = contentLength
					? Math.round((downloaded / contentLength) * 100)
					: null;
				break;
			case "Finished":
				updateProgress.value = 100;
				updateReady.value = true;
				break;
		}
	});
};
</script>

<template>
	<v-app>
		<create-or-load-config-view v-if="!playerStore.activeContext" />
		<config-editor-view v-else />
		<lc-snackbar-queue />
	</v-app>
	<div class="app-version-label">v{{ appVersion }}</div>
	<v-snackbar
		:model-value="!!updateAvailable && !updateReady"
		:timeout="-1"
		location="bottom right"
	>
		Téléchargement de la mise à jour {{ updateAvailable?.version }}...
		<v-progress-linear
			:model-value="updateProgress ?? 0"
			height="6"
			color="primary"
			class="mt-2"
		/>
		<span class="text-caption">{{ updateProgress ?? 0 }}%</span>
	</v-snackbar>

	<v-snackbar
		:model-value="updateReady"
		:timeout="-1"
		location="bottom right"
		color="success"
	>
		Mise à jour {{ updateAvailable?.version }} prête. Redémarrez l'app pour
		l'appliquer.
		<template #actions>
			<v-btn variant="text" @click="relaunch()">Relancer maintenant</v-btn>
		</template>
	</v-snackbar>
</template>

<style>
.app-version-label {
	position: fixed;
	bottom: 8px;
	left: 12px;
	font-size: 11px;
	color: rgba(0, 0, 0, 0.4);
	pointer-events: none;
	z-index: 1;
}
</style>
