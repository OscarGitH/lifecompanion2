import type {
	LcCell,
	LcCellContent,
	LcGrid,
	LcLayout,
	LcPage,
} from "@lifecompanion/model";
import { isEqual } from "es-toolkit";
import type { CSSProperties } from "vue";

export const cellComparator = (a: LcCell, b: LcCell) =>
	a.row - b.row || a.col - b.col;

export const isOverlapping = (cell: LcCell, target: LcCell) =>
	cell.row >= target.row &&
	cell.row < target.row + (target.rowspan || 1) &&
	cell.col >= target.col &&
	cell.col < target.col + (target.colspan || 1);

export const getAvailableCellsInParent = (
	parent: LcLayout | LcPage,
	grid: LcGrid,
) =>
	grid.cells.filter(
		(c) => !c.lockedContent && !("slot" in parent && isEqual(parent.slot, c)),
	);

export function getCellIndexInGrid(
	cell: LcCell,
	grid: LcGrid,
	pageOffset: number = 0,
	isSlot: (c: LcCell) => boolean = () => false,
): number {
	if (cell.lockedContent?.index) {
		return cell.lockedContent.index;
	}

	const cells = grid.cells.filter((c) => !isSlot(c)).sort(cellComparator);

	return cells.indexOf(cell) + pageOffset * cells.length;
}

export function getCellContentFromParentAndGrid(
	cell: LcCell,
	parent: LcLayout | LcPage,
	grid: LcGrid,
	pageOffset: number = 0,
	isSlot: (c: LcCell) => boolean = () => false,
): LcCellContent | undefined {
	if (cell.lockedContent) {
		return cell.lockedContent;
	}

	const index = getCellIndexInGrid(cell, grid, pageOffset, isSlot);

	return parent.contents?.find((c) => c.index === index);
}

export function cellCardCornerStyle(
	content?: LcCellContent | undefined,
): CSSProperties {
	return content?.action?.kind === "navigation"
		? { borderTopRightRadius: "24px" }
		: {};
}
