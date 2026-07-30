<script setup lang="ts">
import type { Component } from "vue";
import type { SelectionModeConfig } from "../../../../features/player/io/selection/types";
import LcPointerSelectionMode from "./LcPointerSelectionMode.vue";
import LcScanSelectionMode from "./LcScanSelectionMode.vue";

// TODO: [META] Discuss and decide how selection modes don't overlap...

const AVAILABLE_SELECTION_MODES: Record<
	SelectionModeConfig["type"],
	Component
> = {
	pointer: LcPointerSelectionMode,
	scan: LcScanSelectionMode,
};

const props = defineProps<{
	modes: SelectionModeConfig[];
}>();
</script>

<template>
	<component
		v-for="(mode, index) in props.modes"
		:key="`selection-mode-${index}`"
		:is="AVAILABLE_SELECTION_MODES[mode.type]"
		:id="`${mode.type}-${index}`"
		:options="mode.options"
	/>
</template>
