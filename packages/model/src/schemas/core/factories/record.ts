import { isPlainObject } from "es-toolkit";
import { SCHEMA_REGISTRY } from "../../registry";
import {
	isBelongsToRelation,
	isHasManyRelation,
	isRelation,
} from "../../utils";
import {
	RELATION_SCHEMA_SYMBOL,
	SCHEMA_RECORD_SCHEMA_SYMBOL,
	SCHEMA_RECORD_VALUES_SYMBOL,
} from "../symbols";
import type {
	Relation,
	Schema,
	SchemaRecord,
	SchemaRecordValues,
} from "../types";

export const makeSchemaRecord = <S extends Schema>(
	schema: S,
	values: SchemaRecordValues<S>,
): SchemaRecord<S> => {
	return new Proxy(
		{
			[SCHEMA_RECORD_SCHEMA_SYMBOL]: schema,
			[SCHEMA_RECORD_VALUES_SYMBOL]: { ...values },
		},
		{
			get: (record, key) => {
				if (key in record[SCHEMA_RECORD_VALUES_SYMBOL]) {
					return record[SCHEMA_RECORD_VALUES_SYMBOL][
						key as keyof typeof values
					];
				}

				return key in record ? record[key as keyof typeof record] : undefined;
			},
			set: (record, key, value) => {
				record[SCHEMA_RECORD_VALUES_SYMBOL][key as keyof typeof values] = value;

				return true;
			},
		},
	) as unknown as SchemaRecord<S>;
};

export const makeUnsafehemaRecord = async <S extends Schema>(
	schema: S,
	values: Record<string, unknown> & { id: string },
	cache = new Map<string, Record<string, unknown>>(),
): Promise<SchemaRecord<S>> => {
	const id = values.id;

	if (cache.has(id)) {
		return cache.get(id) as SchemaRecord<S>;
	}

	const relations: Array<{
		key: string;
		relation: Relation<unknown>;
	}> = [];

	for (const [key, entry] of Object.entries(schema)) {
		if (key in values && isRelation(entry)) {
			relations.push({ key, relation: entry });
		}
	}

	const baseValues = Object.fromEntries(
		Object.entries(values).filter(
			([key]) => !relations.some((r) => r.key === key),
		),
	);

	const record = makeSchemaRecord(
		schema,
		baseValues as SchemaRecordValues<S>,
	) as Record<string, unknown>;

	cache.set(id, record);

	for (const { key, relation } of relations) {
		const schemaName = relation[RELATION_SCHEMA_SYMBOL];

		if (!(schemaName in SCHEMA_REGISTRY)) {
			continue;
		}

		const targetSchema =
			SCHEMA_REGISTRY[schemaName as keyof typeof SCHEMA_REGISTRY];

		if (!targetSchema) {
			continue;
		}

		if (isHasManyRelation(relation) && Array.isArray(values[key])) {
			record[key] = await Promise.all(
				values[key].map((v) => makeUnsafehemaRecord(targetSchema, v, cache)),
			);

			continue;
		}

		if (
			isBelongsToRelation(relation) &&
			isPlainObject(values[key]) &&
			typeof values[key].id === "string"
		) {
			record[key] = await makeUnsafehemaRecord(
				targetSchema,
				values[key] as Record<string, unknown> & { id: string },
				cache,
			);
		}
	}

	return record as SchemaRecord<S>;
};
