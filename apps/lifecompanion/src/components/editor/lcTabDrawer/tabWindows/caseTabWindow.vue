<script lang="ts" setup>
import type {
	LcCellContentSchema,
	LcPicto,
	SchemaRecord,
} from "@lifecompanion/model";
import { mdiFilePlusOutline, mdiPlus } from "@mdi/js";
import { debounce } from "es-toolkit";
import { computed, reactive, ref, watch } from "vue";
import { useActivePlayer } from "../../../../composables/player/useActivePlayer";
import { useEditorI18n } from "../../../../i18n/editor";
import { useEditorStore } from "../../../../stores/editor/useEditorStore";
import { useInFocusStore } from "../../../../stores/editor/useInFocusStore";
import ArasacAutocomplete from "../../../shared/form/ArasacAutocomplete.vue";
import type AddNewPageDialog from "../../AddNewPageDialog.vue";

const { t, locale } = useEditorI18n();
const editorStore = useEditorStore();
const inFocusStore = useInFocusStore();

const { createParentResolver } = useActivePlayer();
const { getCellContent, getCellIndex } = createParentResolver(
	() => inFocusStore.parent,
);

const addNewPageBtn = ref<string>();
const addNewPageDialog = ref<InstanceType<typeof AddNewPageDialog> | null>(
	null,
);

const focusedCellIndex = computed<number | undefined>(
	() => inFocusStore.firstCell && getCellIndex.value(inFocusStore.firstCell),
);

const focusedCellContent = computed<
	SchemaRecord<LcCellContentSchema> | undefined
>(() => inFocusStore.firstCell && getCellContent.value(inFocusStore.firstCell));

const cellContentFormData = reactive<{
	text?: string | undefined;
	picto?: LcPicto | undefined;
	color?: string | undefined;
}>({});

const saveCellContentData = (newData: typeof cellContentFormData) => {
	if (!focusedCellContent.value) return;

	const convertedData = {
		picto: newData.picto,
		text: { ...focusedCellContent.value?.text, [locale.value]: newData.text },
	};

	Object.assign(focusedCellContent.value, convertedData);

	editorStore.commit();
};

const debouncedSaveCellContentData = debounce(saveCellContentData, 500);

const onAddCaseHereClick = () => {
	editorStore.createContent(inFocusStore.parent, focusedCellIndex.value);
};

watch(
	focusedCellContent,
	(content) => {
		if (content) {
			const picto =
				content.picto ||
				(content?.imageBase64 && {
					id: "",
					image: `data:image/png;base64,${content.imageBase64}`,
				}) ||
				undefined;

			cellContentFormData.picto = picto;
			cellContentFormData.text = content.text?.[locale.value];
			cellContentFormData.color = content.bgColor;
		}
	},
	{ immediate: true },
);

watch(
	cellContentFormData,
	(newValue) => {
		const currentStoreText = focusedCellContent.value?.text?.[locale.value];
		const currentStorePicto = focusedCellContent.value?.picto;

		const hasChanged =
			newValue.text !== currentStoreText ||
			newValue.picto !== currentStorePicto;

		if (hasChanged) {
			debouncedSaveCellContentData(newValue);
		}
	},
	{ deep: true },
);
</script>

<template>
	<div class="text-label-medium pa-4">
		{{ t('editor.drawerTabWindow.caseTabWindow.title') }}
	</div>
	<VDivider />
	<div class="h-100 overflow-y-auto pb-14">
		<div class="d-flex flex-column ga-4 pa-4">
			<VForm>
				<arasac-autocomplete
					v-model="cellContentFormData.picto"
					:label="!cellContentFormData.picto ? t('editor.grid.forms.toolbar.cellContent.picto.description') : undefined"
					density="comfortable"
				/>
				<VTextarea
					v-model="cellContentFormData.text"
					:label="t('editor.grid.forms.toolbar.cellContent.text.description')"
					density="comfortable"
					clearable
				/>
			</VForm>
			<VBtn
				:text="t('editor.grid.actions.case.add.label')"
				:prepend-icon="mdiPlus"
				variant="tonal"
				color="primary"
				rounded
				v-tooltip:top="t('editor.grid.actions.case.add.description')"
				@click="onAddCaseHereClick"
			/>
			<VBtn
				ref="addNewPageBtn"
				:text="t('editor.grid.actions.case.addNewPage.label')"
				:prepend-icon="mdiFilePlusOutline"
				variant="tonal"
				color="primary"
				rounded
				v-tooltip:top="t('editor.grid.actions.case.addNewPage.description')"
				@click.stop="() => addNewPageDialog?.openOrCreatePage(focusedCellIndex)"
			/>
			<!-- <add-new-page-dialog ref="addNewPageDialog" :target="addNewPageBtn" /> -->
		</div>
	</div>
</template>
