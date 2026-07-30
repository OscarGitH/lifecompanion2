<script setup lang="ts">
import { v4 as uuidV4 } from "uuid";
import { computed, onUnmounted, ref, shallowRef } from "vue";
import { injectGridContext } from "../../../../composables/player/grid/grid";
import useInputDevices from "../../../../composables/player/io/useInputDevices";
import useVisualProgress from "../../../../composables/player/visualEffect/useVisualProgress";
import findCellAtPosition from "../../../../features/player/io/interactiveElement/findCellAtPosition";
import type { CellRef } from "../../../../features/player/io/interactiveElement/types";
import type {
	SelectionModeContext,
	SelectionModeOptions,
	SelectionModeProps,
} from "../../../../features/player/io/selection/types";
import type { Position2D } from "../../../../utils/shared/geometry/types";
import type { HexColor } from "../../../../utils/shared/style/types";
import LcVisualCursor from "../cursor/LcVisualCursor.vue";

export type CursorStyle = {
	width: number;
	height: number;
	borderRadius: number;
	background: HexColor;
};

export type PointerSelectionModeOptions = SelectionModeOptions & {
	autoActivation: boolean;
	autoActivationDelay: number;
	cursorStyle: CursorStyle;
};

type PointerSelectionModeProps =
	SelectionModeProps<PointerSelectionModeOptions>;

const gridContext = injectGridContext();

const props = defineProps<PointerSelectionModeProps>();

const { visualProgressProps, startProgress, stopProgress, resetProgress } =
	useVisualProgress(computed(() => props.options.hoverStyle.progress ?? null));

const scanSelectionModeContext = shallowRef<SelectionModeContext>({
	id: uuidV4(),
	visualProgressProps,
});

const cursorPosition = ref<Position2D>({ x: 0, y: 0 });

let currentHoverCell: CellRef | undefined;

const onLeaveCell = (newCell?: CellRef) => {
	resetProgress();

	currentHoverCell?.interactive?.onLeave?.(scanSelectionModeContext.value);
	currentHoverCell = newCell;
};

useInputDevices(
	computed(() => props.options.devices),
	{
		press: (event: { position: Position2D | undefined }) => {
			const position = event.position ?? cursorPosition.value;

			const cell = findCellAtPosition(position, gridContext.grids.value);

			cell?.interactive?.onPress?.(
				scanSelectionModeContext.value,
				props.options.activateStyle,
			);

			stopProgress();
		},

		activate: async (event: { position: Position2D | undefined }) => {
			const position = event.position ?? cursorPosition.value;

			const newCell = findCellAtPosition(position, gridContext.grids.value);

			await newCell?.interactive?.onActivate?.(
				scanSelectionModeContext.value,
				props.options.activateStyle,
			);
		},

		release: (event: { position: Position2D | undefined }) => {
			const position = event.position ?? cursorPosition.value;

			const cell = findCellAtPosition(position, gridContext.grids.value);

			cell?.interactive?.onRelease?.(scanSelectionModeContext.value);
		},

		move: async (event: { position: Position2D | undefined }) => {
			if (!event.position) {
				return;
			}

			const position = event.position;

			cursorPosition.value.x = position.x;
			cursorPosition.value.y = position.y;

			const newCell = findCellAtPosition(position, gridContext.grids.value);

			if (!newCell) {
				onLeaveCell();
			} else if (newCell !== currentHoverCell) {
				onLeaveCell(newCell);

				const hoverStyle = props.options.autoActivation
					? props.options.hoverStyle
					: {
							...props.options.hoverStyle,
							progress: undefined,
						};

				const visualProgress = props.options.autoActivation
					? visualProgressProps
					: undefined;

				currentHoverCell?.interactive?.onEnter?.(
					scanSelectionModeContext.value,
					hoverStyle,
				);

				if (visualProgress) {
					const cell = newCell;

					const completed = await startProgress(
						props.options.autoActivationDelay,
					);

					if (completed && currentHoverCell === cell) {
						await cell.interactive?.onActivate?.(
							scanSelectionModeContext.value,
							props.options.activateStyle,
						);
					}
				}
			}
		},
	},
);

onUnmounted(() => {
	onLeaveCell();
});
</script>

<template>
	<LcVisualCursor :cursor-position="cursorPosition" />
</template>
