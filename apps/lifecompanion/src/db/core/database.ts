import { deleteDB as deleteIDB, type IDBPDatabase, openDB } from "idb";
import type { DBSchema } from "./types/schema";
import { DB_VERSION, versions } from "./versions";

export const DB_NAME = "lifecompanion";

let db: IDBPDatabase<DBSchema> | null = null;

export const getDB = async () => {
	if (db) return db;

	db = await openDB<DBSchema>(DB_NAME, DB_VERSION, {
		upgrade(_db, oldVersion, _newVersion, transaction) {
			for (const version of versions) {
				if (version.index > oldVersion) {
					version.up(transaction);
				}
			}
		},
	});

	return db;
};

export const deleteDB = async () => {
	if (db) {
		db.close();
		db = null;
	}

	deleteIDB(DB_NAME);
};
