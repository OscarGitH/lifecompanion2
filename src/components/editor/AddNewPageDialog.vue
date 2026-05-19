<script lang="ts" setup>
import type { LcCellContent } from "@lifecompanion/model";
import { groupBy } from "es-toolkit";
import { computed, ref } from "vue";
import { useEditorI18n } from "../../i18n/editor";
import { useEditorStore } from "../../stores/editor/useEditorStore";
import { usePlayerStore } from "../../stores/player/usePlayerStore";
import type { LcListDialogSection } from "../shared/ListDialog.vue";
import ListDialog from "../shared/ListDialog.vue";

const { locale, t } = useEditorI18n();
const playerStore = usePlayerStore();
const editorStore = useEditorStore();

defineProps<{ target?: string | undefined }>();
defineExpose({ openOrCreatePage });

const isOpen = ref<boolean>(false);
const targetIndex = ref<number>();

const sections = computed<LcListDialogSection[]>(() => {
	const activeContext = playerStore.activeContext;
	if (!activeContext) return [];

	const contentsWithExternalGroup = activeContext.page.contents.filter(
		(c): c is LcCellContent & { action: { to: { pagesGroupId: string } } } =>
			c.action?.kind === "navigation" &&
			c.action.to.pagesGroupId !== activeContext.group.id,
	);
	if (contentsWithExternalGroup.length < 2) return [];

	const contentsByPageGroup = groupBy(
		contentsWithExternalGroup,
		(c) => c.action.to.pagesGroupId,
	);

	return [
		{
			label: t("editor.grid.forms.layoutSelection.current.label"),
			items: [
				{
					id: activeContext.group.id,
					title: activeContext.page.title ?? t("shared.common.noTitle"),
				},
			],
		},
		{
			label: t("editor.grid.forms.layoutSelection.other.label"),
			items: Object.entries(contentsByPageGroup).map(
				([pageGroupId, contents]) => ({
					id: pageGroupId,
					title:
						contents
							.map((c) => c.text?.[locale.value])
							.filter((c) => c)
							.slice(0, 3)
							.join(", ") + (contents.length > 3 ? ", ..." : "") ||
						t("shared.common.noText"),
				}),
			),
		},
	];
});

function openOrCreatePage(caseIndex?: number | undefined) {
	if (sections.value.length) {
		targetIndex.value = caseIndex;
		isOpen.value = true;
		return;
	}

	editorStore.createPageContent(caseIndex);
}

function onSelect(pageGroupId: string) {
	const pageGroup = playerStore.config?.pagesGroups.find(
		(pg) => pg.id === pageGroupId,
	);

	editorStore.createPageContent(targetIndex.value, pageGroup);
	isOpen.value = false;
}
</script>

<template>
	<list-dialog
		v-model="isOpen"
		:title="t('editor.grid.forms.layoutSelection.label')"
		:sub-title="t('editor.grid.forms.layoutSelection.description')"
		:sections="sections"
		:target="target"
		max-width="500"
		rounded="xl"
		@select="onSelect"
	/>
</template>
