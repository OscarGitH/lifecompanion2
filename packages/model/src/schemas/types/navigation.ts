export type LcNavigationDirection = "previous" | "next";

export interface LcRoute {
	pageId: string;
	pageGroupId?: string | null;
	pageIndex?: number;
}
