import type {
	BelongsTo,
	HasMany,
	KeyOfRelation,
	Schema,
	SchemaName,
} from "@lifecompanion/model";
import type { DBSchemas } from "./schema";

export type BelongsToDBValues<S extends DBSchemas> = {
	[K in KeyOfRelation<S, BelongsTo<Schema>>]?: NonNullable<
		S[K]
	> extends BelongsTo<DBSchemas>
		? string
		: never;
} & {
	_relations?: {
		[K in KeyOfRelation<S, BelongsTo<Schema>>]: NonNullable<
			S[K]
		> extends BelongsTo<infer R extends DBSchemas>
			? SchemaName<R>
			: never;
	};
};

export type HasManyDBValues<S extends DBSchemas> = {
	[K in KeyOfRelation<S, HasMany<Schema>>]?: NonNullable<
		S[K]
	> extends HasMany<DBSchemas>
		? string[]
		: never;
} & {
	_relations?: {
		[K in KeyOfRelation<S, HasMany<Schema>>]: NonNullable<S[K]> extends HasMany<
			infer R extends DBSchemas
		>
			? SchemaName<R>
			: never;
	};
};
