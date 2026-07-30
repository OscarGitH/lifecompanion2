import type { SchemaName } from "@lifecompanion/model";
import { getDB } from "../../core/database";
import type { DBSchemas } from "../../core/types/schema";

const getDBRow = async (
	schemaName: SchemaName<DBSchemas>,
	id: string | IDBKeyRange,
) => {
	return (await getDB()).get(schemaName, id);
};

export default getDBRow;
