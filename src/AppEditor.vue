<script setup lang="ts">
import { testCommuniquer } from "@lifecompanion/model";
import {
  mdiCheck,
  mdiFilePlus,
  mdiFilePlusOutline,
  mdiFolderOpenOutline,
  mdiPencil,
  mdiPencilPlus,
  mdiPlus,
} from "@mdi/js";
import { cloneDeep } from "es-toolkit";
import { computed, ref, watch } from "vue";
// biome-ignore lint/style/useImportType: also used in template
import AddNewPageDialog from "./components/editor/AddNewPageDialog.vue";
import BottomBar from "./components/editor/bottomBar/BottomBar.vue";
import EditableCell from "./components/editor/grid/EditableCell.vue";
import LockedGridLayer from "./components/editor/grid/LockedGridLayer.vue";
import Grid from "./components/player/grid/Grid.vue";
import GridCell from "./components/player/grid/GridCell.vue";
import SnackbarQueue from "./components/shared/SnackbarQueue.vue";
import type { LcSpeedDialItems } from "./components/shared/SpeedDial.vue";
import SpeedDial from "./components/shared/SpeedDial.vue";
import { useEditorI18n } from "./i18n/editor";
import { useBottomBarStore } from "./stores/editor/useBottomBarStore";
import { useEditorStore } from "./stores/editor/useEditorStore";
import { usePlayerStore } from "./stores/player/usePlayerStore";
import { useInteractionStore } from "./stores/editor/useInteractionStore";
import VirtualMouse from "./components/player/interaction/VirtualMouse.vue";
import { SelectionMode } from '@lifecompanion/model/src/types/selectionMode';
import { useMouseInput } from './composables/player/useMouseInput';
import { useKeyboardInput } from './composables/player/useKeyboardInput';

const { t } = useEditorI18n();
const playerStore = usePlayerStore();
const editorStore = useEditorStore();
const bottomBarStore = useBottomBarStore();
const selectionMode = useInteractionStore();
const mouseInput = useMouseInput();
const keyboardInput = useKeyboardInput();

const speedDialRef = ref<string>();
const addNewPageDialog = ref<InstanceType<typeof AddNewPageDialog> | null>(
	null,
);
const playViewRef = ref<HTMLElement | null>(null);

const gridLayers = computed(() =>
	editorStore.enabled ? [LockedGridLayer] : [],
);

const addDialItems: LcSpeedDialItems = [
	{
		icon: mdiPlus,
		title: t("shared.actions.add"),
	},
	{
		icon: mdiPencilPlus,
		title: t("editor.grid.actions.case.add.description"),
		action: () => editorStore.createContent(),
	},
	{
		icon: mdiFilePlus,
		title: t("editor.grid.actions.case.addNewPage.description"),
		action: () => addNewPageDialog.value?.openOrCreatePage(),
	},
];

watch(
    [() => playerStore.config, () => editorStore.enabled, () => playViewRef.value],
    ([config, enabled, viewRef]) => {
      if (!viewRef) return;

      if (!enabled && config) {
        mouseInput.start(viewRef);
        keyboardInput.start();
      } else {
        mouseInput.stop();
        keyboardInput.stop();
      }
    },
    { immediate: true }
);
</script>

<template>
	<v-app>
		<v-app-bar>
			<v-app-bar-title>{{ t('editor.app.title') }}</v-app-bar-title>
			<v-spacer />
			<div class="d-flex flex-wrap mx-4 gap-2">
				<div class="d-flex gap-2" v-if="!editorStore.enabled && playerStore.config" >
					<v-btn
						v-for="mode in SelectionMode"
						:key="mode"
						:color="selectionMode.currentSelectionMode === mode ? 'primary' : 'default'"
						variant="flat"
						size="small"
						rounded
						@click="() => selectionMode.setSelectionMode(mode)"
					>
            {{ mode.valueOf() }}
          </v-btn>
				</div>
        <v-spacer />
				<v-btn
					v-if="playerStore.activeContext"
					:text="t(`editor.grid.actions.${!editorStore.enabled ? 'edit': 'endEdit'}.label`)"
					:prepend-icon="!editorStore.enabled ? mdiPencil : mdiCheck"
					color="secondary"
					variant="flat"
					size="small"
					rounded
					v-tooltip:top="t(`editor.grid.actions.${!editorStore.enabled ? 'edit' : 'endEdit'}.description`)"
					@click="() => editorStore.toggleEdition()"
				/>
			</div>
		</v-app-bar>
		<v-main>
			<v-container
				v-if="!playerStore.config"
				:max-width="1080"
				class="d-flex align-center h-100"
			>
				<div class="d-flex align-strech ga-8 w-100 text-center">
					<v-card
						class="flex-1-1-0 pa-8"
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

					<v-card
						class="flex-1-1-0 pa-8"
						@click="editorStore.loadConfig(cloneDeep(testCommuniquer))"
					>
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
				</div>
			</v-container>

			<v-container
				v-else
				fluid
				class="position-relative pa-0"
				:style="{ height: editorStore.enabled 
              ? `calc(100% - ${bottomBarStore.height}px)` 
              : '100%'
          }"
			>
        <VirtualMouse v-if="playerStore.config && (selectionMode.currentSelectionMode === SelectionMode.VIRTUAL_MOUSE || selectionMode.currentSelectionMode === SelectionMode.COMBO)" />
				<div class="overflow-auto pa-4 w-100 h-100">
					<div
						ref="playViewRef"
						:style="{
                margin: 'auto',
                width: '1080px',
                height: '720px'
              }"
					>
						<grid
							v-if="playerStore.activeContext"
							:layout-stack="playerStore.activeContext.layoutStack"
							:cell-component-resolver="() => editorStore.enabled ? EditableCell : GridCell"
							:grid-layer-components="gridLayers"
						/>
					</div>
				</div>
				<snackbar-queue />
				<div
					v-if="editorStore.enabled"
					class="position-absolute"
					:style="{bottom: '16px', right: '16px'}"
				>
					<speed-dial
						ref="speedDialRef"
						:items="addDialItems"
						:style="{zIndex: 100 + gridLayers.length}"
						position="relative"
						color="secondary"
					/>
					<add-new-page-dialog ref="addNewPageDialog" :target="speedDialRef" />
				</div>
			</v-container>
		</v-main>
		<bottom-bar />
	</v-app>
</template>

<style scoped>
:deep(.v-main) {
	background-color: #f5f5f5;
}
</style>
