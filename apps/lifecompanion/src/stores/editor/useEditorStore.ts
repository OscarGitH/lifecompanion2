import {
	type LcCellContentSchema,
	type LcCellSchema,
	type LcConfigSchema,
	type LcGridSchema,
	type LcLayoutSchema,
	type LcPageGroupSchema,
	type LcPageSchema,
	lcCellSchema,
	lcConfigSchema,
	lcGridSchema,
	lcPageGroupSchema,
	lcPageSchema,
	makeSchemaRecord,
	type SchemaRecord,
} from "@lifecompanion/model";
import { cloneDeep, debounce } from "es-toolkit";
import { isEqual } from "es-toolkit/compat";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { lcCellContentSchema } from "./../../../../../packages/model/src/schemas/lcCellContentSchema";
import { useActivePlayer } from "../../composables/player/useActivePlayer";
import { useEditorI18n } from "../../i18n/editor";
import { cellComparator, isOverlapping } from "../../utils/player/grid";
import { usePlayerStore } from "../player/usePlayerStore";
import { useSnackbarStore } from "../shared/useSnackbarStore";
import { useInFocusStore } from "./useInFocusStore";

const MAX_UNDO_SIZE = 30;

export const useEditorStore = defineStore("editor", () => {
	const { t } = useEditorI18n();
	const playerStore = usePlayerStore();
	const snackbarStore = useSnackbarStore();
	const inFocusStore = useInFocusStore();

	const { createParentResolver } = useActivePlayer();

	const backupConfig = ref<SchemaRecord<LcConfigSchema> | undefined>(undefined);
	const undoStack = ref<SchemaRecord<LcConfigSchema>[]>([]);
	const redoStack = ref<SchemaRecord<LcConfigSchema>[]>([]);

	const enabled = computed<boolean>(() => !!backupConfig.value);
	const canUndo = computed<boolean>(() => undoStack.value.length > 1);
	const canRedo = computed<boolean>(() => !!redoStack.value.length);

	const isDirty = computed<boolean>(
		() => !isEqual(backupConfig.value, playerStore.config),
	);

	const reset = () => {
		backupConfig.value = undefined;
		inFocusStore.reset();

		undoStack.value = [];
		redoStack.value = [];

		playerStore.reset();
	};

	const commit = () => {
		if (
			playerStore.config &&
			!isEqual(undoStack.value.at(-1), playerStore.config)
		) {
			undoStack.value.push(cloneDeep(playerStore.config));
			redoStack.value = [];

			if (undoStack.value.length > MAX_UNDO_SIZE) {
				undoStack.value.shift();
			}
		}
	};

	const debounceCommit = debounce(commit, 300);

	const backup = () => {
		if (backupConfig.value) {
			playerStore.config = cloneDeep(backupConfig.value);
			commit();
			restoreFocus();
		}
	};

	const undo = () => {
		if (!canUndo.value) return;

		const current = undoStack.value.pop();

		if (current) {
			redoStack.value.push(cloneDeep(current));
		}

		const previous = undoStack.value.pop();

		if (previous) {
			playerStore.config = cloneDeep(previous);
			undoStack.value.push(cloneDeep(previous));
			restoreFocus();
		}
	};

	const redo = () => {
		if (!canRedo.value) return;

		const next = redoStack.value.pop();

		if (next) {
			playerStore.config = cloneDeep(next);
			undoStack.value.push(cloneDeep(next));
			restoreFocus();
		}
	};

	const createNewConfig = () => {
		reset();

		playerStore.init(
			makeSchemaRecord(lcConfigSchema, {
				id: crypto.randomUUID(),
				pageGroups: [
					makeSchemaRecord(lcPageGroupSchema, {
						id: crypto.randomUUID(),
						index: 0,
						kind: "static",
						grid: makeSchemaRecord(lcGridSchema, {
							id: crypto.randomUUID(),
							cols: 6,
							rows: 4,
							cells: Array.from({ length: 4 * 6 }, (_, i) =>
								makeSchemaRecord(lcCellSchema, {
									id: crypto.randomUUID(),
									col: i % 6,
									row: Math.floor(i / 6),
									colspan: null,
									rowspan: null,
								}),
							),
						}),
						pages: [
							makeSchemaRecord(lcPageSchema, {
								id: crypto.randomUUID(),
								index: 0,
							}),
						],
					}),
				],
			}),
		);

		commit();
		toggleEdition(true);
	};

	const loadConfig = (config: SchemaRecord<LcConfigSchema>) => {
		reset();
		playerStore.init(config);
		commit();
	};

	const toggleEdition = (forced?: boolean) => {
		const toggleOn = forced || !enabled.value;

		if (toggleOn !== enabled.value) {
			if (toggleOn) {
				backupConfig.value = cloneDeep(playerStore.config) ?? undefined;

				commit();

				if (
					playerStore.activeContext?.page &&
					playerStore.activeContext.pageGroup.grid?.cells?.[0]
				) {
					inFocusStore.set(
						playerStore.activeContext.pageGroup.grid.cells[0],
						playerStore.activeContext.page,
					);
				}
			} else {
				backupConfig.value = undefined;
				inFocusStore.reset();
			}
		}
	};

	const deleteInFocus = () => {
		const { getCellContent } = createParentResolver(inFocusStore.parent);

		const focusedCellContentId = inFocusStore.cells.map(
			(cell) => getCellContent.value(cell)?.id,
		);

		if (inFocusStore.parent) {
			inFocusStore.parent.contents =
				inFocusStore.parent.contents?.filter(
					(c) => !focusedCellContentId.includes(c.id),
				) ?? [];
		}

		commit();
	};

	const restoreFocus = () => {
		const parent = inFocusStore.parent;
		const context = playerStore.activeContext;

		if (!parent || !context) return;

		const layoutMatch =
			"slot" in parent
				? context.layoutStack.find((ls) => ls.layout.id === parent.id)?.layout
				: null;

		const newParent = layoutMatch ?? context.page;

		if (!newParent) return;

		const grid = "slot" in newParent ? newParent.grid : context.pageGroup.grid;

		if (!grid?.cells) return;

		const newCell =
			grid.cells.find(
				(c) =>
					c.col === inFocusStore.firstCell?.col &&
					c.row === inFocusStore.firstCell?.row,
			) || grid.cells[0];

		if (newCell) {
			inFocusStore.toggleMultiple(false);
			inFocusStore.set(newCell, newParent);
		}
	};

	/**
	 * Main entry point for structural grid modifications starting from the focus point.
	 * Orchestrates cells insertion/removal, slot and focus point synchronization, and content index reordering.
	 *
	 * @param axis - The grid axis to modify ('row' or 'col').
	 * @param mode - The mutation type ('add' or 'remove').
	 * @param insert - The insertion side relative to the focused cell (only applies to 'add' mode).
	 */
	const spliceGridAtFocus = (
		axis: "row" | "col",
		mode: "add" | "remove",
		insert?: "before" | "after",
	): void => {
		const { firstCell, parent, isMultiple } = inFocusStore;
		const { grid, slot } = createParentResolver(parent);

		if (!grid.value || !firstCell || !parent || isMultiple) return;

		const isRow = axis === "row";

		const span = firstCell[isRow ? "rowspan" : "colspan"] || 1;
		const spanDelta = mode === "add" && insert === "after" ? span : 0;
		const targetPos = firstCell[axis] + spanDelta;

		const activeGroup = playerStore.activeContext?.pageGroup;
		const isLayoutOrStatic = !!slot.value || activeGroup?.kind === "static";

		const gridDirectionSize = isRow ? grid.value.cols : grid.value.rows;

		const { updatedCells, newSlotRef, newFocusedCellRef } =
			_prepareGridMutation(
				axis,
				mode,
				targetPos,
				span,
				grid.value,
				slot.value,
				firstCell,
			);

		if (mode === "add") {
			// Add new cells which are not overlapping others after mutation.
			updatedCells.push(
				..._generateEmptyCells(axis, targetPos, gridDirectionSize).filter(
					(a) => !updatedCells.some((c) => isOverlapping(a, c)),
				),
			);
		}

		updatedCells.sort(cellComparator);

		let reindexedContents: SchemaRecord<LcCellContentSchema>[] | undefined;
		if (isLayoutOrStatic) {
			reindexedContents = _getReindexedContents(
				axis,
				mode,
				targetPos,
				parent.contents ?? [],
				grid.value.cells ?? [],
				updatedCells,
				slot.value,
				newSlotRef,
			);
		}

		// Mutate slot if needed.
		if ("slot" in parent && newSlotRef) {
			parent.slot = newSlotRef;
		}

		// Mutate contents if needed
		if (reindexedContents !== undefined) {
			parent.contents = reindexedContents;
		}

		// Mutate grid.
		Object.assign(grid.value, {
			[`${axis}s`]: grid.value[`${axis}s`] + (mode === "add" ? 1 : -span),
			cells: updatedCells,
		});

		// Mutate focus if nedded
		if (newFocusedCellRef) {
			inFocusStore.set(newFocusedCellRef);
		}

		commit();
	};

	/**
	 * Generates a sequence of uninitialized cells to fill a new row or column.
	 *
	 * @see spliceGridAtFocus - Main caller for this utility.
	 * @param axis - The axis being created (row or col).
	 * @param pos - The fixed coordinate on the target axis.
	 * @param count - The number of cells to generate (the length of the new track).
	 * @returns An array of new LcCell objects.
	 */
	const _generateEmptyCells = (
		axis: "row" | "col",
		pos: number,
		count: number,
	): SchemaRecord<LcCellSchema>[] => {
		const isRow = axis === "row";

		return Array.from({ length: count }, (_, i) =>
			makeSchemaRecord(lcCellSchema, {
				id: crypto.randomUUID(),
				row: isRow ? pos : i,
				col: isRow ? i : pos,
				rowspan: null,
				colspan: null,
			}),
		);
	};

	/**
	 * Calculates the new state of existing cells and the slot during a grid mutation.
	 * Shifts positions or adjusts spans (rowspan/colspan) based on the target axis.
	 *
	 * @see spliceGridAtFocus - Main caller for this utility.
	 * @param axis - The direction of the mutation (row or col).
	 * @param mode - The mutation type: 'add' to shift forward, 'remove' to shift backward.
	 * @param targetPos - The coordinate on the axis where the splice occurs.
	 * @param grid - The current grid state containing cells to process.
	 * @param slot - The current slotted cell that can be modified by grid mutation.
	 * @param focused - The currently focused cell which that can be modified by grid mutation.
	 * @returns An object containing the array of updated cells and the new slot and focused cell references if has been processed.
	 */
	const _prepareGridMutation = (
		axis: "row" | "col",
		mode: "add" | "remove",
		targetPos: number,
		cellSpan: number,
		grid: SchemaRecord<LcGridSchema>,
		slot?: SchemaRecord<LcCellSchema>,
		focused?: SchemaRecord<LcCellSchema>,
	) => {
		const isRow = axis === "row";
		const delta = mode === "add" ? 1 : -1;
		const spanKey = isRow ? "rowspan" : "colspan";

		let newSlotRef: SchemaRecord<LcCellSchema> | undefined;
		let newFocusedCellRef: SchemaRecord<LcCellSchema> | undefined;

		const updatedCells =
			grid.cells
				?.filter(
					(c) =>
						mode === "add" ||
						c[axis] !== targetPos ||
						(slot && isEqual(c, slot)),
				)
				.map((c) => {
					let updatedCell: SchemaRecord<LcCellSchema> = { ...c };
					const isSlot = slot && isEqual(c, slot);
					const isFocus = focused && isEqual(c, focused);
					const willOverlappDirection = isOverlapping(
						makeSchemaRecord(lcCellSchema, {
							id: crypto.randomUUID(),
							col: isRow ? c.col : targetPos,
							row: !isRow ? c.row : targetPos,
							colspan: null,
							rowspan: null,
						}),
						c,
					);

					if (willOverlappDirection) {
						const span = c[spanKey] || 1;
						const shouldExtend =
							targetPos > c[axis] && targetPos < c[axis] + span;

						if (shouldExtend) {
							updatedCell = {
								...c,
								[spanKey]: shouldExtend ? span + delta : span,
							};
						}
					}

					if (c[axis] >= targetPos) {
						const axisDelta = mode === "add" ? 1 : -cellSpan;
						updatedCell = { ...updatedCell, [axis]: c[axis] + axisDelta };
					}

					if (isSlot) {
						newSlotRef = { ...updatedCell };
					}

					if (isFocus) {
						newFocusedCellRef = updatedCell;
					}

					return updatedCell;
				})
				.sort(cellComparator) ?? [];

		return { updatedCells, newSlotRef, newFocusedCellRef };
	};

	/**
	 * Re-indexes cell contents following a grid mutation.
	 * Maps content from old cell positions to their new coordinates by applying
	 * the positional shift and locating the matching cell in the updated grid.
	 *
	 * @see spliceGridAtFocus - Main caller for this utility.
	 * @param axis - The direction of the mutation (row or col).
	 * @param mode - The mutation type: 'add' to shift forward, 'remove' to shift backward.
	 * @param targetPos - The coordinate on the axis where the splice occurs.
	 * @param contents - The list of cell contents to be re-indexed.
	 * @param oldCells - The array of cells before the mutation.
	 * @param newCells - The array of cells after the mutation.
	 * @param oldSlot - The previous slot reference to be excluded from standard indexing.
	 * @param newSlot - The new slot reference to be excluded from standard indexing.
	 * @returns The content array with updated `index` properties reflecting the new grid layout.
	 */
	const _getReindexedContents = (
		axis: "row" | "col",
		mode: "add" | "remove",
		targetPos: number,
		contents: SchemaRecord<LcCellContentSchema>[],
		oldCells: SchemaRecord<LcCellSchema>[],
		newCells: SchemaRecord<LcCellSchema>[],
		oldSlot?: SchemaRecord<LcCellSchema>,
		newSlot?: SchemaRecord<LcCellSchema>,
	) => {
		const indexableOldCells = oldCells
			.filter((c) => oldSlot == null || !isEqual(c, oldSlot))
			.sort(cellComparator);

		const indexableNewCells = newCells
			.filter(
				(c) =>
					(newSlot == null && oldSlot == null) ||
					!isEqual(c, newSlot || oldSlot),
			)
			.sort(cellComparator);

		if (!indexableOldCells.length) return contents;

		return contents.map((c) => {
			if (c.index == null) return c;

			const indexInGrid = Math.abs(c.index) % indexableOldCells.length;
			const cell = { ...indexableOldCells[indexInGrid] };
			const delta = mode === "add" ? 1 : -1;

			if (cell.lockedContent) return c;

			if (cell?.[axis] != null && cell[axis] >= targetPos) {
				cell[axis] += delta;
			}

			const pageOffset = Math.floor(c.index / indexableOldCells.length);
			const newIndex =
				indexableNewCells.findIndex(
					(c) => c.col === cell.col && c.row === cell.row,
				) +
				pageOffset * indexableNewCells.length;

			return { ...c, index: newIndex };
		});
	};

	const createContent = (
		targetParent?: SchemaRecord<LcLayoutSchema | LcPageSchema>,
		targetIndex?: number,
	) => {
		const { parent, newContent } = __createContent(targetParent, targetIndex);

		if (!parent || !newContent) return;

		if (!parent.contents) {
			parent.contents = [];
		}

		parent.contents.push(newContent);

		snackbarStore.queue.push({
			text: t("editor.grid.actions.case.add.success"),
			color: "secondary",
		});

		commit();
		toggleEdition(true);
		__resetFocusAfterCreateContent(parent, newContent);
	};

	const createPageContent = (
		targetIndex?: number | undefined,
		targetPageGroup?: SchemaRecord<LcPageGroupSchema> | undefined,
	) => {
		const page = playerStore.activeContext?.page;
		const group: SchemaRecord<LcPageGroupSchema> | undefined = targetPageGroup
			? targetPageGroup
			: playerStore.activeContext?.pageGroup;
		const lastPageIndex = group?.pages
			?.sort((a, b) => a.index - b.index)
			.at(-1)?.index;

		if (!page || !group) return;

		const { newContent } = __createContent(page, targetIndex);

		if (!page || !newContent) return;

		const newPage = makeSchemaRecord(lcPageSchema, {
			id: crypto.randomUUID(),
			index: lastPageIndex !== undefined ? lastPageIndex + 1 : 0,
		});

		if (!group.pages) {
			group.pages = [];
		}

		group.pages.push(newPage);

		if (targetPageGroup) {
			if (playerStore.config && !playerStore.config.pageGroups) {
				playerStore.config.pageGroups = [];
			}

			playerStore.config?.pageGroups?.push(group);
		}

		newContent.action = {
			kind: "navigation",
			to: {
				pageId: newPage.id,
				pageGroupId: group.id,
				pageIndex: 0,
			},
		};

		if (!page.contents) {
			page.contents = [];
		}

		page.contents.push(newContent);

		snackbarStore.queue.push({
			text: t("editor.grid.actions.case.add.success"),
			color: "secondary",
		});

		commit();
		toggleEdition(true);

		__resetFocusAfterCreateContent(page, newContent);
	};

	const __createContent = (
		targetParent?: SchemaRecord<LcLayoutSchema | LcPageSchema>,
		targetIndex?: number,
	): {
		parent: SchemaRecord<LcLayoutSchema | LcPageSchema> | undefined;
		newContent: SchemaRecord<LcCellContentSchema> | undefined;
	} => {
		const parent: SchemaRecord<LcLayoutSchema | LcPageSchema> | undefined =
			targetParent || inFocusStore.parent || playerStore.activeContext?.page;

		if (!parent) return { parent, newContent: undefined };

		let index = targetIndex;

		if (index == null) {
			const lastIndex = parent.contents?.findLast(
				(c) => c.index != null,
			)?.index;
			index = lastIndex != null ? lastIndex + 1 : 0;
		}

		if (index == null) return { parent, newContent: undefined };

		return {
			parent,
			newContent: makeSchemaRecord(lcCellContentSchema, {
				id: crypto.randomUUID(),
				index,
			}),
		};
	};

	const __resetFocusAfterCreateContent = (
		parent: SchemaRecord<LcLayoutSchema | LcPageSchema>,
		newContent: SchemaRecord<LcCellContentSchema>,
	) => {
		if (playerStore.activeContext && newContent.index) {
			const { page } = createParentResolver(parent);
			const newContentPageIndex = page.value.indexFor(newContent.index);

			if (page.value.current !== newContentPageIndex) {
				if ("slot" in parent) {
					const parentLayoutStack = playerStore.activeContext.layoutStack.find(
						(ls) => ls.layout.id === parent.id,
					);

					if (parentLayoutStack) {
						parentLayoutStack.page = newContentPageIndex;
					}
				} else {
					playerStore.triggerAction({
						kind: "navigation",
						to: {
							pageId: playerStore.activeContext?.page.id,
							pageGroupId: playerStore.activeContext.pageGroup.id,
							pageIndex: newContentPageIndex,
						},
					});
				}
			}
		}

		const targetCell = createParentResolver(parent).getCell.value(newContent);

		if (!targetCell) return;

		inFocusStore.set(targetCell, parent);
	};

	watch(() => playerStore.route, restoreFocus);

	return {
		enabled,
		canUndo,
		canRedo,
		isDirty,
		reset,
		backup,
		undo,
		redo,
		createNewConfig,
		loadConfig,
		toggleEdition,
		debounceCommit,
		commit,
		deleteInFocus,
		spliceGridAtFocus,
		createContent,
		createPageContent,
	};
});
