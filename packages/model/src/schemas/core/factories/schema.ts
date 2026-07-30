import type { OmitNeverProperties } from "ts-essentials";
import { SCHEMA_NAME_SYMBOL } from "../symbols";
import type { Relation, Schema, SchemaName } from "../types";

type SchemaImplementation<S extends Schema> = OmitNeverProperties<{
	[K in keyof S]-?: NonNullable<S[K]> extends Relation<unknown> ? S[K] : never;
}>;

export const makeSchema = <S extends Schema>(
	name: SchemaName<S>,
	implementation?: SchemaImplementation<S>,
): S => {
	return {
		[SCHEMA_NAME_SYMBOL]: name,
		...(implementation ? implementation : {}),
	} as unknown as S;
};
