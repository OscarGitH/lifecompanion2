import type { HasMany, Schema } from "./core";
import { makeHasMany } from "./core/factories/relation";
import { makeSchema } from "./core/factories/schema";
import type { LcCellSchema } from "./lcCellSchema";

export interface LcGridSchema extends Schema<"grids"> {
	id: string;
	rows: number;
	cols: number;
	cells?: HasMany<LcCellSchema>;
}

export const lcGridSchema = makeSchema<LcGridSchema>("grids", {
	cells: makeHasMany("cells"),
});
