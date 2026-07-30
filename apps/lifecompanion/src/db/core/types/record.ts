import type { BelongsTo, HasMany, SchemaName } from "@lifecompanion/model";
import type { DB_SCHEMA_RECORD_SCHEMA_NAME } from "../factories/record";
import type { DBSchemas } from "./schema";

export type DBSchemaRecord<S extends DBSchemas> = Omit<
	{ [DB_SCHEMA_RECORD_SCHEMA_NAME]: SchemaName<S> } & {
		[K in keyof S]?: NonNullable<S[K]> extends HasMany<
			infer R extends DBSchemas
		>
			? DBSchemaRecord<R>[]
			: NonNullable<S[K]> extends BelongsTo<infer R extends DBSchemas>
				? DBSchemaRecord<R>
				: S[K];
	},
	symbol
>;
