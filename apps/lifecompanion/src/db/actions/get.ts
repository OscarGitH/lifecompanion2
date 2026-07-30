import { makeDBAction } from "../core/factories/action";
import expandFullDBSchemaRecord from "./utils/expandFullDBSchemaRecord";
import getDBRow from "./utils/getDBRow";

const get = makeDBAction("get", async ({ schemaName, id, includes }) => {
	const dbRow = await getDBRow(schemaName, id);
	if (!dbRow) return undefined;

	return await expandFullDBSchemaRecord(schemaName, dbRow, includes);
});

export default get;
