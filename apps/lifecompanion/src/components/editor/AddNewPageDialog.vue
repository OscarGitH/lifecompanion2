<script lang="ts" setup>
import type { LcActionNavigate } from "@lifecompanion/model";
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

const isOpen = ref<boolean>(false);
const targetIndex = ref<number>();

const sections = computed<LcListDialogSection[]>(() => {
	const activeContext = playerStore.activeContext;
	if (!activeContext) return [];

	const contentsWithExternalGroup =
		activeContext.page.contents?.filter(
			(
				content,
			): content is typeof content & {
				action: LcActionNavigate & { to: { pageGroupId: string } };
			} =>
				content.action?.kind === "navigation" &&
				content.action.to.pageGroupId !== undefined &&
				content.action.to.pageGroupId !== activeContext.pageGroup?.id,
		) ?? [];

	if (contentsWithExternalGroup.length < 2) return [];

	const contentsByPageGroup = groupBy(
		contentsWithExternalGroup,
		(content) => content.action.to.pageGroupId,
	);

	return [
		{
			label: t("editor.grid.forms.layoutSelection.current.label"),
			items: [
				{
					id: activeContext.pageGroup.id,
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

const openOrCreatePage = (caseIndex?: number | undefined) => {
	if (sections.value.length) {
		targetIndex.value = caseIndex;
		isOpen.value = true;
		return;
	}

	editorStore.createPageContent(caseIndex);
};

defineExpose({ openOrCreatePage });

const onSelect = (pageGroupId: string) => {
	const pageGroup = playerStore.config?.pageGroups?.find(
		(pg) => pg.id === pageGroupId,
	);

	editorStore.createPageContent(targetIndex.value, pageGroup);
	isOpen.value = false;
};
</script>

<template>
	<ListDialog
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
