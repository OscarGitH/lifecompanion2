<script setup lang="ts">
import type {
	LcActionKind,
	LcCell,
	LcLayout,
	LcPage,
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
} from "vue";
import type { IconValue } from "vuetify/lib/composables/icons.mjs";
import { useActivePlayer } from "../../../composables/player/useActivePlayer";
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

const { cell, parent } = defineProps<{
	parent: LcLayout | LcPage;
	cell: LcCell;
}>();

const { getCellIndex, getCellContent } = createParentResolver(() => parent);

const cellIndex = computed(() => getCellIndex.value(cell));
const isLayoutOrStatic = computed(
	() => "slot" in parent || activePlayer.value.group.kind === "static",
);

const parentIsFocused = computed(
	() => inFocusStore.current && inFocusStore.current.parent === parent,
);

const isFocused = computed(
	() =>
		inFocusStore.current &&
		parentIsFocused &&
		inFocusStore.current.cell === cell,
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

function setFocus() {
	if (!isFocused.value) {
		inFocusStore.current = { cell, parent };
		editorStore.toggleEdition(true, "content");
	}
}

function onCardClick() {
	if (isFocused.value) return;

	setFocus();
}

function onAddClick() {
	if (parentIsFocused.value && !content.value && cellIndex.value) {
		editorStore.createContent(parent, cellIndex.value);
	}

	nextTick(setFocus);
}

const draggable = computed<boolean>(
	() => !!(parentIsFocused.value && content.value),
);
const isDragOver = ref<boolean>(false);
const cardRef = useTemplateRef("cardRef");

function onDragStart(event: DragEvent) {
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
}

function onDrop(event: DragEvent) {
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
	const dragContent = parent.contents.find((c) => c.index === originIndex);
	const dropContent = parent.contents.find((c) => c.index === targetIndex);

	if (dragContent && targetIndex !== undefined) {
		if (dropContent) dropContent.index = originIndex;

		dragContent.index = targetIndex;

		editorStore.commit();
	}
}
</script>

<template>
	<div
		:draggable="draggable"
		:class="{ 'drop-zone-active': isDragOver }"
		class="w-100 h-100"
		@dragstart="onDragStart"
		@dragover.prevent="parentIsFocused && (isDragOver = true)"
		@dragleave="parentIsFocused && (isDragOver = false)"
		@drop="onDrop"
	>
		<v-card
			ref="cardRef"
			:variant="!content ? 'outlined' : 'elevated'"
			:color="!content ? 'grey': 'default'"
			:style="{...cardBorderStyle, ...cellCardCornerStyle(content)}"
			class="d-flex flex-column align-center justify-center w-100 h-100"
			@click="onCardClick"
		>
			<cell-card-content v-if="content" :content="content" />
			<v-btn
				v-else-if="isLayoutOrStatic"
				:icon="mdiPlus"
				variant="text"
				color="grey"
				size="x-large"
				position="absolute"
				@click="onAddClick"
			/>
			<v-btn
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
			</v-btn>
		</v-card>
	</div>
</template>
