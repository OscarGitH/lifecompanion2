<script setup lang="ts">
import { v4 as uuidV4 } from "uuid";
import { computed, onUnmounted, ref, shallowRef, watch } from "vue";
import { injectGridContext } from "../../../../composables/player/grid/grid";
import useInputDevices from "../../../../composables/player/io/useInputDevices";
import { HOVER_TRANSITION_DURATION } from "../../../../composables/player/visualEffect/constants";
import useVisualProgress from "../../../../composables/player/visualEffect/useVisualProgress";
import type {
	ActivateStyle,
	BlockRef,
	CellRef,
	GridRef,
	HoverStyle,
} from "../../../../features/player/io/interactiveElement/types";
import type {
	SelectionModeContext,
	SelectionModeOptions,
	SelectionModeProps,
} from "../../../../features/player/io/selection/types";
import { sortElementByAxis } from "../../../../features/shared/grid/sortElementByAxis";
import LcVisualBorder from "../../visualEffect/LcVisualBorder.vue";
import LcVisualProgress from "../../visualEffect/LcVisualProgress.vue";

export type ScanSelectionLevel = "cell" | "block" | "grid";
export type ScanAxis = {
	axis: "x" | "y";
	reverseX: boolean;
	reverseY: boolean;
};

export type ScanSelectionModeOptions = SelectionModeOptions & {
	autoStart: boolean;
	delayByElement: number;
	level: ScanSelectionLevel;
	axis: ScanAxis;
};

type ScanSelectionModeProps = SelectionModeProps<ScanSelectionModeOptions>;

const MAX_LOOP_SCAN = 3 as const;

const props = defineProps<ScanSelectionModeProps>();

const currentHover = shallowRef<CellRef | BlockRef | GridRef>();
const activeStyle = ref<ActivateStyle | null>(null);
const frame = ref({
	top: 0,
	left: 0,
	width: 0,
	height: 0,
});

const autoStart = ref(props.options.autoStart);
let animationFrame = 0;

const gridContext = injectGridContext();
const { startProgress, stopProgress, resetProgress, visualProgressProps } =
	useVisualProgress(computed(() => props.options.hoverStyle.progress ?? null));

const styleOverwrite = <S extends HoverStyle | ActivateStyle>(style: S) => {
	const nextStyle = structuredClone(style);

	delete nextStyle.borderColor;

	return nextStyle;
};

const scanSelectionModeContext = shallowRef<SelectionModeContext>({
	id: uuidV4(),
	hoverStyleOverwrite: styleOverwrite,
	activateStyleOverwrite: styleOverwrite,
});

const styles = computed(() => ({
	transition: `all ${HOVER_TRANSITION_DURATION}ms linear`,
	top: `${frame.value.top}px`,
	left: `${frame.value.left}px`,
	width: `${frame.value.width}px`,
	height: `${frame.value.height}px`,
}));

const hoverStyle = computed(() => {
	if (currentHover.value) {
		return props.options.hoverStyle;
	}

	return null;
});

const updateRect = () => {
	const element = currentHover.value?.element;

	if (!element) return;

	const newRect = element.getBoundingClientRect();

	frame.value = {
		top: newRect.top,
		left: newRect.left,
		width: newRect.width,
		height: newRect.height,
	};

	animationFrame = requestAnimationFrame(updateRect);
};

const onLeaveCurrent = () => {
	resetProgress();

	currentHover.value?.interactive?.onLeave?.(scanSelectionModeContext.value);
	currentHover.value = undefined;
};

const onHoverElement = (
	elementRef: CellRef | BlockRef | GridRef | undefined,
) => {
	onLeaveCurrent();

	currentHover.value = elementRef;

	currentHover.value?.interactive?.onEnter?.(scanSelectionModeContext.value, {
		...props.options.hoverStyle,
		borderColor: undefined,
	});
};

const scanList = async <T extends CellRef[] | BlockRef[] | GridRef[]>(
	list: T,
) => {
	if (list.length === 0) {
		await restartScan();
		return;
	}

	if (list.length === 1) {
		onLeaveCurrent();

		currentHover.value = list[0];

		updateRect();

		await activate();
		return;
	}

	const sortList = sortElementByAxis(list, props.options.axis);

	let loop = 0;
	let index = 0;

	while (loop < MAX_LOOP_SCAN) {
		onHoverElement(sortList[index]);

		const completed = await startProgress(props.options.delayByElement);

		if (!completed) {
			return;
		}

		if (index === sortList.length - 1) {
			loop++;
			index = 0;
		} else {
			index++;
		}
	}

	await restartScan();
};

const restartScan = async () => {
	if (autoStart.value) {
		onLeaveCurrent();

		let refList: CellRef[] | BlockRef[] | GridRef[];

		switch (props.options.level) {
			case "grid":
				refList = gridContext.grids.value;
				break;
			case "block":
				refList = gridContext.grids.value.flatMap((grid) => grid.blocks);
				break;
			case "cell":
				refList = gridContext.grids.value.flatMap((grid) =>
					grid.blocks.flatMap((block) => block.cells),
				);
				break;
		}

		if (refList && refList.length > 0) {
			await scanList(refList);
		}
	}
};

const activate = async () => {
	if (!autoStart.value) {
		autoStart.value = true;
		restartScan();
	} else {
		activeStyle.value = props.options.activateStyle;

		await currentHover.value?.interactive?.onActivate?.(
			scanSelectionModeContext.value,
			{
				...props.options.activateStyle,
				borderColor: undefined,
			},
		);

		if (currentHover.value?.type === "grid") {
			const newParent = currentHover.value;
			onLeaveCurrent();

			scanList(newParent.blocks);
		} else if (currentHover.value?.type === "block") {
			const newParent = currentHover.value;
			onLeaveCurrent();

			scanList(newParent.cells);
		} else {
			autoStart.value = props.options.autoStart;
			onLeaveCurrent();
			restartScan();
		}

		activeStyle.value = null;
	}
};

useInputDevices(
	computed(() => props.options.devices),
	{
		press: () => {
			if (autoStart.value) {
				activeStyle.value = props.options.activateStyle;
				stopProgress();

				currentHover.value?.interactive?.onPress?.(
					scanSelectionModeContext.value,
					{
						...props.options.activateStyle,
						borderColor: undefined,
					},
				);
			}
		},
		activate: async () => {
			await activate();
		},
		release: () => {
			currentHover.value?.interactive?.onRelease?.(
				scanSelectionModeContext.value,
			);
		},
	},
);

watch(gridContext.grids, restartScan, {
	immediate: true,
	deep: true,
});

watch(currentHover, () => {
	cancelAnimationFrame(animationFrame);

	if (currentHover.value) {
		updateRect();
	}
});

onUnmounted(() => {
	cancelAnimationFrame(animationFrame);
	onLeaveCurrent();
});
</script>

<template>
	<div v-if="autoStart" :style="{...styles}" class="scan">
		<LcVisualProgress
			v-if="visualProgressProps?.value"
			:visualProgressProps="visualProgressProps"
			:scan-axis="props.options.axis"
		/>

		<LcVisualBorder
			v-if="hoverStyle || activeStyle"
			:hoverStyle="hoverStyle"
			:activeStyle="activeStyle"
		/>
	</div>
</template>

<style scoped>
.scan {
	position: fixed;
	z-index: 4;
	pointer-events: none;
}
</style>
