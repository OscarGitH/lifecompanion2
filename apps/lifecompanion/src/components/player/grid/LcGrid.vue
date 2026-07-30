<script lang="ts" setup>
import type {
	LcCellSchema,
	LcLayoutSchema,
	LcPageSchema,
	SchemaRecord,
} from "@lifecompanion/model";
import { v4 as uuidV4 } from "uuid";
import { type CSSProperties, computed, reactive, ref } from "vue";
import {
	injectGridContext,
	registerRefInGridContext,
} from "../../../composables/player/grid/grid";
import { isLayoutSlotCell } from "../../../composables/player/grid/isLayoutSlotCell";
import { useInteractiveElement } from "../../../composables/player/grid/useInteractiveElement";
import { useActivePlayer } from "../../../composables/player/useActivePlayer";
import { DEFAULT_SCAN_OPTIONS } from "../../../features/player/io/constantsTemporary";
import type {
	BlockRef,
	GridRef,
} from "../../../features/player/io/interactiveElement/types";
import type { LayoutStackItem } from "../../../stores/player/usePlayerStore";
import type LockedGridLayer from "../../editor/grid/LockedGridLayer.vue";
import LcGridBlock from "./LcGridBlock.vue";
import LcGridCell from "./LcGridCell.vue";

// TODO: After selection mode merge, discuss those 4 points together:

// TODO: Think about this component, named LcGrid but might not render a grid because not having one.
// TODO: Might need multiple component with lower responsibilities...
// TODO: Maybe LcGrid + LcLayoutStack, or something else.

// TODO: Why passing cellComponentResolver to each child when you can use a computed property directly from the store.

// TODO: IMO, LcEditableGridCell should RENDER LcGridCell, to keep default behavior (eventually disables/overwrites them).

// TODO: Take time to normalize naming convention across the codebase, like component "Lc" prefix, pascal case in template, etc.
// TODO: Also remove dead/unused code.

const { activePlayer } = useActivePlayer();

export type CellComponentResolver = (
	parent?: SchemaRecord<LcLayoutSchema | LcPageSchema>,
) => typeof LcGridCell;

const {
	styles,
	layoutStack = [],
	cellComponentResolver = () => LcGridCell,
} = defineProps<{
	styles?: CSSProperties;
	layoutStack?: LayoutStackItem[];
	cellComponentResolver?: CellComponentResolver;
	gridLayerComponents?: (typeof LockedGridLayer)[] | undefined;
}>();

const gridContext = injectGridContext();

const gridElement = ref<HTMLElement>();
const blocksRef = reactive<BlockRef[]>([]);

const gridId = computed(
	() => layout.value?.id ?? activePlayer.value.pageGroup.id,
);
const layout = computed(() => layoutStack[0]?.layout);
const remainingLayoutStack = computed(() => layoutStack.slice(1));

const grid = computed(() =>
	layout.value ? layout.value.grid : activePlayer.value.pageGroup.grid,
);

const gridStyle = computed(
	(): CSSProperties => ({
		...styles,
		display: "grid",
		zIndex: "auto",
		gridTemplateColumns: `repeat(${grid.value?.cols}, 1fr)`,
		gridTemplateRows: `repeat(${grid.value?.rows}, 1fr)`,
	}),
);

const blocks = computed(() => {
	if (!grid.value?.cells || grid.value.cells.length <= 0) {
		return [];
	}

	const scanAxis = DEFAULT_SCAN_OPTIONS.axis;

	const blocksForSlots: {
		id: string;
		cells: SchemaRecord<LcCellSchema>[];
		isSlotBlock: boolean;
	}[] = [];
	const blocksByAxisIndexes = new Map<
		number,
		{ id: string; cells: SchemaRecord<LcCellSchema>[]; isSlotBlock: boolean }
	>();

	grid.value.cells.forEach((cell) => {
		const cellAxisIndex = scanAxis.axis === "x" ? cell.row : cell.col;

		let blockForAxisIndex = blocksByAxisIndexes.get(cellAxisIndex);
		if (!blockForAxisIndex) {
			blockForAxisIndex = {
				id: uuidV4(),
				cells: [],
				isSlotBlock: false,
			};
			blocksByAxisIndexes.set(cellAxisIndex, blockForAxisIndex);
		}

		if (isLayoutSlotCell(cell, layout.value)) {
			blocksForSlots.push({
				id: uuidV4(),
				cells: [cell],
				isSlotBlock: true,
			});
		} else {
			blockForAxisIndex.cells.push(cell);
		}
	});

	return [...blocksByAxisIndexes.values(), ...blocksForSlots].filter(
		(block) => block.cells.length > 0,
	);
});

const { interactive, hoverStyle } = useInteractiveElement(gridId.value);

const gridIsHovering = computed(() => !!hoverStyle.value);

const gridRef: GridRef = {
	id: gridId.value,
	type: "grid",
	blocks: blocksRef,
	interactive,
};

registerRefInGridContext(gridRef, gridElement, gridContext.grids.value);
</script>

<template>
	<div
		ref="gridElement"
		v-if="grid"
		:style="gridStyle"
		class="position-relative w-100 h-100"
	>
		<div v-for="(block, _) in blocks" :key="block.id">
			<LcGridBlock
				:grid="{
          blocks: gridRef.blocks,
          rows: grid.rows,
          cols: grid.cols,
          isHovering: gridIsHovering
        }"
				:block="block"
				:layout="layout"
				:remaining-layout-stack="remainingLayoutStack"
				:cell-component-resolver="cellComponentResolver"
				:grid-layer-components="gridLayerComponents"
			/>
		</div>

		<Component
			v-for="(layer, index) in gridLayerComponents"
			:key="`grid-layer-${index}`"
			:is="layer"
			:grid="grid"
			:parent="layout || activePlayer.page"
			:index="100 - remainingLayoutStack.length + index"
		/>
	</div>
</template>
