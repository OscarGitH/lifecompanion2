import type { BelongsTo, HasMany, Schema } from "./core";
import { makeBelongsTo, makeHasMany } from "./core/factories/relation";
import { makeSchema } from "./core/factories/schema";
import type { LcGridSchema } from "./lcGridSchema";
import type { LcLayoutSchema } from "./lcLayoutSchema";
import type { LcPageSchema } from "./lcPageSchema";

export type LcPageGroupKind = "static" | "dynamic";
export interface LcPageGroupSchema extends Schema<"page-groups"> {
	id: string;
	kind: LcPageGroupKind;
	index: number;
	layout?: BelongsTo<LcLayoutSchema>;
	grid?: BelongsTo<LcGridSchema>;
	pages?: HasMany<LcPageSchema>;
}

export const lcPageGroupSchema = makeSchema<LcPageGroupSchema>("page-groups", {
	layout: makeBelongsTo("layouts"),
	grid: makeBelongsTo("grids"),
	pages: makeHasMany("pages"),
});
