import type { SchemaName } from "@lifecompanion/model";
import type { DBSchemaRecord } from "../types/record";
import type { DBSchemas, DBSchemaValue } from "../types/schema";
import { isDBSchemaRecord } from "../utils/records";
import { DB_SCHEMA_RECORD_SCHEMA_NAME } from "./record";

export const makeDBValueFromDBSchemaRecord = <S extends DBSchemas>(
	dbSchemaRecord: DBSchemaRecord<S>,
): DBSchemaValue<S> => {
	const relations: Record<string, SchemaName<DBSchemas>> = {};

	const convertedEntries = Object.entries(dbSchemaRecord).map(
		([key, value]) => {
			if (key === DB_SCHEMA_RECORD_SCHEMA_NAME) return null;

			if (Array.isArray(value)) {
				const updatedArray = value.map((v) => {
					if (isDBSchemaRecord(v)) {
						relations[key] = v[DB_SCHEMA_RECORD_SCHEMA_NAME];

						return v.id;
					}

					return v;
				});

				return [key, updatedArray];
			}

			if (isDBSchemaRecord(value)) {
				relations[key] = value[DB_SCHEMA_RECORD_SCHEMA_NAME];

				return [key, value.id];
			}

			return [key, value];
		},
	);

	return {
		...Object.fromEntries(convertedEntries.filter((e) => e !== null)),
		...(Object.entries(relations).length ? { _relations: relations } : {}),
	} as DBSchemaValue<S>;
};
