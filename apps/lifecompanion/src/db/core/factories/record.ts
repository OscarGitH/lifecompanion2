import type { SchemaName } from "@lifecompanion/model";
import type { DBSchemaRecord } from "../types/record";
import type { DBSchemas, DBSchemaValueWithoutRelations } from "../types/schema";

export const DB_SCHEMA_RECORD_SCHEMA_NAME = "_dbSchemaRecordSchemaName";

export const makeDBSchemaRecord = <S extends DBSchemas>(
	schemaName: SchemaName<S>,
	values: DBSchemaValueWithoutRelations<S>,
): DBSchemaRecord<S> => {
	return {
		[DB_SCHEMA_RECORD_SCHEMA_NAME]: schemaName,
		...values,
	} as DBSchemaRecord<S>;
};
