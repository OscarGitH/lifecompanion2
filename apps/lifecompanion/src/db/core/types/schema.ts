import type {
	KeyOfRelation,
	LcCellContentSchema,
	LcCellSchema,
	LcConfigSchema,
	LcGridSchema,
	LcLayoutSchema,
	LcPageGroupSchema,
	LcPageSchema,
	Schema,
	SchemaName,
} from "@lifecompanion/model";
import type { DBSchema as BaseDBSchema } from "idb";
import type { Merge } from "ts-essentials";
import type { BelongsToDBValues, HasManyDBValues } from "./relation";

export type DBSchemas = Merge<
	{ id: string },
	| LcConfigSchema
	| LcLayoutSchema
	| LcPageGroupSchema
	| LcPageSchema
	| LcGridSchema
	| LcCellSchema
	| LcCellContentSchema
>;

export type DBSchemaValueWithoutRelations<S extends DBSchemas> = Omit<
	S,
	keyof Schema | KeyOfRelation<S>
>;

export type DBSchemaValue<S extends DBSchemas> =
	DBSchemaValueWithoutRelations<S> & BelongsToDBValues<S> & HasManyDBValues<S>;

type DBSchemaTable<S extends DBSchemas> = {
	key: string;
	value: DBSchemaValue<S>;
	indexes: {
		[K in KeyOfRelation<S>]: string;
	};
};

export type DBSchema = BaseDBSchema & {
	[S in DBSchemas as SchemaName<S>]: DBSchemaTable<S>;
};
