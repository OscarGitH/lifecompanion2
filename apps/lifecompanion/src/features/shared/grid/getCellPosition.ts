import type { LcCellSchema, SchemaRecord } from "@lifecompanion/model";
import type { CSSProperties } from "vue";
import type { BlockRef } from "../../player/io/interactiveElement/types";

export const getCellPosition = (
	cell: SchemaRecord<LcCellSchema>,
	block: BlockRef,
	gap: number,
): CSSProperties => {
	const row = cell.row - block.blockRow;
	const col = cell.col - block.blockCol;
	const rowspan = cell.rowspan ? cell.rowspan : 1;
	const colspan = cell.colspan ? cell.colspan : 1;

	return {
		top: `calc(${(row / block.blockRows) * 100}% + ${gap}px)`,
		left: `calc(${(col / block.blockCols) * 100}% + ${gap}px)`,
		height: `calc(${(rowspan / block.blockRows) * 100}% - ${2 * gap}px)`,
		width: `calc(${(colspan / block.blockCols) * 100}% - ${2 * gap}px)`,
	};
};
