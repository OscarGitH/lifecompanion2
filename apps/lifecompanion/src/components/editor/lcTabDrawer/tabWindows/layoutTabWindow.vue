<script lang="ts" setup>
import {
	mdiTableColumnPlusAfter,
	mdiTableColumnPlusBefore,
	mdiTableColumnRemove,
	mdiTableRowPlusAfter,
	mdiTableRowPlusBefore,
	mdiTableRowRemove,
} from "@mdi/js";
import { useEditorI18n } from "../../../../i18n/editor";
import { useEditorStore } from "../../../../stores/editor/useEditorStore";

const { t } = useEditorI18n();
const editorStore = useEditorStore();
</script>

<template>
	<div class="text-label-medium pa-4">
		{{ t('editor.drawerTabWindow.layoutTabWindow.title') }}
	</div>
	<VDivider />
	<div class="h-100 overflow-y-auto pb-14">
		<div class="d-flex flex-column">
			<p class="text-title-medium px-4">
				{{ t('editor.drawerTabWindow.layoutTabWindow.columns') }}
			</p>
			<VBtn
				:text="t('editor.grid.actions.col.remove.label')"
				:prepend-icon="mdiTableColumnRemove"
				class="my-1 mx-4"
				variant="tonal"
				color="error"
				rounded
				v-tooltip:top="t('editor.grid.actions.col.remove.description')"
				@click="() => editorStore.spliceGridAtFocus('col', 'remove')"
			/>
			<VBtn
				:text="t('editor.grid.actions.col.addBefore.label')"
				:prepend-icon="mdiTableColumnPlusBefore"
				class="my-1  mx-4"
				variant="tonal"
				color="primary"
				rounded
				v-tooltip:top="t('editor.grid.actions.col.addBefore.description')"
				@click="() => editorStore.spliceGridAtFocus('col', 'add', 'before')"
			/>
			<VBtn
				:text="t('editor.grid.actions.col.addAfter.label')"
				:prepend-icon="mdiTableColumnPlusAfter"
				class="my-1  mx-4"
				variant="tonal"
				color="primary"
				rounded
				v-tooltip:top="t('editor.grid.actions.col.addAfter.description')"
				@click="() => editorStore.spliceGridAtFocus('col', 'add', 'after')"
			/>
			<VDivider class="mt-6 mb-2" />
			<p class="text-title-medium px-4">
				{{ t('editor.drawerTabWindow.layoutTabWindow.rows') }}
			</p>
			<VBtn
				:text="t('editor.grid.actions.row.remove.label')"
				:prepend-icon="mdiTableRowRemove"
				class="my-1  mx-4"
				variant="tonal"
				color="error"
				rounded
				v-tooltip:top="t('editor.grid.actions.row.remove.description')"
				@click="() => editorStore.spliceGridAtFocus('row', 'remove')"
			/>
			<VBtn
				:text="t('editor.grid.actions.row.addBefore.label')"
				:prepend-icon="mdiTableRowPlusBefore"
				class="my-1  mx-4"
				variant="tonal"
				color="primary"
				rounded
				v-tooltip:top="t('editor.grid.actions.row.addBefore.description')"
				@click="() => editorStore.spliceGridAtFocus('row', 'add', 'before')"
			/>
			<VBtn
				:text="t('editor.grid.actions.row.addAfter.label')"
				:prepend-icon="mdiTableRowPlusAfter"
				class="my-1 mx-4"
				variant="tonal"
				color="primary"
				rounded
				v-tooltip:top="t('editor.grid.actions.row.addAfter.description')"
				@click="() => editorStore.spliceGridAtFocus('row', 'add', 'after')"
			/>
		</div>
	</div>
</template>
