import type {
	LcAction,
	LcActionPaginate,
	LcConfigSchema,
	LcGridSchema,
	LcLayoutSchema,
	LcNavigationDirection,
	LcPageGroupSchema,
	LcPageSchema,
	LcRoute,
	SchemaRecord,
} from "@lifecompanion/model";
import { isEqual, minBy } from "es-toolkit";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getAvailableCellsInParent } from "../../utils/player/grid";

const MAX_HISTORY_SIZE = 30;

export interface LayoutStackItem {
	layout: SchemaRecord<LcLayoutSchema>;
	page: number;
}

export const usePlayerStore = defineStore("player", () => {
	const config = ref<SchemaRecord<LcConfigSchema> | null>(null);
	const route = ref<LcRoute | null>(null);
	const history = ref<LcRoute[]>([]);
	const layoutPagination = ref<Record<string, number>>({});

	const activePageGroup = computed(
		(): SchemaRecord<LcPageGroupSchema> | null => {
			if (!config.value || !route.value?.pageGroupId) {
				return null;
			}

			return (
				config.value.pageGroups?.find(
					(pg) => pg.id === route.value?.pageGroupId,
				) ?? null
			);
		},
	);

	const activePage = computed((): SchemaRecord<LcPageSchema> | null => {
		if (!activePageGroup.value || !route.value?.pageId) {
			return null;
		}

		return (
			activePageGroup.value.pages?.find((p) => p.id === route.value?.pageId) ??
			null
		);
	});

	const activeLayoutStack = computed(() => {
		const getStack = (
			layout: SchemaRecord<LcLayoutSchema> | undefined,
		): LayoutStackItem[] =>
			layout
				? [
						...getStack(layout.extends),
						{ layout, page: getLayoutPageIndex(layout.id) },
					]
				: [];

		return getStack(activePageGroup.value?.layout);
	});

	const activeContext = computed(() => {
		return activePageGroup.value && activePage.value
			? {
					pageGroup: activePageGroup.value,
					page: activePage.value,
					layoutStack: activeLayoutStack.value,
					pageIndex: route.value?.pageIndex,
				}
			: null;
	});

	const canGoBack = computed(() => history.value.length);

	const init = (newConfig: SchemaRecord<LcConfigSchema>) => {
		config.value = newConfig;

		const startGroup = minBy(newConfig.pageGroups ?? [], (pg) => pg.index);
		const startPage = startGroup
			? minBy(startGroup.pages ?? [], (p) => p.index)
			: null;

		const initialRoute: LcRoute | null =
			startGroup && startPage
				? { pageGroupId: startGroup.id, pageId: startPage.id }
				: null;

		route.value = initialRoute;
		history.value = initialRoute ? [initialRoute] : [];
	};

	const reset = () => {
		config.value = null;
		route.value = null;
		history.value = [];
		layoutPagination.value = {};
	};

	const triggerAction = (action?: LcAction | undefined) => {
		if (!action) return;

		switch (action.kind) {
			case "navigation":
				navigateTo(action.to);
				break;
			case "pagination":
				paginate(action);
				break;
			case "history":
				navigateHistory(action.direction);
				break;
		}
	};

	const pushHistory = (route: LcRoute) => {
		history.value.push({ ...route });

		if (history.value.length > MAX_HISTORY_SIZE) {
			history.value.shift();
		}
	};

	const navigateTo = (newRoute: LcRoute) => {
		const pageGroupId =
			newRoute.pageGroupId || activeContext.value?.pageGroup.id;
		const pageIndex = newRoute.pageIndex || 0;

		newRoute = {
			...newRoute,
			...(pageGroupId && { pageGroupId }),
			pageIndex,
		};

		if (!isEqual(route.value, newRoute)) {
			if (route.value) pushHistory(route.value);
			route.value = newRoute;
		}
	};

	const paginate = (action: LcActionPaginate) => {
		const direction = action.direction === "next" ? 1 : -1;

		const getNextIndex = (current: number, total: number): number => {
			const max = Math.max(0, total - 1);
			const next = current + direction;
			return next < 0 ? max : next > max ? 0 : next;
		};

		const getParentVirtualPages = (
			parent: SchemaRecord<LcLayoutSchema | LcPageSchema>,
			grid: SchemaRecord<LcGridSchema>,
		): number => {
			const maxIndex = Math.max(
				parent.contents?.length || 0,
				...(parent.contents?.map((c) => c.index || 0) || []),
			);

			return (
				Math.ceil(maxIndex / getAvailableCellsInParent(parent, grid).length) ||
				1
			);
		};
		if (action.layoutId) {
			const layout = activeLayoutStack.value?.find(
				(ls) => ls.layout.id === action.layoutId,
			)?.layout;

			if (!layout || !layout.grid) return;

			layoutPagination.value[action.layoutId] = getNextIndex(
				getLayoutPageIndex(action.layoutId),
				getParentVirtualPages(layout, layout.grid),
			);
			return;
		}

		if (!activeContext.value || !activeContext.value.pageGroup.grid) return;

		navigateTo({
			...(route.value
				? route.value
				: {
						pagesGroupId: activeContext.value.pageGroup.id,
						pageId: activeContext.value.page.id,
					}),
			pageIndex: getNextIndex(
				activeContext.value.pageIndex ?? 0,
				getParentVirtualPages(
					activeContext.value.page,
					activeContext.value.pageGroup.grid,
				),
			),
		});
	};

	const navigateHistory = (direction: LcNavigationDirection) => {
		if (direction === "previous" && canGoBack.value) {
			const previousRoute = history.value.pop();
			if (previousRoute) {
				route.value = previousRoute;
			}
		}
		// todo: handle next in history without pop
	};

	const getLayoutPageIndex = (layoutId: string) => {
		return layoutPagination.value[layoutId] ?? 0;
	};

	return {
		activeContext,
		config,
		route,
		canGoBack,
		init,
		reset,
		triggerAction,
	};
});
