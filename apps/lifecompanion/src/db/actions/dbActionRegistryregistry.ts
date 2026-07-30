import type {
	SchemaName,
	SchemaRecordAvailableInclusions,
} from "@lifecompanion/model";
import type { IndexKey, IndexNames, StoreKey } from "idb";
import type { DBSchemaRecord } from "../core/types/record";
import type { DBSchema, DBSchemas } from "../core/types/schema";
import deleteDB from "./deleteDB";
import get from "./get";
import getFromIndex from "./getFromIndex";
import put from "./put";

export type DBActionRegistry<P> = {
	deleteDB: () => Promise<void>;
	get: <S extends DBSchemas, N extends SchemaName<S>>(
		payload: P & {
			schemaName: N;
			id: StoreKey<DBSchema, N> | IDBKeyRange;
			includes?: SchemaRecordAvailableInclusions<S>[];
		},
	) => Promise<DBSchemaRecord<S> | undefined>;
	getFromIndex: <
		S extends DBSchemas,
		N extends SchemaName<S>,
		I extends IndexNames<DBSchema, N>,
	>(
		payload: P & {
			schemaName: N;
			index: I;
			key: IndexKey<DBSchema, N, I>;
			includes?: SchemaRecordAvailableInclusions<S>[];
		},
	) => Promise<DBSchemaRecord<S> | undefined>;
	put: <S extends DBSchemas>(
		payload: P & { dbSchemaRecord: DBSchemaRecord<S> },
	) => Promise<void>;
};

export default {
	deleteDB,
	get,
	getFromIndex,
	put,
};
