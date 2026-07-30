import { isPlainObject } from "es-toolkit";
import type { BelongsTo, HasMany, Relation, Schema } from "../core";
import {
	BELONGS_TO_SYMBOL,
	HAS_MANY_SYMBOL,
	RELATION_SYMBOL,
} from "../core/symbols";

export const isRelation = (value: unknown): value is Relation<unknown> => {
	return isPlainObject(value) && RELATION_SYMBOL in value;
};

export const isBelongsToRelation = (
	value: unknown,
): value is BelongsTo<Schema> => {
	return isRelation(value) && BELONGS_TO_SYMBOL in value;
};

export const isHasManyRelation = (value: unknown): value is HasMany<Schema> => {
	return isRelation(value) && HAS_MANY_SYMBOL in value;
};
