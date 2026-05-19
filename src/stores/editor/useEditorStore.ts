import type {
	LcCell,
	LcCellContent,
	LcConfig,
	LcGrid,
	LcLayout,
	LcPage,
	LcPagesGroup,
} from "@lifecompanion/model";
import { cloneDeep, debounce } from "es-toolkit";
import { isEqual } from "es-toolkit/compat";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";
import { useActivePlayer } from "../../composables/player/useActivePlayer";
import { useEditorI18n } from "../../i18n/editor";
import { cellComparator, isOverlapping } from "../../utils/player/grid";
import { usePlayerStore } from "../player/usePlayerStore";
import { useSnackbarStore } from "../shared/useSnackbarStore";
import { type BottomBarTabs, useBottomBarStore } from "./useBottomBarStore";
import { useInFocusStore } from "./useInFocusStore";

const MAX_UNDO_SIZE = 30;

export const useEditorStore = defineStore("editor", () => {
	const { t } = useEditorI18n();
	const playerStore = usePlayerStore();
	const snackbarStore = useSnackbarStore();
	const bottomBarStore = useBottomBarStore();
	const inFocusStore = useInFocusStore();

	const { createParentResolver } = useActivePlayer();

	const backupConfig = ref<LcConfig | undefined>(undefined);
	const undoStack = ref<LcConfig[]>([]);
	const redoStack = ref<LcConfig[]>([]);

	const enabled = computed<boolean>(() => !!backupConfig.value);
	const canUndo = computed<boolean>(() => undoStack.value.length > 1);
	const canRedo = computed<boolean>(() => !!redoStack.value.length);

	const isDirty = computed<boolean>(
		() => !isEqual(backupConfig.value, playerStore.config),
	);

	const debounceCommit = debounce(commit, 300);

	function reset() {
		backupConfig.value = undefined;
		inFocusStore.current = undefined;

		undoStack.value = [];
		redoStack.value = [];

		playerStore.reset();
	}

	function commit() {
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
	}

	function backup() {
		if (backupConfig.value) {
			playerStore.config = cloneDeep(backupConfig.value);
			commit();
			restoreFocus();
		}
	}

	function undo() {
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
	}

	function redo() {
		if (!canRedo.value) return;

		const next = redoStack.value.pop();

		if (next) {
			playerStore.config = cloneDeep(next);
			undoStack.value.push(cloneDeep(next));
			restoreFocus();
		}
	}

	function createNewConfig() {
		reset();
		playerStore.init({
			layouts: [],
			pagesGroups: [
				{
					id: crypto.randomUUID(),
					index: 0,
					kind: "static",
					layout: null,
					grid: {
						cols: 6,
						rows: 4,
						cells: Array.from({ length: 4 * 6 }, (_, i) => ({
							col: i % 6,
							row: Math.floor(i / 6),
							colspan: null,
							rowspan: null,
							lockedContent: null,
						})),
					},
					pages: [{ id: crypto.randomUUID(), index: 0, contents: [] }],
				},
			],
		});
		commit();
		toggleEdition(true);
	}

	function loadConfig(config: LcConfig) {
		reset();
		playerStore.init(config);
		commit();
	}

	function toggleEdition(forced?: boolean, tab?: BottomBarTabs) {
		const toggleOn = forced || !enabled.value;

		if (toggleOn !== enabled.value) {
			if (toggleOn) {
				backupConfig.value = cloneDeep(playerStore.config) ?? undefined;

				commit();

				if (
					playerStore.activeContext?.page &&
					playerStore.activeContext.group.grid.cells[0]
				) {
					inFocusStore.current = {
						parent: playerStore.activeContext.page,
						cell: playerStore.activeContext.group.grid.cells[0],
					};
				}
			} else {
				backupConfig.value = undefined;
				inFocusStore.current = undefined;
			}
		}

		if (enabled.value && tab) {
			bottomBarStore.tab = tab;
		}
	}

	function deleteInFocus() {
		if (!inFocusStore.current) return;

		const { cell, parent } = inFocusStore.current;
		const { getCellContent } = createParentResolver(parent);

		parent.contents = parent.contents.filter(
			(c) => c !== getCellContent.value(cell),
		);

		commit();
	}

	function restoreFocus() {
		const focused = inFocusStore.current;
		const context = playerStore.activeContext;

		if (!focused?.parent?.id || !context) return;

		const layoutMatch =
			"slot" in focused.parent
				? context.layoutStack.find((ls) => ls.layout.id === focused.parent.id)
						?.layout
				: null;

		const newParent = layoutMatch ?? context.page;

		if (!newParent) return;

		const grid = "slot" in newParent ? newParent.grid : context.group.grid;
		const newCell =
			grid.cells.find(
				(c) => c.col === focused.cell.col && c.row === focused.cell.row,
			) || grid.cells[0];

		if (newCell) {
			inFocusStore.current = { parent: newParent, cell: newCell };
		}
	}

	/**
	 * Main entry point for structural grid modifications starting from the focus point.
	 * Orchestrates cells insertion/removal, slot and focus point synchronization, and content index reordering.
	 *
	 * @param axis - The grid axis to modify ('row' or 'col').
	 * @param mode - The mutation type ('add' or 'remove').
	 * @param insert - The insertion side relative to the focused cell (only applies to 'add' mode).
	 */
	function spliceGridAtFocus(
		axis: "row" | "col",
		mode: "add" | "remove",
		insert?: "before" | "after",
	): void {
		if (!inFocusStore.current) return;

		const { cell, parent } = inFocusStore.current;
		const { grid, slot } = createParentResolver(parent);

		if (!grid.value) return;

		const isRow = axis === "row";

		const span = cell[isRow ? "rowspan" : "colspan"] || 1;
		const spanDelta = mode === "add" && insert === "after" ? span : 0;
		const targetPos = cell[axis] + spanDelta;

		const activeGroup = playerStore.activeContext?.group;
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
				inFocusStore.current.cell,
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

		let reindexedContents: LcCellContent[] | undefined;
		if (isLayoutOrStatic) {
			reindexedContents = _getReindexedContents(
				axis,
				mode,
				targetPos,
				parent.contents,
				grid.value.cells,
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
			inFocusStore.current = {
				...inFocusStore.current,
				cell: newFocusedCellRef,
			};
		}

		commit();
	}

	/**
	 * Generates a sequence of uninitialized cells to fill a new row or column.
	 *
	 * @see spliceGridAtFocus - Main caller for this utility.
	 * @param axis - The axis being created (row or col).
	 * @param pos - The fixed coordinate on the target axis.
	 * @param count - The number of cells to generate (the length of the new track).
	 * @returns An array of new LcCell objects.
	 */
	function _generateEmptyCells(
		axis: "row" | "col",
		pos: number,
		count: number,
	): LcCell[] {
		const isRow = axis === "row";

		return Array.from({ length: count }, (_, i) => ({
			row: isRow ? pos : i,
			col: isRow ? i : pos,
			rowspan: null,
			colspan: null,
			lockedContent: null,
		}));
	}

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
	function _prepareGridMutation(
		axis: "row" | "col",
		mode: "add" | "remove",
		targetPos: number,
		cellSpan: number,
		grid: LcGrid,
		slot?: LcCell,
		focused?: LcCell,
	) {
		const isRow = axis === "row";
		const delta = mode === "add" ? 1 : -1;
		const spanKey = isRow ? "rowspan" : "colspan";

		let newSlotRef: LcCell | undefined;
		let newFocusedCellRef: LcCell | undefined;

		const updatedCells = grid.cells
			.filter(
				(c) =>
					mode === "add" || c[axis] !== targetPos || (slot && isEqual(c, slot)),
			)
			.map((c) => {
				let updatedCell: LcCell = { ...c };
				const isSlot = slot && isEqual(c, slot);
				const isFocus = focused && isEqual(c, focused);
				const willOverlappDirection = isOverlapping(
					{
						col: isRow ? c.col : targetPos,
						row: !isRow ? c.row : targetPos,
						colspan: null,
						rowspan: null,
						lockedContent: null,
					},
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
			.sort(cellComparator);

		return { updatedCells, newSlotRef, newFocusedCellRef };
	}

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
	function _getReindexedContents(
		axis: "row" | "col",
		mode: "add" | "remove",
		targetPos: number,
		contents: LcCellContent[],
		oldCells: LcCell[],
		newCells: LcCell[],
		oldSlot?: LcCell,
		newSlot?: LcCell,
	) {
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
	}

	function createContent(
		targetParent?: LcLayout | LcPage,
		targetIndex?: number,
	) {
		const { parent, newContent } = __createContent(targetParent, targetIndex);

		if (!parent || !newContent) return;

		parent.contents.push(newContent);
		snackbarStore.queue.push({
			text: t("editor.grid.actions.case.add.success"),
			color: "secondary",
		});
		commit();
		toggleEdition(true, "content");

		__resetFocusAfterCreateContent(parent, newContent);
	}

	function createPageContent(
		targetIndex?: number | undefined,
		targetPageGroup?: LcPagesGroup | undefined,
	) {
		const page = playerStore.activeContext?.page;
		const group: LcPagesGroup | undefined = targetPageGroup
			? targetPageGroup
			: playerStore.activeContext?.group;
		const lastPageIndex = group?.pages
			.sort((a, b) => a.index - b.index)
			.at(-1)?.index;

		if (!page || !group) return;

		const { newContent } = __createContent(page, targetIndex);

		if (!page || !newContent) return;

		const newPage: LcPage = {
			id: crypto.randomUUID(),
			index: lastPageIndex !== undefined ? lastPageIndex + 1 : 0,
			contents: [],
		};

		group.pages.push(newPage);

		if (targetPageGroup) {
			playerStore.config?.pagesGroups.push(group);
		}

		newContent.action = {
			kind: "navigation",
			to: {
				pageId: newPage.id,
				pagesGroupId: group.id,
				pageIndex: 0,
			},
		};

		page.contents.push(newContent);
		snackbarStore.queue.push({
			text: t("editor.grid.actions.case.add.success"),
			color: "secondary",
		});
		commit();
		toggleEdition(true, "content");

		__resetFocusAfterCreateContent(page, newContent);
	}

	function __createContent(
		targetParent?: LcLayout | LcPage,
		targetIndex?: number,
	): {
		parent: LcLayout | LcPage | undefined;
		newContent: LcCellContent | undefined;
	} {
		const parent: LcLayout | LcPage | undefined =
			targetParent ||
			inFocusStore.current?.parent ||
			playerStore.activeContext?.page;

		if (!parent) return { parent, newContent: undefined };

		let index = targetIndex;

		if (index == null) {
			const lastIndex = parent.contents.findLast((c) => c.index != null)?.index;
			index = lastIndex != null ? lastIndex + 1 : 0;
		}

		if (index == null) return { parent, newContent: undefined };

		return { parent, newContent: { index } };
	}

	function __resetFocusAfterCreateContent(
		parent: LcLayout | LcPage,
		newContent: LcCellContent,
	) {
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
							pagesGroupId: playerStore.activeContext.group.id,
							pageIndex: newContentPageIndex,
						},
					});
				}
			}
		}

		const targetCell = createParentResolver(parent).getCell.value(newContent);

		if (!targetCell) return;

		inFocusStore.current = {
			cell: targetCell,
			parent: parent,
		};
	}

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
