<script setup lang="ts">
import type { LcCellContent, LcPicto } from "@lifecompanion/model";
import { mdiFilePlusOutline, mdiPlus, mdiTrashCan } from "@mdi/js";
import { debounce } from "es-toolkit";
import { computed, reactive, ref, watch } from "vue";
import useInFocusBreadcrumb from "../../../composables/editor/useInFocusBreadcrumb";
import { useActivePlayer } from "../../../composables/player/useActivePlayer";
import { useEditorI18n } from "../../../i18n/editor";
import { useEditorStore } from "../../../stores/editor/useEditorStore";
import { useInFocusStore } from "../../../stores/editor/useInFocusStore";
import ArasacAutocomplete from "../../shared/form/ArasacAutocomplete.vue";
// biome-ignore lint/style/useImportType: also used in template
import AddNewPageDialog from "../AddNewPageDialog.vue";

const { t, locale } = useEditorI18n();
const editorStore = useEditorStore();
const inFocusStore = useInFocusStore();

const { items: breadcrumbItems } = useInFocusBreadcrumb();
const { createParentResolver } = useActivePlayer();
const { getCellContent, getCellIndex } = createParentResolver(
	() => inFocusStore.current?.parent,
);

const addNewPageBtn = ref<string>();
const addNewPageDialog = ref<InstanceType<typeof AddNewPageDialog> | null>(
	null,
);

const focusedCellIndex = computed<number | undefined>(() => {
	const cell = inFocusStore.current?.cell;

	return cell && getCellIndex.value(cell);
});

const focusedCellContent = computed<LcCellContent | undefined>(
	() =>
		inFocusStore.current?.cell &&
		getCellContent.value(inFocusStore.current?.cell),
);

const cardTitle = computed<string | undefined>(() => {
	const title = t("editor.editionToolbar.tabs.content.label");

	if (!focusedCellContent.value?.text?.[locale.value]) return title;

	return title.concat(` - ${focusedCellContent.value.text[locale.value]}`);
});

const cellContentFormData = reactive<{
	text?: string | undefined;
	picto?: LcPicto | undefined;
	color?: string | undefined;
}>({});

const debouncedSaveCellContentData = debounce(saveCellContentData, 500);

function saveCellContentData(newData: typeof cellContentFormData) {
	if (!focusedCellContent.value) return;

	const convertedData: LcCellContent = {
		picto: newData.picto,
		text: { ...focusedCellContent.value?.text, [locale.value]: newData.text },
	};

	Object.assign(focusedCellContent.value, convertedData);

	editorStore.commit();
}

function onAddCaseHereClick() {
	if (!inFocusStore.current) return;

	editorStore.createContent(
		inFocusStore.current.parent,
		focusedCellIndex.value,
	);
}

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
	<v-tabs-window-item>
		<v-card-title>{{ cardTitle }}</v-card-title>
		<v-card-subtitle>
			<v-breadcrumbs :items="breadcrumbItems" class="ma-0 pa-0 ms-n1" />
		</v-card-subtitle>
		<v-card-text>
			<v-expand-transition>
				<v-form v-if="focusedCellContent">
					<v-row>
						<v-col cols="12" md="3">
							<arasac-autocomplete
								v-model="cellContentFormData.picto"
								:label="!cellContentFormData.picto ? t('editor.grid.forms.toolbar.cellContent.picto.description') : undefined"
								density="comfortable"
							/>
						</v-col>
						<v-col cols="12" md="9">
							<v-text-field
								v-model="cellContentFormData.text"
								:label="t('editor.grid.forms.toolbar.cellContent.text.description')"
								density="comfortable"
								clearable
							/>
						</v-col>
					</v-row>
				</v-form>
			</v-expand-transition>
			<div class="d-flex flex-wrap ga-4">
				<v-btn
					v-if="!!focusedCellContent"
					:text="t('editor.grid.actions.case.delete.label')"
					:prepend-icon="mdiTrashCan"
					variant="tonal"
					color="error"
					rounded
					v-tooltip:top="t('editor.grid.actions.case.delete.description')"
					@click="editorStore.deleteInFocus"
				/>
				<template v-else>
					<v-btn
						v-if="!focusedCellContent"
						:text="t('editor.grid.actions.case.addHere.label')"
						:prepend-icon="mdiPlus"
						variant="tonal"
						color="primary"
						rounded
						v-tooltip:top="t('editor.grid.actions.case.addHere.description')"
						@click="onAddCaseHereClick"
					/>
					<v-btn
						v-if="!focusedCellContent && inFocusStore.current?.parent && !('slot' in inFocusStore.current.parent)"
						ref="addNewPageBtn"
						:text="t('editor.grid.actions.case.addNewPage.label')"
						:prepend-icon="mdiFilePlusOutline"
						variant="tonal"
						color="primary"
						rounded
						v-tooltip:top="t('editor.grid.actions.case.addNewPage.description')"
						@click.stop="() => addNewPageDialog?.openOrCreatePage(focusedCellIndex)"
					/>
					<add-new-page-dialog ref="addNewPageDialog" :target="addNewPageBtn" />
				</template>
			</div>
		</v-card-text>
	</v-tabs-window-item>
</template>
