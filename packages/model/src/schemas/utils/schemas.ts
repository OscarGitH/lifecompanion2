import type { Schema, SchemaName } from "../core";
import { SCHEMA_NAME_SYMBOL } from "../core/symbols";

export const getSchemaName = <S extends Schema>(schema: S): SchemaName<S> => {
	return schema[SCHEMA_NAME_SYMBOL];
};
