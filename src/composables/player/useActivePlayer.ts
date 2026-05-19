import type {
	LcCell,
	LcCellContent,
	LcLayout,
	LcPage,
} from "@lifecompanion/model";
import { isEqual } from "es-toolkit";
import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { usePlayerStore } from "../../stores/player/usePlayerStore";
import {
	cellComparator,
	getCellContentFromParentAndGrid,
	getCellIndexInGrid,
} from "../../utils/player/grid";

export function useActivePlayer() {
	const playerStore = usePlayerStore();

	const activePlayer = computed(() => {
		if (!playerStore.activeContext) {
			throw new Error("Player does not have an active configuration");
		}

		return playerStore.activeContext;
	});

	const createParentResolver = (
		parent: MaybeRefOrGetter<LcLayout | LcPage | undefined>,
	) => {
		const p = computed(() => toValue(parent));

		const grid = computed(() =>
			p.value
				? "grid" in p.value
					? p.value.grid
					: activePlayer.value.group.grid
				: undefined,
		);

		const slot = computed(() =>
			p.value && "slot" in p.value ? p.value.slot : undefined,
		);

		const isSlot = computed(
			() => (c: LcCell) => (slot.value && isEqual(slot.value, c)) || false,
		);

		const page = computed(() => {
			const nonSlotCells = grid.value?.cells
				.filter((c) => !isSlot.value(c))
				.sort(cellComparator);

			const contents = p.value?.contents || [];
			const pageSize = nonSlotCells?.length || 1;
			const maxIndex = Math.max(
				contents.length,
				...contents.map((c) => c.index || 0),
			);

			const total = Math.ceil(maxIndex / pageSize) || 1;
			const current = slot.value
				? (activePlayer.value.layoutStack.find((i) => i.layout === p.value)
						?.page ?? 0)
				: activePlayer.value.pageIndex;

			const indexFor = (contentIndex: number) =>
				Math.floor(contentIndex / pageSize);

			return { total, current, indexFor };
		});

		const getCell = computed(
			() => (cc: LcCellContent) =>
				grid.value?.cells
					.filter((c) => !isSlot.value(c))
					.find((c) =>
						cc.index != null
							? getCellIndex.value(c) === cc.index
							: isEqual(cc, c.lockedContent),
					),
		);

		const getCellIndex = computed(
			() => (c: LcCell) =>
				grid.value
					? getCellIndexInGrid(c, grid.value, page.value.current, isSlot.value)
					: undefined,
		);

		const getCellContent = computed(
			() => (c: LcCell) =>
				p.value && grid.value
					? getCellContentFromParentAndGrid(
							c,
							p.value,
							grid.value,
							page.value.current,
							isSlot.value,
						)
					: undefined,
		);

		return { grid, page, slot, isSlot, getCell, getCellIndex, getCellContent };
	};

	return { activePlayer, createParentResolver };
}
