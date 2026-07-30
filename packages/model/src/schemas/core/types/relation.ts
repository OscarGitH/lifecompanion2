import type {
	BELONGS_TO_SYMBOL,
	HAS_MANY_SYMBOL,
	RELATION_SCHEMA_SYMBOL,
	RELATION_SYMBOL,
} from "../symbols";
import type { Schema, SchemaName } from "./schema";

export interface Relation<T> {
	_type: T;
	[RELATION_SCHEMA_SYMBOL]: SchemaName<Schema>;
	readonly [RELATION_SYMBOL]: true;
}

export interface BelongsTo<S extends Schema> extends Relation<S> {
	[RELATION_SCHEMA_SYMBOL]: SchemaName<S>;
	readonly [BELONGS_TO_SYMBOL]: true;
}

export interface HasMany<S extends Schema> extends Relation<S[]> {
	[RELATION_SCHEMA_SYMBOL]: SchemaName<S>;
	readonly [HAS_MANY_SYMBOL]: true;
}

export type KeyOfRelation<
	S extends Schema,
	R extends Relation<unknown> = Relation<unknown>,
> = {
	[K in keyof S]-?: NonNullable<S[K]> extends R ? K : never;
}[keyof S];
