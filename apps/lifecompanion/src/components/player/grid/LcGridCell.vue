<script lang="ts" setup>
import type {
	LcCellContentSchema,
	LcCellSchema,
	LcLayoutSchema,
	LcPageSchema,
	SchemaRecord,
} from "@lifecompanion/model";
import { type CSSProperties, computed, ref } from "vue";
import { registerRefInGridContext } from "../../../composables/player/grid/grid";
import { useInteractiveElement } from "../../../composables/player/grid/useInteractiveElement";
import { useActivePlayer } from "../../../composables/player/useActivePlayer";
import { HOVER_TRANSITION_DURATION } from "../../../composables/player/visualEffect/constants";
import type {
	BlockRef,
	CellRef,
} from "../../../features/player/io/interactiveElement/types";
import { getCellPosition } from "../../../features/shared/grid/getCellPosition";
import { usePlayerStore } from "../../../stores/player/usePlayerStore";
import { cellCardCornerStyle } from "../../../utils/player/grid";
import LcVisualBorder from "../visualEffect/LcVisualBorder.vue";
import LcVisualProgress from "../visualEffect/LcVisualProgress.vue";
import CellCardContent from "./CellCardContent.vue";

const { createParentResolver } = useActivePlayer();

const playerStore = usePlayerStore();

const { block, cell, parent } = defineProps<{
	block: BlockRef;
	cell: SchemaRecord<LcCellSchema>;
	parent: SchemaRecord<LcLayoutSchema | LcPageSchema>;
}>();

const { getCellContent } = createParentResolver(() => parent);

const content = computed<SchemaRecord<LcCellContentSchema> | undefined>(() =>
	getCellContent.value(cell),
);

const actions = async () => {
	content.value?.action && playerStore.triggerAction(content.value.action);
};

const { interactive, hoverStyle, activeStyle, visualProgressProps } =
	useInteractiveElement(cell.id, actions);

const styles = computed<CSSProperties>(() => {
	const styleCard = cellCardCornerStyle(content.value);
	let style: CSSProperties = {
		zIndex: 1,
		transition: `transform ${HOVER_TRANSITION_DURATION}ms ease-in-out`,
		...styleCard,
	};

	const hover = hoverStyle.value;
	const active = activeStyle.value;

	if (hover || active) {
		style.zIndex = 3;
		style.transform = hover?.scale ? `scale(${hover.scale})` : undefined;
	}

	return style;
});

const cellElement = ref<HTMLElement>();

const cellRef: CellRef = {
	id: cell.id,
	type: "cell",
	row: cell.row,
	col: cell.col,
	interactive,
};

registerRefInGridContext(cellRef, cellElement, block.cells);
</script>

<template>
	<div
		ref="cellElement"
		class="position-absolute cell-div"
		:style="{ ...getCellPosition(cell, block, 4), ...styles }"
	>
		<VCard
			class="position-relative h-100 w-100"
			:rounded="false"
			:style="{ ...cellCardCornerStyle(content), boxSizing: 'border-box' }"
		>
			<CellCardContent v-if="content" :content="content" />

			<LcVisualProgress
				v-if="visualProgressProps?.value"
				:visual-progress-props="visualProgressProps?.value"
			/>
		</VCard>

		<LcVisualBorder
			v-if="hoverStyle || activeStyle"
			:hover-style="hoverStyle"
			:active-style="activeStyle"
		/>
	</div>
</template>

<style scoped>
.cell-div {
	transform-origin: center;
	user-select: none;
}
</style>
