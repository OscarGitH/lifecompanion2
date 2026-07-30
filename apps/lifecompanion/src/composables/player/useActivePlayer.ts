import {
	isSchemaRecord,
	type LcCellContentSchema,
	type LcCellSchema,
	type LcLayoutSchema,
	type LcPageSchema,
	lcLayoutSchema,
	type SchemaRecord,
} from "@lifecompanion/model";
import { isEqual } from "es-toolkit";
import { computed, type MaybeRefOrGetter, toValue } from "vue";
import { usePlayerStore } from "../../stores/player/usePlayerStore";
import {
	cellComparator,
	getCellContentFromParentAndGrid,
	getCellIndexInGrid,
} from "../../utils/player/grid";

export const useActivePlayer = () => {
	const playerStore = usePlayerStore();

	const activePlayer = computed(() => {
		if (!playerStore.activeContext) {
			throw new Error("Player does not have an active configuration");
		}

		return playerStore.activeContext;
	});

	const createParentResolver = (
		parent: MaybeRefOrGetter<
			SchemaRecord<LcLayoutSchema | LcPageSchema> | undefined
		>,
	) => {
		const p = computed(() => toValue(parent));

		const grid = computed(() =>
			p.value
				? isSchemaRecord(p.value, lcLayoutSchema)
					? p.value.grid
					: activePlayer.value.pageGroup.grid
				: undefined,
		);

		const slot = computed(() =>
			p.value && isSchemaRecord(p.value, lcLayoutSchema)
				? p.value.slot
				: undefined,
		);

		const isSlot = computed(
			() => (c: SchemaRecord<LcCellSchema>) =>
				(slot.value && isEqual(slot.value, c)) || false,
		);

		const page = computed(() => {
			const nonSlotCells = grid.value?.cells
				?.filter((c) => !isSlot.value(c))
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
			() => (cc: SchemaRecord<LcCellContentSchema>) =>
				grid.value?.cells
					?.filter((c) => !isSlot.value(c))
					.find((c) =>
						cc.index != null
							? getCellIndex.value(c) === cc.index
							: isEqual(cc, c.lockedContent),
					),
		);

		const getCellIndex = computed(
			() => (c: SchemaRecord<LcCellSchema>) =>
				grid.value
					? getCellIndexInGrid(c, grid.value, page.value.current, isSlot.value)
					: undefined,
		);

		const getCellContent = computed(
			() => (c: SchemaRecord<LcCellSchema>) =>
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
};
