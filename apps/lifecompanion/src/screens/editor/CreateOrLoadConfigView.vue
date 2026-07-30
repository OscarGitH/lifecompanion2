<script lang="ts" setup>
import {
	lcConfigSchema,
	makeUnsafehemaRecord,
	testCommuniquer,
} from "@lifecompanion/model";
import {
	mdiDatabaseRemove,
	mdiFilePlusOutline,
	mdiFolderOpenOutline,
} from "@mdi/js";
import type { SnackbarQueueMessage } from "vuetify";
import db from "../../db/db.js";
import { useEditorI18n } from "../../i18n/editor.js";
import { useEditorStore } from "../../stores/editor/useEditorStore.js";
import { usePlayerStore } from "../../stores/player/usePlayerStore.js";
import { useSnackbarStore } from "../../stores/shared/useSnackbarStore.js";

const { t } = useEditorI18n();
const playerStore = usePlayerStore();
const editorStore = useEditorStore();
const snackbarStore = useSnackbarStore();

const loadConfig = async () => {
	const handler = async () => {
		const getConfig = db.get(lcConfigSchema, testCommuniquer.id, [
			"pageGroups.layout.contents",
			"pageGroups.layout.grid.cells.lockedContent",
			"pageGroups.layout.slot",
			"pageGroups.layout.extends.contents",
			"pageGroups.layout.extends.grid.cells.lockedContent",
			"pageGroups.layout.extends.slot",
			"pageGroups.grid.cells.lockedContent",
			"pageGroups.pages.contents",
		]);

		const baseMessage = { color: "info", loading: true };
		const checkDBMessage: SnackbarQueueMessage = {
			text: "Checking database",
			promise: getConfig,
			...baseMessage,
		};

		snackbarStore.queue.push(checkDBMessage);

		const config = await getConfig;

		if (config) {
			playerStore.init(config);
			editorStore.toggleEdition(true);
		} else {
			const makeSchemaRecord = makeUnsafehemaRecord(
				lcConfigSchema,
				testCommuniquer,
			);

			snackbarStore.queue.push({
				text: "Making unsafe schema from demo file",
				promise: makeSchemaRecord,
				...baseMessage,
			});

			const saveConfig = db.put(await makeSchemaRecord);

			snackbarStore.queue.push({
				text: "Saving demo app to database",
				promise: saveConfig,
				...baseMessage,
			});

			await saveConfig;

			await handler();
		}
	};

	snackbarStore.queue.push({
		text: "Loading demo app",
		loading: true,
		promise: handler(),
		success: () => ({ text: "Demo app loaded" }),
	});
};

const dropDB = async () => {
	const dropDB = db.deleteDB();

	snackbarStore.queue.push({
		text: "Dropping database",
		color: "danger",
		loading: true,
		promise: dropDB,
		success: () => ({ text: "Database deleted", color: "error" }),
	});

	await dropDB;
	playerStore.reset();
};
</script>

<template>
	<v-container :max-width="1080" class="d-flex align-center h-100">
		<div class="d-flex flex-wrap align-stretch ga-8 w-100 text-center">
			<v-card
				class="flex-1-1-0 pa-8"
				min-width="200"
				@click="editorStore.createNewConfig()"
			>
				<v-icon
					:icon="mdiFilePlusOutline"
					size="64"
					color="primary"
					class="mb-4"
				/>
				<div class="text-h6 font-weight-bold text-primary">
					{{ t('editor.grid.actions.createNew.label') }}
				</div>
				<div class="text-caption text-grey mt-2">
					{{ t('editor.grid.actions.createNew.description') }}
				</div>
			</v-card>

			<v-card class="flex-1-1-0 pa-8" min-width="200" @click="loadConfig">
				<v-icon
					:icon="mdiFolderOpenOutline"
					size="64"
					color="secondary"
					class="mb-4"
				/>
				<div class="text-h6 font-weight-bold text-secondary">
					{{ t('editor.grid.actions.load.label') }}
				</div>
				<div class="text-caption text-grey mt-2">
					{{ t('editor.grid.actions.load.description') }}
				</div>
			</v-card>

			<v-card class="flex-1-1-0 pa-8" min-width="200" @click="dropDB">
				<v-icon
					:icon="mdiDatabaseRemove"
					size="64"
					color="error"
					class="mb-4"
				/>
				<div class="text-h6 font-weight-bold text-error">
					{{ t('editor.grid.actions.dropDB.label') }}
				</div>
				<div class="text-caption text-grey mt-2">
					{{ t('editor.grid.actions.dropDB.description') }}
				</div>
			</v-card>
		</div>
	</v-container>
</template>
