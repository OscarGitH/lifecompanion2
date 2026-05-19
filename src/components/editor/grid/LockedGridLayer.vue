<script setup lang="ts">
import type { LcGrid } from "@lifecompanion/model";
import { mdiLock } from "@mdi/js";
import { type CSSProperties, computed, ref, watch } from "vue";
import { useActivePlayer } from "../../../composables/player/useActivePlayer";
import { useEditorI18n } from "../../../i18n/editor";
import { useInFocusStore } from "../../../stores/editor/useInFocusStore";

const { t } = useEditorI18n();
const { activePlayer, createParentResolver } = useActivePlayer();

const inFocusStore = useInFocusStore();

const { grid, index } = defineProps<{
	grid: LcGrid;
	index: number;
}>();

const overlay = ref<boolean>(false);

const { grid: focusedGrid } = createParentResolver(
	() => inFocusStore.current?.parent,
);

const isLocked = computed(() => {
	return !!(focusedGrid.value && focusedGrid.value !== grid);
});

const slot = computed(
	() =>
		activePlayer.value.layoutStack.find((ls) => ls.layout.grid === grid)?.layout
			.slot,
);

const overlayStyle = computed((): CSSProperties => {
	if (!slot.value) return {};

	const { rows, cols } = grid;
	const { col, row, colspan, rowspan } = slot.value;

	const left = (col / cols) * 100;
	const top = (row / rows) * 100;
	const right = ((col + (colspan ?? 1)) / cols) * 100;
	const bottom = ((row + (rowspan ?? 1)) / rows) * 100;

	return {
		clipPath: `polygon(
      0% 0%, 
      100% 0%, 
      100% 100%, 
      0% 100%, 
      0% 0%, 
      ${left}% ${top}%, 
      ${left}% ${bottom}%, 
      ${right}% ${bottom}%, 
      ${right}% ${top}%, 
      ${left}% ${top}%
    )`,
	} as CSSProperties;
});

const contentPosition = computed(() => {
	if (!slot.value) return "top-0 left-0";

	const { col, row, colspan, rowspan } = slot.value;
	const { rows, cols } = grid;

	const occupiesTopLeft = col === 0 && row === 0;
	if (!occupiesTopLeft) return "top-0 left-0";

	const occupiesTopRight = col + (colspan ?? 1) === cols && row === 0;
	if (!occupiesTopRight) return "top-0 right-0";

	const occupiesBottomRight =
		col + (colspan ?? 1) === cols && row + (rowspan ?? 1) === rows;
	if (!occupiesBottomRight) return "bottom-0 right-0";

	return "bottom-0 left-0";
});

watch(
	() => inFocusStore.current,
	() => (overlay.value = isLocked.value),
	{ immediate: true },
);
</script>

<template>
	<v-overlay
		v-model="overlay"
		:content-class="contentPosition"
		:style="{...overlayStyle, zIndex: index}"
		class="ma-n1 rounded"
		contained
	>
		<v-btn class="ma-2" size="x-small" icon @click="() => overlay = false">
			<v-icon :icon="mdiLock" size="x-small" />
			<v-tooltip
				:text="t('editor.grid.actions.unlock.label')"
				activator="parent"
			/>
		</v-btn>
	</v-overlay>
</template>

<style lang="css" scoped>
/*
 * biome-ignore lint/correctness/noUnknownPseudoClass: should be resolved in 2.4 
 * see https://biomejs.dev/blog/biome-v2-4/#major-improvements-to-html-ish-languages 
 */
:deep(.v-overlay__scrim) {
	pointer-events: none;
}
</style>
