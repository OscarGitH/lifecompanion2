<script setup lang="ts">
import { computed } from "vue";
import type {
	ActivateStyle,
	HoverStyle,
} from "../../../features/player/io/interactiveElement/types";

const props = defineProps<{
	hoverStyle: HoverStyle | null;
	activeStyle: ActivateStyle | null;
}>();

const style = computed(() => {
	const interaction = props.activeStyle ?? props.hoverStyle;

	if (interaction) {
		const { borderSize, borderColor } = interaction;

		return {
			outline: `${borderSize}px solid ${borderColor}`,
			outlineOffset: `-${borderSize / 2}px`,
		};
	}

	return;
});
</script>

<template>
	<div :style="style" class="position-absolute visual-border" />
</template>

<style scoped>
.visual-border {
	inset: 0;
	z-index: 2;
	pointer-events: none;
	box-sizing: border-box;
	border-radius: inherit;
}
</style>
