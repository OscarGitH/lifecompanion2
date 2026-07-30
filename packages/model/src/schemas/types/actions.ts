import type { LcNavigationDirection, LcRoute } from "./navigation";

export type LcActionKind = "pagination" | "navigation" | "history";
export type LcAction = LcActionPaginate | LcActionNavigate | LcActionHistory;

export interface LcActionPaginate {
	kind: "pagination";
	direction: LcNavigationDirection;
	layoutId?: string;
}

export interface LcActionNavigate {
	kind: "navigation";
	to: LcRoute;
}

export interface LcActionHistory {
	kind: "history";
	direction: LcNavigationDirection;
}
