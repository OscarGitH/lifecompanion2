import { getDB } from "../core/database";
import { makeDBAction } from "../core/factories/action";
import { makeDBValueFromDBSchemaRecord } from "../core/factories/dbValue";
import { DB_SCHEMA_RECORD_SCHEMA_NAME } from "../core/factories/record";
import { isDBSchemaRecord } from "../core/utils/records";

const put = makeDBAction("put", async ({ dbSchemaRecord }) => {
	const db = await getDB();
	const storeName = dbSchemaRecord[DB_SCHEMA_RECORD_SCHEMA_NAME];
	const dbValues = makeDBValueFromDBSchemaRecord(dbSchemaRecord);

	const resolveRelationPromises: Promise<unknown>[] = [];
	Object.values(dbSchemaRecord).forEach((value) => {
		if (Array.isArray(value)) {
			value
				.filter((i) => isDBSchemaRecord(i))
				.forEach((i) => {
					resolveRelationPromises.push(put({ dbSchemaRecord: i }));
				});

			return;
		}

		if (isDBSchemaRecord(value)) {
			resolveRelationPromises.push(put({ dbSchemaRecord: value }));
		}
	});

	await Promise.all(resolveRelationPromises);

	await db.put(storeName, dbValues);
});

export default put;
