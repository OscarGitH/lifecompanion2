import type {
	LcCellContentSchema,
	LcCellSchema,
	LcGridSchema,
	LcLayoutSchema,
	LcPageSchema,
	SchemaRecord,
} from "@lifecompanion/model";
import { isEqual } from "es-toolkit";
import type { CSSProperties } from "vue";

export const cellComparator = (
	a: SchemaRecord<LcCellSchema>,
	b: SchemaRecord<LcCellSchema>,
) => a.row - b.row || a.col - b.col;

export const isOverlapping = (
	cell: SchemaRecord<LcCellSchema>,
	target: SchemaRecord<LcCellSchema>,
) =>
	cell.row >= target.row &&
	cell.row < target.row + (target.rowspan || 1) &&
	cell.col >= target.col &&
	cell.col < target.col + (target.colspan || 1);

export const getAvailableCellsInParent = (
	parent: SchemaRecord<LcLayoutSchema | LcPageSchema>,
	grid: SchemaRecord<LcGridSchema>,
) =>
	grid.cells?.filter(
		(c) => !c.lockedContent && !("slot" in parent && isEqual(parent.slot, c)),
	) ?? [];

export const getCellIndexInGrid = (
	cell: SchemaRecord<LcCellSchema>,
	grid: SchemaRecord<LcGridSchema>,
	pageOffset: number = 0,
	isSlot: (c: SchemaRecord<LcCellSchema>) => boolean = () => false,
): number => {
	if (cell.lockedContent?.index) {
		return cell.lockedContent.index;
	}

	const cells = grid.cells?.filter((c) => !isSlot(c)).sort(cellComparator);

	return cells ? cells.indexOf(cell) + pageOffset * cells.length : 0;
};

export const getCellContentFromParentAndGrid = (
	cell: SchemaRecord<LcCellSchema>,
	parent: SchemaRecord<LcLayoutSchema | LcPageSchema>,
	grid: SchemaRecord<LcGridSchema>,
	pageOffset: number = 0,
	isSlot: (c: SchemaRecord<LcCellSchema>) => boolean = () => false,
): SchemaRecord<LcCellContentSchema> | undefined => {
	if (cell.lockedContent) {
		return cell.lockedContent;
	}

	const index = getCellIndexInGrid(cell, grid, pageOffset, isSlot);

	return parent.contents?.find((c) => c.index === index);
};

export const cellCardCornerStyle = (
	content?: SchemaRecord<LcCellContentSchema> | undefined,
): CSSProperties => {
	return content?.action?.kind === "navigation"
		? { borderTopRightRadius: "24px" }
		: {};
};
