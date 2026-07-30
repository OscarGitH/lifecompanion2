import { getDB } from "../core/database";
import { makeDBAction } from "../core/factories/action";
import expandFullDBSchemaRecord from "./utils/expandFullDBSchemaRecord";

export default makeDBAction(
	"getFromIndex",
	async ({ schemaName, index, key, includes }) => {
		const db = await getDB();

		const dbRow = await db.getFromIndex(schemaName, index, key);
		if (!dbRow) return undefined;

		return expandFullDBSchemaRecord(schemaName, dbRow, includes);
	},
);
