import type { SCHEMA_RECORD_SCHEMA_SYMBOL } from "../symbols";
import type { BelongsTo, HasMany, KeyOfRelation, Relation } from "./relation";
import type { Schema } from "./schema";

export type SchemaRecordSkeleton<S extends Schema> = {
	readonly [SCHEMA_RECORD_SCHEMA_SYMBOL]: S;
};

export type SchemaRecordValues<S extends Schema> = Omit<
	{
		[K in keyof S]: NonNullable<S[K]> extends HasMany<infer R extends Schema>
			? SchemaRecord<R>[]
			: NonNullable<S[K]> extends BelongsTo<infer R extends Schema>
				? SchemaRecord<R>
				: S[K];
	},
	keyof Schema
>;

export type SchemaRecord<S extends Schema> = SchemaRecordSkeleton<S> &
	SchemaRecordValues<S>;

export type SchemaRecordAvailableInclusions<
	S extends Schema,
	Visited extends Schema = never,
> = {
	[K in KeyOfRelation<S>]: NonNullable<S[K]> extends Relation<infer Target>
		? (
				Target extends Array<infer R extends Schema>
					? R
					: Target extends Schema
						? Target
						: never
			) extends infer R extends Schema
			? [R] extends [Visited]
				? K
				:
						| K
						| `${Extract<K, string>}.${Extract<SchemaRecordAvailableInclusions<R, Visited | S>, string>}`
			: never
		: never;
}[KeyOfRelation<S>];
