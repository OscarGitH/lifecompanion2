import { computed } from "vue";
import type { BreadcrumbItem } from "vuetify/lib/components/VBreadcrumbs/VBreadcrumbs.mjs";
import { useInFocusStore } from "./../../stores/editor/useInFocusStore";
import { useActivePlayer } from "../player/useActivePlayer";

const useInFocusBreadcrumb = () => {
	const inFocusStore = useInFocusStore();

	const { createParentResolver } = useActivePlayer();
	const { page, getCellIndex } = createParentResolver(
		() => inFocusStore.parent,
	);

	const items = computed<BreadcrumbItem[]>(() => {
		const items: BreadcrumbItem[] = [];
		const cellIndex =
			inFocusStore.firstCell && getCellIndex.value(inFocusStore.firstCell);

		if (inFocusStore.parent) {
			items.push(
				`${"slot" in inFocusStore.parent ? "Layout" : "Page"} - ${inFocusStore.parent.title}`,
			);
		}

		if (page.value.total > 1) {
			items.push(
				`Pagination - ${(page.value.current || 0) + 1} sur ${page.value.total}`,
			);
		}

		if (cellIndex != null) {
			items.push({ title: `Case - ${cellIndex + 1}`, disabled: false });
		}

		return items;
	});

	return { items };
};

export default useInFocusBreadcrumb;
