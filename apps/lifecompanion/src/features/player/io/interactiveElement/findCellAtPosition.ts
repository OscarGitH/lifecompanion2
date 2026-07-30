import type { Position2D } from "../../../../utils/shared/geometry/types";
import type { CellRef, GridRef } from "./types";

export default (
	position: Position2D,
	grids: GridRef[],
): CellRef | undefined => {
	const target = document.elementFromPoint(position.x, position.y);

	if (!target) {
		return undefined;
	}

	for (const grid of grids) {
		for (const block of grid.blocks) {
			const cell = block.cells.find((cell) => cell.element?.contains(target));

			if (cell) {
				return cell;
			}
		}
	}

	return undefined;
};
