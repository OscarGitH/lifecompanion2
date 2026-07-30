import type { IDBPTransaction, StoreNames } from "idb";
import type { DBSchema } from "./schema";

export interface IDBVersion {
	index: number;
	up: (
		transaction: IDBPTransaction<
			DBSchema,
			ArrayLike<StoreNames<DBSchema>>,
			"versionchange"
		>,
	) => void;
}
