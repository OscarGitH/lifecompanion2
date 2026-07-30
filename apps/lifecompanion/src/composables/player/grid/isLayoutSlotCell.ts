import type {
	LcCellSchema,
	LcLayoutSchema,
	SchemaRecord,
} from "@lifecompanion/model";
import { isEqual } from "es-toolkit";

export const isLayoutSlotCell = (
	cell: SchemaRecord<LcCellSchema>,
	layout: SchemaRecord<LcLayoutSchema> | undefined,
) => {
	return layout ? isEqual(cell, layout.slot) : false;
};
