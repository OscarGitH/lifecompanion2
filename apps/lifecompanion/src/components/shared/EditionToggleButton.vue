<script setup lang="ts">
import { mdiCheck, mdiPencil } from "@mdi/js";
import { useEditorI18n } from "../../i18n/editor";
import { useEditorStore } from "../../stores/editor/useEditorStore";

const { t } = useEditorI18n();
const editorStore = useEditorStore();

const action = () => {
	editorStore.toggleEdition();
};
</script>

<template>
	<VBtn
		:text="t(`editor.grid.actions.${!editorStore.enabled ? 'edit': 'endEdit'}.label`)"
		:prepend-icon="!editorStore.enabled ? mdiPencil : mdiCheck"
		color="secondary"
		variant="flat"
		size="small"
		rounded
		v-tooltip:top="t(`editor.grid.actions.${!editorStore.enabled ? 'edit' : 'endEdit'}.description`)"
		@click="action"
	/>
</template>
