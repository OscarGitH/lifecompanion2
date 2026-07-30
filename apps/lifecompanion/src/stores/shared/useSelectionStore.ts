import { defineStore } from "pinia";
import { shallowRef } from "vue";
import type { GridRef } from "../../features/player/io/interactiveElement/types";

export const useSelectionStore = defineStore("selection", () => {
	const grids = shallowRef<GridRef[]>([]);

	const getGrids = () => grids;

	const registerInteractiveElements = (grid: GridRef): (() => void) => {
		grids.value = [...grids.value, grid];

		return () => {
			grids.value = grids.value.filter((g) => g !== grid);
		};
	};

	return {
		getGrids,
		registerInteractiveElements,
	};
});
