import { computed } from "vue";
import type { BreadcrumbItem } from "vuetify/lib/components/VBreadcrumbs/VBreadcrumbs.mjs";
import { useInFocusStore } from "./../../stores/editor/useInFocusStore";
import { useActivePlayer } from "../player/useActivePlayer";

export default function () {
	const inFocusStore = useInFocusStore();

	const { createParentResolver } = useActivePlayer();
	const { page, getCellIndex } = createParentResolver(
		() => inFocusStore.current?.parent,
	);

	const items = computed<BreadcrumbItem[]>(() => {
		const items: BreadcrumbItem[] = [];
		const focused = inFocusStore.current;
		const cellIndex = focused?.cell && getCellIndex.value(focused?.cell);

		if (focused) {
			items.push(
				`${"slot" in focused.parent ? "Layout" : "Page"} - ${focused.parent.title}`,
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
}
