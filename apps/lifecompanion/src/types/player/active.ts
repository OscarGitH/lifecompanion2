import type {
	LcLayoutSchema,
	LcPageGroupSchema,
	LcPageSchema,
	SchemaRecord,
} from "@lifecompanion/model";
import type { Pagination } from "../shared/pagination";

export type LcLayoutStackItem = {
	layout: SchemaRecord<LcLayoutSchema>;
	pagination: Pagination;
};

export type LcActivePlayer = {
	pageGroup: SchemaRecord<LcPageGroupSchema>;
	page: SchemaRecord<LcPageSchema>;
	layoutStack: LcLayoutStackItem[];
	pagination: Pagination;
};
