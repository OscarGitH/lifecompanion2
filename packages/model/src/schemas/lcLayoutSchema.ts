import type { BelongsTo, HasMany, Schema } from "./core";
import { makeBelongsTo, makeHasMany } from "./core/factories/relation";
import { makeSchema } from "./core/factories/schema";
import type { LcCellContentSchema } from "./lcCellContentSchema";
import type { LcCellSchema } from "./lcCellSchema";
import type { LcGridSchema } from "./lcGridSchema";

export interface LcLayoutSchema extends Schema<"layouts"> {
	id: string;
	title?: string | undefined;
	extends?: BelongsTo<LcLayoutSchema>;
	grid?: BelongsTo<LcGridSchema>;
	slot?: BelongsTo<LcCellSchema>;
	contents?: HasMany<LcCellContentSchema>;
}

export const lcLayoutSchema = makeSchema<LcLayoutSchema>("layouts", {
	extends: makeBelongsTo("layouts"),
	grid: makeBelongsTo("grids"),
	slot: makeBelongsTo("cells"),
	contents: makeHasMany("cell-contents"),
});
