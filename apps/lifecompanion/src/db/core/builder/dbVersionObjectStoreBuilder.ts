import type {
	BelongsTo,
	HasMany,
	KeyOfRelation,
	Relation,
	Schema,
	SchemaName,
} from "@lifecompanion/model";
import type { IDBPObjectStore, StoreNames } from "idb";
import type { ArrayOrSingle } from "ts-essentials";
import type { DBSchema, DBSchemas } from "../types/schema";

type IndexKey<S extends DBSchemas, R extends Relation<unknown>> = KeyOfRelation<
	S,
	R
> &
	keyof DBSchema[SchemaName<S>]["indexes"] &
	string;

export class VersionStoreBuilder<S extends DBSchemas> {
	constructor(
		public readonly objectStore: IDBPObjectStore<
			DBSchema,
			ArrayLike<StoreNames<DBSchema>>,
			SchemaName<S>,
			"versionchange"
		>,
	) {}

	public addBelongsTo(
		keyOrKeys: ArrayOrSingle<IndexKey<S, BelongsTo<Schema>>>,
	): this {
		([] as IndexKey<S, BelongsTo<Schema>>[])
			.concat(keyOrKeys)
			.forEach((key) => {
				if (!this.objectStore.indexNames.contains(key)) {
					this.objectStore.createIndex(key, key);
				}
			});

		return this;
	}

	public addHasMany(
		keyOrKeys: ArrayOrSingle<IndexKey<S, HasMany<Schema>>>,
	): this {
		([] as IndexKey<S, HasMany<Schema>>[]).concat(keyOrKeys).forEach((key) => {
			if (!this.objectStore.indexNames.contains(key)) {
				this.objectStore.createIndex(key, key, { multiEntry: true });
			}
		});

		return this;
	}
}
