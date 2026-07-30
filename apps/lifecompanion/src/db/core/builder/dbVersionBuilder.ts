import { getSchemaName } from "@lifecompanion/model";
import type { IDBPObjectStore, StoreNames } from "idb";
import type { DBSchema, DBSchemas } from "../types/schema";
import { VersionStoreBuilder } from "./dbVersionObjectStoreBuilder";

export class DBVersionBuilder {
	constructor(
		private transaction: IDBPObjectStore<
			DBSchema,
			ArrayLike<StoreNames<DBSchema>>,
			StoreNames<DBSchema>,
			"versionchange"
		>["transaction"],
	) {}

	public createStore<S extends DBSchemas>(schema: S): VersionStoreBuilder<S> {
		const store = this.transaction.db.createObjectStore(getSchemaName(schema), {
			keyPath: "id",
		});

		return new VersionStoreBuilder(store);
	}

	public getStore<S extends DBSchemas>(schema: S): VersionStoreBuilder<S> {
		const store = this.transaction.objectStore(getSchemaName(schema));

		return new VersionStoreBuilder(store);
	}
}
