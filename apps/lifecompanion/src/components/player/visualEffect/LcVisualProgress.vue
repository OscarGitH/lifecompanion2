<script setup lang="ts">
import { type CSSProperties, computed } from "vue";
import type { ScanAxis } from "../io/selection/LcScanSelectionMode.vue";

export type VisualProgressOptions = {
	type: "stick" | "bar";
	size: number | undefined;
	color: string;
};

export type VisualProgressProps = {
	options: VisualProgressOptions | null;
	value: number;
};

const props = defineProps<{
	visualProgressProps: VisualProgressProps | undefined;
	scanAxis?: ScanAxis | undefined;
}>();

const axis = computed(() => {
	return props.scanAxis?.axis ?? "x";
});

const progressValue = computed(() => {
	if (!props.visualProgressProps?.value) return 0;

	if (
		(axis.value === "x" && props.scanAxis?.reverseX) ||
		(axis.value === "y" && props.scanAxis?.reverseY)
	) {
		return 1 - props.visualProgressProps.value;
	}

	return props.visualProgressProps.value;
});

const style = computed<CSSProperties>(() => {
	if (!props.visualProgressProps?.options) {
		return {};
	}

	const { type, size, color } = props.visualProgressProps.options;
	const value = progressValue.value;

	if (axis.value === "x") {
		const defaultStyleOnX = {
			top: 0,
			bottom: 0,
			backgroundColor: color,
		};

		if (type === "stick" && size) {
			return {
				...defaultStyleOnX,
				width: `${size}px`,
				left: `calc(${value * 100}% - ${size / 2}px)`,
			};
		}

		return {
			...defaultStyleOnX,
			width: `${value * 100}%`,
		};
	}

	const defaultStyleOnY = {
		left: 0,
		right: 0,
		top: 0,
		backgroundColor: color,
	};

	if (type === "stick" && size) {
		return {
			...defaultStyleOnY,
			height: `${size}px`,
			top: `calc(${value * 100}% - ${size / 2}px)`,
		};
	}

	return {
		...defaultStyleOnY,
		height: `${value * 100}%`,
	};
});
</script>

<template>
	<div
		v-if=" props.visualProgressProps?.options"
		class="progress-layer"
		:style="style"
	/>
</template>

<style scoped>
.progress-layer {
	position: absolute;
	pointer-events: none;
	z-index: 2;
}
</style>
