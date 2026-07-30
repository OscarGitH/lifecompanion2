import type {
	SchemaName,
	SchemaRecordAvailableInclusions,
} from "@lifecompanion/model";
import type { ArrayOrSingle } from "ts-essentials";
import { SCHEMA_REGISTRY } from "../../../../../../packages/model/src/schemas/registry";
import { makeDBSchemaRecord } from "../../core/factories/record";
import type { DBSchemaRecord } from "../../core/types/record";
import type {
	DBSchemas,
	DBSchemaValue,
	DBSchemaValueWithoutRelations,
} from "../../core/types/schema";
import getDBRow from "./getDBRow";

/**
 * Get a recursive DB schema record (with inclusions) from a single DB value.
 */
const expandFullDBSchemaRecord = async <S extends DBSchemas>(
	schemaName: SchemaName<S>,
	dbValue: DBSchemaValue<S>,
	includes?: SchemaRecordAvailableInclusions<S>[],
): Promise<DBSchemaRecord<S>> => {
	let relationMap: Record<string, SchemaName<DBSchemas>> = {};
	if ("_relations" in dbValue) {
		relationMap = dbValue._relations;
		delete dbValue._relations;
	}

	const dbSchemaRecordMinimalImplementation = Object.fromEntries(
		Object.entries(dbValue).filter(
			([key]) => !(relationMap && key in relationMap),
		),
	) as DBSchemaValueWithoutRelations<DBSchemas>;

	const lcDBSchemaRecord = makeDBSchemaRecord(
		schemaName,
		dbSchemaRecordMinimalImplementation,
	);

	const dbSchemaRecordRelations: Record<
		string,
		ArrayOrSingle<DBSchemaRecord<DBSchemas> | undefined>
	> = {};

	if (relationMap && includes && includes.length > 0) {
		for (const [key, targetSchemaName] of Object.entries(relationMap)) {
			const targetSchema = SCHEMA_REGISTRY[targetSchemaName];
			const relevantIncludes = includes.filter(
				(inc) => inc === key || String(inc).startsWith(`${key}.`),
			);

			if (relevantIncludes.length === 0) continue;

			const nextIncludes = relevantIncludes
				.map((inc) => String(inc).slice(key.length + 1))
				.filter((inc) => inc.length > 0) as SchemaRecordAvailableInclusions<
				typeof targetSchema
			>;

			const relationIdOrIds = dbValue[key as keyof typeof dbValue] as
				| string[]
				| string;

			if (Array.isArray(relationIdOrIds)) {
				const records = await Promise.all(
					relationIdOrIds.map(async (relationId) => {
						const dbRow = await getDBRow(targetSchemaName, relationId);
						if (!dbRow) return undefined;

						return await expandFullDBSchemaRecord(
							targetSchemaName,
							dbRow,
							nextIncludes,
						);
					}),
				);

				dbSchemaRecordRelations[key] = records.filter(Boolean);
				continue;
			}

			if (relationIdOrIds) {
				const dbRow = await getDBRow(targetSchemaName, relationIdOrIds);

				if (dbRow) {
					dbSchemaRecordRelations[key] = await expandFullDBSchemaRecord(
						targetSchemaName,
						dbRow,
						nextIncludes,
					);
				}
			}
		}
	}

	return {
		...lcDBSchemaRecord,
		...dbSchemaRecordRelations,
	} as DBSchemaRecord<S>;
};

export default expandFullDBSchemaRecord;
