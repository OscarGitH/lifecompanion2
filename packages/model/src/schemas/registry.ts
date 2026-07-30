import type { Prettify } from "ts-essentials";
import type { Schema, SchemaName } from "./core";
import { lcCellContentSchema } from "./lcCellContentSchema";
import { lcCellSchema } from "./lcCellSchema";
import { lcConfigSchema } from "./lcConfigSchema";
import { lcGridSchema } from "./lcGridSchema";
import { lcLayoutSchema } from "./lcLayoutSchema";
import { lcPageGroupSchema } from "./lcPageGroupSchema";
import { lcPageSchema } from "./lcPageSchema";
import { getSchemaName } from "./utils";

type ValidateRegistry<T extends readonly Schema[]> = {
	[S in T[number] as SchemaName<S>]: S;
};

const schemas = [
	lcCellContentSchema,
	lcCellSchema,
	lcConfigSchema,
	lcGridSchema,
	lcLayoutSchema,
	lcPageGroupSchema,
	lcPageSchema,
] as const;

export const SCHEMA_REGISTRY = Object.fromEntries(
	schemas.map((s) => [getSchemaName(s), s]),
) as Prettify<ValidateRegistry<typeof schemas>>;
