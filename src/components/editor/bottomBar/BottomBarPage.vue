<script setup lang="ts">
import {
	mdiTableColumnPlusAfter,
	mdiTableColumnPlusBefore,
	mdiTableColumnRemove,
	mdiTableRowPlusAfter,
	mdiTableRowPlusBefore,
	mdiTableRowRemove,
} from "@mdi/js";
import { debounce } from "es-toolkit";
import { computed, ref, watch } from "vue";
import useInFocusBreadcrumb from "../../../composables/editor/useInFocusBreadcrumb";
import { useEditorI18n } from "../../../i18n/editor";
import { useEditorStore } from "../../../stores/editor/useEditorStore";
import { useInFocusStore } from "../../../stores/editor/useInFocusStore";

const { t } = useEditorI18n();
const { items: breadcrumbItems } = useInFocusBreadcrumb();
const editorStore = useEditorStore();
const inFocusStore = useInFocusStore();

const title = ref<string | undefined>();

const cardTitle = computed<string | undefined>(() => {
	const text =
		inFocusStore.current && "slot" in inFocusStore.current.parent
			? "Layout"
			: "Page";
	const title = inFocusStore.current?.parent.title;

	if (!title) return text;

	return text.concat(` - ${title}`);
});

function saveTitle(newTitle: string | undefined) {
	if (
		inFocusStore.current?.parent &&
		inFocusStore.current?.parent.title !== newTitle
	) {
		Object.assign(inFocusStore.current.parent, { title: newTitle });
		editorStore.commit();
	}
}

const debouncedSaveTitle = debounce(saveTitle, 500);

watch(title, debouncedSaveTitle);
watch(
	() => inFocusStore.current?.parent.title,
	(newTitle) => (title.value = newTitle),
	{ immediate: true },
);
</script>

<template>
	<v-tabs-window-item>
		<v-card-title> {{ cardTitle }} </v-card-title>
		<v-card-subtitle>
			<v-breadcrumbs :items="breadcrumbItems" class="ma-0 pa-0 ms-n1" />
		</v-card-subtitle>
		<v-card-text>
			<v-form>
				<v-text-field
					v-model="title"
					:label="t('editor.grid.forms.toolbar.page.title.description')"
					density="comfortable"
					clearable
				/>
			</v-form>
			<div class="d-flex flex-wrap ga-4">
				<div class="flex-grow-1">
					<p class="text-title-medium font-weight-bold mt-0">Colonnes</p>
					<div class="d-flex flex-wrap ga-2">
						<v-btn
							:text="t('editor.grid.actions.col.remove.label')"
							:prepend-icon="mdiTableColumnRemove"
							variant="tonal"
							color="error"
							rounded
							v-tooltip:top="t('editor.grid.actions.col.remove.description')"
							@click="() => editorStore.spliceGridAtFocus('col', 'remove')"
						/>
						<v-btn
							:text="t('editor.grid.actions.col.addBefore.label')"
							:prepend-icon="mdiTableColumnPlusBefore"
							variant="tonal"
							color="primary"
							rounded
							v-tooltip:top="t('editor.grid.actions.col.addBefore.description')"
							@click="() => editorStore.spliceGridAtFocus('col', 'add', 'before')"
						/>
						<v-btn
							:text="t('editor.grid.actions.col.addAfter.label')"
							:prepend-icon="mdiTableColumnPlusAfter"
							variant="tonal"
							color="primary"
							rounded
							v-tooltip:top="t('editor.grid.actions.col.addAfter.description')"
							@click="() => editorStore.spliceGridAtFocus('col', 'add', 'after')"
						/>
					</div>
				</div>
				<div class="flex-grow-1">
					<p class="text-title-medium font-weight-bold mt-0">Lignes</p>
					<div class="d-flex flex-wrap ga-2">
						<v-btn
							:text="t('editor.grid.actions.row.remove.label')"
							:prepend-icon="mdiTableRowRemove"
							variant="tonal"
							color="error"
							rounded
							v-tooltip:top="t('editor.grid.actions.row.remove.description')"
							@click="() => editorStore.spliceGridAtFocus('row', 'remove')"
						/>
						<v-btn
							:text="t('editor.grid.actions.row.addBefore.label')"
							:prepend-icon="mdiTableRowPlusBefore"
							variant="tonal"
							color="primary"
							rounded
							v-tooltip:top="t('editor.grid.actions.row.addBefore.description')"
							@click="() => editorStore.spliceGridAtFocus('row', 'add', 'before')"
						/>
						<v-btn
							:text="t('editor.grid.actions.row.addAfter.label')"
							:prepend-icon="mdiTableRowPlusAfter"
							variant="tonal"
							color="primary"
							rounded
							v-tooltip:top="t('editor.grid.actions.row.addAfter.description')"
							@click="() => editorStore.spliceGridAtFocus('row', 'add', 'after')"
						/>
					</div>
				</div>
			</div>
		</v-card-text>
	</v-tabs-window-item>
</template>
