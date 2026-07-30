import { type ComputedRef, computed, inject, ref, shallowRef } from "vue";
import type { VisualProgressProps } from "../../../components/player/visualEffect/LcVisualProgress.vue";
import type {
	ActivateStyle,
	HoverStyle,
	InteractiveElement,
} from "../../../features/player/io/interactiveElement/types";
import type { SelectionModeContext } from "../../../features/player/io/selection/types";
import { IS_HOVERING_CONTEXT_KEY } from "./contexts/isHoveringContextKey";

type InteractionState = {
	hover?: HoverStyle | null;
	active?: ActivateStyle | null;
};

export const useInteractiveElement = (
	id: string,
	actions?: () => Promise<void>,
) => {
	const isHoveringContext = inject(IS_HOVERING_CONTEXT_KEY, null);
	const interactionStates = ref(new Map<string, InteractionState>());

	const visualProgressProps = shallowRef<
		ComputedRef<VisualProgressProps> | undefined
	>(undefined);

	const hoverStyle = computed(() => {
		for (const interaction of [...interactionStates.value.values()].reverse()) {
			if (interaction.hover) {
				return interaction.hover;
			}
		}

		return null;
	});

	const activeStyle = computed(() => {
		for (const interaction of [...interactionStates.value.values()].reverse()) {
			if (interaction.active) {
				return interaction.active;
			}
		}

		return null;
	});

	const setHoverStyle = (context: SelectionModeContext, style: HoverStyle) => {
		const interaction = interactionStates.value.get(context.id) ?? {};

		let progress = style.progress;

		if (!progress) {
			progress = [...interactionStates.value.entries()]
				.filter(([id]) => id !== context.id)
				.reverse()
				.map(([_id, interaction]) => interaction.hover?.progress)
				.find((progress) => progress != null);
		}

		interaction.hover = {
			...style,
			progress,
		};

		interactionStates.value.set(context.id, interaction);
	};

	const setActiveStyle = (
		context: SelectionModeContext,
		style: ActivateStyle | null,
	) => {
		const interaction = interactionStates.value.get(context.id) ?? {};
		interaction.active = style;
		interactionStates.value.set(context.id, interaction);
	};

	const resetInteractionStyles = (context: SelectionModeContext) => {
		interactionStates.value.delete(context.id);
	};

	// TODO Inject/Provide VS Store
	const interactive: InteractiveElement = {
		onEnter: (context, style) => {
			const nextStyle = context.hoverStyleOverwrite
				? context.hoverStyleOverwrite(style)
				: style;

			setHoverStyle(context, nextStyle);

			if (style.overlay && isHoveringContext) {
				isHoveringContext.hovered.value.set(
					`${id}-${context.id}`,
					style.overlayColor,
				);
			}

			if (context.visualProgressProps) {
				visualProgressProps.value = context.visualProgressProps;
			}
		},
		onLeave: (context) => {
			visualProgressProps.value = undefined;

			resetInteractionStyles(context);
			isHoveringContext?.hovered.value.delete(`${id}-${context.id}`);
		},
		onPress: (context, style) => {
			const nextStyle = context.activateStyleOverwrite
				? context.activateStyleOverwrite(style)
				: style;

			setActiveStyle(context, nextStyle);
		},
		onRelease: (context) => {
			setActiveStyle(context, null);
		},
		onActivate: async (context, style) => {
			const nextStyle = context.activateStyleOverwrite
				? context.activateStyleOverwrite(style)
				: style;

			setActiveStyle(context, nextStyle);
			await actions?.();
		},
	};

	return {
		interactive,
		hoverStyle,
		activeStyle,
		visualProgressProps,
	};
};
