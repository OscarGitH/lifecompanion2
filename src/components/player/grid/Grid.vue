<script lang="ts" setup>
import type { LcCell, LcGrid, LcLayout, LcPage } from "@lifecompanion/model";
import { isEqual } from "es-toolkit";
import { type CSSProperties, computed } from "vue";
import { useActivePlayer } from "../../../composables/player/useActivePlayer";
import type { LayoutStackItem } from "../../../stores/player/usePlayerStore";
import type LockedGridLayer from "../../editor/grid/LockedGridLayer.vue";
import GridComponent from "./Grid.vue";
import GridCell from "./GridCell.vue";

const { activePlayer } = useActivePlayer();

export type CellComponentResolver = (
	parent?: LcLayout | LcPage,
) => typeof GridCell;

const { layoutStack = [], cellComponentResolver = () => GridCell } =
	defineProps<{
		layoutStack?: LayoutStackItem[];
		cellComponentResolver?: CellComponentResolver;
		gridLayerComponents?: (typeof LockedGridLayer)[] | undefined;
	}>();

const layout = computed(() => layoutStack[0]?.layout);
const remainingLayoutStack = computed(() => layoutStack.slice(1));

const grid = computed(
	(): LcGrid =>
		layout.value ? layout.value.grid : activePlayer.value.group.grid,
);

const isSlot = computed(
	() => (cell: LcCell) =>
		layout.value ? isEqual(cell, layout.value.slot) : false,
);

const gridStyle = computed(
	(): CSSProperties => ({
		display: "grid",
		gridTemplateColumns: `repeat(${grid.value?.cols}, 1fr)`,
		gridTemplateRows: `repeat(${grid.value?.rows}, 1fr)`,
	}),
);

function getCellStyle(cell: LcCell): CSSProperties {
	return {
		gridColumnStart: (cell.col ?? 0) + 1,
		gridColumnEnd: `span ${cell.colspan || 1}`,
		gridRowStart: (cell.row ?? 0) + 1,
		gridRowEnd: `span ${cell.rowspan || 1}`,
		containerType: "size",
		minWidth: 0,
		minHeight: 0,
		...cell.style,
	};
}
</script>

<template>
	<div :style="gridStyle" class="position-relative ga-2 w-100 h-100">
		<div
			v-for="(cell) in grid.cells"
			:key="`cell-${cell.row}-${cell.col}`"
			:style="getCellStyle(cell)"
			class="w-100 h-100"
		>
			<grid-component
				v-if="layout && isSlot(cell)"
				:layout-stack="remainingLayoutStack"
				:cell-component-resolver="cellComponentResolver"
				:grid-layer-components="gridLayerComponents"
			/>

			<component
				v-else
				:is="cellComponentResolver(layout || activePlayer.page)"
				:cell="cell"
				:parent="layout || activePlayer.page"
			/>
		</div>

		<component
			v-for="(layer, index) in gridLayerComponents"
			:key="`grid-layer-${index}`"
			:is="layer"
			:grid="grid"
			:parent="layout || activePlayer.page"
			:index="100 - remainingLayoutStack.length + index"
		/>
	</div>
</template>
