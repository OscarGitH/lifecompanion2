import type { HasMany, Schema } from "./core";
import { makeHasMany } from "./core/factories/relation";
import { makeSchema } from "./core/factories/schema";
import type { LcLayoutSchema } from "./lcLayoutSchema";
import type { LcPageGroupSchema } from "./lcPageGroupSchema";

export interface LcConfigSchema extends Schema<"configs"> {
	id: string;
	layouts?: HasMany<LcLayoutSchema>;
	pageGroups?: HasMany<LcPageGroupSchema>;
}

export const lcConfigSchema = makeSchema<LcConfigSchema>("configs", {
	layouts: makeHasMany("layouts"),
	pageGroups: makeHasMany("page-groups"),
});
