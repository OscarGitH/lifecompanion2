<script setup lang="ts">
import type {
	LcActionKind,
	LcCellSchema,
	LcLayoutSchema,
	LcPageSchema,
	SchemaRecord,
} from "@lifecompanion/model";
import {
	mdiArrowLeftRight,
	mdiArrowRightTopBold,
	mdiHistory,
	mdiPlus,
} from "@mdi/js";
import {
	type CSSProperties,
	computed,
	nextTick,
	ref,
	useTemplateRef,
	watch,
} from "vue";
import type { IconValue } from "vuetify/lib/composables/icons.mjs";
import { useActivePlayer } from "../../../composables/player/useActivePlayer";
import type { BlockRef } from "../../../features/player/io/interactiveElement/types";
import { getCellPosition } from "../../../features/shared/grid/getCellPosition";
import { useEditorStore } from "../../../stores/editor/useEditorStore";
import { useInFocusStore } from "../../../stores/editor/useInFocusStore";
import { usePlayerStore } from "../../../stores/player/usePlayerStore";
import { cellCardCornerStyle } from "../../../utils/player/grid";
import CellCardContent from "../../player/grid/CellCardContent.vue";

const { activePlayer, createParentResolver } = useActivePlayer();
const editorStore = useEditorStore();
const playerStore = usePlayerStore();
const inFocusStore = useInFocusStore();

const actionKindIcon: Record<LcActionKind, IconValue> = {
	pagination: mdiArrowLeftRight,
	navigation: mdiArrowRightTopBold,
	history: mdiHistory,
};

const { cell, block, parent } = defineProps<{
	cell: SchemaRecord<LcCellSchema>;
	block: BlockRef;
	parent: SchemaRecord<LcLayoutSchema | LcPageSchema>;
}>();

const selectedCheckbox = ref(false);

const { getCellIndex, getCellContent } = createParentResolver(() => parent);

const cellIndex = computed(() => getCellIndex.value(cell));
const isLayoutOrStatic = computed(
	() => "slot" in parent || activePlayer.value.pageGroup.kind === "static",
);

const parentIsFocused = computed(() => inFocusStore.parent === parent);

const isFocused = computed(
	() =>
		parentIsFocused && inFocusStore.cells.map((c) => c.id).includes(cell.id),
);

const content = computed(() => getCellContent.value(cell));

const cardBorderStyle = computed<CSSProperties>(() => {
	if (!isDragOver.value && !isFocused.value) return {};

	const baseOutline: CSSProperties = {
		outlineWidth: "2px",
		outlineColor: "rgb(var(--v-theme-primary))",
		outlineOffset: "-2px",
	};

	return {
		...baseOutline,
		outlineStyle: isDragOver.value ? "dashed" : "solid",
	};
});

const setFocus = () => {
	if (!isFocused.value) {
		inFocusStore.set(cell, parent);
		editorStore.toggleEdition(true);
	}
};

const onCardClick = () => {
	if (isFocused.value && inFocusStore.isMultiple) {
		inFocusStore.unset(cell);
	} else {
		setFocus();
	}
};

const onAddClick = () => {
	if (parentIsFocused.value && !content.value && cellIndex.value) {
		editorStore.createContent(parent, cellIndex.value);
	}

	nextTick(setFocus);
};

const draggable = computed<boolean>(
	() => !!(parentIsFocused.value && content.value),
);
const isDragOver = ref<boolean>(false);
const cardRef = useTemplateRef("cardRef");

const onDragStart = (event: DragEvent) => {
	if (!draggable.value) {
		event.preventDefault();
		return;
	}

	const data = JSON.stringify({
		cell: { row: cell.row, col: cell.col },
		content: { index: content.value?.index },
	});

	event.dataTransfer?.setData("application/lc-cell-content", data);

	if (cardRef.value) {
		event.dataTransfer?.setDragImage(cardRef.value.$el, 50, 50);
	}

	if (event.dataTransfer) {
		event.dataTransfer.effectAllowed = "move";
	}
};

const onDrop = (event: DragEvent) => {
	isDragOver.value = false;

	if (!parentIsFocused.value) {
		event.preventDefault();
		return;
	}

	const rawData = event.dataTransfer?.getData("application/lc-cell-content");
	if (!rawData) return;

	const { cell: sourceCell, content: sourceContent } = JSON.parse(rawData);
	if (sourceCell.row === cell.row && sourceCell.col === cell.col) return;

	const originIndex = sourceContent.index;
	const targetIndex = cellIndex.value;
	const dragContent = parent.contents?.find((c) => c.index === originIndex);
	const dropContent = parent.contents?.find((c) => c.index === targetIndex);

	if (dragContent && targetIndex !== undefined) {
		if (dropContent) dropContent.index = originIndex;

		dragContent.index = targetIndex;

		editorStore.commit();
	}
};

const onUpdateSelectedCheckbox = (selected: boolean) => {
	if (selected) {
		inFocusStore.toggleMultiple(true);
		inFocusStore.set(cell, parent);
	} else {
		inFocusStore.unset(cell);
		if (inFocusStore.cells.length <= 1) {
			inFocusStore.toggleMultiple(false);
		}
	}
};

watch(
	() => inFocusStore.cells,
	() => {
		if (!inFocusStore.cells.length) {
			inFocusStore.toggleMultiple(false);
		}

		selectedCheckbox.value =
			inFocusStore.isMultiple &&
			inFocusStore.cells.some((c) => c.id === cell.id);
	},
	{ deep: true },
);

watch(
	() => activePlayer.value,
	() => inFocusStore.reset(true),
);
</script>

<template>
	<div
		:draggable="draggable"
		:class="{ 'drop-zone-active': isDragOver }"
		:style="{
      position: 'absolute',
  		zIndex: 1,
      ...getCellPosition(cell, block, 4),
		}"
		@dragstart="onDragStart"
		@dragover.prevent="parentIsFocused && (isDragOver = true)"
		@dragleave="parentIsFocused && (isDragOver = false)"
		@drop="onDrop"
	>
		<VCard
			ref="cardRef"
			:variant="!content ? 'outlined' : 'elevated'"
			:color="!content ? 'grey': 'default'"
			:style="{...cardBorderStyle, ...cellCardCornerStyle(content)}"
			class="d-flex flex-column align-center justify-center w-100 h-100"
			:rounded="false"
			position="relative"
			@click="onCardClick"
		>
			<CellCardContent v-if="content" :content="content" />
			<VBtn
				v-else-if="isLayoutOrStatic"
				:icon="mdiPlus"
				variant="text"
				color="grey"
				size="x-large"
				position="absolute"
				@click="onAddClick"
			/>
			<VCheckbox
				v-if="isFocused || (inFocusStore.isMultiple && parentIsFocused)"
				v-model="selectedCheckbox"
				class="position-absolute top-0 left-0"
				hide-details
				@update:model-value="(v) => onUpdateSelectedCheckbox(!!v)"
			/>
			<VBtn
				v-if="content?.action"
				position="absolute"
				location="top right"
				variant="plain"
				class="ma-n2"
				size="x-large"
				icon
				v-tooltip="content.action.kind"
				@click.stop="() => playerStore.triggerAction(content?.action)"
			>
				<v-icon :icon="actionKindIcon[content.action.kind]" size="x-small" />
			</VBtn>
		</VCard>
	</div>
</template>
