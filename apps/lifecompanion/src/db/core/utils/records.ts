import {
	getSchemaFromRecord,
	getSchemaName,
	getSchemaRecordValues,
	isSchemaRecord,
	makeSchemaRecord,
	SCHEMA_REGISTRY,
	type SchemaRecord,
} from "@lifecompanion/model";
import { isPlainObject } from "vuetify/lib/util/helpers.mjs";
import {
	DB_SCHEMA_RECORD_SCHEMA_NAME,
	makeDBSchemaRecord,
} from "../factories/record";
import type { DBSchemaRecord } from "../types/record";
import type { DBSchemas } from "../types/schema";

export const isDBSchemaRecord = (
	value: unknown,
): value is DBSchemaRecord<DBSchemas> => {
	return isPlainObject(value) && DB_SCHEMA_RECORD_SCHEMA_NAME in value;
};

/**
 * Convert a SchemaRecord to an LcDBSchemaRecord.
 * Used to serialize a SchemaRecord through the worker.
 */
export const schemaRecordToDBSchemaRecord = <S extends DBSchemas>(
	schemaRecord: SchemaRecord<S>,
): DBSchemaRecord<DBSchemas> => {
	const schemaRecordValues = getSchemaRecordValues(schemaRecord);
	const convertedEntries = Object.entries(schemaRecordValues).map(
		([key, value]) => {
			if (Array.isArray(value)) {
				return [
					key,
					value.map((v) =>
						isSchemaRecord(v) ? schemaRecordToDBSchemaRecord(v) : v,
					),
				];
			}

			if (isSchemaRecord(value)) {
				return [key, schemaRecordToDBSchemaRecord(value)];
			}

			return [key, value];
		},
	);

	return makeDBSchemaRecord(
		getSchemaName(getSchemaFromRecord(schemaRecord)),
		Object.fromEntries(convertedEntries),
	);
};

/**
 * Convert an LcDBSchemaRecord to a SchemaRecord.
 * Used to deserialize a SchemaRecord from the worker.
 */
export const dBSchemaRecordToSchemaRecord = <S extends DBSchemas>(
	dBSchemaRecord: DBSchemaRecord<S>,
): SchemaRecord<S> => {
	const schema = SCHEMA_REGISTRY[dBSchemaRecord[DB_SCHEMA_RECORD_SCHEMA_NAME]];

	if (!schema) {
		throw new Error(
			`Schema '${dBSchemaRecord[DB_SCHEMA_RECORD_SCHEMA_NAME]}' not found in registry.`,
		);
	}

	const restoredEntries = Object.entries(dBSchemaRecord).map(([key, value]) => {
		if (key === DB_SCHEMA_RECORD_SCHEMA_NAME) return null;

		if (Array.isArray(value)) {
			const updatedArray = value.map((v) => {
				return isDBSchemaRecord(v) ? dBSchemaRecordToSchemaRecord(v) : v;
			});

			return [key, updatedArray];
		}

		if (isDBSchemaRecord(value)) {
			return [key, dBSchemaRecordToSchemaRecord(value)];
		}

		return [key, value];
	});

	const cleanValues = Object.fromEntries(
		restoredEntries.filter((e) => e !== null),
	);

	return makeSchemaRecord(schema as unknown as S, cleanValues);
};
