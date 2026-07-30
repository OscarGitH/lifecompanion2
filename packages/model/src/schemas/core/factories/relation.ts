import {
	BELONGS_TO_SYMBOL,
	HAS_MANY_SYMBOL,
	RELATION_SCHEMA_SYMBOL,
	RELATION_SYMBOL,
} from "../symbols";
import type { BelongsTo, HasMany, Schema, SchemaName } from "../types";

export const makeBelongsTo = <S extends Schema>(
	schema: SchemaName<S>,
): BelongsTo<S> => {
	return {
		_type: null as unknown as S,
		[RELATION_SCHEMA_SYMBOL]: schema,
		[RELATION_SYMBOL]: true,
		[BELONGS_TO_SYMBOL]: true,
	};
};

export const makeHasMany = <S extends Schema>(
	schema: SchemaName<S>,
): HasMany<S> => {
	return {
		_type: null as unknown as S[],
		[RELATION_SCHEMA_SYMBOL]: schema,
		[RELATION_SYMBOL]: true,
		[HAS_MANY_SYMBOL]: true,
	};
};
