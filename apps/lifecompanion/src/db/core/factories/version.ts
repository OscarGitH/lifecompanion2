import type { SchemaName } from "@lifecompanion/model";
import type { IDBPObjectStore, StoreNames } from "idb";
import { DBVersionBuilder } from "../builder/dbVersionBuilder";
import type { DBSchema, DBSchemas } from "../types/schema";

export const makeDBVersionBuilder = (
	transaction: IDBPObjectStore<
		DBSchema,
		ArrayLike<StoreNames<DBSchema>>,
		SchemaName<DBSchemas>,
		"versionchange"
	>["transaction"],
) => {
	return new DBVersionBuilder(transaction);
};
