import v1 from "./version1_20260611";

export const versions = [v1];

export const DB_VERSION =
	versions.length > 0 ? Math.max(...versions.map((m) => m.index)) : 0;
