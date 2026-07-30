import { getSchemaName } from "@lifecompanion/model";
import { isPlainObject } from "es-toolkit";
import type { Schema, SchemaRecord, SchemaRecordValues } from "../core";
import {
	SCHEMA_RECORD_SCHEMA_SYMBOL,
	SCHEMA_RECORD_VALUES_SYMBOL,
} from "../core/symbols";

// biome-ignore lint/suspicious/noExplicitAny: validate any SchemaRecord
export const isSchemaRecord = <S extends Schema = any>(
	value: unknown,
	schema?: S,
): value is SchemaRecord<S> => {
	const isSchemaRecord =
		isPlainObject(value) && SCHEMA_RECORD_SCHEMA_SYMBOL in value;

	const schemaValidation =
		!schema ||
		getSchemaName(schema) ===
			getSchemaName(getSchemaFromRecord(value as SchemaRecord<S>));

	return isSchemaRecord && schemaValidation;
};

export const getSchemaFromRecord = <S extends Schema>(
	record: SchemaRecord<S>,
): S => {
	return record[SCHEMA_RECORD_SCHEMA_SYMBOL] as S;
};

export const getSchemaRecordValues = <S extends Schema>(
	schemaRecord: SchemaRecord<S>,
): SchemaRecordValues<S> => {
	return schemaRecord[
		SCHEMA_RECORD_VALUES_SYMBOL as keyof typeof schemaRecord
	] as SchemaRecordValues<S>;
};
