import {
	lcCellContentSchema,
	lcCellSchema,
	lcConfigSchema,
	lcGridSchema,
	lcLayoutSchema,
	lcPageGroupSchema,
	lcPageSchema,
} from "@lifecompanion/model";
import { makeDBVersionBuilder } from "../factories/version";
import type { IDBVersion } from "../types/version";

export default {
	index: 1,
	up: (transaction) => {
		const builder = makeDBVersionBuilder(transaction);

		builder.createStore(lcConfigSchema).addHasMany(["layouts", "pageGroups"]);

		builder
			.createStore(lcLayoutSchema)
			.addBelongsTo(["extends", "grid", "slot"])
			.addHasMany("contents");

		builder
			.createStore(lcPageGroupSchema)
			.addBelongsTo(["grid", "layout"])
			.addHasMany("pages");

		builder.createStore(lcGridSchema).addHasMany("cells");

		builder.createStore(lcPageSchema).addHasMany("contents");

		builder.createStore(lcCellSchema).addBelongsTo("lockedContent");

		builder.createStore(lcCellContentSchema);
	},
} satisfies IDBVersion;
