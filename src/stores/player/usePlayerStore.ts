import type {
	LcAction,
	LcActionPaginate,
	LcConfig,
	LcGrid,
	LcLayout,
	LcNavigationDirection,
	LcPage,
	LcPagesGroup,
	LcRoute,
} from "@lifecompanion/model";
import { isEqual, minBy } from "es-toolkit";
import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getAvailableCellsInParent } from "../../utils/player/grid";

const MAX_HISTORY_SIZE = 30;

export interface LayoutStackItem {
	layout: LcLayout;
	page: number;
}

export const usePlayerStore = defineStore("player", () => {
	const config = ref<LcConfig | null>(null);
	const route = ref<LcRoute | null>(null);
	const history = ref<LcRoute[]>([]);
	const layoutPagination = ref<Record<string, number>>({});

	const activeGroup = computed((): LcPagesGroup | null => {
		if (!config.value || !route.value?.pagesGroupId) {
			return null;
		}

		return (
			config.value.pagesGroups.find(
				(pg) => pg.id === route.value?.pagesGroupId,
			) ?? null
		);
	});

	const activePage = computed((): LcPage | null => {
		if (!activeGroup.value || !route.value?.pageId) {
			return null;
		}

		return (
			activeGroup.value.pages.find((p) => p.id === route.value?.pageId) ?? null
		);
	});

	const activeLayoutStack = computed(() => {
		const getStack = (layout: LcLayout | null): LayoutStackItem[] =>
			layout
				? [
						...getStack(layout.extends),
						{ layout, page: getLayoutPageIndex(layout.id) },
					]
				: [];

		return getStack(activeGroup.value?.layout ?? null);
	});

	const activeContext = computed(() => {
		return activeGroup.value && activePage.value
			? {
					group: activeGroup.value,
					page: activePage.value,
					layoutStack: activeLayoutStack.value,
					pageIndex: route.value?.pageIndex,
				}
			: null;
	});

	const canGoBack = computed(() => history.value.length);

	function init(newConfig: LcConfig) {
		config.value = newConfig;

		const startGroup = minBy(newConfig.pagesGroups, (pg) => pg.index);
		const startPage = startGroup
			? minBy(startGroup.pages, (p) => p.index)
			: null;

		const initialRoute: LcRoute | null =
			startGroup && startPage
				? { pagesGroupId: startGroup.id, pageId: startPage.id }
				: null;

		route.value = initialRoute;
		history.value = initialRoute ? [initialRoute] : [];
	}

	function reset() {
		config.value = null;
		route.value = null;
		history.value = [];
		layoutPagination.value = {};
	}

	function triggerAction(action?: LcAction | undefined) {
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
	}

	function pushHistory(route: LcRoute) {
		history.value.push({ ...route });

		if (history.value.length > MAX_HISTORY_SIZE) {
			history.value.shift();
		}
	}

	function navigateTo(newRoute: LcRoute) {
		const pageGroupId = newRoute.pagesGroupId || activeContext.value?.group.id;
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
	}

	function paginate(action: LcActionPaginate) {
		const direction = action.direction === "next" ? 1 : -1;

		const getNextIndex = (current: number, total: number): number => {
			const max = Math.max(0, total - 1);
			const next = current + direction;
			return next < 0 ? max : next > max ? 0 : next;
		};

		const getParentVirtualPages = (
			parent: LcLayout | LcPage,
			grid: LcGrid,
		): number => {
			const maxIndex = Math.max(
				parent.contents.length,
				...parent.contents.map((c) => c.index || 0),
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

			if (!layout) return;

			layoutPagination.value[action.layoutId] = getNextIndex(
				getLayoutPageIndex(action.layoutId),
				getParentVirtualPages(layout, layout.grid),
			);
			return;
		}

		if (!activeContext.value) return;

		navigateTo({
			...(route.value
				? route.value
				: {
						pagesGroupId: activeContext.value.group.id,
						pageId: activeContext.value.page.id,
					}),
			pageIndex: getNextIndex(
				activeContext.value.pageIndex ?? 0,
				getParentVirtualPages(
					activeContext.value.page,
					activeContext.value.group.grid,
				),
			),
		});
	}

	function navigateHistory(direction: LcNavigationDirection) {
		if (direction === "previous" && canGoBack.value) {
			const previousRoute = history.value.pop();
			if (previousRoute) {
				route.value = previousRoute;
			}
		}
		// todo: handle next in history without pop
	}

	function getLayoutPageIndex(layoutId: string) {
		return layoutPagination.value[layoutId] ?? 0;
	}

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
