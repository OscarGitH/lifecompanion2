<script setup lang="ts">
import {
	mdiArrowLeft,
	mdiArrowRight,
	mdiCheck,
	mdiCloseCircle,
	mdiPencil,
} from "@mdi/js";
import { onBeforeUnmount, useTemplateRef, watch } from "vue";
import { useEditorI18n } from "../../../i18n/editor";
import {
	TABS,
	useBottomBarStore,
} from "../../../stores/editor/useBottomBarStore";
import { useEditorStore } from "../../../stores/editor/useEditorStore";
import BottomBarContent from "./BottomBarContent.vue";
import BottomBarPage from "./BottomBarPage.vue";

const { t } = useEditorI18n();
const editorStore = useEditorStore();
const bottomBarStore = useBottomBarStore();

function onCancelEditClick() {
	editorStore.backup();
	editorStore.toggleEdition(false);
}

const toolbarCardRef = useTemplateRef("toolbarCardRef");
let toolbarResiseObserver: ResizeObserver | null = null;

watch(toolbarCardRef, (newRef) => {
	if (newRef) {
		const el = newRef.$el as HTMLElement | undefined;

		if (el) {
			toolbarResiseObserver = new ResizeObserver((entries) => {
				for (const entry of entries) {
					bottomBarStore.height = entry.contentRect.height;
				}
			});

			toolbarResiseObserver.observe(el);
			return;
		}
	}

	bottomBarStore.height = 0;
	toolbarResiseObserver?.disconnect();
});

onBeforeUnmount(() => {
	bottomBarStore.height = 0;
	toolbarResiseObserver?.disconnect();
});
</script>

<template>
	<v-expand-transition>
		<v-card
			v-if="editorStore.enabled"
			ref="toolbarCardRef"
			class="w-100"
			position="fixed"
			location="bottom"
		>
			<v-tabs-window v-model="bottomBarStore.tab" class="pa-2">
				<bottom-bar-page value="page" />
				<bottom-bar-content value="content" />
			</v-tabs-window>
			<v-divider />
			<v-card-actions>
				<v-tabs v-model="bottomBarStore.tab" color="secondary" center-active>
					<v-tab v-for="item in TABS" :key="`tab-${item}`" :value="item">
						{{ t(`editor.editionToolbar.tabs.${item}.label`) }}
					</v-tab>
				</v-tabs>
				<v-spacer />
				<v-btn
					:disabled="!editorStore.canUndo"
					:title="t('editor.grid.actions.undo.label')"
					:icon="mdiArrowLeft"
					variant="text"
					v-tooltip:top="t('editor.grid.actions.undo.description')"
					@click="editorStore.undo"
				/>
				<v-btn
					:disabled="!editorStore.canRedo"
					:title="t('editor.grid.actions.redo.label')"
					:icon="mdiArrowRight"
					variant="text"
					v-tooltip:top="t('editor.grid.actions.redo.description')"
					@click="editorStore.redo"
				/>
				<v-divider class="mx-3" vertical inset />
				<v-btn
					:title="t('editor.grid.actions.cancelEdit.label')"
					:icon="mdiCloseCircle"
					variant="text"
					v-tooltip:top="t('editor.grid.actions.cancelEdit.description')"
					@click="onCancelEditClick"
				/>
				<v-btn
					:title="t(`editor.grid.actions.${!editorStore.enabled ? 'edit': 'endEdit'}.label`)"
					:icon="!editorStore.enabled ? mdiPencil : mdiCheck"
					variant="text"
					v-tooltip:top="t(`editor.grid.actions.${!editorStore.enabled ? 'edit' : 'endEdit'}.description`)"
					@click="() => editorStore.toggleEdition()"
				/>
			</v-card-actions>
		</v-card>
	</v-expand-transition>
</template>
