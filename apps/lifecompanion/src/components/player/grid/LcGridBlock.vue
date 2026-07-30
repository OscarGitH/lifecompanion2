<script lang="ts" setup>
import type {
	LcCellSchema,
	LcLayoutSchema,
	SchemaRecord,
} from "@lifecompanion/model";
import { type CSSProperties, computed, reactive, ref, watchEffect } from "vue";
import { registerRefInGridContext } from "../../../composables/player/grid/grid";
import { useInteractiveElement } from "../../../composables/player/grid/useInteractiveElement";
import { useActivePlayer } from "../../../composables/player/useActivePlayer";
import { HOVER_TRANSITION_DURATION } from "../../../composables/player/visualEffect/constants";
import type {
	BlockRef,
	CellRef,
} from "../../../features/player/io/interactiveElement/types";
import { getCellPosition } from "../../../features/shared/grid/getCellPosition";
import type { LayoutStackItem } from "../../../stores/player/usePlayerStore";
import type LockedGridLayer from "../../editor/grid/LockedGridLayer.vue";
import type { CellComponentResolver } from "./LcGrid.vue";
import LcGrid from "./LcGrid.vue";

const { activePlayer } = useActivePlayer();

const {
	grid,
	block,
	layout,
	remainingLayoutStack,
	cellComponentResolver,
	gridLayerComponents,
} = defineProps<{
	grid: {
		blocks: BlockRef[];
		rows: number;
		cols: number;
		isHovering: boolean;
	};
	block: {
		id: string;
		cells: SchemaRecord<LcCellSchema>[];
		isSlotBlock: boolean;
	};
	layout: SchemaRecord<LcLayoutSchema> | undefined;
	remainingLayoutStack: LayoutStackItem[];
	cellComponentResolver: CellComponentResolver;
	gridLayerComponents?: (typeof LockedGridLayer)[] | undefined;
}>();

const blockElement = ref<HTMLElement>();
const cellsRef = reactive<CellRef[]>([]);

const blockCol = computed(() => Math.min(...block.cells.map(({ col }) => col)));
const blockRow = computed(() => Math.min(...block.cells.map(({ row }) => row)));
const blockMaxCol = computed(() =>
	Math.max(
		...block.cells.map(({ col, colspan }) => col + (colspan ? colspan : 1)),
	),
);
const blockMaxRow = computed(() =>
	Math.max(
		...block.cells.map(({ row, rowspan }) => row + (rowspan ? rowspan : 1)),
	),
);
const blockCols = computed(() => blockMaxCol.value - blockCol.value);
const blockRows = computed(() => blockMaxRow.value - blockRow.value);

const { interactive, hoverStyle, activeStyle } = useInteractiveElement(
	block.id,
);

const blockStyles = computed(() => {
	let style: CSSProperties = {
		transition: `transform ${HOVER_TRANSITION_DURATION}ms ease-in-out`,
		top: `${(blockRow.value / grid.rows) * 100}%`,
		left: `${(blockCol.value / grid.cols) * 100}%`,
		height: `${(blockRows.value / grid.rows) * 100}%`,
		width: `${(blockCols.value / grid.cols) * 100}%`,
	};

	const hover = hoverStyle.value;
	const active = activeStyle.value;

	if (hover || active || (!block.isSlotBlock && grid.isHovering)) {
		style.zIndex = 3;
		style.transform = hover?.scale ? `scale(${hover.scale})` : undefined;
	}

	return style;
});

const blockRef: BlockRef = {
	id: block.id,
	type: "block",
	blockRows: blockRows.value,
	blockRow: blockRow.value,
	blockCols: blockCols.value,
	blockCol: blockCol.value,
	cells: cellsRef,
	interactive,
};

watchEffect(() => {
	blockRef.blockRows = blockRows.value;
	blockRef.blockRow = blockRow.value;
	blockRef.blockCols = blockCols.value;
	blockRef.blockCol = blockCol.value;
});

if (!block.isSlotBlock) {
	registerRefInGridContext(blockRef, blockElement, grid.blocks);
}
</script>

<template>
	<div
		ref="blockElement"
		:style="blockStyles"
		class="position-absolute block-div"
	>
		<div
			v-for="(cell) in block.cells"
			:key="cell.id"
			class="position-absolute w-100 h-100"
		>
			<LcGrid
				v-if="block.isSlotBlock"
				:styles="{
		      ...getCellPosition(cell, blockRef, 0),
        }"
				:layout-stack="remainingLayoutStack"
				:cell-component-resolver="cellComponentResolver"
				:grid-layer-components="gridLayerComponents"
			/>

			<Component
				v-else
				:is="cellComponentResolver(layout || activePlayer.page)"
				:block="blockRef"
				:cell="cell"
				:parent="layout || activePlayer.page"
			/>
		</div>
	</div>
</template>

<style scoped>
.block-div {
	z-index: auto;
	transform-origin: center;
	user-select: none;
}
</style>
