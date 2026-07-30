import {
	getSchemaName,
	type SchemaName,
	type SchemaRecord,
	type SchemaRecordAvailableInclusions,
} from "@lifecompanion/model";
import type { IndexKey, IndexNames } from "idb";
import { sendToDBWorker } from "./core/client";
import type { DBSchemaRecord } from "./core/types/record";
import type { DBSchema, DBSchemas } from "./core/types/schema";
import {
	dBSchemaRecordToSchemaRecord,
	schemaRecordToDBSchemaRecord,
} from "./core/utils/records";

export default {
	deleteDB: () => sendToDBWorker("deleteDB"),
	get: async <S extends DBSchemas>(
		schema: S,
		id: string,
		includes?: SchemaRecordAvailableInclusions<S>[],
	): Promise<SchemaRecord<S> | undefined> => {
		const dbSchemaRecord = (await sendToDBWorker("get", {
			schemaName: getSchemaName(schema),
			id,
			includes,
		})) as DBSchemaRecord<S> | undefined;

		return dbSchemaRecord
			? dBSchemaRecordToSchemaRecord(dbSchemaRecord)
			: undefined;
	},
	getFromIndex: async <
		S extends DBSchemas,
		I extends IndexNames<DBSchema, SchemaName<S>>,
	>(
		schema: S,
		index: I,
		key: IndexKey<DBSchema, SchemaName<S>, I>,
		includes?: SchemaRecordAvailableInclusions<S>[],
	) => {
		const dbSchemaRecord = (await sendToDBWorker("getFromIndex", {
			schemaName: getSchemaName(schema),
			index,
			key,
			includes,
		})) as DBSchemaRecord<S> | undefined;

		return dbSchemaRecord
			? dBSchemaRecordToSchemaRecord(dbSchemaRecord)
			: undefined;
	},
	put: (schemaRecord: SchemaRecord<DBSchemas>) =>
		sendToDBWorker("put", {
			dbSchemaRecord: schemaRecordToDBSchemaRecord(schemaRecord),
		}),
};
