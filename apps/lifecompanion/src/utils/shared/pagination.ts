import type {
	LcGridSchema,
	LcLayoutSchema,
	LcPageSchema,
	SchemaRecord,
} from "@lifecompanion/model";
import { getAvailableCellsInParent } from "../player/grid";

export const getParentTotalPages = (
	parent: SchemaRecord<LcLayoutSchema | LcPageSchema>,
	grid: SchemaRecord<LcGridSchema>,
): number => {
	const maxIndex = Math.max(
		parent.contents?.length ?? 0,
		...(parent.contents?.map((c) => c.index || 0) ?? []),
	);

	return (
		Math.ceil(maxIndex / getAvailableCellsInParent(parent, grid).length) || 1
	);
};
