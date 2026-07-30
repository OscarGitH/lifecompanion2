import type { HasMany, Schema } from "./core";
import { makeHasMany } from "./core/factories/relation";
import { makeSchema } from "./core/factories/schema";
import type { LcCellContentSchema } from "./lcCellContentSchema";

export interface LcPageSchema extends Schema<"pages"> {
	id: string;
	index: number;
	title?: string | undefined;
	contents?: HasMany<LcCellContentSchema>;
}

export const lcPageSchema = makeSchema<LcPageSchema>("pages", {
	contents: makeHasMany("cell-contents"),
});
