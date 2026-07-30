import {
	type InjectionKey,
	inject,
	onMounted,
	onUnmounted,
	provide,
	type Ref,
	type ShallowRef,
	shallowRef,
} from "vue";
import type {
	GridRef,
	NodeRef,
} from "../../../features/player/io/interactiveElement/types";

export type GridContext = {
	readonly grids: ShallowRef<GridRef[]>;
};

const GRID_CONTEXT_KEY: InjectionKey<GridContext> = Symbol(
	"Grid context injection key",
);

export const provideGridContext = () => {
	const grids = shallowRef<GridRef[]>([]);

	const context: GridContext = {
		grids,
	};

	provide(GRID_CONTEXT_KEY, context);

	return context;
};

export const injectGridContext = () => inject(GRID_CONTEXT_KEY) as GridContext;

export const registerRefInGridContext = <T extends NodeRef>(
	ref: T,
	element: Ref<HTMLElement | undefined>,
	listRef?: T[],
) => {
	onMounted(() => {
		ref.element = element.value;
		listRef?.push(ref);
	});

	onUnmounted(() => {
		if (!listRef) return;

		const index = listRef.indexOf(ref);
		if (index !== -1) {
			listRef.splice(index, 1);
		}
	});
};
