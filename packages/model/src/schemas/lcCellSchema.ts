import type { BelongsTo, Schema } from "./core";
import { makeBelongsTo } from "./core/factories/relation";
import { makeSchema } from "./core/factories/schema";
import type { LcCellContentSchema } from "./lcCellContentSchema";

export interface LcCellSchema extends Schema<"cells"> {
	id: string;
	row: number;
	col: number;
	rowspan: number | null;
	colspan: number | null;
	lockedContent?: BelongsTo<LcCellContentSchema>;
	style?: Record<string, string | number>;
}

export const lcCellSchema = makeSchema<LcCellSchema>("cells", {
	lockedContent: makeBelongsTo("cell-contents"),
});
