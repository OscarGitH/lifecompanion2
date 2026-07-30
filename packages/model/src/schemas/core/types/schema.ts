import type { SCHEMA_NAME_SYMBOL } from "../symbols";

export type SchemaName<S extends Schema> = S[typeof SCHEMA_NAME_SYMBOL];

export interface Schema<T = string> {
	readonly [SCHEMA_NAME_SYMBOL]: T;
}
